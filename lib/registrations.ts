import type { PoolClient } from "pg";

export const REGISTRATION_STATUS = {
  CONFIRMED: "confirmed",
  WAITLIST: "waitlist",
} as const;

export type RegistrationStatus =
  (typeof REGISTRATION_STATUS)[keyof typeof REGISTRATION_STATUS];

type Queryable = Pick<PoolClient, "query">;

type SessionStateRow = {
  capacity: number;
  session_open: boolean;
};

type CountRow = {
  count: number;
};

type RegistrationRow = {
  id: number;
};

export async function fillConfirmedSlotsFromWaitlist(
  client: Queryable,
  sessionId: number
) {
  const sessionRes = await client.query<SessionStateRow>(
    `SELECT capacity, ends_at > NOW() AS session_open
     FROM sessions
     WHERE id = $1
     FOR UPDATE`,
    [sessionId]
  );

  if (sessionRes.rowCount === 0) {
    return { sessionExists: false as const, sessionOpen: false as const, promotedCount: 0, capacity: 0 };
  }

  const { capacity, session_open: sessionOpen } = sessionRes.rows[0];

  if (!sessionOpen) {
    return { sessionExists: true as const, sessionOpen: false as const, promotedCount: 0, capacity };
  }

  let promotedCount = 0;

  while (true) {
    const confirmedCount = await getConfirmedRegistrationCount(client, sessionId);

    if (confirmedCount >= capacity) {
      break;
    }

    const waitlistRes = await client.query<RegistrationRow>(
      `SELECT id
       FROM registrations
       WHERE session_id = $1
         AND status = $2
       ORDER BY created_at ASC, id ASC
       LIMIT 1
       FOR UPDATE`,
      [sessionId, REGISTRATION_STATUS.WAITLIST]
    );

    if (waitlistRes.rowCount === 0) {
      break;
    }

    await client.query(
      `UPDATE registrations
       SET status = $2
       WHERE id = $1`,
      [waitlistRes.rows[0].id, REGISTRATION_STATUS.CONFIRMED]
    );

    promotedCount += 1;
  }

  return { sessionExists: true as const, sessionOpen: true as const, promotedCount, capacity };
}

export async function getConfirmedRegistrationCount(
  client: Queryable,
  sessionId: number
) {
  const confirmedRes = await client.query<CountRow>(
    `SELECT COUNT(*)::int AS count
     FROM registrations
     WHERE session_id = $1
       AND status = $2`,
    [sessionId, REGISTRATION_STATUS.CONFIRMED]
  );

  return confirmedRes.rows[0]?.count ?? 0;
}
