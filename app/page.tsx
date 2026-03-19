import { pool } from "@/lib/db";
import HomePageContent from "@/app/components/HomePageContent";

export const dynamic = "force-dynamic";

type SessionRow = {
  id: number;
  starts_at: string;
  ends_at: string;
  location: string;
  capacity: number;
  current_time: string;
};

export default async function HomePage() {
  const nextSessionRes = await pool.query(
    `SELECT id, starts_at, ends_at, location, capacity, NOW() AS current_time
     FROM sessions
     WHERE ends_at > NOW()
     ORDER BY starts_at ASC
     LIMIT 1`
  );

  const session = (nextSessionRes.rows[0] as SessionRow | undefined) ?? null;

  if (!session) {
    return <HomePageContent session={null} registeredNames={[]} />;
  }

  const regsRes = await pool.query(
    `SELECT name
     FROM registrations
     WHERE session_id = $1
     ORDER BY created_at ASC`,
    [session.id]
  );

  return (
    <HomePageContent
      session={session}
      registeredNames={(regsRes.rows as { name: string }[]).map((row) => row.name)}
    />
  );
}
