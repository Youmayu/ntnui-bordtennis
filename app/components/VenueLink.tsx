"use client";

import {
  MAZEMAP_URL,
  formatVenueLabel,
  isDefaultVenueLocation,
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

  if (location && !isDefaultVenueLocation(location)) {
    return <span className={textClassName}>{label}</span>;
  }

  return (
    <a
      href={MAZEMAP_URL}
      target="_blank"
      rel="noreferrer"
      className={joinClasses("app-venue-link", className)}
    >
      <span className={textClassName}>{label}</span>
      {showMazeMapBadge && (
        <span className={joinClasses("app-map-button", badgeClassName)}>
          MazeMap
        </span>
      )}
    </a>
  );
}
