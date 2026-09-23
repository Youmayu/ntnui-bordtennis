"use client";

import { getIntlLocale, getSessionAccessLabel } from "@/lib/site-content";
import { useSitePreferences } from "@/app/components/SitePreferencesProvider";
import VenueLink from "@/app/components/VenueLink";
import { getRegistrationCopy } from "@/lib/registration-content";
import type { UpcomingSession } from "@/lib/sessions";
import { useUpcomingSessions } from "@/app/components/useUpcomingSessions";
import TournamentReservationNotice from "@/app/components/TournamentReservationNotice";
import { getTournamentCopy } from "@/lib/tournament-content";
import ScheduleSessionRoster from "@/app/components/ScheduleSessionRoster";

export default function SchedulePageContent({ sessions: initialSessions }: { sessions: UpcomingSession[] }) {
  const { sessions, error } = useUpcomingSessions(initialSessions);
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
        {error && <p role="alert" className="app-alert-error">{getRegistrationCopy(locale).loadError}</p>}
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
                            {isActive && (
                              <span className="app-badge app-badge-success">
                                {messages.schedule.active}
                              </span>
                            )}
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
                                session.available_spots === 0
                                  ? "app-badge app-capacity-full"
                                  : "app-badge app-badge-success"
                              }
                            >
                              {session.confirmed_count}/{session.capacity}
                              {session.available_spots === 0 && ` · ${session.reserved_count > 0 ? getTournamentCopy(locale).publicFull : getRegistrationCopy(locale).fullTitle}`}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <TournamentReservationNotice availability={session} />
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
                    <ScheduleSessionRoster
                      session={session}
                      sessionLabel={formatter.format(new Date(session.starts_at))}
                    />
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
