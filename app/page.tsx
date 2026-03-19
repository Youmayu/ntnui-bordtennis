import Link from "next/link";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

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

function fmtTime(dt: Date) {
  return new Intl.DateTimeFormat("no-NO", {
    timeZone: "Europe/Oslo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dt);
}

export default async function HomePage() {
  const nextSessionRes = await pool.query(
    `SELECT id, starts_at, ends_at, location, capacity, NOW() AS current_time
     FROM sessions
     WHERE ends_at > NOW()
     ORDER BY starts_at ASC
     LIMIT 1`
  );

  const session = nextSessionRes.rows[0];

  if (!session) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight text-[color:rgb(37,26,20)]">
          NTNUI Bordtennis
        </h1>
        <p className="text-[color:rgb(94,77,70)]">Ingen kommende økter lagt inn enda.</p>
        <Link
          className="inline-flex rounded-full bg-[color:rgb(163,50,31)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(163,50,31,0.28)] transition hover:-translate-y-0.5 hover:bg-[color:rgb(145,43,25)]"
          href="/schedule"
        >
          Se timeplan
        </Link>
      </div>
    );
  }

  const regsRes = await pool.query(
    `SELECT name
     FROM registrations
     WHERE session_id = $1
     ORDER BY created_at ASC`,
    [session.id]
  );

  const registered = regsRes.rows as { name: string }[];
  const spotsLeft = Math.max(0, session.capacity - registered.length);
  const now = new Date(session.current_time).getTime();
  const isActive =
    new Date(session.starts_at).getTime() <= now &&
    new Date(session.ends_at).getTime() > now;

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(252,240,235,0.92)_45%,rgba(255,230,220,0.9))] p-8 shadow-[0_30px_90px_rgba(86,39,26,0.12)] sm:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[color:rgba(19,60,67,0.12)] bg-white/70 px-3 py-1 text-xs font-medium text-[color:rgb(63,78,76)]">
            Dragvoll Idrettssenter
          </span>
        </div>

        <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-[color:rgb(37,26,20)] sm:text-5xl">
          Påmelding til bordtennistrening
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[color:rgb(94,77,70)]">
          Se neste økt og meld deg på.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="inline-flex items-center rounded-full bg-[color:rgb(163,50,31)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(163,50,31,0.28)] transition hover:-translate-y-0.5 hover:bg-[color:rgb(145,43,25)]"
          >
            Påmelding
          </Link>
          <Link
            href="/schedule"
            className="inline-flex items-center rounded-full border border-[color:rgba(37,26,20,0.12)] bg-white/75 px-5 py-3 text-sm font-semibold text-[color:rgb(37,26,20)] transition hover:-translate-y-0.5 hover:bg-white"
          >
            Se timeplan
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <h2 className="text-xl font-semibold text-[color:rgb(37,26,20)]">
            {isActive ? "Pågår nå" : "Neste økt"}
          </h2>

          <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(86,39,26,0.10)] sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm text-[color:rgb(113,91,83)]">
                  {fmtOslo(new Date(session.starts_at))}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-[color:rgba(163,50,31,0.12)] bg-[rgba(163,50,31,0.07)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:rgb(139,45,29)]">
                    {isActive ? "Åpen nå" : "Kommer opp"}
                  </span>
                </div>
                <div className="mt-4 text-3xl font-semibold tracking-tight text-[color:rgb(37,26,20)]">
                  {fmtTime(new Date(session.starts_at))}–{fmtTime(new Date(session.ends_at))}
                </div>
                <div className="mt-3 text-sm">
                  <span className="text-[color:rgb(113,91,83)]">Sted: </span>
                  <span className="font-medium">{session.location}</span>
                </div>
              </div>

              <div className="min-w-[180px] rounded-[1.5rem] border border-[color:rgba(19,60,67,0.10)] bg-[linear-gradient(180deg,rgba(240,247,246,0.95),rgba(227,240,238,0.92))] px-5 py-4 text-sm">
                <div className="font-semibold text-[color:rgb(24,60,56)]">{spotsLeft} plasser igjen</div>
                <div className="mt-1 text-[color:rgb(85,109,106)]">
                  {registered.length}/{session.capacity} påmeldt
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {registered.slice(0, 20).map((p) => (
                <span
                  key={p.name}
                  className="rounded-full border border-[color:rgba(37,26,20,0.08)] bg-[color:rgba(252,245,241,0.92)] px-3 py-1 text-sm text-[color:rgb(66,48,42)] shadow-[0_8px_20px_rgba(86,39,26,0.06)]"
                >
                  {p.name}
                </span>
              ))}
              {registered.length === 0 && (
                <span className="text-sm text-[color:rgb(113,91,83)]">Ingen påmeldte enda.</span>
              )}
            </div>

            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex rounded-full bg-[color:rgb(24,60,56)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(24,60,56,0.22)] transition hover:-translate-y-0.5 hover:bg-[color:rgb(19,52,49)]"
              >
                Påmelding
              </Link>
            </div>
          </div>
        </div>

        <aside className="space-y-3">
          <h2 className="text-xl font-semibold text-[color:rgb(37,26,20)]">Info</h2>
          <div className="space-y-3 rounded-[1.75rem] border border-white/70 bg-white/90 p-6 text-sm shadow-[0_18px_50px_rgba(86,39,26,0.10)]">
            <div className="text-[color:rgb(113,91,83)]">Sted</div>
            <div className="font-medium">Dragvoll Idrettssenter 2. etasje gymsal</div>
            <div className="pt-2 text-[color:rgb(113,91,83)]">Nivå</div>
            <div>Alle nivåer er velkommen, fra nybegynner til erfaren.</div>
            <div className="pt-2 text-[color:rgb(113,91,83)]">Ta med</div>
            <div>Innesko, treningstøy og gjerne egen racket hvis du har.</div>
          </div>
        </aside>
      </section>
    </div>
  );
}
