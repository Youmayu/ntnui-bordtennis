import type { PoolClient } from "pg";
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { fillConfirmedSlotsFromWaitlist, REGISTRATION_STATUS, type RegistrationStatus } from "@/lib/registrations";
import { TOURNAMENT_PLAYERS } from "@/lib/tournament-team";

export async function POST(req: Request) {
  let client: PoolClient | null = null;
  try {
    const { sessionId, playerId, turnstileToken } = await req.json();
    const player = TOURNAMENT_PLAYERS.find((entry) => entry.id === playerId);
    if (!Number.isSafeInteger(sessionId) || sessionId <= 0 || !player) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    if (typeof turnstileToken !== "string" || !turnstileToken.trim()) {
      return NextResponse.json({ error: "captcha" }, { status: 400 });
    }
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) return NextResponse.json({ error: "unavailable" }, { status: 503 });
    const form = new FormData();
    form.append("secret", secret);
    form.append("response", turnstileToken);
    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", body: form,
    });
    const result = await verification.json();
    if (!verification.ok || result.success !== true) {
      return NextResponse.json({ error: "captcha" }, { status: 400 });
    }

    client = await pool.connect();
    await client.query("BEGIN");
    const state = await fillConfirmedSlotsFromWaitlist(client, sessionId);
    if (!state.sessionExists || !state.sessionOpen) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "closed" }, { status: 404 });
    }

    // Reuse an earlier public signup as well as making repeated team signups
    // idempotent. The session lock and unique index prevent double bookings.
    const existing = await client.query<{ id: number; status: RegistrationStatus }>(
      `SELECT id, status FROM registrations
       WHERE session_id = $1 AND (tournament_player_id = $2 OR
         (tournament_player_id IS NULL AND lower(trim(name)) = lower($3)))
       ORDER BY tournament_player_id NULLS LAST, created_at ASC, id ASC
       LIMIT 1 FOR UPDATE`, [sessionId, player.id, player.name]
    );
    let registrationStatus: RegistrationStatus;
    if (existing.rows[0]) {
      await client.query(
        `UPDATE registrations SET tournament_player_id = $2, name = $3 WHERE id = $1`,
        [existing.rows[0].id, player.id, player.name]
      );
      await fillConfirmedSlotsFromWaitlist(client, sessionId);
      const updated = await client.query<{ status: RegistrationStatus }>(
        `SELECT status FROM registrations WHERE id = $1`, [existing.rows[0].id]
      );
      registrationStatus = updated.rows[0].status;
    } else {
      registrationStatus = state.availableSpots + state.reservedCount > 0
        ? REGISTRATION_STATUS.CONFIRMED : REGISTRATION_STATUS.WAITLIST;
      await client.query(
        `INSERT INTO registrations (session_id, name, tournament_player_id, status)
         VALUES ($1, $2, $3, $4)`, [sessionId, player.name, player.id, registrationStatus]
      );
    }
    await client.query("COMMIT");
    return NextResponse.json({ ok: true, registrationStatus, alreadyRegistered: Boolean(existing.rows[0]) });
  } catch {
    if (client) await client.query("ROLLBACK").catch(() => {});
    return NextResponse.json({ error: "unavailable" }, { status: 500 });
  } finally {
    client?.release();
  }
}
