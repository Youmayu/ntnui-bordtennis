import type { MetadataRoute } from "next";
import { getAbsoluteUrl } from "@/lib/seo";
import { LOCALE_INFO, localizePathname, type Locale } from "@/lib/site-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const locales = Object.keys(LOCALE_INFO) as Locale[];
  const publicPaths = [
    { path: "/", changeFrequency: "daily" as const, priority: 1 },
    { path: "/schedule", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/register", changeFrequency: "daily" as const, priority: 0.8 },
    { path: "/unregister", changeFrequency: "daily" as const, priority: 0.7 },
    { path: "/about", changeFrequency: "weekly" as const, priority: 0.6 },
  ];

  return locales.flatMap((locale) =>
    publicPaths.map((entry) => ({
      url: getAbsoluteUrl(localizePathname(entry.path, locale)),
      lastModified: now,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((entryLocale) => [
            entryLocale,
            getAbsoluteUrl(localizePathname(entry.path, entryLocale)),
          ])
        ),
      },
    }))
  );
}
