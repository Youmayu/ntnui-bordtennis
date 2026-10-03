import type { PoolClient } from "pg";

type Queryable = Pick<PoolClient, "query">;

type SessionAccessSchemaRow = {
  has_session_members_only: boolean;
  has_template_members_only: boolean;
  has_session_tournament_reservations: boolean;
  has_template_tournament_reservations: boolean;
  has_session_board_attendance: boolean;
  has_board_registrations: boolean;
};

export type SessionAccessSchema = {
  hasSessionMembersOnly: boolean;
  hasTemplateMembersOnly: boolean;
  hasSessionTournamentReservations: boolean;
  hasTemplateTournamentReservations: boolean;
  hasSessionBoardAttendance: boolean;
  hasBoardRegistrations: boolean;
};

export async function getSessionAccessSchema(client: Queryable): Promise<SessionAccessSchema> {
  const res = await client.query<SessionAccessSchemaRow>(
    `SELECT
       EXISTS (
         SELECT 1
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = 'sessions'
           AND column_name = 'members_only'
       ) AS has_session_members_only,
       EXISTS (
         SELECT 1
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = 'schedule_templates'
           AND column_name = 'members_only'
       ) AS has_template_members_only,
       EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'sessions'
           AND column_name = 'reserve_tournament_spots'
       ) AS has_session_tournament_reservations,
       EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'schedule_templates'
           AND column_name = 'reserve_tournament_spots'
       ) AS has_template_tournament_reservations,
       EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'sessions'
           AND column_name = 'attending_board_member_ids'
       ) AS has_session_board_attendance,
       EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'registrations'
           AND column_name = 'board_member_id'
       ) AS has_board_registrations`
  );

  return {
    hasSessionMembersOnly: res.rows[0]?.has_session_members_only ?? false,
    hasTemplateMembersOnly: res.rows[0]?.has_template_members_only ?? false,
    hasSessionTournamentReservations: res.rows[0]?.has_session_tournament_reservations ?? false,
    hasTemplateTournamentReservations: res.rows[0]?.has_template_tournament_reservations ?? false,
    hasSessionBoardAttendance: res.rows[0]?.has_session_board_attendance ?? false,
    hasBoardRegistrations: res.rows[0]?.has_board_registrations ?? false,
  };
}

export function getMembersOnlySelectSql(hasMembersOnlyColumn: boolean, alias: string) {
  return hasMembersOnlyColumn ? `${alias}.members_only` : "TRUE";
}
