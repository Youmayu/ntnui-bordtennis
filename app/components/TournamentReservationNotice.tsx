"use client";

import { useSitePreferences } from "@/app/components/SitePreferencesProvider";
import { getIntlLocale } from "@/lib/site-content";
import { getTournamentCopy } from "@/lib/tournament-content";
import type { SessionAvailability } from "@/lib/tournament-reservations";

export default function TournamentReservationNotice({ availability }: { availability: SessionAvailability | null }) {
  const { locale } = useSitePreferences();
  const copy = getTournamentCopy(locale);
  if (!availability?.reserved_count) return null;
  return (
    <div className="app-tournament-notice">
      <p className="font-semibold">{copy.reserved}: {availability.reserved_count}</p>
      <p className="mt-1 text-sm">
        {copy.release}{" "}
        <time dateTime={availability.tournament_release_at}>
          {new Intl.DateTimeFormat(getIntlLocale(locale), {
            timeZone: "Europe/Oslo", weekday: "long", day: "numeric", month: "short",
            hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZoneName: "short",
          }).format(new Date(availability.tournament_release_at))}
        </time>
      </p>
    </div>
  );
}
