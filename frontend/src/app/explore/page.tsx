"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import axios from "axios";
import { ArrowUpRight, MapPin, Plane, Hotel, Calendar, Star, Filter, ChevronDown, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Destination } from "@/types/destination";

const DESTINATIONS: Destination[] = [
  // ── TOP 5 — 1 par continent ──
  {
    id: "t1", name: "Marrakech", country: "Maroc", continent: "Afrique",
    climate: "arid", style: ["culture", "gastronomie", "aventure"],
    budgetTier: "petit", tripBudget: { min: 650, max: 900 },
    flightFrom: 80, hotelPerNight: 35,
    bestMonths: ["Mars", "Avr", "Oct", "Nov"],
    duration: "10 – 14 jours", rating: 4.7,
    description: "Cité impériale aux mille couleurs et épices. Vol depuis Paris à moins de 100€, riads abordables, souks envoûtants.",
    highlight: "Petits budgets bienvenus — riads pour 20€/nuit.",
    img: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=900&q=85",
    topDest: true, continentRank: "🌍 Afrique #1",
  },
  {
    id: "t2", name: "Lisbonne", country: "Portugal", continent: "Europe",
    climate: "temperate", style: ["culture", "gastronomie", "plage"],
    budgetTier: "moyen", tripBudget: { min: 1400, max: 1900 },
    flightFrom: 60, hotelPerNight: 90,
    bestMonths: ["Avr", "Mai", "Juin", "Sept"],
    duration: "10 – 14 jours", rating: 4.8,
    description: "Capitale des azulejos, du vin et du fado. Vols à partir de 60€, pastéis de nata inclus.",
    highlight: "Meilleur rapport qualité-vie en Europe.",
    img: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=900&q=85",
    topDest: true, continentRank: "🌍 Europe #1",
  },
  {
    id: "t3", name: "Bali", country: "Indonésie", continent: "Asie",
    climate: "tropical", style: ["plage", "nature", "culture", "bien-être"],
    budgetTier: "moyen", tripBudget: { min: 1600, max: 2400 },
    flightFrom: 400, hotelPerNight: 40,
    bestMonths: ["Avr", "Mai", "Juin", "Sept", "Oct"],
    duration: "14 – 21 jours", rating: 4.9,
    description: "Île des dieux entre rizières, temples et surf. Vols ~400€, villas avec piscine pour 40€/nuit.",
    highlight: "Villas avec piscine privée dès 40€/nuit.",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&q=85",
    topDest: true, continentRank: "🌏 Asie #1",
  },
  {
    id: "t4", name: "Medellín", country: "Colombie", continent: "Amérique",
    climate: "tropical", style: ["culture", "aventure", "nature"],
    budgetTier: "moyen", tripBudget: { min: 1700, max: 2300 },
    flightFrom: 560, hotelPerNight: 35,
    bestMonths: ["Déc", "Jan", "Fév", "Juil", "Août"],
    duration: "14 – 21 jours", rating: 4.6,
    description: "La \"Ville éternelle du printemps\" à 1500m d'altitude. Ancienne ville devenue métropole culturelle et fleurie.",
    highlight: "Printemps éternel — il fait 22°C toute l'année.",
    img: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=900&q=85",
    topDest: true, continentRank: "🌎 Amérique #1",
  },
  {
    id: "t5", name: "Queenstown", country: "Nouvelle-Zélande", continent: "Océanie",
    climate: "temperate", style: ["aventure", "nature"],
    budgetTier: "confort", tripBudget: { min: 4200, max: 5500 },
    flightFrom: 900, hotelPerNight: 120,
    bestMonths: ["Nov", "Déc", "Jan", "Fév"],
    duration: "14 – 21 jours", rating: 4.8,
    description: "Capitale mondiale de l'aventure. Bungy, saut en para, ski, fjords. La Terre du Milieu pour de vrai.",
    highlight: "Le pays du Seigneur des Anneaux pour de vrai.",
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=85",
    topDest: true, continentRank: "🌏 Océanie #1",
  },
  // ── Petit budget ──
  {
    id: "b1", name: "Budapest", country: "Hongrie", continent: "Europe",
    climate: "temperate", style: ["culture", "bien-être", "gastronomie"],
    budgetTier: "petit", tripBudget: { min: 800, max: 1200 },
    flightFrom: 50, hotelPerNight: 45,
    bestMonths: ["Avr", "Mai", "Juin", "Sept"],
    duration: "7 – 10 jours", rating: 4.6,
    description: "La \"Paris de l'Est\" fascinante. Bains thermaux, ruines bar, architecture austro-hongroise.",
    highlight: "Bière à 1€, bains thermaux à 15€.",
    img: "https://images.unsplash.com/photo-1565426873118-a17ed65d74b9?w=700&q=80",
  },
  {
    id: "b2", name: "Tbilissi", country: "Géorgie", continent: "Europe",
    climate: "temperate", style: ["culture", "gastronomie", "aventure"],
    budgetTier: "petit", tripBudget: { min: 750, max: 1100 },
    flightFrom: 120, hotelPerNight: 30,
    bestMonths: ["Avr", "Mai", "Sept", "Oct"],
    duration: "10 – 14 jours", rating: 4.5,
    description: "Ville aux mille façades sculptées, vins naturels et gorges sauvages.",
    highlight: "Le vin le moins cher et le meilleur du monde.",
    img: "https://images.unsplash.com/photo-1565008576549-57569a49a3f5?w=700&q=80",
  },
  {
    id: "b3", name: "Chiang Mai", country: "Thaïlande", continent: "Asie",
    climate: "tropical", style: ["culture", "nature", "bien-être"],
    budgetTier: "petit", tripBudget: { min: 950, max: 1400 },
    flightFrom: 350, hotelPerNight: 20,
    bestMonths: ["Nov", "Déc", "Jan", "Fév"],
    duration: "14 – 21 jours", rating: 4.7,
    description: "Rose du Nord, temples dorés, jungle, massages à 5€. Paradis des nomades digitaux.",
    highlight: "Massages traditionels à 7€, temples gratuits.",
    img: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=700&q=80",
  },
  {
    id: "b4", name: "Hanoï", country: "Vietnam", continent: "Asie",
    climate: "tropical", style: ["culture", "gastronomie", "aventure"],
    budgetTier: "petit", tripBudget: { min: 900, max: 1300 },
    flightFrom: 380, hotelPerNight: 18,
    bestMonths: ["Oct", "Nov", "Déc", "Mars", "Avr"],
    duration: "14 – 21 jours", rating: 4.5,
    description: "Vieux quartier, baie d'Halong, pho fumant à l'aube. Parmi les destinations les plus abordables.",
    highlight: "Repas complets pour 2€, hôtels propres à 15€.",
    img: "https://images.unsplash.com/photo-1552751753-0fc84ae5b6c8?w=700&q=80",
  },
  {
    id: "b5", name: "Cracovie", country: "Pologne", continent: "Europe",
    climate: "cold", style: ["culture", "histoire"],
    budgetTier: "petit", tripBudget: { min: 700, max: 1000 },
    flightFrom: 50, hotelPerNight: 40,
    bestMonths: ["Avr", "Mai", "Juin", "Sept"],
    duration: "5 – 8 jours", rating: 4.4,
    description: "Perle médiévale, place du marché monumentale, château Wawel. Escapade week-end ultra-abordable.",
    highlight: "L'une des plus belles villes médiévales d'Europe.",
    img: "https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=700&q=80",
  },
  // ── Budget moyen ──
  {
    id: "m1", name: "Athènes + Santorin", country: "Grèce", continent: "Europe",
    climate: "temperate", style: ["culture", "plage", "gastronomie"],
    budgetTier: "moyen", tripBudget: { min: 2000, max: 2800 },
    flightFrom: 120, hotelPerNight: 90,
    bestMonths: ["Mai", "Juin", "Sept", "Oct"],
    duration: "14 jours", rating: 4.8,
    description: "Acropole mythique + couchers de soleil à Oia. Combo parfait entre histoire et plages bleues.",
    highlight: "Couchers de soleil classés \"meilleurs du monde\".",
    img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=700&q=80",
  },
  {
    id: "m2", name: "Istanbul", country: "Turquie", continent: "Europe",
    climate: "temperate", style: ["culture", "gastronomie", "histoire"],
    budgetTier: "moyen", tripBudget: { min: 1300, max: 1900 },
    flightFrom: 90, hotelPerNight: 65,
    bestMonths: ["Avr", "Mai", "Sept", "Oct"],
    duration: "10 – 14 jours", rating: 4.7,
    description: "Entre deux continents, mosquées, bazars, meze et Bosphore. Incroyable densité culturelle.",
    highlight: "2 continents, 1 seule ville.",
    img: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=700&q=80",
  },
  {
    id: "m3", name: "Phuket & Ko Phi Phi", country: "Thaïlande", continent: "Asie",
    climate: "tropical", style: ["plage", "bien-être", "aventure"],
    budgetTier: "moyen", tripBudget: { min: 1700, max: 2500 },
    flightFrom: 350, hotelPerNight: 55,
    bestMonths: ["Nov", "Déc", "Jan", "Fév", "Mars"],
    duration: "14 – 21 jours", rating: 4.8,
    description: "Eaux turquoise, plages de rêve, kayak entre calcaires. La quintessence du paradis équatorial.",
    highlight: "Eaux turquoise à 28°C garantis.",
    img: "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=700&q=80",
  },
  {
    id: "m4", name: "Buenos Aires", country: "Argentine", continent: "Amérique",
    climate: "temperate", style: ["culture", "gastronomie", "fête"],
    budgetTier: "moyen", tripBudget: { min: 1900, max: 2700 },
    flightFrom: 600, hotelPerNight: 50,
    bestMonths: ["Mars", "Avr", "Oct", "Nov"],
    duration: "14 – 21 jours", rating: 4.7,
    description: "Tango, boeuf argentin, architecture néo-classique. Buenos Aires défie les clichés.",
    highlight: "Le meilleur bifteck du monde.",
    img: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=700&q=80",
  },
  {
    id: "m5", name: "Nairobi & Safari Masai Mara", country: "Kenya", continent: "Afrique",
    climate: "tropical", style: ["nature", "aventure", "faune"],
    budgetTier: "moyen", tripBudget: { min: 2500, max: 3500 },
    flightFrom: 380, hotelPerNight: 80,
    bestMonths: ["Juil", "Août", "Sept", "Jan", "Fév"],
    duration: "14 jours", rating: 4.9,
    description: "Big Five, migration des gnous, couchers de soleil sur la savane. Le safari africain accessible.",
    highlight: "La grande migration — un spectacle d'une vie.",
    img: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=700&q=80",
  },
  // ── Budget confort ──
  {
    id: "c1", name: "Kyoto & Tokyo", country: "Japon", continent: "Asie",
    climate: "temperate", style: ["culture", "gastronomie", "bien-être"],
    budgetTier: "confort", tripBudget: { min: 3200, max: 4500 },
    flightFrom: 700, hotelPerNight: 100,
    bestMonths: ["Mars", "Avr", "Oct", "Nov"],
    duration: "14 – 21 jours", rating: 5.0,
    description: "Sakura, ramen, temples zen, néons de Shibuya. Le Japon est une expérience totale qui transcende tous les voyageurs.",
    highlight: "La cerise des sakura en mars-avril, un rêve éveillé.",
    img: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=700&q=80",
  },
  {
    id: "c2", name: "Islande", country: "Islande", continent: "Europe",
    climate: "cold", style: ["nature", "aventure", "bien-être"],
    budgetTier: "confort", tripBudget: { min: 3500, max: 4800 },
    flightFrom: 120, hotelPerNight: 160,
    bestMonths: ["Déc", "Jan", "Fév", "Juil", "Août"],
    duration: "10 – 14 jours", rating: 4.9,
    description: "Aurores boréales, geysers, glaciers, cascades. Un paysage de fin du monde à 3h de Paris.",
    highlight: "Aurores boréales et bains chauds sous les étoiles.",
    img: "https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=700&q=80",
  },
  {
    id: "c3", name: "New York", country: "États-Unis", continent: "Amérique",
    climate: "temperate", style: ["culture", "gastronomie", "shopping"],
    budgetTier: "confort", tripBudget: { min: 3800, max: 5200 },
    flightFrom: 350, hotelPerNight: 180,
    bestMonths: ["Sept", "Oct", "Avr", "Mai"],
    duration: "10 – 14 jours", rating: 4.8,
    description: "Manhattan, Times Square, muséums, Central Park. Éternellement iconique.",
    highlight: "La skyline de Manhattan à l'aube depuis Brooklyn Bridge.",
    img: "https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?w=700&q=80",
  },
  {
    id: "c4", name: "Sydney & Great Barrier Reef", country: "Australie", continent: "Océanie",
    climate: "temperate", style: ["plage", "nature", "aventure"],
    budgetTier: "confort", tripBudget: { min: 4000, max: 5500 },
    flightFrom: 900, hotelPerNight: 130,
    bestMonths: ["Sept", "Oct", "Nov", "Avr"],
    duration: "21 jours", rating: 4.8,
    description: "Opera House, Bondi Beach, plongée sur la Grande Barrière. L'Australie justifie le long vol.",
    highlight: "Plonger dans la plus grande barrière de corail du monde.",
    img: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=700&q=80",
  },
  // ── Luxe ──
  {
    id: "l1", name: "Maldives", country: "Maldives", continent: "Asie",
    climate: "tropical", style: ["plage", "luxe", "bien-être"],
    budgetTier: "luxe", tripBudget: { min: 6000, max: 12000 },
    flightFrom: 700, hotelPerNight: 350,
    bestMonths: ["Nov", "Déc", "Jan", "Fév", "Mars", "Avr"],
    duration: "10 – 14 jours", rating: 5.0,
    description: "Bungalows sur pilotis, lagon turquoise, plongée avec raies mantas. La quintessence du luxe tropical.",
    highlight: "Dormir au-dessus du lagon cristallin.",
    img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=700&q=80",
  },
  {
    id: "l2", name: "Polynésie Française", country: "France", continent: "Océanie",
    climate: "tropical", style: ["plage", "luxe", "bien-être"],
    budgetTier: "luxe", tripBudget: { min: 7000, max: 14000 },
    flightFrom: 1000, hotelPerNight: 400,
    bestMonths: ["Mai", "Juin", "Juil", "Août", "Sept"],
    duration: "14 – 21 jours", rating: 5.0,
    description: "Bora Bora, Moorea — lagons d'outremer, requins baleines, fare polynésiens. Le paradis absolu.",
    highlight: "Les eaux les plus bleues de la planète.",
    img: "https://images.unsplash.com/photo-1589802829985-817e51171b92?w=700&q=80",
  },
  {
    id: "l3", name: "Dubaï", country: "Émirats Arabes", continent: "Asie",
    climate: "arid", style: ["luxe", "shopping", "gastronomie"],
    budgetTier: "luxe", tripBudget: { min: 4500, max: 8000 },
    flightFrom: 200, hotelPerNight: 250,
    bestMonths: ["Oct", "Nov", "Déc", "Jan", "Fév", "Mars"],
    duration: "7 – 10 jours", rating: 4.6,
    description: "Burj Khalifa, désert en 4x4, dîner 200 étages. L'excès dans toute sa splendeur ultra-moderne.",
    highlight: "Vue depuis le Burj Khalifa au coucher de soleil.",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=80",
  },
];

const CONTINENTS = ["Tous", "Europe", "Asie", "Afrique", "Amérique", "Océanie"];
const BUDGET_TIERS = [
  { id: "tous", label: "Tous", color: "bg-[#141822] text-white border-white/20", emoji: "" },
  { id: "petit", label: "Essentiel", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", emoji: "✦", range: "< 1 500€" },
  { id: "moyen", label: "Confort", color: "bg-sky-500/10 text-sky-400 border-sky-500/20", emoji: "✦✦", range: "1 500 — 3 500€" },
  { id: "confort", label: "Premium", color: "bg-violet-500/10 text-violet-400 border-violet-500/20", emoji: "✦✦✦", range: "3 500 — 6 000€" },
  { id: "luxe", label: "Prestige", color: "bg-gold/10 text-gold-400 border-gold/20", emoji: "✦✦✦✦", range: "6 000€+" },
];
const BUDGET_BADGE: Record<string, string> = {
  petit: "bg-[#0A0D14]/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 shadow-lg",
  moyen: "bg-[#0A0D14]/80 backdrop-blur-md text-sky-400 border border-sky-500/30 shadow-lg",
  confort: "bg-[#0A0D14]/80 backdrop-blur-md text-violet-400 border border-violet-500/30 shadow-lg",
  luxe: "bg-[#0A0D14]/80 backdrop-blur-md text-gold-400 border border-gold/30 shadow-[0_0_15px_rgba(201,168,76,0.2)]",
};
const STYLES = ["Tous", "plage", "culture", "nature", "aventure", "gastronomie", "bien-être", "luxe"];

interface LiveEstimate {
  flightFrom: number | null;
  hotelFrom: number | null;
  estimatedTotal: number | null;
}

const NIGHTS = 14;

export default function ExplorePage() {
  const [continent, setContinent] = useState("Tous");
  const [budgetTier, setBudgetTier] = useState("tous");
  const [style, setStyle] = useState("Tous");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => DESTINATIONS.filter(d => {
    if (continent !== "Tous" && d.continent !== continent) return false;
    if (budgetTier !== "tous" && d.budgetTier !== budgetTier) return false;
    if (style !== "Tous" && !d.style.includes(style)) return false;
    return true;
  }), [continent, budgetTier, style]);

  const topFive = DESTINATIONS.filter(d => d.topDest);
  const activeCount = (continent !== "Tous" ? 1 : 0) + (budgetTier !== "tous" ? 1 : 0) + (style !== "Tous" ? 1 : 0);

  const [liveEstimates, setLiveEstimates] = useState<Record<string, LiveEstimate>>({});
  const [loadingEstimates, setLoadingEstimates] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingEstimates(true);

    // Batch requests in groups of 5 to avoid overwhelming Amadeus test-tier rate limits
    const BATCH = 5;
    const processResult = (res: PromiseSettledResult<PromiseSettledResult<any>[]>, d: typeof DESTINATIONS[0]) => {
      if (res.status !== "fulfilled") return { flightFrom: null, hotelFrom: null, estimatedTotal: null };
      const [flightsRes, hotelsRes] = res.value;
      const flights = flightsRes.status === "fulfilled" ? (flightsRes.value.data as Array<{ price: number }>) : [];
      const hotels = hotelsRes.status === "fulfilled" ? (hotelsRes.value.data as Array<{ price_per_night: number }>) : [];
      // `flightFrom` = prix aller-retour TOTAL pour 2 personnes (API toujours round-trip maintenant)
      const flightFrom = flights.length ? Math.min(...flights.map(f => f.price)) : null;
      const hotelFrom = hotels.length ? Math.min(...hotels.map(h => h.price_per_night)) : null;
      const estimatedTotal = (flightFrom !== null && hotelFrom !== null) ? flightFrom + (hotelFrom * NIGHTS) : null;
      return { flightFrom, hotelFrom, estimatedTotal };
    };

    (async () => {
      const next: Record<string, LiveEstimate> = {};
      for (let i = 0; i < DESTINATIONS.length; i += BATCH) {
        if (cancelled) return;
        const batch = DESTINATIONS.slice(i, i + BATCH);
        const batchResults = await Promise.allSettled(
          batch.map(d => Promise.allSettled([
            axios.get("/api/partner/flights/search", { params: { origin: "Paris", destination: d.name, adults: 2 } }),
            axios.get("/api/partner/hotels/search", { params: { city: d.name, adults: 2 } }),
          ]))
        );
        batchResults.forEach((res, j) => {
          const d = batch[j];
          next[d.id] = processResult(res, d);
        });
        // Publish results incrementally so the UI fills in progressively
        if (!cancelled) setLiveEstimates(prev => ({ ...prev, ...next }));
      }
      if (!cancelled) setLoadingEstimates(false);
    })();

    return () => { cancelled = true; };
  }, []);

  // Seules les destinations avec une estimation réelle (vol + hôtel) sont affichées dans le carrousel
  const topFiveWithRealData = topFive.filter(d => {
    const est = liveEstimates[d.id];
    return est && est.flightFrom !== null && est.hotelFrom !== null;
  });

  const scrollCarousel = (dir: "left" | "right") => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -420 : 420, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen -mt-20" style={{ backgroundColor: 'var(--bg-primary)' }}>

      {/* ═══ HERO ════════════════════════════════════════════════════════════ */}
      <div className="relative h-[70vh] min-h-[500px]">
        <div className="absolute inset-0 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1800&q=85" alt="Destinations" className="absolute inset-0 w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-[#0A0D14]/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#0A0D14]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D14]/60 via-transparent to-transparent" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/10 blur-[120px] rounded-full pointer-events-none" />
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pt-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/15 border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-[0.25em] mb-6 backdrop-blur-md">
              <MapPin className="w-3 h-3" /> Destinations du Monde
            </div>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-5 leading-[1.05]">
              Le monde entier,<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-300 to-gold italic">à votre portée</span>
            </h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              De Marrakech à la Polynésie — des destinations pour tous les budgets, toutes les envies.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ═══ TOP 5 ═══════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-8 mb-16 relative z-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="section-label mb-2 text-gold/80">Sélection</p>
            <h2 className="font-serif text-4xl md:text-5xl" style={{ color: 'var(--text-primary)' }}>Top 5 — Un monde, 5 coups de cœur</h2>
          </div>
          <p className="hidden md:block text-sm max-w-xs text-right" style={{ color: 'var(--text-muted)' }}>
            Vol + hôtel pour 2 personnes<br />sur 2 semaines depuis Paris
          </p>
        </div>
        {loadingEstimates ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="shrink-0 w-[300px] sm:w-[360px] h-[420px] rounded-3xl animate-pulse bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-gold/40 animate-spin" />
              </div>
            ))}
          </div>
        ) : topFiveWithRealData.length === 0 ? (
          <div className="rounded-3xl p-12 text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Aucune estimation de prix réelle disponible pour le moment. Réessayez dans quelques instants.</p>
          </div>
        ) : (
          <div className="relative group/carousel">
            <div ref={carouselRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {topFiveWithRealData.map((d, i) => {
                const est = liveEstimates[d.id];
                return (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="relative shrink-0 w-[300px] sm:w-[360px] rounded-3xl overflow-hidden group hover:shadow-[0_0_30px_rgba(201,168,76,0.15)] transition-all snap-start"
                  >
                    <Link href={`/destination/${d.id}`} className="block">
                      <img src={d.img} alt={d.name} className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-semibold backdrop-blur-md text-white border border-white/10 px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(20,24,34,0.9)' }}>{d.continentRank}</span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${BUDGET_BADGE[d.budgetTier]}`}>
                          {BUDGET_TIERS.find(b => b.id === d.budgetTier)?.label}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star key={idx} className={`w-3 h-3 ${idx < Math.floor(d.rating) ? "fill-gold text-gold" : "text-white/20"}`} />
                          ))}
                          <span className="text-white/60 text-[10px] ml-1">{d.rating}</span>
                        </div>
                        <h3 className="font-serif text-2xl text-white leading-tight mb-1">{d.name}</h3>
                        <p className="text-white/60 text-xs mb-3 flex items-center gap-1"><MapPin className="w-3 h-3" />{d.country}</p>
                        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 mb-3 border border-white/5">
                          <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                            Estimation réelle — 2 pers / 2 sem
                          </p>
                          <p className="text-white font-bold text-lg">{est?.estimatedTotal?.toLocaleString()}€ <span className="text-white/50 text-sm font-normal">estimé</span></p>
                          <div className="flex gap-3 mt-1.5">
                            <span className="text-white/60 text-[10px] flex items-center gap-1"><Plane className="w-2.5 h-2.5 text-gold/80" /> Vol A/R dès {est?.flightFrom != null ? Math.round(est.flightFrom / 2) : '—'}€/pers</span>
                            <span className="text-white/60 text-[10px] flex items-center gap-1"><Hotel className="w-2.5 h-2.5 text-gold/80" /> Hôtel dès {est?.hotelFrom}€/nuit</span>
                          </div>
                        </div>
                        <p className="text-gold-200/80 text-xs italic leading-snug">&ldquo;{d.highlight}&rdquo;</p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            {/* Carousel controls */}
            <button type="button" onClick={() => scrollCarousel("left")}
              className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center bg-[#0A0D14]/90 border border-white/10 text-white/60 hover:text-gold hover:border-gold/40 backdrop-blur-md shadow-xl transition-all opacity-0 group-hover/carousel:opacity-100 z-10">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => scrollCarousel("right")}
              className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center bg-[#0A0D14]/90 border border-white/10 text-white/60 hover:text-gold hover:border-gold/40 backdrop-blur-md shadow-xl transition-all opacity-0 group-hover/carousel:opacity-100 z-10">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ═══ FILTRES ═════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 mb-10 sticky top-[72px] z-40">
        <div className="backdrop-blur-xl rounded-2xl p-4 shadow-xl" style={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-medium uppercase tracking-widest mr-2" style={{ color: 'var(--text-muted)' }}>Budget</span>
            {BUDGET_TIERS.map(b => (
              <button key={b.id} onClick={() => setBudgetTier(b.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${budgetTier === b.id ? b.color + " border-transparent scale-105" : ""}`}
                style={budgetTier !== b.id ? { backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' } : undefined}>
                {b.emoji} {b.label} {"range" in b && <span className="opacity-70">({b.range})</span>}
              </button>
            ))}
            <button onClick={() => setShowFilters(!showFilters)}
              className={`ml-auto flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 border transition-all ${showFilters ? "bg-gold border-gold" : ""}`}
              style={showFilters ? { color: 'var(--text-inverse)' } : { backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
              <Filter className="w-3 h-3" /> Filtres {activeCount > 0 && <span className="text-gold rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow-[0_0_10px_rgba(201,168,76,0.5)] border border-gold/30" style={{ backgroundColor: 'var(--bg-elevated)' }}>{activeCount}</span>}
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>
          {showFilters && (
            <div className="flex flex-wrap gap-4 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
              <div>
                <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Continent</p>
                <div className="flex flex-wrap gap-1.5">
                  {CONTINENTS.map(c => (
                    <button key={c} onClick={() => setContinent(c)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${continent === c ? "bg-gold border-gold" : "hover:text-gold"}`}
                      style={continent === c ? { color: 'var(--text-inverse)' } : { backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Style de voyage</p>
                <div className="flex flex-wrap gap-1.5">
                  {STYLES.map(s => (
                    <button key={s} onClick={() => setStyle(s)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize ${style === s ? "bg-gold border-gold" : "hover:text-gold"}`}
                      style={style === s ? { color: 'var(--text-inverse)' } : { backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>{s}</button>
                  ))}
                </div>
              </div>
              {activeCount > 0 && (
                <button onClick={() => { setContinent("Tous"); setBudgetTier("tous"); setStyle("Tous"); }} className="self-end text-xs text-white/50 hover:text-white underline pb-1">Réinitialiser</button>
              )}
            </div>
          )}
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>{filtered.length} destination{filtered.length > 1 ? "s" : ""} trouvée{filtered.length > 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* ═══ GRILLE ══════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-8 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-24" style={{ color: 'var(--text-secondary)' }}>
            <p className="text-4xl mb-4">🌍</p>
            <p className="font-serif text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>Aucune destination pour ces critères</p>
            <p className="text-sm mb-6">Essayez en élargissant vos filtres ou demandez à l&apos;IA !</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setContinent("Tous"); setBudgetTier("tous"); setStyle("Tous"); }} className="btn-gold text-sm">Tout afficher</button>
              <button onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))} className="btn-gold text-sm shadow-[0_0_20px_rgba(201,168,76,0.3)]">Demander à l&apos;IA</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link href={`/destination/${d.id}`} className="rounded-3xl overflow-hidden group block transition-all hover:shadow-[0_0_30px_var(--shadow-gold)]" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
                  <div className="relative h-48 overflow-hidden">
                    <img src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${BUDGET_BADGE[d.budgetTier]}`}>
                      {BUDGET_TIERS.find(b => b.id === d.budgetTier)?.emoji} {BUDGET_TIERS.find(b => b.id === d.budgetTier)?.label}
                    </span>
                    <span className="absolute top-3 right-3 text-[10px] backdrop-blur-md text-white border border-white/10 font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(20,24,34,0.9)' }}>{d.continent}</span>
                    <div className="absolute bottom-3 left-3 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-gold text-gold" />
                      <span className="text-white text-xs font-semibold">{d.rating}</span>
                    </div>
                    {d.topDest && <span className="absolute bottom-3 right-3 text-[10px] bg-gold font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(201,168,76,0.5)]" style={{ color: 'var(--text-inverse)' }}>⭐ Top 5</span>}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-serif text-xl leading-tight" style={{ color: 'var(--text-primary)' }}>{d.name}</h3>
                        <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-secondary)' }}><MapPin className="w-3 h-3 text-gold/80" />{d.country}</p>
                      </div>
                      <span className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-gold group-hover:border-gold transition-all flex-shrink-0" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{d.description}</p>
                    <div className="rounded-xl p-3 mb-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                      {(() => {
                        const est = liveEstimates[d.id];
                        if (loadingEstimates || !est) {
                          return (
                            <div className="animate-pulse space-y-2">
                              <div className="h-2 w-32 rounded bg-white/10" />
                              <div className="h-4 w-24 rounded bg-white/10" />
                              <div className="h-2 w-40 rounded bg-white/5" />
                            </div>
                          );
                        }
                        if (est.estimatedTotal === null) {
                          return <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Estimation indisponible pour le moment</p>;
                        }
                        return (
                          <>
                            <p className="text-[10px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                              Estimation réelle — 2 pers / 2 semaines
                            </p>
                            <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{est.estimatedTotal.toLocaleString()}€ <span className="font-normal text-sm" style={{ color: 'var(--text-muted)' }}>estimé</span></p>
                            <div className="flex gap-4 mt-1.5">
                              <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}><Plane className="w-3 h-3 text-gold" /> dès {Math.round(est.flightFrom! / 2)}€ <span style={{ color: 'var(--text-muted)' }}>A/R/pers</span></span>
                              <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}><Hotel className="w-3 h-3 text-gold" /> dès {est.hotelFrom}€ <span style={{ color: 'var(--text-muted)' }}>/nuit</span></span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                      <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{d.bestMonths.join(" · ")}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {d.style.slice(0, 3).map(s => <span key={s} className="tag capitalize text-[10px]">{s}</span>)}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ IA CTA ══════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-8 pb-16">
        <div className="relative rounded-3xl p-10 md:p-14 overflow-hidden shadow-[0_40px_80px_var(--shadow-color)]" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3 blur-xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <p className="section-label mb-3 text-gold/80">IA Voyage</p>
              <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-4" style={{ color: 'var(--text-primary)' }}>
                Pas trouvé votre<br /><span className="text-gold-200 italic">destination idéale ?</span>
              </h2>
              <p className="text-sm mb-8 max-w-md leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Décrivez vos envies, votre budget, vos dates — notre IA trouve la destination parfaite,
                <strong style={{ color: 'var(--text-primary)' }}> pour n&apos;importe quel budget</strong>.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))} className="btn-gold shadow-[0_0_20px_rgba(201,168,76,0.2)]">Demander à l&apos;IA ✈</button>
                <button onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0 max-w-xs">
              {[
                "\"Soleil en juillet, 800€ pour 2\"",
                "\"Aurores boréales, budget illimité\"",
                "\"Famille avec ados, nature, 3 000€\"",
                "\"Plage tropicale, moins de 1 200€\"",
              ].map(p => (
                <div key={p} className="rounded-xl px-4 py-2.5 text-xs italic" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>{p}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
