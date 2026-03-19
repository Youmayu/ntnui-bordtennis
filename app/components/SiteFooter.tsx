"use client";

import { useSitePreferences } from "@/app/components/SitePreferencesProvider";

export default function SiteFooter() {
  const { messages } = useSitePreferences();

  return (
    <footer className="app-footer">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-medium text-[color:var(--text-body)]">
            {messages.shell.footerLocation}
          </div>
        </div>
        <div>{messages.shell.footerCopyright(new Date().getFullYear())}</div>
      </div>
    </footer>
  );
}
