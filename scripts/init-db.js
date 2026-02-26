/* eslint-disable no-console */
const { Pool } = require("pg");

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const isLocal =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1");

  const pool = new Pool({
    connectionString,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
  });

  // 1) Schema
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      starts_at TIMESTAMPTZ NOT NULL,
      ends_at   TIMESTAMPTZ NOT NULL,
      location  TEXT NOT NULL,
      capacity  INT NOT NULL DEFAULT 20
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id SERIAL PRIMARY KEY,
      session_id INT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      level TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_registrations_session_id
      ON registrations(session_id);
  `);

  // 2) Seed only if empty
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM sessions;`);
  if (rows[0].n === 0) {
    await pool.query(`
      INSERT INTO sessions (starts_at, ends_at, location, capacity)
      VALUES
        (NOW() + INTERVAL '1 day' + INTERVAL '18 hours', NOW() + INTERVAL '1 day' + INTERVAL '20 hours', 'Dragvoll Idrettsenter', 20),
        (NOW() + INTERVAL '3 day' + INTERVAL '18 hours', NOW() + INTERVAL '3 day' + INTERVAL '20 hours', 'Dragvoll Idrettsenter', 20),
        (NOW() + INTERVAL '5 day' + INTERVAL '16 hours', NOW() + INTERVAL '5 day' + INTERVAL '18 hours', 'Dragvoll Idrettsenter', 20),
        (NOW() + INTERVAL '8 day' + INTERVAL '18 hours', NOW() + INTERVAL '8 day' + INTERVAL '20 hours', 'Dragvoll Idrettsenter', 20),
        (NOW() + INTERVAL '10 day' + INTERVAL '18 hours', NOW() + INTERVAL '10 day' + INTERVAL '20 hours', 'Dragvoll Idrettsenter', 20),
        (NOW() + INTERVAL '12 day' + INTERVAL '16 hours', NOW() + INTERVAL '12 day' + INTERVAL '18 hours', 'Dragvoll Idrettsenter', 20);
    `);
    console.log("Seeded sessions.");
  } else {
    console.log("Sessions already exist, skipping seed.");
  }

  await pool.end();
  console.log("DB init done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});