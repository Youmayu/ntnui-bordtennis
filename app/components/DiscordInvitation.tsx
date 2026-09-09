"use client";

import DiscordLink from "@/app/components/DiscordLink";
import { useSitePreferences } from "@/app/components/SitePreferencesProvider";
import { DISCORD_COPY } from "@/lib/discord";

export default function DiscordInvitation() {
  const { locale } = useSitePreferences();
  const copy = DISCORD_COPY[locale];

  return (
    <section className="app-discord-invitation" aria-labelledby="discord-invitation-title">
      <h2 id="discord-invitation-title" className="font-sans text-base font-semibold text-[color:var(--text-strong)]">
        {copy.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">{copy.description}</p>
      <div className="mt-4">
        <DiscordLink />
      </div>
    </section>
  );
}
