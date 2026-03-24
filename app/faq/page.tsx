import { permanentRedirect } from "next/navigation";
import { DEFAULT_LOCALE, localizePathname } from "@/lib/site-content";

export default function FaqPage() {
  permanentRedirect(localizePathname("/faq", DEFAULT_LOCALE));
}
