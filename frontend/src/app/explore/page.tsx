"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin, Plane, Hotel, Calendar, Star, Filter, ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Destination {
  id: string;
  name: string;
  country: string;
  continent: string;
  climate: string;
  style: string[];
  budgetTier: "petit" | "moyen" | "confort" | "luxe";
  tripBudget: { min: number; max: number };
  flightFrom: number;
  hotelPerNight: number;
  bestMonths: string[];
  duration: string;
  description: string;
  highlight: string;
  img: string;
  topDest?: boolean;
  continentRank?: string;
  rating: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const DESTINATIONS: Destination[] = [
  // ── TOP 5 — 1 par continent ──
  {
    id:"t1", name:"Marrakech", country:"Maroc", continent:"Afrique",
    climate:"arid", style:["culture","gastronomie","aventure"],
    budgetTier:"petit", tripBudget:{ min:650, max:900 },
    flightFrom:80, hotelPerNight:35,
    bestMonths:["Mars","Avr","Oct","Nov"],
    duration:"10 – 14 jours", rating:4.7,
    description:"Cité impériale aux mille couleurs et épices. Vol depuis Paris à moins de 100€, riads abordables, souks envoûtants.",
    highlight:"Petits budgets bienvenus — riads pour 20€/nuit.",
    img:"https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=900&q=85",
    topDest:true, continentRank:"🌍 Afrique #1",
  },
  {
    id:"t2", name:"Lisbonne", country:"Portugal", continent:"Europe",
    climate:"temperate", style:["culture","gastronomie","plage"],
    budgetTier:"moyen", tripBudget:{ min:1400, max:1900 },
    flightFrom:60, hotelPerNight:90,
    bestMonths:["Avr","Mai","Juin","Sept"],
    duration:"10 – 14 jours", rating:4.8,
    description:"Capitale des azulejos, du vin et du fado. Vols à partir de 60€, pastéis de nata inclus.",
    highlight:"Meilleur rapport qualité-vie en Europe.",
    img:"https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=900&q=85",
    topDest:true, continentRank:"🌍 Europe #1",
  },
  {
    id:"t3", name:"Bali", country:"Indonésie", continent:"Asie",
    climate:"tropical", style:["plage","nature","culture","bien-être"],
    budgetTier:"moyen", tripBudget:{ min:1600, max:2400 },
    flightFrom:400, hotelPerNight:40,
    bestMonths:["Avr","Mai","Juin","Sept","Oct"],
    duration:"14 – 21 jours", rating:4.9,
    description:"Île des dieux entre rizières, temples et surf. Vols ~400€, villas avec piscine pour 40€/nuit.",
    highlight:"Villas avec piscine privée dès 40€/nuit.",
    img:"https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&q=85",
    topDest:true, continentRank:"🌏 Asie #1",
  },
  {
    id:"t4", name:"Medellín", country:"Colombie", continent:"Amérique",
    climate:"tropical", style:["culture","aventure","nature"],
    budgetTier:"moyen", tripBudget:{ min:1700, max:2300 },
    flightFrom:560, hotelPerNight:35,
    bestMonths:["Déc","Jan","Fév","Juil","Août"],
    duration:"14 – 21 jours", rating:4.6,
    description:"La \"Ville éternelle du printemps\" à 1500m d'altitude. Ancienne ville devenue métropole culturelle et fleurie.",
    highlight:"Printemps éternel — il fait 22°C toute l'année.",
    img:"https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=900&q=85",
    topDest:true, continentRank:"🌎 Amérique #1",
  },
  {
    id:"t5", name:"Queenstown", country:"Nouvelle-Zélande", continent:"Océanie",
    climate:"temperate", style:["aventure","nature"],
    budgetTier:"confort", tripBudget:{ min:4200, max:5500 },
    flightFrom:900, hotelPerNight:120,
    bestMonths:["Nov","Déc","Jan","Fév"],
    duration:"14 – 21 jours", rating:4.8,
    description:"Capitale mondiale de l'aventure. Bungy, saut en para, ski, fjords. La Terre du Milieu pour de vrai.",
    highlight:"Le pays du Seigneur des Anneaux pour de vrai.",
    img:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=85",
    topDest:true, continentRank:"🌏 Océanie #1",
  },
  // ── Petit budget ──
  {
    id:"b1", name:"Budapest", country:"Hongrie", continent:"Europe",
    climate:"temperate", style:["culture","bien-être","gastronomie"],
    budgetTier:"petit", tripBudget:{ min:800, max:1200 },
    flightFrom:50, hotelPerNight:45,
    bestMonths:["Avr","Mai","Juin","Sept"],
    duration:"7 – 10 jours", rating:4.6,
    description:"La \"Paris de l'Est\" fascinante. Bains thermaux, ruines bar, architecture austro-hongroise.",
    highlight:"Bière à 1€, bains thermaux à 15€.",
    img:"https://images.unsplash.com/photo-1565426873118-a17ed65d74b9?w=700&q=80",
  },
  {
    id:"b2", name:"Tbilissi", country:"Géorgie", continent:"Europe",
    climate:"temperate", style:["culture","gastronomie","aventure"],
    budgetTier:"petit", tripBudget:{ min:750, max:1100 },
    flightFrom:120, hotelPerNight:30,
    bestMonths:["Avr","Mai","Sept","Oct"],
    duration:"10 – 14 jours", rating:4.5,
    description:"Ville aux mille façades sculptées, vins naturels et gorges sauvages.",
    highlight:"Le vin le moins cher et le meilleur du monde.",
    img:"https://images.unsplash.com/photo-1565008576549-57569a49a3f5?w=700&q=80",
  },
  {
    id:"b3", name:"Chiang Mai", country:"Thaïlande", continent:"Asie",
    climate:"tropical", style:["culture","nature","bien-être"],
    budgetTier:"petit", tripBudget:{ min:950, max:1400 },
    flightFrom:350, hotelPerNight:20,
    bestMonths:["Nov","Déc","Jan","Fév"],
    duration:"14 – 21 jours", rating:4.7,
    description:"Rose du Nord, temples dorés, jungle, massages à 5€. Paradis des nomades digitaux.",
    highlight:"Massages traditionels à 7€, temples gratuits.",
    img:"https://images.unsplash.com/photo-1528181304800-259b08848526?w=700&q=80",
  },
  {
    id:"b4", name:"Hanoï", country:"Vietnam", continent:"Asie",
    climate:"tropical", style:["culture","gastronomie","aventure"],
    budgetTier:"petit", tripBudget:{ min:900, max:1300 },
    flightFrom:380, hotelPerNight:18,
    bestMonths:["Oct","Nov","Déc","Mars","Avr"],
    duration:"14 – 21 jours", rating:4.5,
    description:"Vieux quartier, baie d'Halong, pho fumant à l'aube. Parmi les destinations les plus abordables.",
    highlight:"Repas complets pour 2€, hôtels propres à 15€.",
    img:"https://images.unsplash.com/photo-1552751753-0fc84ae5b6c8?w=700&q=80",
  },
  {
    id:"b5", name:"Cracovie", country:"Pologne", continent:"Europe",
    climate:"cold", style:["culture","histoire"],
    budgetTier:"petit", tripBudget:{ min:700, max:1000 },
    flightFrom:50, hotelPerNight:40,
    bestMonths:["Avr","Mai","Juin","Sept"],
    duration:"5 – 8 jours", rating:4.4,
    description:"Perle médiévale, place du marché monumentale, château Wawel. Escapade week-end ultra-abordable.",
    highlight:"L'une des plus belles villes médiévales d'Europe.",
    img:"https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=700&q=80",
  },
  // ── Budget moyen ──
  {
    id:"m1", name:"Athènes + Santorin", country:"Grèce", continent:"Europe",
    climate:"temperate", style:["culture","plage","gastronomie"],
    budgetTier:"moyen", tripBudget:{ min:2000, max:2800 },
    flightFrom:120, hotelPerNight:90,
    bestMonths:["Mai","Juin","Sept","Oct"],
    duration:"14 jours", rating:4.8,
    description:"Acropole mythique + couchers de soleil à Oia. Combo parfait entre histoire et plages bleues.",
    highlight:"Couchers de soleil classés \"meilleurs du monde\".",
    img:"https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=700&q=80",
  },
  {
    id:"m2", name:"Istanbul", country:"Turquie", continent:"Europe",
    climate:"temperate", style:["culture","gastronomie","histoire"],
    budgetTier:"moyen", tripBudget:{ min:1300, max:1900 },
    flightFrom:90, hotelPerNight:65,
    bestMonths:["Avr","Mai","Sept","Oct"],
    duration:"10 – 14 jours", rating:4.7,
    description:"Entre deux continents, mosquées, bazars, meze et Bosphore. Incroyable densité culturelle.",
    highlight:"2 continents, 1 seule ville.",
    img:"https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=700&q=80",
  },
  {
    id:"m3", name:"Phuket & Ko Phi Phi", country:"Thaïlande", continent:"Asie",
    climate:"tropical", style:["plage","bien-être","aventure"],
    budgetTier:"moyen", tripBudget:{ min:1700, max:2500 },
    flightFrom:350, hotelPerNight:55,
    bestMonths:["Nov","Déc","Jan","Fév","Mars"],
    duration:"14 – 21 jours", rating:4.8,
    description:"Eaux turquoise, plages de rêve, kayak entre calcaires. La quintessence du paradis équatorial.",
    highlight:"Eaux turquoise à 28°C garantis.",
    img:"https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=700&q=80",
  },
  {
    id:"m4", name:"Buenos Aires", country:"Argentine", continent:"Amérique",
    climate:"temperate", style:["culture","gastronomie","fête"],
    budgetTier:"moyen", tripBudget:{ min:1900, max:2700 },
    flightFrom:600, hotelPerNight:50,
    bestMonths:["Mars","Avr","Oct","Nov"],
    duration:"14 – 21 jours", rating:4.7,
    description:"Tango, boeuf argentin, architecture néo-classique. Buenos Aires défie les clichés.",
    highlight:"Le meilleur bifteck du monde.",
    img:"https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=700&q=80",
  },
  {
    id:"m5", name:"Nairobi & Safari Masai Mara", country:"Kenya", continent:"Afrique",
    climate:"tropical", style:["nature","aventure","faune"],
    budgetTier:"moyen", tripBudget:{ min:2500, max:3500 },
    flightFrom:380, hotelPerNight:80,
    bestMonths:["Juil","Août","Sept","Jan","Fév"],
    duration:"14 jours", rating:4.9,
    description:"Big Five, migration des gnous, couchers de soleil sur la savane. Le safari africain accessible.",
    highlight:"La grande migration — un spectacle d'une vie.",
    img:"https://images.unsplash.com/photo-1516426122078-c23e76319801?w=700&q=80",
  },
  // ── Budget confort ──
  {
    id:"c1", name:"Kyoto & Tokyo", country:"Japon", continent:"Asie",
    climate:"temperate", style:["culture","gastronomie","bien-être"],
    budgetTier:"confort", tripBudget:{ min:3200, max:4500 },
    flightFrom:700, hotelPerNight:100,
    bestMonths:["Mars","Avr","Oct","Nov"],
    duration:"14 – 21 jours", rating:5.0,
    description:"Sakura, ramen, temples zen, néons de Shibuya. Le Japon est une expérience totale qui transcende tous les voyageurs.",
    highlight:"La cerise des sakura en mars-avril, un rêve éveillé.",
    img:"https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=700&q=80",
  },
  {
    id:"c2", name:"Islande", country:"Islande", continent:"Europe",
    climate:"cold", style:["nature","aventure","bien-être"],
    budgetTier:"confort", tripBudget:{ min:3500, max:4800 },
    flightFrom:120, hotelPerNight:160,
    bestMonths:["Déc","Jan","Fév","Juil","Août"],
    duration:"10 – 14 jours", rating:4.9,
    description:"Aurores boréales, geysers, glaciers, cascades. Un paysage de fin du monde à 3h de Paris.",
    highlight:"Aurores boréales et bains chauds sous les étoiles.",
    img:"https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=700&q=80",
  },
  {
    id:"c3", name:"New York", country:"États-Unis", continent:"Amérique",
    climate:"temperate", style:["culture","gastronomie","shopping"],
    budgetTier:"confort", tripBudget:{ min:3800, max:5200 },
    flightFrom:350, hotelPerNight:180,
    bestMonths:["Sept","Oct","Avr","Mai"],
    duration:"10 – 14 jours", rating:4.8,
    description:"Manhattan, Times Square, muséums, Central Park. Éternellement iconique.",
    highlight:"La skyline de Manhattan à l'aube depuis Brooklyn Bridge.",
    img:"https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?w=700&q=80",
  },
  {
    id:"c4", name:"Sydney & Great Barrier Reef", country:"Australie", continent:"Océanie",
    climate:"temperate", style:["plage","nature","aventure"],
    budgetTier:"confort", tripBudget:{ min:4000, max:5500 },
    flightFrom:900, hotelPerNight:130,
    bestMonths:["Sept","Oct","Nov","Avr"],
    duration:"21 jours", rating:4.8,
    description:"Opera House, Bondi Beach, plongée sur la Grande Barrière. L'Australie justifie le long vol.",
    highlight:"Plonger dans la plus grande barrière de corail du monde.",
    img:"https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=700&q=80",
  },
  // ── Luxe ──
  {
    id:"l1", name:"Maldives", country:"Maldives", continent:"Asie",
    climate:"tropical", style:["plage","luxe","bien-être"],
    budgetTier:"luxe", tripBudget:{ min:6000, max:12000 },
    flightFrom:700, hotelPerNight:350,
    bestMonths:["Nov","Déc","Jan","Fév","Mars","Avr"],
    duration:"10 – 14 jours", rating:5.0,
    description:"Bungalows sur pilotis, lagon turquoise, plongée avec raies mantas. La quintessence du luxe tropical.",
    highlight:"Dormir au-dessus du lagon cristallin.",
    img:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=700&q=80",
  },
  {
    id:"l2", name:"Polynésie Française", country:"France", continent:"Océanie",
    climate:"tropical", style:["plage","luxe","bien-être"],
    budgetTier:"luxe", tripBudget:{ min:7000, max:14000 },
    flightFrom:1000, hotelPerNight:400,
    bestMonths:["Mai","Juin","Juil","Août","Sept"],
    duration:"14 – 21 jours", rating:5.0,
    description:"Bora Bora, Moorea — lagons d'outremer, requins baleines, fare polynésiens. Le paradis absolu.",
    highlight:"Les eaux les plus bleues de la planète.",
    img:"https://images.unsplash.com/photo-1589802829985-817e51171b92?w=700&q=80",
  },
  {
    id:"l3", name:"Dubaï", country:"Émirats Arabes", continent:"Asie",
    climate:"arid", style:["luxe","shopping","gastronomie"],
    budgetTier:"luxe", tripBudget:{ min:4500, max:8000 },
    flightFrom:200, hotelPerNight:250,
    bestMonths:["Oct","Nov","Déc","Jan","Fév","Mars"],
    duration:"7 – 10 jours", rating:4.6,
    description:"Burj Khalifa, désert en 4x4, dîner 200 étages. L'excès dans toute sa splendeur ultra-moderne.",
    highlight:"Vue depuis le Burj Khalifa au coucher de soleil.",
    img:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=80",
  },
];

// ─── Config filtres ────────────────────────────────────────────────────────────
const CONTINENTS = ["Tous", "Europe", "Asie", "Afrique", "Amérique", "Océanie"];
const BUDGET_TIERS = [
  { id:"tous",    label:"Tous budgets",  color:"bg-dark text-white",         emoji:"🌍" },
  { id:"petit",   label:"Petit budget",  color:"bg-emerald-600 text-white",  emoji:"💚", range:"< 1 500€" },
  { id:"moyen",   label:"Budget moyen",  color:"bg-blue-600 text-white",     emoji:"💙", range:"1 500 — 3 500€" },
  { id:"confort", label:"Confort",       color:"bg-purple-600 text-white",   emoji:"💜", range:"3 500 — 6 000€" },
  { id:"luxe",    label:"Luxe",          color:"bg-gold text-dark",           emoji:"✨", range:"6 000€+" },
];
const BUDGET_BADGE: Record<string, string> = {
  petit:   "bg-emerald-100 text-emerald-700",
  moyen:   "bg-blue-100 text-blue-700",
  confort: "bg-purple-100 text-purple-700",
  luxe:    "bg-yellow-100 text-yellow-700",
};
const STYLES = ["Tous","plage","culture","nature","aventure","gastronomie","bien-être","luxe"];

// ─── Component ────────────────────────────────────────────────────────────────
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

  return (
    <div className="bg-sand-50 min-h-screen -mt-20">

      {/* ═══ HERO ════════════════════════════════════════════════════════════ */}
      <div className="relative min-h-[580px] overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=90" alt="Voyage" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-dark/50 via-dark/20 to-sand-50" />
        </div>
        <div className="relative max-w-7xl mx-auto px-8 pt-32 pb-0">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 mb-6">
            <Plane className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-white/90 text-xs font-medium tracking-wide">O-Flyes Destinations</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl text-white leading-tight mb-4 max-w-2xl">
            Le monde entier<br /><span className="italic text-yellow-200">à votre portée.</span>
          </h1>
          <p className="text-white/70 text-sm md:text-base max-w-lg mb-8">
            De Marrakech à la Polynésie — des destinations pour tous les budgets, toutes les envies.
          </p>
          <div className="flex flex-wrap gap-6 pb-36">
            {[{ v:"22+",l:"Destinations"},{v:"5",l:"Continents"},{v:"650€",l:"À partir de"},{v:"14k€",l:"Luxe absolu"}].map(s => (
              <div key={s.l}>
                <p className="text-2xl md:text-3xl font-bold text-gold-200">{s.v}</p>
                <p className="text-white/60 text-xs uppercase tracking-widest">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ TOP 5 ═══════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-8 mb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="section-label mb-2">Sélection</p>
            <h2 className="font-serif text-4xl md:text-5xl text-dark">Top 5 — Un monde, 5 coups de cœur</h2>
          </div>
          <p className="hidden md:block text-dark-400 text-sm max-w-xs text-right">
            Vol + hôtel pour 2 personnes<br />sur 2 semaines depuis Paris
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {topFive.map((d, i) => (
            <div key={d.id} className={`relative rounded-3xl overflow-hidden group card-hover ${i === 0 ? "sm:col-span-2 lg:col-span-2" : ""}`}>
              <img src={d.img} alt={d.name} className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="text-[10px] font-semibold bg-white/90 text-dark px-2.5 py-1 rounded-full">{d.continentRank}</span>
              </div>
              <div className="absolute top-3 right-3">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${BUDGET_BADGE[d.budgetTier]}`}>
                  {BUDGET_TIERS.find(b => b.id === d.budgetTier)?.label}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className={`w-3 h-3 ${idx < Math.floor(d.rating) ? "fill-yellow-400 text-yellow-400" : "text-white/30"}`} />
                  ))}
                  <span className="text-white/60 text-[10px] ml-1">{d.rating}</span>
                </div>
                <h3 className="font-serif text-2xl text-white leading-tight mb-1">{d.name}</h3>
                <p className="text-white/60 text-xs mb-3 flex items-center gap-1"><MapPin className="w-3 h-3" />{d.country}</p>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3">
                  <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1.5">Budget total 2 pers / 2 sem</p>
                  <p className="text-white font-bold text-lg">{d.tripBudget.min.toLocaleString()}€ <span className="text-white/50 text-sm font-normal">— {d.tripBudget.max.toLocaleString()}€</span></p>
                  <div className="flex gap-3 mt-1.5">
                    <span className="text-white/60 text-[10px] flex items-center gap-1"><Plane className="w-2.5 h-2.5" /> Vol ~{d.flightFrom}€/pers</span>
                    <span className="text-white/60 text-[10px] flex items-center gap-1"><Hotel className="w-2.5 h-2.5" /> Hôtel ~{d.hotelPerNight}€/nuit</span>
                  </div>
                </div>
                <p className="text-white/70 text-xs italic leading-snug">&ldquo;{d.highlight}&rdquo;</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ FILTRES ═════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-8 mb-10 sticky top-20 z-40">
        <div className="bg-white/90 backdrop-blur-md border border-sand-200 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs text-dark-400 font-medium uppercase tracking-widest mr-2">Budget</span>
            {BUDGET_TIERS.map(b => (
              <button key={b.id} onClick={() => setBudgetTier(b.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${budgetTier === b.id ? b.color + " border-transparent scale-105" : "bg-sand-50 text-dark-400 border-sand-200 hover:border-dark-200"}`}>
                {b.emoji} {b.label} {"range" in b && <span className="opacity-70">({b.range})</span>}
              </button>
            ))}
            <button onClick={() => setShowFilters(!showFilters)}
              className={`ml-auto flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 border transition-all ${showFilters ? "bg-dark text-white border-dark" : "bg-sand-50 text-dark-400 border-sand-200 hover:border-dark"}`}>
              <Filter className="w-3 h-3" /> Filtres {activeCount > 0 && <span className="bg-yellow-400 text-dark rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">{activeCount}</span>}
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>
          {showFilters && (
            <div className="flex flex-wrap gap-4 pt-3 border-t border-sand-100">
              <div>
                <p className="text-[10px] text-dark-300 uppercase tracking-widest mb-1.5">Continent</p>
                <div className="flex flex-wrap gap-1.5">
                  {CONTINENTS.map(c => (
                    <button key={c} onClick={() => setContinent(c)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${continent === c ? "bg-dark text-white border-dark" : "bg-sand-50 text-dark-400 border-sand-200 hover:border-dark"}`}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-dark-300 uppercase tracking-widest mb-1.5">Style de voyage</p>
                <div className="flex flex-wrap gap-1.5">
                  {STYLES.map(s => (
                    <button key={s} onClick={() => setStyle(s)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize ${style === s ? "bg-yellow-400 text-dark border-yellow-400" : "bg-sand-50 text-dark-400 border-sand-200 hover:border-yellow-300"}`}>{s}</button>
                  ))}
                </div>
              </div>
              {activeCount > 0 && (
                <button onClick={() => { setContinent("Tous"); setBudgetTier("tous"); setStyle("Tous"); }} className="self-end text-xs text-dark-400 hover:text-dark underline">Réinitialiser</button>
              )}
            </div>
          )}
          <p className="text-[11px] text-dark-300 mt-2">{filtered.length} destination{filtered.length > 1 ? "s" : ""} trouvée{filtered.length > 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* ═══ GRILLE ══════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-8 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-dark-400">
            <p className="text-4xl mb-4">🌍</p>
            <p className="font-serif text-2xl text-dark mb-3">Aucune destination pour ces critères</p>
            <p className="text-sm mb-6">Essayez en élargissant vos filtres ou demandez à l&apos;IA !</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setContinent("Tous"); setBudgetTier("tous"); setStyle("Tous"); }} className="btn-dark text-sm">Tout afficher</button>
              <Link href="/chat" className="btn-gold text-sm">Demander à l&apos;IA</Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(d => (
              <div key={d.id} className="bg-white rounded-3xl overflow-hidden card-hover group border border-sand-100">
                <div className="relative h-48 overflow-hidden">
                  <img src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${BUDGET_BADGE[d.budgetTier]}`}>
                    {BUDGET_TIERS.find(b => b.id === d.budgetTier)?.emoji} {BUDGET_TIERS.find(b => b.id === d.budgetTier)?.label}
                  </span>
                  <span className="absolute top-3 right-3 text-[10px] bg-white/90 text-dark font-medium px-2 py-0.5 rounded-full">{d.continent}</span>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-white text-xs font-semibold">{d.rating}</span>
                  </div>
                  {d.topDest && <span className="absolute bottom-3 right-3 text-[10px] bg-yellow-400 text-dark font-bold px-2 py-0.5 rounded-full">⭐ Top 5</span>}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-serif text-xl text-dark leading-tight">{d.name}</h3>
                      <p className="text-dark-400 text-xs flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{d.country}</p>
                    </div>
                    <Link href="/chat" className="w-8 h-8 rounded-full border border-sand-200 flex items-center justify-center hover:bg-dark hover:text-white hover:border-dark transition-all flex-shrink-0">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <p className="text-dark-400 text-xs leading-relaxed mb-4 line-clamp-2">{d.description}</p>
                  <div className="bg-sand-50 rounded-xl p-3 mb-4">
                    <p className="text-[10px] text-dark-300 uppercase tracking-wider mb-1.5">Budget total 2 pers / 2 semaines</p>
                    <p className="text-dark font-bold text-base">{d.tripBudget.min.toLocaleString()}€<span className="text-dark-300 font-normal text-sm"> — {d.tripBudget.max.toLocaleString()}€</span></p>
                    <div className="flex gap-4 mt-1.5">
                      <span className="text-dark-400 text-[11px] flex items-center gap-1"><Plane className="w-3 h-3 text-yellow-500" /> ~{d.flightFrom}€ <span className="text-dark-300">A/R/pers</span></span>
                      <span className="text-dark-400 text-[11px] flex items-center gap-1"><Hotel className="w-3 h-3 text-yellow-500" /> ~{d.hotelPerNight}€ <span className="text-dark-300">/nuit</span></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-3.5 h-3.5 text-dark-300 flex-shrink-0" />
                    <p className="text-[11px] text-dark-400">{d.bestMonths.join(" · ")}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {d.style.slice(0, 3).map(s => <span key={s} className="tag capitalize text-[10px]">{s}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ IA CTA ══════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-8 pb-16">
        <div className="relative bg-dark rounded-3xl p-10 md:p-14 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <p className="section-label mb-3 text-yellow-400/80">IA Voyage</p>
              <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight mb-4">
                Pas trouvé votre<br /><span className="text-yellow-200 italic">destination idéale ?</span>
              </h2>
              <p className="text-white/60 text-sm mb-8 max-w-md leading-relaxed">
                Décrivez vos envies, votre budget, vos dates — notre IA trouve la destination parfaite,
                <strong className="text-white/80"> pour n&apos;importe quel budget</strong>.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/chat" className="btn-gold">Demander à l&apos;IA ✈</Link>
                <Link href="/chat" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0 max-w-xs">
              {[
                "\"Soleil en juillet, 800€ pour 2\"",
                "\"Aurores boréales, budget illimité\"",
                "\"Famille avec ados, nature, 3 000€\"",
                "\"Plage tropicale, moins de 1 200€\"",
              ].map(p => (
                <div key={p} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/70 text-xs italic">{p}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
