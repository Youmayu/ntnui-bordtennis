import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function makePool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");

  return new Pool({
    connectionString,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
  });
}

// Reuse pool in dev (hot reload) to avoid too many connections
export const pool = global._pgPool ?? makePool();
if (process.env.NODE_ENV !== "production") global._pgPool = pool;