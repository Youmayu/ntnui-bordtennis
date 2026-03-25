import { pool } from "@/lib/db";
import {
  ensureAutoScheduleScaffold,
  ensureAutoScheduledSessions,
  generateNextWeekFromAutoSchedule,
  normalizeAutoScheduleLocation,
  rememberDeletedAutoSession,
} from "@/lib/auto-schedule";
import {
  normalizeMultilineDisplay,
  normalizeSingleLineDisplay,
  sanitizeAnnouncementBody,
  sanitizeAnnouncementTitle,
  sanitizeLevel,
  sanitizeLocation,
  sanitizeMemberName,
} from "@/lib/input-safety";
import { createPageMetadata } from "@/lib/seo";
import { DEFAULT_SESSION_LOCATION } from "@/lib/site-content";
import {
  fillConfirmedSlotsFromWaitlist,
  REGISTRATION_STATUS,
  type RegistrationStatus,
} from "@/lib/registrations";
import AdminClient from "./AdminClient";

type SessionRow = {
  id: number;
  starts_at: string;
  ends_at: string;
  location: string;
  capacity: number;
  auto_template_id: number | null;
  auto_week_start: string | null;
};

type RegRow = {
  id: number;
  session_id: number;
  name: string;
  level: string;
  status: RegistrationStatus;
  created_at: string;
};

type AnnouncementRow = {
  id: number;
  title: string;
  body: string;
  expires_at: string | null;
  created_at: string;
  is_active: boolean;
};

type ScheduleSettingsRow = {
  auto_enabled: boolean;
};

type ScheduleTemplateRow = {
  id: number;
  weekday: number;
  starts_at_time: string;
  ends_at_time: string;
  location: string;
  capacity: number;
  is_active: boolean;
};

type AutoScheduleOverviewRow = {
  current_week_start_local: string;
  next_week_start_local: string;
  current_week_last_end_local: string | null;
  active_template_count: number;
  next_week_session_count: number;
};

type AutoScheduleSchemaStatusRow = {
  has_schedule_settings: boolean;
  has_schedule_templates: boolean;
  has_auto_template_id: boolean;
  has_auto_week_start: boolean;
};

const WEEKDAY_OPTIONS = [
  { value: 1, label: "Mandag" },
  { value: 2, label: "Tirsdag" },
  { value: 3, label: "Onsdag" },
  { value: 4, label: "Torsdag" },
  { value: 5, label: "Fredag" },
  { value: 6, label: "Lørdag" },
  { value: 7, label: "Søndag" },
] as const;

function fmtOslo(dt: Date) {
  return new Intl.DateTimeFormat("no-NO", {
    timeZone: "Europe/Oslo",
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dt);
}

function toDatetimeLocalOslo(value: string) {
  const d = new Date(value);
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

function toTimeInputValue(value: string) {
  return value.slice(0, 5);
}

function isValidTimeInput(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

function fmtOsloDate(value: string | Date | null | undefined) {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    return new Intl.DateTimeFormat("no-NO", {
      timeZone: "Europe/Oslo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(value);
  }

  if (typeof value !== "string") {
    return String(value);
  }

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${day}.${month}.${year}`;
}

export const dynamic = "force-dynamic";
export const metadata = {
  ...createPageMetadata({
    title: "Admin",
    description: "Administrasjonsside for NTNUI Bordtennis.",
    path: "/admin",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const schemaStatusRes = await pool.query<AutoScheduleSchemaStatusRow>(
    `SELECT
       to_regclass('public.schedule_settings') IS NOT NULL AS has_schedule_settings,
       to_regclass('public.schedule_templates') IS NOT NULL AS has_schedule_templates,
       EXISTS (
         SELECT 1
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = 'sessions'
           AND column_name = 'auto_template_id'
       ) AS has_auto_template_id,
       EXISTS (
         SELECT 1
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = 'sessions'
           AND column_name = 'auto_week_start'
       ) AS has_auto_week_start`
  );

  const autoScheduleSchema =
    schemaStatusRes.rows[0] ??
    ({
      has_schedule_settings: false,
      has_schedule_templates: false,
      has_auto_template_id: false,
      has_auto_week_start: false,
    } satisfies AutoScheduleSchemaStatusRow);

  const autoScheduleAvailable =
    autoScheduleSchema.has_schedule_settings &&
    autoScheduleSchema.has_schedule_templates &&
    autoScheduleSchema.has_auto_template_id &&
    autoScheduleSchema.has_auto_week_start;

  let autoScheduleError: string | null = null;
  let autoScheduleSettings: ScheduleSettingsRow = { auto_enabled: true };
  let autoScheduleOverview: AutoScheduleOverviewRow = {
    current_week_start_local: "",
    next_week_start_local: "",
    current_week_last_end_local: null,
    active_template_count: 0,
    next_week_session_count: 0,
  };
  let templates: ScheduleTemplateRow[] = [];

  if (autoScheduleAvailable) {
    try {
      await ensureAutoScheduleScaffold();
      await ensureAutoScheduledSessions();

      const [settingsRes, templatesRes, overviewRes] = await Promise.all([
        pool.query(
          `SELECT auto_enabled
           FROM schedule_settings
           WHERE id = 1`
        ),
        pool.query(
          `SELECT id, weekday, starts_at_time, ends_at_time, location, capacity, is_active
           FROM schedule_templates
           ORDER BY weekday ASC, starts_at_time ASC, id ASC`
        ),
        pool.query(
          `WITH context AS (
             SELECT date_trunc('week', timezone('Europe/Oslo', NOW())) AS current_week_start_local
           ),
           active_templates AS (
             SELECT weekday, starts_at_time, ends_at_time
             FROM schedule_templates
             WHERE is_active = TRUE
           )
           SELECT
             context.current_week_start_local::date::text AS current_week_start_local,
             (context.current_week_start_local + INTERVAL '7 days')::date::text AS next_week_start_local,
             MAX(
               (
                 (context.current_week_start_local::date + make_interval(days => active_templates.weekday - 1))::timestamp
                 + active_templates.ends_at_time
                 + CASE
                     WHEN active_templates.ends_at_time <= active_templates.starts_at_time THEN INTERVAL '1 day'
                     ELSE INTERVAL '0 day'
                   END
               )
             )::text AS current_week_last_end_local,
             COUNT(active_templates.weekday)::int AS active_template_count,
             (
               SELECT COUNT(*)::int
               FROM sessions s
               WHERE (s.starts_at AT TIME ZONE 'Europe/Oslo') >= context.current_week_start_local + INTERVAL '7 days'
                 AND (s.starts_at AT TIME ZONE 'Europe/Oslo') < context.current_week_start_local + INTERVAL '14 days'
             ) AS next_week_session_count
           FROM context
           LEFT JOIN active_templates ON TRUE
           GROUP BY context.current_week_start_local`
        ),
      ]);

      autoScheduleSettings =
        (settingsRes.rows[0] as ScheduleSettingsRow | undefined) ?? { auto_enabled: true };
      autoScheduleOverview =
        (overviewRes.rows[0] as AutoScheduleOverviewRow | undefined) ?? autoScheduleOverview;
      templates = (templatesRes.rows as ScheduleTemplateRow[]).map((template) => ({
        ...template,
        location: normalizeAutoScheduleLocation(template.location),
      }));
    } catch (error) {
      autoScheduleError =
        error instanceof Error ? error.message : "Auto-plan kunne ikke lastes.";
    }
  }

  const sessionsRes = await pool.query(
    autoScheduleSchema.has_auto_template_id && autoScheduleSchema.has_auto_week_start
      ? `SELECT
           id,
           starts_at,
           ends_at,
           location,
           capacity,
           auto_template_id,
           auto_week_start::text AS auto_week_start
         FROM sessions
         ORDER BY starts_at ASC
         LIMIT 50`
      : `SELECT
           id,
           starts_at,
           ends_at,
           location,
           capacity,
           NULL::int AS auto_template_id,
           NULL::text AS auto_week_start
         FROM sessions
         ORDER BY starts_at ASC
         LIMIT 50`
  );

  const regsRes = await pool.query(
    `SELECT id, session_id, name, level, status, created_at
     FROM registrations
     ORDER BY created_at DESC
     LIMIT 300`
  );

  const announcementsRes = await pool
    .query(
      `SELECT id, title, body, expires_at, created_at,
              (expires_at IS NULL OR expires_at > NOW()) AS is_active
       FROM announcements
       ORDER BY created_at DESC
       LIMIT 30`
    )
    .catch(() => ({ rows: [] }));

  const sessions = (sessionsRes.rows as SessionRow[]).map((session) => ({
    ...session,
    location: sanitizeLocation(session.location) ?? DEFAULT_SESSION_LOCATION,
  }));
  const regs = (regsRes.rows as RegRow[]).map((registration) => ({
    ...registration,
    name: normalizeSingleLineDisplay(registration.name),
    level: sanitizeLevel(registration.level) ?? "Nybegynner",
  }));
  const announcements = (announcementsRes.rows as AnnouncementRow[]).map((announcement) => ({
    ...announcement,
    title: normalizeSingleLineDisplay(announcement.title),
    body: normalizeMultilineDisplay(announcement.body),
  }));

  async function deleteRegistration(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    if (!Number.isFinite(id)) return;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const regRes = await client.query(
        `SELECT session_id, status
         FROM registrations
         WHERE id = $1
         FOR UPDATE`,
        [id]
      );

      if (regRes.rowCount === 0) {
        await client.query("ROLLBACK");
        return;
      }

      const registration = regRes.rows[0] as {
        session_id: number;
        status: RegistrationStatus;
      };

      await client.query(`DELETE FROM registrations WHERE id = $1`, [id]);

      if (registration.status === REGISTRATION_STATUS.CONFIRMED) {
        await fillConfirmedSlotsFromWaitlist(client, registration.session_id);
      }

      await client.query("COMMIT");
    } catch {
      await client.query("ROLLBACK").catch(() => {});
      throw new Error("Could not delete registration.");
    } finally {
      client.release();
    }
  }

  async function updateRegistration(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    const name = sanitizeMemberName(String(formData.get("name") ?? ""));
    const level = sanitizeLevel(String(formData.get("level") ?? ""));
    if (!Number.isFinite(id) || !name || !level) return;

    await pool.query(
      `UPDATE registrations SET name = $2, level = $3 WHERE id = $1`,
      [id, name, level]
    );
  }

  async function addAnnouncement(formData: FormData) {
    "use server";
    const title = sanitizeAnnouncementTitle(String(formData.get("title") ?? ""));
    const body = sanitizeAnnouncementBody(String(formData.get("body") ?? ""));
    const expiresAtLocal = String(formData.get("expires_at") ?? "").trim();

    if (!title || !body) return;

    await pool.query(
      `INSERT INTO announcements (title, body, expires_at)
       VALUES (
         $1,
         $2,
         CASE
           WHEN $3 = '' THEN NULL
           ELSE ($3::timestamp AT TIME ZONE 'Europe/Oslo')
         END
       )`,
      [title, body, expiresAtLocal]
    );
  }

  async function deleteAnnouncement(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    if (!Number.isFinite(id)) return;
    await pool.query(`DELETE FROM announcements WHERE id = $1`, [id]);
  }

  async function updateAutoScheduleSettings(formData: FormData) {
    "use server";
    const autoEnabled = String(formData.get("auto_enabled") ?? "") === "true";

    await pool.query(
      `INSERT INTO schedule_settings (id, auto_enabled)
       VALUES (1, $1)
       ON CONFLICT (id)
       DO UPDATE SET auto_enabled = EXCLUDED.auto_enabled`,
      [autoEnabled]
    );
  }

  async function addScheduleTemplate(formData: FormData) {
    "use server";
    const weekday = Number(formData.get("weekday"));
    const startsAtTime = String(formData.get("starts_at_time") ?? "");
    const endsAtTime = String(formData.get("ends_at_time") ?? "");
    const location = normalizeAutoScheduleLocation(String(formData.get("location") ?? ""));
    const capacity = Number(formData.get("capacity"));
    const isActive = String(formData.get("is_active") ?? "") === "on";

    if (!Number.isFinite(weekday) || weekday < 1 || weekday > 7) return;
    if (!isValidTimeInput(startsAtTime) || !isValidTimeInput(endsAtTime)) return;
    if (!Number.isFinite(capacity) || capacity < 1 || capacity > 200) return;

    await pool.query(
      `INSERT INTO schedule_templates (
         weekday,
         starts_at_time,
         ends_at_time,
         location,
         capacity,
         is_active
       )
       VALUES ($1, $2::time, $3::time, $4, $5, $6)`,
      [weekday, startsAtTime, endsAtTime, location, capacity, isActive]
    );
  }

  async function updateScheduleTemplate(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    const weekday = Number(formData.get("weekday"));
    const startsAtTime = String(formData.get("starts_at_time") ?? "");
    const endsAtTime = String(formData.get("ends_at_time") ?? "");
    const location = normalizeAutoScheduleLocation(String(formData.get("location") ?? ""));
    const capacity = Number(formData.get("capacity"));
    const isActive = String(formData.get("is_active") ?? "") === "on";

    if (!Number.isFinite(id)) return;
    if (!Number.isFinite(weekday) || weekday < 1 || weekday > 7) return;
    if (!isValidTimeInput(startsAtTime) || !isValidTimeInput(endsAtTime)) return;
    if (!Number.isFinite(capacity) || capacity < 1 || capacity > 200) return;

    await pool.query(
      `UPDATE schedule_templates
       SET weekday = $2,
           starts_at_time = $3::time,
           ends_at_time = $4::time,
           location = $5,
           capacity = $6,
           is_active = $7
       WHERE id = $1`,
      [id, weekday, startsAtTime, endsAtTime, location, capacity, isActive]
    );
  }

  async function deleteScheduleTemplate(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    if (!Number.isFinite(id)) return;
    await pool.query(`DELETE FROM schedule_templates WHERE id = $1`, [id]);
  }

  async function generateNextWeek(formData: FormData) {
    "use server";
    void formData;
    await generateNextWeekFromAutoSchedule();
  }

  async function updateSession(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    const startsAtLocal = String(formData.get("starts_at") ?? "");
    const endsAtLocal = String(formData.get("ends_at") ?? "");
    const location = sanitizeLocation(String(formData.get("location") ?? ""));
    const capacity = Number(formData.get("capacity"));

    if (!Number.isFinite(id)) return;
    if (!startsAtLocal || !endsAtLocal || !location) return;
    if (!Number.isFinite(capacity) || capacity < 1 || capacity > 200) return;
    if (startsAtLocal >= endsAtLocal) return;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `UPDATE sessions
         SET starts_at = ($2::timestamp AT TIME ZONE 'Europe/Oslo'),
             ends_at   = ($3::timestamp AT TIME ZONE 'Europe/Oslo'),
             location  = $4,
             capacity  = $5
        WHERE id = $1`,
        [
          id,
          startsAtLocal,
          endsAtLocal,
          location,
          capacity,
        ]
      );

      await fillConfirmedSlotsFromWaitlist(client, id);
      await client.query("COMMIT");
    } catch {
      await client.query("ROLLBACK").catch(() => {});
      throw new Error("Could not update session.");
    } finally {
      client.release();
    }
  }

  async function addSession(formData: FormData) {
    "use server";
    const startsAtLocal = String(formData.get("starts_at") ?? "");
    const endsAtLocal = String(formData.get("ends_at") ?? "");
    const location = sanitizeLocation(String(formData.get("location") ?? ""));
    const capacity = Number(formData.get("capacity") ?? 20);

    if (!startsAtLocal || !endsAtLocal || !location) return;
    if (!Number.isFinite(capacity) || capacity < 1 || capacity > 200) return;
    if (startsAtLocal >= endsAtLocal) return;

    await pool.query(
      `INSERT INTO sessions (starts_at, ends_at, location, capacity)
       VALUES (
         ($1::timestamp AT TIME ZONE 'Europe/Oslo'),
         ($2::timestamp AT TIME ZONE 'Europe/Oslo'),
         $3,
         $4
       )`,
      [
        startsAtLocal,
        endsAtLocal,
        location,
        capacity,
      ]
    );
  }

  async function deleteSession(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    if (!Number.isFinite(id)) return;

    if (!(autoScheduleSchema.has_auto_template_id && autoScheduleSchema.has_auto_week_start)) {
      await pool.query(`DELETE FROM sessions WHERE id = $1`, [id]);
      return;
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const sessionRes = await client.query(
        `SELECT auto_template_id, auto_week_start, starts_at
         FROM sessions
         WHERE id = $1
         FOR UPDATE`,
        [id]
      );

      if (sessionRes.rowCount === 0) {
        await client.query("ROLLBACK");
        return;
      }

      const session = sessionRes.rows[0] as {
        auto_template_id: number | null;
        auto_week_start: string | null;
        starts_at: string;
      };

      await rememberDeletedAutoSession(client, session);
      await client.query(`DELETE FROM sessions WHERE id = $1`, [id]);
      await client.query("COMMIT");
    } catch {
      await client.query("ROLLBACK").catch(() => {});
      throw new Error("Could not delete session.");
    } finally {
      client.release();
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Admin</h1>

      <section className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">Automatisk ukeplan</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sett opp faste treningsdager én gang, så oppretter nettsiden neste ukes økter
            automatisk når denne ukens siste planlagte trening er ferdig.
          </p>
          {autoScheduleError && (
            <p className="mt-3 text-sm text-[color:var(--danger-ink)]">
              Auto-plan kunne ikke lastes helt: {autoScheduleError}
            </p>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-background p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Auto-plan
              </div>
              <div className="mt-2 text-lg font-semibold">
                {autoScheduleSettings.auto_enabled ? "På" : "Av"}
              </div>
            </div>

            <div className="rounded-2xl border bg-background p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Aktive maler
              </div>
              <div className="mt-2 text-lg font-semibold">
                {autoScheduleOverview.active_template_count}
              </div>
            </div>

            <div className="rounded-2xl border bg-background p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Neste uke
              </div>
              <div className="mt-2 text-lg font-semibold">
                {autoScheduleOverview.next_week_start_local
                  ? fmtOsloDate(autoScheduleOverview.next_week_start_local)
                  : "Ikke satt"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {autoScheduleOverview.next_week_session_count} økter ligger allerede inne
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-start gap-3">
            <form action={updateAutoScheduleSettings} className="flex items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Status</label>
                <select
                  name="auto_enabled"
                  defaultValue={autoScheduleSettings.auto_enabled ? "true" : "false"}
                  className="rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="true">På</option>
                  <option value="false">Av</option>
                </select>
              </div>

              <button className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
                Lagre auto-plan
              </button>
            </form>

            <form action={generateNextWeek}>
              <button className="rounded-lg border px-3 py-2 text-sm hover:opacity-90">
                Opprett neste uke nå
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-2xl border bg-background p-4">
          <div className="mb-3 text-sm font-medium">Legg til fast treningsdag</div>
          <form action={addScheduleTemplate} className="grid gap-3 lg:grid-cols-[160px_120px_120px_minmax(0,1fr)_120px_auto_auto]">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Ukedag</label>
              <select
                name="weekday"
                defaultValue="5"
                className="rounded-lg border bg-background px-3 py-2 text-sm"
                required
              >
                {WEEKDAY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Start</label>
              <input
                name="starts_at_time"
                type="time"
                defaultValue="16:30"
                className="rounded-lg border bg-background px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Slutt</label>
              <input
                name="ends_at_time"
                type="time"
                defaultValue="18:30"
                className="rounded-lg border bg-background px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Sted</label>
              <input
                name="location"
                defaultValue={DEFAULT_SESSION_LOCATION}
                maxLength={120}
                className="rounded-lg border bg-background px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Kapasitet</label>
              <input
                name="capacity"
                type="number"
                min={1}
                max={200}
                defaultValue={16}
                className="rounded-lg border bg-background px-3 py-2 text-sm"
                required
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_active" defaultChecked />
              Aktiv
            </label>

            <div className="flex items-end">
              <button className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
                Legg til mal
              </button>
            </div>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-3">Ukedag</th>
                <th className="py-2 pr-3">Start</th>
                <th className="py-2 pr-3">Slutt</th>
                <th className="py-2 pr-3">Sted</th>
                <th className="py-2 pr-3">Kapasitet</th>
                <th className="py-2 pr-3">Aktiv</th>
                <th className="py-2 pr-3">Lagre</th>
                <th className="py-2">Slett</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id} className="align-top border-b last:border-0">
                  <td className="py-3 pr-3">
                    <select
                      form={`template-${template.id}`}
                      name="weekday"
                      defaultValue={String(template.weekday)}
                      className="rounded-lg border bg-background px-2 py-1 text-sm"
                    >
                      {WEEKDAY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-3 pr-3">
                    <input
                      form={`template-${template.id}`}
                      name="starts_at_time"
                      type="time"
                      defaultValue={toTimeInputValue(template.starts_at_time)}
                      className="rounded-lg border bg-background px-2 py-1 text-sm"
                      required
                    />
                  </td>

                  <td className="py-3 pr-3">
                    <input
                      form={`template-${template.id}`}
                      name="ends_at_time"
                      type="time"
                      defaultValue={toTimeInputValue(template.ends_at_time)}
                      className="rounded-lg border bg-background px-2 py-1 text-sm"
                      required
                    />
                  </td>

                  <td className="py-3 pr-3">
                    <input
                      form={`template-${template.id}`}
                      name="location"
                      defaultValue={template.location}
                      maxLength={120}
                      className="w-64 rounded-lg border bg-background px-2 py-1 text-sm"
                      required
                    />
                  </td>

                  <td className="py-3 pr-3">
                    <input
                      form={`template-${template.id}`}
                      name="capacity"
                      type="number"
                      min={1}
                      max={200}
                      defaultValue={template.capacity}
                      className="w-24 rounded-lg border bg-background px-2 py-1 text-sm"
                      required
                    />
                  </td>

                  <td className="py-3 pr-3">
                    <input
                      form={`template-${template.id}`}
                      name="is_active"
                      type="checkbox"
                      defaultChecked={template.is_active}
                    />
                  </td>

                  <td className="py-3 pr-3">
                    <form id={`template-${template.id}`} action={updateScheduleTemplate} className="flex gap-2">
                      <input type="hidden" name="id" value={template.id} />
                      <button className="rounded-lg border bg-primary px-3 py-1 text-primary-foreground hover:opacity-90">
                        Lagre
                      </button>
                    </form>
                  </td>

                  <td className="py-3">
                    <form action={deleteScheduleTemplate}>
                      <input type="hidden" name="id" value={template.id} />
                      <button className="rounded-lg border px-3 py-1 hover:opacity-90">
                        Slett
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {templates.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-muted-foreground">
                    Ingen faste treningsdager er lagt inn enda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border bg-background p-4 text-sm text-muted-foreground">
          {autoScheduleOverview.current_week_last_end_local ? (
            <p>
              Neste uke opprettes når siste aktive mal for denne uken er ferdig:
              {" "}
              {fmtOslo(new Date(autoScheduleOverview.current_week_last_end_local))}
              . Du kan også opprette neste uke manuelt når du vil.
            </p>
          ) : (
            <p>
              Legg inn minst én aktiv mal for at automatisk oppsett skal kunne opprette nye økter.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">Beskjeder</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Vis viktige meldinger tydelig på hele nettstedet. De vises automatisk på alle sider.
          </p>
        </div>

        <div className="rounded-2xl border bg-background p-4">
          <div className="mb-3 text-sm font-medium">Legg til ny beskjed</div>
          <form action={addAnnouncement} className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Tittel</label>
                <input
                  name="title"
                  className="rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="F.eks. Trening 24. april er kansellert"
                  maxLength={140}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Vis til (valgfritt)</label>
                <input
                  name="expires_at"
                  type="datetime-local"
                  className="rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Melding</label>
              <textarea
                name="body"
                className="min-h-[96px] rounded-lg border bg-background px-3 py-2 text-sm"
                placeholder="F.eks. Hallen er stengt grunnet arrangement."
                maxLength={2000}
                required
              />
            </div>

            <div>
              <button className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
                Publiser beskjed
              </button>
            </div>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Tittel</th>
                <th className="py-2 pr-3">Melding</th>
                <th className="py-2 pr-3">Vis til</th>
                <th className="py-2 pr-3">Opprettet</th>
                <th className="py-2">Slett</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="align-top border-b last:border-0">
                  <td className="py-3 pr-3">
                    {announcement.is_active ? (
                      <span className="rounded-full border border-[color:rgba(19,60,67,0.14)] bg-[rgba(19,60,67,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:rgb(24,60,56)]">
                        Aktiv
                      </span>
                    ) : (
                      <span className="rounded-full border border-[color:rgba(113,91,83,0.16)] bg-[rgba(113,91,83,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:rgb(113,91,83)]">
                        Utløpt
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-3 font-medium">{announcement.title}</td>
                  <td className="py-3 pr-3 whitespace-pre-line text-muted-foreground">
                    {announcement.body}
                  </td>
                  <td className="py-3 pr-3 whitespace-nowrap text-muted-foreground">
                    {announcement.expires_at ? fmtOslo(new Date(announcement.expires_at)) : "Manuelt"}
                  </td>
                  <td className="py-3 pr-3 whitespace-nowrap text-muted-foreground">
                    {fmtOslo(new Date(announcement.created_at))}
                  </td>
                  <td className="py-3">
                    <form action={deleteAnnouncement}>
                      <input type="hidden" name="id" value={announcement.id} />
                      <button className="rounded-lg border px-3 py-1 hover:opacity-90">
                        Slett
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {announcements.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-muted-foreground">
                    Ingen beskjeder enda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">Økter</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Rediger tidspunkt, sted og kapasitet. Du kan også legge til nye økter.
          </p>
        </div>

        <div className="rounded-2xl border bg-background p-4">
          <div className="mb-3 text-sm font-medium">Legg til ny økt</div>
          <form action={addSession} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Start (Oslo)</label>
              <input
                name="starts_at"
                type="datetime-local"
                className="rounded-lg border bg-background px-2 py-1 text-sm"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Slutt (Oslo)</label>
              <input
                name="ends_at"
                type="datetime-local"
                className="rounded-lg border bg-background px-2 py-1 text-sm"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Sted</label>
              <input
                name="location"
                defaultValue={DEFAULT_SESSION_LOCATION}
                maxLength={120}
                className="w-64 rounded-lg border bg-background px-2 py-1 text-sm"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Kapasitet</label>
              <input
                name="capacity"
                type="number"
                min={1}
                max={200}
                defaultValue={16}
                className="w-24 rounded-lg border bg-background px-2 py-1 text-sm"
                required
              />
            </div>

            <button className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
              Legg til
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-3">ID</th>
                <th className="py-2 pr-3">Kilde</th>
                <th className="py-2 pr-3">Start</th>
                <th className="py-2 pr-3">Slutt</th>
                <th className="py-2 pr-3">Sted</th>
                <th className="py-2 pr-3">Kapasitet</th>
                <th className="py-2 pr-3">Lagre</th>
                <th className="py-2">Slett</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="align-top border-b last:border-0">
                  <td className="py-3 pr-3">{session.id}</td>

                  <td className="py-3 pr-3">
                    {session.auto_template_id ? (
                      <div className="space-y-1">
                        <span className="rounded-full border border-[color:rgba(19,60,67,0.14)] bg-[rgba(19,60,67,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:rgb(24,60,56)]">
                          Auto
                        </span>
                        {session.auto_week_start && (
                          <div className="text-xs text-muted-foreground">
                            Uke fra {fmtOsloDate(session.auto_week_start)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="rounded-full border border-[color:rgba(113,91,83,0.16)] bg-[rgba(113,91,83,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:rgb(113,91,83)]">
                        Manuell
                      </span>
                    )}
                  </td>

                  <td className="py-3 pr-3">
                    <div className="mb-1 text-xs text-muted-foreground">
                      {fmtOslo(new Date(session.starts_at))}
                    </div>
                    <input
                      form={`session-${session.id}`}
                      name="starts_at"
                      type="datetime-local"
                      defaultValue={toDatetimeLocalOslo(session.starts_at)}
                      className="rounded-lg border bg-background px-2 py-1 text-sm"
                      required
                    />
                  </td>

                  <td className="py-3 pr-3">
                    <div className="mb-1 text-xs text-muted-foreground">
                      {fmtOslo(new Date(session.ends_at))}
                    </div>
                    <input
                      form={`session-${session.id}`}
                      name="ends_at"
                      type="datetime-local"
                      defaultValue={toDatetimeLocalOslo(session.ends_at)}
                      className="rounded-lg border bg-background px-2 py-1 text-sm"
                      required
                    />
                  </td>

                  <td className="py-3 pr-3">
                    <input
                      form={`session-${session.id}`}
                      name="location"
                      defaultValue={session.location}
                      maxLength={120}
                      className="w-64 rounded-lg border bg-background px-2 py-1 text-sm"
                      required
                    />
                  </td>

                  <td className="py-3 pr-3">
                    <input
                      form={`session-${session.id}`}
                      name="capacity"
                      type="number"
                      min={1}
                      max={200}
                      defaultValue={session.capacity}
                      className="w-24 rounded-lg border bg-background px-2 py-1 text-sm"
                      required
                    />
                  </td>

                  <td className="py-3 pr-3">
                    <form id={`session-${session.id}`} action={updateSession} className="flex gap-2">
                      <input type="hidden" name="id" value={session.id} />
                      <button className="rounded-lg border bg-primary px-3 py-1 text-primary-foreground hover:opacity-90">
                        Lagre
                      </button>
                    </form>
                  </td>

                  <td className="py-3">
                    <form action={deleteSession}>
                      <input type="hidden" name="id" value={session.id} />
                      <button className="rounded-lg border px-3 py-1 hover:opacity-90">
                        Slett
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {sessions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-muted-foreground">
                    Ingen økter i databasen.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Påmeldinger</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Endre navn eller nivå, eller slett en påmelding. Session ID viser hvilken økt de tilhører.
        </p>

        <AdminClient
          registrations={regs}
          updateAction={updateRegistration}
          deleteAction={deleteRegistration}
        />
      </section>
    </div>
  );
}
