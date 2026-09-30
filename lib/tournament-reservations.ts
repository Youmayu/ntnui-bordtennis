export const TOURNAMENT_RESERVED_SPOTS = 5;

export type SessionAvailability = {
  reserve_tournament_spots: boolean;
  reserved_count: number;
  available_spots: number;
  tournament_release_at: string;
};

// Keep the previous behavior until the optional per-session setting is migrated.
export function getTournamentReservationsSelectSql(hasColumn: boolean, alias: string) {
  return hasColumn ? `${alias}.reserve_tournament_spots` : "TRUE";
}

export function getReservedSpotCount(
  capacity: number,
  confirmedCount: number,
  tournamentCount: number,
  reservationsActive: boolean
) {
  if (!reservationsActive) return 0;
  return Math.max(0, Math.min(
    Math.min(TOURNAMENT_RESERVED_SPOTS, capacity) - tournamentCount,
    capacity - confirmedCount
  ));
}

// Calendar days in Norway, rather than 48 hours before the start time.
// PostgreSQL applies the correct UTC offset, including daylight-saving changes.
export function tournamentReleaseSql(startsAtColumn = "starts_at") {
  return `(((${startsAtColumn} AT TIME ZONE 'Europe/Oslo')::date - 2)::timestamp AT TIME ZONE 'Europe/Oslo')`;
}
