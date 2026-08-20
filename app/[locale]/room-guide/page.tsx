import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RoomGuidePageContent from "@/app/components/RoomGuidePageContent";
import { getRoomGuideContent } from "@/lib/room-guide-content";
import { createPageMetadata } from "@/lib/seo";
import { getMessages, isLocale, type Locale } from "@/lib/site-content";

function getMetadata(locale: Locale): Metadata {
  const messages = getMessages(locale);
  const guide = getRoomGuideContent(locale);

  return createPageMetadata({
    locale,
    title: `${guide.title} | ${messages.shell.brand}`,
    description: guide.intro,
    path: "/room-guide",
    keywords: [
      "NTNUI bordtennis rigging",
      "NTNUI table tennis room setup",
      "Dragvoll B217 bordtennis",
    ],
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

export default async function LocalizedRoomGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <RoomGuidePageContent locale={locale} />;
}
