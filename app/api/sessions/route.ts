import { NextResponse } from "next/server";
import { ensureAutoScheduledSessions } from "@/lib/auto-schedule";
import { pool } from "@/lib/db";
import { sanitizeLocation } from "@/lib/input-safety";
import { REGISTRATION_STATUS } from "@/lib/registrations";
import { getMembersOnlySelectSql, getSessionAccessSchema } from "@/lib/session-access";
import { DEFAULT_SESSION_LOCATION } from "@/lib/site-content";

export async function GET() {
  await ensureAutoScheduledSessions().catch(() => {});
  const accessSchema = await getSessionAccessSchema(pool);

  const res = await pool.query(
    `SELECT
       s.id,
       s.starts_at,
       s.ends_at,
       s.location,
       s.capacity,
       ${getMembersOnlySelectSql(accessSchema.hasSessionMembersOnly, "s")} AS members_only,
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

  const sessions = (
    res.rows as Array<{
      id: number;
      starts_at: string;
      ends_at: string;
      location: string;
      capacity: number;
      members_only: boolean;
      confirmed_count: number;
      waitlist_count: number;
    }>
  ).map((session) => ({
    ...session,
    location: sanitizeLocation(session.location) ?? DEFAULT_SESSION_LOCATION,
  }));

  return NextResponse.json({ sessions }, { status: 200 });
}
