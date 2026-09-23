"use client";

import { useId, useState } from "react";
import SessionRoster from "@/app/components/SessionRoster";
import { useSitePreferences } from "@/app/components/SitePreferencesProvider";
import { useSessionRegistrations } from "@/app/components/useSessionRegistrations";
import { getRegistrationCopy } from "@/lib/registration-content";
import type { UpcomingSession } from "@/lib/sessions";

function ExpandedRoster({ session }: { session: UpcomingSession }) {
  const roster = useSessionRegistrations(session.id);

  return (
    <SessionRoster
      registrations={roster.registrations}
      capacity={session.capacity}
      error={roster.error}
      updatedAt={roster.updatedAt}
      availability={roster.availability ?? session}
      showReservationNotice={false}
    />
  );
}

export default function ScheduleSessionRoster({
  session,
  sessionLabel,
}: {
  session: UpcomingSession;
  sessionLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const { locale } = useSitePreferences();
  const copy = getRegistrationCopy(locale);

  return (
    <div className="mt-4">
      <button
        id={`${id}-toggle`}
        type="button"
        className="app-button-secondary inline-flex items-center justify-center gap-2"
        aria-expanded={expanded}
        aria-controls={`${id}-participants`}
        onClick={() => setExpanded((previous) => !previous)}
      >
        {expanded ? copy.hideParticipants : copy.showParticipants}
        <span className="sr-only"> · {sessionLabel}</span>
        <span aria-hidden="true">{expanded ? "−" : "+"}</span>
      </button>
      <div
        id={`${id}-participants`}
        role="region"
        aria-labelledby={`${id}-toggle`}
        hidden={!expanded}
      >
        {expanded && <ExpandedRoster session={session} />}
      </div>
    </div>
  );
}
