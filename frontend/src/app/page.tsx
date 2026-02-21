"use client";
import Link from "next/link";
import { Plane, ArrowUpRight, ChevronDown, Star, MessageCircle } from "lucide-react";
import { useState } from "react";

const destinations = [
  { name: "Bali, Indonésie",    tag: "Farniente",  price: "À partir de 890€", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80", temp: "☀️ 30°C", period: "Avr – Oct" },
  { name: "Islande",            tag: "Aventure",   price: "À partir de 1290€", img: "https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=600&q=80", temp: "❄️ -5°C", period: "Déc – Mar" },
  { name: "Marrakech, Maroc",   tag: "Culture",    price: "À partir de 490€", img: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&q=80", temp: "🌤 22°C", period: "Mar – Mai" },
  { name: "Kyoto, Japon",       tag: "Dépaysement", price: "À partir de 1490€", img: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=600&q=80", temp: "🌸 18°C", period: "Mar – Avr" },
];

const faqs = [
  { q: "Comment fonctionne l'IA ?",          a: "Notre IA analyse vos préférences (budget, climat, période) et les croise avec une base de centaines de destinations pour vous proposer les meilleures options." },
  { q: "Le chatbot est-il disponible 24h/24 ?", a: "Oui, le chatbot IA est disponible à toute heure pour répondre à vos questions et affiner vos recommandations de voyage." },
  { q: "Peut-on réserver directement ?",      a: "Pour l'instant, O-Flyes vous propose des recommandations détaillées avec toutes les infos pratiques. La réservation directe arrive bientôt." },
  { q: "Les estimations de prix sont-elles fiables ?", a: "Les prix affichés sont des estimations basées sur les moyennes de marché. Ils varient selon la saison et le délai de réservation." },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-white">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-end overflow-hidden -mt-20">
        {/* Full-bleed photo */}
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=90"
          alt="Paysage montagne"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark gradient overlay bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {/* Top fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent h-48" />

        {/* Content */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-8 pb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              {/* Left – big title */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-px bg-white/60" />
                  <span className="text-white/70 text-[11px] tracking-widest uppercase">O-Flyes</span>
                </div>
                <h1 className="font-serif text-5xl md:text-7xl text-white leading-[1.1] max-w-lg fade-up">
                  Explorez les<br />Plus Beaux<br />Endroits du Monde
                </h1>
                <div className="flex items-center gap-3 mt-8 fade-up-delay-2">
                  <Link href="/explore" className="btn-gold text-sm">
                    Découvrir les destinations
                  </Link>
                  <span className="text-white/50 text-sm">ou</span>
                  <Link href="/chat" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    Parler à l&apos;IA
                  </Link>
                </div>
              </div>
              {/* Right – small info card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 min-w-[220px] fade-up-delay-3">
                <p className="text-white/60 text-xs mb-1">Destinations analysées</p>
                <p className="text-white font-semibold text-2xl mb-3">500+</p>
                <p className="text-white/60 text-xs mb-1">Voyageurs satisfaits</p>
                <p className="text-white font-semibold text-2xl mb-3">12 000+</p>
                <p className="text-white/60 text-xs mb-1">Note moyenne</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-gold text-gold" />
                  <span className="text-white font-semibold text-lg">4.9</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOP PICKS ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-label mb-2">Nos Coups de Cœur</p>
              <h2 className="font-serif text-4xl md:text-5xl text-dark">
                Trouvez votre<br />expérience parfaite
              </h2>
            </div>
            <Link href="/explore" className="hidden md:flex items-center gap-2 text-sm font-medium text-dark/60 hover:text-dark transition-colors">
              Voir tout
              <span className="w-7 h-7 rounded-full bg-dark-100 flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {/* Card row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {destinations.map((d, i) => (
              <Link
                href="/explore"
                key={d.name}
                className={`group relative rounded-2xl overflow-hidden card-hover cursor-pointer ${i === 0 ? "md:col-span-2 row-span-1" : ""}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`relative overflow-hidden ${i === 0 ? "h-64 md:h-80" : "h-56"}`}>
                  <img
                    src={d.img}
                    alt={d.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {/* Info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="inline-block bg-gold/80 backdrop-blur-sm text-dark text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full mb-1">
                          {d.tag}
                        </span>
                        <p className="text-white font-semibold text-sm leading-tight">{d.name}</p>
                        <p className="text-white/70 text-xs mt-0.5">{d.period} · {d.temp}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/70 text-[10px]">dès</p>
                        <p className="text-white font-bold text-sm">{d.price.replace("À partir de ", "")}</p>
                      </div>
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-3.5 h-3.5 text-dark" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE STRIP ─────────────────────────────────────────────────── */}
      <div className="bg-dark py-4 overflow-hidden">
        <div className="marquee-inner">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="flex items-center gap-10 px-10 whitespace-nowrap">
              {["Bali", "Islande", "Japon", "Maroc", "Thaïlande", "Pérou", "Norvège", "Mexique", "Vietnam", "Portugal"].map((c) => (
                <span key={c} className="text-white/50 text-sm tracking-wider uppercase flex items-center gap-4">
                  {c}
                  <span className="text-gold text-lg">❖</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── ABOUT / BRAND BLOCK ───────────────────────────────────────────── */}
      <section className="py-24 px-8 bg-sand-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-label mb-4">Notre approche</p>
              <h2 className="font-serif text-4xl md:text-5xl text-dark leading-tight mb-6">
                Avec l&apos;amour du voyage<br />et de l&apos;exploration
              </h2>
              <p className="text-dark-400 leading-relaxed mb-8 max-w-md">
                Nous créons des itinéraires qui inspirent, connectent et restent
                gravés dans les mémoires. Chaque recommandation est pensée pour
                correspondre exactement à votre profil de voyageur.
              </p>
              <Link href="/chat" className="btn-gold">
                Parler à notre IA
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            {/* Photo grid */}
            <div className="grid grid-cols-2 gap-3">
              <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80" alt="" className="rounded-2xl h-52 w-full object-cover" />
              <img src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80" alt="" className="rounded-2xl h-52 w-full object-cover mt-8" />
              <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80" alt="" className="rounded-2xl h-52 w-full object-cover -mt-4" />
              <img src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400&q=80" alt="" className="rounded-2xl h-52 w-full object-cover mt-4" />
            </div>
          </div>
        </div>
      </section>

      {/* ── AI VIDEO / FEATURE BLOCK ─────────────────────────────────────── */}
      <section className="py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <p className="section-label mb-10 text-center">Notre IA</p>
          {/* Banner */}
          <div className="relative rounded-3xl overflow-hidden h-[420px] mb-6">
            <img
              src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1400&q=85"
              alt="Voyage nocturne"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 h-full flex items-end justify-between p-10">
              <div>
                <h2 className="font-serif text-4xl md:text-5xl text-white mb-3 max-w-md leading-tight">
                  Planifiez votre voyage<br />en toute confiance
                </h2>
                <p className="text-white/60 max-w-sm text-sm">
                  De la météo au budget, en passant par les meilleures périodes —
                  notre IA vous guide à chaque étape.
                </p>
              </div>
              {/* Stats bubble */}
              <div className="hidden md:block bg-white rounded-2xl p-6 min-w-[160px] text-center border-b-4 border-gold">
                <p className="font-bold text-4xl text-dark mb-1">95%</p>
                <p className="text-dark-400 text-xs">de voyageurs<br/>pleinement satisfaits</p>
              </div>
            </div>
            {/* CTA button center bottom */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
              <Link href="/chat" className="btn-dark">
                <MessageCircle className="w-4 h-4" />
                Essayer le chatbot
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="py-20 px-8 bg-sand-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="section-label mb-2">Témoignages</p>
              <h2 className="font-serif text-4xl md:text-5xl text-dark">
                Ce que disent<br />nos voyageurs
              </h2>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <p className="font-bold text-5xl text-dark">4.9</p>
              <div className="flex gap-0.5 my-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-300" />)}
              </div>
              <p className="text-dark-400 text-xs">856 avis vérifiés</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Sophie M.", loc: "Paris", text: "O-Flyes m'a trouvé Bali en 30 secondes avec mon budget exact. Le chatbot est bluffant de précision !", stars: 5 },
              { name: "Thomas B.", loc: "Lyon",  text: "J'avais des critères très précis (froid, budget serré, pas trop loin). L'IA a proposé l'Islande en hiver — parfait.", stars: 5 },
              { name: "Marie L.", loc: "Bordeaux", text: "Interface top, réponses ultra rapides. J'ai planifié mon voyage au Japon en une soirée. Je recommande !", stars: 5 },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 card-hover">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.stars)].map((_, j) => <Star key={j} className="w-4 h-4 fill-gold-400 text-gold-300" />)}
                </div>
                <p className="text-dark leading-relaxed text-sm mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gold-50 rounded-full flex items-center justify-center text-sm font-semibold text-gold-500">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-dark">{t.name}</p>
                    <p className="text-dark-400 text-xs">{t.loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="section-label mb-3">FAQ</p>
              <h2 className="font-serif text-4xl text-dark leading-tight">
                Tout ce que vous devez<br />savoir avant de<br />commencer
              </h2>
              <Link href="/chat" className="btn-dark mt-8">
                Poser une question
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-dark-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-sand-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-dark">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-dark-400 flex-shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 text-sm text-dark-400 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section className="px-8 pb-0">
        <div className="max-w-7xl mx-auto">
          <div className="bg-sand-50 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center gap-10">
            {/* Left */}
            <div className="flex-1">
              <span className="tag mb-4">Commencer maintenant</span>
              <h2 className="font-serif text-4xl md:text-5xl text-dark leading-tight mb-3">
                Découvrez votre prochain<br />voyage idéal
              </h2>
              <p className="text-dark-400 text-sm mb-8 max-w-sm">
                Planifiez votre voyage en quelques minutes et profitez
                de chaque instant de votre escapade.
              </p>
              <div className="flex items-center gap-3">
                <Link href="/explore" className="btn-gold">
                  Planifier mon voyage
                </Link>
                <Link href="/explore" className="w-10 h-10 rounded-full border border-dark flex items-center justify-center hover:bg-dark hover:text-white transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            {/* Right – two photos */}
            <div className="flex gap-3 flex-shrink-0">
              <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=260&q=80" alt="" className="rounded-2xl h-52 w-44 object-cover" />
              <img src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=260&q=80" alt="" className="rounded-2xl h-52 w-44 object-cover mt-6" />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
