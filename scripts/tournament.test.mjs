import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { before, after, beforeEach, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { load } from "./test-loader.mjs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

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
const { BOARD_MEMBERS } = load("lib/board-members.ts");
const migration = readFileSync(new URL("./init-db.js", import.meta.url), "utf8")
  .split("await pool.query(`")[1].split("`);")[0];
const autoSchedule = load("lib/auto-schedule.ts", { "@/lib/db": { pool } });
const AdminPage = load("app/admin/page.tsx", {
  ...mocks,
  "@/lib/auto-schedule": { ...autoSchedule, ensureAutoScheduledSessions: async () => {} },
  "next/cache": { revalidatePath() {} },
  "./AdminClient": { default: () => null },
  "./TrainingLocationField": { default: () => null },
  "./SessionForm": { default: "form" },
}).default;

before(async () => {
  await db.exec(migration);
  await db.exec(migration); // Migration must be safe to rerun.
});
after(async () => { await db.close(); });
beforeEach(async () => {
  now = "2026-09-20T21:59:59Z";
  await db.exec("TRUNCATE sessions RESTART IDENTITY CASCADE");
  await db.exec("TRUNCATE schedule_templates RESTART IDENTITY CASCADE");
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
async function roster(sessionId = 1) {
  return (await rosterGet(new Request(`http://localhost/api/registrations?sessionId=${sessionId}`))).json();
}

function formData(fields) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    for (const entry of Array.isArray(value) ? value : [value]) data.append(key, String(entry));
  }
  return data;
}

async function adminActions() {
  const actions = {};
  const visit = (node) => {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node?.props) return;
    if (node.type === "form" && typeof node.props.action === "function") actions[node.props.action.name] = node.props.action;
    if (node.props.deleteAction) actions.deleteRegistration = node.props.deleteAction;
    if (node.props.updateAction) actions.updateRegistration = node.props.updateAction;
    visit(node.props.children);
  };
  visit(await AdminPage());
  return actions;
}

function sessionForm(overrides = {}) {
  return formData({ id: 1, starts_at: "2026-09-23T18:00", ends_at: "2026-09-23T20:00",
    location: "B217", capacity: 8, ...overrides });
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

test("disabled reservations expose all capacity to public signup and team members use the normal waitlist", async () => {
  await query("UPDATE sessions SET reserve_tournament_spots = FALSE");
  await seed(7);
  const result = await publicSignup({ reserve_tournament_spots: true });
  assert.equal(result.body.registrationStatus, "confirmed");
  assert.equal((await teamSignup()).body.registrationStatus, "waitlist");
  const state = await roster();
  assert.equal(state.availability.reserve_tournament_spots, false);
  assert.equal(state.availability.reserved_count, 0);
  assert.equal(state.availability.available_spots, 0);
  assert.equal(state.registrations.filter((row) => row.status === "confirmed").length, 8);
  const listing = (await (await sessionsGet()).json()).sessions[0];
  assert.equal(listing.reserve_tournament_spots, false);
  assert.equal(listing.reserved_count, 0);
  assert.equal(listing.available_spots, 0);
});

test("turning reservations off in admin immediately releases unused spaces to the existing queue", async () => {
  await seed(3);
  await teamSignup();
  await seed(5, "waitlist");
  const waitingIds = (await query("SELECT id FROM registrations WHERE status = 'waitlist' ORDER BY created_at, id")).rows.map((row) => row.id);
  const actions = await adminActions();
  await actions.updateSession(sessionForm()); // Unchecked checkbox is absent from FormData.
  const saved = (await query("SELECT reserve_tournament_spots FROM sessions WHERE id = 1")).rows[0];
  assert.equal(saved.reserve_tournament_spots, false);
  // Verify promotion happened during the admin save, before any roster/API read.
  assert.deepEqual((await query("SELECT id FROM registrations WHERE status = 'waitlist' ORDER BY id")).rows, [{ id: waitingIds[4] }]);
  const state = await roster();
  assert.equal(state.availability.reserved_count, 0);
  assert.equal(state.registrations.filter((row) => row.status === "confirmed").length, 8);
  assert.equal(state.registrations.find((row) => row.is_tournament).status, "confirmed");
});

test("without reservations, claiming a team identity does not skip older waiting players", async () => {
  await query("UPDATE sessions SET reserve_tournament_spots = FALSE");
  await seed(8);
  await seed(1, "waitlist");
  assert.equal((await publicSignup({ firstName: "Lionel", lastName: "Kehl" })).body.registrationStatus, "waitlist");
  const firstId = (await query("SELECT id FROM registrations WHERE status = 'confirmed' ORDER BY id LIMIT 1")).rows[0].id;
  await query("DELETE FROM registrations WHERE id = $1", [firstId]);
  assert.equal((await teamSignup()).body.registrationStatus, "waitlist");
  const waiting = (await roster()).registrations.filter((row) => row.status === "waitlist");
  assert.equal(waiting.length, 1);
  assert.equal(waiting[0].name, "Lionel Kehl");
});

test("re-enabling reservations never displaces confirmed players or overbooks a full session", async () => {
  await query("UPDATE sessions SET reserve_tournament_spots = FALSE");
  await seed(8);
  const actions = await adminActions();
  await actions.updateSession(sessionForm({ reserve_tournament_spots: "on" }));
  assert.equal((await teamSignup()).body.registrationStatus, "waitlist");
  const state = await roster();
  assert.equal(state.availability.reserve_tournament_spots, true);
  assert.equal(state.availability.reserved_count, 0);
  assert.equal(state.registrations.filter((row) => row.status === "confirmed").length, 8);
});

test("admin creation and recurring templates save independent reservation settings and inherit them on generation", async () => {
  let actions = await adminActions();
  await actions.addSession(sessionForm({ starts_at: "2026-09-25T18:00", ends_at: "2026-09-25T20:00" }));
  await actions.addSession(sessionForm({ starts_at: "2026-09-26T18:00", ends_at: "2026-09-26T20:00", reserve_tournament_spots: "on" }));
  assert.deepEqual((await query("SELECT reserve_tournament_spots FROM sessions WHERE id > 1 ORDER BY id")).rows,
    [{ reserve_tournament_spots: false }, { reserve_tournament_spots: true }]);

  const template = { starts_at_time: "18:00", ends_at_time: "20:00", capacity: 8, location: "B212", is_active: "on", members_only: "on" };
  await actions.addScheduleTemplate(formData({ ...template, weekday: 2, reserve_tournament_spots: "on" }));
  await actions.addScheduleTemplate(formData({ ...template, weekday: 4 }));
  assert.deepEqual((await query("SELECT reserve_tournament_spots FROM schedule_templates ORDER BY id")).rows,
    [{ reserve_tournament_spots: true }, { reserve_tournament_spots: false }]);
  actions = await adminActions();
  await actions.updateScheduleTemplate(formData({ ...template, id: 1, weekday: 2 }));
  await actions.updateScheduleTemplate(formData({ ...template, id: 2, weekday: 4, reserve_tournament_spots: "on" }));

  assert.equal((await autoSchedule.generateNextWeekFromAutoSchedule()).created_count, 2);
  const generated = (await query("SELECT auto_template_id, reserve_tournament_spots, members_only FROM sessions WHERE auto_template_id IS NOT NULL ORDER BY auto_template_id")).rows;
  assert.deepEqual(generated, [
    { auto_template_id: 1, reserve_tournament_spots: false, members_only: true },
    { auto_template_id: 2, reserve_tournament_spots: true, members_only: true },
  ]);
  await actions.updateScheduleTemplate(formData({ ...template, id: 1, weekday: 2, reserve_tournament_spots: "on" }));
  assert.equal((await query("SELECT reserve_tournament_spots FROM sessions WHERE auto_template_id = 1")).rows[0].reserve_tournament_spots, false);
});

test("migration preserves existing reservations and reruns preserve opt-outs; reads still work before migration", async () => {
  // Simulate the previous production schema in this isolated in-memory database.
  await db.exec("ALTER TABLE sessions DROP COLUMN reserve_tournament_spots; ALTER TABLE schedule_templates DROP COLUMN reserve_tournament_spots");
  try {
    await seed(3);
    assert.equal((await roster()).availability.reserved_count, 5);
    assert.equal((await (await sessionsGet()).json()).sessions[0].reserve_tournament_spots, true);
    const actions = await adminActions();
    await actions.updateSession(sessionForm());
    assert.equal((await roster()).availability.reserved_count, 5);
    await actions.addScheduleTemplate(formData({ weekday: 4, starts_at_time: "18:00", ends_at_time: "20:00", location: "B217", capacity: 8, is_active: "on" }));
    assert.equal((await autoSchedule.generateNextWeekFromAutoSchedule()).created_count, 1);
  } finally {
    await db.exec(migration);
  }
  assert.equal((await query("SELECT reserve_tournament_spots FROM sessions WHERE id = 1")).rows[0].reserve_tournament_spots, true);
  assert.equal((await query("SELECT reserve_tournament_spots FROM schedule_templates WHERE id = 1")).rows[0].reserve_tournament_spots, true);
  await query("UPDATE sessions SET reserve_tournament_spots = FALSE");
  await query("UPDATE schedule_templates SET reserve_tournament_spots = FALSE");
  await db.exec(migration);
  assert.equal((await query("SELECT reserve_tournament_spots FROM sessions WHERE id = 1")).rows[0].reserve_tournament_spots, false);
  assert.equal((await query("SELECT reserve_tournament_spots FROM schedule_templates WHERE id = 1")).rows[0].reserve_tournament_spots, false);
});

test("creating a session with board attendance creates one confirmed place per selected member", async () => {
  let actions = await adminActions();
  const fields = { starts_at: "2026-09-24T18:00", ends_at: "2026-09-24T20:00", capacity: 3,
    attending_board_member_ids: ["maja-bo", "maja-bo", "he-you-ma", "unknown"] };
  assert.equal(await actions.addSession(sessionForm(fields)), undefined);
  const rows = (await query("SELECT id, name, board_member_id, status, level, birth_month FROM registrations WHERE session_id = 2 ORDER BY id")).rows;
  assert.deepEqual(rows.map((row) => [row.board_member_id, row.status, row.level, row.birth_month]),
    [["maja-bo", "confirmed", null, null], ["he-you-ma", "confirmed", null, null]]);
  actions = await adminActions();
  for (let i = 0; i < 2; i++) assert.equal(await actions.updateSession(sessionForm({ ...fields, id: 2 })), undefined);
  assert.deepEqual((await query("SELECT id FROM registrations WHERE session_id = 2 ORDER BY id")).rows, rows.map(({ id }) => ({ id })));
  const state = await roster(2);
  assert.equal(state.registrations.length, 2);
  assert.ok(state.registrations.every((row) => row.is_board && !row.is_tournament && row.status === "confirmed"));
  assert.equal(state.availability.available_spots, 1);
  const listing = (await (await sessionsGet()).json()).sessions.find((session) => session.id === 2);
  assert.equal(listing.confirmed_count, 2);
  assert.equal(listing.available_spots, 1);
  assert.equal((await publicSignup({ sessionId: 2 })).body.registrationStatus, "confirmed");
  assert.equal((await publicSignup({ sessionId: 2, firstName: "Bo", lastName: "Li" })).body.registrationStatus, "waitlist");
});

test("board places count against general capacity alongside tournament reservations", async () => {
  const actions = await adminActions();
  await actions.updateSession(sessionForm({ reserve_tournament_spots: "on", attending_board_member_ids: ["maja-bo"] }));
  const state = await roster();
  assert.equal(state.registrations[0].name, BOARD_MEMBERS[0].name);
  assert.equal(state.availability.reserved_count, 5);
  assert.equal(state.availability.available_spots, 2);
  await seed(2);
  assert.equal((await publicSignup()).body.registrationStatus, "waitlist");
  assert.equal((await teamSignup()).body.registrationStatus, "confirmed");
  assert.equal((await roster()).availability.reserved_count, 4);
});

for (const status of ["confirmed", "waitlist"]) {
  test(`selecting an already ${status} board member reuses their signup`, async () => {
    const previous = await query(`INSERT INTO registrations (session_id, name, level, birth_month, birth_day, status)
      VALUES (1, ' he  you ma ', 'Erfaren', 2, 29, $1) RETURNING id`, [status]);
    const actions = await adminActions();
    await actions.updateSession(sessionForm({ attending_board_member_ids: ["he-you-ma"] }));
    const rows = (await query("SELECT id, name, board_member_id, status, birth_month FROM registrations")).rows;
    assert.deepEqual(rows, [{ id: previous.rows[0].id, name: "He You Ma", board_member_id: "he-you-ma", status: "confirmed", birth_month: 2 }]);
    assert.equal((await publicSignup({ firstName: "He You", lastName: "Ma" })).status, 409);
    const cancelled = await post(unregisterPost, { registrationId: previous.rows[0].id, birthMonth: 2, birthDay: 29, turnstileToken: "test" });
    assert.equal(cancelled.status, 409);
    assert.equal((await roster()).registrations.length, 1);
  });
}

test("unchecking board attendance removes the booking and promotes the oldest waiting player immediately", async () => {
  const actions = await adminActions();
  await actions.updateSession(sessionForm({ capacity: 2, attending_board_member_ids: ["maja-bo"] }));
  await seed(1);
  await seed(2, "waitlist");
  const waitingIds = (await query("SELECT id FROM registrations WHERE status = 'waitlist' ORDER BY id")).rows.map((row) => row.id);
  await actions.updateSession(sessionForm({ capacity: 2 }));
  assert.deepEqual((await query("SELECT attending_board_member_ids FROM sessions WHERE id = 1")).rows[0].attending_board_member_ids, []);
  assert.equal((await query("SELECT id FROM registrations WHERE board_member_id IS NOT NULL")).rows.length, 0);
  assert.deepEqual((await query("SELECT id FROM registrations WHERE status = 'waitlist' ORDER BY id")).rows, [{ id: waitingIds[1] }]);
  assert.equal((await roster()).registrations.filter((row) => row.status === "confirmed").length, 2);
});

test("board attendance cannot overbook a session and a rejected save leaves all data intact", async () => {
  await seed(8);
  const actions = await adminActions();
  const result = await actions.updateSession(sessionForm({ attending_board_member_ids: ["maja-bo"] }));
  assert.match(result.error, /kapasiteten til minst 9/);
  assert.deepEqual((await query("SELECT attending_board_member_ids FROM sessions WHERE id = 1")).rows[0].attending_board_member_ids, []);
  assert.equal((await query("SELECT COUNT(*)::int AS count FROM registrations")).rows[0].count, 8);
  assert.equal((await query("SELECT reserve_tournament_spots FROM sessions WHERE id = 1")).rows[0].reserve_tournament_spots, true);
  const created = await actions.addSession(sessionForm({ capacity: 1, attending_board_member_ids: ["maja-bo", "he-you-ma"] }));
  assert.ok(created.error);
  assert.equal((await query("SELECT COUNT(*)::int AS count FROM sessions")).rows[0].count, 1);
  assert.equal(await actions.updateSession(sessionForm({ capacity: 9, attending_board_member_ids: ["maja-bo"] })), undefined);
  assert.equal((await roster()).registrations.filter((row) => row.status === "confirmed").length, 9);
});

test("existing attendance is synchronized on schedule reads and concurrent reads never duplicate a board booking", async () => {
  await query("UPDATE sessions SET attending_board_member_ids = ARRAY['maja-bo', 'he-you-ma']");
  const listed = (await (await sessionsGet()).json()).sessions[0];
  assert.equal(listed.confirmed_count, 2);
  assert.equal(listed.available_spots, 1);
  await Promise.all([roster(), roster(), roster()]);
  assert.equal((await query("SELECT COUNT(*)::int AS count FROM registrations")).rows[0].count, 2);
  await db.exec(migration);
  assert.equal((await roster()).registrations.length, 2);
  await assert.rejects(query(`INSERT INTO registrations (session_id, name, board_member_id)
    VALUES (1, 'Maja Bö', 'maja-bo')`), { code: "23505" });
});

test("deleting a board booking in admin clears attendance, releases the place, and does not recreate it", async () => {
  let actions = await adminActions();
  await actions.updateSession(sessionForm({ capacity: 1, attending_board_member_ids: ["maja-bo"] }));
  const board = (await roster()).registrations[0];
  await seed(1, "waitlist");
  actions = await adminActions();
  await actions.updateRegistration(formData({ id: board.id, name: "Different Name", level: "Nybegynner" }));
  assert.equal((await roster()).registrations.find((row) => row.is_board).name, BOARD_MEMBERS[0].name);
  await actions.deleteRegistration(formData({ id: board.id }));
  assert.deepEqual((await query("SELECT attending_board_member_ids FROM sessions WHERE id = 1")).rows[0].attending_board_member_ids, []);
  const after = await roster();
  assert.equal(after.registrations.length, 1);
  assert.equal(after.registrations[0].is_board, false);
  assert.equal(after.registrations[0].status, "confirmed");
});

test("public form fields cannot forge board priority", async () => {
  await seed(3);
  const result = await publicSignup({ board_member_id: "maja-bo", is_board: true });
  assert.equal(result.body.registrationStatus, "waitlist");
  assert.equal((await roster()).registrations.at(-1).is_board, false);
});

test("before the board migration, public reads and admin edits preserve existing attendance", async () => {
  await query("UPDATE sessions SET attending_board_member_ids = ARRAY['maja-bo']");
  await db.exec("ALTER TABLE registrations DROP COLUMN board_member_id CASCADE");
  try {
    await seed(1);
    assert.equal((await roster()).registrations[0].is_board, false);
    const actions = await adminActions();
    await actions.updateSession(sessionForm());
    assert.deepEqual((await query("SELECT attending_board_member_ids FROM sessions WHERE id = 1")).rows[0].attending_board_member_ids, ["maja-bo"]);
    assert.equal((await (await sessionsGet()).json()).sessions[0].confirmed_count, 1);
  } finally {
    await db.exec(migration);
  }
  const migrated = await roster();
  assert.equal(migrated.registrations.filter((row) => row.is_board).length, 1);
  assert.equal(migrated.registrations.length, 2);
});

test("board rows have their own label and styling in the confirmed list", () => {
  const { getMessages } = load("lib/site-content.ts");
  const SessionRoster = load("app/components/SessionRoster.tsx", {
    "@/app/components/SitePreferencesProvider": { useSitePreferences: () => ({ locale: "en", messages: getMessages("en") }) },
    "@/app/components/TournamentReservationNotice": { default: () => null },
  }).default;
  const html = renderToStaticMarkup(createElement(SessionRoster, {
    registrations: [
      { id: 1, name: "Maja Bö", status: "confirmed", is_board: true, is_tournament: false },
      { id: 2, name: "Lionel Kehl", status: "confirmed", is_board: false, is_tournament: true },
      { id: 3, name: "Anne Smith", status: "confirmed", is_board: false, is_tournament: false },
    ], capacity: 8, error: false, updatedAt: null,
  }));
  assert.match(html, /app-roster-row app-roster-board/);
  assert.match(html, /Board member/);
  assert.match(html, /app-roster-row app-roster-tournament/);
  assert.match(html, /Tournament team/);
  assert.match(html, /3\/8/);
});
