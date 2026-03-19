import { pool } from "@/lib/db";
import HomePageContent from "@/app/components/HomePageContent";
import { createPageMetadata, getHomeStructuredData, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = createPageMetadata({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
  keywords: ["NTNUI trening", "bordtennis påmelding", "table tennis registration"],
});

type SessionRow = {
  id: number;
  starts_at: string;
  ends_at: string;
  location: string;
  capacity: number;
  current_time: string;
};

export default async function HomePage() {
  const structuredData = getHomeStructuredData();
  const nextSessionRes = await pool.query(
    `SELECT id, starts_at, ends_at, location, capacity, NOW() AS current_time
     FROM sessions
     WHERE ends_at > NOW()
     ORDER BY starts_at ASC
     LIMIT 1`
  );

  const session = (nextSessionRes.rows[0] as SessionRow | undefined) ?? null;

  if (!session) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <HomePageContent session={null} registeredNames={[]} />
      </>
    );
  }

  const regsRes = await pool.query(
    `SELECT name
     FROM registrations
     WHERE session_id = $1
     ORDER BY created_at ASC`,
    [session.id]
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomePageContent
        session={session}
        registeredNames={(regsRes.rows as { name: string }[]).map((row) => row.name)}
      />
    </>
  );
}
