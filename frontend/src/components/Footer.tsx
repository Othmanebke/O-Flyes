"use client";
import Link from "next/link";
import { Plane, Send, ArrowRight } from "lucide-react";
import { useState } from "react";

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
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setEmail("");
    }
  };

  return (
    <footer className="relative overflow-hidden border-t footer-root">
      {/* ── Animated background orbs ── */}
      <div className="footer-orb footer-orb-1" />
      <div className="footer-orb footer-orb-2" />
      <div className="footer-orb footer-orb-3" />

      {/* ── Animated top border ── */}
      <div className="footer-top-line" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 pt-16 pb-10">

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">

          {/* ── Col 1 · Brand ── */}
          <div className="space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="footer-logo-icon group-hover:scale-110 transition-transform duration-300">
                <Plane className="w-4 h-4 text-gold group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <span className="font-serif text-base font-bold tracking-tight footer-brand-text">
                AI<span className="text-gold">VANA</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed max-w-xs footer-muted">
              Explorez le monde avec l&apos;intelligence artificielle. Vos voyages
              de rêve, planifiés à la perfection.
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
                  className="footer-social-btn group"
                >
                  <span className="footer-social-icon">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* ── Col 2 · Navigation ── */}
          <div className="space-y-5">
            <h3 className="footer-section-title">Explorer</h3>
            <nav className="flex flex-col gap-2.5">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="footer-nav-link group flex items-center gap-2"
                >
                  <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-gold" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* ── Col 3 · Newsletter ── */}
          <div className="space-y-5">
            <h3 className="footer-section-title">Newsletter</h3>
            <p className="text-sm footer-muted leading-relaxed">
              Recevez nos meilleures offres et inspirations voyage directement dans votre boîte mail.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className={`footer-input-wrap ${focused ? "footer-input-focused" : ""}`}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="votre@email.com"
                  className="footer-input"
                />
              </div>
              <button
                type="submit"
                className={`footer-submit-btn ${submitted ? "footer-submit-success" : ""}`}
              >
                {submitted ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Inscrit !
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="w-3.5 h-3.5" />
                    S&apos;inscrire
                  </span>
                )}
              </button>
            </form>

            <p className="text-xs footer-muted opacity-60">
              Pas de spam · Désabonnement en 1 clic
            </p>
          </div>
        </div>

        {/* ── BOTTOM ── */}
        <div className="footer-divider mt-12" />
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs footer-muted">
            © {new Date().getFullYear()} AIVANA · Tous droits réservés · Fait avec{" "}
            <span className="text-gold">✦</span> et beaucoup d&apos;IA
          </p>
          <div className="flex items-center gap-4">
            {LEGAL_LINKS.map(({ href, label }, i) => (
              <span key={href} className="flex items-center gap-4">
                {i > 0 && <span className="footer-dot">·</span>}
                <Link href={href} className="text-xs footer-muted hover:text-gold transition-colors duration-200">
                  {label}
                </Link>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Floating animated plane ── */}
      <div className="footer-plane" aria-hidden>
        <Plane className="w-full h-full text-gold" />
      </div>

      <style>{`
        /* ── Root ── */
        .footer-root {
          background: var(--bg-secondary);
          border-top-color: var(--border-color);
        }

        /* ── Animated top gradient line ── */
        .footer-top-line {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(197,160,89,0.6) 30%,
            rgba(197,160,89,1) 50%,
            rgba(197,160,89,0.6) 70%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer-line 4s ease-in-out infinite;
        }
        @keyframes shimmer-line {
          0%   { background-position: 200% center; opacity: 0.4; }
          50%  { background-position: 0% center;   opacity: 1;   }
          100% { background-position: -200% center; opacity: 0.4; }
        }

        /* ── Background orbs ── */
        .footer-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(80px);
          animation: orb-drift 10s ease-in-out infinite;
        }
        .footer-orb-1 {
          width: 400px; height: 300px;
          top: -80px; left: -80px;
          background: radial-gradient(circle, rgba(197,160,89,0.12) 0%, transparent 70%);
          animation-duration: 12s;
        }
        .footer-orb-2 {
          width: 350px; height: 350px;
          top: -60px; right: -60px;
          background: radial-gradient(circle, rgba(80,105,138,0.10) 0%, transparent 70%);
          animation-duration: 15s;
          animation-delay: -4s;
        }
        .footer-orb-3 {
          width: 250px; height: 200px;
          bottom: 0; left: 40%;
          background: radial-gradient(circle, rgba(197,160,89,0.07) 0%, transparent 70%);
          animation-duration: 18s;
          animation-delay: -8s;
        }
        @keyframes orb-drift {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33%       { transform: translate(20px, -15px) scale(1.05); }
          66%       { transform: translate(-15px, 10px) scale(0.97); }
        }

        /* ── Logo icon ── */
        .footer-logo-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(197,160,89,0.1);
          border: 1px solid rgba(197,160,89,0.25);
          box-shadow: 0 0 20px rgba(197,160,89,0.08);
        }

        /* ── Brand text ── */
        .footer-brand-text { color: var(--text-primary); }

        /* ── Muted text ── */
        .footer-muted { color: var(--text-muted); }

        /* ── Section title ── */
        .footer-section-title {
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: var(--text-primary);
          position: relative;
          padding-bottom: 10px;
        }
        .footer-section-title::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 24px; height: 2px;
          background: linear-gradient(90deg, #C5A059, transparent);
          border-radius: 2px;
          animation: title-bar 3s ease-in-out infinite;
        }
        @keyframes title-bar {
          0%, 100% { width: 24px; opacity: 0.8; }
          50%       { width: 40px; opacity: 1; }
        }

        /* ── Nav links ── */
        .footer-nav-link {
          font-size: 14px;
          color: var(--text-muted);
          transition: color 0.2s, transform 0.2s;
        }
        .footer-nav-link:hover { color: #C5A059; transform: translateX(4px); }

        /* ── Social buttons ── */
        .footer-social-btn {
          width: 32px; height: 32px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          transition: all 0.25s;
          position: relative;
          overflow: hidden;
        }
        .footer-social-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(197,160,89,0.15), rgba(197,160,89,0.05));
          opacity: 0;
          transition: opacity 0.25s;
        }
        .footer-social-btn:hover::before { opacity: 1; }
        .footer-social-btn:hover {
          color: #C5A059;
          border-color: rgba(197,160,89,0.5);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(197,160,89,0.15);
        }

        /* ── Newsletter input ── */
        .footer-input-wrap {
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          transition: border-color 0.3s, box-shadow 0.3s;
          overflow: hidden;
        }
        .footer-input-focused {
          border-color: rgba(197,160,89,0.6);
          box-shadow: 0 0 0 3px rgba(197,160,89,0.08), 0 0 20px rgba(197,160,89,0.1);
        }
        .footer-input {
          width: 100%; padding: 10px 14px;
          background: transparent;
          color: var(--text-primary);
          font-size: 13px;
          outline: none;
          border: none;
        }
        .footer-input::placeholder { color: var(--text-muted); opacity: 0.6; }

        /* ── Submit button ── */
        .footer-submit-btn {
          width: 100%; padding: 10px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          background: linear-gradient(135deg, #C5A059, #d4b070);
          color: #0a1128;
          border: none; cursor: pointer;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }
        .footer-submit-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .footer-submit-btn:hover::before { opacity: 1; }
        .footer-submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(197,160,89,0.35);
        }
        .footer-submit-btn:active { transform: scale(0.97); }
        .footer-submit-success {
          background: linear-gradient(135deg, #5a9e6f, #3d8058) !important;
          color: #fff !important;
        }

        /* ── Divider ── */
        .footer-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border-color) 30%, var(--border-color) 70%, transparent);
        }

        /* ── Dot separator ── */
        .footer-dot { color: var(--border-color); font-size: 12px; }

        /* ── Floating plane ── */
        .footer-plane {
          position: absolute;
          bottom: 16px; right: 24px;
          width: 28px; height: 28px;
          opacity: 0.08;
          animation: plane-float 6s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes plane-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-8px) rotate(5deg); }
        }
      `}</style>
    </footer>
  );
}
