import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import AnnouncementBar from "@/app/components/AnnouncementBar";
import SiteFooter from "@/app/components/SiteFooter";
import SiteHeader from "@/app/components/SiteHeader";
import SitePreferencesProvider from "@/app/components/SitePreferencesProvider";
import { getRootMetadata } from "@/lib/seo";
import {
  LANGUAGE_COOKIE,
  LOCALE_INFO,
  THEME_COOKIE,
  parseLocale,
  parseTheme,
} from "@/lib/site-content";

export const metadata: Metadata = getRootMetadata();

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = parseLocale(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const theme = parseTheme(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <html
      lang={LOCALE_INFO[locale].htmlLang}
      data-theme={theme}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground">
        <SitePreferencesProvider initialLocale={locale} initialTheme={theme}>
          <SiteHeader />
          <AnnouncementBar />
          <main className="mx-auto max-w-6xl px-4 py-10 sm:py-12">{children}</main>
          <SiteFooter />
        </SitePreferencesProvider>
      </body>
    </html>
  );
}
