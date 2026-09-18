import { NextResponse } from "next/server";
import { getUpcomingSessions } from "@/lib/sessions";

export async function GET() {
  return NextResponse.json({ sessions: await getUpcomingSessions() }, {
    headers: { "Cache-Control": "no-store" },
  });
}
