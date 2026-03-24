"use client";

import {
  normalizeMultilineDisplay,
  normalizeSingleLineDisplay,
} from "@/lib/input-safety";
import { getIntlLocale } from "@/lib/site-content";
import { useSitePreferences } from "@/app/components/SitePreferencesProvider";

type Announcement = {
  id: number;
  title: string;
  body: string;
  expires_at: string | null;
};

export default function AnnouncementBarContent({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const { locale, messages } = useSitePreferences();

  if (announcements.length === 0) {
    return null;
  }

  return (
    <section className="app-announcement-shell">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="app-badge app-badge-accent">{messages.announcements.heading}</span>
        </div>

        <div className="mt-4 grid gap-3">
          {announcements.map((announcement) => {
            const expiresAtLabel = announcement.expires_at
              ? new Intl.DateTimeFormat(getIntlLocale(locale), {
                  timeZone: "Europe/Oslo",
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(announcement.expires_at))
              : null;

            return (
              <article key={announcement.id} className="app-announcement-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-[color:var(--accent-ink)]">
                      {normalizeSingleLineDisplay(announcement.title)}
                    </h2>
                    <p className="mt-1 whitespace-pre-line text-sm text-[color:var(--text-muted)]">
                      {normalizeMultilineDisplay(announcement.body)}
                    </p>
                  </div>

                  {expiresAtLabel && (
                    <div className="text-xs font-medium text-[color:var(--text-soft)]">
                      {messages.announcements.until(expiresAtLabel)}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
