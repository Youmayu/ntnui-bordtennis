import type { PoolClient } from "pg";
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { isValidBirthMonthDay } from "@/lib/birth-month-day";
import { sanitizeLevel, sanitizeRegistrationName } from "@/lib/input-safety";
import {
  fillConfirmedSlotsFromWaitlist,
  REGISTRATION_STATUS,
} from "@/lib/registrations";
import { getSessionAccessSchema } from "@/lib/session-access";

export async function POST(req: Request) {
  let client: PoolClient | null = null;

  try {
    const body = await req.json();
    const {
      sessionId,
      firstName,
      lastName,
      level,
      birthMonth,
      birthDay,
      memberConfirmed,
      turnstileToken,
      website,
    } = body ?? {};
    const safeName = sanitizeRegistrationName(firstName, lastName);
    const safeLevel = typeof level === "string" ? sanitizeLevel(level) : null;

    if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
      return NextResponse.json({ error: "Ugyldig økt." }, { status: 400 });
    }
    if (!safeName) {
      return NextResponse.json({ error: "Oppgi både fornavn og etternavn (maks 80 tegn til sammen)." }, { status: 400 });
    }
    if (!safeLevel) {
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

    const duplicate = await client.query(
      `SELECT id FROM registrations WHERE session_id = $1
       AND tournament_player_id IS NOT NULL AND lower(name) = lower($2)`,
      [sessionId, safeName]
    );
    if (duplicate.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Du er allerede påmeldt denne økten." }, { status: 409 });
    }
    const accessSchema = await getSessionAccessSchema(client);
    let membersOnly = true;

    if (accessSchema.hasSessionMembersOnly) {
      const sessionAccessRes = await client.query<{ members_only: boolean }>(
        `SELECT members_only
         FROM sessions
         WHERE id = $1`,
        [sessionId]
      );

      membersOnly = sessionAccessRes.rows[0]?.members_only ?? true;
    }

    if (membersOnly && memberConfirmed !== true) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Bekreft at du er medlem for denne økten." },
        { status: 400 }
      );
    }

    const registrationStatus =
      fillResult.availableSpots > 0
        ? REGISTRATION_STATUS.CONFIRMED
        : REGISTRATION_STATUS.WAITLIST;

    await client.query(
      `INSERT INTO registrations (session_id, name, level, birth_month, birth_day, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        sessionId,
        safeName,
        safeLevel,
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
