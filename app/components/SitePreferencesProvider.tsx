"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  parseCookieConsent,
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

function readStoredCookieConsent() {
  const prefix = `${COOKIE_CONSENT_COOKIE}=`;
  const cookie = document.cookie.split(";").map((value) => value.trim()).find((value) => value.startsWith(prefix));
  return parseCookieConsent(cookie?.slice(prefix.length));
}

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
  const cookieChannelRef = useRef<BroadcastChannel | null>(null);
  const locale = localeFromPath ?? localePreference;

  useEffect(() => {
    // Read the shared cookie before writing: another tab may have withdrawn
    // permission, or the saved decision may have expired since this tab opened.
    if (readStoredCookieConsent() !== "accepted") {
      clearPreferenceCookies();
      return;
    }

    persistCookie(LANGUAGE_COOKIE, locale);
    persistCookie(THEME_COOKIE, theme);
  }, [locale, theme]);

  useEffect(() => {
    function syncConsent() {
      const savedConsent = readStoredCookieConsent();
      if (savedConsent !== "accepted") clearPreferenceCookies();
      setCookieConsent(savedConsent);
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") syncConsent();
    }

    const channel = typeof BroadcastChannel === "undefined"
      ? null
      : new BroadcastChannel("ntnui-cookie-preferences");
    cookieChannelRef.current = channel;
    channel?.addEventListener("message", syncConsent);
    window.addEventListener("focus", syncConsent);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      channel?.close();
      cookieChannelRef.current = null;
      window.removeEventListener("focus", syncConsent);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

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
        setCookieConsent(readStoredCookieConsent());
        setLocalePreference(nextLocale);
      },
      setTheme: (nextTheme) => {
        setCookieConsent(readStoredCookieConsent());
        setThemeState(nextTheme);
      },
      cookieConsent,
      cookieSettingsOpen,
      openCookieSettings: () => setCookieSettingsOpen(true),
      saveCookieConsent: (nextConsent) => {
        persistCookie(COOKIE_CONSENT_COOKIE, `v1.${nextConsent}`);
        if (nextConsent === "accepted" && readStoredCookieConsent() === "accepted") {
          persistCookie(LANGUAGE_COOKIE, locale);
          persistCookie(THEME_COOKIE, theme);
        } else {
          clearPreferenceCookies();
        }
        setCookieConsent(nextConsent);
        setCookieSettingsOpen(false);
        cookieChannelRef.current?.postMessage("changed");
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
