"use client";

import { useEffect, useState } from "react";
import type { UpcomingSession } from "@/lib/sessions";

export function useUpcomingSessions(initialSessions: UpcomingSession[] = []) {
  const [sessions, setSessions] = useState(initialSessions);
  const [loading, setLoading] = useState(initialSessions.length === 0);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    async function refresh() {
      if (pending || document.visibilityState === "hidden") return;
      pending = true;
      try {
        const response = await fetch("/api/sessions", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Could not load sessions");
        const data = await response.json();
        if (!Array.isArray(data.sessions)) throw new Error("Invalid sessions");
        if (!controller.signal.aborted) {
          setSessions(data.sessions);
          setError(false);
        }
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        pending = false;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void refresh();
    const interval = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  return { sessions, loading, error };
}
