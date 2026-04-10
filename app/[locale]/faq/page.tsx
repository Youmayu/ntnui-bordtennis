import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FaqPageContent from "@/app/components/FaqPageContent";
import { getFaqContent } from "@/lib/faq-content";
import { createPageMetadata } from "@/lib/seo";
import { VENUE_LABEL, getMessages, isLocale, type Locale } from "@/lib/site-content";

function getMetadata(locale: Locale): Metadata {
  const messages = getMessages(locale);
  const faq = getFaqContent(locale);

  return createPageMetadata({
    locale,
    title: `${faq.title} | ${messages.shell.brand}`,
    description: `${faq.intro} ${VENUE_LABEL}.`,
    path: "/faq",
    keywords: ["NTNUI bordtennis FAQ", "NTNUI table tennis FAQ", "NTNUI bordtennis medlemskap"],
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

export default async function LocalizedFaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <FaqPageContent locale={locale} />;
}
