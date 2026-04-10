async function main() {
  const { Pool } = await import("pg");
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
      capacity  INT NOT NULL DEFAULT 20,
      members_only BOOLEAN NOT NULL DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS schedule_settings (
      id INT PRIMARY KEY CHECK (id = 1),
      auto_enabled BOOLEAN NOT NULL DEFAULT TRUE
    );

    INSERT INTO schedule_settings (id, auto_enabled)
    VALUES (1, TRUE)
    ON CONFLICT (id) DO NOTHING;

    CREATE TABLE IF NOT EXISTS schedule_templates (
      id SERIAL PRIMARY KEY,
      weekday INT NOT NULL CHECK (weekday BETWEEN 1 AND 7),
      starts_at_time TIME NOT NULL,
      ends_at_time TIME NOT NULL,
      location TEXT NOT NULL,
      capacity INT NOT NULL DEFAULT 16 CHECK (capacity BETWEEN 1 AND 200),
      members_only BOOLEAN NOT NULL DEFAULT TRUE,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      CHECK (char_length(location) BETWEEN 3 AND 120)
    );

    CREATE TABLE IF NOT EXISTS schedule_exceptions (
      id SERIAL PRIMARY KEY,
      template_id INT NOT NULL REFERENCES schedule_templates(id) ON DELETE CASCADE,
      week_start DATE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (template_id, week_start)
    );

    ALTER TABLE sessions
      ADD COLUMN IF NOT EXISTS auto_template_id INT REFERENCES schedule_templates(id) ON DELETE SET NULL;

    ALTER TABLE sessions
      ADD COLUMN IF NOT EXISTS auto_week_start DATE;

    ALTER TABLE sessions
      ADD COLUMN IF NOT EXISTS members_only BOOLEAN NOT NULL DEFAULT TRUE;

    ALTER TABLE schedule_templates
      ADD COLUMN IF NOT EXISTS members_only BOOLEAN NOT NULL DEFAULT TRUE;

    CREATE TABLE IF NOT EXISTS registrations (
      id SERIAL PRIMARY KEY,
      session_id INT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      level TEXT NOT NULL,
      birth_month INT,
      birth_day INT,
      status TEXT NOT NULL DEFAULT 'confirmed',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE registrations
      ADD COLUMN IF NOT EXISTS birth_month INT;

    ALTER TABLE registrations
      ADD COLUMN IF NOT EXISTS birth_day INT;

    ALTER TABLE registrations
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed';

    UPDATE registrations
      SET status = 'confirmed'
      WHERE status IS NULL;

    ALTER TABLE registrations
      ALTER COLUMN status SET DEFAULT 'confirmed';

    ALTER TABLE registrations
      ALTER COLUMN status SET NOT NULL;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'sessions_location_length_check'
      ) THEN
        ALTER TABLE sessions
          ADD CONSTRAINT sessions_location_length_check
          CHECK (char_length(location) BETWEEN 3 AND 120) NOT VALID;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'sessions_capacity_bounds_check'
      ) THEN
        ALTER TABLE sessions
          ADD CONSTRAINT sessions_capacity_bounds_check
          CHECK (capacity BETWEEN 1 AND 200) NOT VALID;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'registrations_name_length_check'
      ) THEN
        ALTER TABLE registrations
          ADD CONSTRAINT registrations_name_length_check
          CHECK (char_length(name) BETWEEN 2 AND 80) NOT VALID;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'registrations_level_value_check'
      ) THEN
        ALTER TABLE registrations
          ADD CONSTRAINT registrations_level_value_check
          CHECK (level IN ('Nybegynner', 'Viderekommen', 'Erfaren')) NOT VALID;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'registrations_birth_month_bounds_check'
      ) THEN
        ALTER TABLE registrations
          ADD CONSTRAINT registrations_birth_month_bounds_check
          CHECK (birth_month IS NULL OR birth_month BETWEEN 1 AND 12) NOT VALID;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'registrations_birth_day_bounds_check'
      ) THEN
        ALTER TABLE registrations
          ADD CONSTRAINT registrations_birth_day_bounds_check
          CHECK (birth_day IS NULL OR birth_day BETWEEN 1 AND 31) NOT VALID;
      END IF;

    END $$;

    CREATE INDEX IF NOT EXISTS idx_registrations_session_id
      ON registrations(session_id);

    CREATE INDEX IF NOT EXISTS idx_registrations_session_status_created_at
      ON registrations(session_id, status, created_at);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_auto_template_week
      ON sessions(auto_template_id, auto_week_start)
      WHERE auto_template_id IS NOT NULL AND auto_week_start IS NOT NULL;

    CREATE INDEX IF NOT EXISTS idx_sessions_auto_week_start
      ON sessions(auto_week_start)
      WHERE auto_week_start IS NOT NULL;

    CREATE TABLE IF NOT EXISTS announcements (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_announcements_created_at
      ON announcements(created_at DESC);

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'announcements_title_length_check'
      ) THEN
        ALTER TABLE announcements
          ADD CONSTRAINT announcements_title_length_check
          CHECK (char_length(title) BETWEEN 3 AND 140) NOT VALID;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'announcements_body_length_check'
      ) THEN
        ALTER TABLE announcements
          ADD CONSTRAINT announcements_body_length_check
          CHECK (char_length(body) BETWEEN 3 AND 2000) NOT VALID;
      END IF;
    END $$;
       
    CREATE TABLE IF NOT EXISTS unregister_requests (
      id SERIAL PRIMARY KEY,
      session_id INT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      handled BOOLEAN NOT NULL DEFAULT FALSE
    );

    CREATE INDEX IF NOT EXISTS idx_unregister_requests_session_id
      ON unregister_requests(session_id);

    CREATE INDEX IF NOT EXISTS idx_unregister_requests_handled
      ON unregister_requests(handled);
  `);

  // 2) Seed only if empty
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM sessions;`);
  if (rows[0].n === 0) {
    await pool.query(`
      INSERT INTO sessions (starts_at, ends_at, location, capacity)
      VALUES
        (NOW() + INTERVAL '1 day' + INTERVAL '18 hours', NOW() + INTERVAL '1 day' + INTERVAL '20 hours', 'Dragvoll Idrettssenter B217', 20),
        (NOW() + INTERVAL '3 day' + INTERVAL '18 hours', NOW() + INTERVAL '3 day' + INTERVAL '20 hours', 'Dragvoll Idrettssenter B217', 20),
        (NOW() + INTERVAL '5 day' + INTERVAL '16 hours', NOW() + INTERVAL '5 day' + INTERVAL '18 hours', 'Dragvoll Idrettssenter B217', 20),
        (NOW() + INTERVAL '8 day' + INTERVAL '18 hours', NOW() + INTERVAL '8 day' + INTERVAL '20 hours', 'Dragvoll Idrettssenter B217', 20),
        (NOW() + INTERVAL '10 day' + INTERVAL '18 hours', NOW() + INTERVAL '10 day' + INTERVAL '20 hours', 'Dragvoll Idrettssenter B217', 20),
        (NOW() + INTERVAL '12 day' + INTERVAL '16 hours', NOW() + INTERVAL '12 day' + INTERVAL '18 hours', 'Dragvoll Idrettssenter B217', 20);
    `);
    console.log("Seeded sessions.");
  } else {
    console.log("Sessions already exist, skipping seed.");
  }

  await pool.query(`
    DO $$
    DECLARE
      template_source_week TIMESTAMP;
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM schedule_templates LIMIT 1) THEN
        SELECT date_trunc('week', starts_at AT TIME ZONE 'Europe/Oslo')
        INTO template_source_week
        FROM sessions
        WHERE ends_at > NOW()
        ORDER BY starts_at ASC
        LIMIT 1;

        IF template_source_week IS NULL THEN
          SELECT date_trunc('week', starts_at AT TIME ZONE 'Europe/Oslo')
          INTO template_source_week
          FROM sessions
          ORDER BY starts_at ASC
          LIMIT 1;
        END IF;

        IF template_source_week IS NOT NULL THEN
          INSERT INTO schedule_templates (
            weekday,
            starts_at_time,
            ends_at_time,
            location,
            capacity,
            members_only,
            is_active
          )
          SELECT
            EXTRACT(ISODOW FROM starts_at AT TIME ZONE 'Europe/Oslo')::int,
            (starts_at AT TIME ZONE 'Europe/Oslo')::time,
            (ends_at AT TIME ZONE 'Europe/Oslo')::time,
            location,
            capacity,
            members_only,
            TRUE
          FROM sessions
          WHERE date_trunc('week', starts_at AT TIME ZONE 'Europe/Oslo') = template_source_week
          ORDER BY starts_at ASC;
        END IF;
      END IF;
    END $$;
  `);

  await pool.end();
  console.log("DB init done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
