import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalPageContent from "@/app/components/LegalPageContent";
import { getLegalCopy, isLegalPageSlug } from "@/lib/legal";
import { createPageMetadata } from "@/lib/seo";
import { isLocale } from "@/lib/site-content";

type PageProps = { params: Promise<{ locale: string; legalPage: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, legalPage } = await params;
  if (!isLocale(locale) || !isLegalPageSlug(legalPage)) return {};

  const copy = getLegalCopy(locale).pages[legalPage];
  return createPageMetadata({ locale, title: copy.title, description: copy.description, path: `/${legalPage}` });
}

export default async function LocalizedLegalPage({ params }: PageProps) {
  const { locale, legalPage } = await params;
  if (!isLocale(locale) || !isLegalPageSlug(legalPage)) notFound();

  return <LegalPageContent locale={locale} page={legalPage} />;
}
