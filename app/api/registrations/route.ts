import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { normalizeSingleLineDisplay } from "@/lib/input-safety";
import { REGISTRATION_STATUS, type PublicRegistration } from "@/lib/registrations";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = Number(searchParams.get("sessionId"));

  if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
    return NextResponse.json({ error: "Ugyldig økt." }, { status: 400 });
  }

  const res = await pool.query(
    `SELECT r.id, r.name, r.status
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

  const registrations = (res.rows as PublicRegistration[]).map((registration) => ({
    id: registration.id,
    name: normalizeSingleLineDisplay(registration.name),
    status: registration.status,
  }));

  return NextResponse.json({ registrations }, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
