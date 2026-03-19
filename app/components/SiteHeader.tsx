"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALE_INFO, type Locale } from "@/lib/site-content";
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
  const { locale, messages, theme, setLocale, setTheme } = useSitePreferences();

  return (
    <header className="app-header sticky top-0 z-50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="app-brand text-lg font-semibold tracking-tight">
          {messages.shell.brand}
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link className={navItemClass(pathname === "/schedule")} href="/schedule">
              {messages.shell.nav.schedule}
            </Link>
            <Link className={navItemClass(pathname === "/register", "register")} href="/register">
              {messages.shell.nav.register}
            </Link>
            <Link className={navItemClass(pathname === "/unregister", "unregister")} href="/unregister">
              {messages.shell.nav.unregister}
            </Link>
            <Link className={navItemClass(pathname === "/about")} href="/about">
              {messages.shell.nav.about}
            </Link>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <label className="app-control-label">
              <span className="sr-only">{messages.shell.languageLabel}</span>
              <select
                className="app-control-select"
                aria-label={messages.shell.languageLabel}
                value={locale}
                onChange={(event) => setLocale(event.target.value as Locale)}
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
      </div>
    </header>
  );
}
