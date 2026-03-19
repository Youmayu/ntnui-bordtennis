import type { MetadataRoute } from "next";
import { getAbsoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: getAbsoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: getAbsoluteUrl("/schedule"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: getAbsoluteUrl("/register"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: getAbsoluteUrl("/unregister"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: getAbsoluteUrl("/about"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];
}
