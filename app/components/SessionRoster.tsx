"use client";

import { useId } from "react";
import { useSitePreferences } from "@/app/components/SitePreferencesProvider";
import { getRegistrationCopy } from "@/lib/registration-content";
import { getIntlLocale } from "@/lib/site-content";
import { REGISTRATION_STATUS, type PublicRegistration } from "@/lib/registrations";

export default function SessionRoster({
  registrations,
  capacity,
  error,
  updatedAt,
}: {
  registrations: PublicRegistration[] | null;
  capacity: number;
  error: boolean;
  updatedAt: string | null;
}) {
  const { locale, messages } = useSitePreferences();
  const copy = getRegistrationCopy(locale);
  const id = useId();
  const confirmed = registrations?.filter((entry) => entry.status === REGISTRATION_STATUS.CONFIRMED) ?? [];
  const waitlist = registrations?.filter((entry) => entry.status === REGISTRATION_STATUS.WAITLIST) ?? [];
  const isFull = confirmed.length >= capacity;

  return (
    <div className="app-session-roster">
      {updatedAt && (
        <p className="mb-4 text-xs text-[color:var(--text-soft)]">
          {copy.lastUpdated}{" "}
          <time dateTime={updatedAt}>
            {new Intl.DateTimeFormat(getIntlLocale(locale), {
              dateStyle: "short",
              timeStyle: "medium",
              timeZone: "Europe/Oslo",
            }).format(new Date(updatedAt))}
          </time>
        </p>
      )}
      {registrations && (
        <div className="mb-4 flex flex-wrap gap-2 md:hidden">
          <a className={`app-badge ${isFull ? "app-capacity-full" : "app-badge-success"} min-h-11 underline underline-offset-4`} href={`#${id}-confirmed-panel`}>
            {copy.confirmed} · {confirmed.length}/{capacity} ↓
          </a>
          <a className="app-badge app-badge-accent min-h-11 underline underline-offset-4" href={`#${id}-waitlist-panel`}>
            {copy.waitlist} · {waitlist.length} ↓
          </a>
        </div>
      )}
      {error && <p role="alert" className="app-alert-error mb-4">{copy.loadError}</p>}
      {!registrations && !error && <p role="status" className="py-4">{copy.loading}</p>}
      {registrations && (
        <div className="app-roster-panels">
          {[
            { key: "confirmed", title: copy.confirmed, help: copy.confirmedHelp, entries: confirmed, empty: messages.home.nobodyRegistered, count: `${confirmed.length}/${capacity}` },
            { key: "waitlist", title: copy.waitlist, help: copy.waitlistHelp, entries: waitlist, empty: copy.emptyWaitlist, count: waitlist.length },
          ].map((group) => (
            <section key={group.key} id={`${id}-${group.key}-panel`} className={`app-roster-panel app-roster-${group.key}`} aria-labelledby={`${id}-${group.key}`}>
              <div className="app-roster-panel-heading">
                <h3 id={`${id}-${group.key}`} className="font-semibold">{group.title}</h3>
                <span className={`app-badge ${group.key === "confirmed" ? (isFull ? "app-capacity-full" : "app-badge-success") : "app-badge-accent"}`}>
                  {group.count}
                  {group.key === "confirmed" && isFull && ` · ${copy.fullTitle}`}
                </span>
              </div>
              <p className="app-roster-help">{group.help}</p>
              {group.entries.length === 0 ? (
                <p className="app-roster-empty">{group.empty}</p>
              ) : (
                <ol className="app-roster-grid" role="list">
                  {group.entries.map((registration, index) => (
                    <li key={registration.id} className="app-roster-row">
                      <span className="app-roster-index" aria-hidden="true">{index + 1}</span>
                      <span className="app-roster-name">{registration.name}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
