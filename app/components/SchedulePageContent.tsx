"use client";

import { getIntlLocale, getSessionAccessLabel } from "@/lib/site-content";
import { useSitePreferences } from "@/app/components/SitePreferencesProvider";
import VenueLink from "@/app/components/VenueLink";

type Session = {
  id: number;
  starts_at: string;
  ends_at: string;
  location: string;
  capacity: number;
  members_only: boolean;
  registered_count: number;
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
  const weekdayFormatter = new Intl.DateTimeFormat(intlLocale, {
    timeZone: "Europe/Oslo",
    weekday: "long",
  });
  const dayFormatter = new Intl.DateTimeFormat(intlLocale, {
    timeZone: "Europe/Oslo",
    day: "2-digit",
  });
  const monthFormatter = new Intl.DateTimeFormat(intlLocale, {
    timeZone: "Europe/Oslo",
    month: "short",
  });
  const timeFormatter = new Intl.DateTimeFormat(intlLocale, {
    timeZone: "Europe/Oslo",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-8">
      <section className="app-hero overflow-hidden p-8 sm:p-10">
        <span className="app-badge app-badge-accent">{messages.schedule.badge}</span>
        <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--text-strong)]">
          {messages.schedule.title}
        </h1>
        <p className="mt-4 max-w-2xl text-[color:var(--text-muted)]">{messages.schedule.body}</p>
      </section>

      <section className="space-y-4">
        <div className="app-panel-eyebrow">{messages.schedule.tableTitle}</div>

        <div className="app-surface app-schedule-board overflow-hidden p-0">
          {sessions.length === 0 ? (
            <div className="p-6 text-[color:var(--text-soft)]">{messages.schedule.empty}</div>
          ) : (
            <div className="app-schedule-list">
              {sessions.map((session) => {
                const now = new Date(session.current_time).getTime();
                const isActive =
                  new Date(session.starts_at).getTime() <= now &&
                  new Date(session.ends_at).getTime() > now;

                return (
                  <article key={session.id} className="app-schedule-row p-5 sm:p-6">
                    <div className="app-schedule-item">
                      <div className="app-schedule-dateblock">
                        <div className="app-schedule-day">{dayFormatter.format(new Date(session.starts_at))}</div>
                        <div className="app-schedule-month">{monthFormatter.format(new Date(session.starts_at))}</div>
                        <div className="app-schedule-weekday">{weekdayFormatter.format(new Date(session.starts_at))}</div>
                      </div>

                      <div className="app-schedule-content">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <div className="app-schedule-time">
                              {timeFormatter.format(new Date(session.starts_at))}
                              {" - "}
                              {timeFormatter.format(new Date(session.ends_at))}
                            </div>
                            <div className="app-schedule-meta">{formatter.format(new Date(session.starts_at))}</div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span className={isActive ? "app-badge app-badge-success" : "app-badge app-badge-accent"}>
                              {isActive ? messages.schedule.active : messages.schedule.upcoming}
                            </span>
                            <span
                              className={
                                session.members_only
                                  ? "app-badge app-badge-neutral"
                                  : "app-badge app-badge-success"
                              }
                            >
                              {getSessionAccessLabel(locale, session.members_only)}
                            </span>
                            <span
                              className={
                                session.registered_count >= session.capacity
                                  ? "app-badge app-badge-danger"
                                  : "app-badge app-badge-success"
                              }
                            >
                              {session.registered_count}/{session.capacity}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <VenueLink
                            locale={locale}
                            location={session.location}
                            className="text-[color:var(--accent)] hover:underline"
                            textClassName="font-medium"
                            showMazeMapBadge
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
