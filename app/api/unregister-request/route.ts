import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

async function verifyTurnstile(token: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: false, error: "TURNSTILE_SECRET_KEY mangler på server." };

  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);

  const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });

  const data = (await resp.json()) as { success?: boolean };
  if (!data?.success) return { ok: false, error: "CAPTCHA feilet. Prøv igjen." };
  return { ok: true as const };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const sessionId = Number(body?.sessionId);
    const name = String(body?.name ?? "").trim();
    const message = String(body?.message ?? "").trim();
    const turnstileToken = String(body?.turnstileToken ?? "");
    const website = String(body?.website ?? ""); // honeypot

    if (website) return NextResponse.json({ ok: true }); // silently ignore bots
    if (!Number.isFinite(sessionId)) {
      return NextResponse.json({ error: "Ugyldig økt." }, { status: 400 });
    }
    if (name.length < 2) {
      return NextResponse.json({ error: "Navn må være minst 2 tegn." }, { status: 400 });
    }
    if (message.length < 5) {
      return NextResponse.json({ error: "Melding må være minst 5 tegn." }, { status: 400 });
    }
    if (!turnstileToken) {
      return NextResponse.json({ error: "Fullfør CAPTCHA." }, { status: 400 });
    }

    const captcha = await verifyTurnstile(turnstileToken);
    if (!captcha.ok) {
      return NextResponse.json({ error: captcha.error }, { status: 400 });
    }

    // ensure session exists
    const s = await pool.query(`SELECT id FROM sessions WHERE id = $1`, [sessionId]);
    if (s.rowCount === 0) {
      return NextResponse.json({ error: "Økten finnes ikke." }, { status: 404 });
    }

    await pool.query(
      `INSERT INTO unregister_requests (session_id, name, message)
       VALUES ($1, $2, $3)`,
      [sessionId, name, message]
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Noe gikk galt." }, { status: 500 });
  }
}