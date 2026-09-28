"use client";

import Link from "next/link";
import { useSitePreferences } from "@/app/components/SitePreferencesProvider";
import VenueLink from "@/app/components/VenueLink";
import { getFirstTrainingCopy } from "@/lib/first-training-content";
import { localizePathname, NTNUI_MEMBERSHIP_URL } from "@/lib/site-content";

export default function FirstTrainingSection() {
  const { locale, messages } = useSitePreferences();
  const copy = getFirstTrainingCopy(locale);

  return (
    <section aria-labelledby="first-training-title" className="app-surface p-6 sm:p-8">
      <h2 id="first-training-title" className="app-panel-title">{copy.title}</h2>
      <p className="app-panel-body mt-2">{copy.intro}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div>
          <h3 className="font-semibold text-[color:var(--text-strong)]">{copy.membershipTitle}</h3>
          <p className="app-panel-body mt-2 text-sm">{copy.membershipBody}</p>
          <div className="mt-2 flex flex-wrap gap-x-4">
            <a href={NTNUI_MEMBERSHIP_URL} className="app-roster-link">{copy.membershipLink}</a>
            <a href="https://ntnui.no/" className="app-roster-link">{copy.feesLink}</a>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-[color:var(--text-strong)]">{copy.bookingTitle}</h3>
          <p className="app-panel-body mt-2 text-sm">{copy.bookingBody}</p>
          <Link
            href={localizePathname("/schedule", locale)}
            className="app-roster-link mt-2"
          >
            {copy.bookingLink}
          </Link>
        </div>

        <div>
          <h3 className="font-semibold text-[color:var(--text-strong)]">{copy.equipmentTitle}</h3>
          <p className="app-panel-body mt-2 text-sm">{copy.equipmentBody}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[color:var(--border-muted)] pt-4 text-sm">
        <span className="font-semibold text-[color:var(--text-strong)]">{messages.home.locationLabel}</span>
        <VenueLink locale={locale} showMazeMapBadge textClassName="font-medium" />
      </div>
    </section>
  );
}
