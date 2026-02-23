"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Plane, User, MapPin, MessageSquare, Clock, Star,
    Crown, Zap, LogOut, ChevronRight, Calendar,
    TrendingUp, Heart, Settings, ArrowUpRight, Sparkles
} from "lucide-react";
import { DESTINATIONS } from "@/lib/destinations";
import axios from "axios";

// ── Types ────────────────────────────────────────────────────────────────────
interface UserData {
    name: string;
    email: string;
    plan: "free" | "premium";
    joinedAt?: number;
}

// ── Données simulées ─────────────────────────────────────────────────────────
const MOCK_TRIPS = [
    { id: "t1", date: "Janv. 2025", status: "completed", notes: "Voyage incroyable !" },
    { id: "t3", date: "Mars 2025", status: "planned", notes: "Hâte d'y être" },
    { id: "m1", date: "Juin 2025", status: "planned", notes: "" },
];

const MOCK_CONVS = [
    { id: 1, summary: "Recherche destination Asie budget moyen", date: "Il y a 2 jours", dest: "Bali" },
    { id: 2, summary: "Itinéraire 2 semaines au Maroc avec famille", date: "Il y a 5 jours", dest: "Marrakech" },
    { id: 3, summary: "Comparer vols Paris → Lisbonne en avril", date: "Il y a 8 jours", dest: "Lisbonne" },
];

const PLAN_FEATURES = {
    free: {
        label: "Free",
        color: "bg-gray-100 text-gray-700",
        icon: <Zap className="w-4 h-4" />,
        features: ["3 recherches IA / mois", "Accès aux destinations", "Comparateur de vols"],
        limits: ["Historique limité à 7 jours", "Pas d'itinéraire personnalisé"],
    },
    premium: {
        label: "Premium ✦✦",
        color: "bg-yellow-100 text-yellow-800",
        icon: <Crown className="w-4 h-4" />,
        features: ["Recherches IA illimitées", "Itinéraires personnalisés", "Historique complet", "Alertes prix vols", "Support prioritaire"],
        limits: [],
    },
};

// ── Component ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "trips" | "conversations" | "plan">("overview");
    const [realTrips, setRealTrips] = useState<any[]>([]);
    const [realConvs, setRealConvs] = useState<any[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { router.replace("/auth/login"); return; }
        try {
            // Decode JWT payload (no verify on client — just for display)
            const payload = JSON.parse(atob(token.split(".")[1]));
            setUser({
                id: payload.id,
                name: payload.name || "Voyageur",
                email: payload.email || "",
                plan: "free", // TODO: fetch from backend
                joinedAt: payload.iat,
            });

            // Fetch real data
            if (payload.id) {
                axios.get(`/api/db/trips/user/${payload.id}`).then(res => setRealTrips(res.data)).catch(console.error);
                axios.get(`/api/db/chat/user/${payload.id}`).then(res => setRealConvs(res.data)).catch(console.error);
            }

        } catch {
            router.replace("/auth/login");
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/");
    };

    if (!user) return (
        <div className="min-h-screen bg-[#f9f7f4] flex items-center justify-center">
            <Plane className="w-6 h-6 text-yellow-500 animate-pulse" />
        </div>
    );

    const planInfo = PLAN_FEATURES[user.plan as "free" | "premium"];
    const trips = realTrips.length > 0 ? realTrips.map(t => ({ ...t, date: new Date(t.start_date).toLocaleDateString('fr-FR'), dest: { name: t.destination_name, country: t.country, img: t.img, flightFrom: 100, hotelPerNight: 50, rating: 4, id: t.destination_id } })) : MOCK_TRIPS.map(t => ({ ...t, dest: DESTINATIONS.find(d => d.id === t.id) })).filter(t => t.dest);
    const convs = realConvs.length > 0 ? realConvs.map(c => ({ id: c.id, summary: c.content.substring(0, 50) + "...", date: new Date(c.created_at).toLocaleDateString('fr-FR'), dest: "Assistant" })) : MOCK_CONVS;

    return (
        <div className="min-h-screen bg-[#f9f7f4]">

            {/* ── HEADER ─────────────────────────────────────────────────────────── */}
            <div className="bg-gray-900 pt-24 pb-12 px-6 md:px-12">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-yellow-400 flex items-center justify-center text-2xl font-bold text-gray-900 flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5">Mon espace</p>
                            <h1 className="font-serif text-3xl text-white">Bonjour, {user.name} 👋</h1>
                            <p className="text-gray-400 text-sm mt-0.5">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${planInfo.color}`}>
                            {planInfo.icon} {planInfo.label}
                        </span>
                        <button onClick={handleLogout}
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm border border-gray-700 hover:border-gray-500 rounded-xl px-4 py-2 transition-all">
                            <LogOut className="w-4 h-4" /> Déconnexion
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-6xl mx-auto mt-8 flex gap-1 bg-gray-800/50 rounded-xl p-1 w-fit">
                    {[
                        { id: "overview", label: "Vue d'ensemble", icon: <TrendingUp className="w-3.5 h-3.5" /> },
                        { id: "trips", label: "Mes voyages", icon: <MapPin className="w-3.5 h-3.5" /> },
                        { id: "conversations", label: "Historique IA", icon: <MessageSquare className="w-3.5 h-3.5" /> },
                        { id: "plan", label: "Mon forfait", icon: <Crown className="w-3.5 h-3.5" /> },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg transition-all ${activeTab === tab.id ? "bg-gray-900 text-white" : "text-gray-400 hover:text-white"
                                }`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 md:px-12 py-10">

                {/* ── VUE D'ENSEMBLE ──────────────────────────────────────────────── */}
                {activeTab === "overview" && (
                    <div className="space-y-8">
                        {/* Stats */}
                        <div className="grid sm:grid-cols-3 gap-4">
                            {[
                                { label: "Voyages planifiés", value: trips.filter(t => t.status === "planned").length, icon: <Calendar className="w-5 h-5 text-blue-500" />, color: "bg-blue-50" },
                                { label: "Voyages effectués", value: trips.filter(t => t.status === "completed").length, icon: <Star className="w-5 h-5 text-yellow-500" />, color: "bg-yellow-50" },
                                { label: "Conversations IA", value: convs.length, icon: <Sparkles className="w-5 h-5 text-violet-500" />, color: "bg-violet-50" },
                            ].map(s => (
                                <div key={s.label} className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
                                    <div>
                                        <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Voyages récents */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-serif text-2xl text-gray-900">Mes voyages</h2>
                                <button onClick={() => setActiveTab("trips")} className="text-xs text-gray-400 hover:text-gray-900 flex items-center gap-1">Voir tout <ChevronRight className="w-3 h-3" /></button>
                            </div>
                            <div className="grid sm:grid-cols-3 gap-4">
                                {trips.slice(0, 3).map(t => t.dest && (
                                    <Link key={t.id} href={`/destination/${t.id}`}
                                        className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-yellow-300 hover:shadow-md transition-all group"
                                        style={{ borderColor: '#C9A84C20' }}>
                                        <div className="relative h-32 overflow-hidden">
                                            <img src={t.dest.img} alt={t.dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                            <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${t.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                                                }`}>{t.status === "completed" ? "✓ Effectué" : "📅 Planifié"}</span>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900">{t.dest.name}</h3>
                                            <p className="text-gray-400 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" />{t.dest.country} · {t.date}</p>
                                            {t.notes && <p className="text-gray-500 text-xs mt-2 italic">&ldquo;{t.notes}&rdquo;</p>}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Dernières conversations IA */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-serif text-2xl text-gray-900">Historique IA</h2>
                                <button onClick={() => setActiveTab("conversations")} className="text-xs text-gray-400 hover:text-gray-900 flex items-center gap-1">Voir tout <ChevronRight className="w-3 h-3" /></button>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
                                {convs.slice(0, 3).map(c => (
                                    <Link key={c.id} href="/chat" className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group">
                                        <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                                            <Sparkles className="w-4 h-4 text-violet-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{c.summary}</p>
                                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />{c.date} · {c.dest}</p>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 flex-shrink-0 transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* CTA upgrade si free */}
                        {user.plan === "free" && (
                            <div className="bg-gray-900 rounded-2xl p-8 flex items-center justify-between gap-6">
                                <div>
                                    <p className="text-yellow-400 text-xs uppercase tracking-widest font-semibold mb-2">✦✦ Premium</p>
                                    <h3 className="font-serif text-2xl text-white mb-2">Passez à Premium</h3>
                                    <p className="text-gray-400 text-sm">Recherches IA illimitées, itinéraires personnalisés, alertes prix.</p>
                                </div>
                                <button onClick={() => setActiveTab("plan")}
                                    className="flex-shrink-0 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-6 py-3 rounded-xl text-sm transition-all whitespace-nowrap">
                                    Voir les offres
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── MES VOYAGES ─────────────────────────────────────────────────── */}
                {activeTab === "trips" && (
                    <div>
                        <h2 className="font-serif text-3xl text-gray-900 mb-6">Mes voyages</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {trips.map(t => t.dest && (
                                <Link key={t.id} href={`/destination/${t.id}`}
                                    className="bg-white rounded-2xl overflow-hidden group hover:shadow-lg transition-all"
                                    style={{ border: '1.5px solid #C9A84C33' }}>
                                    <div className="relative h-44 overflow-hidden">
                                        <img src={t.dest.img} alt={t.dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${t.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"
                                            }`}>{t.status === "completed" ? "✓ Effectué" : "📅 Planifié"}</span>
                                        <div className="absolute bottom-3 left-3">
                                            <p className="font-serif text-xl text-white">{t.dest.name}</p>
                                            <p className="text-white/60 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" />{t.dest.country}</p>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{t.date}</span>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 ${i < Math.floor(t.dest!.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                                                ))}
                                            </div>
                                        </div>
                                        {t.notes && <p className="text-gray-500 text-xs italic mb-3">&ldquo;{t.notes}&rdquo;</p>}
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <Plane className="w-3 h-3 text-yellow-500" />~{t.dest.flightFrom}€/pers
                                            <span className="text-gray-200">|</span>
                                            🏨 ~{t.dest.hotelPerNight}€/nuit
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {/* Add trip CTA */}
                            <Link href="/explore"
                                className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-yellow-300 flex flex-col items-center justify-center gap-3 p-8 min-h-[240px] text-center transition-all group">
                                <div className="w-12 h-12 rounded-xl bg-yellow-50 group-hover:bg-yellow-100 flex items-center justify-center transition-colors">
                                    <MapPin className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-700">Explorer une destination</p>
                                    <p className="text-gray-400 text-xs mt-1">Trouvez votre prochaine aventure</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                )}

                {/* ── HISTORIQUE IA ───────────────────────────────────────────────── */}
                {activeTab === "conversations" && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-serif text-3xl text-gray-900">Historique IA</h2>
                            <Link href="/chat" className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold text-sm px-4 py-2 rounded-xl transition-all">
                                <Sparkles className="w-4 h-4" /> Nouvelle conversation
                            </Link>
                        </div>
                        {user.plan === "free" && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3 text-sm text-amber-800">
                                <Crown className="w-4 h-4 flex-shrink-0" />
                                En forfait Free, l&apos;historique est limité aux 7 derniers jours.
                                <button onClick={() => setActiveTab("plan")} className="ml-auto text-xs underline whitespace-nowrap">Passer Premium</button>
                            </div>
                        )}
                        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
                            {convs.map(c => (
                                <Link key={c.id} href="/chat"
                                    className="flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors group">
                                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Sparkles className="w-5 h-5 text-violet-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 mb-1">{c.summary}</p>
                                        <p className="text-xs text-gray-400 flex items-center gap-2">
                                            <Clock className="w-3 h-3" /> {c.date}
                                            <span className="text-gray-200">·</span>
                                            <MapPin className="w-3 h-3" /> {c.dest}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">Reprendre</span>
                                        <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── MON FORFAIT ─────────────────────────────────────────────────── */}
                {activeTab === "plan" && (
                    <div>
                        <h2 className="font-serif text-3xl text-gray-900 mb-2">Mon forfait</h2>
                        <p className="text-gray-400 text-sm mb-8">Choisissez la formule adaptée à vos aventures.</p>
                        <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
                            {/* Free */}
                            <div className={`bg-white rounded-2xl p-8 border-2 transition-all ${user.plan === "free" ? "border-gray-900" : "border-gray-100"}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">Forfait</p>
                                        <h3 className="font-serif text-3xl text-gray-900">Free</h3>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                        <Zap className="w-6 h-6 text-gray-600" />
                                    </div>
                                </div>
                                <p className="text-4xl font-bold text-gray-900 mb-1">0€<span className="text-base font-normal text-gray-400">/mois</span></p>
                                <p className="text-gray-400 text-sm mb-6">Pour découvrir O-Flyes</p>
                                <div className="space-y-2 mb-8">
                                    {PLAN_FEATURES.free.features.map(f => (
                                        <p key={f} className="text-sm text-gray-700 flex items-center gap-2">
                                            <span className="text-emerald-500">✓</span>{f}
                                        </p>
                                    ))}
                                    {PLAN_FEATURES.free.limits.map(f => (
                                        <p key={f} className="text-sm text-gray-400 flex items-center gap-2">
                                            <span className="text-gray-300">✗</span>{f}
                                        </p>
                                    ))}
                                </div>
                                {user.plan === "free"
                                    ? <div className="w-full text-center text-sm font-semibold bg-gray-100 text-gray-600 py-3 rounded-xl">Forfait actuel</div>
                                    : <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm transition-all">Rétrograder</button>
                                }
                            </div>

                            {/* Premium */}
                            <div className={`bg-gray-900 rounded-2xl p-8 border-2 transition-all relative overflow-hidden ${user.plan === "premium" ? "border-yellow-400" : "border-gray-800"}`}>
                                <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-yellow-400/70 font-semibold mb-1">Forfait</p>
                                            <h3 className="font-serif text-3xl text-white">Premium ✦✦</h3>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-yellow-400/20 flex items-center justify-center">
                                            <Crown className="w-6 h-6 text-yellow-400" />
                                        </div>
                                    </div>
                                    <p className="text-4xl font-bold text-white mb-1">9,90€<span className="text-base font-normal text-gray-400">/mois</span></p>
                                    <p className="text-gray-400 text-sm mb-6">Pour les vrais aventuriers</p>
                                    <div className="space-y-2 mb-8">
                                        {PLAN_FEATURES.premium.features.map(f => (
                                            <p key={f} className="text-sm text-gray-200 flex items-center gap-2">
                                                <span className="text-yellow-400">✦</span>{f}
                                            </p>
                                        ))}
                                    </div>
                                    {user.plan === "premium"
                                        ? <div className="w-full text-center text-sm font-semibold bg-yellow-400/20 text-yellow-400 py-3 rounded-xl">Forfait actuel</div>
                                        : <Link href="/pricing" className="block w-full text-center bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-3 rounded-xl text-sm transition-all">
                                            Passer Premium →
                                        </Link>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
