import type { PoolClient } from "pg";
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { isValidBirthMonthDay } from "@/lib/birth-month-day";
import {
  fillConfirmedSlotsFromWaitlist,
  REGISTRATION_STATUS,
  type RegistrationStatus,
} from "@/lib/registrations";

async function verifyTurnstile(token: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { ok: false as const, error: "TURNSTILE_SECRET_KEY mangler på server." };
  }

  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);

  const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });

  const data = (await resp.json()) as { success?: boolean };
  if (!data?.success) {
    return { ok: false as const, error: "CAPTCHA feilet. Prøv igjen." };
  }

  return { ok: true as const };
}

export async function POST(req: Request) {
  let client: PoolClient | null = null;

  try {
    const body = await req.json();

    const registrationId = Number(body?.registrationId);
    const birthMonth = Number(body?.birthMonth);
    const birthDay = Number(body?.birthDay);
    const turnstileToken = String(body?.turnstileToken ?? "");
    const website = String(body?.website ?? "");

    if (website) return NextResponse.json({ ok: true });

    if (!Number.isFinite(registrationId)) {
      return NextResponse.json({ error: "Ugyldig påmelding." }, { status: 400 });
    }
    if (!isValidBirthMonthDay(birthMonth, birthDay)) {
      return NextResponse.json({ error: "Ugyldig måned eller dag." }, { status: 400 });
    }
    if (!turnstileToken) {
      return NextResponse.json({ error: "Fullfør CAPTCHA." }, { status: 400 });
    }

    const captcha = await verifyTurnstile(turnstileToken);
    if (!captcha.ok) {
      return NextResponse.json({ error: captcha.error }, { status: 400 });
    }

    client = await pool.connect();
    await client.query("BEGIN");

    const res = await client.query(
      `SELECT r.id, r.session_id, r.status, r.birth_month, r.birth_day
       FROM registrations r
       INNER JOIN sessions s ON s.id = r.session_id
       WHERE r.id = $1
         AND s.ends_at > NOW()
       FOR UPDATE OF r, s`,
      [registrationId]
    );

    if (res.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Påmeldingen finnes ikke." }, { status: 404 });
    }

    const registration = res.rows[0] as {
      id: number;
      session_id: number;
      status: RegistrationStatus;
      birth_month: number | null;
      birth_day: number | null;
    };

    if (!registration.birth_month || !registration.birth_day) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          error:
            "Denne påmeldingen ble laget før automatisk avmelding ble tatt i bruk. Kontakt admin.",
        },
        { status: 409 }
      );
    }

    if (registration.birth_month !== birthMonth || registration.birth_day !== birthDay) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Måned og dag stemmer ikke." }, { status: 403 });
    }

    await client.query(`DELETE FROM registrations WHERE id = $1`, [registrationId]);

    if (registration.status === REGISTRATION_STATUS.CONFIRMED) {
      await fillConfirmedSlotsFromWaitlist(client, registration.session_id);
    }

    await client.query("COMMIT");

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }

    return NextResponse.json({ error: "Noe gikk galt." }, { status: 500 });
  } finally {
    client?.release();
  }
}
