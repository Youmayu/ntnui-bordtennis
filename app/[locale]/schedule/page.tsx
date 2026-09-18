import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SchedulePageContent from "@/app/components/SchedulePageContent";
import { getMessages, getVenueLabel, isLocale, type Locale } from "@/lib/site-content";
import { createPageMetadata } from "@/lib/seo";
import { getUpcomingSessions } from "@/lib/sessions";

export const dynamic = "force-dynamic";

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

  return <SchedulePageContent sessions={await getUpcomingSessions()} />;
}
