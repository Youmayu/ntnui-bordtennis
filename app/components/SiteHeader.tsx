"use client";

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
  const isAdminPath = pathname.startsWith("/admin");
  const currentPublicPath = stripLocaleFromPathname(pathname);

  function toLocalizedHref(path: string) {
    return localizePathname(path, locale);
  }

  function isActive(path: string) {
    return currentPublicPath === path;
  }

  return (
    <header className="app-header z-50 md:sticky md:top-0 md:backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:py-4">
        <div className="app-header-frame">
          <div className="app-header-main">
            <Link href={toLocalizedHref("/")} className="app-brand">
              <span className="app-brand-mark app-brand-logo-shell" aria-hidden="true">
                <Image src={ttLogo} alt="" className="app-brand-logo-image" priority />
              </span>
              <span className="app-brand-meta">
                <span className="app-brand-title">{messages.shell.brand}</span>
              </span>
            </Link>

            <div className="app-toolbar">
              <label className="app-control-label">
                <span className="sr-only">{messages.shell.languageLabel}</span>
                <select
                  className="app-control-select"
                  aria-label={messages.shell.languageLabel}
                  value={locale}
                  onChange={(event) => {
                    const nextLocale = event.target.value as Locale;
                    setLocale(nextLocale);

                    if (!isAdminPath) {
                      const query = searchParams.toString();
                      const nextPath = localizePathname(currentPublicPath, nextLocale);
                      router.replace(query ? `${nextPath}?${query}` : nextPath);
                    }
                  }}
                >
                  {Object.entries(LOCALE_INFO).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                className="app-theme-toggle"
                aria-label={`${messages.shell.themeLabel}: ${
                  theme === "light" ? messages.shell.themeDark : messages.shell.themeLight
                }`}
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? messages.shell.themeDark : messages.shell.themeLight}
              </button>
            </div>
          </div>

          <nav className="app-nav-strip text-sm">
            <Link className={navItemClass(isActive("/schedule"))} href={toLocalizedHref("/schedule")}>
              {messages.shell.nav.schedule}
            </Link>
            <Link className={navItemClass(isActive("/faq"))} href={toLocalizedHref("/faq")}>
              FAQ
            </Link>
            <Link
              className={navItemClass(isActive("/register"), "register")}
              href={toLocalizedHref("/register")}
            >
              {messages.shell.nav.register}
            </Link>
            <Link
              className={navItemClass(isActive("/unregister"), "unregister")}
              href={toLocalizedHref("/unregister")}
            >
              {messages.shell.nav.unregister}
            </Link>
            <Link className={navItemClass(isActive("/about"))} href={toLocalizedHref("/about")}>
              {messages.shell.nav.about}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
