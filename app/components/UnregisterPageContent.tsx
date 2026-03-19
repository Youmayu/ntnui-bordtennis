"use client";

import { useEffect, useMemo, useState } from "react";
import TurnstileWidget from "@/app/components/TurnstileWidget";
import { useSitePreferences } from "@/app/components/SitePreferencesProvider";
import VenueLink from "@/app/components/VenueLink";
import { getDaysInMonth } from "@/lib/birth-month-day";
import {
  formatVenueLabel,
  getIntlLocale,
  type Locale,
} from "@/lib/site-content";

type Session = {
  id: number;
  starts_at: string;
  ends_at: string;
  location: string;
  capacity: number;
};

type Registration = {
  id: number;
  name: string;
  level: string;
  created_at: string;
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

export default function UnregisterPageContent() {
  const { locale, messages } = useSitePreferences();
  const intlLocale = getIntlLocale(locale);
  const monthOptions = useMemo(() => getMonthOptions(locale), [locale]);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [registrationId, setRegistrationId] = useState<number | null>(null);
  const [birthMonth, setBirthMonth] = useState<number | null>(null);
  const [birthDay, setBirthDay] = useState<number | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedSession = sessions.find((session) => session.id === sessionId) ?? null;

  const dayOptions = useMemo(
    () =>
      birthMonth
        ? Array.from({ length: getDaysInMonth(birthMonth) }, (_, index) => index + 1)
        : [],
    [birthMonth]
  );

  const disabled = useMemo(
    () =>
      !sessionId ||
      !registrationId ||
      !birthMonth ||
      !birthDay ||
      !turnstileToken ||
      registrations.length === 0,
    [birthDay, birthMonth, registrationId, registrations.length, sessionId, turnstileToken]
  );

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      setSessions(data.sessions ?? []);
      if ((data.sessions ?? []).length > 0) setSessionId(data.sessions[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    let cancelled = false;

    (async () => {
      const res = await fetch(`/api/registrations?sessionId=${sessionId}`);
      const data = await res.json();
      const nextRegistrations = (data.registrations ?? []) as Registration[];

      if (cancelled) {
        return;
      }

      setRegistrations(nextRegistrations);
      setRegistrationId(nextRegistrations[0]?.id ?? null);
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const submittedToken = String(fd.get("cf-turnstile-response") ?? "");

    if (!submittedToken) {
      setError(messages.unregister.errors.captcha);
      return;
    }
    if (!registrationId) {
      setError(messages.unregister.errors.registration);
      return;
    }
    if (!birthMonth || !birthDay) {
      setError(messages.unregister.errors.birthDate);
      return;
    }

    const res = await fetch("/api/unregister", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        registrationId,
        birthMonth,
        birthDay,
        turnstileToken: submittedToken,
        website: "",
      }),
    });

    const data = await res.json();
    setTurnstileToken("");

    if (!res.ok) {
      setError(data?.error ?? messages.unregister.errors.generic);
      return;
    }

    const nextRegistrations = registrations.filter((registration) => registration.id !== registrationId);
    setRegistrations(nextRegistrations);
    setRegistrationId(nextRegistrations[0]?.id ?? null);
    setBirthMonth(null);
    setBirthDay(null);
    setMessage(messages.unregister.success);
  }

  function handleSessionChange(nextSessionId: number | null) {
    setSessionId(nextSessionId);
    setRegistrations([]);
    setRegistrationId(null);
    setBirthMonth(null);
    setBirthDay(null);
    setMessage(null);
    setError(null);
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

  function formatRegistrationLabel(registration: Registration) {
    return messages.unregister.registrationLabel(registration.name);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-3">
        <span className="app-badge app-badge-danger">{messages.unregister.badge}</span>
        <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--text-strong)]">
          {messages.unregister.title}
        </h1>
        <p className="text-[color:var(--text-muted)]">{messages.unregister.body}</p>
      </div>

      <form onSubmit={onSubmit} className="app-surface space-y-5 p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">{messages.unregister.sessionLabel}</label>
          <select
            value={sessionId ?? ""}
            onChange={(e) => handleSessionChange(e.target.value ? Number(e.target.value) : null)}
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
                {" â€“ "}
                {formatVenueLabel(session.location, locale)}
              </option>
            ))}
          </select>
          {selectedSession && (
            <VenueLink
              locale={locale}
              location={selectedSession.location}
              className="text-xs text-[color:var(--accent)] hover:underline"
              textClassName="font-medium"
              showMazeMapBadge
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{messages.unregister.whoLabel}</label>
          <select
            value={registrationId ?? ""}
            onChange={(e) => setRegistrationId(e.target.value ? Number(e.target.value) : null)}
            disabled={registrations.length === 0}
            className="app-field w-full rounded-2xl px-4 py-3 text-sm outline-none disabled:opacity-60"
          >
            {registrations.length === 0 ? (
              <option value="">{messages.unregister.noRegistrations}</option>
            ) : (
              registrations.map((registration) => (
                <option key={registration.id} value={registration.id}>
                  {formatRegistrationLabel(registration)}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">{messages.unregister.birthMonthLabel}</label>
            <select
              value={birthMonth ?? ""}
              onChange={(e) => handleBirthMonthChange(e.target.value ? Number(e.target.value) : null)}
              className="app-field w-full rounded-2xl px-4 py-3 text-sm outline-none"
            >
              <option value="">{messages.unregister.chooseMonth}</option>
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{messages.unregister.birthDayLabel}</label>
            <select
              value={birthDay ?? ""}
              onChange={(e) => setBirthDay(e.target.value ? Number(e.target.value) : null)}
              disabled={!birthMonth}
              className="app-field w-full rounded-2xl px-4 py-3 text-sm outline-none disabled:opacity-60"
            >
              <option value="">{messages.unregister.chooseDay}</option>
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

        <button type="submit" disabled={disabled} className="app-button-danger w-full justify-center">
          {messages.unregister.submit}
        </button>

        {error && <div className="app-alert-error">{error}</div>}
        {message && <div className="app-alert-success">{message}</div>}
      </form>
    </div>
  );
}
