import { pool } from "@/lib/db";
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

// For <input type="datetime-local"> we need "YYYY-MM-DDTHH:MM"
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

// If user enters Oslo local time (YYYY-MM-DDTHH:MM), store as timestamptz.
function osloLocalToTimestamptzString(dtLocal: string) {
  // We store with explicit +01:00 (winter) / +02:00 (summer) automatically is tricky without a tz lib.
  // Pragmatic approach: send as ISO "YYYY-MM-DDTHH:MM" and let Postgres interpret as local timestamp
  // by appending " Europe/Oslo" in SQL.
  return dtLocal;
}

export const dynamic = "force-dynamic";

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

  const sessions = sessionsRes.rows as SessionRow[];
  const regs = regsRes.rows as RegRow[];

  // ----- Registration actions -----
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

  // ----- Session actions -----
  async function updateSession(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    const starts_at_local = String(formData.get("starts_at") ?? "");
    const ends_at_local = String(formData.get("ends_at") ?? "");
    const location = String(formData.get("location") ?? "").trim();
    const capacity = Number(formData.get("capacity"));

    if (!Number.isFinite(id)) return;
    if (!starts_at_local || !ends_at_local || !location) return;
    if (!Number.isFinite(capacity) || capacity < 1 || capacity > 200) return;

    // Interpret the datetime-local string as Europe/Oslo time in Postgres:
    await pool.query(
      `UPDATE sessions
       SET starts_at = ($2::timestamp AT TIME ZONE 'Europe/Oslo'),
           ends_at   = ($3::timestamp AT TIME ZONE 'Europe/Oslo'),
           location  = $4,
           capacity  = $5
       WHERE id = $1`,
      [
        id,
        osloLocalToTimestamptzString(starts_at_local),
        osloLocalToTimestamptzString(ends_at_local),
        location,
        capacity,
      ]
    );
  }

  async function addSession(formData: FormData) {
    "use server";
    const starts_at_local = String(formData.get("starts_at") ?? "");
    const ends_at_local = String(formData.get("ends_at") ?? "");
    const location = String(formData.get("location") ?? "").trim();
    const capacity = Number(formData.get("capacity") ?? 20);

    if (!starts_at_local || !ends_at_local || !location) return;
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
        osloLocalToTimestamptzString(starts_at_local),
        osloLocalToTimestamptzString(ends_at_local),
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

      {/* ---- Sessions ---- */}
      <section className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Økter</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Rediger tidspunkt (Oslo-tid), sted og kapasitet. Du kan også legge til nye økter.
          </p>
        </div>

        {/* Add new session */}
        <div className="rounded-2xl border bg-background p-4">
          <div className="text-sm font-medium mb-3">Legg til ny økt</div>
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
                defaultValue="Dragvoll Idrettssenter"
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
                defaultValue={20}
                className="w-24 rounded-lg border bg-background px-2 py-1 text-sm"
                required
              />
            </div>

            <button className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
              Legg til
            </button>
          </form>
        </div>

        {/* Existing sessions editable */}
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
              {sessions.map((s) => (
                <tr key={s.id} className="border-b last:border-0 align-top">
                  <td className="py-3 pr-3">{s.id}</td>

                  <td className="py-3 pr-3">
                    <div className="text-xs text-muted-foreground mb-1">{fmtOslo(new Date(s.starts_at))}</div>
                    <input
                      form={`session-${s.id}`}
                      name="starts_at"
                      type="datetime-local"
                      defaultValue={toDatetimeLocalOslo(s.starts_at)}
                      className="rounded-lg border bg-background px-2 py-1 text-sm"
                      required
                    />
                  </td>

                  <td className="py-3 pr-3">
                    <div className="text-xs text-muted-foreground mb-1">{fmtOslo(new Date(s.ends_at))}</div>
                    <input
                      form={`session-${s.id}`}
                      name="ends_at"
                      type="datetime-local"
                      defaultValue={toDatetimeLocalOslo(s.ends_at)}
                      className="rounded-lg border bg-background px-2 py-1 text-sm"
                      required
                    />
                  </td>

                  <td className="py-3 pr-3">
                    <input
                      form={`session-${s.id}`}
                      name="location"
                      defaultValue={s.location}
                      className="w-64 rounded-lg border bg-background px-2 py-1 text-sm"
                      required
                    />
                  </td>

                  <td className="py-3 pr-3">
                    <input
                      form={`session-${s.id}`}
                      name="capacity"
                      type="number"
                      min={1}
                      max={200}
                      defaultValue={s.capacity}
                      className="w-24 rounded-lg border bg-background px-2 py-1 text-sm"
                      required
                    />
                  </td>

                  <td className="py-3 pr-3">
                    <form id={`session-${s.id}`} action={updateSession} className="flex gap-2">
                      <input type="hidden" name="id" value={s.id} />
                      <button className="rounded-lg bg-primary px-3 py-1 text-primary-foreground">
                        Lagre
                      </button>
                    </form>
                  </td>

                  <td className="py-3">
                    <form action={deleteSession}>
                      <input type="hidden" name="id" value={s.id} />
                      <button className="rounded-lg border px-3 py-1 hover:bg-muted">
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

      {/* ---- Registrations ---- */}
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Påmeldinger</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Endre navn/nivå eller slett påmelding. (Session ID viser hvilken økt de tilhører.)
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