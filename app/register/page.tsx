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

export default function RegisterPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [level, setLevel] = useState("Nybegynner");
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
    () => name.trim().length < 2 || !sessionId || !birthMonth || !birthDay || !turnstileToken,
    [birthDay, birthMonth, name, sessionId, turnstileToken]
  );

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      setSessions(data.sessions ?? []);
      if ((data.sessions ?? []).length > 0) setSessionId(data.sessions[0].id);
    })();
  }, []);

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
    if (!sessionId) {
      setError("Velg en økt.");
      return;
    }
    if (!birthMonth || !birthDay) {
      setError("Velg fødselsmåned og fødselsdag.");
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
      setError(data?.error ?? "Noe gikk galt.");
      return;
    }

    setMessage("Du er registrert.");
    setName("");
    setLevel("Nybegynner");
    setBirthMonth(null);
    setBirthDay(null);
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
        <span className="inline-flex rounded-full border border-[color:rgba(163,50,31,0.16)] bg-[rgba(163,50,31,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[color:rgb(139,45,29)]">
          Påmelding
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-[color:rgb(37,26,20)]">
          Påmelding til trening
        </h1>
        <p className="text-[color:rgb(94,77,70)]">
          Velg økt, skriv navn og oppgi fødselsmåned og fødselsdag for eventuell avmelding senere.
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
            onChange={(e) => setSessionId(Number(e.target.value))}
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
          <label className="text-sm font-medium">Navn</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Skriv navnet ditt"
            className="w-full rounded-2xl border bg-[rgba(251,245,239,0.72)] px-4 py-3 text-sm outline-none"
          />
          <div className="text-xs text-muted-foreground">Minimum 2 tegn.</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Nivå</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full rounded-2xl border bg-[rgba(251,245,239,0.72)] px-4 py-3 text-sm outline-none"
          >
            <option>Nybegynner</option>
            <option>Viderekommen</option>
            <option>Erfaren</option>
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
          className="w-full rounded-full bg-[color:rgb(163,50,31)] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(163,50,31,0.24)] disabled:opacity-50 hover:enabled:-translate-y-0.5 hover:enabled:bg-[color:rgb(145,43,25)]"
        >
          Registrer
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
