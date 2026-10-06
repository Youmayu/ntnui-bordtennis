"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TurnstileWidget from "@/app/components/TurnstileWidget";
import FormPrivacyNotice from "@/app/components/FormPrivacyNotice";
import { useSitePreferences } from "@/app/components/SitePreferencesProvider";
import VenueLink from "@/app/components/VenueLink";
import {
  LEVEL_OPTIONS,
  formatVenueLabel,
  getIntlLocale,
  getSessionAccessCopy,
  getSessionAccessLabel,
  NTNUI_MEMBERSHIP_URL,
  type Locale,
} from "@/lib/site-content";
import { getDaysInMonth } from "@/lib/birth-month-day";
import { sanitizeRegistrationName } from "@/lib/input-safety";
import { getRegistrationCopy } from "@/lib/registration-content";
import { REGISTRATION_STATUS, type RegistrationStatus } from "@/lib/registrations";
import SessionRoster from "@/app/components/SessionRoster";
import { useSessionRegistrations } from "@/app/components/useSessionRegistrations";
import type { SessionAvailability } from "@/lib/tournament-reservations";
import { getTournamentCopy } from "@/lib/tournament-content";
import TournamentReservationNotice from "@/app/components/TournamentReservationNotice";

type Session = SessionAvailability & {
  id: number;
  starts_at: string;
  ends_at: string;
  location: string;
  capacity: number;
  members_only: boolean;
  confirmed_count: number;
  waitlist_count: number;
};

type RegistrationReceipt = {
  registrationId: number;
  name: string;
  session: Session;
  status: RegistrationStatus;
  alreadyRegistered: boolean;
  receivedAt: string;
};

function getMonthOptions(locale: Locale) {
  const intlLocale = getIntlLocale(locale);

  return Array.from({ length: 12 }, (_, index) => ({
    value: index + 1,
    label: new Intl.DateTimeFormat(intlLocale, { month: "long" }).format(
      new Date(Date.UTC(2024, index, 1))
    ),
  }));
}

async function fetchSessions() {
  const res = await fetch("/api/sessions");
  const data = await res.json();
  return (data.sessions ?? []) as Session[];
}

function getPreferredSessionId(
  sessions: Session[],
  preferredSessionId?: number | null
) {
  if (sessions.length === 0) {
    return null;
  }

  return preferredSessionId && sessions.some((session) => session.id === preferredSessionId)
    ? preferredSessionId
    : sessions[0].id;
}

export default function RegisterPageContent() {
  const { locale, messages } = useSitePreferences();
  const searchParams = useSearchParams();
  const parsedSessionId = Number(searchParams.get("sessionId"));
  const requestedSessionId = Number.isSafeInteger(parsedSessionId) && parsedSessionId > 0
    ? parsedSessionId
    : null;
  const intlLocale = getIntlLocale(locale);
  const monthOptions = useMemo(() => getMonthOptions(locale), [locale]);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [level, setLevel] = useState("Nybegynner");
  const [birthMonth, setBirthMonth] = useState<number | null>(null);
  const [birthDay, setBirthDay] = useState<number | null>(null);
  const [memberConfirmed, setMemberConfirmed] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [receipt, setReceipt] = useState<RegistrationReceipt | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const pending = useRef(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [rosterRevision, setRosterRevision] = useState(0);
  const roster = useSessionRegistrations(sessionId, null, rosterRevision);
  const session = sessions.find((session) => session.id === sessionId) ?? null;
  const selectedSession = session && roster.registrations ? {
    ...session,
    confirmed_count: roster.registrations.filter((entry) => entry.status === REGISTRATION_STATUS.CONFIRMED).length,
    waitlist_count: roster.registrations.filter((entry) => entry.status === REGISTRATION_STATUS.WAITLIST).length,
  } : session;
  const registrationCopy = getRegistrationCopy(locale);
  const accessCopy = getSessionAccessCopy(locale);
  const availability = roster.availability ?? selectedSession;
  const reservedCount = availability?.reserved_count ?? 0;
  const selectedSessionIsFull = selectedSession
    ? selectedSession.confirmed_count + reservedCount >= selectedSession.capacity
    : false;
  const fullTitle = reservedCount > 0 ? getTournamentCopy(locale).publicFull : registrationCopy.fullTitle;
  const currentRegistration = receipt && roster.updatedAt && roster.updatedAt >= receipt.receivedAt
    ? roster.registrations?.find((entry) => entry.id === receipt.registrationId)
    : null;
  const receiptWaitlisted = (currentRegistration?.status ?? receipt?.status) === REGISTRATION_STATUS.WAITLIST;

  useEffect(() => {
    if (receipt) {
      receiptRef.current?.focus({ preventScroll: true });
      receiptRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, [receipt]);

  const dayOptions = useMemo(
    () =>
      birthMonth
        ? Array.from({ length: getDaysInMonth(birthMonth) }, (_, index) => index + 1)
        : [],
    [birthMonth]
  );

  const sessionDateFormatter = new Intl.DateTimeFormat(intlLocale, {
    timeZone: "Europe/Oslo",
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const sessionTimeFormatter = new Intl.DateTimeFormat(intlLocale, {
    timeZone: "Europe/Oslo",
    hour: "2-digit",
    minute: "2-digit",
  });

  const disabled = useMemo(
    () =>
      !sanitizeRegistrationName(firstName, lastName) ||
      !sessionId ||
      !birthMonth ||
      !birthDay ||
      !turnstileToken ||
      Boolean(selectedSession?.members_only && !memberConfirmed),
    [birthDay, birthMonth, memberConfirmed, firstName, lastName, selectedSession?.members_only, sessionId, turnstileToken]
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const nextSessions = await fetchSessions();

      if (cancelled) {
        return;
      }

      setSessions(nextSessions);
      setSessionId(getPreferredSessionId(nextSessions, requestedSessionId));
      setMemberConfirmed(false);
      setReceipt(null);
      setError(null);
    })();

    return () => {
      cancelled = true;
    };
  }, [requestedSessionId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending.current || receipt) return;
    setError(null);

    const safeName = sanitizeRegistrationName(firstName, lastName);
    if (!safeName) {
      setError(registrationCopy.nameError);
      return;
    }

    const fd = new FormData(e.currentTarget);
    const submittedToken = String(fd.get("cf-turnstile-response") ?? "");

    if (!submittedToken) {
      setError(messages.register.errors.captcha);
      return;
    }
    if (!sessionId || !selectedSession) {
      setError(messages.register.errors.session);
      return;
    }
    if (!birthMonth || !birthDay) {
      setError(messages.register.errors.birthDate);
      return;
    }
    if (selectedSession?.members_only && !memberConfirmed) {
      setError(accessCopy.membershipConfirmError);
      return;
    }

    pending.current = true;
    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          firstName,
          lastName,
          level,
          birthMonth,
          birthDay,
          memberConfirmed,
          turnstileToken: submittedToken,
          website: "",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? messages.register.errors.generic);
        return;
      }
      if (data.ok !== true || !Number.isSafeInteger(data.registrationId) ||
          ![REGISTRATION_STATUS.CONFIRMED, REGISTRATION_STATUS.WAITLIST].includes(data.registrationStatus)) {
        throw new Error("Invalid registration response");
      }

      setReceipt({
        registrationId: data.registrationId,
        name: safeName,
        session: selectedSession,
        status: data.registrationStatus,
        alreadyRegistered: data.alreadyRegistered === true,
        receivedAt: new Date().toISOString(),
      });
      setFirstName("");
      setLastName("");
      setLevel("Nybegynner");
      setBirthMonth(null);
      setBirthDay(null);
      setMemberConfirmed(false);
      // A roster refresh has its own error state; it must never turn a saved
      // booking into an apparent signup failure and encourage another attempt.
      setRosterRevision((value) => value + 1);
    } catch {
      setError(registrationCopy.submissionError);
    } finally {
      setTurnstileToken("");
      pending.current = false;
      setSubmitting(false);
    }
  }

  function handleBirthMonthChange(nextMonth: number | null) {
    setBirthMonth(nextMonth);
    if (!nextMonth) {
      setBirthDay(null);
      return;
    }

    const maxDay = getDaysInMonth(nextMonth);
    if (birthDay && birthDay > maxDay) {
      setBirthDay(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <span className="app-badge app-badge-success">{messages.register.badge}</span>
        <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--text-strong)]">
          {messages.register.title}
        </h1>
        <p className="text-[color:var(--text-muted)]">{messages.register.body}</p>
        {selectedSession && (
          <a href="#session-registrations" className="app-roster-link">
            {receipt ? registrationCopy.title : registrationCopy.checkFirst} ↓
          </a>
        )}
      </div>

      <div className="app-surface app-form-board overflow-hidden p-0">
        <div className="app-form-board-grid">
          <form onSubmit={onSubmit} aria-busy={submitting} className="app-form-shell space-y-5 p-6 sm:p-8">
            <div className="space-y-2">
              <label htmlFor="register-session" className="text-sm font-medium">{messages.register.sessionLabel}</label>
              <select
                id="register-session"
                disabled={submitting}
                aria-describedby={!receipt && selectedSessionIsFull ? "register-full-notice" : undefined}
                value={sessionId ?? ""}
                onChange={(e) => {
                  setSessionId(Number(e.target.value));
                  setMemberConfirmed(false);
                  setReceipt(null);
                  setError(null);
                }}
                className="app-field w-full rounded-2xl px-4 py-3 text-sm outline-none"
              >
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {new Intl.DateTimeFormat(intlLocale, {
                      timeZone: "Europe/Oslo",
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(session.starts_at))}
                    {" - "}
                    {formatVenueLabel(session.location, locale)}
                    {" - "}
                    {getSessionAccessLabel(locale, session.members_only)}
                  </option>
                ))}
              </select>
              {selectedSession && (
                <div className="space-y-2">
                  <VenueLink
                    locale={locale}
                    location={selectedSession.location}
                    className="text-xs text-[color:var(--accent)] hover:underline"
                    textClassName="font-medium"
                    showMazeMapBadge
                  />
                </div>
              )}
            </div>

            {receipt ? (
              <div ref={receiptRef} tabIndex={-1} role="status" aria-labelledby="registration-receipt-title"
                className={`${receiptWaitlisted ? "app-alert-waitlist" : "app-alert-success"} scroll-mt-6 space-y-5 p-6 md:scroll-mt-56`}>
                <div className="flex items-start gap-3">
                  <span aria-hidden="true" className="text-3xl">{receiptWaitlisted ? "◷" : "✓"}</span>
                  <div>
                    <h2 id="registration-receipt-title" className="text-xl font-semibold">
                      {receipt.alreadyRegistered ? registrationCopy.alreadyTitle
                        : receiptWaitlisted ? registrationCopy.waitlistTitle : registrationCopy.confirmedTitle}
                    </h2>
                    <p className="mt-2 font-semibold">{receipt.name}</p>
                  </div>
                </div>
                <span className={`app-badge ${receiptWaitlisted ? "app-badge-accent" : "app-badge-success"}`}>
                  {receiptWaitlisted ? registrationCopy.waitlist : registrationCopy.confirmed}
                </span>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{sessionDateFormatter.format(new Date(receipt.session.starts_at))}</p>
                  <p>{sessionTimeFormatter.format(new Date(receipt.session.starts_at))}
                    {" – "}{sessionTimeFormatter.format(new Date(receipt.session.ends_at))}</p>
                  <VenueLink locale={locale} location={receipt.session.location} className="underline underline-offset-4" />
                </div>
                <p className="text-sm leading-6">{receiptWaitlisted ? registrationCopy.waitlistSavedHelp : registrationCopy.savedHelp}</p>
                <div className="flex flex-wrap gap-3">
                  <a href="#session-registrations" className="app-button-secondary">{registrationCopy.showParticipants}</a>
                  <Link href={`/${locale}/unregister`} className="app-button-secondary">{messages.shell.nav.unregister}</Link>
                </div>
                <button type="button" className="text-sm underline underline-offset-4" onClick={() => setReceipt(null)}>
                  {registrationCopy.registerAnother}
                </button>
              </div>
            ) : (
            <fieldset disabled={submitting} className="min-w-0 space-y-5">
            {selectedSession && selectedSessionIsFull && (
              <div id="register-full-notice" className="app-full-notice" role="status">
                <span className="app-full-notice-icon" aria-hidden="true">!</span>
                <div className="min-w-0">
                  <h2 className="app-full-notice-title">{fullTitle}</h2>
                  <p className="mt-2 text-sm leading-6">{registrationCopy.waitlistSignup}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="app-badge app-capacity-full">
                      {selectedSession.confirmed_count}/{selectedSession.capacity}
                    </span>
                    <span className="app-badge app-badge-neutral">
                      {messages.register.waitlistCount(selectedSession.waitlist_count)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <TournamentReservationNotice availability={availability} />

            {selectedSession && (
              <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-muted)] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={
                      selectedSession.members_only
                        ? "app-badge app-badge-neutral"
                        : "app-badge app-badge-success"
                    }
                  >
                    {getSessionAccessLabel(locale, selectedSession.members_only)}
                  </span>
                </div>

                <div className="mt-3 text-sm text-[color:var(--text-muted)]">
                  {selectedSession.members_only
                    ? accessCopy.membersOnlyHint
                    : accessCopy.openTrainingHint}
                </div>

                {selectedSession.members_only && (
                  <div className="mt-4 space-y-3">
                    <label className="flex items-start gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={memberConfirmed}
                        onChange={(event) => setMemberConfirmed(event.target.checked)}
                        className="mt-1"
                      />
                      <span>{accessCopy.membershipConfirmLabel}</span>
                    </label>

                    <a
                      href={NTNUI_MEMBERSHIP_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="app-button-secondary inline-flex"
                    >
                      {accessCopy.membershipButton}
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="register-first-name" className="text-sm font-medium">{registrationCopy.firstName}</label>
                  <input
                    id="register-first-name"
                    name="firstName"
                    autoComplete="given-name"
                    aria-describedby="register-name-help"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    maxLength={78}
                    className="app-field w-full rounded-2xl px-4 py-3 text-sm outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="register-last-name" className="text-sm font-medium">{registrationCopy.lastName}</label>
                  <input
                    id="register-last-name"
                    name="lastName"
                    autoComplete="family-name"
                    aria-describedby="register-name-help"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    maxLength={78}
                    className="app-field w-full rounded-2xl px-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>
              <div id="register-name-help" className="text-xs text-[color:var(--text-soft)]">{registrationCopy.nameHelp}</div>
              {firstName.trim() && lastName.trim() && !sanitizeRegistrationName(firstName, lastName) && (
                <p role="alert" className="text-sm text-[color:var(--danger-ink)]">{registrationCopy.nameError}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="register-level" className="text-sm font-medium">{messages.register.levelLabel}</label>
              <select
                id="register-level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="app-field w-full rounded-2xl px-4 py-3 text-sm outline-none"
              >
                {LEVEL_OPTIONS.map((option) => (
                  <option key={option.key} value={option.value}>
                    {messages.levels[option.key]}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="register-birth-month" className="text-sm font-medium">{messages.register.birthMonthLabel}</label>
                <select
                  id="register-birth-month"
                  value={birthMonth ?? ""}
                  onChange={(e) => handleBirthMonthChange(e.target.value ? Number(e.target.value) : null)}
                  className="app-field w-full rounded-2xl px-4 py-3 text-sm outline-none"
                >
                  <option value="">{messages.register.chooseMonth}</option>
                  {monthOptions.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="register-birth-day" className="text-sm font-medium">{messages.register.birthDayLabel}</label>
                <select
                  id="register-birth-day"
                  value={birthDay ?? ""}
                  onChange={(e) => setBirthDay(e.target.value ? Number(e.target.value) : null)}
                  disabled={!birthMonth}
                  className="app-field w-full rounded-2xl px-4 py-3 text-sm outline-none disabled:opacity-60"
                >
                  <option value="">{messages.register.chooseDay}</option>
                  {dayOptions.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <FormPrivacyNotice />

            <TurnstileWidget
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
              token={turnstileToken}
              onTokenChange={setTurnstileToken}
            />

            <button
              type="submit"
              disabled={disabled || submitting}
              aria-describedby={selectedSessionIsFull ? "register-full-notice" : undefined}
              className={`${selectedSessionIsFull ? "app-button-danger" : "app-button-success"} w-full justify-center`}
            >
              {submitting ? registrationCopy.submitting : selectedSessionIsFull ? registrationCopy.joinWaitlist : messages.register.submit}
            </button>

            {error && <div role="alert" className="app-alert-error">{error}</div>}
            </fieldset>
            )}
          </form>

          <aside className="app-form-aside app-form-board-side p-6 sm:p-8">
            {selectedSession && (
              <div className="app-panel app-side-block">
                <div className="app-panel-eyebrow">{messages.register.sessionLabel}</div>
                <div className="app-panel-title mt-3">{sessionDateFormatter.format(new Date(selectedSession.starts_at))}</div>
                <div className="app-panel-body mt-2">
                  {sessionTimeFormatter.format(new Date(selectedSession.starts_at))}
                  {" - "}
                  {sessionTimeFormatter.format(new Date(selectedSession.ends_at))}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span
                    className={
                      selectedSession.members_only
                        ? "app-badge app-badge-neutral"
                        : "app-badge app-badge-success"
                    }
                  >
                    {getSessionAccessLabel(locale, selectedSession.members_only)}
                  </span>
                  <span className={`app-badge ${selectedSessionIsFull ? "app-capacity-full" : "app-badge-success"}`}>
                    {selectedSession.confirmed_count}/{selectedSession.capacity}
                    {selectedSessionIsFull && ` · ${fullTitle}`}
                  </span>
                  {selectedSession.waitlist_count > 0 && (
                    <span className="app-badge app-badge-accent">
                      {messages.register.waitlistCount(selectedSession.waitlist_count)}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="app-side-block text-sm">
              <div className="app-panel-eyebrow">{messages.home.infoTitle}</div>
              <div className="mt-4 text-[color:var(--text-soft)]">{messages.home.levelLabel}</div>
              <div className="mt-2">{messages.home.levelBody}</div>
              <div className="mt-5 text-[color:var(--text-soft)]">{messages.home.bringLabel}</div>
              <div className="mt-2">{messages.home.bringBody}</div>
            </div>
          </aside>
        </div>
      </div>
      {selectedSession && (
        <section id="session-registrations" className="app-surface scroll-mt-48 p-6 sm:p-8" aria-labelledby="session-registrations-title">
          <h2 id="session-registrations-title" className="app-panel-title">{registrationCopy.title}</h2>
          <p className="app-panel-body mt-2">
            {sessionDateFormatter.format(new Date(selectedSession.starts_at))}
            {" · "}{sessionTimeFormatter.format(new Date(selectedSession.starts_at))}
          </p>
          <SessionRoster
            registrations={roster.registrations}
            capacity={selectedSession.capacity}
            error={roster.error}
            updatedAt={roster.updatedAt}
            availability={availability}
          />
        </section>
      )}
    </div>
  );
}
