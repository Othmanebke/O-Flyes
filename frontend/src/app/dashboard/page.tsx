"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, LayoutDashboard, Calendar, Mail, Settings, Plus, LogOut, ChevronRight, MapPin, Clock, Trash2, Edit2, Shield, Star, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import BookingShoppingModal, { BookingData } from "@/components/shopping/BookingShoppingModal";
import { motion } from "framer-motion";
import { parseJwt } from "@/lib/jwt";

interface Trip {
    id: string;
    title: string;
    destination_name?: string;
    country?: string;
    start_date: string;
    end_date: string;
    status: string;
    img?: string;
}

interface Booking {
    id: string;
    trip_id: string;
    type: 'flight' | 'hotel' | 'activity' | 'transport';
    title: string;
    provider?: string;
    confirmation_number?: string;
    start_datetime?: string;
    end_datetime?: string;
    price?: number;
    currency?: string;
    location?: string;
    status: string;
    external_reference?: string;
    booking_url?: string;
    raw_data?: Record<string, any>;
}

interface TripAnalysis {
    budget: { total: number; used: number; percentage: number };
    coverage: {
        missingHotelNights: number;
        missingOutboundFlight: boolean;
        missingReturnFlight: boolean;
        emptyDays: string[];
        hasActivity: boolean;
    };
    warnings: string[];
    score: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [userName, setUserName] = useState("Voyageur");
    const [userId, setUserId] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTripTitle, setNewTripTitle] = useState("");

    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [analysis, setAnalysis] = useState<TripAnalysis | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    const [emailConnected, setEmailConnected] = useState(false);
    const [provider, setProvider] = useState<string>("local");
    const [showSyncOptions, setShowSyncOptions] = useState(false);

    const [showSettings, setShowSettings] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [userRole, setUserRole] = useState("explorer");
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/auth/login");
        } else {
            try {
                const payload = parseJwt(token);
                if (!payload || !payload.id) {
                    throw new Error("Invalid payload");
                }
                setUserId(payload.id);
                setUserName(payload.name || "Voyageur");
                fetchTrips(payload.id);
                checkEmailSync(payload.id);

                axios.get(`/api/db/users/${payload.id}`).then(res => {
                    if (res.data) {
                        if (res.data.provider) setProvider(res.data.provider);
                        if (res.data.email) setUserEmail(res.data.email);
                        if (res.data.role) setUserRole(res.data.role);
                        setEditNameValue(res.data.name || payload.name || "Voyageur");
                    }
                }).catch(err => console.error("Failed to fetch provider/profile", err));
            } catch (e) {
                console.error("Invalid token", e);
                localStorage.removeItem("token");
                router.push("/auth/login");
            }
        }
    }, [router]);

    const checkEmailSync = async (uid: string) => {
        try {
            const res = await axios.get(`/api/db/email-credentials/user/${uid}`);
            setEmailConnected(res.data && res.data.length > 0);
        } catch (err) {
            console.error("Failed to check email sync", err);
        }
    };

    const handleConnectEmail = () => {
        if (provider === "google") {
            window.location.href = `https://api-gateway-v0vr.onrender.com/api/auth/google/sync`;
        } else if (provider === "microsoft") {
            window.location.href = `https://api-gateway-v0vr.onrender.com/api/auth/microsoft`;
        } else {
            setShowSyncOptions(true); // Open modal for local users to choose
        }
    };

    const fetchTrips = async (uid: string) => {
        try {
            const res = await axios.get(`/api/db/trips/user/${uid}`);
            setTrips(res.data || []);
        } catch (err) {
            console.error("Failed to fetch trips", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async (tripId: string) => {
        try {
            const res = await axios.get(`/api/db/bookings/trip/${tripId}`);
            setBookings(res.data || []);
        } catch (err) {
            console.error("Failed to fetch bookings", err);
        }
    };

    const fetchAnalysis = async (tripId: string) => {
        try {
            const res = await axios.get(`/api/trips/${tripId}/analysis`);
            setAnalysis(res.data);
        } catch (err) {
            console.error("Failed to fetch analysis", err);
            setAnalysis(null);
        }
    };

    const handleSaveProfile = async () => {
        if (!userId || !editNameValue.trim()) return;
        setIsSavingProfile(true);
        try {
            await axios.put(`/api/db/users/${userId}`, { name: editNameValue });
            setUserName(editNameValue);
            setIsEditingName(false);
        } catch (err) {
            console.error("Failed to save profile", err);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleUpgradePremium = async () => {
        if (!userId) return;
        setIsUpgrading(true);
        try {
            await axios.post(`/api/db/users/${userId}/upgrade`, { role: 'premium' });
            setUserRole('premium');
        } catch (err) {
            console.error("Failed to upgrade", err);
        } finally {
            setIsUpgrading(false);
        }
    };

    const handleCreateTrip = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !newTripTitle) return;

        try {
            await axios.post("/api/db/trips", {
                user_id: userId,
                title: newTripTitle,
                status: "planned"
            });
            setNewTripTitle("");
            setShowCreateModal(false);
            fetchTrips(userId);
        } catch (err) {
            console.error("Failed to create trip", err);
        }
    };

    const handleDeleteTrip = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Supprimer ce voyage ?")) return;
        try {
            await axios.delete(`/api/db/trips/${id}`);
            if (userId) fetchTrips(userId);
            if (selectedTrip?.id === id) setSelectedTrip(null);
        } catch (err) {
            console.error("Failed to delete trip", err);
        }
    };

    const handleSelectTrip = (trip: Trip) => {
        setSelectedTrip(trip);
        fetchBookings(trip.id);
        fetchAnalysis(trip.id);
    };

    const handleAddBooking = async (bookingData: BookingData) => {
        if (!selectedTrip) return;

        try {
            await axios.post("/api/db/bookings", {
                trip_id: selectedTrip.id,
                ...bookingData
            });
            setShowBookingModal(false);
            fetchBookings(selectedTrip.id);
        } catch (err) {
            console.error("Failed to add booking", err);
        }
    };

    const handleDeleteBooking = async (id: string) => {
        if (!confirm("Supprimer cette réservation ?")) return;
        try {
            await axios.delete(`/api/db/bookings/${id}`);
            if (selectedTrip) fetchBookings(selectedTrip.id);
        } catch (err) {
            console.error("Failed to delete booking", err);
        }
    };

    const downloadICS = () => {
        if (!selectedTrip || bookings.length === 0) return;

        let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//O-Flyes//Timeline//FR\n";
        bookings.forEach(b => {
            if (!b.start_datetime) return;
            // Format to YYYYMMDDTHHMMSSZ
            const startStr = new Date(b.start_datetime);
            if (isNaN(startStr.getTime())) return;
            const start = startStr.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

            let end = start;
            if (b.end_datetime) {
                const endStr = new Date(b.end_datetime);
                if (!isNaN(endStr.getTime())) {
                    end = endStr.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                }
            }

            icsContent += "BEGIN:VEVENT\n";
            icsContent += `SUMMARY:${b.title}\n`;
            icsContent += `DTSTART:${start}\n`;
            icsContent += `DTEND:${end}\n`;
            if (b.location) icsContent += `LOCATION:${b.location}\n`;
            icsContent += "END:VEVENT\n";
        });
        icsContent += "END:VCALENDAR";

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `voyage_${selectedTrip.title.replace(/\s+/g, '_')}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0D14] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0D14] text-white flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#141822] border-r border-white/5 text-white hidden md:flex flex-col">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-3 font-serif text-lg tracking-tight text-white group">
                        <div className="w-10 h-10 bg-gold/10 rounded-2xl flex items-center justify-center border border-gold/20 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(184,134,11,0.1)]">
                            <Plane className="w-5 h-5 text-gold group-hover:rotate-12 transition-transform" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="font-bold leading-none text-xl">AI<span className="text-gold">VANA</span></span>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {[
                        { icon: LayoutDashboard, label: "Dashboard", active: !selectedTrip && !showSettings, onClick: () => { setSelectedTrip(null); setShowSettings(false); } },
                        { icon: Calendar, label: "Mes Voyages", active: !!selectedTrip && !showSettings, onClick: () => { setShowSettings(false); } },
                        {
                            icon: Mail,
                            label: emailConnected ? "Email Connecté" : (provider === 'google' ? "Sync Gmail" : provider === 'microsoft' ? "Sync Outlook" : "Sync Email"),
                            active: false,
                            onClick: handleConnectEmail,
                            color: emailConnected ? "text-emerald-400" : ""
                        },
                        { icon: Settings, label: "Paramètres", active: showSettings, onClick: () => { setSelectedTrip(null); setShowSettings(true); } },
                    ].map((item) => (
                        <button
                            key={item.label}
                            onClick={item.onClick}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${item.active
                                ? "bg-gold text-dark font-black shadow-[0_0_20px_rgba(201,168,76,0.2)]"
                                : "text-white/40 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <item.icon className={`w-4 h-4 ${item.color || ""}`} />
                            <span className="text-xs uppercase font-black tracking-widest">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={() => { localStorage.removeItem("token"); router.push("/"); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-white/40 hover:text-white transition-colors group"
                    >
                        <LogOut className="w-4 h-4 group-hover:text-red-400 transition-colors" />
                        <span className="text-xs uppercase font-black tracking-widest">Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Decorative background blur */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full pointer-events-none z-0" />

                {/* Header */}
                <header className="h-20 bg-[#0A0D14]/80 backdrop-blur-xl border-b border-white/10 px-8 flex items-center justify-between flex-shrink-0 z-10">
                    <h1 className="font-serif text-2xl text-white">
                        {showSettings ? "Paramètres" : (selectedTrip ? selectedTrip.title : "Mon Dashboard")}
                    </h1>
                    <div className="flex items-center gap-4">
                        {emailConnected && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                <Mail className="w-3 h-3 text-emerald-400" />
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Sync Email</span>
                            </div>
                        )}
                        {!selectedTrip && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="hidden sm:flex items-center gap-2 bg-gold text-dark text-xs font-black px-6 py-2.5 rounded-xl hover:bg-gold-300 transition-all shadow-xl shadow-gold/10 active:scale-95 uppercase tracking-widest"
                            >
                                <Plus className="w-4 h-4" /> Nouveau Voyage
                            </button>
                        )}
                        {selectedTrip && (
                            <button
                                onClick={() => setShowBookingModal(true)}
                                className="hidden sm:flex items-center gap-2 bg-gold text-dark text-xs font-black px-6 py-2.5 rounded-xl hover:bg-gold-300 transition-all shadow-xl shadow-gold/10 active:scale-95 uppercase tracking-widest"
                            >
                                <Plus className="w-4 h-4" /> Réservation
                            </button>
                        )}
                        <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-black text-white uppercase tracking-widest">{userName}</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">
                                {userRole === 'premium' ?
                                    <span className="text-gold flex items-center gap-1 justify-end font-black"><Star fill="currentColor" className="w-3 h-3" /> Premium</span>
                                    : "Explorateur"}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gold text-dark flex items-center justify-center font-black shadow-lg shadow-gold/20">
                            {userName[0]}
                        </div>
                    </div>
                </header>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10">
                    <div className="max-w-6xl mx-auto">
                        {showSettings ? (
                            /* Settings View */
                            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    {/* Left Content - Profil */}
                                    <div className="lg:col-span-2 space-y-10">
                                        <div className="bg-[#141822] rounded-[32px] p-10 border border-white/5 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-gold/10 transition-colors duration-700" />

                                            <div className="flex items-center gap-6 mb-12 relative z-10">
                                                <div className="w-24 h-24 rounded-2xl bg-gold text-dark flex items-center justify-center text-3xl font-serif shadow-2xl shadow-gold/20">
                                                    {userName[0] || "U"}
                                                </div>
                                                <div className="space-y-1">
                                                    <h2 className="text-3xl font-serif text-white uppercase tracking-tight">Profil Public</h2>
                                                    <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Identité & Sécurité</p>
                                                </div>
                                            </div>

                                            <div className="space-y-10 relative z-10">
                                                <div>
                                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Nom Complet</label>
                                                    {isEditingName ? (
                                                        <div className="flex items-center gap-4">
                                                            <input
                                                                type="text"
                                                                value={editNameValue}
                                                                onChange={(e) => setEditNameValue(e.target.value)}
                                                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-sm text-white focus:outline-none focus:border-gold transition-all"
                                                            />
                                                            <button
                                                                onClick={handleSaveProfile}
                                                                disabled={isSavingProfile}
                                                                className="btn-gold px-6 py-3.5 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                                                            >
                                                                Enregistrer
                                                            </button>
                                                            <button
                                                                onClick={() => { setIsEditingName(false); setEditNameValue(userName); }}
                                                                className="px-4 py-3.5 text-[10px] font-black text-white/30 hover:text-white uppercase tracking-widest transition-colors"
                                                            >
                                                                Annuler
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 group/item hover:bg-white/5 transition-colors">
                                                            <span className="text-white font-medium text-lg">{userName}</span>
                                                            <button onClick={() => setIsEditingName(true)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gold hover:bg-gold hover:text-dark transition-all">
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Adresse Email</label>
                                                    <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 opacity-50">
                                                        <span className="text-white/60 font-medium select-all">{userEmail || "Non renseigné"}</span>
                                                        <Shield className="w-4 h-4 text-emerald-500" />
                                                    </div>
                                                    <p className="text-[10px] text-white/20 uppercase tracking-widest mt-4 flex items-center gap-2 italic">
                                                        <Check className="w-3 h-3" /> Votre identité est protégée et vérifiée.
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Authentification</label>
                                                    <div className="inline-flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-3">
                                                        {provider === 'google' ? (
                                                            <><svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" opacity="0.6" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /></svg> <span className="text-xs uppercase font-black text-white/60 tracking-widest italic leading-none">Via Google Infrastructure</span></>
                                                        ) : provider === 'microsoft' ? (
                                                            <><svg className="w-5 h-5" viewBox="0 0 21 21"><path fill="currentColor" d="M0 0h10v10H0z" /><path fill="currentColor" opacity="0.6" d="M11 0h10v10H11z" /></svg> <span className="text-xs uppercase font-black text-white/60 tracking-widest italic leading-none">Via Microsoft Cloud</span></>
                                                        ) : (
                                                            <><Mail className="w-5 h-5 text-white/40" /> <span className="text-xs uppercase font-black text-white/60 tracking-widest italic leading-none">Email & Mot de passe local</span></>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Content - Abo */}
                                    <div className="lg:col-span-1">
                                        <div className={`p-10 rounded-[32px] border relative overflow-hidden ${userRole === 'premium' ? 'bg-[#141822] border-gold/20' : 'bg-[#141822] border-white/5'}`}>
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-[40px] rounded-full pointer-events-none" />

                                            <h3 className="font-serif text-2xl mb-8 relative z-10 text-white uppercase tracking-tight">Privilèges</h3>

                                            {userRole === 'premium' ? (
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-3 mb-10 bg-gold/10 p-4 rounded-2xl border border-gold/20 shadow-lg shadow-gold/10">
                                                        <Star fill="currentColor" className="w-6 h-6 text-gold animate-pulse" />
                                                        <span className="text-gold font-black uppercase text-xs tracking-[0.2em]">AIVANA Premium Actif</span>
                                                    </div>
                                                    <p className="text-xs text-white/50 leading-relaxed font-bold mb-10 tracking-tight">Votre expérience est assistée par une intelligence prioritaire 24/7 avec accès en temps réel aux flux de données mondiaux.</p>
                                                    <ul className="space-y-6 mb-12">
                                                        <li className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/80"><Check className="w-4 h-4 text-emerald-400" /> Flux de prix Live</li>
                                                        <li className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/80"><Check className="w-4 h-4 text-emerald-400" /> Multi-destinations</li>
                                                        <li className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/80"><Check className="w-4 h-4 text-emerald-400" /> Support Conciergerie</li>
                                                    </ul>
                                                    <button className="w-full py-4 rounded-2xl bg-white/5 text-white/40 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/5 active:scale-95">
                                                        Facturation & Factures
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-3 mb-10 bg-white/5 p-4 rounded-2xl border border-white/5">
                                                        <span className="text-white/40 font-black uppercase text-[10px] tracking-widest">Compte Explorateur</span>
                                                    </div>
                                                    <p className="text-xs text-white/40 leading-relaxed font-bold mb-10 tracking-tight">Passez au niveau supérieur pour débloquer toute la puissance de l'IA prédictive et les comparateurs de prix en direct.</p>
                                                    <ul className="space-y-6 mb-12">
                                                        <li className="flex items-center gap-4 text-sm text-white/30"><span className="w-2 h-2 bg-white/10 rounded-full shrink-0" /> Voyages illimités</li>
                                                        <li className="flex items-center gap-4 text-sm text-white/30"><span className="w-2 h-2 bg-white/10 rounded-full shrink-0" /> IA experte active</li>
                                                        <li className="flex items-center gap-4 text-sm text-white/30"><span className="w-2 h-2 bg-white/10 rounded-full shrink-0" /> Alertes prix flash</li>
                                                    </ul>
                                                    <button
                                                        onClick={handleUpgradePremium}
                                                        disabled={isUpgrading}
                                                        className="w-full py-5 rounded-2xl bg-gold text-dark font-black text-xs uppercase tracking-[0.3em] hover:bg-gold-300 shadow-2xl shadow-gold/20 transition-all flex justify-center active:scale-95"
                                                    >
                                                        {isUpgrading ? <div className="w-5 h-5 rounded-full border-2 border-dark/20 border-t-dark animate-spin" /> : "Devenir Premium"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : !selectedTrip ? (
                            <>
                                {/* Welcome */}
                                <div className="mb-12 flex items-end justify-between">
                                    <div className="space-y-1">
                                        <h2 className="text-4xl font-serif text-white">Bonjour, {userName} 👋</h2>
                                        <p className="text-white/40 uppercase text-[10px] font-black tracking-[0.2em]">Prêt pour votre prochaine aventure ?</p>
                                    </div>
                                </div>

                                {trips.length === 0 ? (
                                    /* Empty State */
                                    <div className="bg-[#141822] rounded-[32px] p-12 border border-white/5 text-center mb-10 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-gold/10 transition-colors duration-700" />
                                        <div className="w-24 h-24 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner border border-gold/20">
                                            📬
                                        </div>
                                        <h3 className="text-2xl font-serif text-white mb-4">Créez votre premier voyage</h3>
                                        <p className="text-white/40 text-sm max-w-md mx-auto mb-10 leading-relaxed font-medium">
                                            Connectez votre email ou ajoutez un voyage manuellement pour que l'IA commence à organiser vos escapades.
                                        </p>
                                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                            <button
                                                onClick={handleConnectEmail}
                                                className="btn-gold px-10 py-4 w-full sm:w-auto flex items-center justify-center gap-3 uppercase font-black text-xs tracking-widest shadow-xl shadow-gold/10 active:scale-95 transition-all"
                                            >
                                                {provider === 'google' ? (
                                                    <>
                                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                            <path fill="currentColor" opacity="0.8" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                            <path fill="currentColor" opacity="0.6" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                            <path fill="currentColor" opacity="0.8" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                        </svg>
                                                        Connecter Gmail
                                                    </>
                                                ) : provider === 'microsoft' ? (
                                                    <>
                                                        <svg className="w-5 h-5" viewBox="0 0 21 21">
                                                            <path fill="currentColor" d="M0 0h10v10H0z" />
                                                            <path fill="currentColor" d="M11 0h10v10H11z" />
                                                            <path fill="currentColor" d="M0 11h10v10H0z" />
                                                            <path fill="currentColor" d="M11 11h10v10H11z" />
                                                        </svg>
                                                        Connecter Outlook
                                                    </>
                                                ) : (
                                                    "Connecter mon email"
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setShowCreateModal(true)}
                                                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-all transform hover:translate-x-1"
                                            >
                                                <Plus className="w-5 h-5 text-gold" /> Ajouter manuellement
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Trips List */
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                                        {trips.map((trip, i) => (
                                            <motion.div
                                                key={trip.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                onClick={() => handleSelectTrip(trip)}
                                                className="group cursor-pointer bg-[#141822] rounded-[28px] border border-white/5 overflow-hidden hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/5 transition-all duration-500"
                                            >
                                                <div className="h-40 bg-[#0A0D14] relative overflow-hidden">
                                                    {trip.img ? (
                                                        <img src={trip.img} alt={trip.title} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" />
                                                    ) : (
                                                        <div className="absolute inset-0 bg-gradient-to-br from-[#141822] to-[#0A0D14] opacity-80" />
                                                    )}

                                                    {/* Gradient overlay for text readability */}
                                                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#141822] to-transparent z-10" />

                                                    <div className="absolute top-4 right-4 flex gap-2 z-20">
                                                        <button
                                                            onClick={(e) => handleDeleteTrip(trip.id, e)}
                                                            className="w-9 h-9 rounded-xl bg-black/40 hover:bg-red-500/80 text-white/60 hover:text-white backdrop-blur-md flex items-center justify-center transition-all duration-300 border border-white/10"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <div className="absolute bottom-4 left-6 z-20 transition-transform duration-500 group-hover:translate-y--1">
                                                        <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-1 block drop-shadow-md">
                                                            {trip.status === 'planned' ? 'Plannifié' : trip.status}
                                                        </span>
                                                        <h3 className="text-xl font-serif text-white leading-tight drop-shadow-lg">{trip.title}</h3>
                                                    </div>
                                                </div>
                                                <div className="p-6 relative">
                                                    <div className="flex items-center justify-between text-white/40 text-[10px] uppercase font-black tracking-widest mb-6">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-3.5 h-3.5 text-gold/60" />
                                                            <span>{trip.destination_name || "À définir"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-3.5 h-3.5 text-gold/60" />
                                                            <span>{trip.start_date ? new Date(trip.start_date).toLocaleDateString() : "Bientôt"}</span>
                                                        </div>
                                                    </div>
                                                    <button className="w-full py-3.5 rounded-2xl border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/60 group-hover:bg-gold group-hover:text-dark group-hover:border-gold transition-all duration-500 flex items-center justify-center gap-2">
                                                        Détails du voyage <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {/* Add card */}
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="h-full min-h-[280px] border-2 border-dashed border-white/10 rounded-[28px] flex flex-col items-center justify-center text-white/20 hover:text-gold hover:border-gold/40 hover:bg-gold/5 transition-all duration-500 group"
                                        >
                                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-gold/10 transition-all border border-white/5 group-hover:border-gold/20">
                                                <Plus className="w-8 h-8" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Nouveau Voyage</span>
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Trip Details View */
                            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <button
                                    onClick={() => setSelectedTrip(null)}
                                    className="flex items-center gap-3 text-[10px] font-black text-white/40 hover:text-gold transition-all mb-8 uppercase tracking-[0.2em] group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-gold/30">
                                        <ChevronRight className="w-4 h-4 rotate-180" />
                                    </div>
                                    Retour au Dashboard
                                </button>

                                {/* Dashboard Intelligent : En-tête Global */}
                                {analysis && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-[#141822] rounded-[32px] border border-white/5 p-8 mb-10 flex flex-col md:flex-row gap-10 items-stretch shadow-2xl relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

                                        {/* Score Scoreboard */}
                                        <div className="flex-shrink-0 flex flex-col items-center justify-center p-8 bg-[#0A0D14]/50 rounded-3xl border border-white/5 min-w-[220px] relative z-10">
                                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-6">Score Voyage</span>
                                            <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/5" strokeWidth="3"></circle>
                                                    <circle cx="18" cy="18" r="16" fill="none" className={analysis.score >= 80 ? 'stroke-emerald-500' : analysis.score >= 50 ? 'stroke-gold' : 'stroke-orange-500'} strokeWidth="3" strokeDasharray="100" strokeDashoffset={100 - analysis.score} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}></circle>
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                    <span className="text-3xl font-serif text-white leading-none">{analysis.score}</span>
                                                    <span className="text-[10px] text-white/30 font-black uppercase mt-1">/ 100</span>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest text-center px-4 py-1.5 rounded-full border ${analysis.score >= 80 ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : analysis.score >= 50 ? 'border-gold/20 text-gold bg-gold/5' : 'border-orange-500/20 text-orange-400 bg-orange-500/5'}`}>
                                                {analysis.score >= 80 ? "Optimisé" : analysis.score >= 50 ? "En progrès" : "Aiguillage requis"}
                                            </span>
                                        </div>

                                        {/* Budget Tracking */}
                                        <div className="flex-1 flex flex-col justify-center relative z-10">
                                            <div className="flex justify-between items-end mb-6">
                                                <div>
                                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-2">Budget Estimé</span>
                                                    <div className="flex items-baseline gap-3">
                                                        <span className="text-5xl font-serif text-white">{analysis.budget.used}€</span>
                                                        <span className="text-sm text-white/30 font-medium">/ {analysis.budget.total > 0 ? `${analysis.budget.total}€` : 'Non défini'}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-lg font-black tracking-tighter ${analysis.budget.percentage > 100 ? 'text-red-400' : 'text-gold'}`}>
                                                        {analysis.budget.percentage}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-10">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(analysis.budget.percentage, 100)}%` }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    className={`h-full ${analysis.budget.percentage > 100 ? 'bg-red-400' : 'bg-gold shadow-[0_0_15px_rgba(201,168,76,0.3)]'}`}
                                                />
                                            </div>

                                            {/* Quick metrics row */}
                                            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-black">Réservations</p>
                                                    <p className="text-xl font-serif text-white">{bookings.length}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-black">Hébergement</p>
                                                    <div className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                                        {analysis.coverage.missingHotelNights === 0 ? <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Complet</span> :
                                                            analysis.coverage.missingHotelNights > 0 ? <span className="text-orange-400">{analysis.coverage.missingHotelNights} nuits</span> :
                                                                <span className="text-white/20">—</span>}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-black">Activités</p>
                                                    <div className="text-sm font-black uppercase tracking-widest">{analysis.coverage.hasActivity ? <span className="text-emerald-400">Prévues</span> : <span className="text-orange-400">À prévoir</span>}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <div className="flex flex-col lg:flex-row gap-10">
                                    <div className="flex-1">
                                        <div className="bg-[#141822] rounded-[32px] border border-white/5 p-8 mb-10 overflow-hidden relative">
                                            <div className="flex items-center justify-between mb-10 relative z-10">
                                                <h3 className="text-2xl font-serif text-white">Itinéraire détaillé</h3>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={downloadICS}
                                                        disabled={bookings.length === 0}
                                                        className="flex items-center gap-2 bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-white/10 transition-all border border-white/5 disabled:opacity-30"
                                                    >
                                                        <Calendar className="w-4 h-4 text-gold" /> Export iCal
                                                    </button>
                                                    <button
                                                        onClick={() => setShowBookingModal(true)}
                                                        className="flex items-center gap-2 bg-gold text-dark text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-gold-300 transition-all shadow-lg shadow-gold/10"
                                                    >
                                                        <Plus className="w-4 h-4" /> Ajouter
                                                    </button>
                                                </div>
                                            </div>

                                            {bookings.length === 0 ? (
                                                <div className="py-20 text-center relative z-10">
                                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/5 text-3xl">🗓️</div>
                                                    <p className="text-white/30 text-xs font-black uppercase tracking-widest">Aucune réservation pour ce voyage</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-8 relative z-10">
                                                    {bookings.map((b, index) => (
                                                        <motion.div
                                                            key={b.id}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.1, duration: 0.5 }}
                                                            className="flex gap-8 relative group"
                                                        >
                                                            {/* Vertical Timeline Line */}
                                                            {index !== bookings.length - 1 && (
                                                                <div className="absolute left-[23px] top-16 bottom-[-2rem] w-[2px] bg-gradient-to-b from-white/10 to-transparent z-0 group-hover:from-gold/40 transition-all duration-700"></div>
                                                            )}

                                                            <div className="w-12 h-12 bg-[#0A0D14] rounded-xl flex items-center justify-center flex-shrink-0 relative z-10 text-xl shadow-2xl border border-white/10 group-hover:border-gold/50 group-hover:scale-110 transition-all duration-500">
                                                                {b.type === 'flight' ? '✈️' : b.type === 'hotel' ? '🏨' : b.type === 'transport' ? '🚆' : '🎒'}
                                                            </div>
                                                            <div className="flex-1 pt-1 pb-6 border-b border-white/5 group-last:border-0">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div className="flex items-center gap-4 flex-wrap">
                                                                        <h4 className="font-serif text-lg text-white leading-none">{b.title}</h4>
                                                                        {(b.booking_url || (b.external_reference && b.external_reference.startsWith('WIKI')) || (b.raw_data && Object.keys(b.raw_data).length > 2)) && (
                                                                            <span className="bg-gold/10 text-gold border border-gold/20 text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                                                                                <span className="w-1 h-1 bg-gold rounded-full animate-pulse"></span> IA Vérifiée
                                                                            </span>
                                                                        )}
                                                                        {b.status === 'pending' && <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">En attente</span>}
                                                                        {b.status === 'confirmed' && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Confirmé</span>}
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleDeleteBooking(b.id)}
                                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all transition-colors"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>

                                                                <div className="flex items-center gap-3 mb-4 mt-2">
                                                                    <span className="text-[10px] font-black text-white/60 bg-white/5 px-2 py-1 rounded-md border border-white/5 uppercase tracking-widest">{b.provider || "Prestataire"}</span>
                                                                    <span className="text-xs text-white/20">•</span>
                                                                    <span className="text-xs text-gold font-bold tracking-tight">{b.price ? `${b.price} €` : '—'}</span>
                                                                </div>

                                                                {/* Displaying Extracted Intelligence from raw_data */}
                                                                {(b.raw_data || b.location) && (
                                                                    <div className="bg-white/[0.02] rounded-[20px] p-5 mb-5 border border-white/5 relative overflow-hidden group-hover:bg-white/[0.04] transition-colors">
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 relative z-10">
                                                                            {b.location && <p className="text-xs text-white/50 flex flex-col gap-1"><span className="text-white/20 font-black uppercase text-[8px] tracking-[0.2em]">Localisation</span> {b.location}</p>}
                                                                            {b.raw_data && b.raw_data.flight_number && <p className="text-xs text-white/50 flex flex-col gap-1"><span className="text-white/20 font-black uppercase text-[8px] tracking-[0.2em]">Numéro de Vol</span> {b.raw_data.flight_number} {b.raw_data.cabin_class && `(${b.raw_data.cabin_class})`}</p>}
                                                                            {b.raw_data && b.raw_data.address && <p className="text-xs text-white/50 flex flex-col gap-1"><span className="text-white/20 font-black uppercase text-[8px] tracking-[0.2em]">Adresse physique</span> {b.raw_data.address}</p>}
                                                                            {b.raw_data && b.raw_data.meeting_point && <p className="text-xs text-white/50 flex flex-col gap-1"><span className="text-white/20 font-black uppercase text-[8px] tracking-[0.2em]">Point de rendez-vous</span> {b.raw_data.meeting_point}</p>}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div className="flex flex-wrap items-center gap-4 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                                                                    <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                                                        <Clock className="w-3 h-3 text-gold/60" /> {b.start_datetime ? new Date(b.start_datetime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Date à définir'}
                                                                    </span>
                                                                    {b.end_datetime && (
                                                                        <>
                                                                            <ChevronRight className="w-3 h-3 text-white/10" />
                                                                            <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                                                                {new Date(b.end_datetime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="lg:w-80 flex-shrink-0">
                                        <div className="bg-[#141822] rounded-[32px] p-8 border border-white/5 text-white sticky top-28 overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-[50px] rounded-full pointer-events-none" />
                                            <h4 className="font-serif text-2xl mb-8 relative z-10">IA AIVANA</h4>

                                            <div className="relative z-10 space-y-6">
                                                {analysis && analysis.warnings.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {analysis.warnings.map((warn, i) => (
                                                            <div key={i} className="flex items-start gap-3 bg-white/[0.02] p-5 rounded-2xl border border-white/5 group hover:bg-white/5 transition-colors">
                                                                <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center shrink-0 border border-gold/20">
                                                                    <span className="text-gold text-xs leading-none">💡</span>
                                                                </div>
                                                                <p className="text-xs text-white/50 leading-relaxed font-bold tracking-tight">{warn}</p>
                                                            </div>
                                                        ))}
                                                        <Link href="/chat" className="btn-gold w-full flex items-center justify-center gap-3 py-4 mt-6 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-gold/20 active:scale-95 transition-all">
                                                            <Sparkles className="w-4 h-4" /> Optimiser mon voyage
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                                                            <Check className="w-8 h-8 text-emerald-400" />
                                                        </div>
                                                        <p className="text-white text-sm font-medium leading-relaxed mb-10">Itinéraire parfait. Aucune anomalie détectée par l'IA.</p>
                                                        <Link href="/chat" className="w-full py-3.5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/5 hover:text-white transition-all">
                                                            Parler avec AIVANA
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        )}
                    </div>
                </div >
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#0A0D14]/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-6 lg:hidden z-40">
                <button onClick={() => { setSelectedTrip(null); setShowSettings(false); }} className={`flex flex-col items-center gap-1.5 transition-all ${!selectedTrip && !showSettings ? "text-gold translate-y-[-4px]" : "text-white/30 hover:text-white/60"}`}>
                    <div className={`p-2 rounded-xl transition-all ${!selectedTrip && !showSettings ? "bg-gold/10" : ""}`}>
                        <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
                </button>
                <button onClick={() => { setShowSettings(false); }} className={`flex flex-col items-center gap-1.5 transition-all ${selectedTrip && !showSettings ? "text-gold translate-y-[-4px]" : "text-white/30 hover:text-white/60"}`}>
                    <div className={`p-2 rounded-xl transition-all ${selectedTrip && !showSettings ? "bg-gold/10" : ""}`}>
                        <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Trips</span>
                </button>
                <button onClick={() => { setSelectedTrip(null); setShowSettings(true); }} className={`flex flex-col items-center gap-1.5 transition-all ${showSettings ? "text-gold translate-y-[-4px]" : "text-white/30 hover:text-white/60"}`}>
                    <div className={`p-2 rounded-xl transition-all ${showSettings ? "bg-gold/10" : ""}`}>
                        <Settings className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>
                </button>
                <button onClick={() => { localStorage.removeItem("token"); router.push("/"); }} className="flex flex-col items-center gap-1.5 text-white/30 hover:text-red-500 transition-colors">
                    <div className="p-2">
                        <LogOut className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Exit</span>
                </button>
            </nav>

            {/* Create Trip Modal */}
            {
                showCreateModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#0A0D14]/90 backdrop-blur-xl">
                        <div className="absolute inset-0" onClick={() => setShowCreateModal(false)} />
                        <div className="relative bg-[#141822] w-full max-w-md rounded-[32px] p-10 shadow-2xl border border-white/5 animate-in zoom-in-95 duration-300">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-[40px] rounded-full pointer-events-none" />

                            <div className="space-y-1 mb-8">
                                <h3 className="text-3xl font-serif text-white uppercase tracking-tight">Nouveau Voyage</h3>
                                <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">Donner un titre à l'aventure</p>
                            </div>

                            <form onSubmit={handleCreateTrip} className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Nom du voyage</label>
                                    <input
                                        type="text"
                                        autoFocus
                                        required
                                        value={newTripTitle}
                                        onChange={(e) => setNewTripTitle(e.target.value)}
                                        placeholder="ex: Roadtrip Italie 2024"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-gold transition-all"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 py-4 text-[10px] font-black text-white/30 hover:text-white uppercase tracking-widest transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] btn-gold py-4 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-gold/10 active:scale-95 transition-all"
                                    >
                                        Créer le voyage
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Create Booking Modal (Shopping Mode) */}
            {
                showBookingModal && selectedTrip && (
                    <BookingShoppingModal
                        tripId={selectedTrip.id}
                        onClose={() => setShowBookingModal(false)}
                        onAddBooking={handleAddBooking}
                    />
                )
            }

            {/* Select Sync Provider Modal (For Local Users) */}
            {showSyncOptions && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#0A0D14]/90 backdrop-blur-xl">
                    <div className="absolute inset-0" onClick={() => setShowSyncOptions(false)} />
                    <div className="relative bg-[#141822] w-full max-w-sm rounded-[32px] p-10 shadow-2xl border border-white/5 animate-in zoom-in-95 duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-[40px] rounded-full pointer-events-none" />

                        <div className="space-y-1 mb-8 text-center">
                            <h3 className="text-2xl font-serif text-white uppercase tracking-tight">Connecter Email</h3>
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] leading-relaxed">Activez la synchronisation IA pour importer vos réservations</p>
                        </div>

                        <div className="space-y-4">
                            <a href="https://api-gateway-v0vr.onrender.com/api/auth/google/sync"
                                className="w-full flex items-center justify-center gap-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all group">
                                <svg className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                </svg>
                                Via Google Cloud
                            </a>

                            <a href="https://api-gateway-v0vr.onrender.com/api/auth/microsoft"
                                className="w-full flex items-center justify-center gap-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all group">
                                <svg className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" viewBox="0 0 21 21">
                                    <path fill="currentColor" d="M0 0h10v10H0z" /><path fill="currentColor" opacity="0.6" d="M11 0h10v10H11z" />
                                </svg>
                                Via Microsoft AI
                            </a>
                        </div>

                        <button onClick={() => setShowSyncOptions(false)} className="w-full mt-10 py-2 text-[10px] font-black text-white/20 hover:text-white/40 uppercase tracking-widest transition-colors">Fermer la fenêtre</button>
                    </div>
                </div>
            )}
        </div >
    );
}
