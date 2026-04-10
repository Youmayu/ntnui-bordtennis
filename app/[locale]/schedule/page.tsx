import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ensureAutoScheduledSessions } from "@/lib/auto-schedule";
import { pool } from "@/lib/db";
import SchedulePageContent from "@/app/components/SchedulePageContent";
import { getMessages, getVenueLabel, isLocale, type Locale } from "@/lib/site-content";
import { getMembersOnlySelectSql, getSessionAccessSchema } from "@/lib/session-access";
import { createPageMetadata } from "@/lib/seo";
import { REGISTRATION_STATUS } from "@/lib/registrations";

export const dynamic = "force-dynamic";

type SessionRow = {
  id: number;
  starts_at: string;
  ends_at: string;
  location: string;
  capacity: number;
  members_only: boolean;
  registered_count: number;
  current_time: string;
};

function getMetadata(locale: Locale): Metadata {
  const messages = getMessages(locale);

  return createPageMetadata({
    locale,
    title: `${messages.shell.nav.schedule} | ${messages.shell.brand}`,
    description: `${messages.schedule.title}. ${getVenueLabel(locale)}.`,
    path: "/schedule",
    keywords: ["NTNUI bordtennis timeplan", "NTNUI table tennis schedule"],
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  return getMetadata(locale);
}

export default async function LocalizedSchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  await ensureAutoScheduledSessions().catch(() => {});
  const accessSchema = await getSessionAccessSchema(pool);
  const res = await pool.query(
    `SELECT
       s.id,
       s.starts_at,
       s.ends_at,
       s.location,
       s.capacity,
       ${getMembersOnlySelectSql(accessSchema.hasSessionMembersOnly, "s")} AS members_only,
       COALESCE(reg_counts.registered_count, 0) AS registered_count,
       NOW() AS current_time
     FROM sessions s
     LEFT JOIN (
       SELECT session_id, COUNT(*)::int AS registered_count
       FROM registrations
       WHERE status = $1
       GROUP BY session_id
     ) reg_counts
       ON reg_counts.session_id = s.id
     WHERE s.ends_at > NOW()
     ORDER BY s.starts_at ASC
     LIMIT 12`,
    [REGISTRATION_STATUS.CONFIRMED]
  );

  return <SchedulePageContent sessions={res.rows as SessionRow[]} />;
}
