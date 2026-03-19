import type { Metadata } from "next";
import AboutPageContent from "@/app/components/AboutPageContent";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Om oss / About",
  description:
    "Kontaktinformasjon og praktisk informasjon for NTNUI Bordtennis og NTNUI Table Tennis ved Dragvoll Idrettssenter B217.",
  path: "/about",
  keywords: ["NTNUI bordtennis kontakt", "NTNUI table tennis contact"],
});

export default function AboutPage() {
  return <AboutPageContent />;
}
