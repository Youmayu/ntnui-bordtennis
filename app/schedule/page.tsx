import { permanentRedirect } from "next/navigation";
import { DEFAULT_LOCALE, localizePathname } from "@/lib/site-content";

export default function SchedulePage() {
  permanentRedirect(localizePathname("/schedule", DEFAULT_LOCALE));
}
