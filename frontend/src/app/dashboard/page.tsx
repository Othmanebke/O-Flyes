"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Calendar, Mail, Settings, LogOut, ChevronRight, MapPin, Clock, Trash2, Edit2, Shield, Check, Sparkles, Folder, FileText, AlertCircle, Plane, X, Plus } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import BookingShoppingModal, { BookingData } from "@/components/shopping/BookingShoppingModal";
import TripProposal from "@/components/TripProposal";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/browser";
import TripBudgetPanel from "@/components/TripBudgetPanel";

interface Trip {
    id: string;
    title: string;
    destination_name?: string;
    country?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
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
    price_estimate?: number;
    currency?: string;
    location?: string;
    status?: string;
    external_reference?: string;
    external_url?: string;
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

    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [analysis, setAnalysis] = useState<TripAnalysis | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'proposal' | 'documents'>('overview');

    const [emailConnected, setEmailConnected] = useState(false);
    const [provider, setProvider] = useState<string>("local");

    const [showSettings, setShowSettings] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [userRole, setUserRole] = useState("explorer");
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);

    const [phoneValue, setPhoneValue] = useState("");
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [isSavingPhone, setIsSavingPhone] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient();
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error || !session) {
                console.error("No active session", error);
                router.push("/auth/login");
                return;
            }

            const user = session.user;
            setUserId(user.id);
            setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || "Voyageur");
            setUserEmail(user.email || "");
            setEditNameValue(user.user_metadata?.full_name || user.email?.split('@')[0] || "Voyageur");
            setPhoneValue(user.user_metadata?.phone || "");

            // App metadata sometimes contains provider
            const providerStr = user.app_metadata?.provider || 'local';
            setProvider(providerStr);

            fetchTrips();
            checkEmailSync(user.id);
        };
        checkUser();
    }, [router]);

    const checkEmailSync = async (uid: string) => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase.from('email_connections').select('id').eq('user_id', uid);
            if (!error && data) {
                setEmailConnected(data.length > 0);
            }
        } catch (err) {
            console.error("Failed to check email sync", err);
        }
    };


    const fetchTrips = async () => {
        try {
            const res = await axios.get(`/api/trips`);
            setTrips(res.data || []);
        } catch (err) {
            console.error("Failed to fetch trips", err);
        } finally {
            setLoading(false);
        }
    };

    // Refresh trips when chatbot saves a new destination
    useEffect(() => {
        const handleTripSaved = () => {
            fetchTrips();
            showNotification("Voyage enregistré dans votre dashboard !");
        };
        window.addEventListener("trip-saved", handleTripSaved);
        return () => window.removeEventListener("trip-saved", handleTripSaved);
    }, []);

    // Supabase Realtime — sync trips instantly from any source
    useEffect(() => {
        if (!userId) return;
        const supabase = createClient();
        const channel = supabase
            .channel(`trips-realtime-${userId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'trips',
                filter: `user_id=eq.${userId}`,
            }, () => {
                fetchTrips();
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [userId]);

    // Refresh bookings when explore pages add a booking
    useEffect(() => {
        const handleBookingsUpdated = (e: Event) => {
            const { tripId } = (e as CustomEvent).detail || {};
            if (selectedTrip && tripId === selectedTrip.id) {
                fetchBookings(selectedTrip.id);
            }
        };
        window.addEventListener("bookings-updated", handleBookingsUpdated);
        return () => window.removeEventListener("bookings-updated", handleBookingsUpdated);
    }, [selectedTrip]);

    const fetchBookings = async (tripId: string) => {
        try {
            const res = await axios.get(`/api/trips/${tripId}/items`);
            const items: Booking[] = res.data || [];
            setBookings(items);
            calculateAnalysis(items);
        } catch (err) {
            console.error("Failed to fetch bookings", err);
        }
    };

    const calculateAnalysis = (items: Booking[]) => {
        const flights = items.filter(b => b.type === 'flight');
        const hotels = items.filter(b => b.type === 'hotel');
        const activities = items.filter(b => b.type === 'activity');
        const totalCost = items.reduce((sum, b) => sum + (b.price_estimate || 0), 0);
        const hasOutbound = flights.length > 0;
        const hasReturn = flights.length >= 2;
        const hasHotel = hotels.length > 0;
        const hasActivity = activities.length > 0;
        let score = 0;
        if (hasOutbound) score += 30;
        if (hasReturn) score += 20;
        if (hasHotel) score += 30;
        if (hasActivity) score += 20;
        const warnings: string[] = [];
        if (!hasOutbound) warnings.push("Aucun vol aller réservé");
        else if (!hasReturn) warnings.push("Vol retour manquant");
        if (!hasHotel) warnings.push("Hébergement non réservé");
        if (!hasActivity) warnings.push("Aucune activité planifiée");
        setAnalysis({
            budget: { total: 0, used: totalCost, percentage: totalCost > 0 ? 100 : 0 },
            coverage: { missingHotelNights: hasHotel ? 0 : 1, missingOutboundFlight: !hasOutbound, missingReturnFlight: !hasReturn, emptyDays: [], hasActivity },
            warnings,
            score,
        });
    };

    const handleSaveProfile = async () => {
        if (!userId || !editNameValue.trim()) return;
        setIsSavingProfile(true);
        try {
            const supabase = createClient();
            await supabase.auth.updateUser({ data: { full_name: editNameValue } });
            setUserName(editNameValue);
            setIsEditingName(false);
            showNotification("Profil mis à jour !");
        } catch (err) {
            console.error("Failed to save profile", err);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const showNotification = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 5000);
    };

    const handleSavePhone = async () => {
        if (!userId || !phoneValue.trim()) return;
        setIsSavingPhone(true);
        try {
            const supabase = createClient();
            await supabase.auth.updateUser({ data: { phone: phoneValue.trim() } });
            setIsEditingPhone(false);
        } catch (err) {
            console.error("Failed to save phone", err);
        } finally {
            setIsSavingPhone(false);
        }
    };

    const handleUpgradePremium = async () => {
        if (!userId) return;
        setIsUpgrading(true);
        // Mock premium upgrade locally
        setTimeout(() => {
            setUserRole('premium');
            setIsUpgrading(false);
        }, 1500);
    };

    const handleDeleteTrip = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Supprimer ce voyage ?")) return;
        try {
            await axios.delete(`/api/trips/${id}`);
            fetchTrips();
            if (selectedTrip?.id === id) setSelectedTrip(null);
        } catch (err) {
            console.error("Failed to delete trip", err);
        }
    };

    const handleSelectTrip = (trip: Trip) => {
        setSelectedTrip(trip);
        fetchBookings(trip.id);
    };

    const handleAddBooking = async (bookingData: BookingData) => {
        if (!selectedTrip) return;

        try {
            await axios.post(`/api/trips/${selectedTrip.id}/items`, {
                title: bookingData.title,
                type: bookingData.type,
                provider: bookingData.provider,
                price_estimate: bookingData.price,
                external_url: bookingData.booking_url || bookingData.external_url
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
            if (!selectedTrip) return;
            await axios.delete(`/api/trips/${selectedTrip.id}/items/${id}`);
            fetchBookings(selectedTrip.id);
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
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="w-8 h-8 rounded-full border-t-2 border-r-2 animate-spin" style={{ borderColor: 'var(--text-primary)' }}></div>
                <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Initialisation de l'espace de travail...</p>
            </div>
        );
    }

    return (
        <div className="flex font-sans min-h-[calc(100vh-80px)] relative" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Sidebar */}
            <aside className="w-64 hidden md:flex flex-col sticky top-20 h-[calc(100vh-80px)]" style={{ backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-light)' }}>


                <nav className="flex-1 px-4 space-y-1">
                    {[
                        {
                            icon: Calendar,
                            label: "Mes Voyages",
                            active: !showSettings,
                            onClick: () => { setSelectedTrip(null); setShowSettings(false); }
                        },
                        {
                            icon: Settings,
                            label: "Paramètres",
                            active: showSettings,
                            onClick: () => { setSelectedTrip(null); setShowSettings(true); }
                        },
                    ].map((item) => (
                        <button
                            key={item.label}
                            onClick={item.onClick}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${item.active ? "font-medium shadow-sm" : ""}`}
                            style={item.active ? { backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' } : { color: 'var(--text-muted)' }}
                        >
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                    {emailConnected && (
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm" style={{ color: 'var(--text-muted)' }}>
                            <Mail className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 text-xs font-medium">Email synchronisé</span>
                        </div>
                    )}
                </nav>

                <div className="p-4" style={{ borderTop: '1px solid var(--border-light)' }}>
                    <button
                        onClick={async () => {
                            const supabase = createClient();
                            await supabase.auth.signOut();
                            router.push("/");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors text-sm"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative min-h-[calc(100vh-80px)]" style={{ backgroundColor: 'var(--bg-primary)' }}>
                {/* Subtle top gradient */}
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-gold/[0.02] to-transparent pointer-events-none z-0" />

                {/* Header */}
                <header className="h-16 px-8 flex items-center justify-between z-10 backdrop-blur-md" style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <div className="flex items-center gap-4">
                        <h1 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {showSettings ? "Paramètres du compte" : (selectedTrip ? selectedTrip.title : "Vue Générale")}
                        </h1>
                        {/* Breadcrumb style path for trips */}
                        {selectedTrip && (
                            <>
                                <ChevronRight className="w-4 h-4 text-zinc-700" />
                                <span className="text-sm capitalize" style={{ color: 'var(--text-muted)' }}>{activeTab === 'overview' ? 'Aperçu' : activeTab === 'itinerary' ? 'Itinéraire' : activeTab === 'proposal' ? 'Proposition IA' : 'Documents'}</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {emailConnected && (
                            <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span className="text-[10px] font-medium text-emerald-400">Email Sync</span>
                            </div>
                        )}
                        <div className="h-4 w-px bg-white/10 mx-2 hidden sm:block" />
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{userName}</p>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                {userRole === 'premium' ?
                                    <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-white" /> Pro</span>
                                    : "Basic"}
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                            {userName[0]?.toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Scrollable Area */}
                <div className="flex-1 p-4 md:p-8 z-10">
                    <div className="max-w-6xl mx-auto">
                        {showSettings ? (
                            /* Settings View */
                            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Left Content - Profil */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="rounded-2xl p-8 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
                                            <div className="flex items-center gap-6 mb-8 relative z-10">
                                                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center text-3xl font-medium">
                                                    {userName[0]?.toUpperCase() || "U"}
                                                </div>
                                                <div className="space-y-1">
                                                    <h2 className="text-xl font-medium tracking-tight" style={{ color: 'var(--text-primary)' }}>Profil Public</h2>
                                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Gérez vos informations personnelles et préférences.</p>
                                                </div>
                                            </div>

                                            <div className="space-y-8 relative z-10">
                                                <div className="space-y-3">
                                                    <label className="block text-xs font-medium text-zinc-400">Nom Complet</label>
                                                    {isEditingName ? (
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="text"
                                                                value={editNameValue}
                                                                onChange={(e) => setEditNameValue(e.target.value)}
                                                                className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                                            />
                                                            <button
                                                                onClick={handleSaveProfile}
                                                                disabled={isSavingProfile}
                                                                className="px-4 py-2.5 bg-white text-zinc-950 text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors"
                                                            >
                                                                Sauvegarder
                                                            </button>
                                                            <button
                                                                onClick={() => { setIsEditingName(false); setEditNameValue(userName); }}
                                                                className="px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                                                            >
                                                                Annuler
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-3 group/item hover:bg-white/[0.04] transition-colors">
                                                            <span className="text-white text-sm">{userName}</span>
                                                            <button onClick={() => setIsEditingName(true)} className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-all">
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="block text-xs font-medium text-zinc-400">Adresse Email</label>
                                                    <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-3 opacity-70">
                                                        <span className="text-zinc-300 text-sm">{userEmail || "Non renseigné"}</span>
                                                        <Shield className="w-4 h-4 text-emerald-500" />
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="block text-xs font-medium text-zinc-400">
                                                        Téléphone <span className="text-zinc-600 font-normal">(notifications SMS)</span>
                                                    </label>
                                                    {isEditingPhone ? (
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="tel"
                                                                value={phoneValue}
                                                                onChange={(e) => setPhoneValue(e.target.value)}
                                                                placeholder="+33612345678"
                                                                className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                                            />
                                                            <button
                                                                onClick={handleSavePhone}
                                                                disabled={isSavingPhone}
                                                                className="px-4 py-2.5 bg-white text-zinc-950 text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                                            >
                                                                {isSavingPhone ? "..." : "Sauvegarder"}
                                                            </button>
                                                            <button
                                                                onClick={() => setIsEditingPhone(false)}
                                                                className="px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                                                            >
                                                                Annuler
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-3 group/item hover:bg-white/[0.04] transition-colors">
                                                            <span className="text-sm">
                                                                {phoneValue
                                                                    ? <span className="text-white">{phoneValue}</span>
                                                                    : <span className="text-zinc-600">Non renseigné — ajoutez un numéro pour recevoir les SMS</span>
                                                                }
                                                            </span>
                                                            <button onClick={() => setIsEditingPhone(true)} className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-all">
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="block text-xs font-medium text-zinc-400">Authentification</label>
                                                    <div className="inline-flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-2.5">
                                                        {provider === 'google' ? (
                                                            <><svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" opacity="0.6" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /></svg> <span className="text-xs font-medium text-zinc-400">Google Cloud</span></>
                                                        ) : provider === 'microsoft' ? (
                                                            <><svg className="w-4 h-4" viewBox="0 0 21 21"><path fill="currentColor" d="M0 0h10v10H0z" /><path fill="currentColor" opacity="0.6" d="M11 0h10v10H11z" /></svg> <span className="text-xs font-medium text-zinc-400">Microsoft Cloud</span></>
                                                        ) : (
                                                            <><Mail className="w-4 h-4 text-zinc-500" /> <span className="text-xs font-medium text-zinc-400">Email & Mot de passe</span></>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Content - Abo */}
                                    <div className="lg:col-span-1">
                                        <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/[0.04]">
                                            <h3 className="font-medium text-lg mb-6 text-white">Privilèges</h3>

                                            {userRole === 'premium' ? (
                                                <div>
                                                    <div className="flex items-center gap-3 mb-6 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                                                        <Sparkles className="w-4 h-4 text-emerald-400" />
                                                        <span className="text-emerald-400 font-medium text-sm">AIVANA Pro Actif</span>
                                                    </div>
                                                    <p className="text-sm text-zinc-400 leading-relaxed mb-6">Assistance experte 24/7 avec accès en temps réel aux données mondiales.</p>
                                                    <ul className="space-y-4 mb-8">
                                                        <li className="flex items-center gap-3 text-sm text-zinc-300"><Check className="w-4 h-4 text-emerald-400" /> Flux de prix Live</li>
                                                        <li className="flex items-center gap-3 text-sm text-zinc-300"><Check className="w-4 h-4 text-emerald-400" /> Multi-destinations</li>
                                                        <li className="flex items-center gap-3 text-sm text-zinc-300"><Check className="w-4 h-4 text-emerald-400" /> Conciergerie</li>
                                                    </ul>
                                                    <button className="w-full py-2.5 rounded-lg bg-white/5 text-zinc-300 font-medium text-sm hover:bg-white/10 transition-colors">
                                                        Gérer l'abonnement
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="flex items-center gap-3 mb-6 bg-white/5 p-3 rounded-lg border border-white/10">
                                                        <span className="text-zinc-400 font-medium text-sm">Plan Basic</span>
                                                    </div>
                                                    <p className="text-sm text-zinc-400 leading-relaxed mb-6">Débloquez l'IA prédictive et les comparateurs de prix en direct.</p>
                                                    <ul className="space-y-4 mb-8">
                                                        <li className="flex items-center gap-3 text-sm text-zinc-400"><span className="w-1.5 h-1.5 bg-zinc-600 rounded-full shrink-0" /> Voyages illimités</li>
                                                        <li className="flex items-center gap-3 text-sm text-zinc-400"><span className="w-1.5 h-1.5 bg-zinc-600 rounded-full shrink-0" /> IA experte active</li>
                                                        <li className="flex items-center gap-3 text-sm text-zinc-400"><span className="w-1.5 h-1.5 bg-zinc-600 rounded-full shrink-0" /> Alertes prix flash</li>
                                                    </ul>
                                                    <button
                                                        onClick={handleUpgradePremium}
                                                        disabled={isUpgrading}
                                                        className="w-full py-2.5 rounded-lg bg-white text-zinc-950 font-medium text-sm hover:bg-zinc-200 transition-colors flex justify-center items-center"
                                                    >
                                                        {isUpgrading ? <div className="w-4 h-4 rounded-full border-2 border-zinc-900/20 border-t-zinc-900 animate-spin" /> : "Passer à AIVANA Pro"}
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
                                        <h2 className="text-4xl font-serif" style={{ color: 'var(--text-primary)' }}>Bonjour, {userName} 👋</h2>
                                        <p className="uppercase text-[10px] font-black tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Prêt pour votre prochaine aventure ?</p>
                                    </div>
                                </div>

                                {trips.length === 0 ? (
                                    <div className="rounded-2xl p-12 text-center mb-10 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
                                        <div className="w-20 h-20 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm border border-gold/20">
                                            ✈️
                                        </div>
                                        <h3 className="text-xl font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Aucun voyage enregistré</h3>
                                        <p className="text-sm max-w-md mx-auto leading-relaxed font-normal" style={{ color: 'var(--text-secondary)' }}>
                                            Ouvrez l&apos;assistant AIVANA (la bulle dorée en bas à droite), décrivez votre prochaine envie de voyage, et enregistrez l&apos;itinéraire généré ici en un clic.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                                        {trips.map((trip, i) => {
                                            const gradients = [
                                                "from-indigo-900/80 via-purple-900/60 to-zinc-900",
                                                "from-emerald-900/80 via-teal-900/60 to-zinc-900",
                                                "from-amber-900/80 via-orange-900/60 to-zinc-900",
                                                "from-rose-900/80 via-pink-900/60 to-zinc-900",
                                                "from-sky-900/80 via-blue-900/60 to-zinc-900",
                                                "from-violet-900/80 via-fuchsia-900/60 to-zinc-900",
                                            ];
                                            const grad = gradients[i % gradients.length];
                                            return (
                                            <motion.div
                                                key={trip.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.08 }}
                                                onClick={() => handleSelectTrip(trip)}
                                                className="group cursor-pointer rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-black/40 transition-all duration-300"
                                                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
                                            >
                                                <div className="h-40 relative overflow-hidden">
                                                    {trip.img ? (
                                                        <img src={trip.img} alt={trip.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" />
                                                    ) : (
                                                        <div className={`absolute inset-0 bg-gradient-to-br ${grad} group-hover:opacity-90 transition-opacity`}>
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-10 text-[80px] font-black select-none">
                                                                {trip.title[0]?.toUpperCase()}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Gradient overlay for text readability */}
                                                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-zinc-900 to-transparent z-10" />

                                                    <div className="absolute top-3 right-3 flex gap-2 z-20">
                                                        <button
                                                            onClick={(e) => handleDeleteTrip(trip.id, e)}
                                                            className="w-8 h-8 rounded-lg bg-black/40 hover:bg-red-500/90 text-zinc-300 hover:text-white backdrop-blur-md flex items-center justify-center transition-all border border-white/10"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <div className="absolute bottom-4 left-5 z-20 transition-transform duration-300 group-hover:-translate-y-1">
                                                        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1 block">
                                                            Planifié
                                                        </span>
                                                        <h3 className="text-lg font-medium text-white leading-tight drop-shadow-md">{trip.title}</h3>
                                                    </div>
                                                </div>
                                                <div className="p-5 flex flex-col gap-4">
                                                    <div className="flex items-center justify-between text-zinc-400 text-xs font-medium border-b border-white/[0.04] pb-4">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                                                            <span>{trip.destination_name || "À définir"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-3.5 h-3.5 text-zinc-500" />
                                                            <span>{trip.start_date ? new Date(trip.start_date).toLocaleDateString() : "Bientôt"}</span>
                                                        </div>
                                                    </div>
                                                    <button className="w-full py-2.5 rounded-lg bg-zinc-800 text-sm font-medium text-zinc-300 group-hover:bg-white group-hover:text-zinc-950 transition-colors flex items-center justify-center gap-2">
                                                        Détails du voyage <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ); })}


                                    </div>
                                )}
                            </>
                        ) : (
                            /* Trip Details View */
                            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                                {/* Tab Switcher */}
                                <div className="flex items-center gap-6 border-b border-white/[0.04] mb-8 overflow-x-auto scroolbar-hide">
                                    <button
                                        onClick={() => setSelectedTrip(null)}
                                        className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors pb-4 mr-4 flex-shrink-0"
                                    >
                                        <ChevronRight className="w-4 h-4 rotate-180" />
                                        Retour
                                    </button>
                                    {[
                                        { id: 'overview', label: 'Aperçu', icon: LayoutDashboard },
                                        { id: 'itinerary', label: 'Itinéraire', icon: Calendar },
                                        { id: 'proposal', label: 'Proposition IA', icon: Plane },
                                        { id: 'documents', label: 'Documents', icon: Folder },
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`flex items-center gap-2 pb-4 text-sm font-medium border-b-2 transition-colors relative top-[1px] flex-shrink-0 ${activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-white/20'}`}
                                        >
                                            <tab.icon className="w-4 h-4 shrink-0" />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        {/* Dashboard Intelligent : En-tête Global */}
                                        {analysis && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-stretch relative overflow-hidden"
                                                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
                                            >
                                                {/* Score Scoreboard */}
                                                <div className="flex-shrink-0 flex flex-col items-center justify-center p-8 rounded-xl min-w-[220px] relative z-10" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                                                    <span className="text-xs font-medium text-zinc-400 mb-6">Indice de complétion</span>
                                                    <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                            <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/5" strokeWidth="3"></circle>
                                                            <circle cx="18" cy="18" r="16" fill="none" className={analysis.score >= 80 ? 'stroke-emerald-500' : analysis.score >= 50 ? 'stroke-blue-500' : 'stroke-orange-500'} strokeWidth="3" strokeDasharray="100" strokeDashoffset={100 - analysis.score} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}></circle>
                                                        </svg>
                                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                            <span className="text-3xl font-medium text-white leading-none">{analysis.score}</span>
                                                            <span className="text-[10px] text-zinc-500 font-medium tracking-wide mt-1">/ 100</span>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest text-center px-4 py-1.5 rounded-full border ${analysis.score >= 80 ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10' : analysis.score >= 50 ? 'border-blue-500/20 text-blue-400 bg-blue-500/10' : 'border-orange-500/20 text-orange-400 bg-orange-500/10'}`}>
                                                        {analysis.score >= 80 ? "Optimisé" : analysis.score >= 50 ? "En progrès" : "Aiguillage requis"}
                                                    </span>
                                                </div>

                                                {/* Budget Tracking */}
                                                <div className="flex-1 flex flex-col justify-center relative z-10">
                                                    <div className="flex justify-between items-end mb-6">
                                                        <div>
                                                            <span className="text-xs font-medium text-zinc-400 block mb-2">Budget Estimé</span>
                                                            <div className="flex items-baseline gap-3">
                                                                <span className="text-4xl font-medium text-white">{analysis.budget.used}€</span>
                                                                <span className="text-sm text-zinc-500 font-medium">/ {analysis.budget.total > 0 ? `${analysis.budget.total}€` : 'Non défini'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`text-lg font-bold tracking-tight ${analysis.budget.percentage > 100 ? 'text-red-400' : 'text-zinc-300'}`}>
                                                                {analysis.budget.percentage}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-10">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(analysis.budget.percentage, 100)}%` }}
                                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                                            className={`h-full ${analysis.budget.percentage > 100 ? 'bg-red-500' : 'bg-white'}`}
                                                        />
                                                    </div>

                                                    {/* Quick metrics row */}
                                                    <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5">
                                                        <div className="space-y-1">
                                                            <p className="text-xs text-zinc-500 font-medium">Réservations</p>
                                                            <p className="text-xl font-medium text-white">{bookings.length}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-xs text-zinc-500 font-medium">Hébergement</p>
                                                            <div className="text-sm font-medium flex items-center gap-2">
                                                                {analysis.coverage.missingHotelNights === 0 ? <span className="text-emerald-400 flex items-center gap-1"><Check className="w-4 h-4" /> Complet</span> :
                                                                    analysis.coverage.missingHotelNights > 0 ? <span className="text-orange-400">{analysis.coverage.missingHotelNights} nuits</span> :
                                                                        <span className="text-zinc-600">—</span>}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-xs text-zinc-500 font-medium">Activités</p>
                                                            <div className="text-sm font-medium">{analysis.coverage.hasActivity ? <span className="text-emerald-400">Prévues</span> : <span className="text-orange-400">À prévoir</span>}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                        
                                        {bookings.length > 0 && (
                                            <TripBudgetPanel
                                                bookings={bookings}
                                                tripTitle={selectedTrip?.title || ""}
                                            />
                                        )}
                                    </div>
                                )}
                                {activeTab === 'overview' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                                        <div className="lg:col-span-2 space-y-8">
                                            <div className="bg-zinc-900/50 rounded-2xl border border-white/[0.04] p-6">
                                                <div className="flex items-center justify-between mb-5">
                                                    <h4 className="text-sm font-medium text-zinc-300">Compléter votre voyage</h4>
                                                    {bookings.length > 0 && (
                                                        <button 
                                                            onClick={() => setActiveTab('itinerary')} 
                                                            className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full text-white/70 transition-colors"
                                                        >
                                                            Gérer mes éléments ({bookings.length})
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="space-y-3">
                                                    {[
                                                        { href: `/explore/flights?tripId=${selectedTrip?.id}&dest=${encodeURIComponent(selectedTrip?.destination_name || '')}`, emoji: "✈️", label: "Rechercher des vols", sub: "Comparez les meilleures offres · ajout direct au voyage" },
                                                        { href: `/explore/hotels?tripId=${selectedTrip?.id}&dest=${encodeURIComponent(selectedTrip?.destination_name || '')}`, emoji: "🏨", label: "Trouver un hébergement", sub: "Hôtels et résidences triés sur le volet · ajout direct" },
                                                        { href: `/explore/activities?tripId=${selectedTrip?.id}&dest=${encodeURIComponent(selectedTrip?.destination_name || '')}`, emoji: "🎒", label: "Découvrir des activités", sub: "Expériences uniques · ajout direct au voyage" },
                                                    ].map(item => (
                                                        <Link key={item.href} href={item.href} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/10 transition-all group">
                                                            <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">{item.label}</p>
                                                                <p className="text-xs text-zinc-500 mt-0.5">{item.sub}</p>
                                                            </div>
                                                            <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0 group-hover:text-zinc-300 group-hover:translate-x-1 transition-all" />
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="lg:col-span-1">
                                            <div className="bg-zinc-900/50 rounded-2xl p-8 border border-white/[0.04] sticky top-8">
                                                <div className="flex items-center gap-3 mb-8">
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                                        <Sparkles className="w-4 h-4 text-zinc-300" />
                                                    </div>
                                                    <h4 className="font-medium text-lg text-white">IA AIVANA</h4>
                                                </div>

                                                <div className="space-y-6">
                                                    {analysis && analysis.warnings.length > 0 ? (
                                                        <div className="space-y-4">
                                                            {analysis.warnings.map((warn, i) => (
                                                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                                                                    <div className="mt-0.5 shrink-0">
                                                                        <AlertCircle className="w-4 h-4 text-orange-400" />
                                                                    </div>
                                                                    <p className="text-sm text-zinc-400 leading-relaxed font-medium">{warn}</p>
                                                                </div>
                                                            ))}
                                                            <button
                                                                onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
                                                                className="w-full flex items-center justify-center gap-2 py-3 mt-6 bg-white text-zinc-950 text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors"
                                                            >
                                                                Optimiser mon voyage avec l&apos;IA
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center py-6 text-center">
                                                            <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                                                                <Check className="w-6 h-6 text-emerald-400" />
                                                            </div>
                                                            <p className="text-zinc-300 text-sm font-medium leading-relaxed mb-6">Itinéraire parfait. Aucune anomalie détectée par l'IA.</p>
                                                            <button
                                                                onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
                                                                className="w-full py-3 rounded-lg border border-white/10 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                                                            >
                                                                Parler avec AIVANA
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'itinerary' && (
                                    <div className="bg-zinc-900/50 rounded-2xl border border-white/[0.04] p-8">
                                        <div className="flex items-center justify-between mb-10">
                                            <h3 className="text-xl font-medium text-white">Itinéraire détaillé</h3>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={downloadICS}
                                                    disabled={bookings.length === 0}
                                                    className="flex items-center gap-2 bg-zinc-800 text-zinc-300 text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-700 hover:text-white transition-all disabled:opacity-50"
                                                >
                                                    <Calendar className="w-4 h-4" /> Export iCal
                                                </button>
                                                <button
                                                    onClick={() => setShowBookingModal(true)}
                                                    className="flex items-center gap-2 bg-white text-zinc-950 text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" /> Ajouter
                                                </button>
                                            </div>
                                        </div>

                                        {bookings.length === 0 ? (
                                            <div className="py-20 text-center">
                                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 text-3xl">🗓️</div>
                                                <p className="text-zinc-500 text-sm font-medium">Aucune réservation pour ce voyage</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-8 relative">
                                                {bookings.map((b, index) => (
                                                    <motion.div
                                                        key={b.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                                        className="flex gap-6 relative group"
                                                    >
                                                        {/* Vertical Timeline Line */}
                                                        {index !== bookings.length - 1 && (
                                                            <div className="absolute left-[20px] top-14 bottom-[-2rem] w-[1px] bg-white/10 z-0 group-hover:bg-white/30 transition-colors"></div>
                                                        )}

                                                        <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10 text-lg border border-white/10 transition-transform">
                                                            {b.type === 'flight' ? '✈️' : b.type === 'hotel' ? '🏨' : b.type === 'transport' ? '🚆' : '🎒'}
                                                        </div>
                                                        <div className="flex-1 pb-8 border-b border-white/[0.04] group-last:border-0">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-wrap">
                                                                    <h4 className="font-medium text-lg text-white leading-none">{b.title}</h4>
                                                                    <div className="flex gap-2">
                                                                        {(b.external_url || b.booking_url || (b.external_reference && b.external_reference.startsWith('WIKI')) || (b.raw_data && Object.keys(b.raw_data).length > 2)) && (
                                                                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1.5">
                                                                                <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span> IA Vérifiée
                                                                            </span>
                                                                        )}
                                                                        {b.status === 'pending' && <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs px-2 py-0.5 rounded-full font-medium">En attente</span>}
                                                                        {b.status === 'confirmed' && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2 py-0.5 rounded-full font-medium">Confirmé</span>}
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleDeleteBooking(b.id)}
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>

                                                            <div className="flex items-center gap-3 mb-4 mt-1">
                                                                <span className="text-xs font-medium text-zinc-400">{b.provider || "Prestataire"}</span>
                                                                <span className="text-xs text-zinc-600">•</span>
                                                                <span className="text-xs text-white font-medium">{b.price_estimate ? `${b.price_estimate} €` : 'Prix inconnu'}</span>
                                                            </div>

                                                            {/* Displaying Extracted Intelligence from raw_data */}
                                                            {(b.raw_data || b.location) && (
                                                                <div className="bg-white/[0.02] rounded-xl p-4 mb-5 max-w-2xl">
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                                                                        {b.location && <p className="text-xs text-zinc-400 flex flex-col gap-1"><span className="text-zinc-500 font-medium">Localisation</span> {b.location}</p>}
                                                                        {b.raw_data && b.raw_data.flight_number && <p className="text-xs text-zinc-400 flex flex-col gap-1"><span className="text-zinc-500 font-medium">Numéro de Vol</span> {b.raw_data.flight_number} {b.raw_data.cabin_class && `(${b.raw_data.cabin_class})`}</p>}
                                                                        {b.raw_data && b.raw_data.address && <p className="text-xs text-zinc-400 flex flex-col gap-1"><span className="text-zinc-500 font-medium">Adresse physique</span> {b.raw_data.address}</p>}
                                                                        {b.raw_data && b.raw_data.meeting_point && <p className="text-xs text-zinc-400 flex flex-col gap-1"><span className="text-zinc-500 font-medium">Point de rendez-vous</span> {b.raw_data.meeting_point}</p>}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-500">
                                                                <span className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/[0.04]">
                                                                    <Clock className="w-3.5 h-3.5" /> {b.start_datetime ? new Date(b.start_datetime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Date à définir'}
                                                                </span>
                                                                {b.end_datetime && (
                                                                    <>
                                                                        <ChevronRight className="w-3 h-3 text-zinc-700" />
                                                                        <span className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/[0.04]">
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
                                )}

                                {activeTab === 'proposal' && selectedTrip && (
                                    <TripProposal tripId={selectedTrip.id} />
                                )}

                                {activeTab === 'documents' && (
                                    <div className="bg-zinc-900/50 rounded-2xl border border-white/[0.04] p-8">
                                        <div className="flex items-center justify-between mb-10">
                                            <div>
                                                <h3 className="text-xl font-medium text-white mb-1">Coffre-fort Documents</h3>
                                                <p className="text-xs text-zinc-500 font-medium">Billets, passeports et confirmations sécurisés</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                            {/* Ajouter un document */}
                                            <button className="aspect-square flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-all group">
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                                    <Plus className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                                                </div>
                                                <span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-300">Nouveau fichier</span>
                                            </button>

                                            {/* Exemple de passeport */}
                                            <div className="aspect-square flex flex-col justify-between p-4 rounded-2xl bg-zinc-950 border border-white/[0.04] relative group overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="flex justify-between items-start">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                                        <Folder className="w-4 h-4 text-blue-400" />
                                                    </div>
                                                    <button className="text-zinc-500 hover:text-zinc-300"><Edit2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-white mb-0.5 truncate">Passeport</h4>
                                                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Valide</p>
                                                </div>
                                            </div>

                                            {/* Exemple de billet */}
                                            <div className="aspect-square flex flex-col justify-between p-4 rounded-2xl bg-zinc-950 border border-white/[0.04] relative group overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="flex justify-between items-start">
                                                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                                        <FileText className="w-4 h-4 text-purple-400" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-white mb-0.5 truncate">Billet AirFrance</h4>
                                                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Départ 14h</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            < nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#0A0D14]/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-6 lg:hidden z-40" >
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
                <button onClick={async () => { const supabase = createClient(); await supabase.auth.signOut(); router.push("/"); }} className="flex flex-col items-center gap-1.5 text-white/30 hover:text-red-500 transition-colors">
                    <div className="p-2">
                        <LogOut className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Exit</span>
                </button>
            </nav >


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

            {/* Toast notification */}
            {notification && (
                <div className="fixed top-24 right-6 z-[200] flex items-center gap-3 bg-[#141822] border border-gold/30 rounded-2xl px-5 py-4 shadow-2xl shadow-black/50 animate-in slide-in-from-right-4 duration-500 max-w-sm">
                    <div className="w-10 h-10 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Plane className="w-5 h-5 text-gold -rotate-45" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{notification}</p>
                        <p className="text-xs text-white/40 mt-0.5">
                            {phoneValue ? "SMS envoyé au " + phoneValue : "Ajoutez un numéro dans Paramètres pour les SMS"}
                        </p>
                    </div>
                    <button onClick={() => setNotification(null)} className="text-white/30 hover:text-white transition-colors flex-shrink-0">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

        </div >
    );
}
