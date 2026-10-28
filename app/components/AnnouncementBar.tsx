import { connection } from "next/server";
import { pool } from "@/lib/db";
import AnnouncementBarContent from "@/app/components/AnnouncementBarContent";

type AnnouncementRow = {
  id: number;
  title: string;
  body: string;
  is_urgent: boolean;
  expires_at: string | null;
};

export default async function AnnouncementBar() {
  await connection();

  const res = await pool
    .query(
      // Keep existing announcements visible until the urgency migration runs.
      `SELECT id, title, body, expires_at,
              COALESCE((to_jsonb(announcements)->>'is_urgent')::boolean, FALSE) AS is_urgent
       FROM announcements
       WHERE expires_at IS NULL OR expires_at > NOW()
       ORDER BY is_urgent DESC, created_at DESC, id DESC
       LIMIT 5`
    )
    .catch(() => ({ rows: [] }));

  return <AnnouncementBarContent announcements={res.rows as AnnouncementRow[]} />;
}
