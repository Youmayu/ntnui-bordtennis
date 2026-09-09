"use client";

import { useSitePreferences } from "@/app/components/SitePreferencesProvider";
import { DISCORD_COPY, DISCORD_INVITE_URL } from "@/lib/discord";

export default function DiscordLink({
  variant = "button",
  onClick,
}: {
  variant?: "button" | "nav" | "footer";
  onClick?: () => void;
}) {
  const { locale } = useSitePreferences();
  const copy = DISCORD_COPY[locale];
  const variantClass = {
    button: "app-button-secondary app-discord-button",
    nav: "app-nav-link",
    footer: "app-discord-footer-link",
  }[variant];

  return (
    <a
      href={DISCORD_INVITE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`app-discord-link ${variantClass}`}
      onClick={onClick}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3H13a8.5 8.5 0 0 1 8 8v.5Z" />
        <path d="M8.5 11.5h.01m3.99 0h.01m3.99 0h.01" />
      </svg>
      <span>{variant === "nav" ? "Discord" : copy.join}</span>
      <span aria-hidden="true">↗</span>
      <span className="sr-only"> ({copy.opensInNewTab})</span>
    </a>
  );
}
