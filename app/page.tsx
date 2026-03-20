import { permanentRedirect } from "next/navigation";
import { DEFAULT_LOCALE, localizePathname } from "@/lib/site-content";

export default function HomePage() {
  permanentRedirect(localizePathname("/", DEFAULT_LOCALE));
}
