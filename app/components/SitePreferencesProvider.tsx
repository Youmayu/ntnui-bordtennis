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

type SitePreferencesContextValue = {
  locale: Locale;
  theme: Theme;
  messages: ReturnType<typeof getMessages>;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
};

const SitePreferencesContext = createContext<SitePreferencesContextValue | null>(null);

function persistCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export default function SitePreferencesProvider({
  children,
  initialLocale,
  initialTheme,
}: {
  children: ReactNode;
  initialLocale: Locale;
  initialTheme: Theme;
}) {
  const pathname = usePathname();
  const localeFromPath = getLocaleFromPathname(pathname);
  const [localePreference, setLocalePreference] = useState<Locale>(initialLocale);
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const locale = localeFromPath ?? localePreference;

  useEffect(() => {
    if (!localeFromPath) {
      return;
    }

    persistCookie(LANGUAGE_COOKIE, localeFromPath);
  }, [localeFromPath]);

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
        persistCookie(LANGUAGE_COOKIE, nextLocale);
      },
      setTheme: (nextTheme) => {
        setThemeState(nextTheme);
        persistCookie(THEME_COOKIE, nextTheme);
      },
    }),
    [locale, theme]
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
