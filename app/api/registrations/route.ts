import { NextResponse } from "next/server";
import { getSessionRoster } from "@/lib/session-roster";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = Number(searchParams.get("sessionId"));
  if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
    return NextResponse.json({ error: "Ugyldig økt." }, { status: 400 });
  }
  return NextResponse.json(await getSessionRoster(sessionId), {
    headers: { "Cache-Control": "no-store" },
  });
}
