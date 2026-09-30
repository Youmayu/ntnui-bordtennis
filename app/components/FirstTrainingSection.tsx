"use client";

import Link from "next/link";
import { useSitePreferences } from "@/app/components/SitePreferencesProvider";
import { getFirstTrainingCopy } from "@/lib/first-training-content";
import { localizePathname, NTNUI_MEMBERSHIP_URL } from "@/lib/site-content";

export default function FirstTrainingSection() {
  const { locale } = useSitePreferences();
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

    </section>
  );
}
