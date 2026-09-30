"use client";

import {
  TRAINING_VENUES,
  formatVenueLabel,
  getTrainingVenue,
  type Locale,
} from "@/lib/site-content";

type VenueLinkProps = {
  locale: Locale;
  location?: string | null;
  className?: string;
  textClassName?: string;
  showMazeMapBadge?: boolean;
  badgeClassName?: string;
};

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function VenueLink({
  locale,
  location,
  className,
  textClassName,
  showMazeMapBadge = false,
  badgeClassName,
}: VenueLinkProps) {
  const label = formatVenueLabel(location, locale);

  const venue = getTrainingVenue(location);

  if (location?.trim() && !venue) {
    return <span className={textClassName}>{label}</span>;
  }

  const venues = venue ? [venue] : TRAINING_VENUES;

  return (
    <span className="inline-flex flex-wrap gap-x-4 gap-y-2">
      {venues.map((trainingVenue) => (
        <a
          key={trainingVenue.room}
          href={trainingVenue.mapUrl}
          target="_blank"
          rel="noreferrer"
          className={joinClasses("app-venue-link", className)}
        >
          <span className={textClassName}>{trainingVenue.label}</span>
          {showMazeMapBadge && (
            <span className={joinClasses("app-map-button", badgeClassName)}>
              MazeMap
            </span>
          )}
        </a>
      ))}
    </span>
  );
}
