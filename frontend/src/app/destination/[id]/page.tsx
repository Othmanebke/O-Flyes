"use client";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    MapPin, Star, Plane, Hotel, Car, Calendar, ArrowLeft,
    Clock, Users, Wifi, Waves, Utensils, Dumbbell, Wind,
    ChevronRight, Sparkles, CheckCircle2
} from "lucide-react";
import { DESTINATIONS, BUDGET_BADGE, BUDGET_TIERS, ALL_MONTHS } from "@/lib/destinations";

// ── helpers ─────────────────────────────────────────────────────────────────
const BUDGET_LABEL: Record<string, string> = {
    petit: "Essentiel", moyen: "Confort", confort: "Premium", luxe: "Prestige"
};

const amenityIcon: Record<string, React.ReactNode> = {
    "WiFi": <Wifi className="w-3 h-3" />,
    "Piscine": <Waves className="w-3 h-3" />,
    "Restaurant": <Utensils className="w-3 h-3" />,
    "Salle de sport": <Dumbbell className="w-3 h-3" />,
    "Climatisation": <Wind className="w-3 h-3" />,
};

function Stars({ n, max = 5 }: { n: number; max?: number }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: max }).map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < n ? "fill-gold-400 text-gold-400" : "text-gray-200 fill-gray-200"}`} />
            ))}
        </div>
    );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function DestinationDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const d = DESTINATIONS.find(x => x.id === id);
    if (!d) notFound();

    const budgetInfo = BUDGET_TIERS.find(b => b.id === d.budgetTier);

    return (
        <div className="bg-[#f9f7f4] min-h-screen -mt-20">

            {/* ── HERO ──────────────────────────────────────────────────────────── */}
            <div className="relative h-[70vh] min-h-[520px] overflow-hidden">
                <img src={d.img} alt={d.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

                {/* Back */}
                <div className="absolute top-28 left-6 md:left-12">
                    <Link href="/explore" className="inline-flex items-center gap-2 bg-sand-50/15 backdrop-blur-md border border-white/30 text-white text-sm px-4 py-2 rounded-full hover:bg-sand-50/25 transition-all">
                        <ArrowLeft className="w-4 h-4" /> Toutes les destinations
                    </Link>
                </div>

                {/* Badges */}
                <div className="absolute top-28 right-6 md:right-12 flex gap-2">
                    {d.topDest && (
                        <span className="bg-gold-400 text-black text-xs font-bold px-3 py-1.5 rounded-full">⭐ Top 5</span>
                    )}
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${BUDGET_BADGE[d.budgetTier]}`}>
                        {budgetInfo?.emoji} {BUDGET_LABEL[d.budgetTier]}
                    </span>
                </div>

                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-14">
                    <p className="text-gold-300/80 text-xs uppercase tracking-widest font-semibold mb-2 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> {d.country} · {d.continent}
                    </p>
                    <h1 className="font-serif text-5xl md:text-7xl text-white leading-tight mb-3">{d.name}</h1>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < Math.floor(d.rating) ? "fill-gold-400 text-gold-400" : "text-white/30"}`} />
                            ))}
                            <span className="text-white font-bold ml-1">{d.rating}</span>
                        </div>
                        <span className="text-white/50">•</span>
                        <span className="text-white/70 text-sm flex items-center gap-1.5"><Clock className="w-4 h-4" /> {d.duration}</span>
                        <span className="text-white/50">•</span>
                        <span className="text-white/70 text-sm flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {d.bestMonths.slice(0, 3).join(", ")}</span>
                        {d.continentRank && (
                            <>
                                <span className="text-white/50">•</span>
                                <span className="bg-sand-50/15 text-white text-xs px-3 py-1 rounded-full border border-white/20">{d.continentRank}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── BUDGET SUMMARY BAR ────────────────────────────────────────────── */}
            <div className="bg-sand-50 border-b border-gray-100 shadow-sm sticky top-[72px] z-30">
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex flex-wrap gap-6 items-center justify-between">
                    <div className="flex flex-wrap gap-8">
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Budget total 2 pers / 2 sem</p>
                            <p className="text-xl font-bold text-dark-900">{d.tripBudget.min.toLocaleString()}€ <span className="text-gray-400 font-normal text-base">— {d.tripBudget.max.toLocaleString()}€</span></p>
                        </div>
                        <div className="hidden md:block w-px bg-gray-100" />
                        <div className="flex items-center gap-2">
                            <Plane className="w-4 h-4 text-gold-500" />
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Vol A/R depuis Paris</p>
                                <p className="font-bold text-dark-900">~{d.flightFrom}€<span className="text-gray-400 font-normal text-sm">/pers</span></p>
                            </div>
                        </div>
                        <div className="hidden md:block w-px bg-gray-100" />
                        <div className="flex items-center gap-2">
                            <Hotel className="w-4 h-4 text-gold-500" />
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Hôtel moyen</p>
                                <p className="font-bold text-dark-900">~{d.hotelPerNight}€<span className="text-gray-400 font-normal text-sm">/nuit</span></p>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))} className="hidden md:inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition-all">
                        <Sparkles className="w-4 h-4" /> Planifier avec l&apos;IA
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-16">

                {/* ── DESCRIPTION ─────────────────────────────────────────────────── */}
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <p className="text-xs uppercase tracking-widest text-gold-600 font-semibold mb-3">À propos</p>
                        <h2 className="font-serif text-3xl text-dark-900 mb-4">Pourquoi choisir {d.name} ?</h2>
                        <p className="text-gray-600 text-base leading-relaxed mb-6">{d.description}</p>
                        <div className="bg-gold-50 border border-gold-200 rounded-2xl p-5 flex items-start gap-4">
                            <span className="text-2xl">✨</span>
                            <div>
                                <p className="text-xs text-gold-700 uppercase tracking-widest font-semibold mb-1">Le coup de cœur AIVANA</p>
                                <p className="text-dark-800 font-medium italic">&ldquo;{d.highlight}&rdquo;</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">Style de voyage</p>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {d.style.map(s => (
                                <span key={s} className="bg-sand-50 border border-gray-200 text-dark-700 text-sm px-4 py-1.5 rounded-full capitalize font-medium">{s}</span>
                            ))}
                        </div>
                        <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">Meilleure période</p>
                        <div className="grid grid-cols-4 gap-1">
                            {ALL_MONTHS.map(m => (
                                <div key={m} className={`text-center py-1.5 rounded-lg text-xs font-medium ${d.bestMonths.includes(m) ? "bg-gold-400 text-black" : "bg-sand-50 border border-gray-100 text-gray-300"}`}>{m}</div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── VOLS ────────────────────────────────────────────────────────── */}
                <div>
                    <div className="flex items-end justify-between mb-6">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-gold-600 font-semibold mb-1">Transport</p>
                            <h2 className="font-serif text-3xl text-dark-900">Vols disponibles</h2>
                        </div>
                        <p className="text-xs text-gray-400">Prix indicatifs A/R depuis Paris</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        {d.flights?.map((f, i) => (
                            <div key={i} className={`bg-sand-50 rounded-2xl p-6 border transition-all hover:shadow-md ${i === 0 ? "border-gold-300 ring-1 ring-gold-200" : "border-gray-100"}`}>
                                {i === 0 && <span className="text-[10px] bg-gold-400 text-black font-bold px-2.5 py-0.5 rounded-full mb-3 inline-block">💸 Meilleur prix</span>}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-sand-50 border border-gray-100 flex items-center justify-center text-xl">{f.logo}</div>
                                    <div>
                                        <p className="font-semibold text-dark-900 text-sm">{f.airline}</p>
                                        <p className="text-gray-400 text-xs">{f.type}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-sand-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Durée</span>
                                        <span className="font-medium text-dark-800">{f.duration}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-sand-500">Escales</span>
                                        <span className={`font-medium ${f.stops === "Direct" ? "text-green-600" : "text-dark-800"}`}>{f.stops}</span>
                                    </div>
                                </div>
                                <div className="border-t border-sand-50 pt-4 flex items-end justify-between">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase">À partir de</p>
                                        <p className="text-2xl font-bold text-dark-900">{f.price}€<span className="text-sm text-gray-400 font-normal">/pers</span></p>
                                    </div>
                                    <button className="bg-dark-900 hover:bg-gold-400 hover:text-black text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all">
                                        Voir <ChevronRight className="w-3 h-3 inline" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── HÔTELS ──────────────────────────────────────────────────────── */}
                <div>
                    <div className="flex items-end justify-between mb-6">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-gold-600 font-semibold mb-1">Hébergement</p>
                            <h2 className="font-serif text-3xl text-dark-900">Hôtels recommandés</h2>
                        </div>
                        <p className="text-xs text-gray-400">Prix par nuit, 1 chambre double</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        {d.hotels?.map((h, i) => (
                            <div key={i} className={`bg-sand-50 rounded-2xl overflow-hidden border transition-all hover:shadow-md ${i === 1 ? "border-gold-300 ring-1 ring-gold-200" : "border-gray-100"}`}>
                                <div className="relative h-40 overflow-hidden">
                                    <img src={h.img} alt={h.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${i === 0 ? "bg-emerald-100 text-emerald-700" : i === 1 ? "bg-gold-100 text-gold-700" : "bg-purple-100 text-purple-700"}`}>{h.badge}</span>
                                    <div className="absolute bottom-3 left-3 flex items-center gap-1">
                                        <Stars n={h.stars} />
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-dark-900">{h.name}</h3>
                                        <div className="text-right flex-shrink-0 ml-2">
                                            <p className="text-[10px] text-gray-400">Note</p>
                                            <p className="font-bold text-dark-900">{h.rating}<span className="text-gray-400 font-normal text-xs">/10</span></p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {h.amenities.slice(0, 4).map(a => (
                                            <span key={a} className="inline-flex items-center gap-1 text-[11px] bg-sand-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                {amenityIcon[a] || <CheckCircle2 className="w-3 h-3" />} {a}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-end justify-between border-t border-sand-50 pt-4">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase">Prix / nuit</p>
                                            <p className="text-xl font-bold text-dark-900">{h.pricePerNight}€</p>
                                        </div>
                                        <button className="bg-dark-900 hover:bg-gold-400 hover:text-black text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all">
                                            Réserver <ChevronRight className="w-3 h-3 inline" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── ACTIVITÉS ───────────────────────────────────────────────────── */}
                <div>
                    <p className="text-xs uppercase tracking-widest text-gold-600 font-semibold mb-1">Sur place</p>
                    <h2 className="font-serif text-3xl text-dark-900 mb-6">Activités à faire à {d.name}</h2>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {d.activities?.map((a, i) => (
                            <div key={i} className="bg-sand-50 rounded-2xl p-5 border border-gray-100 hover:border-gold-300 hover:shadow-md transition-all group">
                                <div className="w-11 h-11 bg-gold-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-gold-100 transition-colors">{a.emoji}</div>
                                <span className="text-[10px] bg-gray-100 text-sand-500 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-medium mb-2 inline-block">{a.category}</span>
                                <h3 className="font-semibold text-dark-900 text-sm mb-1.5 leading-snug">{a.name}</h3>
                                <p className="text-sand-500 text-xs leading-relaxed mb-4">{a.description}</p>
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {a.duration}</span>
                                    <span className="font-semibold text-dark-700">{a.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── LOCATION DE VOITURE ─────────────────────────────────────────── */}
                <div>
                    <div className="flex items-end justify-between mb-6">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-gold-600 font-semibold mb-1">Mobilité</p>
                            <h2 className="font-serif text-3xl text-dark-900">Location de voiture</h2>
                        </div>
                        <p className="text-xs text-gray-400">Prix indicatifs / jour, toutes compagnies</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        {d.carRentals?.map((c, i) => (
                            <div key={i} className="bg-sand-50 rounded-2xl p-6 border border-gray-100 hover:border-gold-300 hover:shadow-md transition-all">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-sand-50 flex items-center justify-center text-2xl">{c.emoji}</div>
                                    <div>
                                        <p className="font-semibold text-dark-900">{c.category}</p>
                                        <p className="text-gray-400 text-xs">{c.model}</p>
                                    </div>
                                </div>
                                <div className="space-y-1.5 mb-5">
                                    {c.features.map(f => (
                                        <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> {f}
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-sand-50 pt-4 flex items-end justify-between">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase">À partir de</p>
                                        <p className="text-2xl font-bold text-dark-900">{c.pricePerDay}€<span className="text-sm text-gray-400 font-normal">/jour</span></p>
                                    </div>
                                    <button className="bg-dark-900 hover:bg-gold-400 hover:text-black text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1">
                                        <Car className="w-3.5 h-3.5" /> Louer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── CTA IA ──────────────────────────────────────────────────────── */}
                <div className="relative bg-dark-900 rounded-3xl p-10 md:p-14 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/10 rounded-full -translate-y-1/3 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-sand-50/5 rounded-full translate-y-1/3 -translate-x-1/3" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1">
                            <p className="text-gold-400/80 text-xs uppercase tracking-widest font-semibold mb-3">IA Voyage</p>
                            <h2 className="font-serif text-4xl text-white leading-tight mb-4">
                                Planifiez votre voyage<br /><span className="text-gold-200 italic">à {d.name} avec l&apos;IA</span>
                            </h2>
                            <p className="text-white/60 text-sm mb-8 max-w-md leading-relaxed">
                                Dites-nous vos dates, votre budget et vos envies. Notre IA crée un itinéraire personnalisé pour {d.name} en quelques secondes.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <button onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))} className="inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-black font-bold px-6 py-3 rounded-xl transition-all">
                                    <Sparkles className="w-4 h-4" /> Planifier avec l&apos;IA ✈
                                </button>
                                <Link href="/explore" className="inline-flex items-center gap-2 border border-white/20 text-white text-sm px-5 py-3 rounded-xl hover:bg-sand-50/10 transition-all">
                                    Voir d&apos;autres destinations
                                </Link>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 flex-shrink-0 max-w-xs">
                            {[
                                `"10 jours à ${d.name}, budget 1 500€ pour 2"`,
                                `"Meilleur moment pour visiter ${d.name} ?"`,
                                `"Itinéraire ${d.duration} à ${d.name} avec enfants"`,
                                `"Hôtel pas cher + activités incontournables"`,
                            ].map(p => (
                                <button onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))} key={p} className="bg-sand-50/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/70 text-xs italic hover:bg-sand-50/10 hover:border-white/20 transition-all">{p}</button>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
