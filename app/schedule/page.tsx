import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

type SessionRow = {
  id: number;
  starts_at: string;
  ends_at: string;
  location: string;
  capacity: number;
  current_time: string;
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
    `SELECT id, starts_at, ends_at, location, capacity, NOW() AS current_time
     FROM sessions
     WHERE ends_at > NOW()
     ORDER BY starts_at ASC
     LIMIT 12`
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <span className="inline-flex rounded-full border border-[color:rgba(163,50,31,0.16)] bg-[rgba(163,50,31,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[color:rgb(139,45,29)]">
          Timeplan
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-[color:rgb(37,26,20)]">
          Planlagte og aktive økter
        </h1>
        <p className="max-w-2xl text-[color:rgb(94,77,70)]">
          Aktive økter blir stående til sluttidspunktet er passert, slik at listen matcher det som faktisk skjer i hallen.
        </p>
      </div>

      <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(86,39,26,0.10)]">
        <div className="text-sm text-[color:rgb(113,91,83)]">Aktive og kommende økter</div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[color:rgb(113,91,83)]">
              <tr className="border-b border-[color:rgba(37,26,20,0.08)]">
                <th className="py-2 pr-3">Når</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Sted</th>
                <th className="py-2">Kapasitet</th>
              </tr>
            </thead>
            <tbody>
              {(res.rows as SessionRow[]).map((s) => {
                const now = new Date(s.current_time).getTime();
                const isActive =
                  new Date(s.starts_at).getTime() <= now &&
                  new Date(s.ends_at).getTime() > now;

                return (
                  <tr key={s.id} className="border-b border-[color:rgba(37,26,20,0.08)] last:border-0">
                    <td className="py-3 pr-3 font-medium">{fmtOslo(new Date(s.starts_at))}</td>
                    <td className="py-3 pr-3">
                      {isActive ? (
                        <span className="rounded-full border border-[color:rgba(19,60,67,0.14)] bg-[rgba(19,60,67,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:rgb(24,60,56)]">
                          Pågår
                        </span>
                      ) : (
                        <span className="rounded-full border border-[color:rgba(163,50,31,0.14)] bg-[rgba(163,50,31,0.07)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:rgb(139,45,29)]">
                          Kommer
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-3">{s.location}</td>
                    <td className="py-3 text-[color:rgb(113,91,83)]">{s.capacity}</td>
                  </tr>
                );
              })}
              {res.rows.length === 0 && (
                <tr>
                  <td className="py-6 text-[color:rgb(113,91,83)]" colSpan={4}>
                    Ingen kommende økter lagt inn.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
