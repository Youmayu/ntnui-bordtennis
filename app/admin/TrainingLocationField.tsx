"use client";

import { useId, useState } from "react";
import {
  DEFAULT_SESSION_LOCATION,
  TRAINING_VENUES,
  getTrainingVenue,
} from "@/lib/site-content";

export default function TrainingLocationField({
  defaultValue = DEFAULT_SESSION_LOCATION,
}: {
  defaultValue?: string;
}) {
  const id = useId();
  const initialVenue = getTrainingVenue(defaultValue);
  const [location, setLocation] = useState(initialVenue?.label ?? "");
  const [showMap, setShowMap] = useState(false);
  const venue = getTrainingVenue(location);

  return (
    <>
      <label htmlFor={id} className="text-xs text-[color:var(--text-soft)]">Sted</label>
      <select
        id={id}
        name="location"
        value={location}
        onChange={(event) => setLocation(event.target.value)}
        className="app-field rounded-2xl px-4 py-3 text-sm outline-none"
        required
      >
        {!initialVenue && <option value="" disabled>Velg rom (tidligere: {defaultValue})</option>}
        {TRAINING_VENUES.map((option) => (
          <option key={option.room} value={option.label}>{option.label}</option>
        ))}
      </select>
      {venue && (
        <details className="mt-2 text-sm" onToggle={(event) => setShowMap(event.currentTarget.open)}>
          <summary className="cursor-pointer text-[color:var(--accent)]">Vis {venue.room} i MazeMap</summary>
          {showMap && (
            <div className="mt-3 space-y-2">
              <iframe
                key={venue.room}
                src={venue.embedUrl}
                title={`MazeMap – ${venue.label}`}
                width="600"
                height="420"
                className="w-full rounded-2xl border border-[color:var(--border-muted)]"
                loading="lazy"
                allow="geolocation"
              />
              <a href={venue.mapUrl} target="_blank" rel="noreferrer" className="app-roster-link">
                Åpne {venue.room} i MazeMap
              </a>
              <div className="text-xs text-[color:var(--text-soft)]">
                <a href="https://www.mazemap.com/" target="_blank" rel="noreferrer">Map by MazeMap</a>
              </div>
            </div>
          )}
        </details>
      )}
    </>
  );
}
