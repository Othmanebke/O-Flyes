"use client";
import Link from "next/link";
import { Plane, ArrowUpRight, ChevronDown, Star, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HERO_SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1800&q=90",
    location: "AIVANA Sync",
    title: "Toutes vos Réservations,\nUn Seul Dashboard",
    sub: "La synchronisation automatique de vos voyages par email. Zéro saisie, 100% visibilité.",
  },
  {
    img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1800&q=90",
    location: "Zéro Effort",
    title: "Connectez votre Email,\nAdmirez la Magie",
    sub: "Notre IA extrait vos vols, hôtels et activités directement de vos confirmations.",
  },
];

const faqs = [
  { q: "Comment fonctionne l'IA ?", a: "Notre IA analyse vos préférences (budget, climat, période) et les croise avec une base de centaines de destinations pour vous proposer les meilleures options." },
  { q: "Le chatbot est-il disponible 24h/24 ?", a: "Oui, le chatbot IA est disponible à toute heure pour répondre à vos questions et affiner vos recommandations de voyage." },
  { q: "Peut-on réserver directement ?", a: "Pour l'instant, AIVANA vous propose des recommandations détaillées avec toutes les infos pratiques. La réservation directe arrive bientôt." },
  { q: "Les estimations de prix sont-elles fiables ?", a: "Les prix affichés sont des estimations basées sur les moyennes de marché. Ils varient selon la saison et le délai de réservation." },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(-1);
  const [transitioning, setTransitioning] = useState(false);

  const triggerChatbot = () => {
    window.dispatchEvent(new CustomEvent("open-chatbot"));
  };

  const goTo = useCallback((idx: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setPrevSlide(slide);
    setSlide(idx);
    setTimeout(() => { setPrevSlide(-1); setTransitioning(false); }, 900);
  }, [slide, transitioning]);

  const next = useCallback(() => goTo((slide + 1) % HERO_SLIDES.length), [slide, goTo]);
  const prev = useCallback(() => goTo((slide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length), [slide, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="bg-[#0A0D14]">

      {/* ── HERO SLIDESHOW ──────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-end overflow-hidden -mt-20">
        {/* Slides — crossfade */}
        {HERO_SLIDES.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-[900ms]"
            style={{ opacity: i === slide ? 1 : 0, zIndex: i === slide ? 2 : i === prevSlide ? 1 : 0 }}
          >
            <img src={s.img} alt={s.location} className="absolute inset-0 w-full h-full object-cover" />
          </div>
        ))}

        {/* Overlays */}
        <div className="absolute inset-0 bg-black/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
        <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/20 to-transparent h-32 z-10" />

        {/* Content */}
        <div className="relative z-20 w-full pt-32 md:pt-40">
          <div className="max-w-7xl mx-auto px-8 pb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              {/* Left – dynamic title */}
              <div className="max-w-lg">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slide}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-px bg-white/40" />
                      <span className="text-white/70 text-[11px] tracking-widest uppercase">AIVANA</span>
                      <span className="text-gold text-[11px] tracking-wide uppercase border border-gold/40 px-2 py-0.5 rounded-full">
                        {HERO_SLIDES[slide].location}
                      </span>
                    </div>
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-white leading-[1.1] whitespace-pre-line drop-shadow-lg">
                      {HERO_SLIDES[slide].title}
                    </h1>
                    <p className="text-white/70 text-sm mt-4 mb-8 max-w-sm">{HERO_SLIDES[slide].sub}</p>
                  </motion.div>
                </AnimatePresence>
                <div className="flex flex-wrap items-center gap-4">
                  <Link href="/auth/register" className="btn-gold text-sm whitespace-nowrap px-8">Créer mon espace</Link>
                  <a href="#how-it-works" className="inline-flex items-center gap-2 text-white hover:text-gold transition-colors text-sm font-medium">
                    <ChevronDown className="w-4 h-4 animate-bounce" />Voir comment ça marche
                  </a>
                </div>
              </div>
              {/* Right – stats card */}
              <div className="bg-[#141822]/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 min-w-[200px] flex md:flex-col items-center md:items-start justify-between md:justify-start gap-4 md:gap-0">
                <div className="flex md:block items-center md:items-start gap-4 md:gap-0">
                  <div className="md:mb-3">
                    <p className="text-white/60 text-[10px] md:text-xs mb-0.5 md:mb-1">Analysées</p>
                    <p className="text-white font-semibold text-lg md:text-2xl">500+</p>
                  </div>
                  <div className="md:mb-3">
                    <p className="text-white/60 text-[10px] md:text-xs mb-0.5 md:mb-1">Voyageurs</p>
                    <p className="text-white font-semibold text-lg md:text-2xl">12k+</p>
                  </div>
                </div>
                <div>
                  <p className="text-white/60 text-[10px] md:text-xs mb-0.5 md:mb-1">Note moy.</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                    <span className="text-white font-semibold text-base md:text-lg">4.9</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls — arrows + dots */}
            <div className="flex items-center gap-4 mt-10">
              <button onClick={prev} className="w-9 h-9 rounded-full border border-white/20 hover:border-white/50 flex items-center justify-center text-white/50 hover:text-white transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-2">
                {HERO_SLIDES.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${i === slide ? "w-8 bg-white" : "w-2 bg-white/20 hover:bg-white/40"}`}
                  />
                ))}
              </div>
              <button onClick={next} className="w-9 h-9 rounded-full border border-white/20 hover:border-white/50 flex items-center justify-center text-white/50 hover:text-white transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-8 bg-[#0A0D14]">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <p className="section-label mb-4 text-gold/80">Fonctionnement</p>
          <h2 className="font-serif text-4xl md:text-5xl text-white">Votre voyage se planifie seul</h2>
          <p className="text-white/60 mt-4 max-w-2xl mx-auto">
            AIVANA se connecte à vos confirmations de réservation pour créer automatiquement votre itinéraire centralisé.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Inscription", desc: "Créez votre compte AIVANA en quelques secondes pour accéder à votre espace personnel." },
            { step: "02", title: "Connexion Email", desc: "Connectez votre boîte Gmail ou Outlook en toute sécurité. Notre IA fait le reste." },
            { step: "03", title: "Dashboard Magique", desc: "Vos vols, hôtels et activités s'affichent automatiquement. Zéro saisie manuelle." },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="p-10 rounded-3xl bg-[#141822] border border-white/5 hover:border-gold/30 transition-all group lg:min-h-[300px]"
            >
              <span className="text-5xl font-serif text-gold/30 group-hover:text-gold transition-colors">{s.step}</span>
              <h3 className="text-xl font-bold text-white mt-4 mb-3">{s.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ────────────────────────────────────────────── */}
      <section className="py-24 px-8 bg-[#0A0D14] overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-label mb-4 text-gold/80">L&apos;Expérience AIVANA</p>
              <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight mb-6">
                Le Dashboard qui prend<br />soin de votre voyage
              </h2>
              <div className="space-y-6">
                {[
                  { t: "Centralisation Totale", d: "Plus besoin de chercher vos PDFs. Tout est au même endroit, trié par voyage." },
                  { t: "Synchronisation Temps Réel", d: "Dès que vous recevez une confirmation, elle apparaît dans votre Dashboard." },
                  { t: "Zéro Effort", d: "L&apos;IA extrait les dates, lieux et numéros de dossier pour vous." },
                ].map((f, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-gold" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{f.t}</h4>
                      <p className="text-white/60 text-xs mt-1 leading-relaxed">{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/auth/register" className="btn-gold mt-10">Créer mon espace gratuit</Link>
            </div>

            {/* Visual Mockup */}
            <div className="relative">
              <div className="bg-[#141822] rounded-3xl shadow-[0_40px_80px_rgba(0,0,0,0.4)] border border-white/10 p-8 transform lg:rotate-2 lg:scale-105">
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">🏝️</div>
                    <div>
                      <p className="text-xs font-bold text-white">Voyage à Bali</p>
                      <p className="text-[10px] text-white/50">12 Mai — 24 Mai 2024</p>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full border-2 border-[#141822] bg-white/20" />
                    <div className="w-6 h-6 rounded-full border-2 border-[#141822] bg-gold" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/10 shadow-sm">✈️</div>
                      <div>
                        <p className="text-xs font-bold text-white">Vol AF256</p>
                        <p className="text-[10px] text-white/50">Départ 10:45 Paris CDG</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Confirmé</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/10 shadow-sm">🏨</div>
                      <div>
                        <p className="text-xs font-bold text-white">Alila Villas Uluwatu</p>
                        <p className="text-[10px] text-white/50">Check-in 14:00</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Confirmé</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-gold/20 text-white border border-gold/30 flex items-center justify-between shadow-[0_0_20px_rgba(201,168,76,0.1)]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gold/20">🏄</div>
                      <div>
                        <p className="text-xs font-bold text-gold-200">Session Surf Kuta</p>
                        <p className="text-[10px] text-gold-200/60">Demain 09:00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative bubbles */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gold/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE STRIP ─────────────────────────────────────────────────── */}
      <div className="bg-[#141822] py-4 overflow-hidden border-y border-white/5">
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
      <section className="py-24 px-8 bg-[#0A0D14]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-label mb-4 text-gold/80">Notre approche</p>
              <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight mb-6">
                Avec l&apos;amour du voyage<br />et de l&apos;exploration
              </h2>
              <p className="text-white/60 leading-relaxed mb-8 max-w-md">
                Nous créons des itinéraires qui inspirent, connectent et restent
                gravés dans les mémoires. Chaque recommandation est pensée pour
                correspondre exactement à votre profil de voyageur.
              </p>
              <button onClick={triggerChatbot} className="btn-gold">
                Parler à notre IA
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            {/* Photo grid */}
            <div className="grid grid-cols-2 gap-3 mt-10 md:mt-0">
              <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80" alt="" className="rounded-2xl h-40 md:h-52 w-full object-cover" />
              <img src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80" alt="" className="rounded-2xl h-40 md:h-52 w-full object-cover mt-4 md:mt-8" />
              <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80" alt="" className="rounded-2xl h-40 md:h-52 w-full object-cover -mt-4" />
              <img src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400&q=80" alt="" className="rounded-2xl h-40 md:h-52 w-full object-cover mt-4" />
            </div>
          </div>
        </div>
      </section>

      {/* ── AI VIDEO / FEATURE BLOCK ─────────────────────────────────────── */}
      <section className="py-24 px-8 bg-[#0A0D14]">
        <div className="max-w-7xl mx-auto">
          <p className="section-label mb-10 text-center text-gold/80">Notre IA</p>
          {/* Banner */}
          <div className="relative rounded-3xl overflow-hidden h-[420px] mb-6 border border-white/10 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1400&q=85"
              alt="Voyage nocturne"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#0A0D14]/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14]/90 to-transparent" />
            <div className="relative z-10 h-full flex flex-col md:flex-row items-center md:items-end justify-center md:justify-between p-6 md:p-10 text-center md:text-left">
              <div className="mb-8 md:mb-0">
                <h2 className="font-serif text-3xl md:text-5xl text-white mb-3 max-w-md leading-tight">
                  Planifiez votre voyage<br />en toute confiance
                </h2>
                <p className="text-white/60 max-w-sm mx-auto md:mx-0 text-sm">
                  De la météo au budget, en passant par les meilleures périodes —
                  notre IA vous guide à chaque étape.
                </p>
              </div>
              {/* Stats bubble */}
              <div className="bg-[#141822]/80 backdrop-blur-md rounded-2xl p-4 md:p-6 min-w-[140px] md:min-w-[160px] text-center border-b-4 border-gold border-x border-t border-white/10">
                <p className="font-bold text-3xl md:text-4xl text-white mb-1">95%</p>
                <p className="text-white/60 text-[10px] md:text-xs">de voyageurs<br />pleinement satisfaits</p>
              </div>
            </div>
            {/* CTA button center bottom */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
              <button onClick={triggerChatbot} className="btn-gold shadow-[0_0_30px_rgba(201,168,76,0.3)]">
                <MessageCircle className="w-4 h-4" />
                Essayer le chatbot
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="py-20 px-8 bg-[#0A0D14] relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="section-label mb-2 text-gold/80">Témoignages</p>
              <h2 className="font-serif text-4xl md:text-5xl text-white">
                Ce que disent<br />nos voyageurs
              </h2>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <p className="font-bold text-5xl text-white">4.9</p>
              <div className="flex gap-0.5 my-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-gold text-gold" />)}
              </div>
              <p className="text-white/50 text-xs">856 avis vérifiés</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { name: "Sophie M.", loc: "Paris", text: "AIVANA m'a trouvé Bali en 30 secondes avec mon budget exact. Le chatbot est bluffant de précision !", stars: 5 },
              { name: "Thomas B.", loc: "Lyon", text: "J'avais des critères très précis (froid, budget serré, pas trop loin). L'IA a proposé l'Islande en hiver — parfait.", stars: 5 },
              { name: "Marie L.", loc: "Bordeaux", text: "Interface top, réponses ultra rapides. J'ai planifié mon voyage au Japon en une soirée. Je recommande !", stars: 5 },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="bg-[#141822] rounded-2xl p-6 hover:shadow-[0_0_30px_rgba(255,255,255,0.03)] transition-shadow border border-white/5"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.stars)].map((_, j) => <Star key={j} className="w-4 h-4 fill-gold text-gold" />)}
                </div>
                <p className="text-white/80 leading-relaxed text-sm mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gold/10 rounded-full flex items-center justify-center text-sm font-semibold text-gold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white">{t.name}</p>
                    <p className="text-white/50 text-xs">{t.loc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-8 bg-[#0A0D14]">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="section-label mb-3 text-gold/80">FAQ</p>
              <h2 className="font-serif text-4xl text-white leading-tight">
                Tout ce que vous devez<br />savoir avant de<br />commencer
              </h2>
              <button onClick={triggerChatbot} className="btn-gold mt-8">
                Poser une question
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-white/10 rounded-xl overflow-hidden bg-[#141822]/50">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="text-sm font-medium text-white">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-white/50 flex-shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 text-sm text-white/60 leading-relaxed">
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
      <section className="px-8 pb-10 bg-[#0A0D14]">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#141822] border border-white/10 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center gap-10">
            {/* Left */}
            <div className="flex-1">
              <span className="tag mb-4 bg-white/5 border-white/10 text-white/80">Commencer maintenant</span>
              <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight mb-3">
                Découvrez votre prochain<br />voyage idéal
              </h2>
              <p className="text-white/60 text-sm mb-8 max-w-sm">
                Planifiez votre voyage en quelques minutes et profitez
                de chaque instant de votre escapade.
              </p>
              <div className="flex items-center gap-3">
                <Link href="/explore" className="btn-gold shadow-lg shadow-gold/20">
                  Planifier mon voyage
                </Link>
                <Link href="/explore" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </Link>
              </div>
            </div>
            {/* Right – two photos */}
            <div className="flex gap-3 flex-shrink-0 relative">
              <div className="absolute inset-0 bg-gold/5 blur-3xl rounded-full" />
              <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=260&q=80" alt="" className="relative z-10 rounded-2xl h-52 w-44 object-cover border border-white/10" />
              <img src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=260&q=80" alt="" className="relative z-10 rounded-2xl h-52 w-44 object-cover mt-6 border border-white/10" />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
