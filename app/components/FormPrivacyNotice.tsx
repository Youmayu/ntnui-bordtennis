"use client";

import Link from "next/link";
import { useSitePreferences } from "@/app/components/SitePreferencesProvider";
import { getLegalCopy } from "@/lib/legal";
import { localizePathname } from "@/lib/site-content";

export default function FormPrivacyNotice({ action }: { action: "register" | "unregister" }) {
  const { locale } = useSitePreferences();
  const copy = getLegalCopy(locale);

  return (
    <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--neutral-soft)] p-4 text-sm leading-6 text-[color:var(--text-muted)]">
      <p>{action === "register" ? copy.registerNotice : copy.unregisterNotice}</p>
      <Link className="app-legal-link" href={localizePathname("/privacy", locale)}>{copy.readPrivacy}</Link>
      <p className="mt-2">
        {copy.turnstileNotice}{" "}
        <a className="app-legal-inline-link" href="https://www.cloudflare.com/turnstile-privacy-policy/">Cloudflare Turnstile</a>
      </p>
    </div>
  );
}
