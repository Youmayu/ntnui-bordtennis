import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pool } from "@/lib/db";
import HomePageContent from "@/app/components/HomePageContent";
import {
  getMessages,
  getVenueLabel,
  isLocale,
  type Locale,
} from "@/lib/site-content";
import { createPageMetadata, getLocalizedHomeStructuredData } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SessionRow = {
  id: number;
  starts_at: string;
  ends_at: string;
  location: string;
  capacity: number;
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
  const nextSessionRes = await pool.query(
    `SELECT id, starts_at, ends_at, location, capacity, NOW() AS current_time
     FROM sessions
     WHERE ends_at > NOW()
     ORDER BY starts_at ASC
     LIMIT 1`
  );

  const session = (nextSessionRes.rows[0] as SessionRow | undefined) ?? null;

  if (!session) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <HomePageContent session={null} registeredNames={[]} />
      </>
    );
  }

  const regsRes = await pool.query(
    `SELECT name
     FROM registrations
     WHERE session_id = $1
     ORDER BY created_at ASC`,
    [session.id]
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomePageContent
        session={session}
        registeredNames={(regsRes.rows as { name: string }[]).map((row) => row.name)}
      />
    </>
  );
}
