"use client";
// Captcha Cloudflare Turnstile (gratuit, sans puzzle pour la plupart des visiteurs).
// Sans NEXT_PUBLIC_TURNSTILE_SITE_KEY, le composant n'affiche rien et le site
// fonctionne sans captcha (développement local).
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
export const captchaOn = () => !!TURNSTILE_SITE_KEY;

const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loading: Promise<void> | null = null;
function loadScript() {
  if (window.turnstile) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SRC;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        loading = null;
        reject(new Error("turnstile"));
      };
      document.head.appendChild(s);
    });
  }
  return loading;
}

interface Props {
  onToken: (token: string | null) => void;
  theme?: "light" | "dark" | "auto";
  // change cette valeur pour obtenir un nouveau jeton (un jeton ne sert qu'une fois)
  resetKey?: number;
  className?: string;
}

export default function Turnstile({ onToken, theme = "auto", resetKey = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useRef<string | null>(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !ref.current) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        id.current = window.turnstile.render(ref.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme,
          language: "fr",
          callback: (t: string) => cb.current(t),
          "expired-callback": () => cb.current(null),
          "error-callback": () => cb.current(null),
        });
      })
      .catch(() => cb.current(null));
    return () => {
      cancelled = true;
      if (id.current && window.turnstile) window.turnstile.remove(id.current);
      id.current = null;
    };
  }, [theme]);

  useEffect(() => {
    if (resetKey && id.current && window.turnstile) {
      window.turnstile.reset(id.current);
      cb.current(null);
    }
  }, [resetKey]);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={ref} className={className} />;
}
