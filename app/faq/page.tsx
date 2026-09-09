import { redirect } from "next/navigation";
import { getPreferredLocale } from "@/lib/preferred-locale";
import { localizePathname } from "@/lib/site-content";

export default async function FaqPage() {
  redirect(localizePathname("/faq", await getPreferredLocale()));
}
