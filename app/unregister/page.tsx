import { permanentRedirect } from "next/navigation";
import { DEFAULT_LOCALE, localizePathname } from "@/lib/site-content";

export default function UnregisterPage() {
  permanentRedirect(localizePathname("/unregister", DEFAULT_LOCALE));
}
