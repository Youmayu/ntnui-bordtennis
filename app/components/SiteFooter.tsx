"use client";

import Image from "next/image";
import Link from "next/link";
import ntnuiLogo from "@/app/ntnuilogo.png";
import { useSitePreferences } from "@/app/components/SitePreferencesProvider";
import VenueLink from "@/app/components/VenueLink";
import DiscordLink from "@/app/components/DiscordLink";
import { getLegalCopy } from "@/lib/legal";
import { PRIVACY_EMAIL } from "@/lib/legal-content";
import { localizePathname } from "@/lib/site-content";

export default function SiteFooter() {
  const { locale, messages, openCookieSettings } = useSitePreferences();
  const legal = getLegalCopy(locale);

  return (
    <footer className="app-footer">
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-12">
        <div className="app-footer-shell">
          <div className="app-footer-brand">
            <div className="app-footer-logo-shell" aria-hidden="true">
              <Image src={ntnuiLogo} alt="" className="app-footer-logo-image" />
            </div>
            <div className="app-footer-title">{messages.shell.brand}</div>
          </div>

          <div className="app-footer-location">
            <VenueLink
              locale={locale}
              className="font-medium text-[color:var(--accent)] hover:underline"
              textClassName="font-medium text-[color:var(--accent)]"
              showMazeMapBadge
            />
            <div className="mt-3">
              <DiscordLink variant="footer" />
            </div>
          </div>

          <div className="app-footer-copy">{messages.shell.footerCopyright(new Date().getFullYear())}</div>
          <nav className="app-footer-legal" aria-label={legal.navLabel}>
            <Link className="app-legal-link" href={localizePathname("/privacy", locale)}>{legal.privacy}</Link>
            <Link className="app-legal-link" href={localizePathname("/cookies", locale)}>{legal.cookies}</Link>
            <button type="button" className="app-legal-link" onClick={openCookieSettings}>{legal.cookieSettings}</button>
            <Link className="app-legal-link" href={localizePathname("/website-info", locale)}>{legal.websiteInfo}</Link>
            <a className="app-legal-link" href={`mailto:${PRIVACY_EMAIL}`}>{legal.contact}</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
