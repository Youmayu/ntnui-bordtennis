"use client";

import { useRef, useState } from "react";
import { useSitePreferences } from "@/app/components/SitePreferencesProvider";
import { useUpcomingSessions } from "@/app/components/useUpcomingSessions";
import { useSessionRegistrations } from "@/app/components/useSessionRegistrations";
import TurnstileWidget from "@/app/components/TurnstileWidget";
import FormPrivacyNotice from "@/app/components/FormPrivacyNotice";
import SessionRoster from "@/app/components/SessionRoster";
import TournamentReservationNotice from "@/app/components/TournamentReservationNotice";
import { getIntlLocale } from "@/lib/site-content";
import { getRegistrationCopy } from "@/lib/registration-content";
import { getTournamentCopy, getTournamentFormCopy } from "@/lib/tournament-content";
import { TOURNAMENT_PLAYERS } from "@/lib/tournament-team";

export default function TournamentPageContent() {
  const { locale, messages } = useSitePreferences();
  const copy = getTournamentFormCopy(locale);
  const { sessions, loading, error: sessionsError } = useUpcomingSessions();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const session = sessions.find((entry) => entry.id === selectedId) ?? sessions[0] ?? null;
  const [playerId, setPlayerId] = useState("");
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const pending = useRef(false);
  const [revision, setRevision] = useState(0);
  const roster = useSessionRegistrations(session?.id ?? null, null, revision);
  const availability = roster.availability ?? session;
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ text: string; waitlisted: boolean } | null>(null);
  const isFull = availability ? availability.available_spots + availability.reserved_count === 0 : false;
  const formatter = new Intl.DateTimeFormat(getIntlLocale(locale), {
    timeZone: "Europe/Oslo", weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });

  async function register(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || !session || !playerId || !token) return;
    pending.current = true;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/tournament-register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, playerId, turnstileToken: token }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(copy.errors[data.error as keyof typeof copy.errors] ?? copy.errors.unavailable);
        return;
      }
      const waitlisted = data.registrationStatus === "waitlist";
      setResult({
        text: waitlisted ? messages.register.successWaitlist
          : data.alreadyRegistered ? copy.already : messages.register.success,
        waitlisted,
      });
      setRevision((value) => value + 1);
    } catch {
      setError(copy.errors.unavailable);
    } finally {
      setToken("");
      pending.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-3">
        <span className="app-badge app-badge-tournament">{getTournamentCopy(locale).team}</span>
        <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--text-strong)]">{copy.title}</h1>
        <p className="text-[color:var(--text-muted)]">{copy.intro}</p>
        <p className="text-sm leading-6 text-[color:var(--text-soft)]">{copy.rule}</p>
      </div>
      <form onSubmit={register} className="app-surface space-y-5 p-6 sm:p-8">
        {loading && <p role="status">{getRegistrationCopy(locale).loading}</p>}
        {sessionsError && <p role="alert" className="app-alert-error">{getRegistrationCopy(locale).loadError}</p>}
        {!loading && !sessionsError && sessions.length === 0 && <p>{messages.schedule.empty}</p>}
        <div className="space-y-2">
          <label htmlFor="tournament-session" className="block text-sm font-medium">{messages.register.sessionLabel}</label>
          <select id="tournament-session" required disabled={submitting || !session}
            className="app-field w-full rounded-2xl px-4 py-3" value={session?.id ?? ""}
            onChange={(event) => { setSelectedId(Number(event.target.value)); setResult(null); setError(null); }}>
            {!session && <option value="">—</option>}
            {sessions.map((entry) => <option key={entry.id} value={entry.id}>{formatter.format(new Date(entry.starts_at))} · {entry.location}</option>)}
          </select>
        </div>
        <TournamentReservationNotice availability={availability} />
        {availability && new Date(availability.tournament_release_at) <= new Date(session?.current_time ?? 0) &&
          <p className="text-sm text-[color:var(--text-soft)]">{copy.released}</p>}
        <div className="space-y-2">
          <label htmlFor="tournament-player" className="block text-sm font-medium">{copy.player}</label>
          <select id="tournament-player" required disabled={submitting} value={playerId}
            onChange={(event) => { setPlayerId(event.target.value); setResult(null); setError(null); }}
            className="app-field w-full rounded-2xl px-4 py-3">
            <option value="">{copy.choosePlayer}</option>
            {TOURNAMENT_PLAYERS.map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}
          </select>
        </div>
        <FormPrivacyNotice />
        <TurnstileWidget siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""} token={token} onTokenChange={setToken} />
        {isFull && <p className="app-alert-waitlist">{getRegistrationCopy(locale).waitlistSignup}</p>}
        <button type="submit" className="app-button-tournament w-full justify-center"
          disabled={submitting || !session || !playerId || !token || sessionsError}>
          {submitting ? copy.submitting : isFull ? getRegistrationCopy(locale).joinWaitlist : messages.register.submit}
        </button>
        {error && <p role="alert" className="app-alert-error">{error}</p>}
        {result && <p role="status" className={result.waitlisted ? "app-alert-waitlist" : "app-alert-success"}>{result.text}</p>}
        <p className="text-sm text-[color:var(--text-soft)]">{copy.cancel}</p>
      </form>
      {session && <section className="app-surface p-6 sm:p-8">
        <h2 className="app-panel-title">{getRegistrationCopy(locale).title}</h2>
        <SessionRoster registrations={roster.registrations} capacity={session.capacity}
          error={roster.error} updatedAt={roster.updatedAt} availability={availability} />
      </section>}
    </div>
  );
}
