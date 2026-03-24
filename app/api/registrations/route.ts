import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { normalizeSingleLineDisplay } from "@/lib/input-safety";
import { REGISTRATION_STATUS } from "@/lib/registrations";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = Number(searchParams.get("sessionId"));

  if (!Number.isFinite(sessionId)) {
    return NextResponse.json({ error: "Ugyldig økt." }, { status: 400 });
  }

  const res = await pool.query(
    `SELECT r.id, r.name
     FROM registrations r
     INNER JOIN sessions s ON s.id = r.session_id
     WHERE r.session_id = $1
       AND s.ends_at > NOW()
     ORDER BY
       CASE WHEN r.status = $2 THEN 0 ELSE 1 END,
       r.created_at ASC,
       r.id ASC`,
    [sessionId, REGISTRATION_STATUS.CONFIRMED]
  );

  const registrations = (res.rows as { id: number; name: string }[]).map((registration) => ({
    ...registration,
    name: normalizeSingleLineDisplay(registration.name),
  }));

  return NextResponse.json({ registrations }, { status: 200 });
}
