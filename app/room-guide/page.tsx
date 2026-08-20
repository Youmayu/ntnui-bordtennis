import { permanentRedirect } from "next/navigation";
import { DEFAULT_LOCALE, localizePathname } from "@/lib/site-content";

export default function RoomGuidePage() {
  permanentRedirect(localizePathname("/room-guide", DEFAULT_LOCALE));
}
