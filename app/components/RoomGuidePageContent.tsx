import { getRoomGuideContent } from "@/lib/room-guide-content";
import type { Locale } from "@/lib/site-content";

export default function RoomGuidePageContent({ locale }: { locale: Locale }) {
  const guide = getRoomGuideContent(locale);

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="app-hero app-room-guide-hero overflow-hidden p-8 sm:p-10">
        <span className="app-badge app-badge-accent">{guide.badge}</span>
        <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-[color:var(--text-strong)] sm:text-5xl">
          {guide.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[color:var(--text-muted)]">
          {guide.intro}
        </p>
      </section>

      <section className="app-room-guide-preferred" aria-labelledby="preferred-option-title">
        <span className="app-room-guide-preferred-icon" aria-hidden="true">
          ✓
        </span>
        <div>
          <div className="app-panel-eyebrow">{guide.preferredLabel}</div>
          <h2
            id="preferred-option-title"
            className="mt-2 text-xl font-semibold text-[color:var(--text-strong)]"
          >
            {guide.preferredText}
          </h2>
        </div>
      </section>

      <section className="app-room-guide-fallback">
        <span className="app-room-guide-fallback-icon" aria-hidden="true">
          !
        </span>
        <div>
          <h2 className="text-2xl font-semibold text-[color:var(--text-strong)]">
            {guide.fallbackTitle}
          </h2>
          <p className="mt-2 text-[color:var(--text-muted)]">{guide.fallbackText}</p>
        </div>
      </section>

      <div className="app-room-guide-columns">
        <section className="app-surface app-room-guide-section p-6 sm:p-8">
          <div className="app-room-guide-section-head">
            <span className="app-room-guide-section-number">01</span>
            <h2>{guide.setupTitle}</h2>
          </div>

          <ol className="app-room-guide-steps">
            {guide.setupSteps.map((step, index) => (
              <li key={step.text} className="app-room-guide-step">
                <span className="app-room-guide-step-number" aria-hidden="true">
                  {index + 1}
                </span>
                <div>
                  <p>{step.text}</p>
                  {step.showLockerCode && (
                    <div className="app-room-guide-code">
                      <span>{guide.lockerCodeLabel}</span>
                      <strong aria-label={`${guide.lockerCodeLabel}: 7 2 9`}>729</strong>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="app-surface app-room-guide-section p-6 sm:p-8">
          <div className="app-room-guide-section-head">
            <span className="app-room-guide-section-number">02</span>
            <h2>{guide.closingTitle}</h2>
          </div>

          <ol className="app-room-guide-steps">
            {guide.closingSteps.map((step, index) => (
              <li key={step.text} className="app-room-guide-step">
                <span className="app-room-guide-step-number" aria-hidden="true">
                  {index + 1}
                </span>
                <div>
                  <p>{step.text}</p>
                  {step.warning && (
                    <p className="app-room-guide-critical">
                      <span aria-hidden="true">!</span>
                      <strong>{step.warning}</strong>
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="app-room-guide-finish">
        <span aria-hidden="true">✓</span>
        <p>{guide.finalText}</p>
      </section>
    </div>
  );
}
