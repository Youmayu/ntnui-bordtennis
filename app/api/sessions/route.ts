import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  const res = await pool.query(
    `SELECT id, starts_at, ends_at, location, capacity
     FROM sessions
     WHERE starts_at > NOW()
     ORDER BY starts_at ASC
     LIMIT 12`
  );
  return NextResponse.json({ sessions: res.rows }, { status: 200 });
}