import type { MetadataRoute } from "next";
import { getAbsoluteUrl, getSiteOrigin } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin"],
    },
    sitemap: getAbsoluteUrl("/sitemap.xml"),
    host: getSiteOrigin(),
  };
}
