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
  members_only: boolean;
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
  members_only: boolean;
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
  has_session_members_only: boolean;
  has_template_members_only: boolean;
};

const WEEKDAY_OPTIONS = [
  { value: 1, label: "Mandag" },
  { value: 2, label: "Tirsdag" },
  { value: 3, label: "Onsdag" },
  { value: 4, label: "Torsdag" },
  { value: 5, label: "Fredag" },
  { value: 6, label: "Lordag" },
  { value: 7, label: "Sondag" },
] as const;

function getWeekdayLabel(weekday: number) {
  return WEEKDAY_OPTIONS.find((option) => option.value === weekday)?.label ?? `Dag ${weekday}`;
}

function getAccessLabel(membersOnly: boolean) {
  return membersOnly ? "Kun medlemmer" : "Apen trening";
}

function getAccessBadgeClass(membersOnly: boolean) {
  return membersOnly ? "app-badge app-badge-neutral" : "app-badge app-badge-success";
}

function getSourceBadgeClass(isAuto: boolean) {
  return isAuto ? "app-badge app-badge-accent" : "app-badge app-badge-neutral";
}

function getStatusBadgeClass(active: boolean) {
  return active ? "app-badge app-badge-success" : "app-badge app-badge-neutral";
}

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
       ) AS has_auto_week_start,
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
       ) AS has_template_members_only`
  );

  const autoScheduleSchema =
    schemaStatusRes.rows[0] ??
    ({
      has_schedule_settings: false,
      has_schedule_templates: false,
      has_auto_template_id: false,
      has_auto_week_start: false,
      has_session_members_only: false,
      has_template_members_only: false,
    } satisfies AutoScheduleSchemaStatusRow);

  const autoScheduleAvailable =
    autoScheduleSchema.has_schedule_settings &&
    autoScheduleSchema.has_schedule_templates &&
    autoScheduleSchema.has_auto_template_id &&
    autoScheduleSchema.has_auto_week_start;
  const sessionMembersOnlyAvailable = autoScheduleSchema.has_session_members_only;
  const templateMembersOnlyAvailable = autoScheduleSchema.has_template_members_only;

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
          autoScheduleSchema.has_template_members_only
            ? `SELECT
                 id,
                 weekday,
                 starts_at_time,
                 ends_at_time,
                 location,
                 capacity,
                 members_only,
                 is_active
               FROM schedule_templates
               ORDER BY weekday ASC, starts_at_time ASC, id ASC`
            : `SELECT
                 id,
                 weekday,
                 starts_at_time,
                 ends_at_time,
                 location,
                 capacity,
                 TRUE AS members_only,
                 is_active
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
           ${autoScheduleSchema.has_session_members_only ? "members_only" : "TRUE AS members_only"},
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
           ${autoScheduleSchema.has_session_members_only ? "members_only" : "TRUE AS members_only"},
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
    const membersOnly = String(formData.get("members_only") ?? "") === "on";
    const isActive = String(formData.get("is_active") ?? "") === "on";

    if (!Number.isFinite(weekday) || weekday < 1 || weekday > 7) return;
    if (!isValidTimeInput(startsAtTime) || !isValidTimeInput(endsAtTime)) return;
    if (!Number.isFinite(capacity) || capacity < 1 || capacity > 200) return;

    await pool.query(
      autoScheduleSchema.has_template_members_only
        ? `INSERT INTO schedule_templates (
             weekday,
             starts_at_time,
             ends_at_time,
             location,
             capacity,
             members_only,
             is_active
           )
           VALUES ($1, $2::time, $3::time, $4, $5, $6, $7)`
        : `INSERT INTO schedule_templates (
             weekday,
             starts_at_time,
             ends_at_time,
             location,
             capacity,
             is_active
           )
           VALUES ($1, $2::time, $3::time, $4, $5, $6)`,
      autoScheduleSchema.has_template_members_only
        ? [weekday, startsAtTime, endsAtTime, location, capacity, membersOnly, isActive]
        : [weekday, startsAtTime, endsAtTime, location, capacity, isActive]
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
    const membersOnly = String(formData.get("members_only") ?? "") === "on";
    const isActive = String(formData.get("is_active") ?? "") === "on";

    if (!Number.isFinite(id)) return;
    if (!Number.isFinite(weekday) || weekday < 1 || weekday > 7) return;
    if (!isValidTimeInput(startsAtTime) || !isValidTimeInput(endsAtTime)) return;
    if (!Number.isFinite(capacity) || capacity < 1 || capacity > 200) return;

    await pool.query(
      autoScheduleSchema.has_template_members_only
        ? `UPDATE schedule_templates
           SET weekday = $2,
               starts_at_time = $3::time,
               ends_at_time = $4::time,
               location = $5,
               capacity = $6,
               members_only = $7,
               is_active = $8
           WHERE id = $1`
        : `UPDATE schedule_templates
           SET weekday = $2,
               starts_at_time = $3::time,
               ends_at_time = $4::time,
               location = $5,
               capacity = $6,
               is_active = $7
           WHERE id = $1`,
      autoScheduleSchema.has_template_members_only
        ? [id, weekday, startsAtTime, endsAtTime, location, capacity, membersOnly, isActive]
        : [id, weekday, startsAtTime, endsAtTime, location, capacity, isActive]
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
    const membersOnly = String(formData.get("members_only") ?? "") === "on";

    if (!Number.isFinite(id)) return;
    if (!startsAtLocal || !endsAtLocal || !location) return;
    if (!Number.isFinite(capacity) || capacity < 1 || capacity > 200) return;
    if (startsAtLocal >= endsAtLocal) return;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        autoScheduleSchema.has_session_members_only
          ? `UPDATE sessions
             SET starts_at = ($2::timestamp AT TIME ZONE 'Europe/Oslo'),
                 ends_at   = ($3::timestamp AT TIME ZONE 'Europe/Oslo'),
                 location  = $4,
                 capacity  = $5,
                 members_only = $6
             WHERE id = $1`
          : `UPDATE sessions
             SET starts_at = ($2::timestamp AT TIME ZONE 'Europe/Oslo'),
                 ends_at   = ($3::timestamp AT TIME ZONE 'Europe/Oslo'),
                 location  = $4,
                 capacity  = $5
             WHERE id = $1`,
        autoScheduleSchema.has_session_members_only
          ? [id, startsAtLocal, endsAtLocal, location, capacity, membersOnly]
          : [id, startsAtLocal, endsAtLocal, location, capacity]
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
    const membersOnly = String(formData.get("members_only") ?? "") === "on";

    if (!startsAtLocal || !endsAtLocal || !location) return;
    if (!Number.isFinite(capacity) || capacity < 1 || capacity > 200) return;
    if (startsAtLocal >= endsAtLocal) return;

    await pool.query(
      autoScheduleSchema.has_session_members_only
        ? `INSERT INTO sessions (starts_at, ends_at, location, capacity, members_only)
           VALUES (
             ($1::timestamp AT TIME ZONE 'Europe/Oslo'),
             ($2::timestamp AT TIME ZONE 'Europe/Oslo'),
             $3,
             $4,
             $5
           )`
        : `INSERT INTO sessions (starts_at, ends_at, location, capacity)
           VALUES (
             ($1::timestamp AT TIME ZONE 'Europe/Oslo'),
             ($2::timestamp AT TIME ZONE 'Europe/Oslo'),
             $3,
             $4
           )`,
      autoScheduleSchema.has_session_members_only
        ? [startsAtLocal, endsAtLocal, location, capacity, membersOnly]
        : [startsAtLocal, endsAtLocal, location, capacity]
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

  const activeAnnouncementCount = announcements.filter((announcement) => announcement.is_active).length;
  const activeTemplateCount = templates.filter((template) => template.is_active).length;
  const autoSessionCount = sessions.filter((session) => Boolean(session.auto_template_id)).length;
  const confirmedRegistrationCount = regs.filter(
    (registration) => registration.status === REGISTRATION_STATUS.CONFIRMED
  ).length;
  const waitlistRegistrationCount = regs.filter(
    (registration) => registration.status === REGISTRATION_STATUS.WAITLIST
  ).length;

  return (
    <div className="space-y-8">
      <section className="app-surface overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <span className="app-badge app-badge-accent">Admin</span>
            <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--text-strong)]">
              Kontrollpanel
            </h1>
            <p className="max-w-3xl text-[color:var(--text-muted)]">
              Hold ukeplan, okter, beskjeder og pameldinger oppdatert fra ett sted. De tyngste
              seksjonene er samlet i kort og detaljer i stedet for brede tabeller.
            </p>
          </div>

          <nav className="flex flex-wrap gap-3">
            <a href="#auto-plan" className="app-button-secondary inline-flex">
              Auto-plan
            </a>
            <a href="#announcements" className="app-button-secondary inline-flex">
              Beskjeder
            </a>
            <a href="#sessions" className="app-button-secondary inline-flex">
              Okter
            </a>
            <a href="#registrations" className="app-button-secondary inline-flex">
              Pameldinger
            </a>
          </nav>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-strong)] p-4">
            <div className="app-panel-eyebrow">Neste uke</div>
            <div className="mt-3 text-2xl font-semibold text-[color:var(--text-strong)]">
              {autoScheduleOverview.next_week_session_count}
            </div>
            <div className="mt-2 text-sm text-[color:var(--text-muted)]">
              Okter klare for{" "}
              {autoScheduleOverview.next_week_start_local
                ? fmtOsloDate(autoScheduleOverview.next_week_start_local)
                : "neste uke"}
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-strong)] p-4">
            <div className="app-panel-eyebrow">Maler</div>
            <div className="mt-3 text-2xl font-semibold text-[color:var(--text-strong)]">
              {activeTemplateCount}/{templates.length}
            </div>
            <div className="mt-2 text-sm text-[color:var(--text-muted)]">
              Aktive faste treningsdager
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-strong)] p-4">
            <div className="app-panel-eyebrow">Okter</div>
            <div className="mt-3 text-2xl font-semibold text-[color:var(--text-strong)]">
              {sessions.length}
            </div>
            <div className="mt-2 text-sm text-[color:var(--text-muted)]">
              {autoSessionCount} auto og {sessions.length - autoSessionCount} manuelle
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-strong)] p-4">
            <div className="app-panel-eyebrow">Pameldinger</div>
            <div className="mt-3 text-2xl font-semibold text-[color:var(--text-strong)]">
              {confirmedRegistrationCount + waitlistRegistrationCount}
            </div>
            <div className="mt-2 text-sm text-[color:var(--text-muted)]">
              {confirmedRegistrationCount} bekreftet, {waitlistRegistrationCount} venteliste
            </div>
          </div>
        </div>
      </section>

      <section id="auto-plan" className="app-surface space-y-6 p-6 sm:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[color:var(--text-strong)]">
              Automatisk ukeplan
            </h2>
            <p className="mt-2 max-w-3xl text-[color:var(--text-muted)]">
              Sett opp faste treningsdager en gang, sa fylles neste uke inn automatisk. Klikk pa
              et kort for a redigere en mal.
            </p>
            {!templateMembersOnlyAvailable && (
              <p className="mt-3 text-sm text-[color:var(--danger-ink)]">
                Kjor <code>node scripts/init-db.js</code> for a aktivere tilgangsvalg for faste
                treningsdager.
              </p>
            )}
            {autoScheduleError && (
              <p className="mt-3 text-sm text-[color:var(--danger-ink)]">
                Auto-plan kunne ikke lastes helt: {autoScheduleError}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <form action={updateAutoScheduleSettings} className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[color:var(--text-soft)]">Status</label>
                <select
                  name="auto_enabled"
                  defaultValue={autoScheduleSettings.auto_enabled ? "true" : "false"}
                  className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
                >
                  <option value="true">Pa</option>
                  <option value="false">Av</option>
                </select>
              </div>

              <button className="app-button-primary inline-flex">Lagre auto-plan</button>
            </form>

            <form action={generateNextWeek}>
              <button className="app-button-secondary inline-flex">Opprett neste uke na</button>
            </form>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-strong)] p-4">
              <div className="app-panel-eyebrow">Auto-plan</div>
              <div className="mt-3 text-xl font-semibold text-[color:var(--text-strong)]">
                {autoScheduleSettings.auto_enabled ? "Pa" : "Av"}
              </div>
            </div>

            <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-strong)] p-4">
              <div className="app-panel-eyebrow">Aktive maler</div>
              <div className="mt-3 text-xl font-semibold text-[color:var(--text-strong)]">
                {autoScheduleOverview.active_template_count}
              </div>
            </div>

            <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-strong)] p-4">
              <div className="app-panel-eyebrow">Siste okt denne uken</div>
              <div className="mt-3 text-sm font-medium text-[color:var(--text-strong)]">
                {autoScheduleOverview.current_week_last_end_local
                  ? fmtOslo(new Date(autoScheduleOverview.current_week_last_end_local))
                  : "Ingen aktive maler"}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-strong)] p-4 text-sm text-[color:var(--text-muted)]">
            {autoScheduleOverview.current_week_last_end_local ? (
              <p>
                Neste uke opprettes nar siste aktive mal for denne uken er ferdig:{" "}
                {fmtOslo(new Date(autoScheduleOverview.current_week_last_end_local))}.
              </p>
            ) : (
              <p>Legg inn minst en aktiv mal for at automatisk oppsett skal kunne opprette nye okter.</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="app-panel-eyebrow">Legg til fast treningsdag</div>
          <form action={addScheduleTemplate} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[color:var(--text-soft)]">Ukedag</label>
              <select
                name="weekday"
                defaultValue="5"
                className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
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
              <label className="text-xs text-[color:var(--text-soft)]">Start</label>
              <input
                name="starts_at_time"
                type="time"
                defaultValue="16:30"
                className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[color:var(--text-soft)]">Slutt</label>
              <input
                name="ends_at_time"
                type="time"
                defaultValue="18:30"
                className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[color:var(--text-soft)]">Kapasitet</label>
              <input
                name="capacity"
                type="number"
                min={1}
                max={200}
                defaultValue={16}
                className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2 xl:col-span-4">
              <label className="text-xs text-[color:var(--text-soft)]">Sted</label>
              <input
                name="location"
                defaultValue={DEFAULT_SESSION_LOCATION}
                maxLength={120}
                className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
                required
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="members_only"
                defaultChecked
                disabled={!templateMembersOnlyAvailable}
              />
              Kun medlemmer
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_active" defaultChecked />
              Aktiv mal
            </label>

            <div className="md:col-span-2 xl:col-span-2">
              <button className="app-button-primary inline-flex">Legg til mal</button>
            </div>
          </form>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {templates.map((template) => (
            <details
              key={template.id}
              className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-strong)]"
            >
              <summary className="flex cursor-pointer list-none flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="app-panel-eyebrow">{getWeekdayLabel(template.weekday)}</div>
                  <div className="mt-2 text-xl font-semibold text-[color:var(--text-strong)]">
                    {toTimeInputValue(template.starts_at_time)} - {toTimeInputValue(template.ends_at_time)}
                  </div>
                  <div className="mt-2 text-sm text-[color:var(--text-muted)]">
                    {template.location}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <span className={getAccessBadgeClass(template.members_only)}>
                    {getAccessLabel(template.members_only)}
                  </span>
                  <span className="app-badge app-badge-accent">{template.capacity} plasser</span>
                  <span className={getStatusBadgeClass(template.is_active)}>
                    {template.is_active ? "Aktiv" : "Av"}
                  </span>
                </div>
              </summary>

              <div className="border-t border-[color:var(--border-muted)] p-5">
                <form
                  id={`template-${template.id}`}
                  action={updateScheduleTemplate}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  <input type="hidden" name="id" value={template.id} />

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[color:var(--text-soft)]">Ukedag</label>
                    <select
                      name="weekday"
                      defaultValue={String(template.weekday)}
                      className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
                    >
                      {WEEKDAY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[color:var(--text-soft)]">Kapasitet</label>
                    <input
                      name="capacity"
                      type="number"
                      min={1}
                      max={200}
                      defaultValue={template.capacity}
                      className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[color:var(--text-soft)]">Start</label>
                    <input
                      name="starts_at_time"
                      type="time"
                      defaultValue={toTimeInputValue(template.starts_at_time)}
                      className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[color:var(--text-soft)]">Slutt</label>
                    <input
                      name="ends_at_time"
                      type="time"
                      defaultValue={toTimeInputValue(template.ends_at_time)}
                      className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-xs text-[color:var(--text-soft)]">Sted</label>
                    <input
                      name="location"
                      defaultValue={template.location}
                      maxLength={120}
                      className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
                      required
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      name="members_only"
                      type="checkbox"
                      defaultChecked={template.members_only}
                      disabled={!templateMembersOnlyAvailable}
                    />
                    Kun medlemmer
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input name="is_active" type="checkbox" defaultChecked={template.is_active} />
                    Aktiv mal
                  </label>
                </form>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button form={`template-${template.id}`} type="submit" className="app-button-primary inline-flex">
                    Lagre mal
                  </button>

                  <form action={deleteScheduleTemplate}>
                    <input type="hidden" name="id" value={template.id} />
                    <button className="app-button-secondary inline-flex">Slett mal</button>
                  </form>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section id="announcements" className="app-surface space-y-6 p-6 sm:p-8">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[color:var(--text-strong)]">Beskjeder</h2>
            <p className="mt-2 max-w-3xl text-[color:var(--text-muted)]">
              Publisering og oversikt er samlet i ett roligere oppsett.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="app-badge app-badge-success">{activeAnnouncementCount} aktive</span>
            <span className="app-badge app-badge-neutral">{announcements.length} totalt</span>
          </div>
        </div>

        <form action={addAnnouncement} className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[color:var(--text-soft)]">Tittel</label>
              <input
                name="title"
                className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
                placeholder="F.eks. Trening 24. april er kansellert"
                maxLength={140}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[color:var(--text-soft)]">Vis til (valgfritt)</label>
              <input
                name="expires_at"
                type="datetime-local"
                className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[color:var(--text-soft)]">Melding</label>
            <textarea
              name="body"
              className="app-field min-h-[120px] rounded-2xl px-4 py-3 text-sm outline-none"
              placeholder="F.eks. Hallen er stengt grunnet arrangement."
              maxLength={2000}
              required
            />
          </div>

          <div>
            <button className="app-button-primary inline-flex">Publiser beskjed</button>
          </div>
        </form>

        <div className="grid gap-4 xl:grid-cols-2">
          {announcements.map((announcement) => (
            <article
              key={announcement.id}
              className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-strong)] p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="app-panel-eyebrow">Beskjed #{announcement.id}</div>
                  <h3 className="mt-2 text-xl font-semibold text-[color:var(--text-strong)]">
                    {announcement.title}
                  </h3>
                </div>

                <span className={getStatusBadgeClass(announcement.is_active)}>
                  {announcement.is_active ? "Aktiv" : "Utlopt"}
                </span>
              </div>

              <div className="mt-4 whitespace-pre-line text-sm leading-7 text-[color:var(--text-muted)]">
                {announcement.body}
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-[color:var(--text-muted)]">
                <span>Opprettet: {fmtOslo(new Date(announcement.created_at))}</span>
                <span>
                  Vis til: {announcement.expires_at ? fmtOslo(new Date(announcement.expires_at)) : "Manuelt"}
                </span>
              </div>

              <div className="mt-5">
                <form action={deleteAnnouncement}>
                  <input type="hidden" name="id" value={announcement.id} />
                  <button className="app-button-secondary inline-flex">Slett beskjed</button>
                </form>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="sessions" className="app-surface space-y-6 p-6 sm:p-8">
        <div>
          <h2 className="text-2xl font-semibold text-[color:var(--text-strong)]">Okter</h2>
          <p className="mt-2 max-w-3xl text-[color:var(--text-muted)]">
            Rediger tidspunkt, sted, kapasitet og tilgangsniva uten brede tabeller. Klikk pa en
            okt for a apne redigeringen.
          </p>
        </div>

        <form action={addSession} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[color:var(--text-soft)]">Start (Oslo)</label>
            <input
              name="starts_at"
              type="datetime-local"
              className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[color:var(--text-soft)]">Slutt (Oslo)</label>
            <input
              name="ends_at"
              type="datetime-local"
              className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[color:var(--text-soft)]">Kapasitet</label>
            <input
              name="capacity"
              type="number"
              min={1}
              max={200}
              defaultValue={16}
              className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
              required
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="members_only"
                defaultChecked
                disabled={!sessionMembersOnlyAvailable}
              />
              Kun medlemmer
            </label>
          </div>

          <div className="flex flex-col gap-1 md:col-span-2 xl:col-span-4">
            <label className="text-xs text-[color:var(--text-soft)]">Sted</label>
            <input
              name="location"
              defaultValue={DEFAULT_SESSION_LOCATION}
              maxLength={120}
              className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
              required
            />
          </div>

          <div className="md:col-span-2 xl:col-span-4">
            <button className="app-button-primary inline-flex">Legg til okt</button>
          </div>
        </form>

        <div className="grid gap-4">
          {sessions.map((session) => (
            <details
              key={session.id}
              className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-strong)]"
            >
              <summary className="flex cursor-pointer list-none flex-col gap-3 p-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="app-panel-eyebrow">Okt #{session.id}</div>
                  <div className="mt-2 text-xl font-semibold text-[color:var(--text-strong)]">
                    {fmtOslo(new Date(session.starts_at))}
                  </div>
                  <div className="mt-2 text-sm text-[color:var(--text-muted)]">
                    Slutter {fmtOslo(new Date(session.ends_at))} · {session.location}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <span className={getSourceBadgeClass(Boolean(session.auto_template_id))}>
                    {session.auto_template_id ? "Auto" : "Manuell"}
                  </span>
                  <span className={getAccessBadgeClass(session.members_only)}>
                    {getAccessLabel(session.members_only)}
                  </span>
                  <span className="app-badge app-badge-accent">{session.capacity} plasser</span>
                  {session.auto_week_start && (
                    <span className="app-badge app-badge-neutral">
                      Uke {fmtOsloDate(session.auto_week_start)}
                    </span>
                  )}
                </div>
              </summary>

              <div className="border-t border-[color:var(--border-muted)] p-5">
                <form
                  id={`session-${session.id}`}
                  action={updateSession}
                  className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
                >
                  <input type="hidden" name="id" value={session.id} />

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[color:var(--text-soft)]">Start (Oslo)</label>
                    <input
                      name="starts_at"
                      type="datetime-local"
                      defaultValue={toDatetimeLocalOslo(session.starts_at)}
                      className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[color:var(--text-soft)]">Slutt (Oslo)</label>
                    <input
                      name="ends_at"
                      type="datetime-local"
                      defaultValue={toDatetimeLocalOslo(session.ends_at)}
                      className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[color:var(--text-soft)]">Kapasitet</label>
                    <input
                      name="capacity"
                      type="number"
                      min={1}
                      max={200}
                      defaultValue={session.capacity}
                      className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
                      required
                    />
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        name="members_only"
                        type="checkbox"
                        defaultChecked={session.members_only}
                        disabled={!sessionMembersOnlyAvailable}
                      />
                      Kun medlemmer
                    </label>
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2 xl:col-span-4">
                    <label className="text-xs text-[color:var(--text-soft)]">Sted</label>
                    <input
                      name="location"
                      defaultValue={session.location}
                      maxLength={120}
                      className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
                      required
                    />
                  </div>
                </form>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button form={`session-${session.id}`} type="submit" className="app-button-primary inline-flex">
                    Lagre okt
                  </button>

                  <form action={deleteSession}>
                    <input type="hidden" name="id" value={session.id} />
                    <button className="app-button-secondary inline-flex">Slett okt</button>
                  </form>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section id="registrations" className="app-surface p-6 sm:p-8">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-[color:var(--text-strong)]">Pameldinger</h2>
          <p className="max-w-3xl text-[color:var(--text-muted)]">
            Sok, filtrer og oppdater pameldinger uten a lete i hele listen.
          </p>
        </div>

        <AdminClient
          registrations={regs}
          updateAction={updateRegistration}
          deleteAction={deleteRegistration}
        />
      </section>
    </div>
  );
}
