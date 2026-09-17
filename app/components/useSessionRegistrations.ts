"use client";

import { useEffect, useState } from "react";
import type { PublicRegistration } from "@/lib/registrations";

export function useSessionRegistrations(
  sessionId: number | null,
  initialRegistrations: PublicRegistration[] | null = null,
  refreshVersion = 0
) {
  const [revision, setRevision] = useState(0);
  const [snapshot, setSnapshot] = useState({
    sessionId,
    registrations: initialRegistrations,
    error: false,
  });

  useEffect(() => {
    if (!sessionId) return;

    const controller = new AbortController();
    let pending = false;

    async function refresh() {
      if (pending || document.visibilityState === "hidden") return;
      pending = true;
      try {
        const response = await fetch(`/api/registrations?sessionId=${sessionId}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Could not load registrations");
        const data = await response.json();
        if (!Array.isArray(data.registrations)) throw new Error("Invalid registrations");
        if (!controller.signal.aborted) {
          setSnapshot({ sessionId, registrations: data.registrations, error: false });
        }
      } catch {
        if (!controller.signal.aborted) {
          setSnapshot((previous) => ({
            sessionId,
            registrations: previous.sessionId === sessionId
              ? previous.registrations
              : initialRegistrations,
            error: true,
          }));
        }
      } finally {
        pending = false;
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
  }, [sessionId, initialRegistrations, refreshVersion, revision]);

  return {
    registrations: snapshot.sessionId === sessionId ? snapshot.registrations : initialRegistrations,
    error: snapshot.sessionId === sessionId && snapshot.error,
    refresh: () => setRevision((value) => value + 1),
  };
}
