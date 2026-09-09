import { redirect } from "next/navigation";
import { getPreferredLocale } from "@/lib/preferred-locale";
import { localizePathname } from "@/lib/site-content";

export default async function HomePage() {
  redirect(localizePathname("/", await getPreferredLocale()));
}
