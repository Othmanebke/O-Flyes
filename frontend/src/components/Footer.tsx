import Link from "next/link";
import { Plane } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-footer text-white mt-32">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-1.5 mb-4">
              <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                <Plane className="w-3 h-3 text-white" />
              </span>
              <span className="font-semibold text-[15px]">O-Flyes</span>
            </div>
            <div className="w-8 h-px bg-white/20 mb-4" />
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Découvrez le monde grâce à des recommandations personnalisées par l&apos;IA.
              Votre prochain voyage commence ici.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-white/30 text-[11px] tracking-widest uppercase mb-4">Navigation</p>
            <ul className="space-y-3">
              {[
                { href: "/",        label: "Accueil" },
                { href: "/explore", label: "Destinations" },
                { href: "/chat",    label: "Chatbot IA" },
                { href: "/blog",    label: "Blog" },
                { href: "/gallery", label: "Galerie" },
                { href: "/pricing", label: "Tarifs" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/60 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="text-white/30 text-[11px] tracking-widest uppercase mb-4">Réseaux</p>
            <ul className="space-y-3">
              {["TikTok", "Instagram", "Threads", "LinkedIn"].map((s) => (
                <li key={s}>
                  <span className="text-white/60 hover:text-white text-sm transition-colors cursor-pointer">
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
          <p className="text-white/30 text-xs">© {new Date().getFullYear()} O-Flyes. Tous droits réservés.</p>
          <div className="flex gap-6">
            <span className="text-white/30 text-xs hover:text-white/60 cursor-pointer transition-colors">Confidentialité</span>
            <span className="text-white/30 text-xs hover:text-white/60 cursor-pointer transition-colors">Conditions</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
