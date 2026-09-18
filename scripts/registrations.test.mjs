import assert from "node:assert/strict";
import { test } from "node:test";
import { load } from "./test-loader.mjs";

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
        if (sql.includes("INSERT INTO registrations")) inserted = values;
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
    assert.equal((await response.json()).registrationStatus, expectedStatus);
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
    { id: 1, name: "Anne Smith", status: "confirmed", is_tournament: true },
    { id: 2, name: "Bo Li", status: "waitlist", is_tournament: false },
    { id: 3, name: "Cam Jones", status: "waitlist", is_tournament: false },
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
