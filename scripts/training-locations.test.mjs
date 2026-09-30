import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PGlite } from "@electric-sql/pglite";
import { load } from "./test-loader.mjs";

const { getTrainingVenue, formatVenueLabel, normalizeVenueText } = load("lib/site-content.ts");
const VenueLink = load("app/components/VenueLink.tsx").default;
const TrainingLocationField = load("app/admin/TrainingLocationField.tsx").default;

test("room-specific links recognize saved, short, translated, and legacy locations", () => {
  for (const [room, mapUrl] of [["B212", "https://link.mazemap.com/pCEbCsSJ"], ["B217", "https://link.mazemap.com/BGjlq1kK"]]) {
    for (const location of [room, `Dragvoll ${room}`, `Dragvoll Idrettssenter ${room}`, ` Dragvoll Sports Centre ${room.toLowerCase()} `]) {
      assert.equal(getTrainingVenue(location)?.mapUrl, mapUrl);
      assert.equal(formatVenueLabel(location, "en"), `Dragvoll Idrettssenter ${room}`);
      const html = renderToStaticMarkup(createElement(VenueLink, { locale: "en", location }));
      assert.ok(html.includes(`href="${mapUrl}"`));
      assert.equal((html.match(/<a /g) ?? []).length, 1);
    }
  }
  assert.equal(getTrainingVenue("Dragvoll Idrettssenter")?.room, "B217");
  assert.equal(getTrainingVenue("NTNU Dragvoll Sports Centre")?.room, "B217");
  for (const location of ["", "Unknown B212", "Dragvoll Idrettssenter B213"]) {
    assert.equal(getTrainingVenue(location), null);
  }
  assert.equal(normalizeVenueText("Training at Dragvoll Idrettssenter B212."), "Training at Dragvoll Idrettssenter B212.");
});

test("general directions link both rooms and unknown locations do not link the wrong map", () => {
  const general = renderToStaticMarkup(createElement(VenueLink, { locale: "no" }));
  assert.ok(general.includes('href="https://link.mazemap.com/pCEbCsSJ"'));
  assert.ok(general.includes('href="https://link.mazemap.com/BGjlq1kK"'));
  const unknown = renderToStaticMarkup(createElement(VenueLink, { locale: "no", location: "Another sports hall" }));
  assert.ok(unknown.includes("Another sports hall"));
  assert.ok(!unknown.includes("<a "));
});

test("admin selects the saved room without silently replacing an unrecognized old location", () => {
  for (const [location, selected] of [["Dragvoll Sports Centre B212", "Dragvoll Idrettssenter B212"], ["Dragvoll Idrettssenter", "Dragvoll Idrettssenter B217"]]) {
    const html = renderToStaticMarkup(createElement(TrainingLocationField, { defaultValue: location }));
    assert.ok(html.includes(`value="${selected}" selected=""`));
    assert.ok(!html.includes("<iframe"));
  }
  const unknown = renderToStaticMarkup(createElement(TrainingLocationField, { defaultValue: "Another sports hall" }));
  assert.match(unknown, /value="" disabled="" selected=""/);
});

test("admin saves both rooms, updates them, and generates recurring sessions with the selected map", async () => {
  const db = new PGlite();
  const query = async (sql, values) => {
    const result = await db.query(sql.replace(/NOW\(\)|clock_timestamp\(\)/g, "TIMESTAMPTZ '2026-09-21T12:00:00Z'"), values);
    return { ...result, rowCount: result.rows.length || result.affectedRows || 0 };
  };
  const pool = { query, connect: async () => ({ query, release() {} }) };
  const autoSchedule = load("lib/auto-schedule.ts", { "@/lib/db": { pool } });
  const mocks = {
    "@/lib/db": { pool },
    "@/lib/auto-schedule": { ...autoSchedule, ensureAutoScheduledSessions: async () => {} },
    "./AdminClient": { default: () => null },
    "./TrainingLocationField": { default: TrainingLocationField },
  };
  const AdminPage = load("app/admin/page.tsx", mocks).default;
  const { getUpcomingSessions } = load("lib/sessions.ts", mocks);
  const formData = (fields) => {
    const data = new FormData();
    for (const [key, value] of Object.entries(fields)) data.set(key, String(value));
    return data;
  };
  const getActions = async () => {
    const actions = {};
    const visit = (node) => {
      if (Array.isArray(node)) return node.forEach(visit);
      if (!node?.props) return;
      if (node.type === "form" && typeof node.props.action === "function") actions[node.props.action.name] = node.props.action;
      visit(node.props.children);
    };
    visit(await AdminPage());
    return actions;
  };

  try {
    const migration = readFileSync(new URL("./init-db.js", import.meta.url), "utf8")
      .split("await pool.query(`")[1].split("`);")[0];
    await db.exec(migration);
    let actions = await getActions();
    const session = { starts_at: "2026-09-23T18:00", ends_at: "2026-09-23T20:00", capacity: 20, location: "B212" };
    await actions.addSession(formData(session));
    assert.equal((await query("SELECT location FROM sessions WHERE id = 1")).rows[0].location, "Dragvoll Idrettssenter B212");

    const template = { weekday: 3, starts_at_time: "18:00", ends_at_time: "20:00", capacity: 20, location: "B217", is_active: "on" };
    await actions.addScheduleTemplate(formData(template));
    assert.equal((await query("SELECT location FROM schedule_templates WHERE id = 1")).rows[0].location, "Dragvoll Idrettssenter B217");
    actions = await getActions();
    await actions.updateSession(formData({ ...session, id: 1, location: "B217" }));
    await actions.updateScheduleTemplate(formData({ ...template, id: 1, location: "B212" }));
    assert.equal((await query("SELECT location FROM sessions WHERE id = 1")).rows[0].location, "Dragvoll Idrettssenter B217");
    assert.equal((await query("SELECT location FROM schedule_templates WHERE id = 1")).rows[0].location, "Dragvoll Idrettssenter B212");

    await actions.addSession(formData({ ...session, location: "Invalid room" }));
    await actions.addScheduleTemplate(formData({ ...template, location: "Invalid room" }));
    await actions.updateSession(formData({ ...session, id: 1, location: "Invalid room" }));
    await actions.updateScheduleTemplate(formData({ ...template, id: 1, location: "Invalid room" }));
    assert.deepEqual((await query("SELECT location FROM sessions")).rows, [{ location: "Dragvoll Idrettssenter B217" }]);
    assert.deepEqual((await query("SELECT location FROM schedule_templates")).rows, [{ location: "Dragvoll Idrettssenter B212" }]);

    const generated = await autoSchedule.generateNextWeekFromAutoSchedule();
    assert.equal(generated.created_count, 1);
    const upcoming = await getUpcomingSessions();
    assert.equal(upcoming.length, 2);
    assert.equal(getTrainingVenue(upcoming[0].location).mapUrl, "https://link.mazemap.com/BGjlq1kK");
    assert.equal(getTrainingVenue(upcoming[1].location).mapUrl, "https://link.mazemap.com/pCEbCsSJ");
  } finally {
    await db.close();
  }
});
