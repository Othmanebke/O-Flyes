"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, LayoutDashboard, Calendar, Mail, Settings, Plus, LogOut, ChevronRight, MapPin, Clock, Trash2, Edit2, Shield, Star, Check } from "lucide-react";
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
                <div className="min-h-screen bg-sand-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-sand-50 flex">
                {/* Sidebar */}
                <aside className="w-64 bg-dark text-white hidden md:flex flex-col">
                    <div className="p-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-sand-50 rounded-lg flex items-center justify-center">
                                <Plane className="w-4 h-4 text-dark -rotate-45" />
                            </div>
                            <span className="font-serif text-xl text-white">AI<span className="text-gold">VANA</span></span>
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
                                color: emailConnected ? "text-green-500" : ""
                            },
                            { icon: Settings, label: "Paramètres", active: showSettings, onClick: () => { setSelectedTrip(null); setShowSettings(true); } },
                        ].map((item) => (
                            <button
                                key={item.label}
                                onClick={item.onClick}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${item.active ? "bg-gold text-dark font-bold" : "text-white/60 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <item.icon className={`w-4 h-4 ${item.color || ""}`} />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-white/10">
                        <button
                            onClick={() => { localStorage.removeItem("token"); router.push("/"); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Déconnexion</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col h-screen overflow-hidden">
                    {/* Header */}
                    <header className="h-20 bg-white border-b border-sand-200 px-8 flex items-center justify-between flex-shrink-0">
                        <h1 className="font-serif text-xl text-dark">
                            {showSettings ? "Paramètres" : (selectedTrip ? selectedTrip.title : "Mon Dashboard")}
                        </h1>
                        <div className="flex items-center gap-4">
                            {emailConnected && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-lg">
                                    <Mail className="w-3 h-3 text-green-500" />
                                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider text-muted">Sync Email Actif</span>
                                </div>
                            )}
                            {!selectedTrip && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="hidden sm:flex items-center gap-2 bg-dark text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-dark/90 transition-colors"
                                >
                                    <Plus className="w-4 h-4" /> Nouveau Voyage
                                </button>
                            )}
                            {selectedTrip && (
                                <button
                                    onClick={() => setShowBookingModal(true)}
                                    className="hidden sm:flex items-center gap-2 bg-gold text-dark text-xs font-bold px-4 py-2 rounded-xl hover:bg-gold/90 transition-colors"
                                >
                                    <Plus className="w-4 h-4" /> Ajouter Réservation
                                </button>
                            )}
                            <div className="h-8 w-px bg-sand-200 mx-2 hidden sm:block" />
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-dark">{userName}</p>
                                <p className="text-[10px] text-dark-400">
                                    {userRole === 'premium' ?
                                        <span className="text-gold flex items-center gap-1 justify-end"><Star fill="currentColor" className="w-3 h-3" /> Premium</span>
                                        : "Compte Explorateur"}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold">
                                {userName[0]}
                            </div>
                        </div>
                    </header>

                    {/* Scrollable Area */}
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-5xl mx-auto">
                            {showSettings ? (
                                /* Settings View */
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {/* Left Content - Profil */}
                                        <div className="md:col-span-2 space-y-8">
                                            <div className="bg-white rounded-3xl p-8 border border-sand-200">
                                                <div className="flex items-center gap-4 mb-8">
                                                    <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-2xl">
                                                        {userName[0] || "U"}
                                                    </div>
                                                    <div>
                                                        <h2 className="text-xl font-serif text-dark mb-1">Profil Public</h2>
                                                        <p className="text-sm text-dark-400">Gérez vos informations personnelles</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="block text-xs font-bold text-dark-400 uppercase tracking-widest mb-2">Nom Complet</label>
                                                        {isEditingName ? (
                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    type="text"
                                                                    value={editNameValue}
                                                                    onChange={(e) => setEditNameValue(e.target.value)}
                                                                    className="flex-1 bg-sand-50 border border-sand-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                                                                />
                                                                <button
                                                                    onClick={handleSaveProfile}
                                                                    disabled={isSavingProfile}
                                                                    className="btn-gold px-4 py-2.5 text-sm"
                                                                >
                                                                    Sauvegarder
                                                                </button>
                                                                <button
                                                                    onClick={() => { setIsEditingName(false); setEditNameValue(userName); }}
                                                                    className="px-4 py-2.5 text-sm font-bold text-dark-400 hover:text-dark transition-colors"
                                                                >
                                                                    Annuler
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-between bg-sand-50 border border-sand-100 rounded-xl px-4 py-3">
                                                                <span className="text-dark font-medium">{userName}</span>
                                                                <button onClick={() => setIsEditingName(true)} className="text-gold hover:text-gold/80 p-1">
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold text-dark-400 uppercase tracking-widest mb-2">Adresse Email</label>
                                                        <div className="flex items-center justify-between bg-sand-50 border border-sand-100 rounded-xl px-4 py-3 opacity-70">
                                                            <span className="text-dark font-medium select-all">{userEmail || "Non renseigné"}</span>
                                                            <Shield className="w-4 h-4 text-green-600" />
                                                        </div>
                                                        <p className="text-[10px] text-dark-400 mt-2">Votre email principal utilisé pour l'authentification.</p>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold text-dark-400 uppercase tracking-widest mb-2">Méthode de connexion (Fournisseur)</label>
                                                        <div className="inline-flex items-center gap-2 bg-sand-50 border border-sand-100 rounded-xl px-4 py-2.5 opacity-80 cursor-default">
                                                            {provider === 'google' ? (
                                                                <><svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg> Google</>
                                                            ) : provider === 'microsoft' ? (
                                                                <><svg className="w-4 h-4" viewBox="0 0 21 21"><path fill="#f25022" d="M0 0h10v10H0z" /><path fill="#7fba00" d="M11 0h10v10H11z" /><path fill="#00a4ef" d="M0 11h10v10H0z" /><path fill="#ffb900" d="M11 11h10v10H11z" /></svg> Outlook / Microsoft</>
                                                            ) : (
                                                                <><Mail className="w-4 h-4 text-dark-300" /> Email et Mot de passe</>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Content - Abo */}
                                        <div className="md:col-span-1">
                                            <div className={`p-8 rounded-3xl ${userRole === 'premium' ? 'bg-dark text-white' : 'bg-gold/10 border border-gold/20'}`}>
                                                <h3 className={`font-serif text-xl mb-2 ${userRole === 'premium' ? 'text-white' : 'text-dark'}`}>Abonnement</h3>

                                                {userRole === 'premium' ? (
                                                    <>
                                                        <div className="flex items-center gap-2 mb-6">
                                                            <Star fill="currentColor" className="w-5 h-5 text-gold" />
                                                            <span className="text-gold font-bold">AIVANA Premium</span>
                                                        </div>
                                                        <p className="text-sm text-white/70 leading-relaxed mb-6">Vous bénéficiez d'un accès illimité à l'IA, de suggestions personnalisées prioritaires, et des alertes de prix en temps réel.</p>
                                                        <ul className="space-y-3 mb-8">
                                                            <li className="flex items-center gap-2 text-sm text-white/90"><Check className="w-4 h-4 text-gold" /> Accès IA Illimité</li>
                                                            <li className="flex items-center gap-2 text-sm text-white/90"><Check className="w-4 h-4 text-gold" /> Gestion de voyages +</li>
                                                            <li className="flex items-center gap-2 text-sm text-white/90"><Check className="w-4 h-4 text-gold" /> Support Prioritaire</li>
                                                        </ul>
                                                        <button className="w-full py-3 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors">
                                                            Gérer ma facturation
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center gap-2 mb-6">
                                                            <span className="text-dark-500 font-bold uppercase tracking-wider text-xs">Plan Actuel : Explorateur</span>
                                                        </div>
                                                        <p className="text-sm text-dark-500 leading-relaxed mb-6">Passez au niveau supérieur pour débloquer toute la puissance de l'IA experte voyage.</p>
                                                        <ul className="space-y-3 mb-8">
                                                            <li className="flex items-center gap-2 text-sm text-dark"><span className="w-1.5 h-1.5 bg-dark rounded-full shrink-0" /> Création de voyages illimités</li>
                                                            <li className="flex items-center gap-2 text-sm text-dark"><span className="w-1.5 h-1.5 bg-dark rounded-full shrink-0" /> IA experte prédictive</li>
                                                            <li className="flex items-center gap-2 text-sm text-dark"><span className="w-1.5 h-1.5 bg-dark rounded-full shrink-0" /> Scrapping de prix en temps réel</li>
                                                        </ul>
                                                        <button
                                                            onClick={handleUpgradePremium}
                                                            disabled={isUpgrading}
                                                            className="w-full py-3 rounded-xl bg-dark text-white font-bold text-sm hover:shadow-xl transition-all shadow-dark/20 flex justify-center"
                                                        >
                                                            {isUpgrading ? <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" /> : "Devenir Premium (9€/mois)"}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : !selectedTrip ? (
                                <>
                                    {/* Welcome */}
                                    <div className="mb-10 flex items-end justify-between">
                                        <div>
                                            <h2 className="text-3xl font-serif text-dark mb-2">Bonjour, {userName} 👋</h2>
                                            <p className="text-dark-400">Prêt pour votre prochaine aventure ?</p>
                                        </div>
                                    </div>

                                    {trips.length === 0 ? (
                                        /* Empty State */
                                        <div className="bg-white rounded-3xl p-10 border border-sand-200 text-center mb-8">
                                            <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                                                📬
                                            </div>
                                            <h3 className="text-xl font-bold text-dark mb-3">Créez votre premier voyage</h3>
                                            <p className="text-dark-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                                                Connectez votre email ou ajoutez un voyage manuellement pour commencer à organiser vos escapades.
                                            </p>
                                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                                <button
                                                    onClick={handleConnectEmail}
                                                    className="btn-gold px-8 py-3 w-full sm:w-auto flex items-center justify-center gap-2"
                                                >
                                                    {provider === 'google' ? (
                                                        <>
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                            </svg>
                                                            Connecter Gmail
                                                        </>
                                                    ) : provider === 'microsoft' ? (
                                                        <>
                                                            <svg className="w-4 h-4" viewBox="0 0 21 21">
                                                                <path fill="#f25022" d="M0 0h10v10H0z" />
                                                                <path fill="#7fba00" d="M11 0h10v10H11z" />
                                                                <path fill="#00a4ef" d="M0 11h10v10H0z" />
                                                                <path fill="#ffb900" d="M11 11h10v10H11z" />
                                                            </svg>
                                                            Connecter Outlook
                                                        </>
                                                    ) : (
                                                        "Connecter mon email"
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => setShowCreateModal(true)}
                                                    className="flex items-center gap-2 text-sm font-bold text-dark-400 hover:text-dark transition-colors px-6"
                                                >
                                                    <Plus className="w-4 h-4" /> Ajouter manuellement
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Trips List */
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                            {trips.map((trip, i) => (
                                                <motion.div
                                                    key={trip.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    onClick={() => handleSelectTrip(trip)}
                                                    className="group cursor-pointer bg-white rounded-3xl border border-sand-200 overflow-hidden hover:shadow-xl hover:shadow-dark/5 transition-all"
                                                >
                                                    <div className="h-32 bg-dark relative overflow-hidden">
                                                        {trip.img ? (
                                                            <img src={trip.img} alt={trip.title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                                                        ) : (
                                                            <div className="absolute inset-0 bg-gradient-to-br from-dark to-dark-400 opacity-60" />
                                                        )}
                                                        <div className="absolute top-4 right-4 flex gap-2">
                                                            <button
                                                                onClick={(e) => handleDeleteTrip(trip.id, e)}
                                                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-200 backdrop-blur-md flex items-center justify-center transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <div className="absolute bottom-4 left-6">
                                                            <span className="text-[10px] font-bold text-gold uppercase tracking-widest">{trip.status}</span>
                                                            <h3 className="text-xl font-bold text-white">{trip.title}</h3>
                                                        </div>
                                                    </div>
                                                    <div className="p-6">
                                                        <div className="flex items-center justify-between text-dark-400 text-xs mb-4">
                                                            <div className="flex items-center gap-2">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                                <span>{trip.destination_name || "Destination à définir"}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                <span>PROCHAINEMENT</span>
                                                            </div>
                                                        </div>
                                                        <button className="w-full py-3 rounded-xl border border-sand-200 text-xs font-bold text-dark hover:bg-sand-50 transition-colors flex items-center justify-center gap-2">
                                                            Voir les détails <ChevronRight className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}

                                            {/* Add card */}
                                            <button
                                                onClick={() => setShowCreateModal(true)}
                                                className="h-[224px] border-2 border-dashed border-sand-200 rounded-3xl flex flex-col items-center justify-center text-dark-200 hover:text-dark-300 hover:border-sand-300 transition-all group"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-sand-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                    <Plus className="w-6 h-6" />
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-widest">Nouveau Voyage</span>
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* Trip Details View */
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <button
                                        onClick={() => setSelectedTrip(null)}
                                        className="flex items-center gap-2 text-xs font-bold text-dark-400 hover:text-dark transition-colors mb-4 uppercase tracking-widest"
                                    >
                                        <ChevronRight className="w-4 h-4 rotate-180" /> Retour au Dashboard
                                    </button>

                                    {/* Dashboard Intelligent : En-tête Global */}
                                    {analysis && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white rounded-3xl border border-sand-200 p-8 mb-8 flex flex-col md:flex-row gap-8 items-stretch shadow-sm"
                                        >

                                            {/* Score Scoreboard */}
                                            <div className="flex-shrink-0 flex flex-col items-center justify-center p-6 bg-sand-50 rounded-2xl border border-sand-200 min-w-[200px]">
                                                <span className="text-xs font-bold text-dark-300 uppercase tracking-widest mb-4">Score Voyage</span>
                                                <div className="relative w-24 h-24 flex items-center justify-center mb-2">
                                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-sand-200" strokeWidth="4"></circle>
                                                        <circle cx="18" cy="18" r="16" fill="none" className={analysis.score >= 80 ? 'stroke-green-500' : analysis.score >= 50 ? 'stroke-gold' : 'stroke-orange-500'} strokeWidth="4" strokeDasharray="100" strokeDashoffset={100 - analysis.score} strokeLinecap="round"></circle>
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                        <span className="text-2xl font-serif text-dark leading-none">{analysis.score}</span>
                                                        <span className="text-[10px] text-dark-400">/ 100</span>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-medium text-center text-dark-400">
                                                    {analysis.score >= 80 ? "Parfaitement organisé ✨" : analysis.score >= 50 ? "En bonne voie 👍" : "À compléter ⚠️"}
                                                </span>
                                            </div>

                                            {/* Budget Tracking */}
                                            <div className="flex-1 flex flex-col justify-center">
                                                <div className="flex justify-between items-end mb-4">
                                                    <div>
                                                        <span className="text-xs font-bold text-dark-300 uppercase tracking-widest block mb-1">Budget</span>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-3xl font-serif text-dark">{analysis.budget.used}€</span>
                                                            <span className="text-sm text-dark-400">/ {analysis.budget.total > 0 ? `${analysis.budget.total}€` : 'Non défini'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={analysis.budget.percentage > 100 ? 'text-sm font-bold text-red-500' : 'text-sm font-bold text-gold'}>
                                                            {analysis.budget.percentage}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="w-full h-3 bg-sand-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={analysis.budget.percentage > 100 ? 'h-full bg-red-500' : 'h-full bg-gold'}
                                                        style={{ width: `${Math.min(analysis.budget.percentage, 100)}%` }}
                                                    />
                                                </div>

                                                {/* Quick metrics row */}
                                                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-sand-100">
                                                    <div>
                                                        <p className="text-[10px] text-dark-400 uppercase tracking-widest font-bold mb-1">Réservations</p>
                                                        <p className="text-lg font-serif text-dark">{bookings.length}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-dark-400 uppercase tracking-widest font-bold mb-1">Hébergement</p>
                                                        <div className="text-sm font-medium text-dark flex items-center gap-1">
                                                            {analysis.coverage.missingHotelNights === 0 ? <span className="text-green-500">Complet</span> :
                                                                analysis.coverage.missingHotelNights > 0 ? <span className="text-orange-500">{analysis.coverage.missingHotelNights} nuit(s) max. libre</span> :
                                                                    <span className="text-dark-300">À définir</span>}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-dark-400 uppercase tracking-widest font-bold mb-1">Activités</p>
                                                        <div className="text-sm font-medium text-dark">{analysis.coverage.hasActivity ? <span className="text-green-500">Prévues</span> : <span className="text-orange-500">À prévoir</span>}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="flex flex-col lg:flex-row gap-8">
                                        <div className="flex-1">
                                            <div className="bg-white rounded-3xl border border-sand-200 p-8 mb-8">
                                                <div className="flex items-center justify-between mb-8">
                                                    <h3 className="text-2xl font-serif text-dark">Itinéraire détaillé</h3>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={downloadICS}
                                                            disabled={bookings.length === 0}
                                                            className="flex items-center gap-2 bg-dark text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-gold transition-colors disabled:opacity-50"
                                                        >
                                                            <Calendar className="w-4 h-4" /> Export iCal
                                                        </button>
                                                        <button
                                                            onClick={() => setShowBookingModal(true)}
                                                            className="flex items-center gap-2 bg-gold/10 text-gold text-xs font-bold px-4 py-2 rounded-xl hover:bg-gold hover:text-dark transition-colors"
                                                        >
                                                            <Plus className="w-4 h-4" /> Ajouter
                                                        </button>
                                                    </div>
                                                </div>

                                                {bookings.length === 0 ? (
                                                    <div className="py-12 text-center">
                                                        <div className="text-4xl mb-4">🗓️</div>
                                                        <p className="text-dark-400 text-sm">Aucune réservation pour ce voyage.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-6">
                                                        {bookings.map((b, index) => (
                                                            <motion.div
                                                                key={b.id}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.1, duration: 0.4 }}
                                                                className="flex gap-6 relative group"
                                                            >
                                                                {/* Vertical Timeline Line */}
                                                                {index !== bookings.length - 1 && (
                                                                    <div className="absolute left-6 top-14 bottom-[-1.5rem] w-px bg-sand-200 z-0 group-hover:bg-gold/50 transition-colors"></div>
                                                                )}

                                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10 text-xl shadow-sm border border-sand-200">
                                                                    {b.type === 'flight' ? '✈️' : b.type === 'hotel' ? '🏨' : b.type === 'transport' ? '🚆' : '🎒'}
                                                                </div>
                                                                <div className="flex-1 pt-1 pb-4">
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <div className="flex items-center gap-3">
                                                                            <h4 className="font-bold text-dark">{b.title}</h4>
                                                                            {(b.booking_url || (b.external_reference && b.external_reference.startsWith('WIKI')) || (b.raw_data && Object.keys(b.raw_data).length > 2)) && (
                                                                                <span className="bg-blue-50 text-blue-600 border border-blue-200 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                                                                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span> Verifié
                                                                                </span>
                                                                            )}
                                                                            {b.status === 'pending' && <span className="bg-orange-100 text-orange-600 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Incomplet</span>}
                                                                            {b.status === 'confirmed' && <span className="bg-green-100 text-green-600 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Confirmé</span>}
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleDeleteBooking(b.id)}
                                                                            className="text-dark-200 hover:text-red-500 transition-colors"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>

                                                                    <div className="flex items-center gap-2 mb-3 mt-1">
                                                                        <span className="text-xs font-bold text-dark bg-sand-50 px-2 py-1 rounded-md">{b.provider || "Prestataire non défini"}</span>
                                                                        <span className="text-xs text-dark-400">•</span>
                                                                        <span className="text-xs text-dark-400">{b.price ? `${b.price} €` : 'Prix à définir'}</span>
                                                                    </div>

                                                                    {/* Displaying Extracted Intelligence from raw_data */}
                                                                    {(b.raw_data || b.location) && (
                                                                        <div className="bg-sand-50/50 rounded-xl p-3 mb-3 border border-sand-100/50">
                                                                            {b.location && <p className="text-xs text-dark-500 mb-1 flex items-center gap-1.5"><strong className="text-dark-300 font-bold uppercase text-[9px] tracking-wider">Lieu:</strong> {b.location}</p>}
                                                                            {b.raw_data && b.raw_data.flight_number && <p className="text-xs text-dark-500 mb-1 flex items-center gap-1.5"><strong className="text-dark-300 font-bold uppercase text-[9px] tracking-wider">Vol:</strong> {b.raw_data.flight_number} {b.raw_data.cabin_class && `(${b.raw_data.cabin_class})`}</p>}
                                                                            {b.raw_data && b.raw_data.address && <p className="text-xs text-dark-500 mb-1 flex items-center gap-1.5"><strong className="text-dark-300 font-bold uppercase text-[9px] tracking-wider">Adresse:</strong> {b.raw_data.address}</p>}
                                                                            {b.raw_data && b.raw_data.meeting_point && <p className="text-xs text-dark-500 mb-1 flex items-center gap-1.5"><strong className="text-dark-300 font-bold uppercase text-[9px] tracking-wider">Rendez-vous:</strong> {b.raw_data.meeting_point}</p>}
                                                                        </div>
                                                                    )}

                                                                    <div className="flex items-center gap-4 text-[10px] font-bold text-dark-300 uppercase tracking-widest">
                                                                        <span className="flex items-center gap-1.5">
                                                                            ⏱️ {b.start_datetime ? new Date(b.start_datetime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Horaire à définir'}
                                                                        </span>
                                                                        {b.end_datetime && (
                                                                            <>
                                                                                <ChevronRight className="w-3 h-3 text-dark-200" />
                                                                                <span className="flex items-center gap-1.5">
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

                                        <div className="lg:w-80">
                                            <div className="bg-dark rounded-3xl p-8 text-white sticky top-8">
                                                <h4 className="font-serif text-xl mb-6">Suggestions AIVANA</h4>

                                                {analysis && analysis.warnings.length > 0 ? (
                                                    <div className="space-y-4 mb-8">
                                                        {analysis.warnings.map((warn, i) => (
                                                            <div key={i} className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                                                                <span className="text-gold mt-0.5">💡</span>
                                                                <p className="text-sm text-sand-100 leading-relaxed font-medium">{warn}</p>
                                                            </div>
                                                        ))}
                                                        <Link href="/chat" className="btn-gold w-full flex items-center justify-center gap-2 py-3 mt-4 text-sm shadow-xl shadow-gold/20">
                                                            <Plane className="w-4 h-4" /> Optimiser mon voyage
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-6 text-center">
                                                        <div className="text-4xl mb-4">✅</div>
                                                        <p className="text-white/60 text-sm mb-6">Aucun incident détecté. Votre voyage est parfaitement planifié.</p>
                                                        <Link href="/chat" className="w-full py-3 rounded-xl border border-white/20 text-xs font-bold text-white hover:bg-white/10 transition-colors">
                                                            Parler avec l'assistant
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            )}
                        </div>
                    </div >
                </main>

                {/* Mobile Bottom Navigation */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-sand-200 flex justify-around items-center h-16 px-4 z-40 pb-safe">
                    <button onClick={() => { setSelectedTrip(null); setShowSettings(false); }} className={`flex flex-col items-center gap-1 ${!selectedTrip && !showSettings ? "text-gold" : "text-dark-300"}`}>
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Accueil</span>
                    </button>
                    <button onClick={() => { setShowSettings(false); }} className={`flex flex-col items-center gap-1 ${selectedTrip && !showSettings ? "text-gold" : "text-dark-300"}`}>
                        <Calendar className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Voyages</span>
                    </button>
                    <button onClick={() => { setSelectedTrip(null); setShowSettings(true); }} className={`flex flex-col items-center gap-1 ${showSettings ? "text-gold" : "text-dark-300"}`}>
                        <Settings className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Profil</span>
                    </button>
                    <button onClick={() => { localStorage.removeItem("token"); router.push("/"); }} className="flex flex-col items-center gap-1 text-dark-300 hover:text-red-500">
                        <LogOut className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Déco</span>
                    </button>
                </nav>

                {/* Create Trip Modal */}
                {
                    showCreateModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                            <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                            <div className="relative bg-white w-full max-w-md rounded-3xl p-10 shadow-2xl animate-in zoom-in-95 duration-200">
                                <h3 className="text-2xl font-serif text-dark mb-2">Nouveau Voyage</h3>
                                <p className="text-sm text-dark-400 mb-8">Comment souhaitez-vous appeler cette aventure ?</p>

                                <form onSubmit={handleCreateTrip}>
                                    <div className="mb-6">
                                        <label className="block text-xs font-bold text-dark-400 uppercase tracking-widest mb-2">Nom du voyage</label>
                                        <input
                                            type="text"
                                            autoFocus
                                            required
                                            value={newTripTitle}
                                            onChange={(e) => setNewTripTitle(e.target.value)}
                                            placeholder="ex: Roadtrip Italie 2024"
                                            className="w-full bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            className="flex-1 py-3 text-xs font-bold text-dark-400 hover:text-dark transition-colors"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-[2] btn-gold py-3"
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setShowSyncOptions(false)} />
                        <div className="relative bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                            <h3 className="text-xl font-serif text-dark mb-2">Connecter un Email</h3>
                            <p className="text-sm text-dark-400 mb-8">Choisissez le fournisseur de votre boîte de réception pour synchroniser vos réservations :</p>

                            <div className="space-y-3">
                                <a href="https://api-gateway-v0vr.onrender.com/api/auth/google/sync"
                                    className="w-full flex items-center justify-center gap-3 py-3 border border-sand-300 rounded-xl text-sm font-medium text-dark hover:border-dark-200 hover:bg-sand-50 transition-colors">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continuer avec Google
                                </a>

                                <a href="https://api-gateway-v0vr.onrender.com/api/auth/microsoft"
                                    className="w-full flex items-center justify-center gap-3 py-3 border border-sand-300 rounded-xl text-sm font-medium text-dark hover:border-dark-200 hover:bg-sand-50 transition-colors">
                                    <svg className="w-5 h-5" viewBox="0 0 21 21">
                                        <path fill="#f25022" d="M0 0h10v10H0z" />
                                        <path fill="#7fba00" d="M11 0h10v10H11z" />
                                        <path fill="#00a4ef" d="M0 11h10v10H0z" />
                                        <path fill="#ffb900" d="M11 11h10v10H11z" />
                                    </svg>
                                    Continuer avec Outlook
                                </a>
                            </div>

                            <button onClick={() => setShowSyncOptions(false)} className="w-full mt-6 py-2 text-xs font-bold text-dark-400 hover:text-dark">Fermer</button>
                        </div>
                    </div>
                )}
            </div >
        );
    }
}
