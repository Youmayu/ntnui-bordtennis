import type { PoolClient } from "pg";
import { BOARD_MEMBERS, normalizeBoardMemberIds } from "@/lib/board-members";

// Call while holding the session row lock, before counting or promoting players.
export async function syncBoardRegistrations(
  client: Pick<PoolClient, "query">,
  sessionId: number,
  attendingIds: unknown
) {
  const selectedIds = normalizeBoardMemberIds(attendingIds);
  await client.query(
    `DELETE FROM registrations WHERE session_id = $1
       AND board_member_id IS NOT NULL AND NOT (board_member_id = ANY($2::text[]))`,
    [sessionId, selectedIds]
  );

  for (const member of BOARD_MEMBERS.filter((entry) => selectedIds.includes(entry.id))) {
    // Reuse a previous signup, preferring an already-confirmed booking.
    const existing = await client.query<{ id: number }>(
      `SELECT id FROM registrations
       WHERE session_id = $1 AND (board_member_id = $2 OR
         (board_member_id IS NULL AND lower(regexp_replace(trim(name), '[[:space:]]+', ' ', 'g')) = lower($3)))
       ORDER BY board_member_id NULLS LAST,
         CASE WHEN status = 'confirmed' THEN 0 ELSE 1 END, created_at, id
       LIMIT 1 FOR UPDATE`,
      [sessionId, member.id, member.name]
    );
    if (existing.rows[0]) {
      await client.query(
        `UPDATE registrations SET board_member_id = $2, name = $3, status = 'confirmed'
         WHERE id = $1 AND (board_member_id IS DISTINCT FROM $2 OR name IS DISTINCT FROM $3 OR status <> 'confirmed')`,
        [existing.rows[0].id, member.id, member.name]
      );
    } else {
      await client.query(
        `INSERT INTO registrations (session_id, name, board_member_id, status)
         VALUES ($1, $2, $3, 'confirmed')`,
        [sessionId, member.name, member.id]
      );
    }
  }
}
