import type { Metadata } from "next";
import UnregisterPageContent from "@/app/components/UnregisterPageContent";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Avmelding / Unregister",
  description:
    "Meld deg av trening hos NTNUI Bordtennis og NTNUI Table Tennis med en enkel selvbetjent avmelding.",
  path: "/unregister",
  keywords: ["avmelding bordtennis", "unregister table tennis"],
});

export default function UnregisterPage() {
  return <UnregisterPageContent />;
}
