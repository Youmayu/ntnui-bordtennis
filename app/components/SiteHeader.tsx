"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ttLogo from "@/app/ttlogo.png";
import {
  LOCALE_INFO,
  localizePathname,
  stripLocaleFromPathname,
  type Locale,
} from "@/lib/site-content";
import { useSitePreferences } from "@/app/components/SitePreferencesProvider";

function navItemClass(active: boolean, variant: "default" | "register" | "unregister" = "default") {
  const classes = ["app-nav-link"];

  if (variant === "register") {
    classes.push("app-nav-link-success");
  }

  if (variant === "unregister") {
    classes.push("app-nav-link-danger");
  }

  if (active) {
    classes.push("app-nav-link-active");
  }

  return classes.join(" ");
}

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, messages, theme, setLocale, setTheme } = useSitePreferences();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isAdminPath = pathname.startsWith("/admin");
  const currentPublicPath = stripLocaleFromPathname(pathname);

  function toLocalizedHref(path: string) {
    return localizePathname(path, locale);
  }

  function isActive(path: string) {
    return currentPublicPath === path;
  }

  function closeMobileNav() {
    setMobileNavOpen(false);
  }

  function handleLocaleChange(nextLocale: Locale) {
    setLocale(nextLocale);
    closeMobileNav();

    if (!isAdminPath) {
      const query = searchParams.toString();
      const nextPath = localizePathname(currentPublicPath, nextLocale);
      router.replace(query ? `${nextPath}?${query}` : nextPath);
    }
  }

  return (
    <header className="app-header z-50 md:sticky md:top-0 md:backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:py-4">
        <div className="app-header-frame">
          <div className="app-header-main">
            <div className="app-brand-row">
              <Link href={toLocalizedHref("/")} className="app-brand" onClick={closeMobileNav}>
                <span className="app-brand-mark app-brand-logo-shell" aria-hidden="true">
                  <Image src={ttLogo} alt="" className="app-brand-logo-image" priority />
                </span>
                <span className="app-brand-meta">
                  <span className="app-brand-title">{messages.shell.brand}</span>
                </span>
              </Link>

              <label className="app-control-label">
                <span className="sr-only">{messages.shell.languageLabel}</span>
                <select
                  className="app-control-select"
                  aria-label={messages.shell.languageLabel}
                  value={locale}
                  onChange={(event) => handleLocaleChange(event.target.value as Locale)}
                >
                  {Object.entries(LOCALE_INFO).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <button
            type="button"
            className="app-mobile-nav-toggle"
            aria-expanded={mobileNavOpen}
            aria-controls="site-mobile-nav"
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <span>{mobileNavOpen ? messages.shell.menuClose : messages.shell.menuOpen}</span>
            <span className="app-mobile-nav-toggle-icon" aria-hidden="true">
              {mobileNavOpen ? "-" : "+"}
            </span>
          </button>

          <nav
            id="site-mobile-nav"
            className={`app-nav-strip text-sm${mobileNavOpen ? " app-nav-strip-open" : ""}`}
          >
            <Link
              className={navItemClass(isActive("/schedule"))}
              href={toLocalizedHref("/schedule")}
              onClick={closeMobileNav}
            >
              {messages.shell.nav.schedule}
            </Link>
            <Link
              className={navItemClass(isActive("/faq"))}
              href={toLocalizedHref("/faq")}
              onClick={closeMobileNav}
            >
              {messages.shell.nav.faq}
            </Link>
            <Link
              className={navItemClass(isActive("/register"), "register")}
              href={toLocalizedHref("/register")}
              onClick={closeMobileNav}
            >
              {messages.shell.nav.register}
            </Link>
            <Link
              className={navItemClass(isActive("/unregister"), "unregister")}
              href={toLocalizedHref("/unregister")}
              onClick={closeMobileNav}
            >
              {messages.shell.nav.unregister}
            </Link>
            <Link
              className={navItemClass(isActive("/about"))}
              href={toLocalizedHref("/about")}
              onClick={closeMobileNav}
            >
              {messages.shell.nav.about}
            </Link>
            <button
              type="button"
              className="app-nav-link app-nav-theme-button"
              aria-label={`${messages.shell.themeLabel}: ${
                theme === "light" ? messages.shell.themeDark : messages.shell.themeLight
              }`}
              onClick={() => {
                setTheme(theme === "light" ? "dark" : "light");
                closeMobileNav();
              }}
            >
              {theme === "light" ? messages.shell.themeDark : messages.shell.themeLight}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
