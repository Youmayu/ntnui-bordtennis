import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TournamentPageContent from "@/app/components/TournamentPageContent";
import { isLocale } from "@/lib/site-content";

// Deliberately absent from public navigation and the sitemap.
export const metadata: Metadata = {
  title: "Tournament team | NTNUI Bordtennis",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function LocalizedTournamentPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <TournamentPageContent />;
}
