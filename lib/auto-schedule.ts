import type { PoolClient } from "pg";
import { pool } from "@/lib/db";
import { sanitizeLocation } from "@/lib/input-safety";
import { getMembersOnlySelectSql, getSessionAccessSchema } from "@/lib/session-access";
import { DEFAULT_SESSION_LOCATION } from "@/lib/site-content";

type Queryable = Pick<PoolClient, "query">;

const AUTO_SCHEDULE_LOCK_KEY = 20260326;

type GenerationStatusRow = {
  auto_enabled: boolean;
  active_template_count: number;
  target_week_start_local: string;
  should_generate_now: boolean;
};

type ActiveTemplateRow = {
  id: number;
  weekday: number;
  starts_at_time: string;
  ends_at_time: string;
  location: string;
  capacity: number;
  members_only: boolean;
};

type InsertedRow = {
  id: number;
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
       SELECT ($1::timestamptz AT TIME ZONE 'Europe/Oslo') AS starts_at_local
     )
     SELECT
       t.id,
       date_trunc('week', session_local.starts_at_local)::date::text AS week_start
     FROM schedule_templates t
     CROSS JOIN session_local
     WHERE t.is_active = TRUE
       AND EXTRACT(ISODOW FROM session_local.starts_at_local)::int = t.weekday
       AND session_local.starts_at_local::time = t.starts_at_time
     ORDER BY t.id ASC
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

async function runAutoScheduleGeneration({ force }: { force: boolean }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(`SELECT pg_advisory_xact_lock($1)`, [AUTO_SCHEDULE_LOCK_KEY]);
    await ensureAutoScheduleScaffoldWithClient(client);
    const accessSchema = await getSessionAccessSchema(client);

    const statusRes = await client.query<GenerationStatusRow>(
      `WITH context AS (
         SELECT
           timezone('Europe/Oslo', NOW()) AS now_local,
           date_trunc('week', timezone('Europe/Oslo', NOW())) AS current_week_start_local
       ),
       active_templates AS (
         SELECT weekday, starts_at_time, ends_at_time
         FROM schedule_templates
         WHERE is_active = TRUE
       )
       SELECT
         COALESCE(
           (SELECT auto_enabled FROM schedule_settings WHERE id = 1),
           TRUE
         ) AS auto_enabled,
         COUNT(active_templates.weekday)::int AS active_template_count,
         (context.current_week_start_local + INTERVAL '7 days')::date::text AS target_week_start_local,
         (
           context.now_local >= COALESCE(
             MAX(
               context.current_week_start_local
               + make_interval(days => active_templates.weekday - 1)
               + active_templates.ends_at_time
               + CASE
                   WHEN active_templates.ends_at_time <= active_templates.starts_at_time THEN INTERVAL '1 day'
                   ELSE INTERVAL '0 day'
                 END
             ),
             context.current_week_start_local
           )
         ) AS should_generate_now
       FROM context
       LEFT JOIN active_templates ON TRUE
       GROUP BY context.now_local, context.current_week_start_local`
    );

    const status =
      statusRes.rows[0] ??
      ({
        auto_enabled: true,
        active_template_count: 0,
        target_week_start_local: "",
        should_generate_now: false,
      } satisfies GenerationStatusRow);

    if (status.active_template_count === 0) {
      await client.query("COMMIT");
      return { ...status, created_count: 0 };
    }

    if (!force && (!status.auto_enabled || !status.should_generate_now)) {
      await client.query("COMMIT");
      return { ...status, created_count: 0 };
    }

    const templatesRes = await client.query<ActiveTemplateRow>(
      `SELECT
         id,
         weekday,
         starts_at_time::text,
         ends_at_time::text,
         location,
         capacity,
         ${getMembersOnlySelectSql(accessSchema.hasTemplateMembersOnly, "schedule_templates")} AS members_only
       FROM schedule_templates
       WHERE is_active = TRUE
       ORDER BY weekday ASC, starts_at_time ASC, id ASC`
    );

    let createdCount = 0;

    for (const template of templatesRes.rows) {
      const insertRes = await client.query<InsertedRow>(
        accessSchema.hasSessionMembersOnly
          ? `WITH target AS (
               SELECT
                 (($1::date + make_interval(days => $2 - 1))::timestamp + $3::time) AT TIME ZONE 'Europe/Oslo' AS starts_at,
                 (($1::date + make_interval(days => $2 - 1))::timestamp + $4::time
                   + CASE
                       WHEN $4::time <= $3::time THEN INTERVAL '1 day'
                       ELSE INTERVAL '0 day'
                     END) AT TIME ZONE 'Europe/Oslo' AS ends_at
             )
             INSERT INTO sessions (
               starts_at,
               ends_at,
               location,
               capacity,
               members_only,
               auto_template_id,
               auto_week_start
             )
             SELECT
               target.starts_at,
               target.ends_at,
               $5,
               $6,
               $7,
               $8,
               $1::date
             FROM target
             WHERE (
               $9::boolean
               OR NOT EXISTS (
                 SELECT 1
                 FROM schedule_exceptions e
                 WHERE e.template_id = $8
                   AND e.week_start = $1::date
               )
             )
               AND NOT EXISTS (
                 SELECT 1
                 FROM sessions existing
                 WHERE existing.auto_template_id = $8
                   AND existing.auto_week_start = $1::date
               )
               AND NOT EXISTS (
                 SELECT 1
                 FROM sessions existing
                 WHERE existing.starts_at = target.starts_at
               )
             RETURNING id`
          : `WITH target AS (
               SELECT
                 (($1::date + make_interval(days => $2 - 1))::timestamp + $3::time) AT TIME ZONE 'Europe/Oslo' AS starts_at,
                 (($1::date + make_interval(days => $2 - 1))::timestamp + $4::time
                   + CASE
                       WHEN $4::time <= $3::time THEN INTERVAL '1 day'
                       ELSE INTERVAL '0 day'
                     END) AT TIME ZONE 'Europe/Oslo' AS ends_at
             )
             INSERT INTO sessions (
               starts_at,
               ends_at,
               location,
               capacity,
               auto_template_id,
               auto_week_start
             )
             SELECT
               target.starts_at,
               target.ends_at,
               $5,
               $6,
               $7,
               $1::date
             FROM target
             WHERE (
               $8::boolean
               OR NOT EXISTS (
                 SELECT 1
                 FROM schedule_exceptions e
                 WHERE e.template_id = $7
                   AND e.week_start = $1::date
               )
             )
               AND NOT EXISTS (
                 SELECT 1
                 FROM sessions existing
                 WHERE existing.auto_template_id = $7
                   AND existing.auto_week_start = $1::date
               )
               AND NOT EXISTS (
                 SELECT 1
                 FROM sessions existing
                 WHERE existing.starts_at = target.starts_at
               )
             RETURNING id`,
        accessSchema.hasSessionMembersOnly
          ? [
              status.target_week_start_local,
              template.weekday,
              template.starts_at_time,
              template.ends_at_time,
              template.location,
              template.capacity,
              template.members_only,
              template.id,
              force,
            ]
          : [
              status.target_week_start_local,
              template.weekday,
              template.starts_at_time,
              template.ends_at_time,
              template.location,
              template.capacity,
              template.id,
              force,
            ]
      );

      createdCount += insertRes.rowCount ?? 0;
    }

    await client.query("COMMIT");
    return { ...status, created_count: createdCount };
  } catch {
    await client.query("ROLLBACK").catch(() => {});
    throw new Error("Could not generate auto-scheduled sessions.");
  } finally {
    client.release();
  }
}

async function ensureAutoScheduleScaffoldWithClient(client: Queryable) {
  await client.query(
    `INSERT INTO schedule_settings (id, auto_enabled)
     VALUES (1, TRUE)
     ON CONFLICT (id) DO NOTHING`
  );
}
