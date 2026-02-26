import { pool } from "@/lib/db";

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

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Admin</h1>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Økter</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-3">ID</th>
                <th className="py-2 pr-3">Start</th>
                <th className="py-2 pr-3">Sted</th>
                <th className="py-2">Kapasitet</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="py-3 pr-3">{s.id}</td>
                  <td className="py-3 pr-3">{fmtOslo(new Date(s.starts_at))}</td>
                  <td className="py-3 pr-3">{s.location}</td>
                  <td className="py-3">{s.capacity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Påmeldinger</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Endre navn/nivå eller slett påmelding. (Session ID viser hvilken økt de tilhører.)
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-3">Tid</th>
                <th className="py-2 pr-3">Session</th>
                <th className="py-2 pr-3">Navn</th>
                <th className="py-2 pr-3">Nivå</th>
                <th className="py-2 pr-3">Lagre</th>
                <th className="py-2">Slett</th>
              </tr>
            </thead>
            <tbody>
              {regs.map((r) => (
                <tr key={r.id} className="border-b last:border-0 align-top">
                  <td className="py-3 pr-3 whitespace-nowrap">
                    {fmtOslo(new Date(r.created_at))}
                  </td>
                  <td className="py-3 pr-3">{r.session_id}</td>

                  <td className="py-3 pr-3">
                    <form action={updateRegistration} className="flex gap-2">
                      <input type="hidden" name="id" value={r.id} />
                      <input
                        name="name"
                        defaultValue={r.name}
                        className="w-56 rounded-lg border bg-background px-2 py-1"
                      />
                  </form>
                  </td>

                  <td className="py-3 pr-3">
                    <form action={updateRegistration} className="flex gap-2">
                      <input type="hidden" name="id" value={r.id} />
                      <select
                        name="level"
                        defaultValue={r.level}
                        className="rounded-lg border bg-background px-2 py-1"
                      >
                        <option>Nybegynner</option>
                        <option>Viderekommen</option>
                        <option>Erfaren</option>
                      </select>
                      <button className="rounded-lg bg-primary px-3 py-1 text-primary-foreground">
                        Lagre
                      </button>
                    </form>
                  </td>

                  <td className="py-3 pr-3"></td>

                  <td className="py-3">
                    <form action={deleteRegistration}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="rounded-lg border px-3 py-1 hover:bg-muted">
                        Slett
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {regs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-muted-foreground">
                    Ingen påmeldinger enda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}