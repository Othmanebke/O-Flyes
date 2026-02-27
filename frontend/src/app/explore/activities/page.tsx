"use client";
import React, { useState, useEffect } from "react";
import { Search, MapPin, Calendar, Star, ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseJwt } from "@/lib/jwt";
import { motion, AnimatePresence } from "framer-motion";

interface Activity {
    id: string;
    title: string;
    city: string;
    country: string;
    price: number;
    currency: string;
    rating: number;
    reviews: number;
    image_url: string;
    description: string;
    booking_url: string;
}

export default function ActivitiesPage() {
    const router = useRouter();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState("Paris");
    const [userId, setUserId] = useState<string | null>(null);
    const [trips, setTrips] = useState<any[]>([]);
    const [showTripSelector, setShowTripSelector] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [debouncedTerm, setDebouncedTerm] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = parseJwt(token);
                if (payload && payload.id) {
                    setUserId(payload.id);
                    fetchTrips(payload.id);
                }
            } catch (e) {
                console.error("Invalid token", e);
            }
        }
        fetchActivities("Paris");
    }, []);

    // Debounce effect for search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch suggestions when debounced term changes
    useEffect(() => {
        if (debouncedTerm.length >= 2) {
            axios.get(`/api/partner/locations/suggest?q=${debouncedTerm}`)
                .then(res => {
                    setSuggestions(res.data);
                    setShowSuggestions(true);
                })
                .catch(err => console.error("Failed to fetch suggestions", err));
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [debouncedTerm]);

    const fetchTrips = async (uid: string) => {
        try {
            const res = await axios.get(`/api/db/trips/user/${uid}`);
            setTrips(res.data || []);
        } catch (err) {
            console.error("Failed to fetch trips", err);
        }
    };

    const fetchActivities = async (city: string) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/partner/activities/search?city=${city}`);
            setActivities(res.data);
        } catch (err) {
            console.error("Failed to fetch activities", err);
        } finally {
            setLoading(false);
        }
    };

    const trackClick = async (type: string) => {
        try {
            await axios.post("/api/metrics/event", {
                event: "affiliate_click",
                type: type
            });
        } catch (e) {
            console.error("Failed to track click", e);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSuggestions(false);
        if (searchTerm.trim()) {
            setSelectedLocation(searchTerm);
            fetchActivities(searchTerm);
        }
    };

    const handleSelectSuggestion = (suggestion: any) => {
        setSearchTerm(suggestion.label);
        // If it's a country-only suggestion (city is empty), we might want to search for the capital or just the term
        const searchCity = suggestion.city || suggestion.country;
        setSelectedLocation(searchCity);
        setShowSuggestions(false);
        fetchActivities(searchCity);
    };

    const handleBook = async (activity: Activity) => {
        if (!userId) {
            router.push("/auth/login");
            return;
        }

        setSelectedActivity(activity);
        if (trips.length > 0) {
            setShowTripSelector(true);
        } else {
            // No trips, just open the link
            trackClick('activity');
            window.open(activity.booking_url, "_blank");
        }
    };

    const confirmBooking = async (tripId: string) => {
        if (!selectedActivity || !userId) return;

        try {
            await axios.post("/api/db/bookings", {
                trip_id: tripId,
                type: 'activity',
                title: selectedActivity.title,
                provider: 'Partner',
                price: selectedActivity.price,
                currency: selectedActivity.currency,
                status: 'pending',
                external_url: selectedActivity.booking_url
            });

            setShowTripSelector(false);
            trackClick('activity');
            window.open(selectedActivity.booking_url, "_blank");
        } catch (err) {
            console.error("Failed to create pending booking", err);
            alert("Une erreur est survenue lors de la planification.");
            window.open(selectedActivity.booking_url, "_blank");
        }
    };

    return (
        <div className="min-h-screen bg-[#f9f7f4] pt-24 pb-20 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-gold/10 to-transparent pointer-events-none"></div>
            <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-gold/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-dark/5 blur-[150px] rounded-full pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-[1px] w-12 bg-gold/40"></div>
                        <span className="text-gold font-bold tracking-[0.2em] text-xs uppercase">Curated Experiences</span>
                    </div>
                    <h1 className="font-serif text-6xl text-dark mb-4 tracking-tight">Capter l'instant</h1>
                    <p className="text-dark-400 text-lg max-w-2xl leading-relaxed">
                        Des moments d'exception sélectionnés pour transformer votre voyage en un souvenir éternel.
                    </p>
                </motion.div>

                {/* Search Bar */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    onSubmit={handleSearch}
                    className="mb-20"
                >
                    <div className="flex flex-col md:flex-row gap-4 p-2 bg-white/70 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-dark/5 border border-white/50">
                        <div className="flex-1 flex items-center px-6 gap-4 border-b md:border-b-0 md:border-r border-sand-200/50 py-4 relative group">
                            <MapPin className="w-5 h-5 text-gold group-focus-within:scale-110 transition-transform" />
                            <div className="w-full relative">
                                <p className="text-[10px] text-dark-300 uppercase tracking-widest font-bold mb-0.5">Destination</p>
                                <input
                                    type="text"
                                    placeholder="Où voulez-vous aller ?"
                                    className="bg-transparent border-none outline-none w-full text-dark font-semibold text-lg placeholder:text-dark-300"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                />
                                <AnimatePresence>
                                    {showSuggestions && suggestions.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            className="absolute top-full left-0 right-0 mt-6 bg-white/90 backdrop-blur-2xl border border-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 overflow-hidden max-h-72 overflow-y-auto w-full md:w-[150%]"
                                        >
                                            {suggestions.map((loc, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => handleSelectSuggestion(loc)}
                                                    className="px-6 py-4 hover:bg-gold/5 cursor-pointer flex items-center gap-4 transition-all border-b border-sand-100 last:border-0"
                                                >
                                                    <div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                                                        <MapPin className="w-5 h-5 text-gold" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-dark text-base tracking-tight">
                                                            {loc.city ? loc.city : loc.country}
                                                        </p>
                                                        <p className="text-xs text-dark-400 font-medium">
                                                            {loc.city ? loc.country : "Explorez le Pays"}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        <button type="submit" className="bg-dark text-white font-bold px-12 py-5 rounded-[24px] hover:bg-dark-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-dark/20 hover:shadow-dark/40 active:scale-95 group">
                            <Search className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            <span className="text-lg">Découvrir</span>
                        </button>
                    </div>
                </motion.form>

                {/* Results Grid */}
                <div>
                    <div className="flex items-center justify-between mb-10 px-2">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-3xl font-serif text-dark flex items-center gap-3">
                                <span className="text-gold-600 italic">Expériences à</span> {selectedLocation || "Paris"}
                                <Sparkles className="w-6 h-6 text-gold opacity-40" />
                            </h2>
                            <div className="h-1 w-20 bg-gold/20 rounded-full"></div>
                        </div>
                        <span className="bg-white/50 backdrop-blur px-4 py-2 rounded-full border border-white text-dark-400 text-xs font-bold uppercase tracking-widest shadow-sm">
                            {activities.length} pépites trouvées
                        </span>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse bg-white/40 backdrop-blur-md rounded-[40px] h-[450px] border border-white shadow-sm"></div>
                            ))}
                        </div>
                    ) : activities.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white/40 backdrop-blur-xl rounded-[48px] p-24 text-center border border-white shadow-xl shadow-dark/5"
                        >
                            <div className="text-7xl mb-8 grayscale hover:grayscale-0 transition-all duration-700 cursor-default">🏜️</div>
                            <h3 className="text-2xl font-serif text-dark mb-4">Horizon encore inexploré à {selectedLocation}</h3>
                            <p className="text-dark-400 max-w-md mx-auto leading-relaxed">
                                Nos experts parcourent le monde pour vous dénicher le meilleur. Essayez d'autres destinations comme <span className="text-gold font-bold">Paris</span> ou <span className="text-gold font-bold">Marrakech</span> en attendant.
                            </p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {activities.map((activity, index) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className="group bg-white/60 backdrop-blur-sm rounded-[40px] border border-white overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-700 hover:bg-white"
                                >
                                    <div className="relative h-72 overflow-hidden">
                                        <img
                                            src={activity.image_url}
                                            alt={activity.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                                        />
                                        <div className="absolute top-6 left-6 flex gap-2">
                                            <span className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] text-dark shadow-xl">
                                                Selection
                                            </span>
                                        </div>
                                        <div className="absolute top-6 right-6">
                                            <div className="bg-dark/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl">
                                                <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                                                {activity.rating}
                                            </div>
                                        </div>

                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-dark/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                            <div className="bg-white text-dark font-bold px-6 py-3 rounded-2xl transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                                                Voir les détails
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        <h3 className="font-serif text-2xl text-dark leading-tight group-hover:text-gold transition-colors mb-3">
                                            {activity.title}
                                        </h3>

                                        <p className="text-dark-400 text-sm mb-8 leading-relaxed line-clamp-2">
                                            {activity.description}
                                        </p>

                                        <div className="flex items-center justify-between pt-8 border-t border-sand-100/50">
                                            <div className="flex flex-col">
                                                <p className="text-[10px] text-dark-300 uppercase tracking-widest font-bold mb-1">Expérience dès</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-3xl font-serif text-dark tracking-tighter">{activity.price}</span>
                                                    <span className="text-sm font-bold text-gold uppercase">{activity.currency}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleBook(activity)}
                                                className="bg-dark text-white hover:bg-gold hover:text-dark w-14 h-14 rounded-2xl transition-all duration-500 flex items-center justify-center shadow-lg active:scale-90 group/btn"
                                            >
                                                <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* AI CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-32 bg-dark rounded-[64px] p-16 text-center relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(10,17,40,0.3)]"
                >
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold opacity-10 blur-[130px] rounded-full -mr-64 -mt-64 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full -ml-32 -mb-32"></div>

                    <div className="relative z-10">
                        <div className="mx-auto w-16 h-16 bg-gold/20 rounded-2xl flex items-center justify-center mb-8">
                            <Sparkles className="w-8 h-8 text-gold" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight max-w-2xl mx-auto">Votre prochaine aventure mérite une muse</h2>
                        <p className="text-white/50 mb-12 text-lg max-w-xl mx-auto leading-relaxed">
                            Laissez notre intelligence artificielle orchestrer votre itinéraire idéal, mêlant découvertes secrètes et luxueuses expériences.
                        </p>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
                            className="bg-gold hover:bg-gold-300 text-dark px-12 py-5 rounded-[24px] font-bold transition-all flex items-center gap-3 mx-auto shadow-2xl shadow-gold/20 hover:shadow-gold/40 active:scale-95 group"
                        >
                            <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                            <span className="text-lg">Inspirer mon voyage</span>
                        </button>
                    </div>
                </motion.div>

                {/* Trip Selector Modal */}
                <AnimatePresence>
                    {showTripSelector && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowTripSelector(false)}
                                className="absolute inset-0 bg-dark/80 backdrop-blur-md"
                            ></motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white/95 backdrop-blur-xl rounded-[64px] w-full max-w-xl p-16 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative z-[101] border border-white"
                            >
                                <div className="mb-12">
                                    <div className="w-16 h-1 w-full bg-gold/20 rounded-full mb-8"></div>
                                    <h2 className="font-serif text-4xl text-dark mb-4 tracking-tight">Associer au voyage</h2>
                                    <p className="text-dark-400 text-lg">Choisissez le chapitre de votre vie où cette activité prendra place.</p>
                                </div>

                                <div className="space-y-4 max-h-72 overflow-y-auto pr-4 mb-12 custom-scrollbar">
                                    {trips.map(trip => (
                                        <button
                                            key={trip.id}
                                            onClick={() => confirmBooking(trip.id)}
                                            className="w-full text-left p-6 rounded-[32px] border border-sand-200/50 bg-white/50 hover:border-gold hover:bg-gold/5 transition-all group flex items-center justify-between shadow-sm hover:shadow-xl hover:shadow- gold/5"
                                        >
                                            <div>
                                                <p className="font-bold text-dark text-lg group-hover:text-gold transition-colors">{trip.title}</p>
                                                <p className="text-xs text-dark-400 font-bold uppercase tracking-widest mt-1 italic">{trip.destination_name || "Destination à définir"}</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-gold group-hover:text-white transition-all">
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5" />
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={() => {
                                            if (selectedActivity) window.open(selectedActivity.booking_url, "_blank");
                                            setShowTripSelector(false);
                                        }}
                                        className="text-sm font-bold text-dark-300 hover:text-gold py-2 transition-colors tracking-widest uppercase"
                                    >
                                        Continuer sans associer
                                    </button>
                                    <button
                                        onClick={() => setShowTripSelector(false)}
                                        className="bg-dark text-white font-bold py-6 rounded-[24px] hover:bg-dark-600 transition-all shadow-xl shadow-dark/20 text-lg"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
