"use client";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { ArrowUpRight, Clock, MapPin, Users } from "lucide-react";

export interface Destination {
  id: string;
  name: string;
  country: string;
  continent: string;
  climate: string;
  avg_daily_budget: number;
  best_periods: string[];
  tags: string[];
  description: string;
  image_url?: string;
}

const CLIMATES = ["Tous", "tropical", "arid", "temperate", "cold", "polar"];
const CLIMATE_LABELS: Record<string, string> = {
  Tous: "Tous", tropical: "Tropical", arid: "Désertique",
  temperate: "Tempéré", cold: "Froid", polar: "Polaire",
};
const PLACEHOLDER: Record<string, string> = {
  tropical: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&q=80",
  arid:      "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=700&q=80",
  temperate: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=700&q=80",
  cold:      "https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=700&q=80",
  polar:     "https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=700&q=80",
};

// Static demo data while DB is empty
const DEMO: Destination[] = [
  { id:"1", name:"Bali",         country:"Indonésie",  continent:"Asie",    climate:"tropical",  avg_daily_budget:60,  best_periods:["avr","mai","sept","oct"], tags:["plage","surf","temples","rizières"],   description:"Île des dieux, Bali mêle plages paradisiaques, rizières verdoyantes et temples millénaires." },
  { id:"2", name:"Reykjavik",    country:"Islande",    continent:"Europe",  climate:"cold",      avg_daily_budget:120, best_periods:["déc","jan","fév","mars"],  tags:["aurores boréales","geysers","cascades"],description:"Terres de feu et de glace, l'Islande dévoile des paysages d'une rare beauté." },
  { id:"3", name:"Barcelone",    country:"Espagne",    continent:"Europe",  climate:"temperate", avg_daily_budget:80,  best_periods:["avr","mai","juin","sept"], tags:["architecture","gastronomie","plage"],   description:"Ville vibrante où Gaudí a laissé son empreinte sur chaque quartier." },
  { id:"4", name:"Marrakech",    country:"Maroc",      continent:"Afrique", climate:"arid",      avg_daily_budget:45,  best_periods:["mars","avr","oct","nov"],  tags:["médina","épices","désert","hammam"],    description:"Cité impériale aux mille couleurs, Marrakech envoûte dès les premières heures." },
  { id:"5", name:"Kyoto",        country:"Japon",      continent:"Asie",    climate:"temperate", avg_daily_budget:95,  best_periods:["mars","avr","oct","nov"],  tags:["temples","sakura","geishas","zen"],      description:"Ancie capitale impériale, Kyoto sublime les saisons avec ses 1600 temples." },
  { id:"6", name:"Queenstown",   country:"Nouvelle-Zélande", continent:"Océanie", climate:"temperate", avg_daily_budget:110, best_periods:["nov","déc","jan","fév"], tags:["aventure","saut","ski","fjords"], description:"Capitale mondiale des sports extrêmes nichée entre lacs et montagnes." },
];

export default function ExplorePage() {
  const [active, setActive] = useState("Tous");
  const [budget, setBudget] = useState(200);
  const [destinations, setDestinations] = useState<Destination[]>(DEMO);
  const [loading, setLoading] = useState(false);

  const filtered = active === "Tous"
    ? destinations.filter(d => d.avg_daily_budget <= budget)
    : destinations.filter(d => d.climate === active && d.avg_daily_budget <= budget);

  const doSearch = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (active !== "Tous") params.climate = active;
      params.max_budget = String(budget);
      const res = await axios.get("/api/db/destinations", { params });
      if (res.data?.length) setDestinations(res.data);
    } catch { /* use demo */ }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-sand-50 min-h-screen">

      {/* ── Page header ── */}
      <div className="max-w-7xl mx-auto px-8 pt-12 pb-6">
        <p className="section-label mb-2">Nos Destinations</p>
        <div className="flex items-end justify-between">
          <h1 className="font-serif text-5xl md:text-6xl text-dark">Voyages O-Flyes</h1>
          <p className="hidden md:block text-dark-400 text-sm max-w-xs text-right">
            Découvrez des expériences guidées<br />selon vos envies et votre budget.
          </p>
        </div>
      </div>

      {/* ── Hero banner ── */}
      <div className="max-w-7xl mx-auto px-8 mb-14">
        <div className="relative rounded-3xl overflow-hidden h-72 md:h-96">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=85"
            alt="Voyage"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      </div>

      {/* ── Filters strip ── */}
      <div className="max-w-7xl mx-auto px-8 mb-8">
        <p className="section-label mb-4">Expériences</p>
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          {/* Climate chips */}
          <div className="flex flex-wrap gap-2">
            {CLIMATES.map(c => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  active === c
                    ? "bg-dark text-white border-dark"
                    : "bg-white text-dark-400 border-dark-100 hover:border-dark hover:text-dark"
                }`}
              >
                {CLIMATE_LABELS[c] ?? c}
              </button>
            ))}
          </div>
          {/* Budget slider */}
          <div className="flex items-center gap-4 min-w-[260px]">
            <span className="text-xs text-dark-400 whitespace-nowrap">Budget/j</span>
            <input
              type="range" min={20} max={200} step={10} value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              className="w-full accent-dark"
              title="Budget par jour"
              aria-label="Budget par jour"
            />
            <span className="text-sm font-semibold text-dark whitespace-nowrap">{budget}€</span>
            <button onClick={doSearch} className="btn-dark text-xs px-3 py-2">
              {loading ? "..." : "OK"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Destination cards ── */}
      <div className="max-w-7xl mx-auto px-8 pb-24 space-y-6">
        {filtered.length === 0 && (
          <div className="text-center py-20 text-dark-400">
            <p>Aucune destination pour ces critères.</p>
            <button onClick={() => { setActive("Tous"); setBudget(200); }} className="btn-outline mt-4 text-sm">
              Réinitialiser
            </button>
          </div>
        )}
        {filtered.map((d, i) => {
          const img = d.image_url || PLACEHOLDER[d.climate] || PLACEHOLDER.temperate;
          const isEven = i % 2 === 0;
          return (
            <div key={d.id} className={`grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-dark-100 card-hover`}>
              {/* Image side */}
              <div className={`relative h-72 md:h-auto ${!isEven ? "md:order-2" : ""}`}>
                <img src={img} alt={d.name} className="w-full h-full object-cover" />
                {/* Index badge */}
                <span className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs font-bold text-dark shadow">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              {/* Content side */}
              <div className={`bg-white p-8 flex flex-col justify-between ${!isEven ? "md:order-1" : ""}`}>
                <div>
                  <h3 className="font-serif text-3xl text-dark mb-2">{d.name}</h3>
                  <p className="text-dark-400 text-sm mb-6 leading-relaxed">{d.description}</p>
                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-dark-300 mb-0.5">Durée conseillée</p>
                      <p className="text-sm font-medium text-dark flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-dark-300" /> 7 – 14 jours
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-dark-300 mb-0.5">Pays</p>
                      <p className="text-sm font-medium text-dark flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-dark-300" /> {d.country}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-dark-300 mb-0.5">Climat</p>
                      <p className="text-sm font-medium text-dark">{CLIMATE_LABELS[d.climate]}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-dark-300 mb-0.5">Groupe</p>
                      <p className="text-sm font-medium text-dark flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-dark-300" /> Solo / Duo / Famille
                      </p>
                    </div>
                  </div>
                  {/* Tags */}
                  {d.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {d.tags.slice(0,4).map(t => (
                        <span key={t} className="tag">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-dark-300 uppercase tracking-wider">Budget/jour</p>
                    <p className="text-2xl font-bold text-dark">{d.avg_daily_budget}€<span className="text-sm font-normal text-dark-400"> / pers</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/chat"
                      className="btn-dark text-sm"
                    >
                      En savoir plus
                    </Link>
                    <Link href="/chat" className="w-10 h-10 rounded-full border border-dark flex items-center justify-center hover:bg-dark hover:text-white transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CTA bottom ── */}
      <div className="px-8 pb-0">
        <div className="max-w-7xl mx-auto">
          <div className="bg-sand-50 rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <span className="tag mb-4">Commencer maintenant</span>
              <h2 className="font-serif text-4xl text-dark leading-tight mb-3">
                Découvrez votre prochaine<br />escapade idéale
              </h2>
              <p className="text-dark-400 text-sm mb-8 max-w-sm">
                Planifiez votre voyage en quelques minutes avec notre IA.
              </p>
              <div className="flex items-center gap-3">
                <Link href="/chat" className="btn-dark">Planifier avec l&apos;IA</Link>
                <Link href="/chat" className="w-10 h-10 rounded-full border border-dark flex items-center justify-center hover:bg-dark hover:text-white transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=260&q=80" alt="" className="rounded-2xl h-48 w-40 object-cover" />
              <img src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=260&q=80" alt="" className="rounded-2xl h-48 w-40 object-cover mt-6" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
