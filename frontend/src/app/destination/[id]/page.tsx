"use client";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
    MapPin, Star, Plane, Hotel, Calendar, ArrowLeft,
    Clock, Wifi, Waves, Utensils, Dumbbell, Wind,
    ExternalLink, Sparkles, CheckCircle2, AlertTriangle
} from "lucide-react";
import { DESTINATIONS, BUDGET_BADGE, BUDGET_TIERS, ALL_MONTHS } from "@/lib/destinations";

// ── helpers ─────────────────────────────────────────────────────────────────
const BUDGET_LABEL: Record<string, string> = {
    petit: "Essentiel", moyen: "Confort", confort: "Premium", luxe: "Prestige"
};

// Real, live-fetched data — mirrors the shapes returned by /api/partner/* routes
// (Amadeus / OpenTripMap when available, smart per-city fallbacks with real booking links otherwise)
interface RealFlight { id: string; airline: string; duration: string; price: number; currency: string; type: string; class?: string; booking_url: string; }
interface RealHotel { id: string; name: string; price_per_night: number; currency: string; rating: number | string; stars: number; category: string; image_url: string; description: string; amenities: string[]; booking_url: string; }
interface RealActivity { id: string; title: string; category: string; price: number; currency: string; duration: string; rating: number | string; image_url: string; description: string; booking_url: string; }

function SkeletonCards({ count, className }: { count: number; className: string }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={`bg-sand-50 border border-gray-100 rounded-2xl animate-pulse ${className}`} />
            ))}
        </>
    );
}

function NoRealData({ label }: { label: string }) {
    return (
        <p className="text-sm text-gray-400 flex items-center gap-2 bg-sand-50 border border-gray-100 rounded-2xl px-5 py-4">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {label}
        </p>
    );
}

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

    // ── Real, live travel data — fetched per destination, never invented ──────
    const [flights, setFlights] = useState<RealFlight[] | null>(null);
    const [hotels, setHotels] = useState<RealHotel[] | null>(null);
    const [activities, setActivities] = useState<RealActivity[] | null>(null);
    const [loadingTravel, setLoadingTravel] = useState(true);

    useEffect(() => {
        if (!d) return;
        let cancelled = false;
        setLoadingTravel(true);
        Promise.allSettled([
            axios.get<RealFlight[]>("/api/partner/flights/search", { params: { origin: "Paris", destination: d.name, adults: 2 } }),
            axios.get<RealHotel[]>("/api/partner/hotels/search", { params: { city: d.name, adults: 2 } }),
            axios.get<RealActivity[]>("/api/partner/activities/search", { params: { city: d.name } }),
        ]).then(([f, h, a]) => {
            if (cancelled) return;
            setFlights(f.status === "fulfilled" ? f.value.data : []);
            setHotels(h.status === "fulfilled" ? h.value.data : []);
            setActivities(a.status === "fulfilled" ? a.value.data : []);
            setLoadingTravel(false);
        });
        return () => { cancelled = true; };
    }, [d?.name]);

    if (!d) notFound();

    const budgetInfo = BUDGET_TIERS.find(b => b.id === d.budgetTier);
    const sortedFlights = flights ? [...flights].sort((a, b) => a.price - b.price) : null;
    const sortedHotels = hotels ? [...hotels].sort((a, b) => a.price_per_night - b.price_per_night) : null;
    const cheapestFlight = sortedFlights && sortedFlights.length > 0 ? sortedFlights[0] : null;
    const cheapestHotel = sortedHotels && sortedHotels.length > 0 ? sortedHotels[0] : null;
    const estimatedTotal = cheapestFlight && cheapestHotel ? cheapestFlight.price * 2 + cheapestHotel.price_per_night * 7 : null;

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
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Estimation 2 pers · 1 semaine (vol + hôtel, prix réels)</p>
                            {loadingTravel ? (
                                <p className="text-xl font-bold text-gray-300 animate-pulse">Calcul…</p>
                            ) : estimatedTotal !== null ? (
                                <p className="text-xl font-bold text-dark-900">~{estimatedTotal.toLocaleString()}€</p>
                            ) : (
                                <p className="text-sm text-gray-400">Estimation indisponible</p>
                            )}
                        </div>
                        <div className="hidden md:block w-px bg-gray-100" />
                        <div className="flex items-center gap-2">
                            <Plane className="w-4 h-4 text-gold-500" />
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Vol depuis Paris (prix réel)</p>
                                {loadingTravel ? (
                                    <p className="text-gray-300 animate-pulse">…</p>
                                ) : cheapestFlight ? (
                                    <p className="font-bold text-dark-900">~{cheapestFlight.price}€<span className="text-gray-400 font-normal text-sm">/pers</span></p>
                                ) : (
                                    <p className="text-sm text-gray-400">Indisponible</p>
                                )}
                            </div>
                        </div>
                        <div className="hidden md:block w-px bg-gray-100" />
                        <div className="flex items-center gap-2">
                            <Hotel className="w-4 h-4 text-gold-500" />
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Hôtel le moins cher (prix réel)</p>
                                {loadingTravel ? (
                                    <p className="text-gray-300 animate-pulse">…</p>
                                ) : cheapestHotel ? (
                                    <p className="font-bold text-dark-900">~{cheapestHotel.price_per_night}€<span className="text-gray-400 font-normal text-sm">/nuit</span></p>
                                ) : (
                                    <p className="text-sm text-gray-400">Indisponible</p>
                                )}
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
                        <p className="text-xs text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Prix réels (Amadeus / partenaires)</p>
                    </div>
                    {loadingTravel ? (
                        <div className="grid md:grid-cols-3 gap-4"><SkeletonCards count={3} className="h-48" /></div>
                    ) : sortedFlights && sortedFlights.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-4">
                            {sortedFlights.slice(0, 3).map((f, i) => (
                                <div key={f.id} className={`bg-sand-50 rounded-2xl p-6 border transition-all hover:shadow-md ${i === 0 ? "border-gold-300 ring-1 ring-gold-200" : "border-gray-100"}`}>
                                    {i === 0 && <span className="text-[10px] bg-gold-400 text-black font-bold px-2.5 py-0.5 rounded-full mb-3 inline-block">💸 Meilleur prix réel</span>}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-sand-50 border border-gray-100 flex items-center justify-center">
                                            <Plane className="w-4 h-4 text-gold-500" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-dark-900 text-sm">{f.airline}</p>
                                            <p className="text-gray-400 text-xs">{f.type}{f.class ? ` · ${f.class}` : ""}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-5">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-sand-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Durée</span>
                                            <span className="font-medium text-dark-800">{f.duration}</span>
                                        </div>
                                    </div>
                                    <div className="border-t border-sand-50 pt-4 flex items-end justify-between">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase">Prix réel</p>
                                            <p className="text-2xl font-bold text-dark-900">{f.price}€<span className="text-sm text-gray-400 font-normal">/pers</span></p>
                                        </div>
                                        <a href={f.booking_url} target="_blank" rel="noopener noreferrer" className="bg-dark-900 hover:bg-gold-400 hover:text-black text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all inline-flex items-center gap-1.5">
                                            Réserver <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <NoRealData label={`Aucun vol disponible pour ${d.name} à l'instant — réessayez plus tard.`} />
                    )}
                </div>

                {/* ── HÔTELS ──────────────────────────────────────────────────────── */}
                <div>
                    <div className="flex items-end justify-between mb-6">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-gold-600 font-semibold mb-1">Hébergement</p>
                            <h2 className="font-serif text-3xl text-dark-900">Hôtels recommandés</h2>
                        </div>
                        <p className="text-xs text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Prix réels par nuit</p>
                    </div>
                    {loadingTravel ? (
                        <div className="grid md:grid-cols-3 gap-4"><SkeletonCards count={3} className="h-72" /></div>
                    ) : sortedHotels && sortedHotels.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-4">
                            {sortedHotels.slice(0, 3).map((h, i) => (
                                <div key={h.id} className={`bg-sand-50 rounded-2xl overflow-hidden border transition-all hover:shadow-md ${i === 0 ? "border-gold-300 ring-1 ring-gold-200" : "border-gray-100"}`}>
                                    <div className="relative h-40 overflow-hidden">
                                        <img src={h.image_url} alt={h.name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                        <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-gold-100 text-gold-700">{h.category}</span>
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
                                        {h.amenities.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {h.amenities.slice(0, 4).map(a => (
                                                    <span key={a} className="inline-flex items-center gap-1 text-[11px] bg-sand-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                        {amenityIcon[a] || <CheckCircle2 className="w-3 h-3" />} {a}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex items-end justify-between border-t border-sand-50 pt-4">
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase">Prix réel / nuit</p>
                                                <p className="text-xl font-bold text-dark-900">{h.price_per_night}€</p>
                                            </div>
                                            <a href={h.booking_url} target="_blank" rel="noopener noreferrer" className="bg-dark-900 hover:bg-gold-400 hover:text-black text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all inline-flex items-center gap-1.5">
                                                Réserver <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <NoRealData label={`Aucun hôtel disponible pour ${d.name} à l'instant — réessayez plus tard.`} />
                    )}
                </div>

                {/* ── ACTIVITÉS ───────────────────────────────────────────────────── */}
                <div>
                    <div className="flex items-end justify-between mb-6">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-gold-600 font-semibold mb-1">Sur place</p>
                            <h2 className="font-serif text-3xl text-dark-900">Activités à faire à {d.name}</h2>
                        </div>
                        <p className="text-xs text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Lieux & prix réels (OpenTripMap / partenaires)</p>
                    </div>
                    {loadingTravel ? (
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"><SkeletonCards count={8} className="h-56" /></div>
                    ) : activities && activities.length > 0 ? (
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {activities.slice(0, 8).map((a) => (
                                <a key={a.id} href={a.booking_url} target="_blank" rel="noopener noreferrer" className="bg-sand-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-gold-300 hover:shadow-md transition-all group block">
                                    <div className="relative h-28 overflow-hidden">
                                        <img src={a.image_url} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    </div>
                                    <div className="p-4">
                                        <span className="text-[10px] bg-gray-100 text-sand-500 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-medium mb-2 inline-block">{a.category}</span>
                                        <h3 className="font-semibold text-dark-900 text-sm mb-1.5 leading-snug line-clamp-2">{a.title}</h3>
                                        <p className="text-sand-500 text-xs leading-relaxed mb-3 line-clamp-2">{a.description}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {a.duration}</span>
                                            <span className="font-semibold text-dark-700">{a.price > 0 ? `${a.price}€` : "Gratuit"}</span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <NoRealData label={`Aucune activité disponible pour ${d.name} à l'instant — réessayez plus tard.`} />
                    )}
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
