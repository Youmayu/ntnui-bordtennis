import { pool } from "@/lib/db";
import { createPageMetadata } from "@/lib/seo";
import { DEFAULT_SESSION_LOCATION } from "@/lib/site-content";
import AdminClient from "./AdminClient";

type SessionRow = {
  id: number;
  starts_at: string;
  ends_at: string;
  location: string;
  capacity: number;
};

type RegRow = {
  id: number;
  session_id: number;
  name: string;
  level: string;
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

function osloLocalToTimestamptzString(dtLocal: string) {
  return dtLocal;
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
  const sessionsRes = await pool.query(
    `SELECT id, starts_at, ends_at, location, capacity
     FROM sessions
     ORDER BY starts_at ASC
     LIMIT 30`
  );

  const regsRes = await pool.query(
    `SELECT id, session_id, name, level, created_at
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

  const sessions = sessionsRes.rows as SessionRow[];
  const regs = regsRes.rows as RegRow[];
  const announcements = announcementsRes.rows as AnnouncementRow[];

  async function deleteRegistration(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    if (!Number.isFinite(id)) return;
    await pool.query(`DELETE FROM registrations WHERE id = $1`, [id]);
  }

  async function updateRegistration(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    const name = String(formData.get("name") ?? "").trim();
    const level = String(formData.get("level") ?? "").trim();
    if (!Number.isFinite(id) || name.length < 2 || !level) return;

    await pool.query(
      `UPDATE registrations SET name = $2, level = $3 WHERE id = $1`,
      [id, name, level]
    );
  }

  async function addAnnouncement(formData: FormData) {
    "use server";
    const title = String(formData.get("title") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();
    const expiresAtLocal = String(formData.get("expires_at") ?? "").trim();

    if (title.length < 3 || body.length < 3) return;

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
      [title, body, osloLocalToTimestamptzString(expiresAtLocal)]
    );
  }

  async function deleteAnnouncement(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    if (!Number.isFinite(id)) return;
    await pool.query(`DELETE FROM announcements WHERE id = $1`, [id]);
  }

  async function updateSession(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    const startsAtLocal = String(formData.get("starts_at") ?? "");
    const endsAtLocal = String(formData.get("ends_at") ?? "");
    const location = String(formData.get("location") ?? "").trim();
    const capacity = Number(formData.get("capacity"));

    if (!Number.isFinite(id)) return;
    if (!startsAtLocal || !endsAtLocal || !location) return;
    if (!Number.isFinite(capacity) || capacity < 1 || capacity > 200) return;

    await pool.query(
      `UPDATE sessions
       SET starts_at = ($2::timestamp AT TIME ZONE 'Europe/Oslo'),
           ends_at   = ($3::timestamp AT TIME ZONE 'Europe/Oslo'),
           location  = $4,
           capacity  = $5
       WHERE id = $1`,
      [
        id,
        osloLocalToTimestamptzString(startsAtLocal),
        osloLocalToTimestamptzString(endsAtLocal),
        location,
        capacity,
      ]
    );
  }

  async function addSession(formData: FormData) {
    "use server";
    const startsAtLocal = String(formData.get("starts_at") ?? "");
    const endsAtLocal = String(formData.get("ends_at") ?? "");
    const location = String(formData.get("location") ?? "").trim();
    const capacity = Number(formData.get("capacity") ?? 20);

    if (!startsAtLocal || !endsAtLocal || !location) return;
    if (!Number.isFinite(capacity) || capacity < 1 || capacity > 200) return;

    await pool.query(
      `INSERT INTO sessions (starts_at, ends_at, location, capacity)
       VALUES (
         ($1::timestamp AT TIME ZONE 'Europe/Oslo'),
         ($2::timestamp AT TIME ZONE 'Europe/Oslo'),
         $3,
         $4
       )`,
      [
        osloLocalToTimestamptzString(startsAtLocal),
        osloLocalToTimestamptzString(endsAtLocal),
        location,
        capacity,
      ]
    );
  }

  async function deleteSession(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    if (!Number.isFinite(id)) return;
    await pool.query(`DELETE FROM sessions WHERE id = $1`, [id]);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Admin</h1>

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
                  <td colSpan={7} className="py-6 text-muted-foreground">
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
