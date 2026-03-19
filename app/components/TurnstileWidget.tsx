"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove?: (widgetId: string) => void;
    };
  }
}

type TurnstileWidgetProps = {
  siteKey: string;
  token: string;
  onTokenChange: (token: string) => void;
};

export default function TurnstileWidget({
  siteKey,
  token,
  onTokenChange,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [apiReady, setApiReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.turnstile)
  );

  useEffect(() => {
    if (!apiReady || !siteKey || !containerRef.current || widgetIdRef.current) {
      return;
    }

    widgetIdRef.current = window.turnstile?.render(containerRef.current, {
      sitekey: siteKey,
      callback: (nextToken) => onTokenChange(nextToken),
      "expired-callback": () => onTokenChange(""),
      "error-callback": () => onTokenChange(""),
    }) ?? null;

    return () => {
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [apiReady, onTokenChange, siteKey]);

  useEffect(() => {
    if (!token && widgetIdRef.current) {
      window.turnstile?.reset(widgetIdRef.current);
    }
  }, [token]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setApiReady(true)}
      />
      <input name="cf-turnstile-response" type="hidden" value={token} readOnly />
      <div ref={containerRef} />
    </>
  );
}
