"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, LayoutDashboard, Calendar, Mail, Settings, Plus, LogOut, ChevronRight, MapPin, Clock, Trash2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";

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
    start_date?: string;
    end_date?: string;
    price?: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [userName, setUserName] = useState("Voyageur");
    const [userId, setUserId] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTripTitle, setNewTripTitle] = useState("");

    // Booking state
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [newBooking, setNewBooking] = useState({
        type: 'flight',
        title: '',
        provider: '',
        start_date: '',
        end_date: ''
    });

    const [emailConnected, setEmailConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/auth/login");
        } else {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserId(payload.id);
                setUserName(payload.name || "Voyageur");
                fetchTrips(payload.id);
                checkEmailSync(payload.id);
            } catch (e) {
                console.error("Invalid token", e);
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
        // Redirect to auth-service sync route via Gateway
        window.location.href = `/api/auth/google/sync`;
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
    };

    const handleAddBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTrip) return;

        try {
            await axios.post("/api/db/bookings", {
                trip_id: selectedTrip.id,
                ...newBooking
            });
            setNewBooking({ type: 'flight', title: '', provider: '', start_date: '', end_date: '' });
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
                        { icon: LayoutDashboard, label: "Dashboard", active: !selectedTrip, onClick: () => setSelectedTrip(null) },
                        { icon: Calendar, label: "Mes Voyages", active: !!selectedTrip, onClick: () => { } },
                        { icon: Mail, label: emailConnected ? "Email Connecté" : "Sync Email", active: false, onClick: handleConnectEmail, color: emailConnected ? "text-green-500" : "" },
                        { icon: Settings, label: "Paramètres", active: false, onClick: () => { } },
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
                        {selectedTrip ? selectedTrip.title : "Mon Dashboard"}
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
                            <p className="text-[10px] text-dark-400">Compte Explorateur</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold">
                            {userName[0]}
                        </div>
                    </div>
                </header>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-5xl mx-auto">
                        {!selectedTrip ? (
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
                                                className="btn-gold px-8 py-3 w-full sm:w-auto"
                                            >
                                                Connecter mon email
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
                                        {trips.map((trip) => (
                                            <div
                                                key={trip.id}
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
                                            </div>
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
                                    className="flex items-center gap-2 text-xs font-bold text-dark-400 hover:text-dark transition-colors mb-6 uppercase tracking-widest"
                                >
                                    <ChevronRight className="w-4 h-4 rotate-180" /> Retour au Dashboard
                                </button>

                                <div className="flex flex-col lg:flex-row gap-8">
                                    <div className="flex-1">
                                        <div className="bg-white rounded-3xl border border-sand-200 p-8 mb-8">
                                            <h3 className="text-2xl font-serif text-dark mb-6">Itinéraire du voyage</h3>

                                            {bookings.length === 0 ? (
                                                <div className="py-12 text-center">
                                                    <div className="text-4xl mb-4">🗓️</div>
                                                    <p className="text-dark-400 text-sm">Aucune réservation pour ce voyage.</p>
                                                    <button
                                                        onClick={() => setShowBookingModal(true)}
                                                        className="mt-6 text-gold font-bold text-sm hover:underline"
                                                    >
                                                        + Ajouter ma première réservation
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {bookings.map((b) => (
                                                        <div key={b.id} className="flex gap-6 relative">
                                                            <div className="w-12 h-12 bg-sand-50 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10 text-xl shadow-sm border border-sand-200">
                                                                {b.type === 'flight' ? '✈️' : b.type === 'hotel' ? '🏨' : b.type === 'transport' ? '🚆' : '🎒'}
                                                            </div>
                                                            <div className="flex-1 pt-1">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <h4 className="font-bold text-dark">{b.title}</h4>
                                                                    <button
                                                                        onClick={() => handleDeleteBooking(b.id)}
                                                                        className="text-dark-200 hover:text-red-500 transition-colors"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                                <p className="text-xs text-dark-400 mb-2">{b.provider || "Prestataire non défini"}</p>
                                                                <div className="flex items-center gap-4 text-[10px] font-bold text-dark-300 uppercase tracking-widest">
                                                                    <span className="flex items-center gap-1.5 bg-sand-50 px-2 py-1 rounded-md">
                                                                        {b.start_date ? new Date(b.start_date).toLocaleDateString() : 'Date à définir'}
                                                                    </span>
                                                                    {b.end_date && (
                                                                        <>
                                                                            <ChevronRight className="w-3 h-3 text-dark-200" />
                                                                            <span className="flex items-center gap-1.5 bg-sand-50 px-2 py-1 rounded-md">
                                                                                {new Date(b.end_date).toLocaleDateString()}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="lg:w-80">
                                        <div className="bg-dark rounded-3xl p-8 text-white sticky top-8">
                                            <h4 className="font-serif text-xl mb-6">Récapitulatif</h4>
                                            <div className="space-y-4 mb-8">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-white/40">Réservations</span>
                                                    <span className="font-bold">{bookings.length}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-white/40">Statut</span>
                                                    <span className="text-gold font-bold uppercase text-[10px] tracking-widest">{selectedTrip.status}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setShowBookingModal(true)}
                                                className="w-full btn-gold py-3 text-sm"
                                            >
                                                Ajouter une réservation
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Create Trip Modal */}
            {showCreateModal && (
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
            )}

            {/* Create Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setShowBookingModal(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-3xl p-10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-2xl font-serif text-dark mb-2">Nouvelle Réservation</h3>
                        <p className="text-sm text-dark-400 mb-8">Ajoutez manuellement les détails de votre réservation.</p>

                        <form onSubmit={handleAddBooking} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-2">Type</label>
                                    <select
                                        value={newBooking.type}
                                        onChange={(e) => setNewBooking({ ...newBooking, type: e.target.value as any })}
                                        className="w-full bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-all appearance-none"
                                    >
                                        <option value="flight">✈️ Vol</option>
                                        <option value="hotel">🏨 Hôtel</option>
                                        <option value="transport">🚆 Transport</option>
                                        <option value="activity">🎒 Activité</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-2">Titre</label>
                                    <input
                                        type="text"
                                        required
                                        value={newBooking.title}
                                        onChange={(e) => setNewBooking({ ...newBooking, title: e.target.value })}
                                        placeholder="ex: Vol AF123"
                                        className="w-full bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-2">Prestataire</label>
                                <input
                                    type="text"
                                    value={newBooking.provider}
                                    onChange={(e) => setNewBooking({ ...newBooking, provider: e.target.value })}
                                    placeholder="ex: Air France"
                                    className="w-full bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-2">Date début</label>
                                    <input
                                        type="date"
                                        value={newBooking.start_date}
                                        onChange={(e) => setNewBooking({ ...newBooking, start_date: e.target.value })}
                                        className="w-full bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-2">Date fin</label>
                                    <input
                                        type="date"
                                        value={newBooking.end_date}
                                        onChange={(e) => setNewBooking({ ...newBooking, end_date: e.target.value })}
                                        className="w-full bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowBookingModal(false)}
                                    className="flex-1 py-3 text-xs font-bold text-dark-400 hover:text-dark transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] btn-gold py-3 shadow-lg shadow-gold/20"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
