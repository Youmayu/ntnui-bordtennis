import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RegisterPageContent from "@/app/components/RegisterPageContent";
import { getMessages, getVenueLabel, isLocale, type Locale } from "@/lib/site-content";
import { createPageMetadata } from "@/lib/seo";

function getMetadata(locale: Locale): Metadata {
  const messages = getMessages(locale);

  return createPageMetadata({
    locale,
    title: `${messages.shell.nav.register} | ${messages.shell.brand}`,
    description: `${messages.register.title}. ${getVenueLabel(locale)}.`,
    path: "/register",
    keywords: ["påmelding bordtennis", "register table tennis"],
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

export default async function LocalizedRegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <RegisterPageContent />;
}
