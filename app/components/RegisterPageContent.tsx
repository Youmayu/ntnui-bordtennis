"use client";

import { useEffect, useMemo, useState } from "react";
import TurnstileWidget from "@/app/components/TurnstileWidget";
import { useSitePreferences } from "@/app/components/SitePreferencesProvider";
import VenueLink from "@/app/components/VenueLink";
import {
  LEVEL_OPTIONS,
  formatVenueLabel,
  getIntlLocale,
  type Locale,
} from "@/lib/site-content";
import { getDaysInMonth } from "@/lib/birth-month-day";

type Session = {
  id: number;
  starts_at: string;
  ends_at: string;
  location: string;
  capacity: number;
  confirmed_count: number;
  waitlist_count: number;
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
  const intlLocale = getIntlLocale(locale);
  const monthOptions = useMemo(() => getMonthOptions(locale), [locale]);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Nybegynner");
  const [birthMonth, setBirthMonth] = useState<number | null>(null);
  const [birthDay, setBirthDay] = useState<number | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedSession = sessions.find((session) => session.id === sessionId) ?? null;
  const selectedSessionIsFull = selectedSession
    ? selectedSession.confirmed_count >= selectedSession.capacity
    : false;

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
    () => name.trim().length < 2 || !sessionId || !birthMonth || !birthDay || !turnstileToken,
    [birthDay, birthMonth, name, sessionId, turnstileToken]
  );

  async function loadSessions(preferredSessionId?: number | null) {
    const nextSessions = await fetchSessions();
    setSessions(nextSessions);
    setSessionId(getPreferredSessionId(nextSessions, preferredSessionId));
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const nextSessions = await fetchSessions();

      if (cancelled) {
        return;
      }

      setSessions(nextSessions);
      setSessionId(getPreferredSessionId(nextSessions));
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const submittedToken = String(fd.get("cf-turnstile-response") ?? "");

    if (!submittedToken) {
      setError(messages.register.errors.captcha);
      return;
    }
    if (!sessionId) {
      setError(messages.register.errors.session);
      return;
    }
    if (!birthMonth || !birthDay) {
      setError(messages.register.errors.birthDate);
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        name,
        level,
        birthMonth,
        birthDay,
        turnstileToken: submittedToken,
        website: "",
      }),
    });

    const data = await res.json();
    setTurnstileToken("");

    if (!res.ok) {
      setError(data?.error ?? messages.register.errors.generic);
      return;
    }

    setMessage(
      data?.registrationStatus === "waitlist"
        ? messages.register.successWaitlist
        : messages.register.success
    );
    setName("");
    setLevel("Nybegynner");
    setBirthMonth(null);
    setBirthDay(null);
    await loadSessions(sessionId);
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
      </div>

      <div className="app-surface app-form-board overflow-hidden p-0">
        <div className="app-form-board-grid">
          <form onSubmit={onSubmit} className="app-form-shell space-y-5 p-6 sm:p-8">
            <div className="space-y-2">
              <label className="text-sm font-medium">{messages.register.sessionLabel}</label>
              <select
                value={sessionId ?? ""}
                onChange={(e) => setSessionId(Number(e.target.value))}
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
                  {selectedSessionIsFull && (
                    <div className="text-xs font-medium text-[color:var(--danger-ink)]">
                      {messages.register.fullNotice}
                      {selectedSession.waitlist_count > 0
                        ? ` ${messages.register.waitlistCount(selectedSession.waitlist_count)}`
                        : ""}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{messages.register.nameLabel}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={messages.register.namePlaceholder}
                maxLength={80}
                className="app-field w-full rounded-2xl px-4 py-3 text-sm outline-none"
              />
              <div className="text-xs text-[color:var(--text-soft)]">{messages.register.nameHelp}</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{messages.register.levelLabel}</label>
              <select
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
                <label className="text-sm font-medium">{messages.register.birthMonthLabel}</label>
                <select
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
                <label className="text-sm font-medium">{messages.register.birthDayLabel}</label>
                <select
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

            <TurnstileWidget
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
              token={turnstileToken}
              onTokenChange={setTurnstileToken}
            />

            <button type="submit" disabled={disabled} className="app-button-success w-full justify-center">
              {messages.register.submit}
            </button>

            {error && <div className="app-alert-error">{error}</div>}
            {message && <div className="app-alert-success">{message}</div>}
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
                <div className="mt-4">
                  <VenueLink
                    locale={locale}
                    location={selectedSession.location}
                    className="font-medium text-[color:var(--accent)] hover:underline"
                    textClassName="font-medium"
                    showMazeMapBadge
                  />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="app-badge app-badge-success">
                    {selectedSession.confirmed_count}/{selectedSession.capacity}
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
    </div>
  );
}
