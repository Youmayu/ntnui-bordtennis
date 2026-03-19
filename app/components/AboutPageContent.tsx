"use client";

import { useSitePreferences } from "@/app/components/SitePreferencesProvider";
import VenueLink from "@/app/components/VenueLink";

type PersonCardProps = {
  role: string;
  name: string;
  email?: string;
  phone?: string;
};

function PersonCard({ role, name, email, phone }: PersonCardProps) {
  const { messages } = useSitePreferences();

  return (
    <div className="app-surface p-6">
      <div className="text-sm text-[color:var(--text-soft)]">{role}</div>
      <div className="mt-1 text-lg font-semibold text-[color:var(--text-strong)]">{name}</div>

      <div className="mt-4 space-y-2 text-sm">
        {email && (
          <div>
            <span className="text-[color:var(--text-soft)]">{messages.about.email}: </span>
            <a className="font-medium text-[color:var(--accent)] hover:underline" href={`mailto:${email}`}>
              {email}
            </a>
          </div>
        )}
        {phone && (
          <div>
            <span className="text-[color:var(--text-soft)]">{messages.about.phone}: </span>
            <a className="font-medium text-[color:var(--accent)] hover:underline" href={`tel:${phone}`}>
              {phone}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AboutPageContent() {
  const { locale, messages } = useSitePreferences();

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <span className="app-badge app-badge-accent">{messages.about.badge}</span>
        <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--text-strong)]">
          {messages.about.title}
        </h1>
        <p className="max-w-2xl text-[color:var(--text-muted)]">{messages.about.body}</p>
      </div>

      <section className="grid gap-6 md:grid-cols-3">
        <PersonCard role={messages.about.roles.leader} name="Maja BÃ¶" email="maja.bockenkamp@ntnui.no" />
        <PersonCard role={messages.about.roles.deputy} name="He You Ma" email="heym@stud.ntnu.no" />
        <PersonCard
          role={messages.about.roles.treasurer}
          name="Karl Andre Thomassen"
          email="karl.thomassen@ntnui.no"
        />
      </section>

      <section className="app-surface p-6">
        <h2 className="text-lg font-semibold text-[color:var(--text-strong)]">
          {messages.about.locationTitle}
        </h2>
        <div className="mt-2">
          <VenueLink
            locale={locale}
            className="text-[color:var(--accent)] hover:underline"
            textClassName="font-medium text-[color:var(--accent)]"
            showMazeMapBadge
          />
        </div>
      </section>
    </div>
  );
}
