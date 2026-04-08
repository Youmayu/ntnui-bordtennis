"use client";

import Image from "next/image";
import { useSitePreferences } from "@/app/components/SitePreferencesProvider";
import VenueLink from "@/app/components/VenueLink";
import { normalizeVenueText } from "@/lib/site-content";

type PersonCardProps = {
  role: string;
  name: string;
  email?: string;
  phone?: string;
};

function PersonCard({ role, name, email, phone }: PersonCardProps) {
  const { messages } = useSitePreferences();

  return (
    <article className="app-surface app-person-card p-6">
      <div className="app-person-role">{role}</div>
      <div className="mt-4 text-xl font-semibold text-[color:var(--text-strong)]">{name}</div>

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
    </article>
  );
}

export default function AboutPageContent() {
  const { locale, messages } = useSitePreferences();

  return (
    <div className="space-y-10">
      <section className="app-hero overflow-hidden rounded-[2.4rem] p-8 sm:p-10">
        <span className="app-badge app-badge-accent">{messages.about.badge}</span>
        <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--text-strong)]">
          {messages.about.title}
        </h1>
        <p className="mt-4 max-w-2xl text-[color:var(--text-muted)]">
          {normalizeVenueText(messages.about.body)}
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <PersonCard role={messages.about.roles.leader} name={"Maja B\u00F6"} email="maja.bockenkamp@ntnui.no" />
        <PersonCard role={messages.about.roles.deputy} name="He You Ma" email="he.ma@ntnui.no" />
        <PersonCard
          role={messages.about.roles.treasurer}
          name="Karl Andre Thomassen"
          email="karl.thomassen@ntnui.no"
        />
      </section>

      <section className="app-surface app-location-stage overflow-hidden p-0">
        <div className="app-location-photo-shell" aria-hidden="true">
          <Image
            src="/images/website/treningshall.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="app-location-photo-image"
          />
        </div>

        <div className="relative z-10 p-6 sm:p-8">
          <div className="app-panel-eyebrow">{messages.about.locationTitle}</div>
          <h2 className="mt-3 text-2xl font-semibold text-[color:var(--text-strong)]">
            {messages.about.locationTitle}
          </h2>
          <div className="mt-4">
            <VenueLink
              locale={locale}
              className="text-[color:var(--accent)] hover:underline"
              textClassName="font-medium text-[color:var(--accent)]"
              showMazeMapBadge
            />
          </div>
        </div>
      </section>
    </div>
  );
}
