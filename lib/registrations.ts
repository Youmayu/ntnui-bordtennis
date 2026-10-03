import type { Pool, PoolClient } from "pg";
import { getReservedSpotCount, getTournamentReservationsSelectSql, tournamentReleaseSql } from "@/lib/tournament-reservations";
import { getSessionAccessSchema } from "@/lib/session-access";
import { getBoardAttendanceSelectSql } from "@/lib/board-attendance";
import { syncBoardRegistrations } from "@/lib/board-registrations";

export const REGISTRATION_STATUS = {
  CONFIRMED: "confirmed",
  WAITLIST: "waitlist",
} as const;

export type RegistrationStatus =
  (typeof REGISTRATION_STATUS)[keyof typeof REGISTRATION_STATUS];

export type PublicRegistration = {
  id: number;
  name: string;
  status: RegistrationStatus;
  is_tournament: boolean;
  is_board: boolean;
};

type Queryable = Pick<PoolClient, "query">;

type SessionStateRow = {
  attending_board_member_ids: string[];
  reserve_tournament_spots: boolean;
  capacity: number;
  session_open: boolean;
  tournament_release_at: Date;
  reservations_active: boolean;
};

type CountRow = {
  count: number;
  tournament_count: number;
};

type RegistrationRow = {
  id: number;
};

export async function fillConfirmedSlotsFromWaitlist(
  client: Queryable,
  sessionId: number
) {
  const accessSchema = await getSessionAccessSchema(client);
  const sessionRes = await client.query<SessionStateRow>(
    `WITH locked_session AS MATERIALIZED (
       SELECT capacity, starts_at, ends_at,
         ${getTournamentReservationsSelectSql(accessSchema.hasSessionTournamentReservations, "sessions")} AS reserve_tournament_spots,
         ${getBoardAttendanceSelectSql(accessSchema.hasSessionBoardAttendance, "sessions")} AS attending_board_member_ids
       FROM sessions WHERE id = $1 FOR UPDATE
     )
     SELECT capacity, reserve_tournament_spots, attending_board_member_ids, ends_at > clock_timestamp() AS session_open,
       ${tournamentReleaseSql()} AS tournament_release_at,
       reserve_tournament_spots AND clock_timestamp() < ${tournamentReleaseSql()} AS reservations_active
     FROM locked_session`,
    [sessionId]
  );

  if (sessionRes.rowCount === 0) {
    return { sessionExists: false as const, sessionOpen: false as const, promotedCount: 0, capacity: 0 };
  }

  const { capacity, session_open: sessionOpen, reservations_active: reservationsActive,
    reserve_tournament_spots: reserveTournamentSpots,
    tournament_release_at: releaseAt } = sessionRes.rows[0];

  if (!sessionOpen) {
    return { sessionExists: true as const, sessionOpen: false as const, promotedCount: 0, capacity };
  }

  if (accessSchema.hasBoardRegistrations && accessSchema.hasSessionBoardAttendance) {
    await syncBoardRegistrations(client, sessionId, sessionRes.rows[0].attending_board_member_ids);
  }

  let promotedCount = 0;
  let availableSpots = 0;
  let reservedCount = 0;

  while (true) {
    const counts = await getConfirmedRegistrationCounts(client, sessionId);
    const confirmedCount = counts.count;
    reservedCount = getReservedSpotCount(capacity, confirmedCount, counts.tournament_count, reservationsActive);
    availableSpots = Math.max(0, capacity - confirmedCount - reservedCount);

    if (confirmedCount >= capacity) {
      break;
    }

    const waitlistRes = await client.query<RegistrationRow>(
      `SELECT id
       FROM registrations
       WHERE session_id = $1
         AND status = $2
         AND ($3::boolean OR tournament_player_id IS NOT NULL)
       ORDER BY created_at ASC, id ASC
       LIMIT 1
       FOR UPDATE`,
      [sessionId, REGISTRATION_STATUS.WAITLIST, availableSpots > 0]
    );

    if (waitlistRes.rowCount === 0) {
      break;
    }

    await client.query(
      `UPDATE registrations
       SET status = $2
       WHERE id = $1`,
      [waitlistRes.rows[0].id, REGISTRATION_STATUS.CONFIRMED]
    );

    promotedCount += 1;
  }

  return { sessionExists: true as const, sessionOpen: true as const, promotedCount, capacity,
    availableSpots, reservedCount, reserveTournamentSpots,
    hasBoardRegistrations: accessSchema.hasBoardRegistrations,
    tournamentReleaseAt: releaseAt.toISOString() };
}

export async function getConfirmedRegistrationCounts(
  client: Queryable,
  sessionId: number
) {
  const confirmedRes = await client.query<CountRow>(
    `SELECT COUNT(*)::int AS count,
       COUNT(*) FILTER (WHERE tournament_player_id IS NOT NULL)::int AS tournament_count
     FROM registrations
     WHERE session_id = $1
       AND status = $2`,
    [sessionId, REGISTRATION_STATUS.CONFIRMED]
  );

  return confirmedRes.rows[0] ?? { count: 0, tournament_count: 0 };
}

// Reconcile on reads as well as writes: released spots are available without a
// scheduled job, and existing waitlisted players always precede new signups.
export async function refreshSessionWaitlists(pool: Pick<Pool, "connect">) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const accessSchema = await getSessionAccessSchema(client);
    const sessions = await client.query<{ id: number }>(
      `SELECT s.id FROM sessions s
       WHERE s.ends_at > NOW() AND (EXISTS (
         SELECT 1 FROM registrations r WHERE r.session_id = s.id AND r.status = $1
       ) OR cardinality(${getBoardAttendanceSelectSql(accessSchema.hasSessionBoardAttendance, "s")}) > 0)
       ORDER BY s.id`, [REGISTRATION_STATUS.WAITLIST]
    );
    for (const session of sessions.rows) await fillConfirmedSlotsFromWaitlist(client, session.id);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
