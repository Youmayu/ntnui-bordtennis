import { ensureAutoScheduledSessions } from "@/lib/auto-schedule";
import { pool } from "@/lib/db";
import { sanitizeLocation } from "@/lib/input-safety";
import { refreshSessionWaitlists, REGISTRATION_STATUS } from "@/lib/registrations";
import { getMembersOnlySelectSql, getSessionAccessSchema } from "@/lib/session-access";
import { DEFAULT_SESSION_LOCATION } from "@/lib/site-content";
import { getReservedSpotCount, tournamentReleaseSql, type SessionAvailability } from "@/lib/tournament-reservations";

export type UpcomingSession = SessionAvailability & {
  id: number;
  starts_at: string;
  ends_at: string;
  location: string;
  capacity: number;
  members_only: boolean;
  confirmed_count: number;
  waitlist_count: number;
  current_time: string;
};

export async function getUpcomingSessions(): Promise<UpcomingSession[]> {
  await ensureAutoScheduledSessions().catch(() => {});
  await refreshSessionWaitlists(pool);
  const accessSchema = await getSessionAccessSchema(pool);
  const res = await pool.query(
    `SELECT s.id, s.starts_at, s.ends_at, s.location, s.capacity,
       ${getMembersOnlySelectSql(accessSchema.hasSessionMembersOnly, "s")} AS members_only,
       NOW() AS current_time,
       ${tournamentReleaseSql("s.starts_at")} AS tournament_release_at,
       NOW() < ${tournamentReleaseSql("s.starts_at")} AS reservations_active,
       COUNT(r.id) FILTER (WHERE r.status = $1)::int AS confirmed_count,
       COUNT(r.id) FILTER (WHERE r.status = $2)::int AS waitlist_count,
       COUNT(r.id) FILTER (WHERE r.status = $1 AND r.tournament_player_id IS NOT NULL)::int AS tournament_count
     FROM sessions s
     LEFT JOIN registrations r ON r.session_id = s.id
     WHERE s.ends_at > NOW()
     GROUP BY s.id
     ORDER BY s.starts_at ASC, s.id ASC LIMIT 12`,
    [REGISTRATION_STATUS.CONFIRMED, REGISTRATION_STATUS.WAITLIST]
  );
  return res.rows.map(({ reservations_active, tournament_count, ...session }) => {
    const reservedCount = getReservedSpotCount(session.capacity, session.confirmed_count, tournament_count, reservations_active);
    return {
      ...session,
      location: sanitizeLocation(session.location) ?? DEFAULT_SESSION_LOCATION,
      reserved_count: reservedCount,
      available_spots: Math.max(0, session.capacity - session.confirmed_count - reservedCount),
    };
  });
}
