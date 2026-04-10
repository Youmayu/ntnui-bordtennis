import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ensureAutoScheduledSessions } from "@/lib/auto-schedule";
import { pool } from "@/lib/db";
import HomePageContent from "@/app/components/HomePageContent";
import { normalizeSingleLineDisplay } from "@/lib/input-safety";
import { getMembersOnlySelectSql, getSessionAccessSchema } from "@/lib/session-access";
import {
  getMessages,
  getVenueLabel,
  isLocale,
  type Locale,
} from "@/lib/site-content";
import {
  createPageMetadata,
  getLocalizedHomeStructuredData,
  serializeJsonLd,
} from "@/lib/seo";
import { REGISTRATION_STATUS } from "@/lib/registrations";

export const dynamic = "force-dynamic";

type SessionRow = {
  id: number;
  starts_at: string;
  ends_at: string;
  location: string;
  capacity: number;
  members_only: boolean;
  current_time: string;
};

function getMetadata(locale: Locale): Metadata {
  const messages = getMessages(locale);

  return createPageMetadata({
    locale,
    title: messages.shell.brand,
    description: `${messages.home.heroTitle}. ${messages.home.heroBody} ${getVenueLabel(locale)}.`,
    path: "/",
    keywords: ["NTNUI trening", "bordtennis påmelding", "table tennis registration"],
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

export default async function LocalizedHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const structuredData = getLocalizedHomeStructuredData(locale);
  await ensureAutoScheduledSessions().catch(() => {});
  const accessSchema = await getSessionAccessSchema(pool);
  const nextSessionRes = await pool.query(
    `SELECT
       s.id,
       s.starts_at,
       s.ends_at,
       s.location,
       s.capacity,
       ${getMembersOnlySelectSql(accessSchema.hasSessionMembersOnly, "s")} AS members_only,
       NOW() AS current_time
     FROM sessions s
     WHERE s.ends_at > NOW()
     ORDER BY s.starts_at ASC
     LIMIT 1`
  );

  const session = (nextSessionRes.rows[0] as SessionRow | undefined) ?? null;

  if (!session) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
        />
        <HomePageContent session={null} registeredNames={[]} />
      </>
    );
  }

  const regsRes = await pool.query(
    `SELECT name
     FROM registrations
     WHERE session_id = $1
       AND status = $2
     ORDER BY created_at ASC`,
    [session.id, REGISTRATION_STATUS.CONFIRMED]
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <HomePageContent
        session={session}
        registeredNames={(regsRes.rows as { name: string }[]).map((row) =>
          normalizeSingleLineDisplay(row.name)
        )}
      />
    </>
  );
}
