"use client";
import Link from "next/link";
import { Send } from "lucide-react";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/explore", label: "Destinations" },
  { href: "/explore/flights", label: "Vols" },
  { href: "/explore/hotels", label: "Hôtels" },
];

const SOCIALS = [
  {
    name: "Instagram",
    href: "#",
    icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "#",
    icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.66a8.16 8.16 0 004.77 1.52V6.73a4.85 4.85 0 01-1-.04z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "X / Twitter",
    href: "#",
    icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="relative z-20 overflow-hidden border-t transition-colors duration-300" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
      {/* Top strip — golden */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      {/* Giant "AIVANA" watermark in the background */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-serif font-black select-none pointer-events-none whitespace-nowrap"
        style={{ fontSize: 'clamp(64px, 13vw, 170px)', color: 'var(--text-primary)', opacity: 0.06, letterSpacing: '0.04em' }}
      >
        AIVANA
      </span>

      {/* ── Plane-nose shaped panel ─────────────────────────────── */}
      <div className="relative mx-auto flex justify-center pt-8 pb-2">
        <div className="relative w-[260px] sm:w-[300px]">
          <svg viewBox="0 0 300 380" className="w-full h-auto block" aria-hidden="true">
            <path
              d="M150 6 C179 6 193 46 193 86 L193 250 L266 352 L34 352 L107 250 L107 86 C107 46 121 6 150 6 Z"
              fill="var(--gold)"
            />
            <rect x="2" y="330" width="64" height="26" rx="13" fill="var(--gold)" transform="rotate(-28 34 343)" />
            <rect x="234" y="330" width="64" height="26" rx="13" fill="var(--gold)" transform="rotate(28 266 343)" />
          </svg>

          {/* Content overlaid on the shape */}
          <div className="absolute inset-0 flex flex-col items-center text-center" style={{ color: '#0A0D14' }}>
            <Link href="/" className="mt-[68px] sm:mt-[78px] font-serif font-black text-base tracking-wide">
              AI<span style={{ color: '#0A0D14', opacity: 0.55 }}>VANA</span>
            </Link>

            <nav className="mt-3 flex flex-col items-center gap-1.5">
              {NAV.map(({ href, label }) => (
                <Link key={href} href={href} className="text-[12px] font-semibold uppercase tracking-wider hover:underline underline-offset-2 transition-all">
                  {label}
                </Link>
              ))}
            </nav>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-auto mb-[58px] sm:mb-[64px] flex items-center gap-1.5 w-[180px] sm:w-[210px]"
            >
              <input
                type="email"
                placeholder="Newsletter — email"
                className="flex-1 min-w-0 rounded-full px-3 py-1.5 text-[11px] bg-white/80 placeholder:text-[#0A0D14]/50 focus:outline-none"
                style={{ color: '#0A0D14' }}
              />
              <button
                type="submit"
                aria-label="S'inscrire à la newsletter"
                className="flex-shrink-0 w-7 h-7 rounded-full bg-[#0A0D14] text-gold flex items-center justify-center hover:scale-105 transition-all"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>

            <div className="mb-[18px] flex items-center justify-center gap-2">
              {SOCIALS.map((s) => (
                <Link
                  key={s.name}
                  href={s.href}
                  title={s.name}
                  className="w-7 h-7 rounded-full border border-[#0A0D14]/30 hover:bg-[#0A0D14] hover:text-gold flex items-center justify-center transition-all"
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ─────────────────────────────────────────── */}
      <div className="relative max-w-7xl mx-auto px-8 pb-5 pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} AIVANA — Tous droits réservés. · Fait avec <span className="text-gold">✦</span> et beaucoup d&apos;IA
        </p>
      </div>
    </footer>
  );
}
