import { redirect } from "next/navigation";
import { getPreferredLocale } from "@/lib/preferred-locale";
import { localizePathname } from "@/lib/site-content";

export default async function UnregisterPage() {
  redirect(localizePathname("/unregister", await getPreferredLocale()));
}
