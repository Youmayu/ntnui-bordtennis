import { unstable_noStore as noStore } from "next/cache";
import { pool } from "@/lib/db";

type AnnouncementRow = {
  id: number;
  title: string;
  body: string;
  expires_at: string | null;
};

function fmtOslo(dt: Date) {
  return new Intl.DateTimeFormat("no-NO", {
    timeZone: "Europe/Oslo",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dt);
}

export default async function AnnouncementBar() {
  noStore();

  const res = await pool
    .query(
      `SELECT id, title, body, expires_at
       FROM announcements
       WHERE expires_at IS NULL OR expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 5`
    )
    .catch(() => ({ rows: [] }));

  const announcements = res.rows as AnnouncementRow[];

  if (announcements.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-[color:rgba(163,50,31,0.10)] bg-[linear-gradient(180deg,rgba(255,241,235,0.98),rgba(255,246,241,0.96))]">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[color:rgba(163,50,31,0.16)] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[color:rgb(139,45,29)]">
            Viktige beskjeder
          </span>
        </div>

        <div className="mt-4 grid gap-3">
          {announcements.map((announcement) => (
            <article
              key={announcement.id}
              className="rounded-[1.25rem] border border-[color:rgba(163,50,31,0.10)] bg-white/88 px-4 py-4 shadow-[0_12px_28px_rgba(163,50,31,0.08)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-[color:rgb(88,42,30)]">
                    {announcement.title}
                  </h2>
                  <p className="mt-1 whitespace-pre-line text-sm text-[color:rgb(94,77,70)]">
                    {announcement.body}
                  </p>
                </div>

                {announcement.expires_at && (
                  <div className="text-xs font-medium text-[color:rgb(113,91,83)]">
                    Til {fmtOslo(new Date(announcement.expires_at))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
