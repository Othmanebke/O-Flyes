"use client";
import Link from "next/link";
import { Plane, Mail, MapPin, ArrowUpRight, Send } from "lucide-react";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/explore", label: "Destinations" },
  { href: "/chat", label: "Chatbot IA" },
  { href: "/blog", label: "Blog" },
  { href: "/gallery", label: "Galerie" },
  { href: "/pricing", label: "Tarifs" },
  { href: "/dashboard", label: "Mon espace" },
];

const LEGAL = [
  { href: "#", label: "Confidentialité" },
  { href: "#", label: "CGU" },
  { href: "#", label: "Mentions légales" },
  { href: "#", label: "Cookies" },
];

const SOCIALS = [
  {
    name: "Instagram",
    href: "#",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "#",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.66a8.16 8.16 0 004.77 1.52V6.73a4.85 4.85 0 01-1-.04z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "X / Twitter",
    href: "#",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-white mt-24">
      {/* Top strip — golden */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

          {/* ── Brand col ─────────────────────────────────────────── */}
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-sand-50/10 rounded-xl flex items-center justify-center">
                <Plane className="w-4 h-4 text-white -rotate-45" />
              </div>
              <span className="font-serif text-xl">AI<span className="text-gold-400">VANA</span></span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Votre assistant voyage intelligent. Décrivez vos envies, notre IA trouve la destination parfaite — vols, hôtels, activités inclus.
            </p>
            <div className="flex items-center gap-2 text-sand-500 text-xs mb-2">
              <MapPin className="w-3.5 h-3.5" /> Paris, France
            </div>
            <div className="flex items-center gap-2 text-sand-500 text-xs">
              <Mail className="w-3.5 h-3.5" /> contact@aivana.com
            </div>
          </div>

          {/* ── Navigation ─────────────────────────────────────────── */}
          <div className="md:col-span-2">
            <p className="text-sand-500 text-[11px] tracking-widest uppercase mb-5 font-semibold">Menu</p>
            <ul className="space-y-3">
              {NAV.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-1 group">
                    <span className="group-hover:translate-x-0.5 transition-transform">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Legal ──────────────────────────────────────────────── */}
          <div className="md:col-span-2">
            <p className="text-sand-500 text-[11px] tracking-widest uppercase mb-5 font-semibold">Légal</p>
            <ul className="space-y-3">
              {LEGAL.map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Newsletter ─────────────────────────────────────────── */}
          <div className="md:col-span-4">
            <p className="text-sand-500 text-[11px] tracking-widest uppercase mb-5 font-semibold">Newsletter</p>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Recevez chaque semaine les meilleures offres de voyage et les conseils de notre IA.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2"
            >
              <input
                type="email"
                placeholder="votre@email.com"
                className="flex-1 bg-sand-50/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gold-500/50 focus:bg-sand-50/8 transition-all"
              />
              <button
                type="submit"
                className="flex-shrink-0 w-10 h-10 bg-gold-400 hover:bg-gold-300 rounded-xl flex items-center justify-center text-dark-900 transition-all hover:scale-105"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-gray-600 text-xs mt-2">Pas de spam. Désabonnement en 1 clic.</p>

            {/* Réseaux */}
            <div className="flex items-center gap-3 mt-8">
              {SOCIALS.map((s) => (
                <Link
                  key={s.name}
                  href={s.href}
                  title={s.name}
                  className="w-9 h-9 rounded-xl bg-sand-50/5 hover:bg-gold-400/20 hover:text-gold-400 text-gray-400 border border-white/10 hover:border-gold-400/30 flex items-center justify-center transition-all"
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Destinations highlights ────────────────────────────── */}
        <div className="border-t border-white/5 pt-8 mb-8">
          <p className="text-gray-600 text-[10px] tracking-widest uppercase mb-4">Destinations populaires</p>
          <div className="flex flex-wrap gap-2">
            {["Bali", "Marrakech", "Kyoto", "Islande", "Lisbonne", "Maldives", "Istanbul", "Buenos Aires", "Queenstown", "Dubaï", "New York", "Thaïlande"].map((d) => (
              <Link key={d} href="/explore"
                className="text-xs text-sand-500 hover:text-gold-400 transition-colors border border-white/5 hover:border-gold-400/20 px-3 py-1 rounded-full">
                {d}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────────────────── */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} AIVANA — Tous droits réservés.
          </p>
          <div className="flex items-center gap-2 text-gray-600 text-xs">
            <span>Fait avec</span>
            <span className="text-gold-500">✦</span>
            <span>et beaucoup d&apos;IA</span>
            <span className="mx-1 text-dark-800">·</span>
            <Link href="/auth/register" className="text-gold-500/70 hover:text-gold-400 transition-colors flex items-center gap-1">
              Créer un compte <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
