"use client";

import Image from "next/image";
import ntnuiLogo from "@/app/logo.png";
import { useSitePreferences } from "@/app/components/SitePreferencesProvider";
import VenueLink from "@/app/components/VenueLink";

export default function SiteFooter() {
  const { locale, messages } = useSitePreferences();

  return (
    <footer className="app-footer">
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-12">
        <div className="app-footer-shell">
          <div className="app-footer-brand">
            <div className="app-footer-logo-shell" aria-hidden="true">
              <Image src={ntnuiLogo} alt="" className="app-footer-logo-image" />
            </div>
            <div className="app-footer-kicker">NTNUI</div>
            <div className="app-footer-title">{messages.shell.brand}</div>
          </div>

          <div className="app-footer-location">
            <VenueLink
              locale={locale}
              className="font-medium text-[color:var(--accent)] hover:underline"
              textClassName="font-medium text-[color:var(--accent)]"
              showMazeMapBadge
            />
          </div>

          <div className="app-footer-copy">{messages.shell.footerCopyright(new Date().getFullYear())}</div>
        </div>
      </div>
    </footer>
  );
}
