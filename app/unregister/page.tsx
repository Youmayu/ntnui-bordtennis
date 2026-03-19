"use client";

import { useEffect, useMemo, useState } from "react";
import TurnstileWidget from "@/app/components/TurnstileWidget";
import { getDaysInMonth } from "@/lib/birth-month-day";

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

const MONTH_OPTIONS = [
  { value: 1, label: "Januar" },
  { value: 2, label: "Februar" },
  { value: 3, label: "Mars" },
  { value: 4, label: "April" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

function formatRegistrationLabel(registration: Registration) {
  const time = new Intl.DateTimeFormat("no-NO", {
    timeZone: "Europe/Oslo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(registration.created_at));

  return `${registration.name} – ${registration.level}, meldt på ${time}`;
}

export default function UnregisterPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [registrationId, setRegistrationId] = useState<number | null>(null);

  const [birthMonth, setBirthMonth] = useState<number | null>(null);
  const [birthDay, setBirthDay] = useState<number | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      setError("Fullfør CAPTCHA før du sender inn.");
      return;
    }
    if (!registrationId) {
      setError("Velg påmeldingen din.");
      return;
    }
    if (!birthMonth || !birthDay) {
      setError("Velg fødselsmåned og fødselsdag.");
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
      setError(data?.error ?? "Noe gikk galt.");
      return;
    }

    const nextRegistrations = registrations.filter((registration) => registration.id !== registrationId);
    setRegistrations(nextRegistrations);
    setRegistrationId(nextRegistrations[0]?.id ?? null);
    setBirthMonth(null);
    setBirthDay(null);
    setMessage("Du er meldt av.");
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

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-3">
        <span className="inline-flex rounded-full border border-[color:rgba(19,60,67,0.16)] bg-[rgba(19,60,67,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[color:rgb(24,60,56)]">
          Avmelding
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-[color:rgb(37,26,20)]">
          Meld deg av trening
        </h1>
        <p className="text-[color:rgb(94,77,70)]">
          Velg økt, velg påmeldingen din og oppgi fødselsmåned og fødselsdag.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(86,39,26,0.10)]"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium">Økt</label>
          <select
            value={sessionId ?? ""}
            onChange={(e) => handleSessionChange(e.target.value ? Number(e.target.value) : null)}
            className="w-full rounded-2xl border bg-[rgba(251,245,239,0.72)] px-4 py-3 text-sm outline-none"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {new Date(s.starts_at).toLocaleString("no-NO", {
                  timeZone: "Europe/Oslo",
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                – {s.location}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Hvem er du?</label>
          <select
            value={registrationId ?? ""}
            onChange={(e) => setRegistrationId(e.target.value ? Number(e.target.value) : null)}
            disabled={registrations.length === 0}
            className="w-full rounded-2xl border bg-[rgba(251,245,239,0.72)] px-4 py-3 text-sm outline-none disabled:opacity-60"
          >
            {registrations.length === 0 ? (
              <option value="">Ingen påmeldinger for denne økten</option>
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
            <label className="text-sm font-medium">Fødselsmåned</label>
            <select
              value={birthMonth ?? ""}
              onChange={(e) => handleBirthMonthChange(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-2xl border bg-[rgba(251,245,239,0.72)] px-4 py-3 text-sm outline-none"
            >
              <option value="">Velg måned</option>
              {MONTH_OPTIONS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fødselsdag</label>
            <select
              value={birthDay ?? ""}
              onChange={(e) => setBirthDay(e.target.value ? Number(e.target.value) : null)}
              disabled={!birthMonth}
              className="w-full rounded-2xl border bg-[rgba(251,245,239,0.72)] px-4 py-3 text-sm outline-none disabled:opacity-60"
            >
              <option value="">Velg dag</option>
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

        <button
          type="submit"
          disabled={disabled}
          className="w-full rounded-full bg-[color:rgb(24,60,56)] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(24,60,56,0.22)] disabled:opacity-50 hover:enabled:-translate-y-0.5 hover:enabled:bg-[color:rgb(19,52,49)]"
        >
          Meld meg av
        </button>

        {error && (
          <div className="rounded-2xl border border-[color:rgba(163,50,31,0.16)] bg-[rgba(163,50,31,0.08)] px-4 py-3 text-sm text-[color:rgb(101,45,34)]">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-2xl border border-[color:rgba(19,60,67,0.14)] bg-[rgba(19,60,67,0.08)] px-4 py-3 text-sm text-[color:rgb(24,60,56)]">
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
