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
  current_time: string;
};

export default async function SchedulePage() {
  const res = await pool.query(
    `SELECT id, starts_at, ends_at, location, capacity, NOW() AS current_time
     FROM sessions
     WHERE ends_at > NOW()
     ORDER BY starts_at ASC
     LIMIT 12`
  );

  return <SchedulePageContent sessions={res.rows as SessionRow[]} />;
}
