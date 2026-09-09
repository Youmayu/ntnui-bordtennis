"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useSitePreferences } from "@/app/components/SitePreferencesProvider";
import { COOKIE_CONTENT } from "@/lib/cookie-content";
import { type CookieConsent } from "@/lib/cookie-preferences";
import { localizePathname } from "@/lib/site-content";

export default function CookiePreferences() {
  const {
    locale,
    cookieConsent,
    cookieSettingsOpen,
    saveCookieConsent,
  } = useSitePreferences();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const copy = COOKIE_CONTENT[locale];

  useEffect(() => {
    // A first-visit notice leaves focus alone. A deliberate request from the
    // footer moves focus to the settings and remembers where to return it.
    if (cookieSettingsOpen) {
      previousFocusRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
      headingRef.current?.focus();
    }
  }, [cookieSettingsOpen]);

  if (cookieConsent !== null && !cookieSettingsOpen) return null;

  function choose(consent: Exclude<CookieConsent, null>) {
    saveCookieConsent(consent);
    if (previousFocusRef.current?.isConnected) {
      previousFocusRef.current.focus();
    }
    previousFocusRef.current = null;
  }

  return (
    <section
      aria-labelledby="cookie-preferences-title"
      aria-describedby="cookie-preferences-description"
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-h-[80dvh] max-w-4xl overflow-y-auto rounded-2xl border border-[color:var(--surface-border)] bg-[color:var(--background)] p-5 shadow-2xl sm:inset-x-6 sm:bottom-6 sm:p-6"
    >
      <h2
        id="cookie-preferences-title"
        ref={headingRef}
        tabIndex={-1}
        className="text-lg font-semibold text-[color:var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]"
      >
        {copy.title}
      </h2>
      <p id="cookie-preferences-description" className="mt-2 text-sm leading-relaxed text-[color:var(--text-soft)]">
        {copy.body}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-soft)]">
        {copy.choiceNotice}{" "}
        <Link className="app-legal-inline-link" href={localizePathname("/cookies", locale)}>
          {copy.policy}
        </Link>
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button type="button" className="app-button-secondary app-legal-focus min-h-11 flex-1 justify-center text-center" onClick={() => choose("accepted")}>
          {copy.accept}
        </button>
        <button type="button" className="app-button-secondary app-legal-focus min-h-11 flex-1 justify-center text-center" onClick={() => choose("rejected")}>
          {copy.reject}
        </button>
      </div>
    </section>
  );
}
