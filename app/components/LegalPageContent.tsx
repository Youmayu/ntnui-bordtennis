import Link from "next/link";
import CookieSettingsButton from "@/app/components/CookieSettingsButton";
import { getLegalCopy } from "@/lib/legal";
import { LEGAL_PAGE_SLUGS, LEGAL_UPDATED, PRIVACY_EMAIL, type LegalPageSlug } from "@/lib/legal-content";
import { getIntlLocale, localizePathname, type Locale } from "@/lib/site-content";

export default function LegalPageContent({ locale, page }: { locale: Locale; page: LegalPageSlug }) {
  const copy = getLegalCopy(locale);
  const content = copy.pages[page];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <nav aria-label={copy.navLabel} className="flex flex-wrap gap-x-6 gap-y-1">
        {LEGAL_PAGE_SLUGS.map((slug) => (
          <Link
            key={slug}
            href={localizePathname(`/${slug}`, locale)}
            className="app-legal-link"
            aria-current={page === slug ? "page" : undefined}
          >
            {slug === "website-info" ? copy.websiteInfo : copy[slug]}
          </Link>
        ))}
      </nav>

      <article className="app-surface [overflow-wrap:anywhere] p-6 sm:p-10">
        <header className="border-b border-[color:var(--border-muted)] pb-7">
          <h1 className="hyphens-auto text-2xl font-semibold tracking-tight text-[color:var(--text-strong)] sm:text-4xl">
            {content.title}
          </h1>
          <p className="mt-4 text-base leading-7 text-[color:var(--text-muted)]">{content.description}</p>
          <p className="mt-4 text-sm text-[color:var(--text-soft)]">
            {copy.updated}{" "}
            <time dateTime={LEGAL_UPDATED}>
              {new Intl.DateTimeFormat(getIntlLocale(locale), { dateStyle: "long", timeZone: "UTC" }).format(new Date(LEGAL_UPDATED))}
            </time>
          </p>
          {page === "cookies" && (
            <div className="mt-5">
              <CookieSettingsButton>{copy.cookieSettings}</CookieSettingsButton>
            </div>
          )}
        </header>

        <div className="space-y-8 pt-8">
          {content.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-64">
              <h2 className="text-xl font-semibold text-[color:var(--text-strong)]">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-[color:var(--text-muted)] sm:text-base">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              {section.links && (
                <ul className="mt-3 flex flex-col items-start gap-1">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <a className="app-legal-link" href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-8 border-t border-[color:var(--border-muted)] pt-6">
          <h2 className="text-xl font-semibold text-[color:var(--text-strong)]">{copy.contact}</h2>
          <a className="app-legal-link break-all" href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>
        </div>
      </article>
    </div>
  );
}
