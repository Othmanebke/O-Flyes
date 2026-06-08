"use client";
import Link from "next/link";
import { Mail, Send } from "lucide-react";
import { useState } from "react";

const EXPLORE = [
  { href: "/explore", label: "Destinations" },
  { href: "/explore/flights", label: "Vols" },
  { href: "/explore/hotels", label: "Hôtels" },
  { href: "/explore/activities", label: "Activités" },
];

const SUPPORT = [
  { href: "#", label: "FAQ" },
  { href: "#", label: "Contact" },
  { href: "#", label: "Blog" },
  { href: "#", label: "Conditions" },
];

const COMPANY = [
  { href: "#", label: "À propos" },
  { href: "#", label: "Carrières" },
  { href: "#", label: "Presse" },
  { href: "#", label: "Partenaires" },
];

const SOCIALS = [
  { name: "Instagram", href: "https://instagram.com", icon: "instagram" },
  { name: "TikTok", href: "https://tiktok.com", icon: "tiktok" },
  { name: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
  { name: "Twitter", href: "https://twitter.com", icon: "twitter" },
];

// Plane shapes for decoration
const PlaneIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full" style={style} fill="currentColor">
    <path d="M50 10 L70 40 L85 38 L50 65 L85 62 L70 85 L50 60 L30 85 L30 62 L15 65 L50 40 L30 38 Z" />
  </svg>
);

export default function Footer() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  return (
    <footer className="relative z-20 overflow-hidden transition-colors duration-300 border-t" style={{ backgroundColor: 'var(--bg-secondary)', borderTopColor: 'var(--border-color)' }}>
      {/* Animated top line */}
      <div className="h-[3px] bg-gradient-to-r from-transparent via-gold/80 to-transparent" />

      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated planes in background */}
        <div className="absolute top-10 left-10 opacity-5 w-32 h-32 animate-pulse">
          <PlaneIcon style={{ color: 'var(--gold)', transform: 'rotate(-15deg)' }} />
        </div>
        <div className="absolute top-20 right-20 opacity-4 w-40 h-40 animate-bounce" style={{ animationDuration: '4s' }}>
          <PlaneIcon style={{ color: 'var(--gold)', transform: 'rotate(35deg)' }} />
        </div>
        <div className="absolute bottom-20 left-1/3 opacity-3 w-24 h-24 animate-pulse" style={{ animationDuration: '3s' }}>
          <PlaneIcon style={{ color: 'var(--gold)', transform: 'rotate(-45deg)' }} />
        </div>
      </div>

      {/* Main content */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left side: Card + Newsletter */}
          <div className="space-y-8">
            {/* Design card */}
            <div 
              className="relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(197, 160, 89, 0.2)'
              }}
              onMouseEnter={() => setHoveredLink('card')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              {/* Plane decorations on card */}
              <div className="absolute top-4 right-4 w-12 h-12 opacity-10 animate-bounce">
                <PlaneIcon style={{ color: 'var(--gold)', transform: 'rotate(20deg)' }} />
              </div>
              <div className="absolute bottom-4 left-4 w-8 h-8 opacity-5">
                <PlaneIcon style={{ color: 'var(--gold)', transform: 'rotate(-30deg)' }} />
              </div>

              <div className="p-8 md:p-10 relative z-10">
                {/* Logo + title */}
                <div className="mb-6">
                  <Link href="/" className="inline-flex items-center gap-3 mb-4">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center animate-pulse"
                      style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold)/60)' }}
                    >
                      <PlaneIcon style={{ color: '#0A0D14', width: '20px', height: '20px' }} />
                    </div>
                    <span className="text-2xl font-serif font-black tracking-wide" style={{ color: '#0A0D14' }}>
                      AIVANA
                    </span>
                  </Link>
                  <p className="text-sm leading-relaxed" style={{ color: '#666' }}>
                    Explorez le monde avec l&apos;intelligence artificielle. Vos voyages de rêve, planifiés à la perfection.
                  </p>
                </div>

                {/* Newsletter form */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#0A0D14' }}>
                    Restez inspiré
                  </label>
                  <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                    <input
                      type="email"
                      placeholder="votre@email.com"
                      className="flex-1 px-4 py-3 rounded-lg text-sm transition-all focus:outline-none"
                      style={{
                        backgroundColor: 'rgba(197, 160, 89, 0.08)',
                        color: '#0A0D14',
                        border: '1px solid rgba(197, 160, 89, 0.3)'
                      }}
                    />
                    <button
                      className="px-4 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: 'var(--gold)',
                        color: '#0A0D14',
                      }}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {/* Socials */}
                <div className="mt-6 flex items-center gap-3">
                  {SOCIALS.map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      title={s.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 border-2"
                      style={{
                        borderColor: hoveredLink === s.name ? 'var(--gold)' : 'rgba(197, 160, 89, 0.3)',
                        backgroundColor: hoveredLink === s.name ? 'var(--gold)' : 'transparent',
                        color: hoveredLink === s.name ? '#0A0D14' : 'rgba(197, 160, 89, 0.6)',
                      }}
                      onMouseEnter={() => setHoveredLink(s.name)}
                      onMouseLeave={() => setHoveredLink(null)}
                    >
                      {s.icon === 'instagram' && <InstagramIcon />}
                      {s.icon === 'tiktok' && <TikTokIcon />}
                      {s.icon === 'linkedin' && <LinkedInIcon />}
                      {s.icon === 'twitter' && <TwitterIcon />}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Links grid + World map decoration */}
          <div className="space-y-8">
            {/* Links grid with plane accents */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {/* Explorer */}
              <div className="group">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--gold)' }}>
                    <PlaneIcon />
                  </div>
                  <h3 className="font-semibold text-sm tracking-wide" style={{ color: 'var(--text-primary)' }}>
                    EXPLORER
                  </h3>
                </div>
                <nav className="flex flex-col gap-2">
                  {EXPLORE.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className="text-sm transition-all duration-200 hover:translate-x-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      → {label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Support */}
              <div className="group">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--gold)' }}>
                    <PlaneIcon style={{ transform: 'rotate(90deg)' }} />
                  </div>
                  <h3 className="font-semibold text-sm tracking-wide" style={{ color: 'var(--text-primary)' }}>
                    SUPPORT
                  </h3>
                </div>
                <nav className="flex flex-col gap-2">
                  {SUPPORT.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className="text-sm transition-all duration-200 hover:translate-x-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      → {label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Company */}
              <div className="group">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--gold)' }}>
                    <PlaneIcon style={{ transform: 'rotate(-45deg)' }} />
                  </div>
                  <h3 className="font-semibold text-sm tracking-wide" style={{ color: 'var(--text-primary)' }}>
                    ENTREPRISE
                  </h3>
                </div>
                <nav className="flex flex-col gap-2">
                  {COMPANY.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className="text-sm transition-all duration-200 hover:translate-x-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      → {label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            {/* Contact section */}
            <div 
              className="rounded-xl p-6 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(197, 160, 89, 0.05) 0%, rgba(197, 160, 89, 0.02) 100%)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div className="absolute top-2 right-2 w-16 h-16 opacity-5">
                <PlaneIcon style={{ color: 'var(--gold)' }} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Nous contacter
                  </h3>
                </div>
                <a href="mailto:contact@aivana.io" className="text-sm transition-all hover:underline" style={{ color: 'var(--text-muted)' }}>
                  contact@aivana.io
                </a>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  Lun-Ven: 9h-18h GMT+1
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom divider */}
        <div className="my-12 h-px" style={{ backgroundColor: 'var(--border-color)' }} />

        {/* Footer bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} AIVANA · Tous droits réservés · Fait avec <span style={{ color: 'var(--gold)' }}>✦</span> et beaucoup d&apos;IA
          </p>
          <div className="flex gap-4 text-xs">
            <Link href="#" className="transition-all hover:underline" style={{ color: 'var(--text-muted)' }}>
              Confidentialité
            </Link>
            <span style={{ color: 'var(--border-color)' }}>·</span>
            <Link href="#" className="transition-all hover:underline" style={{ color: 'var(--text-muted)' }}>
              Conditions
            </Link>
            <span style={{ color: 'var(--border-color)' }}>·</span>
            <Link href="#" className="transition-all hover:underline" style={{ color: 'var(--text-muted)' }}>
              Cookies
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative planes floating */}
      <div className="absolute top-1/4 right-8 w-20 h-20 opacity-8 animate-pulse" style={{ color: 'var(--gold)' }}>
        <PlaneIcon style={{ transform: 'rotate(25deg)', animation: 'float 6s ease-in-out infinite' }} />
      </div>
      <div className="absolute bottom-1/3 left-8 w-16 h-16 opacity-6 animate-bounce" style={{ color: 'var(--gold)', animationDuration: '5s' }}>
        <PlaneIcon style={{ transform: 'rotate(-60deg)' }} />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(25deg); }
          50% { transform: translateY(-20px) rotate(25deg); }
        }
      `}</style>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.66a8.16 8.16 0 004.77 1.52V6.73z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
