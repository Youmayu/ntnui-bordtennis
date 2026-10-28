import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PGlite } from "@electric-sql/pglite";
import { load } from "./test-loader.mjs";

const migration = readFileSync(new URL("./init-db.js", import.meta.url), "utf8")
  .split("await pool.query(`")[1].split("`);")[0];

function formData(fields) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, String(value));
  return data;
}

function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return tree?.props ? [tree, ...nodes(tree.props.children)] : [];
}

test("announcement migration preserves old notices and is safe to rerun", async () => {
  const db = new PGlite();
  try {
    await db.exec(`CREATE TABLE announcements (
      id SERIAL PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL,
      expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    ); INSERT INTO announcements (title, body) VALUES ('Old notice', 'Still visible');`);
    await db.exec(migration);
    await db.exec(migration);
    const { rows } = await db.query("SELECT title, body, is_urgent FROM announcements");
    assert.deepEqual(rows, [{ title: "Old notice", body: "Still visible", is_urgent: false }]);
    await assert.rejects(db.query("INSERT INTO announcements (title, body, is_urgent) VALUES ('New notice', 'Some text', NULL)"));
  } finally {
    await db.close();
  }
});

test("admin can publish and toggle urgency; public notices prioritize urgency and exclude expired items", async () => {
  const db = new PGlite();
  let authorized = true;
  const refreshes = [];
  const query = async (sql, values) => {
    const result = await db.query(sql, values);
    return { ...result, rowCount: result.rows.length || result.affectedRows || 0 };
  };
  const pool = { query, connect: async () => ({ query, release() {} }) };
  const mocks = {
    "next/cache": { revalidatePath: (...args) => refreshes.push(args) },
    "next/server": { connection: async () => {} },
    "@/lib/db": { pool },
    "@/lib/admin-auth": { requireAdminAccess: async () => { if (!authorized) throw new Error("Unauthorized"); } },
    "@/lib/auto-schedule": { ensureAutoScheduleScaffold: async () => {}, ensureAutoScheduledSessions: async () => {} },
    "./AdminClient": { default: () => null },
    "./TrainingLocationField": { default: () => null },
    "./SessionForm": { default: "form" },
    "@/app/components/AnnouncementBarContent": { default: "section" },
  };
  const AdminPage = load("app/admin/page.tsx", mocks).default;
  const AnnouncementBar = load("app/components/AnnouncementBar.tsx", mocks).default;
  const getAdmin = async () => {
    const tree = await AdminPage();
    const all = nodes(tree);
    const actions = Object.fromEntries(all
      .filter((node) => node.type === "form" && typeof node.props.action === "function")
      .map((node) => [node.props.action.name, node.props.action]));
    return { all, actions };
  };
  try {
    await db.exec(migration);
    let { all, actions } = await getAdmin();
    assert.equal(all.find((node) => node.props.name === "is_urgent" && node.props.type === "checkbox").props.disabled, false);
    await actions.addAnnouncement(formData({ title: "Training cancelled", body: "The hall is closed tonight.", is_urgent: "on", expires_at: "2099-01-01T18:00" }));
    const urgent = (await db.query("SELECT * FROM announcements")).rows[0];
    assert.equal(urgent.is_urgent, true);
    assert.equal(new Date(urgent.expires_at).toISOString(), "2099-01-01T17:00:00.000Z");
    for (let i = 0; i < 6; i++) {
      await actions.addAnnouncement(formData({ title: `Regular notice ${i}`, body: "See you at training." }));
    }
    await actions.addAnnouncement(formData({ title: "Expired urgent notice", body: "No longer relevant.", is_urgent: "on", expires_at: "2000-01-01T18:00" }));
    let notices = (await AnnouncementBar()).props.announcements;
    assert.equal(notices.length, 5);
    assert.equal(notices[0].id, urgent.id);
    assert.ok(notices.slice(1).every((notice) => !notice.is_urgent));
    assert.ok(notices.every((notice) => notice.title !== "Expired urgent notice"));
    const otherId = notices[1].id;
    const unchanged = (await db.query("SELECT title, body, expires_at FROM announcements WHERE id = $1", [urgent.id])).rows[0];
    ({ actions } = await getAdmin());
    await actions.updateAnnouncementUrgency(formData({ id: urgent.id, is_urgent: "false" }));
    assert.equal((await db.query("SELECT is_urgent FROM announcements WHERE id = $1", [urgent.id])).rows[0].is_urgent, false);
    await actions.updateAnnouncementUrgency(formData({ id: urgent.id, is_urgent: "true" }));
    assert.deepEqual((await db.query("SELECT title, body, expires_at FROM announcements WHERE id = $1", [urgent.id])).rows[0], unchanged);
    assert.equal((await db.query("SELECT is_urgent FROM announcements WHERE id = $1", [otherId])).rows[0].is_urgent, false);
    for (const invalid of [{ id: urgent.id }, { id: urgent.id, is_urgent: "yes" }, { id: "", is_urgent: "false" }, { id: "1.5", is_urgent: "false" }]) {
      await actions.updateAnnouncementUrgency(formData(invalid));
    }
    assert.equal((await db.query("SELECT is_urgent FROM announcements WHERE id = $1", [urgent.id])).rows[0].is_urgent, true);
    assert.ok(refreshes.length >= 10);
    assert.ok(refreshes.every(([path, type]) => path === "/" && type === "layout"));
    authorized = false;
    await assert.rejects(actions.addAnnouncement(formData({ title: "Denied", body: "Should not save" })), /Unauthorized/);
    await assert.rejects(actions.updateAnnouncementUrgency(formData({ id: urgent.id, is_urgent: "false" })), /Unauthorized/);
    await assert.rejects(actions.deleteAnnouncement(formData({ id: urgent.id })), /Unauthorized/);
    authorized = true;
    await actions.deleteAnnouncement(formData({ id: urgent.id }));
    assert.ok((await AnnouncementBar()).props.announcements.every((notice) => notice.id !== urgent.id));

    // A rolling deployment must keep regular announcements available on the old schema.
    await db.exec("ALTER TABLE announcements DROP COLUMN is_urgent");
    ({ all, actions } = await getAdmin());
    assert.equal(all.find((node) => node.props.name === "is_urgent" && node.props.type === "checkbox").props.disabled, true);
    await actions.addAnnouncement(formData({ title: "Before migration", body: "Regular notices still work." }));
    notices = (await AnnouncementBar()).props.announcements;
    assert.ok(notices.some((notice) => notice.title === "Before migration"));
    assert.ok(notices.every((notice) => notice.is_urgent === false));
    await assert.rejects(actions.addAnnouncement(formData({ title: "No migration", body: "Should not silently lose urgency.", is_urgent: "on" })), /ikke tilgjengelig/);
    await assert.rejects(actions.updateAnnouncementUrgency(formData({ id: otherId, is_urgent: "true" })), /ikke tilgjengelig/);
  } finally {
    await db.close();
  }
});

test("urgent labels are localized and only urgent cards get the special treatment", () => {
  const { getMessages, LOCALE_INFO } = load("lib/site-content.ts");
  for (const locale of Object.keys(LOCALE_INFO)) {
    const messages = getMessages(locale);
    const AnnouncementBarContent = load("app/components/AnnouncementBarContent.tsx", {
      "@/app/components/SitePreferencesProvider": { useSitePreferences: () => ({ locale, messages }) },
    }).default;
    const render = (announcements) => renderToStaticMarkup(createElement(AnnouncementBarContent, { announcements }));
    assert.equal(render([]), "");
    const base = { id: 1, title: "Training cancelled", body: "The hall is closed.", expires_at: null };
    const regular = render([{ ...base, is_urgent: false }]);
    const urgent = render([{ ...base, is_urgent: true }]);
    assert.ok(messages.announcements.urgent);
    assert.ok(!regular.includes("app-announcement-card-urgent"));
    assert.ok(urgent.includes("app-announcement-card-urgent"));
    assert.ok(urgent.includes(messages.announcements.urgent));
    assert.ok(urgent.includes('aria-hidden="true"'));
  }
});

test("announcement actions require configured admin credentials", async () => {
  for (const [env, authorization, allowed] of [
    [{ ADMIN_USER: "admin", ADMIN_PASS: "secret" }, "Basic YWRtaW46c2VjcmV0", true],
    [{ ADMIN_USER: "admin", ADMIN_PASS: "secret" }, null, false],
    [{ ADMIN_USER: "admin", ADMIN_PASS: "secret" }, "Basic YWRtaW46d3Jvbmc=", false],
    [{}, null, false],
  ]) {
    const { requireAdminAccess } = load("lib/admin-auth.ts", {
      "next/headers": { headers: async () => ({ get: () => authorization }) },
    }, { process: { env } });
    if (allowed) await requireAdminAccess();
    else await assert.rejects(requireAdminAccess(), /Unauthorized/);
  }
});
