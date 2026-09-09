import { LEGAL_EN, LEGAL_NO, LEGAL_PAGE_SLUGS, type LegalPageSlug } from "@/lib/legal-content";
import { LEGAL_TRANSLATIONS } from "@/lib/legal-translations";
import type { Locale } from "@/lib/site-content";

export function getLegalCopy(locale: Locale) {
  if (locale === "no") return LEGAL_NO;
  if (locale === "en") return LEGAL_EN;
  return LEGAL_TRANSLATIONS[locale];
}

export function isLegalPageSlug(value: string): value is LegalPageSlug {
  return LEGAL_PAGE_SLUGS.some((slug) => slug === value);
}
