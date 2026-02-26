import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, name, level, turnstileToken, website } = body ?? {};

    if (!sessionId || typeof sessionId !== "number") {
      return NextResponse.json({ error: "Ugyldig økt." }, { status: 400 });
    }
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Ugyldig navn." }, { status: 400 });
    }
    if (!level || typeof level !== "string") {
      return NextResponse.json({ error: "Ugyldig nivå." }, { status: 400 });
    }

    // Honeypot
    if (website && String(website).trim() !== "") {
      return NextResponse.json({ error: "Avvist." }, { status: 400 });
    }

    if (!turnstileToken || typeof turnstileToken !== "string") {
      return NextResponse.json({ error: "CAPTCHA mangler." }, { status: 400 });
    }

    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: "Server misconfig (TURNSTILE_SECRET_KEY)." }, { status: 500 });
    }

    // Required server-side verification :contentReference[oaicite:3]{index=3}
    const formData = new FormData();
    formData.append("secret", secret);
    formData.append("response", turnstileToken);

    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });
    const verify = await verifyRes.json();

    if (!verify.success) {
      return NextResponse.json({ error: "CAPTCHA feilet. Prøv igjen." }, { status: 400 });
    }

    // Capacity check (optional but useful)
    const capRes = await pool.query(
      `SELECT capacity,
              (SELECT COUNT(*)::int FROM registrations WHERE session_id = $1) AS count
       FROM sessions
       WHERE id = $1`,
      [sessionId]
    );

    if (capRes.rowCount === 0) {
      return NextResponse.json({ error: "Økten finnes ikke." }, { status: 404 });
    }

    const { capacity, count } = capRes.rows[0];
    if (count >= capacity) {
      return NextResponse.json({ error: "Økten er full." }, { status: 409 });
    }

    await pool.query(
      `INSERT INTO registrations (session_id, name, level)
       VALUES ($1, $2, $3)`,
      [sessionId, name.trim(), level.trim()]
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }
}