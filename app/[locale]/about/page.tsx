import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AboutPageContent from "@/app/components/AboutPageContent";
import { getMessages, getVenueLabel, isLocale, type Locale } from "@/lib/site-content";
import { createPageMetadata } from "@/lib/seo";

function getMetadata(locale: Locale): Metadata {
  const messages = getMessages(locale);

  return createPageMetadata({
    locale,
    title: `${messages.shell.nav.about} | ${messages.shell.brand}`,
    description: `${messages.about.title}. ${getVenueLabel(locale)}.`,
    path: "/about",
    keywords: ["NTNUI bordtennis kontakt", "NTNUI table tennis contact"],
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

export default async function LocalizedAboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <AboutPageContent />;
}
