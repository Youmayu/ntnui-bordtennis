import { pool } from "@/lib/db";
import SchedulePageContent from "@/app/components/SchedulePageContent";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = createPageMetadata({
  title: "Timeplan / Schedule",
  description:
    "Se aktive og kommende bordtennisøkter for NTNUI Bordtennis og NTNUI Table Tennis ved Dragvoll Idrettssenter B217.",
  path: "/schedule",
  keywords: ["NTNUI bordtennis timeplan", "NTNUI table tennis schedule"],
});

type SessionRow = {
  id: number;
  starts_at: string;
  ends_at: string;
  location: string;
  capacity: number;
  registered_count: number;
  current_time: string;
};

export default async function SchedulePage() {
  const res = await pool.query(
    `SELECT
       s.id,
       s.starts_at,
       s.ends_at,
       s.location,
       s.capacity,
       COALESCE(reg_counts.registered_count, 0) AS registered_count,
       NOW() AS current_time
     FROM sessions s
     LEFT JOIN (
       SELECT session_id, COUNT(*)::int AS registered_count
       FROM registrations
       GROUP BY session_id
     ) reg_counts
       ON reg_counts.session_id = s.id
     WHERE s.ends_at > NOW()
     ORDER BY s.starts_at ASC
     LIMIT 12`
  );

  return <SchedulePageContent sessions={res.rows as SessionRow[]} />;
}
