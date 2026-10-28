export const WAITLIST_LIMIT = 2;

export function isRegistrationClosed(waitlistCount: number) {
  return waitlistCount >= WAITLIST_LIMIT;
}
