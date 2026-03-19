"use client";

import { useSitePreferences } from "@/app/components/SitePreferencesProvider";
import VenueLink from "@/app/components/VenueLink";

export default function SiteFooter() {
  const { locale, messages } = useSitePreferences();

  return (
    <footer className="app-footer">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <VenueLink
            locale={locale}
            className="font-medium text-[color:var(--accent)] hover:underline"
            textClassName="font-medium text-[color:var(--accent)]"
            showMazeMapBadge
          />
        </div>
        <div>{messages.shell.footerCopyright(new Date().getFullYear())}</div>
      </div>
    </footer>
  );
}
