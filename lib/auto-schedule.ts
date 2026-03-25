import type { PoolClient } from "pg";
import { pool } from "@/lib/db";
import { sanitizeLocation } from "@/lib/input-safety";
import { DEFAULT_SESSION_LOCATION } from "@/lib/site-content";

type Queryable = Pick<PoolClient, "query">;

const AUTO_SCHEDULE_LOCK_KEY = 20260325;

type AutoScheduleStatusRow = {
  auto_enabled: boolean;
  active_template_count: number;
  created_count: number;
};

export async function ensureAutoScheduleScaffold() {
  await pool.query(
    `INSERT INTO schedule_settings (id, auto_enabled)
     VALUES (1, TRUE)
     ON CONFLICT (id) DO NOTHING`
  );
}

export async function ensureAutoScheduledSessions() {
  return runAutoScheduleGeneration({ force: false });
}

export async function generateNextWeekFromAutoSchedule() {
  return runAutoScheduleGeneration({ force: true });
}

async function runAutoScheduleGeneration({ force }: { force: boolean }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(`SELECT pg_advisory_xact_lock($1)`, [AUTO_SCHEDULE_LOCK_KEY]);
    await ensureAutoScheduleScaffoldWithClient(client);

    const generationRes = await client.query<AutoScheduleStatusRow>(
      `WITH context AS (
         SELECT
           timezone('Europe/Oslo', NOW()) AS now_local,
           date_trunc('week', timezone('Europe/Oslo', NOW())) AS current_week_start_local
       ),
       settings AS (
         SELECT auto_enabled
         FROM schedule_settings
         WHERE id = 1
       ),
       templates AS (
         SELECT
           t.id,
           t.weekday,
           t.starts_at_time,
           t.ends_at_time,
           t.location,
           t.capacity,
           context.now_local,
           context.current_week_start_local,
           context.current_week_start_local + INTERVAL '7 days' AS target_week_start_local,
           context.current_week_start_local
             + make_interval(days => t.weekday - 1)
             + t.ends_at_time
             + CASE
                 WHEN t.ends_at_time <= t.starts_at_time THEN INTERVAL '1 day'
                 ELSE INTERVAL '0 day'
               END AS current_week_end_local,
           (context.current_week_start_local
             + INTERVAL '7 days'
             + make_interval(days => t.weekday - 1)
             + t.starts_at_time) AT TIME ZONE 'Europe/Oslo' AS target_starts_at,
           (context.current_week_start_local
             + INTERVAL '7 days'
             + make_interval(days => t.weekday - 1)
             + t.ends_at_time
             + CASE
                 WHEN t.ends_at_time <= t.starts_at_time THEN INTERVAL '1 day'
                 ELSE INTERVAL '0 day'
               END) AT TIME ZONE 'Europe/Oslo' AS target_ends_at
         FROM schedule_templates t
         CROSS JOIN context
         WHERE t.is_active = TRUE
       ),
       status AS (
         SELECT
           COALESCE((SELECT auto_enabled FROM settings), TRUE) AS auto_enabled,
           COALESCE(
             MAX(current_week_end_local),
             (SELECT current_week_start_local FROM context)
           ) AS current_week_last_end_local
         FROM templates
       ),
       inserted AS (
         INSERT INTO sessions (
           starts_at,
           ends_at,
           location,
           capacity,
           auto_template_id,
           auto_week_start
         )
         SELECT
           t.target_starts_at,
           t.target_ends_at,
           t.location,
           t.capacity,
           t.id,
           t.target_week_start_local::date
         FROM templates t
         CROSS JOIN status s
         WHERE (s.auto_enabled OR $1::boolean)
           AND ($1::boolean OR t.now_local >= s.current_week_last_end_local)
           AND NOT EXISTS (
             SELECT 1
             FROM schedule_exceptions e
             WHERE e.template_id = t.id
               AND e.week_start = t.target_week_start_local::date
           )
           AND NOT EXISTS (
             SELECT 1
             FROM sessions existing
             WHERE existing.auto_template_id = t.id
               AND existing.auto_week_start = t.target_week_start_local::date
           )
           AND NOT EXISTS (
             SELECT 1
             FROM sessions existing
             WHERE existing.starts_at = t.target_starts_at
           )
         ON CONFLICT DO NOTHING
         RETURNING id
       )
       SELECT
         COALESCE((SELECT auto_enabled FROM status), TRUE) AS auto_enabled,
         (SELECT COUNT(*)::int FROM templates) AS active_template_count,
         (SELECT COUNT(*)::int FROM inserted) AS created_count`,
      [force]
    );

    await client.query("COMMIT");
    return generationRes.rows[0] ?? { auto_enabled: true, active_template_count: 0, created_count: 0 };
  } catch {
    await client.query("ROLLBACK").catch(() => {});
    throw new Error("Could not generate auto-scheduled sessions.");
  } finally {
    client.release();
  }
}

export async function rememberDeletedAutoSession(
  client: Queryable,
  session: {
    auto_template_id: number | null;
    auto_week_start: string | null;
    starts_at: string;
  }
) {
  if (session.auto_template_id && session.auto_week_start) {
    await client.query(
      `INSERT INTO schedule_exceptions (template_id, week_start)
       VALUES ($1, $2::date)
       ON CONFLICT (template_id, week_start) DO NOTHING`,
      [session.auto_template_id, session.auto_week_start]
    );

    return;
  }

  const inferredTemplateRes = await client.query<{ id: number; week_start: string }>(
    `WITH session_local AS (
       SELECT
         ($1::timestamptz AT TIME ZONE 'Europe/Oslo') AS starts_at_local
     ),
     matching_templates AS (
       SELECT
         t.id,
         date_trunc('week', session_local.starts_at_local)::date AS week_start
       FROM schedule_templates t
       CROSS JOIN session_local
       WHERE t.is_active = TRUE
         AND EXTRACT(ISODOW FROM session_local.starts_at_local)::int = t.weekday
         AND session_local.starts_at_local::time = t.starts_at_time
     )
     SELECT id, week_start::text
     FROM matching_templates
     ORDER BY id ASC
     LIMIT 1`,
    [session.starts_at]
  );

  const inferredTemplate = inferredTemplateRes.rows[0];
  if (!inferredTemplate) {
    return;
  }

  await client.query(
    `INSERT INTO schedule_exceptions (template_id, week_start)
     VALUES ($1, $2::date)
     ON CONFLICT (template_id, week_start) DO NOTHING`,
    [inferredTemplate.id, inferredTemplate.week_start]
  );
}

export function normalizeAutoScheduleLocation(location: string) {
  return sanitizeLocation(location) ?? DEFAULT_SESSION_LOCATION;
}

async function ensureAutoScheduleScaffoldWithClient(client: Queryable) {
  await client.query(
    `INSERT INTO schedule_settings (id, auto_enabled)
     VALUES (1, TRUE)
     ON CONFLICT (id) DO NOTHING`
  );
}
