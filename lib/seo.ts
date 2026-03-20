import type { Metadata } from "next";
import {
  DEFAULT_LOCALE,
  LOCALE_INFO,
  localizePathname,
  type Locale,
} from "@/lib/site-content";

const SITE_NAME_NO = "NTNUI Bordtennis";
const SITE_NAME_EN = "NTNUI Table Tennis";

export const SITE_TITLE = `${SITE_NAME_NO} | ${SITE_NAME_EN}`;
export const SITE_DESCRIPTION =
  "Påmelding, timeplan og informasjon for NTNUI Bordtennis (NTNUI Table Tennis) ved Dragvoll Idrettssenter B217 i Trondheim.";

const BASE_KEYWORDS = [
  "NTNUI Bordtennis",
  "NTNUI Table Tennis",
  "bordtennis Trondheim",
  "table tennis Trondheim",
  "NTNU table tennis",
  "NTNU bordtennis",
  "Dragvoll Idrettssenter B217",
  "Dragvoll Sports Centre B217",
  "bordtennis trening",
  "table tennis practice",
];

const OPEN_GRAPH_LOCALE_BY_LOCALE: Record<Locale, string> = {
  no: "no_NO",
  en: "en_US",
  da: "da_DK",
  sv: "sv_SE",
  de: "de_DE",
  zh: "zh_CN",
  fr: "fr_FR",
  es: "es_ES",
};

function normalizeSiteUrl(value: string | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.endsWith("/") ? withProtocol : `${withProtocol}/`;
}

export function getSiteUrl() {
  return (
    normalizeSiteUrl(process.env.SITE_URL) ??
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    "http://localhost:3000/"
  );
}

export function getSiteUrlObject() {
  return new URL(getSiteUrl());
}

export function getSiteOrigin() {
  return getSiteUrlObject().origin;
}

export function getAbsoluteUrl(path = "/") {
  return new URL(path, getSiteUrlObject()).toString();
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function buildSocialTitle(title: string) {
  return title === SITE_TITLE || title.includes("NTNUI") ? title : `${title} | ${SITE_NAME_NO}`;
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  locale,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  locale?: Locale;
}): Metadata {
  const canonicalPath = locale ? localizePathname(path, locale) : path;
  const canonical = getAbsoluteUrl(canonicalPath);
  const socialTitle = buildSocialTitle(title);
  const alternateLanguages = locale
    ? Object.fromEntries(
        (Object.keys(LOCALE_INFO) as Locale[]).map((entryLocale) => [
          entryLocale,
          getAbsoluteUrl(localizePathname(path, entryLocale)),
        ])
      )
    : undefined;

  return {
    title,
    description,
    keywords: [...BASE_KEYWORDS, ...keywords],
    alternates: {
      canonical,
      languages: alternateLanguages
        ? {
            ...alternateLanguages,
            "x-default": getAbsoluteUrl(localizePathname(path, DEFAULT_LOCALE)),
          }
        : undefined,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: socialTitle,
      description,
      siteName: SITE_TITLE,
      locale: locale ? OPEN_GRAPH_LOCALE_BY_LOCALE[locale] : OPEN_GRAPH_LOCALE_BY_LOCALE.no,
      alternateLocale: (Object.entries(OPEN_GRAPH_LOCALE_BY_LOCALE) as [Locale, string][])
        .filter(([entryLocale]) => entryLocale !== (locale ?? DEFAULT_LOCALE))
        .map(([, value]) => value),
    },
    twitter: {
      card: "summary",
      title: socialTitle,
      description,
    },
  };
}

export function getRootMetadata(): Metadata {
  return {
    metadataBase: getSiteUrlObject(),
    applicationName: SITE_TITLE,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    keywords: BASE_KEYWORDS,
    openGraph: {
      type: "website",
      url: getAbsoluteUrl(localizePathname("/", DEFAULT_LOCALE)),
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      siteName: SITE_TITLE,
      locale: OPEN_GRAPH_LOCALE_BY_LOCALE.no,
      alternateLocale: (Object.values(OPEN_GRAPH_LOCALE_BY_LOCALE)).filter(
        (value) => value !== OPEN_GRAPH_LOCALE_BY_LOCALE.no
      ),
    },
    twitter: {
      card: "summary",
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    category: "sports",
    creator: SITE_NAME_NO,
    publisher: SITE_NAME_NO,
    referrer: "origin-when-cross-origin",
    formatDetection: {
      telephone: false,
    },
    verification: process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : undefined,
  };
}

export function getLocalizedHomeStructuredData(locale: Locale) {
  const siteUrl = getSiteUrl();
  const homeUrl = getAbsoluteUrl(localizePathname("/", locale));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}#organization`,
        name: SITE_NAME_NO,
        alternateName: SITE_NAME_EN,
        url: siteUrl,
        description: SITE_DESCRIPTION,
        knowsAbout: ["Bordtennis", "Table tennis"],
      },
      {
        "@type": "WebSite",
        "@id": `${homeUrl}#website`,
        url: homeUrl,
        name: SITE_NAME_NO,
        alternateName: SITE_NAME_EN,
        description: SITE_DESCRIPTION,
        inLanguage: LOCALE_INFO[locale].htmlLang,
        publisher: {
          "@id": `${siteUrl}#organization`,
        },
      },
    ],
  };
}
