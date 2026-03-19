import { unstable_noStore as noStore } from "next/cache";
import { pool } from "@/lib/db";
import AnnouncementBarContent from "@/app/components/AnnouncementBarContent";

type AnnouncementRow = {
  id: number;
  title: string;
  body: string;
  expires_at: string | null;
};

export default async function AnnouncementBar() {
  noStore();

  const res = await pool
    .query(
      `SELECT id, title, body, expires_at
       FROM announcements
       WHERE expires_at IS NULL OR expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 5`
    )
    .catch(() => ({ rows: [] }));

  return <AnnouncementBarContent announcements={res.rows as AnnouncementRow[]} />;
}
