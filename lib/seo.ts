import type { Metadata } from "next";

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

export function getAbsoluteUrl(path = "/") {
  return new URL(path, getSiteUrlObject()).toString();
}

function buildSocialTitle(title: string) {
  return title === SITE_TITLE ? SITE_TITLE : `${title} | ${SITE_NAME_NO}`;
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const canonical = getAbsoluteUrl(path);
  const socialTitle = buildSocialTitle(title);

  return {
    title,
    description,
    keywords: [...BASE_KEYWORDS, ...keywords],
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: socialTitle,
      description,
      siteName: SITE_TITLE,
      locale: "no_NO",
      alternateLocale: ["en_US", "zh_CN", "fr_FR", "es_ES"],
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
    title: {
      default: SITE_TITLE,
      template: "%s | NTNUI Bordtennis",
    },
    description: SITE_DESCRIPTION,
    keywords: BASE_KEYWORDS,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      url: getAbsoluteUrl("/"),
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      siteName: SITE_TITLE,
      locale: "no_NO",
      alternateLocale: ["en_US", "zh_CN", "fr_FR", "es_ES"],
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

export function getHomeStructuredData() {
  const siteUrl = getSiteUrl();

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
        "@id": `${siteUrl}#website`,
        url: siteUrl,
        name: SITE_NAME_NO,
        alternateName: SITE_NAME_EN,
        description: SITE_DESCRIPTION,
        inLanguage: ["no", "en", "zh", "fr", "es"],
        publisher: {
          "@id": `${siteUrl}#organization`,
        },
      },
    ],
  };
}
