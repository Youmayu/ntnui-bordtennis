export type CookieConsent = "accepted" | "rejected" | null;

export const COOKIE_CONSENT_COOKIE = "ntnui_cookie_preferences";
export const COOKIE_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

export function parseCookieConsent(value: string | undefined): CookieConsent {
  if (value === "v1.accepted") return "accepted";
  if (value === "v1.rejected") return "rejected";
  return null;
}
