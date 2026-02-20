import Link from "next/link";
import { Plane, MessageCircle, MapPin, Banknote, Thermometer, Calendar } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#0c2340] to-[#0a0f1e]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(14,165,233,0.15)_0%,_transparent_70%)]" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-900/40 border border-brand-700/40 rounded-full px-4 py-1.5 text-brand-300 text-sm mb-6">
            <Plane className="w-4 h-4" />
            Propulsé par IA
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-brand-200 to-brand-400 bg-clip-text text-transparent leading-tight">
            Votre prochain voyage,<br />imaginé par l'IA
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            O-Flyes analyse vos envies, votre budget et votre période pour vous recommander
            les destinations parfaites. Chaud, froid, aventure ou détente – on a tout.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/explore"
              className="px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(14,165,233,0.4)]"
            >
              Explorer les destinations
            </Link>
            <Link
              href="/chat"
              className="px-8 py-4 glass text-white rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center gap-2 justify-center"
            >
              <MessageCircle className="w-5 h-5" />
              Parler au chatbot
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
            En quelques questions, notre IA trouve votre destination idéale.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Banknote, title: "Budget", desc: "Indiquez votre budget total et on optimise chaque euro." },
              { icon: Thermometer, title: "Climat", desc: "Chaud tropical, froid polaire ou tempéré – à vous de choisir." },
              { icon: Calendar, title: "Période", desc: "Vos dates de départ pour des recommandations en saison." },
              { icon: MapPin, title: "Envies", desc: "Plage, montagne, culture, street food… décrivez vos rêves." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass rounded-2xl p-6 hover:border-brand-700/50 transition-colors">
                <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto glass rounded-3xl p-12 text-center">
          <MessageCircle className="w-12 h-12 text-brand-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Essayez le chatbot maintenant</h2>
          <p className="text-gray-400 mb-8">
            Dites-nous juste "je veux du soleil en juillet avec 1500€" et regardez la magie opérer.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold transition-all hover:scale-105"
          >
            <MessageCircle className="w-5 h-5" />
            Commencer la conversation
          </Link>
        </div>
      </section>
    </div>
  );
}
