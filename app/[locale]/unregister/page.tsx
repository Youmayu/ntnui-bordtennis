import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UnregisterPageContent from "@/app/components/UnregisterPageContent";
import { getMessages, getVenueLabel, isLocale, type Locale } from "@/lib/site-content";
import { createPageMetadata } from "@/lib/seo";

function getMetadata(locale: Locale): Metadata {
  const messages = getMessages(locale);

  return createPageMetadata({
    locale,
    title: `${messages.shell.nav.unregister} | ${messages.shell.brand}`,
    description: `${messages.unregister.title}. ${getVenueLabel(locale)}.`,
    path: "/unregister",
    keywords: ["avmelding bordtennis", "unregister table tennis"],
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

export default async function LocalizedUnregisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <UnregisterPageContent />;
}
