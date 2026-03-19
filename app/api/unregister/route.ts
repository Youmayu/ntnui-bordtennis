import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { isValidBirthMonthDay } from "@/lib/birth-month-day";

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

    const res = await pool.query(
      `SELECT r.id, r.birth_month, r.birth_day
       FROM registrations r
       INNER JOIN sessions s ON s.id = r.session_id
       WHERE r.id = $1
         AND s.ends_at > NOW()`,
      [registrationId]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "Påmeldingen finnes ikke." }, { status: 404 });
    }

    const registration = res.rows[0] as {
      id: number;
      birth_month: number | null;
      birth_day: number | null;
    };

    if (!registration.birth_month || !registration.birth_day) {
      return NextResponse.json(
        { error: "Denne påmeldingen ble laget før automatisk avmelding ble tatt i bruk. Kontakt admin." },
        { status: 409 }
      );
    }

    if (registration.birth_month !== birthMonth || registration.birth_day !== birthDay) {
      return NextResponse.json({ error: "Måned og dag stemmer ikke." }, { status: 403 });
    }

    await pool.query(`DELETE FROM registrations WHERE id = $1`, [registrationId]);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Noe gikk galt." }, { status: 500 });
  }
}
