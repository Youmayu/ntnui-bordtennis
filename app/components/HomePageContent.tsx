"use client";

import Image from "next/image";
import Link from "next/link";
import { getIntlLocale, getVenueLabel, localizePathname } from "@/lib/site-content";
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

export default function HomePageContent({
  session,
  registeredNames,
}: {
  session: Session | null;
  registeredNames: string[];
}) {
  const { locale, messages } = useSitePreferences();
  const intlLocale = getIntlLocale(locale);
  const venueLabel = getVenueLabel(locale);
  const scheduleHref = localizePathname("/schedule", locale);
  const registerHref = localizePathname("/register", locale);
  const unregisterHref = localizePathname("/unregister", locale);
  const hallImage = (
    <div className="app-photo-stage">
      <Image
        src="/images/website/treningshall.jpg"
        alt={`Training hall at ${venueLabel}`}
        width={2048}
        height={1152}
        priority
        sizes="(min-width: 1280px) 22rem, (min-width: 1024px) 18rem, 100vw"
        className="app-photo-image"
      />
    </div>
  );

  if (!session) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--text-strong)]">
          {messages.home.emptyTitle}
        </h1>
        <p className="text-[color:var(--text-muted)]">{messages.home.emptyBody}</p>
        <div className="max-w-3xl">{hallImage}</div>
        <Link className="app-button-secondary inline-flex" href={scheduleHref}>
          {messages.home.ctaSchedule}
        </Link>
      </div>
    );
  }

  const now = new Date(session.current_time).getTime();
  const isActive =
    new Date(session.starts_at).getTime() <= now &&
    new Date(session.ends_at).getTime() > now;
  const spotsLeft = Math.max(0, session.capacity - registeredNames.length);

  const dateFormatter = new Intl.DateTimeFormat(intlLocale, {
    timeZone: "Europe/Oslo",
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  const timeFormatter = new Intl.DateTimeFormat(intlLocale, {
    timeZone: "Europe/Oslo",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-10">
      <section className="app-hero overflow-hidden rounded-[2rem] p-8 sm:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="app-badge app-badge-neutral">{venueLabel}</span>
        </div>

        <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-[color:var(--text-strong)] sm:text-5xl">
          {messages.home.heroTitle}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--text-muted)]">
          {messages.home.heroBody}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={registerHref} className="app-button-success inline-flex items-center">
            {messages.home.ctaRegister}
          </Link>
          <Link href={unregisterHref} className="app-button-danger inline-flex items-center">
            {messages.shell.nav.unregister}
          </Link>
          <Link href={scheduleHref} className="app-button-secondary inline-flex items-center">
            {messages.home.ctaSchedule}
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <h2 className="text-xl font-semibold text-[color:var(--text-strong)]">
            {isActive ? messages.home.currentTitle : messages.home.nextTitle}
          </h2>

          <div className="app-surface p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm text-[color:var(--text-soft)]">
                  {dateFormatter.format(new Date(session.starts_at))}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className={isActive ? "app-badge app-badge-accent" : "app-badge app-badge-neutral"}>
                    {isActive ? messages.home.currentStatus : messages.home.nextStatus}
                  </span>
                </div>
                <div className="mt-4 text-3xl font-semibold tracking-tight text-[color:var(--text-strong)]">
                  {timeFormatter.format(new Date(session.starts_at))}
                  {" - "}
                  {timeFormatter.format(new Date(session.ends_at))}
                </div>
                <div className="mt-3 text-sm">
                  <span className="text-[color:var(--text-soft)]">
                    {messages.home.locationLabel}:{" "}
                  </span>
                  <VenueLink
                    locale={locale}
                    location={session.location}
                    className="font-medium text-[color:var(--accent)] hover:underline"
                    textClassName="font-medium"
                    showMazeMapBadge
                  />
                </div>
              </div>

              <div className="app-stat-card min-w-[180px] px-5 py-4 text-sm">
                <div className="font-semibold text-white">
                  {messages.home.spotsLeft(spotsLeft)}
                </div>
                <div className="mt-1 text-white/80">
                  {messages.home.registeredCount(registeredNames.length, session.capacity)}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-[color:var(--border-muted)] pt-6">
              {registeredNames.length === 0 ? (
                <span className="text-sm text-[color:var(--text-soft)]">
                  {messages.home.nobodyRegistered}
                </span>
              ) : (
                <div className="app-roster-grid">
                  {registeredNames.slice(0, 20).map((name, index) => (
                    <div key={`${name}-${index}`} className="app-roster-row">
                      <span className="app-roster-index">{String(index + 1).padStart(2, "0")}</span>
                      <span className="app-roster-name">{name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={registerHref} className="app-button-success inline-flex">
                {messages.home.ctaRegister}
              </Link>
              <Link href={unregisterHref} className="app-button-danger inline-flex">
                {messages.shell.nav.unregister}
              </Link>
            </div>
          </div>
        </div>

        <aside className="space-y-3">
          <h2 className="text-xl font-semibold text-[color:var(--text-strong)]">
            {messages.home.infoTitle}
          </h2>
          <div className="app-surface space-y-3 p-6 text-sm">
            <div className="text-[color:var(--text-soft)]">{messages.home.locationLabel}</div>
            <VenueLink
              locale={locale}
              className="font-medium text-[color:var(--accent)] hover:underline"
              textClassName="font-medium"
              showMazeMapBadge
            />
            <div className="pt-2 text-[color:var(--text-soft)]">{messages.home.levelLabel}</div>
            <div>{messages.home.levelBody}</div>
            <div className="pt-2 text-[color:var(--text-soft)]">{messages.home.bringLabel}</div>
            <div>{messages.home.bringBody}</div>
            <div className="pt-3">{hallImage}</div>
          </div>
        </aside>
      </section>
    </div>
  );
}
