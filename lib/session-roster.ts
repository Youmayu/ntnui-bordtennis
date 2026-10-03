import { pool } from "@/lib/db";
import { normalizeSingleLineDisplay } from "@/lib/input-safety";
import { fillConfirmedSlotsFromWaitlist, REGISTRATION_STATUS, type PublicRegistration } from "@/lib/registrations";
import type { SessionAvailability } from "@/lib/tournament-reservations";

export async function getSessionRoster(sessionId: number) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const state = await fillConfirmedSlotsFromWaitlist(client, sessionId);
    if (!state.sessionExists || !state.sessionOpen) {
      await client.query("COMMIT");
      return { registrations: [] as PublicRegistration[], availability: null };
    }
    const res = await client.query<PublicRegistration>(
      `SELECT r.id, r.name, r.status, r.tournament_player_id IS NOT NULL AS is_tournament,
         ${state.hasBoardRegistrations ? "r.board_member_id IS NOT NULL" : "FALSE"} AS is_board
       FROM registrations r
       WHERE r.session_id = $1
       ORDER BY CASE WHEN r.status = $2 THEN 0 ELSE 1 END,
         r.created_at ASC, r.id ASC`,
      [sessionId, REGISTRATION_STATUS.CONFIRMED]
    );
    await client.query("COMMIT");
    return {
      registrations: res.rows.map((row) => ({
        id: row.id,
        name: normalizeSingleLineDisplay(row.name),
        status: row.status,
        is_tournament: row.is_tournament,
        is_board: row.is_board ?? false,
      })),
      availability: {
        reserve_tournament_spots: state.reserveTournamentSpots,
        reserved_count: state.reservedCount,
        available_spots: state.availableSpots,
        tournament_release_at: state.tournamentReleaseAt,
      } satisfies SessionAvailability,
    };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
