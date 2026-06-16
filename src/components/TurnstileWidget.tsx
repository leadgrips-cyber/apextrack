import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export function TurnstileWidget({ siteKey, onVerify, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const render = () => {
      if (!containerRef.current || !window.turnstile) return;
      window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
        "expired-callback": onExpire ?? (() => {}),
        theme: "auto",
      });
    };

    if (window.turnstile) {
      render();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src*="challenges.cloudflare.com/turnstile"]'
      );
      if (existing) {
        existing.addEventListener("load", render, { once: true });
      } else {
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v1/api.js";
        script.async = true;
        script.defer = true;
        script.addEventListener("load", render, { once: true });
        document.head.appendChild(script);
      }
    }
  }, [siteKey, onVerify, onExpire]);

  return <div ref={containerRef} />;
}
