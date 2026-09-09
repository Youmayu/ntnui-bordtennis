# Privacy publication review

Prepared 9 September 2026 for this website's actual code. The policies are implementation-matched drafts, not a certification of GDPR compliance. The outstanding operational decisions below must be resolved before treating the privacy notice as final.

## Implemented

- `/privacy`, `/cookies`, `/website-info` and other public entry URLs redirect to the consented saved language, or Norwegian when there is no valid permission. Explicit language URLs retain precedence. All eight language routes have translated pages, footer links, metadata and sitemap entries.
- Signup and cancellation forms explain their data use before submission. Signup explicitly discloses public names, including waiting-list names in the cancellation list. No mandatory privacy-policy consent checkbox is added: acknowledging a notice is not the legal basis for processing a reservation.
- He You Ma (`he.ma@ntnui.no`) is the privacy contact, as selected by the site owner.
- Optional language and theme cookies require an affirmative choice. Rejecting or withdrawing consent removes both. The controls still work in memory during the visit.
- The necessary `ntnui_cookie_preferences` cookie records `v1.accepted` or `v1.rejected` for 180 days. Optional `ntnui_locale` and `ntnui_theme` cookies have a maximum age of 180 days and are not read as preferences without valid consent. Cookie settings remain available in the footer and cookie page.

## Decisions to resolve before publication

| Topic | Current evidence and required follow-up |
| --- | --- |
| Controller | The site identifies its operator as NTNUI Bordtennis, a subgroup of NTNUI. Confirm the formal controller's full legal name and contact/address with NTNUI, and put that identity in every privacy translation. Do not assume the subgroup is a separate legal entity. |
| Lawful basis and public names | The draft uses Article 6(1)(b) for the requested reservation and Article 6(1)(f) for operational list display and abuse prevention. Confirm necessity and document the legitimate-interest balancing assessment, particularly public names and using birth month/day to check cancellations. Establish how people who object to public display can participate. A policy notice by itself does not justify publication. |
| Retention | No automatic cleanup exists. Self-service cancellation deletes an open session's registration; administrators can delete registrations or sessions. Historical registrations and older cancellation-request messages otherwise remain. The owner was asked to choose a retention approach; no deletion schedule was assumed or activated. Agree a justified period, implement and verify it, then update every policy translation. |
| Hosting/database | README and Procfile describe Heroku hosting; the application uses PostgreSQL via `DATABASE_URL`. Confirm the actual deployment provider, database provider, regions, subprocessors, processor agreements, and any non-EEA transfer safeguards. Do not publish an unverified promise of EU-only storage. Replace the notice's general provider wording with the confirmed details. |
| Logs and backups | Confirm actual data categories and retention for hosting, database backups and any logging add-ons. Establish erasure handling when a backup is restored. These details cannot be determined from the repository. |
| Cloudflare | Confirm Turnstile mode and whether pre-clearance is enabled. Standard Turnstile returns a one-use token; a configured pre-clearance flow can set `cf_clearance`. If enabled, list its actual domain, purpose and expiry in the cookie notice, and assess the applicable storage exemption/consent requirements. |
| Privacy requests | Ensure He You Ma can receive, authenticate, track and answer requests. Rights requests normally require a response within one month, subject to the GDPR's permitted extensions and conditions. Avoid requesting more identifying data than necessary. |
| Future changes | Recheck policies and consent before adding analytics, advertising, embeds, new form fields or processors. Bump the consent version in parsing and writing when a changed purpose needs renewed consent; the banner then rejects stale versions. |

## Additional audit observations

These are separate from adding policy pages and should be considered in the club's privacy/security review:

- Names for current/upcoming confirmed and waitlisted registrations are accessible through the public cancellation API. Homepage names are also public. They are not private merely because the full list is collapsed.
- Birth month/day are stored as plain database fields and provide a low-entropy cancellation check. They are not a strong authentication secret.
- The older `/api/unregister-request` endpoint can still store free-text cancellation requests although the current UI no longer uses it. Decide whether to retire it and how to handle its stored records.
- Remote database TLS currently disables certificate verification in `lib/db.ts`; verify the provider-supported TLS configuration.
- No analytics, advertising scripts, localStorage or sessionStorage were found in the application. Inspect the live deployment for services injected outside the source code.

## Implementation verification

Production compilation and TypeScript checks passed with a temporary local database URL; no production database was accessed. Browser checks covered all 24 policy/language routes, metadata, sitemap, consent-aware redirects, invalid paths, existing-cookie migration, acceptance, rejection, reloading, withdrawal, language/theme behavior, and keyboard focus restoration. Policy/form notices and 390px/320px layouts were checked, including the long Norwegian title. Form-layout checks used an empty session fixture and did not test a live signup, database operation or Cloudflare verification.

## Sources checked

- [Datatilsynet: what information must be provided](https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/informasjon-og-apenhet/hva-skal-virksomheten-gi-informasjon-om/)
- [Datatilsynet: when information must be provided](https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/informasjon-og-apenhet/nar-skal-virksomheten-gi-informasjon/)
- [Nkom: cookies and similar technology](https://nkom.no/internett/informasjonskapsler-cookies)
- [Article 29 Working Party Opinion 04/2012, section 3.6: UI preference cookies](https://ec.europa.eu/justice/article-29/documentation/opinion-recommendation/files/2012/wp194_en.pdf)
- [Cloudflare Turnstile Privacy Addendum](https://www.cloudflare.com/turnstile-privacy-policy/)
- [Cloudflare: clearance and pre-clearance configuration](https://developers.cloudflare.com/cloudflare-challenges/concepts/clearance/)
- [Uu-tilsynet: accessibility declaration FAQ](https://www.uutilsynet.no/tilgjengelighetserklaering/ofte-stilte-sporsmal-om-tilgjengelighetserklaeringen/894)
