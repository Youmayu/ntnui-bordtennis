"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  LANGUAGE_COOKIE,
  LOCALE_INFO,
  THEME_COOKIE,
  getLocaleFromPathname,
  getMessages,
  type Locale,
  type Theme,
} from "@/lib/site-content";
import {
  COOKIE_CONSENT_COOKIE,
  COOKIE_MAX_AGE_SECONDS,
  type CookieConsent,
} from "@/lib/cookie-preferences";

type SitePreferencesContextValue = {
  locale: Locale;
  theme: Theme;
  messages: ReturnType<typeof getMessages>;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
  cookieConsent: CookieConsent;
  cookieSettingsOpen: boolean;
  openCookieSettings: () => void;
  saveCookieConsent: (consent: Exclude<CookieConsent, null>) => void;
};

const SitePreferencesContext = createContext<SitePreferencesContextValue | null>(null);

function persistCookie(name: string, value: string) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

function clearPreferenceCookies() {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  for (const name of [LANGUAGE_COOKIE, THEME_COOKIE]) {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
  }
}

export default function SitePreferencesProvider({
  children,
  initialLocale,
  initialTheme,
  initialCookieConsent,
}: {
  children: ReactNode;
  initialLocale: Locale;
  initialTheme: Theme;
  initialCookieConsent: CookieConsent;
}) {
  const pathname = usePathname();
  const localeFromPath = getLocaleFromPathname(pathname);
  const [localePreference, setLocalePreference] = useState<Locale>(initialLocale);
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [cookieConsent, setCookieConsent] = useState<CookieConsent>(initialCookieConsent);
  const [cookieSettingsOpen, setCookieSettingsOpen] = useState(false);
  const locale = localeFromPath ?? localePreference;

  useEffect(() => {
    if (cookieConsent !== "accepted") {
      clearPreferenceCookies();
      return;
    }

    persistCookie(LANGUAGE_COOKIE, locale);
    persistCookie(THEME_COOKIE, theme);
  }, [cookieConsent, locale, theme]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = LOCALE_INFO[locale].htmlLang;
    document.documentElement.style.colorScheme = theme;
  }, [locale, theme]);

  const value = useMemo<SitePreferencesContextValue>(
    () => ({
      locale,
      theme,
      messages: getMessages(locale),
      setLocale: (nextLocale) => {
        setLocalePreference(nextLocale);
      },
      setTheme: (nextTheme) => {
        setThemeState(nextTheme);
      },
      cookieConsent,
      cookieSettingsOpen,
      openCookieSettings: () => setCookieSettingsOpen(true),
      saveCookieConsent: (nextConsent) => {
        persistCookie(COOKIE_CONSENT_COOKIE, `v1.${nextConsent}`);
        if (nextConsent === "rejected") {
          clearPreferenceCookies();
        }
        setCookieConsent(nextConsent);
        setCookieSettingsOpen(false);
      },
    }),
    [cookieConsent, cookieSettingsOpen, locale, theme]
  );

  return (
    <SitePreferencesContext.Provider value={value}>
      {children}
    </SitePreferencesContext.Provider>
  );
}

export function useSitePreferences() {
  const context = useContext(SitePreferencesContext);
  if (!context) {
    throw new Error("useSitePreferences must be used inside SitePreferencesProvider.");
  }
  return context;
}
