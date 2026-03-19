"use client";

import { getIntlLocale } from "@/lib/site-content";
import { useSitePreferences } from "@/app/components/SitePreferencesProvider";
import VenueLink from "@/app/components/VenueLink";

type Session = {
  id: number;
  starts_at: string;
  ends_at: string;
  location: string;
  capacity: number;
  current_time: string;
};

export default function SchedulePageContent({ sessions }: { sessions: Session[] }) {
  const { locale, messages } = useSitePreferences();
  const intlLocale = getIntlLocale(locale);

  const formatter = new Intl.DateTimeFormat(intlLocale, {
    timeZone: "Europe/Oslo",
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <span className="app-badge app-badge-accent">{messages.schedule.badge}</span>
        <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--text-strong)]">
          {messages.schedule.title}
        </h1>
        <p className="max-w-2xl text-[color:var(--text-muted)]">{messages.schedule.body}</p>
      </div>

      <div className="app-surface p-6">
        <div className="text-sm text-[color:var(--text-soft)]">{messages.schedule.tableTitle}</div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[color:var(--text-soft)]">
              <tr className="border-b border-[color:var(--border-muted)]">
                <th className="py-2 pr-3">{messages.schedule.when}</th>
                <th className="py-2 pr-3">{messages.schedule.status}</th>
                <th className="py-2 pr-3">{messages.schedule.location}</th>
                <th className="py-2">{messages.schedule.capacity}</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const now = new Date(session.current_time).getTime();
                const isActive =
                  new Date(session.starts_at).getTime() <= now &&
                  new Date(session.ends_at).getTime() > now;

                return (
                  <tr key={session.id} className="border-b border-[color:var(--border-muted)] last:border-0">
                    <td className="py-3 pr-3 font-medium">
                      {formatter.format(new Date(session.starts_at))}
                    </td>
                    <td className="py-3 pr-3">
                      <span className={isActive ? "app-badge app-badge-success" : "app-badge app-badge-accent"}>
                        {isActive ? messages.schedule.active : messages.schedule.upcoming}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <VenueLink
                        locale={locale}
                        location={session.location}
                        className="text-[color:var(--accent)] hover:underline"
                        textClassName="font-medium"
                        showMazeMapBadge
                      />
                    </td>
                    <td className="py-3 text-[color:var(--text-soft)]">{session.capacity}</td>
                  </tr>
                );
              })}

              {sessions.length === 0 && (
                <tr>
                  <td className="py-6 text-[color:var(--text-soft)]" colSpan={4}>
                    {messages.schedule.empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
