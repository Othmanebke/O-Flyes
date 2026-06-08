"use client";
import Link from "next/link";
import { Plane } from "lucide-react";

const NAV_LINKS = [
  { href: "/explore", label: "Destinations" },
  { href: "/explore/flights", label: "Vols" },
  { href: "/explore/hotels", label: "Hôtels" },
  { href: "/explore/activities", label: "Activités" },
  { href: "/blog", label: "Blog" },
];

const LEGAL_LINKS = [
  { href: "#", label: "Confidentialité" },
  { href: "#", label: "Conditions" },
  { href: "#", label: "Cookies" },
];

const SOCIALS = [
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
      </svg>
    ),
  },
  {
    name: "X",
    href: "https://twitter.com",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://tiktok.com",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.66a8.16 8.16 0 004.77 1.52V6.73z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer
      className="relative border-t"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderTopColor: "var(--border-color)",
      }}
    >
      {/* Top gold line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-30" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-14">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-gold/20 bg-gold/10 group-hover:bg-gold/20 transition-colors"
              >
                <Plane className="w-4 h-4 text-gold group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <span className="font-serif text-base font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                AI<span className="text-gold">VANA</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--text-muted)" }}>
              Planifiez vos voyages avec l&apos;intelligence artificielle. Simple, rapide, personnalisé.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-2 pt-1">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  title={s.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 hover:text-gold border"
                  style={{
                    color: "var(--text-muted)",
                    borderColor: "var(--border-color)",
                    backgroundColor: "transparent",
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3
              className="text-[11px] font-black uppercase tracking-[0.18em]"
              style={{ color: "var(--text-primary)" }}
            >
              Explorer
            </h3>
            <nav className="flex flex-col gap-2.5">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm transition-all duration-200 hover:text-gold hover:translate-x-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3
              className="text-[11px] font-black uppercase tracking-[0.18em]"
              style={{ color: "var(--text-primary)" }}
            >
              Contact
            </h3>
            <div className="space-y-3">
              <a
                href="mailto:contact@aivana.io"
                className="text-sm transition-all hover:text-gold block"
                style={{ color: "var(--text-muted)" }}
              >
                contact@aivana.io
              </a>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Lun – Ven · 9h – 18h GMT+1
              </p>

              {/* Newsletter inline */}
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex gap-2 pt-1"
              >
                <input
                  type="email"
                  placeholder="votre@email.com"
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg text-xs focus:outline-none transition-all"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all hover:opacity-90 active:scale-95 whitespace-nowrap"
                  style={{
                    backgroundColor: "var(--gold)",
                    color: "#0a1128",
                  }}
                >
                  OK
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid var(--border-color)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} AIVANA · Tous droits réservés
          </p>
          <div className="flex items-center gap-4">
            {LEGAL_LINKS.map(({ href, label }, i) => (
              <span key={href} className="flex items-center gap-4">
                {i > 0 && (
                  <span className="text-xs" style={{ color: "var(--border-color)" }}>
                    ·
                  </span>
                )}
                <Link
                  href={href}
                  className="text-xs transition-all hover:text-gold"
                  style={{ color: "var(--text-muted)" }}
                >
                  {label}
                </Link>
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
