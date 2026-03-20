import type { PoolClient } from "pg";
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { isValidBirthMonthDay } from "@/lib/birth-month-day";
import {
  fillConfirmedSlotsFromWaitlist,
  getConfirmedRegistrationCount,
  REGISTRATION_STATUS,
} from "@/lib/registrations";

export async function POST(req: Request) {
  let client: PoolClient | null = null;

  try {
    const body = await req.json();
    const { sessionId, name, level, birthMonth, birthDay, turnstileToken, website } = body ?? {};

    if (!sessionId || typeof sessionId !== "number") {
      return NextResponse.json({ error: "Ugyldig økt." }, { status: 400 });
    }
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Ugyldig navn." }, { status: 400 });
    }
    if (!level || typeof level !== "string") {
      return NextResponse.json({ error: "Ugyldig nivå." }, { status: 400 });
    }
    if (!isValidBirthMonthDay(Number(birthMonth), Number(birthDay))) {
      return NextResponse.json({ error: "Ugyldig måned eller dag." }, { status: 400 });
    }

    if (website && String(website).trim() !== "") {
      return NextResponse.json({ error: "Avvist." }, { status: 400 });
    }

    if (!turnstileToken || typeof turnstileToken !== "string") {
      return NextResponse.json({ error: "CAPTCHA mangler." }, { status: 400 });
    }

    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { error: "Server misconfig (TURNSTILE_SECRET_KEY)." },
        { status: 500 }
      );
    }

    const formData = new FormData();
    formData.append("secret", secret);
    formData.append("response", turnstileToken);

    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });
    const verify = (await verifyRes.json()) as { success?: boolean };

    if (!verify.success) {
      return NextResponse.json({ error: "CAPTCHA feilet. Prøv igjen." }, { status: 400 });
    }

    client = await pool.connect();
    await client.query("BEGIN");

    const fillResult = await fillConfirmedSlotsFromWaitlist(client, sessionId);

    if (!fillResult.sessionExists || !fillResult.sessionOpen) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Økten finnes ikke." }, { status: 404 });
    }

    const confirmedCount = await getConfirmedRegistrationCount(client, sessionId);
    const registrationStatus =
      confirmedCount < fillResult.capacity
        ? REGISTRATION_STATUS.CONFIRMED
        : REGISTRATION_STATUS.WAITLIST;

    await client.query(
      `INSERT INTO registrations (session_id, name, level, birth_month, birth_day, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        sessionId,
        name.trim(),
        level.trim(),
        Number(birthMonth),
        Number(birthDay),
        registrationStatus,
      ]
    );

    await client.query("COMMIT");

    return NextResponse.json({ ok: true, registrationStatus }, { status: 200 });
  } catch {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }

    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  } finally {
    client?.release();
  }
}
