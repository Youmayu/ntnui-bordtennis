import { pool } from "@/lib/db";
export const dynamic = "force-dynamic";

type SessionRow = {
  id: number;
  starts_at: string; // returned from pg as string
  ends_at: string;
  location: string;
  capacity: number;
};

function fmtOslo(dt: Date) {
  return new Intl.DateTimeFormat("no-NO", {
    timeZone: "Europe/Oslo",
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dt);
}

export default async function SchedulePage() {
  const res = await pool.query(
    `SELECT id, starts_at, ends_at, location, capacity
     FROM sessions
     WHERE starts_at > NOW()
     ORDER BY starts_at ASC
     LIMIT 12`
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Timeplan</h1>

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="text-sm text-muted-foreground">Kommende økter</div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-3">Når</th>
                <th className="py-2 pr-3">Sted</th>
                <th className="py-2">Kapasitet</th>
              </tr>
            </thead>
            <tbody>
              {(res.rows as SessionRow[]).map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="py-3 pr-3 font-medium">
                    {fmtOslo(new Date(s.starts_at))}
                  </td>
                  <td className="py-3 pr-3">{s.location}</td>
                  <td className="py-3 text-muted-foreground">{s.capacity}</td>
                </tr>
              ))}
              {res.rows.length === 0 && (
                <tr>
                  <td className="py-6 text-muted-foreground" colSpan={3}>
                    Ingen kommende økter lagt inn.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
        </div>
      </div>
    </div>
  );
}