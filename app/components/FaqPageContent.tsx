import { getFaqContent } from "@/lib/faq-content";
import type { Locale } from "@/lib/site-content";

export default function FaqPageContent({ locale }: { locale: Locale }) {
  const faq = getFaqContent(locale);

  return (
    <div className="space-y-8">
      <section className="app-hero overflow-hidden p-8 sm:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="app-badge app-badge-accent">{faq.badge}</span>
        </div>

        <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-[color:var(--text-strong)] sm:text-5xl">
          {faq.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[color:var(--text-muted)]">
          {faq.intro}
        </p>
      </section>

      <section className="space-y-3">
        <div className="text-sm font-medium uppercase tracking-[0.18em] text-[color:var(--text-soft)]">
          {faq.quickLinksTitle}
        </div>
        <div className="app-surface overflow-hidden p-0">
          <div className="app-faq-quicklinks">
            {faq.sections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className="app-faq-link">
                <span className="app-faq-link-title">{section.title}</span>
                <span className="app-faq-link-body">{section.description}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="space-y-6">
        {faq.sections.map((section) => (
          <section key={section.id} id={section.id} className="app-faq-section app-surface p-6 sm:p-7">
            <div className="mb-5 space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--text-strong)]">
                {section.title}
              </h2>
              <p className="max-w-2xl text-sm text-[color:var(--text-muted)]">{section.description}</p>
            </div>

            <div className="app-faq-grid">
              {section.items.map((item, index) => (
                <details key={item.question} className="app-faq-item" open={index === 0}>
                  <summary className="app-faq-summary">
                    <span>{item.question}</span>
                    <span className="app-faq-icon" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <div className="app-faq-answer">
                    {item.answer.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {item.linkHref && item.linkLabel && (
                      <div>
                        <a
                          href={item.linkHref}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-[color:var(--accent)] hover:underline"
                        >
                          {item.linkLabel}
                        </a>
                      </div>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
