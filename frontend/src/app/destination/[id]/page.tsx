"use client";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
    MapPin, Star, Plane, Hotel, Calendar, ArrowLeft,
    Clock, Wifi, Waves, Utensils, Dumbbell, Wind,
    ExternalLink, Sparkles, CheckCircle2, AlertTriangle,
    Plus, Compass
} from "lucide-react";
import { DESTINATIONS, BUDGET_BADGE, BUDGET_TIERS, ALL_MONTHS } from "@/lib/destinations";
import AddToTripModal from "@/components/AddToTripModal";

// ── Types ────────────────────────────────────────────────────────────────────
const BUDGET_LABEL: Record<string, string> = {
    petit: "Essentiel", moyen: "Confort", confort: "Premium", luxe: "Prestige"
};

interface RealFlight { id: string; airline: string; duration: string; price: number; currency: string; type: string; class?: string; booking_url: string; }
interface RealHotel { id: string; name: string; price_per_night: number; currency: string; rating: number | string; stars: number; category: string; image_url: string; description: string; amenities: string[]; booking_url: string; }
interface RealActivity { id: string; title: string; category: string; price: number; currency: string; duration: string; rating: number | string; image_url: string; description: string; booking_url: string; }

type ModalItem = {
    title: string;
    type: "flight" | "hotel" | "activity";
    provider?: string;
    price_estimate?: number;
    external_url?: string;
};

// ── Sub-components ───────────────────────────────────────────────────────────
function SkeletonCards({ count, h }: { count: number; h: string }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={`skeleton rounded-2xl ${h}`} />
            ))}
        </>
    );
}

function NoData({ label }: { label: string }) {
    return (
        <div className="col-span-full flex items-center gap-3 rounded-2xl px-6 py-5 text-sm"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-gold opacity-60" />
            {label}
        </div>
    );
}

function Stars({ n, max = 5 }: { n: number; max?: number }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: max }).map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < n ? "fill-gold text-gold" : "fill-transparent text-white/20"}`} />
            ))}
        </div>
    );
}

const amenityIcon: Record<string, React.ReactNode> = {
    "WiFi": <Wifi className="w-3 h-3" />,
    "Piscine": <Waves className="w-3 h-3" />,
    "Restaurant": <Utensils className="w-3 h-3" />,
    "Salle de sport": <Dumbbell className="w-3 h-3" />,
    "Climatisation": <Wind className="w-3 h-3" />,
};

// ── Add to trip button ───────────────────────────────────────────────────────
function AddBtn({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="add-trip-btn"
        >
            <Plus className="w-3.5 h-3.5" />
            Ajouter au voyage
        </button>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DestinationDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const d = DESTINATIONS.find(x => x.id === id);

    const [flights, setFlights] = useState<RealFlight[] | null>(null);
    const [hotels, setHotels] = useState<RealHotel[] | null>(null);
    const [activities, setActivities] = useState<RealActivity[] | null>(null);
    const [loadingTravel, setLoadingTravel] = useState(true);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalItem, setModalItem] = useState<ModalItem | null>(null);

    const openModal = (item: ModalItem) => {
        setModalItem(item);
        setModalOpen(true);
    };

    useEffect(() => {
        if (!d) return;
        let cancelled = false;
        setLoadingTravel(true);
        // Recherche systématiquement un aller-retour (départ +30j, retour +37j = 1 semaine sur place)
        const depart = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
        const ret = new Date(Date.now() + 37 * 86400000).toISOString().split('T')[0];
        Promise.allSettled([
            axios.get<RealFlight[]>("/api/partner/flights/search", { params: { origin: "Paris", destination: d.name, depart, return: ret, adults: 2 } }),
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
    const cheapestFlight = sortedFlights?.[0] ?? null;
    const cheapestHotel = sortedHotels?.[0] ?? null;
    // `cheapestFlight.price` est désormais le total ALLER-RETOUR pour 2 personnes (recherche round-trip)
    const estimatedTotal = cheapestFlight && cheapestHotel
        ? cheapestFlight.price + cheapestHotel.price_per_night * 7
        : null;
    const flightPricePerPerson = cheapestFlight ? Math.round(cheapestFlight.price / 2) : null;

    return (
        <>
            {/* ── Modal ── */}
            {modalItem && (
                <AddToTripModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    item={modalItem}
                />
            )}

            <div className="dest-root">

                {/* ── HERO ─────────────────────────────────────────────────────── */}
                <div className="dest-hero">
                    <img src={d.img} alt={d.name} className="dest-hero-img" />
                    <div className="dest-hero-overlay" />

                    {/* Back */}
                    <div className="dest-back">
                        <Link href="/explore" className="dest-back-link">
                            <ArrowLeft className="w-4 h-4" /> Toutes les destinations
                        </Link>
                    </div>

                    {/* Badges */}
                    <div className="dest-badges">
                        {d.topDest && <span className="dest-badge-top">⭐ Top 5</span>}
                        <span className={`dest-badge-budget ${BUDGET_BADGE[d.budgetTier]}`}>
                            {budgetInfo?.emoji} {BUDGET_LABEL[d.budgetTier]}
                        </span>
                    </div>

                    {/* Title block */}
                    <div className="dest-hero-title-block">
                        <p className="dest-hero-sup">
                            <MapPin className="w-3.5 h-3.5" /> {d.country} · {d.continent}
                        </p>
                        <h1 className="dest-hero-h1">{d.name}</h1>
                        <div className="dest-hero-meta">
                            <div className="dest-stars-row">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(d.rating) ? "fill-gold text-gold" : "fill-transparent text-white/30"}`} />
                                ))}
                                <span className="dest-rating">{d.rating}</span>
                            </div>
                            <span className="dest-meta-dot">•</span>
                            <span className="dest-meta-item"><Clock className="w-3.5 h-3.5" /> {d.duration}</span>
                            <span className="dest-meta-dot">•</span>
                            <span className="dest-meta-item"><Calendar className="w-3.5 h-3.5" /> {d.bestMonths.slice(0, 3).join(", ")}</span>
                            {d.continentRank && (
                                <>
                                    <span className="dest-meta-dot">•</span>
                                    <span className="dest-rank-badge">{d.continentRank}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── STICKY PRICE BAR ──────────────────────────────────────── */}
                <div className="dest-pricebar">
                    <div className="dest-pricebar-inner">
                        <div className="dest-pricebar-items">
                            <div className="dest-pricebar-item">
                                <p className="dest-pricebar-label">Estimation 2 pers · 1 semaine</p>
                                {loadingTravel
                                    ? <p className="dest-pricebar-val skeleton h-6 w-24 inline-block rounded" />
                                    : estimatedTotal !== null
                                        ? <p className="dest-pricebar-val">~{estimatedTotal.toLocaleString()}€</p>
                                        : <p className="dest-pricebar-na">Indisponible</p>
                                }
                            </div>
                            <div className="dest-pricebar-sep" />
                            <div className="dest-pricebar-item">
                                <p className="dest-pricebar-label"><Plane className="w-3.5 h-3.5 inline text-gold mr-1" />Vol aller-retour / pers.</p>
                                {loadingTravel
                                    ? <p className="skeleton h-5 w-16 inline-block rounded" />
                                    : flightPricePerPerson !== null
                                        ? <p className="dest-pricebar-val">~{flightPricePerPerson}€<span className="dest-pricebar-unit">/pers</span></p>
                                        : <p className="dest-pricebar-na">Indisponible</p>
                                }
                            </div>
                            <div className="dest-pricebar-sep" />
                            <div className="dest-pricebar-item">
                                <p className="dest-pricebar-label"><Hotel className="w-3.5 h-3.5 inline text-gold mr-1" />Hôtel / nuit</p>
                                {loadingTravel
                                    ? <p className="skeleton h-5 w-16 inline-block rounded" />
                                    : cheapestHotel
                                        ? <p className="dest-pricebar-val">~{cheapestHotel.price_per_night}€<span className="dest-pricebar-unit">/nuit</span></p>
                                        : <p className="dest-pricebar-na">Indisponible</p>
                                }
                            </div>
                        </div>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
                            className="dest-pricebar-cta shimmer"
                        >
                            <Sparkles className="w-4 h-4" /> Planifier avec l&apos;IA
                        </button>
                    </div>
                </div>

                {/* ── CONTENT ───────────────────────────────────────────────── */}
                <div className="dest-content">

                    {/* Description */}
                    <div data-sr className="dest-section-grid">
                        <div className="dest-about">
                            <p className="dest-section-eyebrow">À propos</p>
                            <h2 className="dest-section-h2">Pourquoi choisir {d.name} ?</h2>
                            <p className="dest-about-text">{d.description}</p>
                            <div className="dest-highlight-box">
                                <span className="text-xl">✨</span>
                                <div>
                                    <p className="dest-highlight-label">Le coup de cœur AIVANA</p>
                                    <p className="dest-highlight-text">&ldquo;{d.highlight}&rdquo;</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="dest-meta-label">Style de voyage</p>
                            <div className="dest-tags">
                                {d.style.map(s => (
                                    <span key={s} className="dest-tag">{s}</span>
                                ))}
                            </div>
                            <p className="dest-meta-label" style={{ marginTop: 24 }}>Meilleure période</p>
                            <div className="dest-months-grid">
                                {ALL_MONTHS.map(m => (
                                    <div key={m} className={`dest-month ${d.bestMonths.includes(m) ? "dest-month-active" : ""}`}>{m}</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── VOLS ─────────────────────────────────────────────── */}
                    <div data-sr data-sr-delay="1">
                        <div className="dest-section-header">
                            <div>
                                <p className="dest-section-eyebrow">Transport</p>
                                <h2 className="dest-section-h2">Vols disponibles</h2>
                            </div>
                            <p className="dest-verified"><CheckCircle2 className="w-3.5 h-3.5" /> Prix réels</p>
                        </div>
                        <div className="dest-cards-grid dest-cards-3">
                            {loadingTravel ? (
                                <SkeletonCards count={3} h="h-52" />
                            ) : sortedFlights && sortedFlights.length > 0 ? (
                                sortedFlights.slice(0, 3).map((f, i) => (
                                    <div key={f.id} className={`dest-card premium-card ${i === 0 ? "dest-card-best" : ""}`}>
                                        {i === 0 && <span className="dest-best-badge">💸 Meilleur prix</span>}
                                        <div className="dest-card-header">
                                            <div className="dest-card-icon">
                                                <Plane className="w-4 h-4 text-gold" />
                                            </div>
                                            <div>
                                                <p className="dest-card-title">{f.airline}</p>
                                                <p className="dest-card-sub">{f.type}{f.class ? ` · ${f.class}` : ""}</p>
                                            </div>
                                        </div>
                                        <div className="dest-card-row">
                                            <span className="dest-card-row-label"><Clock className="w-3 h-3" /> Durée</span>
                                            <span className="dest-card-row-val">{f.duration}</span>
                                        </div>
                                        <div className="dest-card-footer">
                                            <div>
                                                <p className="dest-card-price-label">Aller-retour réel · 2 pers.</p>
                                                <p className="dest-card-price">{f.price}€</p>
                                            </div>
                                            <div className="dest-card-actions">
                                                <AddBtn onClick={() => openModal({
                                                    title: `Vol A/R ${f.airline} — ${d.name}`,
                                                    type: "flight",
                                                    provider: f.airline,
                                                    price_estimate: f.price,
                                                    external_url: f.booking_url,
                                                })} />
                                                <a href={f.booking_url} target="_blank" rel="noopener noreferrer" className="dest-book-btn">
                                                    Réserver <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <NoData label={`Aucun vol disponible pour ${d.name} — réessayez plus tard.`} />
                            )}
                        </div>
                    </div>

                    {/* ── HÔTELS ───────────────────────────────────────────── */}
                    <div data-sr data-sr-delay="2">
                        <div className="dest-section-header">
                            <div>
                                <p className="dest-section-eyebrow">Hébergement</p>
                                <h2 className="dest-section-h2">Hôtels recommandés</h2>
                            </div>
                            <p className="dest-verified"><CheckCircle2 className="w-3.5 h-3.5" /> Prix réels / nuit</p>
                        </div>
                        <div className="dest-cards-grid dest-cards-3">
                            {loadingTravel ? (
                                <SkeletonCards count={3} h="h-80" />
                            ) : sortedHotels && sortedHotels.length > 0 ? (
                                sortedHotels.slice(0, 3).map((h, i) => (
                                    <div key={h.id} className={`dest-card dest-card-hotel premium-card ${i === 0 ? "dest-card-best" : ""}`}>
                                        {i === 0 && <span className="dest-best-badge">⭐ Meilleur rapport</span>}
                                        <div className="dest-hotel-img-wrap">
                                            <img src={h.image_url} alt={h.name} className="dest-hotel-img" />
                                            <div className="dest-hotel-img-overlay" />
                                            <span className="dest-hotel-category">{h.category}</span>
                                            <div className="dest-hotel-stars-wrap"><Stars n={h.stars} /></div>
                                        </div>
                                        <div className="dest-card-body">
                                            <div className="dest-card-header-row">
                                                <h3 className="dest-card-title">{h.name}</h3>
                                                <div className="dest-hotel-rating">
                                                    <p className="dest-hotel-rating-label">Note</p>
                                                    <p className="dest-hotel-rating-val">{h.rating}<span className="dest-hotel-rating-max">/10</span></p>
                                                </div>
                                            </div>
                                            {h.amenities.length > 0 && (
                                                <div className="dest-amenities">
                                                    {h.amenities.slice(0, 4).map(a => (
                                                        <span key={a} className="dest-amenity">
                                                            {amenityIcon[a] || <CheckCircle2 className="w-3 h-3" />} {a}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="dest-card-footer">
                                                <div>
                                                    <p className="dest-card-price-label">Prix / nuit</p>
                                                    <p className="dest-card-price">{h.price_per_night}€</p>
                                                </div>
                                                <div className="dest-card-actions">
                                                    <AddBtn onClick={() => openModal({
                                                        title: h.name,
                                                        type: "hotel",
                                                        provider: h.category,
                                                        price_estimate: h.price_per_night,
                                                        external_url: h.booking_url,
                                                    })} />
                                                    <a href={h.booking_url} target="_blank" rel="noopener noreferrer" className="dest-book-btn">
                                                        Réserver <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <NoData label={`Aucun hôtel disponible pour ${d.name} — réessayez plus tard.`} />
                            )}
                        </div>
                    </div>

                    {/* ── ACTIVITÉS ────────────────────────────────────────── */}
                    <div data-sr data-sr-delay="3">
                        <div className="dest-section-header">
                            <div>
                                <p className="dest-section-eyebrow">Sur place</p>
                                <h2 className="dest-section-h2">Activités à {d.name}</h2>
                            </div>
                            <p className="dest-verified"><CheckCircle2 className="w-3.5 h-3.5" /> Lieux & prix réels</p>
                        </div>
                        <div className="dest-cards-grid dest-cards-4">
                            {loadingTravel ? (
                                <SkeletonCards count={8} h="h-64" />
                            ) : activities && activities.length > 0 ? (
                                activities.slice(0, 8).map((a) => (
                                    <div key={a.id} className="dest-activity-card premium-card">
                                        <div className="dest-activity-img-wrap">
                                            <img src={a.image_url} alt={a.title} className="dest-activity-img" />
                                            <span className="dest-activity-category">{a.category}</span>
                                        </div>
                                        <div className="dest-card-body">
                                            <h3 className="dest-activity-title">{a.title}</h3>
                                            <p className="dest-activity-desc">{a.description}</p>
                                            <div className="dest-activity-footer">
                                                <span className="dest-activity-meta"><Clock className="w-3 h-3" /> {a.duration}</span>
                                                <span className="dest-activity-price">{a.price > 0 ? `${a.price}€` : "Gratuit"}</span>
                                            </div>
                                            <div className="dest-activity-actions">
                                                <AddBtn onClick={() => openModal({
                                                    title: a.title,
                                                    type: "activity",
                                                    provider: a.category,
                                                    price_estimate: a.price,
                                                    external_url: a.booking_url,
                                                })} />
                                                <a href={a.booking_url} target="_blank" rel="noopener noreferrer" className="dest-book-btn-sm">
                                                    Voir <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <NoData label={`Aucune activité disponible pour ${d.name} — réessayez plus tard.`} />
                            )}
                        </div>
                    </div>

                    {/* ── CTA ──────────────────────────────────────────────── */}
                    <div data-sr className="dest-cta">
                        <div className="dest-cta-orb dest-cta-orb-1" />
                        <div className="dest-cta-orb dest-cta-orb-2" />
                        <div className="dest-cta-inner">
                            <div className="dest-cta-text">
                                <p className="dest-cta-eyebrow">IA Voyage</p>
                                <h2 className="dest-cta-h2">
                                    Planifiez votre voyage<br />
                                    <em className="text-gold">à {d.name} avec l&apos;IA</em>
                                </h2>
                                <p className="dest-cta-sub">
                                    Dites-nous vos dates, votre budget et vos envies. Notre IA crée un itinéraire personnalisé en quelques secondes.
                                </p>
                                <div className="dest-cta-btns">
                                    <button
                                        onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
                                        className="dest-cta-primary shimmer"
                                    >
                                        <Sparkles className="w-4 h-4" /> Planifier avec l&apos;IA ✈
                                    </button>
                                    <Link href="/explore" className="dest-cta-secondary">
                                        Voir d&apos;autres destinations
                                    </Link>
                                </div>
                            </div>
                            <div className="dest-cta-prompts">
                                {[
                                    `"10 jours à ${d.name}, budget 1 500€ pour 2"`,
                                    `"Meilleur moment pour visiter ${d.name} ?"`,
                                    `"Itinéraire ${d.duration} à ${d.name} avec enfants"`,
                                    `"Hôtel pas cher + activités incontournables"`,
                                ].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
                                        className="dest-cta-prompt"
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <style>{`
                /* ── Root ── */
                .dest-root { background: var(--bg-primary); min-height: 100vh; margin-top: -80px; }

                /* ── Hero ── */
                .dest-hero { position: relative; height: 72vh; min-height: 520px; overflow: hidden; }
                .dest-hero-img { width: 100%; height: 100%; object-fit: cover; }
                .dest-hero-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.25) 100%);
                }
                .dest-back { position: absolute; top: 110px; left: 24px; }
                @media(min-width:768px) { .dest-back { left: 48px; } }
                .dest-back-link {
                    display: inline-flex; align-items: center; gap: 8px;
                    background: rgba(255,255,255,0.1); backdrop-filter: blur(12px);
                    border: 1px solid rgba(255,255,255,0.25); color: #fff;
                    font-size: 13px; padding: 8px 16px; border-radius: 999px;
                    transition: all 0.2s;
                }
                .dest-back-link:hover { background: rgba(255,255,255,0.18); }
                .dest-badges { position: absolute; top: 110px; right: 24px; display: flex; gap: 8px; }
                @media(min-width:768px) { .dest-badges { right: 48px; } }
                .dest-badge-top {
                    background: #C5A059; color: #0a1128;
                    font-size: 11px; font-weight: 800; padding: 5px 12px; border-radius: 999px;
                }
                .dest-badge-budget {
                    font-size: 11px; font-weight: 800; padding: 5px 12px; border-radius: 999px;
                }
                .dest-hero-title-block {
                    position: absolute; bottom: 0; left: 0; right: 0; padding: 32px 24px;
                }
                @media(min-width:768px) { .dest-hero-title-block { padding: 48px; } }
                .dest-hero-sup {
                    color: rgba(197,160,89,0.85); font-size: 11px; text-transform: uppercase;
                    letter-spacing: 0.18em; font-weight: 700; display: flex; align-items: center; gap: 6px;
                    margin-bottom: 10px;
                }
                .dest-hero-h1 {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(2.5rem, 7vw, 5rem); color: #fff; line-height: 1.05; margin-bottom: 16px;
                }
                .dest-hero-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
                .dest-stars-row { display: flex; align-items: center; gap: 3px; }
                .dest-rating { color: #fff; font-weight: 800; font-size: 14px; margin-left: 4px; }
                .dest-meta-dot { color: rgba(255,255,255,0.3); }
                .dest-meta-item { color: rgba(255,255,255,0.65); font-size: 13px; display: flex; align-items: center; gap: 5px; }
                .dest-rank-badge {
                    background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.8);
                    font-size: 11px; padding: 4px 12px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.2);
                }

                /* ── Price bar ── */
                .dest-pricebar {
                    position: sticky; top: 72px; z-index: 30;
                    background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);
                    backdrop-filter: blur(20px);
                }
                .dest-pricebar-inner {
                    max-width: 1280px; margin: 0 auto; padding: 14px 24px;
                    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
                }
                @media(min-width:768px) { .dest-pricebar-inner { padding: 14px 48px; } }
                .dest-pricebar-items { display: flex; flex-wrap: wrap; gap: 20px; align-items: center; }
                .dest-pricebar-item { display: flex; flex-direction: column; gap: 2px; }
                .dest-pricebar-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); }
                .dest-pricebar-val { font-size: 16px; font-weight: 800; color: var(--text-primary); }
                .dest-pricebar-unit { font-size: 12px; font-weight: 400; color: var(--text-muted); }
                .dest-pricebar-na { font-size: 12px; color: var(--text-muted); }
                .dest-pricebar-sep { width: 1px; height: 32px; background: var(--border-color); display: none; }
                @media(min-width:640px) { .dest-pricebar-sep { display: block; } }
                .dest-pricebar-cta {
                    display: none; align-items: center; gap: 8px;
                    background: linear-gradient(135deg, #C5A059, #d4b070);
                    color: #0a1128; font-size: 13px; font-weight: 800;
                    padding: 10px 20px; border-radius: 12px; border: none; cursor: pointer; transition: all 0.2s;
                }
                @media(min-width:768px) { .dest-pricebar-cta { display: inline-flex; } }
                .dest-pricebar-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(197,160,89,0.35); }

                /* ── Content ── */
                .dest-content { max-width: 1280px; margin: 0 auto; padding: 64px 24px 80px; display: flex; flex-direction: column; gap: 80px; }
                @media(min-width:768px) { .dest-content { padding: 64px 48px 80px; } }

                /* ── Section helpers ── */
                .dest-section-grid { display: grid; gap: 40px; }
                @media(min-width:768px) { .dest-section-grid { grid-template-columns: 2fr 1fr; } }
                .dest-section-eyebrow {
                    font-size: 11px; text-transform: uppercase; letter-spacing: 0.16em; font-weight: 700;
                    color: #C5A059; margin-bottom: 8px;
                }
                .dest-section-h2 {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(1.6rem, 3vw, 2.2rem); color: var(--text-primary); margin-bottom: 16px;
                }
                .dest-section-header {
                    display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 8px;
                }
                .dest-verified { font-size: 11px; color: #34d399; display: flex; align-items: center; gap: 5px; }
                .dest-about-text { color: var(--text-muted); font-size: 15px; line-height: 1.7; margin-bottom: 24px; }
                .dest-highlight-box {
                    display: flex; align-items: flex-start; gap: 16px;
                    background: rgba(197,160,89,0.06); border: 1px solid rgba(197,160,89,0.2);
                    border-radius: 16px; padding: 20px;
                }
                .dest-highlight-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #C5A059; font-weight: 700; margin-bottom: 4px; }
                .dest-highlight-text { color: var(--text-primary); font-style: italic; font-size: 14px; line-height: 1.6; }
                .dest-meta-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); font-weight: 700; margin-bottom: 10px; }
                .dest-tags { display: flex; flex-wrap: wrap; gap: 8px; }
                .dest-tag {
                    background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary);
                    font-size: 12px; padding: 6px 14px; border-radius: 999px; font-weight: 500; capitalize: true;
                }
                .dest-months-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
                .dest-month {
                    text-align: center; padding: 6px 4px; border-radius: 8px; font-size: 11px; font-weight: 600;
                    background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-muted);
                }
                .dest-month-active { background: #C5A059; color: #0a1128; border-color: #C5A059; }

                /* ── Cards ── */
                .dest-cards-grid { display: grid; gap: 16px; }
                .dest-cards-3 { grid-template-columns: 1fr; }
                @media(min-width:640px) { .dest-cards-3 { grid-template-columns: repeat(2, 1fr); } }
                @media(min-width:1024px) { .dest-cards-3 { grid-template-columns: repeat(3, 1fr); } }
                .dest-cards-4 { grid-template-columns: 1fr; }
                @media(min-width:640px) { .dest-cards-4 { grid-template-columns: repeat(2, 1fr); } }
                @media(min-width:1024px) { .dest-cards-4 { grid-template-columns: repeat(4, 1fr); } }

                .dest-card {
                    background: var(--bg-card); border: 1px solid var(--border-color);
                    border-radius: 18px; padding: 20px; position: relative; overflow: hidden;
                }
                .dest-card-best {
                    border-color: rgba(197,160,89,0.4);
                    box-shadow: 0 0 0 1px rgba(197,160,89,0.15), 0 4px 24px rgba(197,160,89,0.08);
                }
                .dest-best-badge {
                    display: inline-block;
                    background: rgba(197,160,89,0.15); color: #C5A059;
                    font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 999px;
                    margin-bottom: 14px;
                }
                .dest-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
                .dest-card-icon {
                    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
                    display: flex; align-items: center; justify-content: center;
                    background: rgba(197,160,89,0.1); border: 1px solid rgba(197,160,89,0.2);
                }
                .dest-card-title { font-size: 14px; font-weight: 700; color: var(--text-primary); }
                .dest-card-sub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
                .dest-card-row {
                    display: flex; justify-content: space-between; font-size: 13px;
                    margin-bottom: 16px; color: var(--text-muted);
                }
                .dest-card-row-label { display: flex; align-items: center; gap: 5px; }
                .dest-card-row-val { font-weight: 600; color: var(--text-primary); }
                .dest-card-footer { display: flex; align-items: flex-end; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 16px; flex-wrap: wrap; gap: 10px; }
                .dest-card-price-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); }
                .dest-card-price { font-size: 22px; font-weight: 800; color: var(--text-primary); }
                .dest-card-price-unit { font-size: 12px; font-weight: 400; color: var(--text-muted); }
                .dest-card-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }

                /* Hotel card */
                .dest-card-hotel { padding: 0; overflow: hidden; }
                .dest-hotel-img-wrap { position: relative; height: 160px; overflow: hidden; }
                .dest-hotel-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
                .dest-card-hotel:hover .dest-hotel-img { transform: scale(1.04); }
                .dest-hotel-img-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.5), transparent); }
                .dest-hotel-category {
                    position: absolute; top: 10px; left: 10px;
                    background: rgba(197,160,89,0.9); color: #0a1128;
                    font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 999px;
                }
                .dest-hotel-stars-wrap { position: absolute; bottom: 10px; left: 10px; }
                .dest-card-body { padding: 16px 20px 20px; }
                .dest-card-header-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; gap: 8px; }
                .dest-hotel-rating { text-align: right; flex-shrink: 0; }
                .dest-hotel-rating-label { font-size: 10px; color: var(--text-muted); }
                .dest-hotel-rating-val { font-size: 16px; font-weight: 800; color: var(--text-primary); }
                .dest-hotel-rating-max { font-size: 11px; font-weight: 400; color: var(--text-muted); }
                .dest-amenities { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 16px; }
                .dest-amenity {
                    display: inline-flex; align-items: center; gap: 4px;
                    font-size: 10px; background: var(--bg-primary); border: 1px solid var(--border-color);
                    color: var(--text-muted); padding: 3px 8px; border-radius: 999px;
                }

                /* Activity card */
                .dest-activity-card {
                    background: var(--bg-card); border: 1px solid var(--border-color);
                    border-radius: 18px; overflow: hidden;
                }
                .dest-activity-img-wrap { position: relative; height: 120px; overflow: hidden; }
                .dest-activity-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
                .dest-activity-card:hover .dest-activity-img { transform: scale(1.04); }
                .dest-activity-category {
                    position: absolute; top: 8px; left: 8px;
                    background: rgba(10,13,20,0.75); backdrop-filter: blur(4px);
                    color: var(--text-muted); font-size: 10px; font-weight: 700;
                    text-transform: uppercase; letter-spacing: 0.1em;
                    padding: 3px 8px; border-radius: 999px;
                }
                .dest-activity-title { font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 5px; line-height: 1.4; }
                .dest-activity-desc { font-size: 11px; color: var(--text-muted); line-height: 1.5; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .dest-activity-footer { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                .dest-activity-meta { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
                .dest-activity-price { font-size: 13px; font-weight: 800; color: var(--text-primary); }
                .dest-activity-actions { display: flex; gap: 6px; }

                /* Buttons */
                .add-trip-btn {
                    display: inline-flex; align-items: center; gap: 5px;
                    background: rgba(197,160,89,0.12); border: 1px solid rgba(197,160,89,0.3);
                    color: #C5A059; font-size: 11px; font-weight: 700;
                    padding: 6px 12px; border-radius: 8px; cursor: pointer; transition: all 0.2s;
                    white-space: nowrap;
                }
                .add-trip-btn:hover { background: rgba(197,160,89,0.2); border-color: rgba(197,160,89,0.5); transform: translateY(-1px); }
                .dest-book-btn {
                    display: inline-flex; align-items: center; gap: 5px;
                    background: var(--bg-primary); border: 1px solid var(--border-color);
                    color: var(--text-primary); font-size: 11px; font-weight: 700;
                    padding: 6px 12px; border-radius: 8px; transition: all 0.2s; white-space: nowrap;
                }
                .dest-book-btn:hover { border-color: var(--text-muted); }
                .dest-book-btn-sm {
                    flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 4px;
                    background: var(--bg-primary); border: 1px solid var(--border-color);
                    color: var(--text-muted); font-size: 11px; font-weight: 600;
                    padding: 6px 10px; border-radius: 8px; transition: all 0.2s;
                }
                .dest-book-btn-sm:hover { color: var(--text-primary); border-color: var(--text-muted); }

                /* CTA */
                .dest-cta {
                    position: relative; border-radius: 24px; overflow: hidden;
                    background: var(--bg-secondary); border: 1px solid var(--border-color);
                    padding: 48px 36px;
                }
                @media(min-width:768px) { .dest-cta { padding: 64px 56px; } }
                .dest-cta-orb { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(60px); }
                .dest-cta-orb-1 { width: 300px; height: 300px; top: -80px; right: -60px; background: radial-gradient(circle, rgba(197,160,89,0.12) 0%, transparent 70%); }
                .dest-cta-orb-2 { width: 200px; height: 200px; bottom: -60px; left: -40px; background: radial-gradient(circle, rgba(80,105,138,0.08) 0%, transparent 70%); }
                .dest-cta-inner { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 40px; }
                @media(min-width:768px) { .dest-cta-inner { flex-direction: row; align-items: center; } }
                .dest-cta-text { flex: 1; }
                .dest-cta-eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: 0.16em; color: rgba(197,160,89,0.7); font-weight: 700; margin-bottom: 12px; }
                .dest-cta-h2 {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(1.8rem, 3.5vw, 2.8rem); color: var(--text-primary); line-height: 1.2; margin-bottom: 16px;
                }
                .dest-cta-sub { color: var(--text-muted); font-size: 14px; line-height: 1.7; max-width: 440px; margin-bottom: 28px; }
                .dest-cta-btns { display: flex; flex-wrap: wrap; gap: 12px; }
                .dest-cta-primary {
                    display: inline-flex; align-items: center; gap: 8px;
                    background: linear-gradient(135deg, #C5A059, #d4b070);
                    color: #0a1128; font-weight: 800; font-size: 14px;
                    padding: 14px 24px; border-radius: 14px; border: none; cursor: pointer; transition: all 0.2s;
                }
                .dest-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(197,160,89,0.35); }
                .dest-cta-secondary {
                    display: inline-flex; align-items: center; gap: 8px;
                    border: 1px solid var(--border-color); color: var(--text-muted);
                    font-size: 13px; font-weight: 600; padding: 14px 24px; border-radius: 14px; transition: all 0.2s;
                }
                .dest-cta-secondary:hover { color: var(--text-primary); border-color: var(--text-muted); }
                .dest-cta-prompts { display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; max-width: 300px; }
                .dest-cta-prompt {
                    background: var(--bg-primary); border: 1px solid var(--border-color);
                    border-radius: 12px; padding: 11px 16px; color: var(--text-muted);
                    font-size: 12px; font-style: italic; text-align: left; cursor: pointer; transition: all 0.2s;
                }
                .dest-cta-prompt:hover { color: var(--text-primary); border-color: var(--text-muted); background: var(--bg-card); }
            `}</style>
        </>
    );
}
