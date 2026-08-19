import type { PoolClient } from "pg";

type Queryable = Pick<PoolClient, "query">;

type BoardAttendanceSchemaRow = {
  has_attending_board_member_ids: boolean;
};

export async function hasBoardAttendanceColumn(client: Queryable) {
  const result = await client.query<BoardAttendanceSchemaRow>(
    `SELECT EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'sessions'
         AND column_name = 'attending_board_member_ids'
     ) AS has_attending_board_member_ids`
  );

  return result.rows[0]?.has_attending_board_member_ids ?? false;
}

export function getBoardAttendanceSelectSql(hasColumn: boolean, alias: string) {
  return hasColumn ? `${alias}.attending_board_member_ids` : "ARRAY[]::text[]";
}
