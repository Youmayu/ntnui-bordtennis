import { redirect } from "next/navigation";
import { getPreferredLocale } from "@/lib/preferred-locale";
import { localizePathname } from "@/lib/site-content";

export default async function WebsiteInfoPage() {
  redirect(localizePathname("/website-info", await getPreferredLocale()));
}
