import assert from "node:assert/strict";
import { test } from "node:test";
import { load } from "./test-loader.mjs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const { sanitizeRegistrationName } = load("lib/input-safety.ts");

test("requires both name parts without rejecting international or compound names", () => {
  assert.equal(sanitizeRegistrationName("  Anne–Marie ", " O’Neill  "), "Anne-Marie O'Neill");
  assert.equal(sanitizeRegistrationName("José Luis", "de la Cruz"), "José Luis de la Cruz");
  assert.equal(sanitizeRegistrationName("明", "王"), "明 王");
  assert.equal(sanitizeRegistrationName("A", "Li"), "A Li");
  assert.equal(sanitizeRegistrationName("Jose\u0301", "García"), "José García");
  for (const [first, last] of [["", "Li"], ["Anne", "   "], ["Anne", "---"], ["123", "Li"], ["<img>", "Li"], [null, "Li"], ["Anne", undefined], [42, "Li"]]) {
    assert.equal(sanitizeRegistrationName(first, last), null);
  }
});

test("enforces the database's combined 80-character name limit", () => {
  assert.equal(sanitizeRegistrationName("A".repeat(78), "B")?.length, 80);
  assert.equal(sanitizeRegistrationName("A".repeat(79), "B"), null);
});

test("signup rejects missing name parts and legacy name-only requests before external calls", async () => {
  const { POST } = load("app/api/register/route.ts", {
    "@/lib/db": { pool: { connect: () => assert.fail("Unexpected database connection") } },
  }, { fetch: () => assert.fail("Unexpected CAPTCHA verification") });
  for (const input of [{ name: "Anne Smith" }, { firstName: "Anne" }, { lastName: "Smith" }, { firstName: "Anne", lastName: "  " }]) {
    const response = await POST(new Request("http://localhost/api/register", {
      method: "POST", body: JSON.stringify({ sessionId: 1, ...input }),
    }));
    assert.equal(response.status, 400);
  }
});

for (const confirmedCount of [0, 1]) {
  test(`signup stores the full name with ${confirmedCount ? "waitlist" : "confirmed"} status`, async () => {
    let inserted;
    let released = false;
    let committed = false;
    const client = {
      async query(sql, values) {
        if (sql.includes("SELECT capacity")) return { rows: [{ capacity: 1, session_open: true, reservations_active: false, tournament_release_at: new Date("2026-09-21T00:00:00Z") }], rowCount: 1 };
        if (sql.includes("COUNT(*)")) return { rows: [{ count: confirmedCount, tournament_count: 0 }], rowCount: 1 };
        if (sql.includes("SELECT id")) return { rows: [], rowCount: 0 };
        if (sql.includes("SELECT members_only")) return { rows: [{ members_only: false }], rowCount: 1 };
        if (sql.includes("INSERT INTO registrations")) {
          inserted = values;
          return { rows: [{ id: 42 }], rowCount: 1 };
        }
        else if (sql === "COMMIT") committed = true;
        else if (sql !== "BEGIN") assert.fail(`Unexpected query: ${sql}`);
        return { rows: [], rowCount: 0 };
      },
      release() { released = true; },
    };
    const { POST } = load("app/api/register/route.ts", {
      "@/lib/db": { pool: { connect: async () => client } },
      "@/lib/session-access": { getSessionAccessSchema: async () => ({ hasSessionMembersOnly: true }) },
    }, { fetch: async () => Response.json({ success: true }) });
    const response = await POST(new Request("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify({ sessionId: 1, firstName: " Anne–Marie ", lastName: "O’Neill", level: "Nybegynner", birthMonth: 2, birthDay: 29, turnstileToken: "test" }),
    }));
    const expectedStatus = confirmedCount ? "waitlist" : "confirmed";
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      ok: true, alreadyRegistered: false, registrationId: 42, registrationStatus: expectedStatus,
    });
    assert.deepEqual(Array.from(inserted), [1, "Anne-Marie O'Neill", "Nybegynner", 2, 29, expectedStatus]);
    assert.ok(committed && released);
  });
}

test("public roster includes both statuses, preserves queue order and exposes no birth details", async () => {
  const client = {
    release() {},
    async query(sql, values) {
      if (["BEGIN", "COMMIT"].includes(sql)) return { rows: [] };
      assert.match(sql, /r\.created_at ASC,\s*r\.id ASC/);
      assert.equal(values[0], 7);
      return { rows: [
        { id: 1, name: " Anne\nSmith ", status: "confirmed", is_tournament: true, birth_month: 1, birth_day: 2 },
        { id: 2, name: "Bo Li", status: "waitlist", is_tournament: false, birth_month: 3, birth_day: 4 },
        { id: 3, name: "Cam Jones", status: "waitlist", is_tournament: false, birth_month: 5, birth_day: 6 },
      ] };
    },
  };
  const { GET } = load("app/api/registrations/route.ts", {
    "@/lib/db": { pool: { connect: async () => client } },
    "@/lib/registrations": {
      REGISTRATION_STATUS: { CONFIRMED: "confirmed" },
      fillConfirmedSlotsFromWaitlist: async () => ({ sessionExists: true, sessionOpen: true,
        reservedCount: 4, availableSpots: 0, tournamentReleaseAt: "2026-09-20T22:00:00Z" }),
    },
  });
  const response = await GET(new Request("http://localhost/api/registrations?sessionId=7"));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.deepEqual((await response.json()).registrations, [
    { id: 1, name: "Anne Smith", status: "confirmed", is_tournament: true, is_board: false },
    { id: 2, name: "Bo Li", status: "waitlist", is_tournament: false, is_board: false },
    { id: 3, name: "Cam Jones", status: "waitlist", is_tournament: false, is_board: false },
  ]);
});

test("public roster rejects absent, fractional and invalid session IDs", async () => {
  const { GET } = load("app/api/registrations/route.ts", {
    "@/lib/db": { pool: { query: () => assert.fail("Unexpected database query") } },
  });
  for (const value of ["", "0", "-1", "1.5", "NaN", "Infinity"]) {
    assert.equal((await GET(new Request(`http://localhost/api/registrations?sessionId=${value}`))).status, 400);
  }
});

test("home and schedule offer waiting-list signup only below the limit, and rosters show the two-player cap", () => {
  const { getMessages } = load("lib/site-content.ts");
  for (const count of [0, 1, 2, 3]) {
    const session = {
      id: 1, starts_at: "2026-09-23T16:00:00Z", ends_at: "2026-09-23T18:00:00Z",
      current_time: "2026-09-21T12:00:00Z", location: "B217", capacity: 1,
      confirmed_count: 1, waitlist_count: count, attending_board_member_ids: [], members_only: false,
      reserve_tournament_spots: false, reserved_count: 0, available_spots: 0,
      tournament_release_at: "2026-09-20T22:00:00Z", registration_closed: count >= 2,
    };
    const registrations = [
      { id: 1, name: "Anne Smith", status: "confirmed" },
      ...Array.from({ length: count }, (_, index) => ({ id: index + 2, name: `Waiting player ${index}`, status: "waitlist" })),
    ];
    const mocks = {
      "@/app/components/SitePreferencesProvider": { useSitePreferences: () => ({ locale: "en", messages: getMessages("en") }) },
      "@/app/components/VenueLink": { default: () => null },
      "@/app/components/DiscordInvitation": { default: () => null },
      "@/app/components/FirstTrainingSection": { default: () => null },
      "@/app/components/TournamentReservationNotice": { default: () => null },
      "@/app/components/ScheduleSessionRoster": { default: () => null },
      "@/app/components/useSessionRegistrations": { useSessionRegistrations: () => ({ registrations, availability: session, error: false, updatedAt: null }) },
      "@/app/components/useUpcomingSessions": { useUpcomingSessions: () => ({ sessions: [session], error: false }) },
    };
    const Roster = load("app/components/SessionRoster.tsx", mocks).default;
    mocks["@/app/components/SessionRoster"] = { default: Roster };
    const Home = load("app/components/HomePageContent.tsx", mocks).default;
    const Schedule = load("app/components/SchedulePageContent.tsx", mocks).default;
    for (const html of [
      renderToStaticMarkup(createElement(Home, { session, initialRegistrations: registrations, boardAttendanceAvailable: false, initialAvailability: session })),
      renderToStaticMarkup(createElement(Schedule, { sessions: [session] })),
    ]) {
      if (count >= 2) {
        assert.match(html, /<button[^>]*disabled=""[^>]*>Registration closed/);
        assert.doesNotMatch(html, /href="\/en\/register/);
      } else {
        assert.match(html, /href="\/en\/register/);
        assert.match(html, /Join waiting list/);
      }
    }
    const rosterHtml = renderToStaticMarkup(createElement(Roster, { registrations, capacity: 1, error: false, updatedAt: null, availability: session }));
    assert.ok(rosterHtml.includes(`${count}/2`));
    assert.ok(rosterHtml.includes(count >= 2 ? "Registration closed" : "limited to 2 players"));
  }
});
