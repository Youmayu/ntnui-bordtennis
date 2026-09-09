import { cookies } from "next/headers";
import { COOKIE_CONSENT_COOKIE, parseCookieConsent } from "@/lib/cookie-preferences";
import { DEFAULT_LOCALE, LANGUAGE_COOKIE, parseLocale } from "@/lib/site-content";

export async function getPreferredLocale() {
  const cookieStore = await cookies();
  const consent = parseCookieConsent(cookieStore.get(COOKIE_CONSENT_COOKIE)?.value);

  return consent === "accepted"
    ? parseLocale(cookieStore.get(LANGUAGE_COOKIE)?.value)
    : DEFAULT_LOCALE;
}
