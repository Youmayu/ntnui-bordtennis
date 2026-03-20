import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { REGISTRATION_STATUS } from "@/lib/registrations";

export async function GET() {
  const res = await pool.query(
    `SELECT
       s.id,
       s.starts_at,
       s.ends_at,
       s.location,
       s.capacity,
       COALESCE(confirmed.confirmed_count, 0) AS confirmed_count,
       COALESCE(waitlist.waitlist_count, 0) AS waitlist_count
     FROM sessions s
     LEFT JOIN (
       SELECT session_id, COUNT(*)::int AS confirmed_count
       FROM registrations
       WHERE status = $1
       GROUP BY session_id
     ) confirmed
       ON confirmed.session_id = s.id
     LEFT JOIN (
       SELECT session_id, COUNT(*)::int AS waitlist_count
       FROM registrations
       WHERE status = $2
       GROUP BY session_id
     ) waitlist
       ON waitlist.session_id = s.id
     WHERE s.ends_at > NOW()
     ORDER BY s.starts_at ASC
     LIMIT 12`,
    [REGISTRATION_STATUS.CONFIRMED, REGISTRATION_STATUS.WAITLIST]
  );

  return NextResponse.json({ sessions: res.rows }, { status: 200 });
}
