"use client";

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";

type Session = {
  id: number;
  starts_at: string;
  ends_at: string;
  location: string;
  capacity: number;
};

export default function RegisterPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [level, setLevel] = useState("Nybegynner");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const disabled = useMemo(() => name.trim().length < 2 || !sessionId, [name, sessionId]);

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
    const turnstileToken = String(fd.get("cf-turnstile-response") ?? "");

    if (!turnstileToken) {
      setError("Fullfør CAPTCHA før du sender inn.");
      return;
    }
    if (!sessionId) {
      setError("Velg en økt.");
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        name,
        level,
        turnstileToken,
        // honeypot
        website: "",
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data?.error ?? "Noe gikk galt.");
      return;
    }

    setMessage("Du er registrert.");
    setName("");
    setLevel("Nybegynner");
    // note: Turnstile token is single-use; user will solve again for another submit
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Påmelding</h1>
      <p className="text-muted-foreground">Velg økt og registrer deg. Last inn siden på nytt hvis CAPTCHA ikke dukker opp.</p>

      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />

      <form onSubmit={onSubmit} className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Økt</label>
          <select
            value={sessionId ?? ""}
            onChange={(e) => setSessionId(Number(e.target.value))}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {new Date(s.starts_at).toLocaleString("no-NO", { timeZone: "Europe/Oslo", weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} — {s.location}
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
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
          />
          <div className="text-xs text-muted-foreground">Minimum 2 tegn.</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Nivå</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
          >
            <option>Nybegynner</option>
            <option>Viderekommen</option>
            <option>Erfaren</option>
          </select>
        </div>

        <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />

        <button
          type="submit"
          disabled={disabled}
          className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Registrer
        </button>

        {error && <div className="rounded-xl border bg-muted px-3 py-2 text-sm">{error}</div>}
        {message && <div className="rounded-xl border bg-muted px-3 py-2 text-sm">{message}</div>}
      </form>
    </div>
  );
}