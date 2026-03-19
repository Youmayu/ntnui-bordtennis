import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = Number(searchParams.get("sessionId"));

  if (!Number.isFinite(sessionId)) {
    return NextResponse.json({ error: "Ugyldig økt." }, { status: 400 });
  }

  const res = await pool.query(
    `SELECT r.id, r.name, r.level, r.created_at
     FROM registrations r
     INNER JOIN sessions s ON s.id = r.session_id
     WHERE r.session_id = $1
       AND s.ends_at > NOW()
     ORDER BY r.created_at ASC`,
    [sessionId]
  );

  return NextResponse.json({ registrations: res.rows }, { status: 200 });
}
