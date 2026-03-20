import { permanentRedirect } from "next/navigation";
import { DEFAULT_LOCALE, localizePathname } from "@/lib/site-content";

export default function RegisterPage() {
  permanentRedirect(localizePathname("/register", DEFAULT_LOCALE));
}
