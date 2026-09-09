"use client";

import { useSitePreferences } from "@/app/components/SitePreferencesProvider";

export default function CookieSettingsButton({ children }: { children: React.ReactNode }) {
  const { openCookieSettings } = useSitePreferences();

  return (
    <button type="button" className="app-button-secondary app-legal-focus" onClick={openCookieSettings}>
      {children}
    </button>
  );
}
