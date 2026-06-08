"use client";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
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
  { q: "Comment fonctionne l'IA ?", a: "AIVANA utilise LLaMA 3.3 via l'API Groq pour analyser vos préférences (budget, période, envies) et générer un itinéraire personnalisé en moins de 5 secondes." },
  { q: "Mon email est-il en sécurité avec Smart Sync ?", a: "Oui. Smart Sync utilise le protocole OAuth 2.0 avec un accès en lecture seule. AIVANA ne stocke jamais le contenu de vos emails, seulement les informations extraites (dates, vols, hôtels)." },
  { q: "Est-ce que je réserve directement sur AIVANA ?", a: "Non. AIVANA est un outil de planification et d'organisation. Vous réservez sur vos sites partenaires habituels (Booking, Skyscanner…). AIVANA centralise tout ensuite." },
  { q: "Quelle est la différence entre le plan Gratuit et Pro ?", a: "Le plan Gratuit donne accès à 5 requêtes IA par mois et au dashboard de base. Le plan Pro (9,99€/mois) offre l'IA illimitée, Smart Sync Gmail/Outlook et l'export PDF de vos itinéraires." },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(-1);
  const [transitioning, setTransitioning] = useState(false);

  // Opens AIVANA's chatbot — grounded in real flight/hotel/activity data (see /api/chat).
  const openChatbot = () => {
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
    <div style={{ backgroundColor: 'var(--bg-primary)' }}>

      {/* ── HERO SLIDESHOW ──────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden -mt-20">
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
          <div className="max-w-4xl mx-auto px-8 pb-16 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-8 h-px bg-white/40" />
                  <span className="text-white/70 text-[11px] tracking-widest uppercase">AIVANA</span>
                  <span className="text-gold text-[11px] tracking-wide uppercase border border-gold/40 px-2 py-0.5 rounded-full">
                    Assistant IA
                  </span>
                  <div className="w-8 h-px bg-white/40" />
                </div>
                <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white leading-[1.1] drop-shadow-lg">
                  L&apos;aventure sur mesure,<br /><span className="italic text-gold-200">sans l&apos;effort.</span>
                </h1>
                <p className="text-white/70 text-base md:text-lg mt-6 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Décrivez votre voyage idéal, l&apos;IA génère un itinéraire complet en quelques secondes — destinations, hôtels et activités avec de vrais prix, le tout centralisé dans votre dashboard.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button onClick={openChatbot} className="btn-gold shadow-[0_0_30px_rgba(201,168,76,0.3)] px-8 py-4 text-base flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" /> Discuter avec AIVANA
                  </button>
                  <Link href="/explore" className="inline-flex items-center justify-center gap-2 border border-white/25 backdrop-blur-md text-white text-sm font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all">
                    Explorer les destinations <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Trust strip */}
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-14 text-white/50 text-[11px] uppercase tracking-widest">
                  <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold" /> Itinéraire généré en quelques secondes</span>
                  <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold" /> Vols, hôtels & activités à prix réels</span>
                  <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold" /> Dashboard centralisé</span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controls — arrows + dots */}
            <div className="flex items-center justify-center gap-4 mt-16">
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
      <section id="how-it-works" className="py-24 px-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-6xl mx-auto text-center mb-16">
          <p className="section-label mb-4 text-gold/80">Fonctionnement</p>
          <h2 className="font-serif text-4xl md:text-5xl" style={{ color: 'var(--text-primary)' }}>Votre voyage se planifie seul</h2>
          <p className="mt-4 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            AIVANA se connecte à vos confirmations de réservation pour créer automatiquement votre itinéraire centralisé.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Décrivez votre voyage", desc: "Budget, période, envies — répondez à 4 questions. L'IA génère votre itinéraire personnalisé en 5 secondes." },
            { step: "02", title: "Smart Sync", desc: "Connectez Gmail ou Outlook (lecture seule, OAuth 2.0). L'IA extrait vos confirmations de vol et d'hôtel automatiquement." },
            { step: "03", title: "Dashboard centralisé", desc: "Vols, hôtels, activités et budget réunis en un seul endroit. Export iCal, alertes intelligentes." },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="p-10 rounded-3xl transition-all group lg:min-h-[300px] hover:border-gold/30"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}
            >
              <span className="text-5xl font-serif text-gold/30 group-hover:text-gold transition-colors">{s.step}</span>
              <h3 className="text-xl font-bold mt-4 mb-3" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ────────────────────────────────────────────── */}
      <section className="py-24 px-8 overflow-hidden relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-label mb-4 text-gold/80">L&apos;Expérience AIVANA</p>
              <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6" style={{ color: 'var(--text-primary)' }}>
                Le Dashboard qui prend<br />soin de votre voyage
              </h2>
              <div className="space-y-6">
                {[
                  { t: "Centralisation Totale", d: "Plus besoin de chercher vos PDFs. Tout est au même endroit, trié par voyage." },
                  { t: "Synchronisation Temps Réel", d: "Dès que vous recevez une confirmation, elle apparaît dans votre Dashboard." },
                  { t: "Zéro Effort", d: "L'IA extrait les dates, lieux et numéros de dossier pour vous." },
                ].map((f, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-gold" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{f.t}</h4>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/auth/register" className="btn-gold mt-10">Créer mon espace gratuit</Link>
            </div>

            {/* Visual Mockup */}
            <div className="relative">
              <div className="rounded-3xl shadow-[0_40px_80px_var(--shadow-color)] p-8 transform lg:rotate-2 lg:scale-105" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
                <div className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">🏝️</div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Voyage à Bali</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>12 Mai — 24 Mai 2024</p>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full border-2" style={{ borderColor: 'var(--bg-elevated)', backgroundColor: 'var(--border-color)' }} />
                    <div className="w-6 h-6 rounded-full border-2 bg-gold" style={{ borderColor: 'var(--bg-elevated)' }} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl flex items-center justify-between" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)' }}>✈️</div>
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Vol AF256</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Départ 10:45 Paris CDG</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Confirmé</span>
                  </div>
                  <div className="p-4 rounded-2xl flex items-center justify-between" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)' }}>🏨</div>
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Alila Villas Uluwatu</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Check-in 14:00</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Confirmé</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-gold/20 border border-gold/30 flex items-center justify-between shadow-[0_0_20px_rgba(201,168,76,0.1)]">
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
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-3xl" style={{ backgroundColor: 'var(--border-color)', opacity: 0.3 }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE STRIP ─────────────────────────────────────────────────── */}
      <div className="py-4 overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="marquee-inner">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="flex items-center gap-10 px-10 whitespace-nowrap">
              {["Bali", "Islande", "Japon", "Maroc", "Thaïlande", "Pérou", "Norvège", "Mexique", "Vietnam", "Portugal"].map((c) => (
                <span key={c} className="text-sm tracking-wider uppercase flex items-center gap-4" style={{ color: 'var(--text-muted)' }}>
                  {c}
                  <span className="text-gold text-lg">❖</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── ABOUT / BRAND BLOCK ───────────────────────────────────────────── */}
      <section className="py-24 px-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-label mb-4 text-gold/80">Notre approche</p>
              <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6" style={{ color: 'var(--text-primary)' }}>
                Avec l&apos;amour du voyage<br />et de l&apos;exploration
              </h2>
              <p className="leading-relaxed mb-8 max-w-md" style={{ color: 'var(--text-secondary)' }}>
                Nous créons des itinéraires qui inspirent, connectent et restent
                gravés dans les mémoires. Chaque recommandation est pensée pour
                correspondre exactement à votre profil de voyageur.
              </p>
              <button onClick={openChatbot} className="btn-gold">
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
      <section className="py-24 px-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-6xl mx-auto">
          <p className="section-label mb-10 text-center text-gold/80">Notre IA</p>
          {/* Banner */}
          <div className="relative rounded-3xl overflow-hidden h-[420px] mb-6 shadow-2xl" style={{ border: '1px solid var(--border-color)' }}>
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
              <div className="backdrop-blur-md rounded-2xl p-4 md:p-6 min-w-[140px] md:min-w-[160px] text-center border-b-4 border-gold" style={{ backgroundColor: 'var(--glass-bg)', borderLeft: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)', borderTop: '1px solid var(--glass-border)' }}>
                <p className="font-bold text-3xl md:text-4xl mb-1" style={{ color: 'var(--text-primary)' }}>95%</p>
                <p className="text-[10px] md:text-xs" style={{ color: 'var(--text-secondary)' }}>de voyageurs<br />pleinement satisfaits</p>
              </div>
            </div>
            {/* CTA button center bottom */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
              <button onClick={openChatbot} className="btn-gold shadow-[0_0_30px_rgba(201,168,76,0.3)]">
                <Sparkles className="w-4 h-4" />
                Démarrer la planification
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="section-label mb-3 text-gold/80">FAQ</p>
              <h2 className="font-serif text-4xl leading-tight" style={{ color: 'var(--text-primary)' }}>
                Tout ce que vous devez<br />savoir avant de<br />commencer
              </h2>
              <button onClick={openChatbot} className="btn-gold mt-8">
                Poser une question
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gold/5 transition-colors"
                  >
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}
                      style={{ color: 'var(--text-muted)' }}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-8" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-label mb-4 text-gold/80">Fonctionnalités</p>
            <h2 className="font-serif text-4xl md:text-5xl" style={{ color: 'var(--text-primary)' }}>
              Tout ce dont vous avez besoin<br />pour voyager sans stress
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "⚡",
                tag: "Chatbot IA",
                title: "Itinéraire en 5 secondes",
                desc: "Décrivez votre voyage idéal, l'IA génère un plan complet — destinations, hôtels, budget — en moins de 5 secondes.",
                detail: "Propulsé par LLaMA 3.3 via Groq",
              },
              {
                icon: "🔒",
                tag: "Smart Sync",
                title: "Sync Gmail & Outlook",
                desc: "Connectez votre messagerie en toute sécurité. AIVANA extrait vos confirmations de vol, hôtel et activité sans stocker vos emails.",
                detail: "Accès lecture seule — OAuth 2.0",
              },
              {
                icon: "📊",
                tag: "Dashboard Intelligent",
                title: "Tout centralisé, rien d'oublié",
                desc: "Vols, hôtels, budget, activités : votre voyage entier dans un seul tableau de bord. Alertes et export iCal inclus.",
                detail: "Synchronisation en temps réel",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="rounded-3xl p-8 flex flex-col gap-6"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
              >
                <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-2xl flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gold/70 mb-2">{f.tag}</p>
                  <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
                </div>
                <div className="mt-auto pt-5 flex items-center gap-2" style={{ borderTop: '1px solid var(--border-light)' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <p className="text-[11px] font-medium text-emerald-400">{f.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-label mb-4 text-gold/80">Tarifs</p>
            <h2 className="font-serif text-4xl md:text-5xl" style={{ color: 'var(--text-primary)' }}>
              Commencez gratuitement.<br />Passez Pro quand vous êtes prêt.
            </h2>
            <p className="mt-4 text-sm max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Aucune carte bancaire requise pour démarrer. Sans engagement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl p-8 flex flex-col"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: 'var(--text-muted)' }}>Découverte</p>
              <div className="mb-2 flex items-end gap-2">
                <span className="text-5xl font-serif" style={{ color: 'var(--text-primary)' }}>0€</span>
                <span className="text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>/mois</span>
              </div>
              <p className="text-xs mb-8" style={{ color: 'var(--text-muted)' }}>Pour découvrir AIVANA</p>
              <ul className="space-y-4 mb-10 flex-1">
                {[
                  "5 requêtes IA par mois",
                  "Recommandations de destinations",
                  "Dashboard personnel",
                  "Itinéraire basique",
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <div className="w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className="block w-full text-center py-3.5 rounded-xl text-sm font-medium transition-colors hover:bg-white/5"
                style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              >
                Commencer gratuitement
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-3xl p-8 flex flex-col relative overflow-hidden"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 blur-[60px] rounded-full pointer-events-none" />
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-gold">Pro</p>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-gold text-zinc-950 px-3 py-1 rounded-full">Recommandé</span>
              </div>
              <div className="mb-2 flex items-end gap-2">
                <span className="text-5xl font-serif" style={{ color: 'var(--text-primary)' }}>9,99€</span>
                <span className="text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>/mois</span>
              </div>
              <p className="text-xs mb-8" style={{ color: 'var(--text-muted)' }}>Pour les voyageurs réguliers</p>
              <ul className="space-y-4 mb-10 flex-1">
                {[
                  "IA illimitée — réponses en 5 secondes",
                  "Smart Sync Gmail & Outlook",
                  "Accès lecture seule — OAuth 2.0",
                  "Export PDF de l'itinéraire complet",
                  "Alertes de prix intelligentes",
                  "Support prioritaire",
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <div className="w-4 h-4 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register" className="btn-gold block w-full text-center py-3.5 relative z-10">
                Passer à Pro
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section className="px-8 pb-10" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center gap-10" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            {/* Left */}
            <div className="flex-1">
              <span className="tag mb-4">Commencer maintenant</span>
              <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-3" style={{ color: 'var(--text-primary)' }}>
                L&apos;aventure sur mesure,<br />sans l&apos;effort.
              </h2>
              <p className="text-sm mb-8 max-w-sm" style={{ color: 'var(--text-secondary)' }}>
                Rejoignez AIVANA gratuitement. Itinéraire IA en 5 secondes,
                dashboard centralisé, zéro saisie manuelle.
              </p>
              <div className="flex items-center gap-3">
                <Link href="/explore" className="btn-gold shadow-lg shadow-gold/20">
                  Planifier mon voyage
                </Link>
                <Link href="/explore" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gold/10 transition-colors" style={{ border: '1px solid var(--border-color)' }}>
                  <ArrowUpRight className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
                </Link>
              </div>
            </div>
            {/* Right – two photos */}
            <div className="flex gap-3 flex-shrink-0 relative">
              <div className="absolute inset-0 bg-gold/5 blur-3xl rounded-full" />
              <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=260&q=80" alt="" className="relative z-10 rounded-2xl h-52 w-44 object-cover" style={{ border: '1px solid var(--border-color)' }} />
              <img src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=260&q=80" alt="" className="relative z-10 rounded-2xl h-52 w-44 object-cover mt-6" style={{ border: '1px solid var(--border-color)' }} />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
