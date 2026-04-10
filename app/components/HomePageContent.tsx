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

  if (!session) {
    return (
      <div className="space-y-8 sm:space-y-12">
        <section className="app-hero app-hero-photo app-stage-shell overflow-hidden p-6 sm:p-10">
          <div className="app-hero-photo-shell" aria-hidden="true">
            <Image
              src="/images/website/treningshall.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="app-hero-photo-image"
            />
          </div>

          <div className="app-stage-grid relative z-10">
            <div className="app-stage-copy max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="app-badge app-badge-neutral">{venueLabel}</span>
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[color:var(--text-strong)] sm:mt-6 sm:text-5xl">
                {messages.home.emptyTitle}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--text-muted)]">
                {messages.home.emptyBody}
              </p>

              <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
                <Link className="app-button-secondary inline-flex" href={scheduleHref}>
                  {messages.home.ctaSchedule}
                </Link>
              </div>
            </div>

            <div className="app-stage-panel app-stage-panel-muted">
              <div className="app-stage-kicker">{messages.home.locationLabel}</div>
              <div className="mt-3">
                <VenueLink
                  locale={locale}
                  className="font-medium text-[color:var(--accent)] hover:underline"
                  textClassName="font-medium"
                  showMazeMapBadge
                />
              </div>
            </div>
          </div>
        </section>
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
    <div className="space-y-8 sm:space-y-12">
      <section className="app-hero app-hero-photo app-stage-shell overflow-hidden p-6 sm:p-10">
        <div className="app-hero-photo-shell" aria-hidden="true">
          <Image
            src="/images/website/treningshall.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="app-hero-photo-image"
          />
        </div>

        <div className="app-stage-grid relative z-10">
          <div className="app-stage-copy">
            <div className="flex flex-wrap items-center gap-3">
              <span className="app-badge app-badge-neutral">{venueLabel}</span>
            </div>

            <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-[color:var(--text-strong)] sm:mt-6 sm:text-5xl">
              {messages.home.heroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--text-muted)]">
              {messages.home.heroBody}
            </p>

            <div className="app-mobile-hero-actions mt-5 grid gap-3 sm:hidden">
              <Link href={registerHref} className="app-button-success inline-flex items-center justify-center">
                {messages.home.ctaRegister}
              </Link>
              <Link href={unregisterHref} className="app-button-danger inline-flex items-center justify-center">
                {messages.shell.nav.unregister}
              </Link>
            </div>

            <div className="mt-8 hidden flex-wrap gap-3 sm:flex">
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
          </div>

          <div className="app-stage-panel">
            <div className="flex flex-wrap items-center gap-2">
              <span className={isActive ? "app-badge app-badge-accent" : "app-badge app-badge-neutral"}>
                {isActive ? messages.home.currentStatus : messages.home.nextStatus}
              </span>
              <span className="app-stage-kicker">{dateFormatter.format(new Date(session.starts_at))}</span>
            </div>

            <div className="app-stage-time">
              {timeFormatter.format(new Date(session.starts_at))}
              {" - "}
              {timeFormatter.format(new Date(session.ends_at))}
            </div>

            <div className="app-stage-meta">
              <VenueLink
                locale={locale}
                location={session.location}
                className="font-medium text-[color:var(--accent)] hover:underline"
                textClassName="font-medium"
                showMazeMapBadge
              />
            </div>

            <div className="app-stage-stats">
              <div className="app-stage-stat">
                <span className="app-stage-stat-value">{spotsLeft}</span>
                <span className="app-stage-stat-label">{messages.home.spotsLeft(spotsLeft)}</span>
              </div>
              <div className="app-stage-stat app-stage-stat-secondary">
                <span className="app-stage-stat-value">
                  {registeredNames.length}/{session.capacity}
                </span>
                <span className="app-stage-stat-label">
                  {messages.home.registeredCount(registeredNames.length, session.capacity)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="app-surface app-home-board overflow-hidden p-0">
        <div className="app-home-board-grid">
          <div className="app-home-board-primary p-6 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="app-panel-eyebrow">
                  {isActive ? messages.home.currentTitle : messages.home.nextTitle}
                </div>
                <h2 className="app-panel-title mt-3">
                  {messages.home.registeredCount(registeredNames.length, session.capacity)}
                </h2>
                <p className="app-panel-body mt-2">{dateFormatter.format(new Date(session.starts_at))}</p>
              </div>

              <div className="app-stat-card min-w-[170px] px-5 py-4 text-sm">
                <div className="font-semibold text-white">{messages.home.spotsLeft(spotsLeft)}</div>
                <div className="mt-1 text-white/78">
                  {isActive ? messages.home.currentStatus : messages.home.nextStatus}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6">
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

            <div className="mt-8 hidden flex-wrap gap-3 sm:flex">
              <Link href={registerHref} className="app-button-success inline-flex">
                {messages.home.ctaRegister}
              </Link>
              <Link href={unregisterHref} className="app-button-danger inline-flex">
                {messages.shell.nav.unregister}
              </Link>
            </div>
          </div>

          <aside className="app-home-board-secondary p-6 text-sm sm:p-8">
            <div className="app-panel-eyebrow">{messages.home.infoTitle}</div>

            <div className="app-side-block space-y-2">
              <div className="text-[color:var(--text-soft)]">{messages.home.locationLabel}</div>
              <VenueLink
                locale={locale}
                className="font-medium text-[color:var(--accent)] hover:underline"
                textClassName="font-medium"
                showMazeMapBadge
              />
            </div>

            <div className="app-side-block">
              <div className="text-[color:var(--text-soft)]">{messages.home.levelLabel}</div>
              <div className="mt-2">{messages.home.levelBody}</div>
            </div>

            <div className="app-side-block">
              <div className="text-[color:var(--text-soft)]">{messages.home.bringLabel}</div>
              <div className="mt-2">{messages.home.bringBody}</div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
