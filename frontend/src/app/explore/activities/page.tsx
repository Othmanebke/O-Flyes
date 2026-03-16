"use client";
import React, { useState, useEffect } from "react";
import { Search, MapPin, Star, ArrowRight, Sparkles, Compass } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
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
    viator_url?: string;
    category?: string;
    duration?: string;
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
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUserId(session.user.id);
                fetchTrips();
            }
        };
        checkAuth();
        fetchActivities("Paris");
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        if (debouncedTerm.length >= 2) {
            axios.get(`/api/partner/locations/suggest?q=${debouncedTerm}`)
                .then(res => { setSuggestions(res.data); setShowSuggestions(true); })
                .catch(err => console.error("Failed to fetch suggestions", err));
        } else { setSuggestions([]); setShowSuggestions(false); }
    }, [debouncedTerm]);

    const fetchTrips = async () => {
        try { const res = await axios.get(`/api/trips`); setTrips(res.data || []); }
        catch (err) { console.error("Failed to fetch trips", err); }
    };
    const fetchActivities = async (city: string) => {
        setLoading(true);
        try { const res = await axios.get(`/api/partner/activities/search?city=${city}`); setActivities(res.data); }
        catch (err) { console.error("Failed to fetch activities", err); }
        finally { setLoading(false); }
    };
    const trackClick = async (type: string) => {
        try { await axios.post("/api/metrics/event", { event: "affiliate_click", type }); }
        catch (e) { console.error("Failed to track click", e); }
    };
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault(); setShowSuggestions(false);
        if (searchTerm.trim()) { setSelectedLocation(searchTerm); fetchActivities(searchTerm); }
    };
    const handleSelectSuggestion = (suggestion: any) => {
        setSearchTerm(suggestion.label);
        const city = suggestion.city || suggestion.country;
        setSelectedLocation(city); setShowSuggestions(false); fetchActivities(city);
    };
    const handleBook = async (activity: Activity) => {
        if (!userId) { router.push("/auth/login"); return; }
        setSelectedActivity(activity);
        if (trips.length > 0) setShowTripSelector(true);
        else { trackClick("activity"); window.open(activity.booking_url, "_blank"); }
    };
    const confirmBooking = async (tripId: string) => {
        if (!selectedActivity || !userId) return;
        try {
            await axios.post(`/api/trips/${tripId}/items`, {
                type: "activity", title: selectedActivity.title, provider: "Partner",
                price_estimate: selectedActivity.price, external_url: selectedActivity.booking_url
            });
            setShowTripSelector(false);
            window.dispatchEvent(new CustomEvent("bookings-updated", { detail: { tripId } }));
            trackClick("activity"); window.open(selectedActivity.booking_url, "_blank");
        } catch (err) {
            console.error("Failed booking", err); window.open(selectedActivity.booking_url, "_blank");
        }
    };

    return (
        <div className="min-h-screen -mt-20" style={{ backgroundColor: 'var(--bg-primary)' }}>

            {/* ── HERO ──────────────────────────────────────────────── */}
            <div className="relative h-[70vh] min-h-[500px]">
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1800&q=85"
                        alt="Activites et experiences"
                        className="absolute inset-0 w-full h-full object-cover scale-105"
                    />
                    <div className="absolute inset-0 bg-[#0A0D14]/50" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#0A0D14]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D14]/60 via-transparent to-transparent" />
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-gold/8 blur-[120px] rounded-full pointer-events-none" />
                </div>

                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pt-16">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/15 border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-[0.25em] mb-6 backdrop-blur-md">
                            <Sparkles className="w-3 h-3" /> Experiences d&apos;Exception
                        </div>
                        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-5 leading-[1.05]">
                            Capter<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-300 to-gold italic">l&apos;instant magique</span>
                        </h1>
                        <p className="text-white/50 text-lg max-w-xl mx-auto">
                            Des moments rares selectionnes pour transformer votre voyage en un souvenir eternel.
                        </p>
                    </motion.div>
                </div>

                {/* Search bar floating at the bottom of the hero */}
                <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-1/2 px-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-3xl mx-auto">
                        <form onSubmit={handleSearch} className="relative">
                            <div className="flex flex-col md:flex-row gap-0 bg-[#0A0D14] border border-white/10 rounded-[28px] shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden">
                                <div className="flex-1 flex items-center gap-4 px-6 py-5 border-b md:border-b-0 md:border-r border-white/[0.06]">
                                    <MapPin className="w-4 h-4 text-gold shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] text-white/25 uppercase font-black tracking-[0.2em] mb-0.5">Destination</p>
                                        <input
                                            type="text"
                                            placeholder="Une ville, une activite..."
                                            value={searchTerm}
                                            className="bg-transparent border-none outline-none w-full text-white placeholder:text-white/15 text-base font-light"
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="bg-gold text-[#0A0D14] font-black px-10 py-5 m-2 rounded-[20px] hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest shrink-0">
                                    <Search className="w-4 h-4" /> Explorer
                                </button>
                            </div>

                            <AnimatePresence>
                                {showSuggestions && suggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                                        className="absolute left-0 right-0 top-full mt-3 bg-[#141822]/98 backdrop-blur-3xl border border-white/10 rounded-[24px] overflow-hidden z-[100] shadow-2xl p-2"
                                    >
                                        {suggestions.map((s, idx) => (
                                            <button key={idx} type="button" onClick={() => handleSelectSuggestion(s)}
                                                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 transition-all rounded-[16px] group/item text-left">
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/item:bg-gold/20 transition-colors shrink-0">
                                                    <Compass className="w-3.5 h-3.5 text-gold" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-sm group-hover/item:text-gold transition-colors truncate">{s.label}</p>
                                                    <p className="text-[9px] text-white/25 uppercase tracking-widest">{s.city ? "Ville" : "Pays"}</p>
                                                </div>
                                                <ArrowRight className="w-3 h-3 text-white/10 group-hover/item:text-gold shrink-0" />
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </motion.div>
                </div>
            </div>

            {/* ── RESULTS ───────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-6 pt-40 pb-24 relative z-10">
                <div className="flex items-center justify-between mb-12 pb-8 border-b border-white/[0.06]">
                    <h2 className="text-2xl font-serif text-white">
                        <span className="text-white/30">Decouvertes a</span>{" "}
                        <span className="text-gold italic">{selectedLocation}</span>
                    </h2>
                    <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08]">
                        <Sparkles className="w-3.5 h-3.5 text-gold" />
                        <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">{activities.length} Experiences</span>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse bg-white/[0.03] rounded-[32px] h-[380px] border border-white/[0.06]" />
                        ))}
                    </div>
                ) : activities.length === 0 ? (
                    <div className="bg-white/[0.03] rounded-[40px] p-20 text-center border border-white/[0.06]">
                        <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-gold/20">
                            <Sparkles className="w-9 h-9 text-gold/50" />
                        </div>
                        <h3 className="text-xl font-serif text-white mb-4">Aucune activite trouvee</h3>
                        <button onClick={() => { setSearchTerm("Dubai"); fetchActivities("Dubai"); }}
                            className="text-gold text-xs font-black uppercase tracking-widest hover:text-yellow-300 transition-colors">
                            Essayer Dubai
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {activities.map((activity, idx) => (
                            <motion.div key={activity.id}
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: idx * 0.07 }}
                                className="group relative bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-gold/25 rounded-[32px] overflow-hidden transition-all duration-500"
                            >
                                <div className="relative h-56 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/10 to-transparent z-10" />
                                    <img src={activity.image_url} alt={activity.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1500ms]" />
                                    <div className="absolute top-5 left-5 z-20">
                                        <span className="bg-[#0A0D14]/80 backdrop-blur-md text-white/80 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-white/10">
                                            {activity.category || "Selection"}
                                        </span>
                                    </div>
                                    <div className="absolute top-5 right-5 z-20">
                                        <div className="bg-[#0A0D14]/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-white/10">
                                            <Star className="w-3 h-3 text-gold fill-gold" /> {activity.rating}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-7">
                                    <h3 className="font-serif text-xl text-white mb-2 group-hover:text-gold transition-colors line-clamp-2 leading-tight">
                                        {activity.title}
                                    </h3>
                                    <div className="flex items-center gap-3 mb-3 text-[10px] text-white/30">
                                        {activity.duration && <span>⏱ {activity.duration}</span>}
                                        {activity.reviews && <span>· {activity.reviews.toLocaleString('fr-FR')} avis</span>}
                                    </div>
                                    <p className="text-white/30 text-xs mb-4 line-clamp-2 leading-relaxed">{activity.description}</p>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                                        <div>
                                            <p className="text-[8px] text-white/20 uppercase tracking-widest mb-1">À partir de</p>
                                            <p className="text-2xl font-serif text-white">{activity.price} <span className="text-base text-gold">{activity.currency}</span></p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button onClick={() => handleBook(activity)}
                                                className="bg-gold text-[#0A0D14] hover:bg-yellow-400 transition-all px-5 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center gap-1.5 active:scale-95">
                                                GetYourGuide <ArrowRight className="w-3 h-3" />
                                            </button>
                                            {activity.viator_url && (
                                                <a href={activity.viator_url} target="_blank" rel="noopener noreferrer"
                                                    className="border border-white/10 text-white/40 hover:border-white/30 hover:text-white/70 transition-all px-5 py-2 rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-1.5">
                                                    Viator <ArrowRight className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* AI CTA */}
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-24 relative">
                    <div className="absolute inset-0 bg-gold/8 rounded-[40px] blur-[80px]" />
                    <div className="relative bg-white/[0.03] rounded-[40px] p-16 border border-white/[0.06] hover:border-gold/20 transition-colors text-center overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-gold/[0.05] blur-[80px] rounded-full -mt-24 pointer-events-none" />
                        <div className="relative z-10">
                            <p className="text-[9px] text-gold/60 uppercase tracking-[0.3em] font-black mb-4">Intelligence Artificielle</p>
                            <h2 className="text-3xl md:text-4xl font-serif text-white mb-5">Orchestrer l&apos;<span className="text-gold italic">exceptionnel</span></h2>
                            <p className="text-white/35 mb-10 max-w-lg mx-auto leading-relaxed">
                                Laissez notre IA concevoir votre itineraire ideal, melant secrets locaux et experiences exclusives.
                            </p>
                            <button onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
                                className="bg-gold text-[#0A0D14] hover:bg-yellow-400 px-10 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3 mx-auto">
                                <Sparkles className="w-4 h-4" /> Inspirer mon Voyage
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ── Trip Selector Modal ──────────────────────────────── */}
            <AnimatePresence>
                {showTripSelector && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowTripSelector(false)}
                            className="absolute inset-0 bg-[#06080C]/95 backdrop-blur-2xl" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            className="relative bg-[#141822] border border-gold/15 rounded-[40px] w-full max-w-lg p-10"
                        >
                            <h2 className="font-serif text-3xl text-white mb-2 text-center">Ajouter au <span className="text-gold italic">voyage</span></h2>
                            <p className="text-white/25 text-center text-sm mb-8">Synchronisez cette activite avec un itineraire.</p>
                            <div className="space-y-3 max-h-72 overflow-y-auto mb-8">
                                {trips.map(trip => (
                                    <button key={trip.id} onClick={() => confirmBooking(trip.id)}
                                        className="w-full text-left p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-gold/40 transition-all flex items-center justify-between group">
                                        <div>
                                            <p className="text-white font-serif text-lg group-hover:text-gold transition-colors">{trip.title}</p>
                                            <p className="text-[9px] text-white/20 uppercase tracking-widest mt-1">{trip.destination_name || "Multi-destinations"}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gold/25 group-hover:text-gold transition-colors" />
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { if (selectedActivity) window.open(selectedActivity.booking_url, "_blank"); setShowTripSelector(false); }}
                                    className="text-[9px] text-white/25 hover:text-gold uppercase tracking-[0.2em] transition-colors py-1 text-center">
                                    Reserver directement
                                </button>
                                <button onClick={() => setShowTripSelector(false)}
                                    className="bg-white/[0.05] text-white/50 font-bold py-4 rounded-2xl hover:bg-white/[0.08] transition-all border border-white/[0.08] text-sm">
                                    Fermer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
