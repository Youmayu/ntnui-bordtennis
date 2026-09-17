"use client";

import { useEffect, useState } from "react";
import type { PublicRegistration } from "@/lib/registrations";

export function useSessionRegistrations(
  sessionId: number | null,
  initialRegistrations: PublicRegistration[] | null = null,
  refreshVersion = 0
) {
  const [snapshot, setSnapshot] = useState({
    sessionId,
    registrations: initialRegistrations,
    error: false,
    updatedAt: null as string | null,
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
          setSnapshot({
            sessionId,
            registrations: data.registrations,
            error: false,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch {
        if (!controller.signal.aborted) {
          setSnapshot((previous) => ({
            sessionId,
            registrations: previous.sessionId === sessionId
              ? previous.registrations
              : initialRegistrations,
            error: true,
            updatedAt: previous.sessionId === sessionId ? previous.updatedAt : null,
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
  }, [sessionId, initialRegistrations, refreshVersion]);

  return {
    registrations: snapshot.sessionId === sessionId ? snapshot.registrations : initialRegistrations,
    error: snapshot.sessionId === sessionId && snapshot.error,
    updatedAt: snapshot.sessionId === sessionId ? snapshot.updatedAt : null,
  };
}
