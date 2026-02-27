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

function fmtTimeOslo(dt: Date) {
  return new Intl.DateTimeFormat("no-NO", {
    timeZone: "Europe/Oslo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dt);
}

// Reusable button styles (no globals.css needed)
const btnBase =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background";

const btnPrimary = `${btnBase} bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-[0.98]`;
const btnSecondary = `${btnBase} border border-border bg-background shadow-sm hover:bg-muted active:scale-[0.98]`;

export default async function HomePage() {
  const nextSessionRes = await pool.query(
    `SELECT id, starts_at, ends_at, location, capacity
     FROM sessions
     WHERE starts_at > NOW()
     ORDER BY starts_at ASC
     LIMIT 1`
  );

  const session = nextSessionRes.rows[0] as
    | { id: number; starts_at: string; ends_at: string; location: string; capacity: number }
    | undefined;

  if (!session) {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border bg-gradient-to-b from-muted/60 to-background p-8">
          <h1 className="text-3xl font-semibold tracking-tight">NTNUI Bordtennis</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Ingen kommende økter lagt inn enda.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link className={btnSecondary} href="/schedule">
              Se timeplan
            </Link>
          </div>
        </section>
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

  const starts = new Date(session.starts_at);
  const ends = new Date(session.ends_at);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-2xl border bg-gradient-to-b from-muted/60 to-background p-8">
        <h1 className="text-3xl font-semibold tracking-tight">NTNUI Bordtennis</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Enkel påmelding og oversikt over treninger ved{" "}
          <span className="font-medium text-foreground">Dragvoll Idrettssenter</span>.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/register" className="btn-primary">
            Meld deg på neste økt
          </Link>
          <Link href="/schedule" className="btn-secondary">
            Se timeplan
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {/* Next session */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-xl font-semibold">Neste økt</h2>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm text-muted-foreground">{fmtOslo(starts)}</div>

                <div className="mt-1 text-2xl font-semibold">
                  {fmtTimeOslo(starts)}–{fmtTimeOslo(ends)}
                </div>

                <div className="mt-2 text-sm">
                  <span className="text-muted-foreground">Sted: </span>
                  <span className="font-medium">{session.location}</span>
                </div>
              </div>

              <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm">
                <div className="font-medium">{spotsLeft} plasser igjen</div>
                <div className="text-muted-foreground">
                  {registered.length}/{session.capacity} påmeldt
                </div>
              </div>
            </div>

            {/* Registrations */}
            <div className="mt-6 flex flex-wrap gap-2">
              {registered.slice(0, 20).map((p, idx) => (
                <span
                  key={`${p.name}-${idx}`}
                  className="rounded-full border bg-background px-3 py-1 text-sm shadow-sm"
                >
                  {p.name}
                </span>
              ))}
              {registered.length === 0 && (
                <span className="text-sm text-muted-foreground">Ingen påmeldte enda.</span>
              )}
            </div>

            {/* CTA */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/register" className={btnPrimary}>
                Påmelding
              </Link>
              <Link href="/schedule" className={btnSecondary}>
                Se alle økter
              </Link>
            </div>
          </div>
        </div>

        {/* Info */}
        <aside className="space-y-3">
          <h2 className="text-xl font-semibold">Info</h2>

          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-3 text-sm">
            <div>
              <div className="text-muted-foreground">Sted</div>
              <div className="font-medium">Dragvoll Idrettssenter</div>
            </div>

            <div>
              <div className="text-muted-foreground">Nivå</div>
              <div>Alle nivåer velkommen.</div>
            </div>

            <div>
              <div className="text-muted-foreground">Ta med</div>
              <div>Innesko og evt. egen racket.</div>
            </div>

            <div className="pt-2">
              <Link href="/about" className={btnSecondary}>
                Om oss
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}