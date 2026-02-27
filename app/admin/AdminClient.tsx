"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminClient({
  registrations,
  updateAction,
  deleteAction,
}: {
  registrations: {
    id: number;
    session_id: number;
    name: string;
    level: string;
    created_at: string;
  }[];
  updateAction: (fd: FormData) => Promise<void>;
  deleteAction: (fd: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);

  async function runAction(
    action: (fd: FormData) => Promise<void>,
    fd: FormData,
    id: number
  ) {
    setBusyId(id);
    await action(fd);
    router.refresh();
    setBusyId(null);
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-muted-foreground">
          <tr className="border-b">
            <th className="py-2 pr-3">Tid</th>
            <th className="py-2 pr-3">Session</th>
            <th className="py-2 pr-3">Navn</th>
            <th className="py-2 pr-3">Nivå</th>
            <th className="py-2 pr-3">Lagre</th>
            <th className="py-2">Slett</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((r) => (
            <tr key={r.id} className="border-b last:border-0 align-top">
              <td className="py-3 pr-3 whitespace-nowrap">
                {new Date(r.created_at).toLocaleString("no-NO", {
                  timeZone: "Europe/Oslo",
                })}
              </td>
              <td className="py-3 pr-3">{r.session_id}</td>

              <td className="py-3 pr-3">
                <input
                  form={`update-${r.id}`}
                  name={`name-${r.id}`}
                  defaultValue={r.name}
                  className="w-56 rounded-lg border bg-background px-2 py-1"
                />
              </td>

              <td className="py-3 pr-3">
                <select
                  form={`update-${r.id}`}
                  name={`level-${r.id}`}
                  defaultValue={r.level}
                  className="rounded-lg border bg-background px-2 py-1"
                >
                  <option>Nybegynner</option>
                  <option>Viderekommen</option>
                  <option>Erfaren</option>
                </select>
              </td>

              <td className="py-3 pr-3">
                <form
                  id={`update-${r.id}`}
                  action={async (fd) => {
                    const real = new FormData();
                    real.set("id", String(r.id));
                    real.set("name", String(fd.get(`name-${r.id}`) ?? ""));
                    real.set("level", String(fd.get(`level-${r.id}`) ?? ""));
                    await runAction(updateAction, real, r.id);
                  }}
                >
                  <button
                    className="rounded-lg bg-primary px-3 py-1 text-primary-foreground disabled:opacity-50"
                    disabled={busyId === r.id}
                  >
                    Lagre
                  </button>
                </form>
              </td>

              <td className="py-3">
                <form
                  action={async () => {
                    const real = new FormData();
                    real.set("id", String(r.id));
                    await runAction(deleteAction, real, r.id);
                  }}
                >
                  <button
                    className="rounded-lg border px-3 py-1 hover:bg-muted disabled:opacity-50"
                    disabled={busyId === r.id}
                  >
                    Slett
                  </button>
                </form>
              </td>
            </tr>
          ))}

          {registrations.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-muted-foreground">
                Ingen påmeldinger enda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}