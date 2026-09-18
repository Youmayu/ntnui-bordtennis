import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { before, after, beforeEach, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { load } from "./test-loader.mjs";

// Execute the actual migration and handlers against an isolated PostgreSQL
// engine. Only the database clock and external CAPTCHA service are substituted.
const db = new PGlite();
let now = "2026-09-20T21:59:59Z"; // Sunday 23:59:59 in Oslo.
let tail = Promise.resolve();
const query = async (sql, values) => {
  const result = await db.query(sql.replace(/NOW\(\)|clock_timestamp\(\)/g, `TIMESTAMPTZ '${now}'`), values);
  return { ...result, rowCount: result.rows.length || result.affectedRows || 0 };
};
const pool = {
  query,
  async connect() {
    const previous = tail;
    let release;
    tail = new Promise((resolve) => { release = resolve; });
    await previous;
    return { query, release };
  },
};
const mocks = { "@/lib/db": { pool }, "@/lib/auto-schedule": { ensureAutoScheduledSessions: async () => {} } };
const globals = { fetch: async () => Response.json({ success: true }) };
const publicPost = load("app/api/register/route.ts", mocks, globals).POST;
const teamPost = load("app/api/tournament-register/route.ts", mocks, globals).POST;
const unregisterPost = load("app/api/unregister/route.ts", mocks, globals).POST;
const rosterGet = load("app/api/registrations/route.ts", mocks).GET;
const sessionsGet = load("app/api/sessions/route.ts", mocks).GET;
const { tournamentReleaseSql } = load("lib/tournament-reservations.ts");
const { TOURNAMENT_PLAYERS } = load("lib/tournament-team.ts");

before(async () => {
  const migration = readFileSync(new URL("./init-db.js", import.meta.url), "utf8")
    .split("await pool.query(`")[1].split("`);")[0];
  await db.exec(migration);
  await db.exec(migration); // Migration must be safe to rerun.
});
after(async () => { await db.close(); });
beforeEach(async () => {
  now = "2026-09-20T21:59:59Z";
  await db.exec("TRUNCATE sessions RESTART IDENTITY CASCADE");
  await query(`INSERT INTO sessions (starts_at, ends_at, location, capacity, members_only)
    VALUES ('2026-09-23T16:00:00Z', '2026-09-23T18:00:00Z', 'Dragvoll B217', 8, FALSE)`);
});

async function post(handler, body) {
  const response = await handler(new Request("http://localhost/api/test", {
    method: "POST", body: JSON.stringify(body),
  }));
  return { status: response.status, body: await response.json() };
}
function publicSignup(overrides = {}) {
  return post(publicPost, { sessionId: 1, firstName: "Anne", lastName: "Smith", level: "Nybegynner",
    birthMonth: 2, birthDay: 29, turnstileToken: "test", ...overrides });
}
function teamSignup(playerId = "lionel-kehl", overrides = {}) {
  return post(teamPost, { sessionId: 1, playerId, turnstileToken: "test", ...overrides });
}
async function seed(count, status = "confirmed") {
  for (let i = 0; i < count; i++) {
    await query(`INSERT INTO registrations (session_id, name, level, birth_month, birth_day, status)
      VALUES (1, $1, 'Nybegynner', 2, 29, $2)`, [`Player ${i}`, status]);
  }
}
async function roster() {
  return (await rosterGet(new Request("http://localhost/api/registrations?sessionId=1"))).json();
}

test("Wednesday reservation releases Monday midnight in Norway, including DST offsets", async () => {
  for (const [start, expected] of [
    ["2026-09-23T16:00:00Z", "2026-09-20T22:00:00.000Z"],
    ["2026-01-07T17:00:00Z", "2026-01-04T23:00:00.000Z"],
    ["2026-03-31T16:00:00Z", "2026-03-28T23:00:00.000Z"],
    ["2026-10-27T17:00:00Z", "2026-10-24T22:00:00.000Z"],
  ]) {
    const result = await query(`SELECT ${tournamentReleaseSql("$1::timestamptz")} AS release`, [start]);
    assert.equal(result.rows[0].release.toISOString(), expected);
  }
});

test("ordinary signups stop at capacity minus five; forged team fields give no priority", async () => {
  await seed(3);
  const result = await publicSignup({ playerId: "lionel-kehl", tournament_player_id: "lionel-kehl" });
  assert.equal(result.status, 200);
  assert.equal(result.body.registrationStatus, "waitlist");
  const state = await roster();
  assert.equal(state.availability.reserved_count, 5);
  assert.equal(state.availability.available_spots, 0);
  assert.equal(state.registrations.at(-1).is_tournament, false);
});

test("team signup uses a reserved spot with only identity and CAPTCHA; repeats are idempotent", async () => {
  await seed(3);
  for (let i = 0; i < 2; i++) {
    const result = await teamSignup();
    assert.equal(result.status, 200);
    assert.equal(result.body.registrationStatus, "confirmed");
    assert.equal(result.body.alreadyRegistered, i === 1);
  }
  const result = await query("SELECT * FROM registrations WHERE tournament_player_id IS NOT NULL");
  assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0].name, "Lionel Kehl");
  assert.equal(result.rows[0].birth_month, null);
  assert.equal(result.rows[0].level, null);
  assert.equal((await roster()).availability.reserved_count, 4);
});

test("all five roster identities, including Omkar, can claim the five spots", async () => {
  await seed(3);
  for (const player of TOURNAMENT_PLAYERS) {
    assert.equal((await teamSignup(player.id)).body.registrationStatus, "confirmed");
  }
  const state = await roster();
  assert.equal(state.registrations.length, 8);
  assert.equal(state.availability.reserved_count, 0);
  assert.equal(state.availability.available_spots, 0);
});

test("exact midnight releases only unused reservations and promotes the queue on a read", async () => {
  await seed(3);
  await teamSignup();
  await teamSignup("frank-lin");
  await seed(5, "waitlist");
  const before = await roster();
  assert.equal(before.availability.reserved_count, 3);
  assert.equal(before.registrations.filter((r) => r.status === "confirmed").length, 5);
  now = "2026-09-20T22:00:00Z";
  const released = await roster();
  assert.equal(released.availability.reserved_count, 0);
  assert.equal(released.registrations.filter((r) => r.status === "confirmed").length, 8);
  assert.equal(released.registrations.filter((r) => r.is_tournament && r.status === "confirmed").length, 2);
  assert.deepEqual(released.registrations.filter((r) => r.status === "waitlist").map((r) => r.name), ["Player 3", "Player 4"]);
});

test("after release, waiting players precede new team and ordinary signups", async () => {
  await seed(3);
  await seed(5, "waitlist");
  now = "2026-09-20T22:00:00Z";
  assert.equal((await teamSignup()).body.registrationStatus, "waitlist");
  assert.equal((await publicSignup()).body.registrationStatus, "waitlist");
  assert.equal((await roster()).registrations.filter((r) => r.status === "confirmed").length, 8);
});

test("sessions listing also reconciles released spots and exposes accurate counts", async () => {
  await seed(3);
  await seed(2, "waitlist");
  now = "2026-09-20T22:00:00Z";
  const response = await sessionsGet();
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  const session = (await response.json()).sessions[0];
  assert.equal(session.confirmed_count, 5);
  assert.equal(session.waitlist_count, 0);
  assert.equal(session.reserved_count, 0);
  assert.equal(session.available_spots, 3);
});

test("ordinary cancellation before the cutoff promotes one ordinary waiting player", async () => {
  await seed(3);
  await seed(2, "waitlist");
  const id = (await query("SELECT id FROM registrations ORDER BY id LIMIT 1")).rows[0].id;
  const response = await post(unregisterPost, { registrationId: id, birthMonth: 2, birthDay: 29, turnstileToken: "test" });
  assert.equal(response.status, 200);
  const state = await roster();
  assert.equal(state.availability.reserved_count, 5);
  assert.equal(state.registrations.filter((r) => r.status === "confirmed").length, 3);
  assert.equal(state.registrations.filter((r) => r.status === "waitlist").length, 1);
});

test("cancelling a team booking restores its reservation until the cutoff", async () => {
  await seed(3);
  await teamSignup();
  await seed(1, "waitlist");
  await query("DELETE FROM registrations WHERE tournament_player_id IS NOT NULL");
  assert.equal((await roster()).availability.reserved_count, 5);
  now = "2026-09-20T22:00:00Z";
  assert.equal((await roster()).registrations.filter((r) => r.status === "waitlist").length, 0);
});

test("public signup for an existing team booking cannot create a duplicate", async () => {
  await teamSignup();
  assert.equal((await publicSignup({ firstName: "Lionel", lastName: "Kehl" })).status, 409);
  assert.equal((await roster()).registrations.length, 1);
});

test("team signup upgrades an existing public waitlist entry without duplication", async () => {
  await seed(3);
  assert.equal((await publicSignup({ firstName: "Lionel", lastName: "Kehl" })).body.registrationStatus, "waitlist");
  assert.equal((await teamSignup()).body.registrationStatus, "confirmed");
  const state = await roster();
  assert.equal(state.registrations.length, 4);
  assert.equal(state.registrations.filter((r) => r.is_tournament).length, 1);
});

test("small capacities and pre-existing full sessions never overbook or displace players", async () => {
  await query("UPDATE sessions SET capacity = 2");
  assert.equal((await roster()).availability.reserved_count, 2);
  await seed(2);
  assert.equal((await teamSignup()).body.registrationStatus, "waitlist");
  const state = await roster();
  assert.equal(state.availability.reserved_count, 0);
  assert.equal(state.registrations.filter((r) => r.status === "confirmed").length, 2);
});

test("database uniqueness prevents duplicate identities within a session", async () => {
  await teamSignup();
  await assert.rejects(query(`INSERT INTO registrations (session_id, name, tournament_player_id)
    VALUES (1, 'Lionel Kehl', 'lionel-kehl')`), { code: "23505" });
});

test("concurrent duplicate requests return one booking", async () => {
  const responses = await Promise.all([teamSignup(), teamSignup(), teamSignup()]);
  assert.ok(responses.every((response) => response.status === 200));
  assert.equal((await roster()).registrations.length, 1);
});

test("missing/invalid CAPTCHA, unknown names, invalid IDs and ended sessions cannot register", async () => {
  for (const changes of [{ playerId: "invented" }, { sessionId: 1.5 }, { sessionId: -1 }, { turnstileToken: "" }]) {
    assert.equal((await teamSignup("lionel-kehl", changes)).status, 400);
  }
  const rejected = load("app/api/tournament-register/route.ts", mocks, {
    fetch: async () => Response.json({ success: false }),
  }).POST;
  assert.equal((await post(rejected, { sessionId: 1, playerId: "lionel-kehl", turnstileToken: "bad" })).status, 400);
  assert.equal((await teamSignup("lionel-kehl", { sessionId: 999 })).status, 404);
  now = "2026-09-23T18:00:00Z";
  assert.equal((await teamSignup()).status, 404);
  assert.equal((await query("SELECT * FROM registrations")).rows.length, 0);
});
