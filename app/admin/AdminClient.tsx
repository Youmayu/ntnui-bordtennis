"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type RegistrationRow = {
  id: number;
  session_id: number;
  name: string;
  level: string;
  status: string;
  created_at: string;
};

function getStatusBadgeClass(status: string) {
  return status === "waitlist" ? "app-badge app-badge-accent" : "app-badge app-badge-success";
}

function getStatusLabel(status: string) {
  return status === "waitlist" ? "Venteliste" : "Bekreftet";
}

export default function AdminClient({
  registrations,
  updateAction,
  deleteAction,
}: {
  registrations: RegistrationRow[];
  updateAction: (fd: FormData) => Promise<void>;
  deleteAction: (fd: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [sessionFilter, setSessionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const sessionOptions = useMemo(
    () => [...new Set(registrations.map((registration) => registration.session_id))].sort((a, b) => a - b),
    [registrations]
  );

  const filteredRegistrations = useMemo(
    () =>
      registrations.filter((registration) => {
        const matchesQuery =
          query.trim() === "" ||
          registration.name.toLowerCase().includes(query.trim().toLowerCase());
        const matchesSession =
          sessionFilter === "all" || String(registration.session_id) === sessionFilter;
        const matchesStatus =
          statusFilter === "all" || registration.status === statusFilter;

        return matchesQuery && matchesSession && matchesStatus;
      }),
    [query, registrations, sessionFilter, statusFilter]
  );

  const confirmedCount = filteredRegistrations.filter((registration) => registration.status !== "waitlist").length;
  const waitlistCount = filteredRegistrations.length - confirmedCount;

  async function runAction(
    action: (fd: FormData) => Promise<void>,
    fd: FormData,
    id: number
  ) {
    setBusyId(id);
    try {
      await action(fd);
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_160px]">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[color:var(--text-soft)]">Sok pa navn</label>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
            placeholder="Finn spiller"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-[color:var(--text-soft)]">Session</label>
          <select
            value={sessionFilter}
            onChange={(event) => setSessionFilter(event.target.value)}
            className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
          >
            <option value="all">Alle</option>
            {sessionOptions.map((sessionId) => (
              <option key={sessionId} value={String(sessionId)}>
                Session {sessionId}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-[color:var(--text-soft)]">Status</label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
          >
            <option value="all">Alle</option>
            <option value="confirmed">Bekreftet</option>
            <option value="waitlist">Venteliste</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <span className="app-badge app-badge-neutral">
          Viser {filteredRegistrations.length} av {registrations.length}
        </span>
        <span className="app-badge app-badge-success">{confirmedCount} bekreftet</span>
        <span className="app-badge app-badge-accent">{waitlistCount} venteliste</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-strong)]">
        <table className="w-full text-sm">
          <thead className="text-left text-[color:var(--text-soft)]">
            <tr className="border-b border-[color:var(--border-muted)]">
              <th className="px-4 py-3 pr-3">Tid</th>
              <th className="px-4 py-3 pr-3">Session</th>
              <th className="px-4 py-3 pr-3">Navn</th>
              <th className="px-4 py-3 pr-3">Niva</th>
              <th className="px-4 py-3 pr-3">Status</th>
              <th className="px-4 py-3 pr-3">Lagre</th>
              <th className="px-4 py-3">Slett</th>
            </tr>
          </thead>
          <tbody>
            {filteredRegistrations.map((registration) => (
              <tr
                key={registration.id}
                className="border-b border-[color:var(--border-muted)] align-top last:border-0"
              >
                <td className="px-4 py-4 pr-3 whitespace-nowrap text-[color:var(--text-muted)]">
                  {new Date(registration.created_at).toLocaleString("no-NO", {
                    timeZone: "Europe/Oslo",
                  })}
                </td>

                <td className="px-4 py-4 pr-3">
                  <span className="app-badge app-badge-neutral">#{registration.session_id}</span>
                </td>

                <td className="px-4 py-4 pr-3">
                  <input
                    form={`update-${registration.id}`}
                    name={`name-${registration.id}`}
                    defaultValue={registration.name}
                    maxLength={80}
                    className="app-field min-w-[220px] rounded-2xl px-4 py-3 text-sm outline-none"
                  />
                </td>

                <td className="px-4 py-4 pr-3">
                  <select
                    form={`update-${registration.id}`}
                    name={`level-${registration.id}`}
                    defaultValue={registration.level}
                    className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
                  >
                    <option>Nybegynner</option>
                    <option>Viderekommen</option>
                    <option>Erfaren</option>
                  </select>
                </td>

                <td className="px-4 py-4 pr-3">
                  <span className={getStatusBadgeClass(registration.status)}>
                    {getStatusLabel(registration.status)}
                  </span>
                </td>

                <td className="px-4 py-4 pr-3">
                  <form
                    id={`update-${registration.id}`}
                    action={async (fd) => {
                      const real = new FormData();
                      real.set("id", String(registration.id));
                      real.set("name", String(fd.get(`name-${registration.id}`) ?? ""));
                      real.set("level", String(fd.get(`level-${registration.id}`) ?? ""));
                      await runAction(updateAction, real, registration.id);
                    }}
                  >
                    <button
                      className="app-button-primary inline-flex"
                      disabled={busyId === registration.id}
                    >
                      Lagre
                    </button>
                  </form>
                </td>

                <td className="px-4 py-4">
                  <form
                    action={async () => {
                      const real = new FormData();
                      real.set("id", String(registration.id));
                      await runAction(deleteAction, real, registration.id);
                    }}
                  >
                    <button
                      className="app-button-secondary inline-flex"
                      disabled={busyId === registration.id}
                    >
                      Slett
                    </button>
                  </form>
                </td>
              </tr>
            ))}

            {filteredRegistrations.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[color:var(--text-muted)]">
                  Ingen pameldinger matcher filtrene.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
