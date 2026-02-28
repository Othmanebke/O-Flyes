"use client";
import React, { useState, useEffect } from "react";
import { Search, MapPin, Calendar, Star, ArrowRight, ExternalLink, Sparkles, History, Compass, Globe } from "lucide-react";
import axios from "axios";
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
    category?: string;
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

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

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
            window.open(selectedActivity.booking_url, "_blank");
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0D14] relative overflow-hidden pt-32 pb-20">
            {/* Premium Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-gold/5 blur-[100px] rounded-full"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                        <Sparkles className="w-3 h-3" /> Expériences d'Exception
                    </div>
                    <h1 className="font-serif text-6xl md:text-7xl text-white mb-6 leading-tight">
                        Capter l'<span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-300 to-gold">instant magique</span>
                    </h1>
                    <p className="text-white/40 text-lg max-w-2xl mx-auto">
                        Des moments rares sélectionnés pour transformer votre voyage en un souvenir éternel.
                    </p>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-4xl mx-auto mb-20 relative"
                >
                    <form onSubmit={handleSearch} className="group">
                        <div className="relative flex flex-col md:flex-row gap-3 p-3 bg-white/[0.03] backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl group-hover:border-gold/30 transition-all duration-500">
                            <div className="flex-1 flex items-center px-6 gap-4 py-4">
                                <MapPin className="w-6 h-6 text-gold animate-pulse" />
                                <input
                                    type="text"
                                    placeholder="Chercher une ville, une activité..."
                                    className="bg-transparent border-none outline-none w-full text-white text-lg placeholder:text-white/20 font-light"
                                    value={searchTerm}
                                    onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="bg-gold text-dark font-black px-10 py-5 rounded-[24px] hover:bg-gold-300 transition-all shadow-lg active:scale-95">
                                <Search className="w-5 h-5" />
                                <span className="uppercase tracking-widest text-sm">Explorer</span>
                            </button>
                        </div>

                        {/* Suggestions Dropdown */}
                        <AnimatePresence>
                            {showSuggestions && suggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute left-0 right-0 top-full mt-4 bg-[#141822]/95 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden z-[100] shadow-2xl"
                                >
                                    {suggestions.map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSelectSuggestion(suggestion)}
                                            className="w-full flex items-center gap-4 px-8 py-5 hover:bg-white/5 transition-all text-left border-b border-white/5 last:border-none group/item"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover/item:bg-gold/20 transition-colors">
                                                <Compass className="w-4 h-4 text-gold" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-medium group-hover/item:text-gold transition-colors">{suggestion.label}</p>
                                                <p className="text-[10px] text-white/30 uppercase tracking-widest">{suggestion.city ? 'Ville' : 'Pays'}</p>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-white/10 group-hover/item:translate-x-1 group-hover/item:text-gold transition-all" />
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </motion.div>

                {/* Results List */}
                <div className="relative">
                    <div className="flex items-center justify-between mb-12 gap-6">
                        <h2 className="text-3xl font-serif text-white">
                            Découvertes à <span className="text-gold italic">{selectedLocation}</span>
                        </h2>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            <History className="w-4 h-4 text-gold/60" />
                            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{activities.length} Expériences</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse bg-white/5 rounded-[40px] h-96 border border-white/10"></div>
                            ))}
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="bg-white/5 backdrop-blur-xl rounded-[40px] p-24 text-center border border-white/10">
                            <h3 className="text-2xl font-serif text-white mb-4">Aucune activité trouvée</h3>
                            <button onClick={() => { setSearchTerm("Dubaï"); fetchActivities("Dubaï"); }} className="text-gold font-bold uppercase tracking-widest text-xs">Essayer Dubaï</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {activities.map((activity, idx) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group relative bg-[#141822]/40 backdrop-blur-2xl rounded-[40px] border border-white/5 overflow-hidden hover:border-gold/40 transition-all duration-500 shadow-2xl"
                                >
                                    {/* Image Section */}
                                    <div className="relative h-64 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#141822] to-transparent z-10 opacity-60"></div>
                                        <img
                                            src={activity.image_url}
                                            alt={activity.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                                        />
                                        <div className="absolute top-6 left-6 z-20">
                                            <span className="bg-white/95 text-dark px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                {activity.category || "Sélection"}
                                            </span>
                                        </div>
                                        <div className="absolute top-6 right-6 z-20">
                                            <div className="bg-dark/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl">
                                                <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                                                {activity.rating}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8">
                                        <h3 className="font-serif text-2xl text-white mb-4 group-hover:text-gold transition-colors line-clamp-2">
                                            {activity.title}
                                        </h3>
                                        <p className="text-white/40 text-xs mb-8 line-clamp-2 leading-relaxed">
                                            {activity.description}
                                        </p>
                                        <div className="flex items-center justify-between pt-8 border-t border-white/5">
                                            <div>
                                                <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">À partir de</p>
                                                <p className="text-3xl font-serif text-white">
                                                    {activity.price} <span className="text-gold text-lg ml-1">{activity.currency}</span>
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleBook(activity)}
                                                className="bg-white text-dark hover:bg-gold px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 flex items-center gap-2"
                                            >
                                                Réserver <ArrowRight className="w-4 h-4" />
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
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-32 relative group"
                >
                    <div className="absolute inset-0 bg-gold/10 rounded-[50px] blur-[100px] opacity-20"></div>
                    <div className="relative bg-[#141822] rounded-[50px] p-20 border border-white/10 text-center overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[120px] rounded-full -mr-48 -mt-48"></div>
                        <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">Orchestrer l'<span className="text-gold italic">exceptionnel</span></h2>
                        <p className="text-white/40 text-lg mb-10 max-w-xl mx-auto">
                            Laissez notre IA concevoir votre itinéraire idéal, mêlant secrets locaux et expériences exclusives.
                        </p>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
                            className="bg-gold text-dark hover:bg-gold-300 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-2xl flex items-center gap-3 mx-auto"
                        >
                            <Sparkles className="w-5 h-5" /> Inspirer mon Voyage
                        </button>
                    </div>
                </motion.div>

                {/* Trip Selector Modal */}
                <AnimatePresence>
                    {showTripSelector && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark/95 backdrop-blur-xl">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-[#141822] border border-white/10 rounded-[48px] w-full max-w-xl p-12 text-center"
                            >
                                <h2 className="font-serif text-4xl text-white mb-8">Ajouter au voyage</h2>
                                <div className="space-y-4 mb-10">
                                    {trips.map(trip => (
                                        <button
                                            key={trip.id}
                                            onClick={() => confirmBooking(trip.id)}
                                            className="w-full text-left p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-gold transition-all"
                                        >
                                            <p className="text-white font-serif text-xl">{trip.title}</p>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-col gap-4">
                                    <button onClick={() => { if (selectedActivity) window.open(selectedActivity.booking_url, "_blank"); setShowTripSelector(false); }} className="text-white/40 uppercase text-[10px] tracking-widest">Réserver directement</button>
                                    <button onClick={() => setShowTripSelector(false)} className="bg-white/5 text-white py-5 rounded-2xl border border-white/10">Fermer</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
