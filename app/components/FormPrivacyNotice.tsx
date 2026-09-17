"use client";

import Link from "next/link";
import { useSitePreferences } from "@/app/components/SitePreferencesProvider";
import { getLegalCopy } from "@/lib/legal";
import { localizePathname } from "@/lib/site-content";

export default function FormPrivacyNotice() {
  const { locale } = useSitePreferences();
  const copy = getLegalCopy(locale);

  return (
    <Link
      className="app-legal-inline-link inline-flex min-h-11 items-center gap-1 text-xs"
      href={localizePathname("/privacy", locale)}
    >
      {copy.readPrivacy} <span aria-hidden="true">→</span>
    </Link>
  );
}
