"use client";
import React, { useState, useEffect } from "react";
import { Search, MapPin, Star, ArrowRight, Sparkles, Bed, Compass } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { parseJwt } from "@/lib/jwt";
import { motion, AnimatePresence } from "framer-motion";

interface Hotel {
    id: string; name: string; city: string; country: string;
    price_per_night: number; currency: string; rating: number; stars: number;
    category?: string; image_url: string; description: string; booking_url: string;
}

export default function HotelsPage() {
    const router = useRouter();
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState("Paris");
    const [userId, setUserId] = useState<string | null>(null);
    const [trips, setTrips] = useState<any[]>([]);
    const [showTripSelector, setShowTripSelector] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
    const [debouncedTerm, setDebouncedTerm] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = parseJwt(token);
                if (payload && payload.id) { setUserId(payload.id); fetchTrips(payload.id); }
            } catch (e) { console.error("Invalid token", e); }
        }
        fetchHotels("Paris");
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

    const fetchTrips = async (uid: string) => {
        try { const res = await axios.get(`/api/db/trips/user/${uid}`); setTrips(res.data || []); }
        catch (err) { console.error("Failed to fetch trips", err); }
    };
    const fetchHotels = async (city: string) => {
        setLoading(true);
        try { const res = await axios.get(`/api/partner/hotels/search?city=${city}`); setHotels(res.data); }
        catch (err) { console.error("Failed to fetch hotels", err); }
        finally { setLoading(false); }
    };
    const trackClick = async (type: string) => {
        try { await axios.post("/api/metrics/event", { event: "affiliate_click", type }); }
        catch (e) { console.error("Failed to track click", e); }
    };
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault(); setShowSuggestions(false);
        if (searchTerm.trim()) { setSelectedLocation(searchTerm); fetchHotels(searchTerm); }
    };
    const handleSelectSuggestion = (suggestion: any) => {
        setSearchTerm(suggestion.label);
        const city = suggestion.city || suggestion.country;
        setSelectedLocation(city); setShowSuggestions(false); fetchHotels(city);
    };
    const handleBook = async (hotel: Hotel) => {
        if (!userId) { router.push("/auth/login"); return; }
        setSelectedHotel(hotel);
        if (trips.length > 0) setShowTripSelector(true);
        else { trackClick("hotel"); window.open(hotel.booking_url, "_blank"); }
    };
    const confirmBooking = async (tripId: string) => {
        if (!selectedHotel || !userId) return;
        try {
            await axios.post("/api/db/bookings", {
                trip_id: tripId, type: "hotel", title: selectedHotel.name, provider: "Partner",
                price: selectedHotel.price_per_night, currency: selectedHotel.currency,
                status: "pending", external_url: selectedHotel.booking_url
            });
            setShowTripSelector(false); trackClick("hotel"); window.open(selectedHotel.booking_url, "_blank");
        } catch (err) {
            console.error("Failed booking", err); window.open(selectedHotel.booking_url, "_blank");
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0D14]">

            {/* ── HERO ──────────────────────────────────────────────── */}
            <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1800&q=85"
                    alt="Hotels de luxe"
                    className="absolute inset-0 w-full h-full object-cover scale-105"
                />
                <div className="absolute inset-0 bg-[#0A0D14]/55" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-[#0A0D14]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D14]/50 via-transparent to-transparent" />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-gold/8 blur-[120px] rounded-full pointer-events-none" />

                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pt-16">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/15 border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-[0.25em] mb-6 backdrop-blur-md">
                            <Bed className="w-3 h-3" /> Hebergements d&apos;Exception
                        </div>
                        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-5 leading-[1.05]">
                            Trouvez votre<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-300 to-gold italic">refuge ideal</span>
                        </h1>
                        <p className="text-white/50 text-lg max-w-xl mx-auto">
                            Des palaces legendaires aux retraites confidentielles, le meilleur du monde pour vos nuits.
                        </p>
                    </motion.div>
                </div>

                {/* Search bar floating at the bottom of the hero */}
                <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-1/2 px-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-3xl mx-auto">
                        <form onSubmit={handleSearch} className="relative">
                            <div className="flex flex-col md:flex-row gap-0 bg-[#141822] border border-white/10 rounded-[28px] shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden">
                                <div className="flex-1 flex items-center gap-4 px-6 py-5 border-b md:border-b-0 md:border-r border-white/[0.06]">
                                    <MapPin className="w-4 h-4 text-gold shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] text-white/25 uppercase font-black tracking-[0.2em] mb-0.5">Destination</p>
                                        <input
                                            type="text"
                                            placeholder="Une ville, un hotel..."
                                            value={searchTerm}
                                            className="bg-transparent border-none outline-none w-full text-white placeholder:text-white/15 text-base font-light"
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
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
                                                    {s.city ? <MapPin className="w-3.5 h-3.5 text-gold" /> : <Compass className="w-3.5 h-3.5 text-gold/70" />}
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
            <div className="max-w-7xl mx-auto px-6 pt-28 pb-24 relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 pb-8 border-b border-white/[0.06] gap-4">
                    <h2 className="text-2xl font-serif text-white">
                        <span className="text-white/30">Selection a</span>{" "}
                        <span className="text-gold italic">{selectedLocation}</span>
                    </h2>
                    <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08]">
                        <Bed className="w-3.5 h-3.5 text-gold" />
                        <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">{hotels.length} Etablissements</span>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="animate-pulse bg-white/[0.03] rounded-[32px] h-[440px] border border-white/[0.06]" />
                        ))}
                    </div>
                ) : hotels.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="bg-white/[0.03] rounded-[40px] p-20 text-center border border-white/[0.06]">
                        <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-gold/20">
                            <Bed className="w-9 h-9 text-gold/50" />
                        </div>
                        <h3 className="text-xl font-serif text-white mb-3">Horizon inexplore</h3>
                        <p className="text-white/30 text-sm max-w-xs mx-auto mb-8">Essayez Paris ou Dubai pour commencer.</p>
                        <button onClick={() => { setSearchTerm("Dubai"); fetchHotels("Dubai"); }}
                            className="text-gold text-xs font-black uppercase tracking-widest hover:text-yellow-300 transition-colors">
                            Explorer Dubai
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {hotels.map((hotel, idx) => (
                            <motion.div key={hotel.id}
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: idx * 0.07 }}
                                className="group relative bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-gold/25 rounded-[32px] overflow-hidden transition-all duration-500"
                            >
                                <div className="relative h-60 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/20 to-transparent z-10" />
                                    <img src={hotel.image_url} alt={hotel.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1500ms]" />
                                    <div className="absolute top-5 left-5 z-20 flex flex-col gap-1.5">
                                        <span className="bg-[#0A0D14]/80 backdrop-blur-md text-white/80 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-white/10">
                                            {hotel.category || "Hotel"}
                                        </span>
                                        {hotel.stars === 5 && (
                                            <span className="bg-gold text-[#0A0D14] px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider">Palace</span>
                                        )}
                                    </div>
                                    <div className="absolute top-5 right-5 z-20">
                                        <div className="bg-[#0A0D14]/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-white/10">
                                            <Star className="w-3 h-3 text-gold fill-gold" /> {hotel.rating}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-7">
                                    <div className="flex gap-0.5 mb-2.5 text-gold">
                                        {[...Array(hotel.stars)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
                                    </div>
                                    <h3 className="font-serif text-xl text-white mb-2 group-hover:text-gold transition-colors line-clamp-1">{hotel.name}</h3>
                                    <p className="text-white/30 text-xs leading-relaxed line-clamp-2 mb-6">{hotel.description}</p>
                                    <div className="flex items-center justify-between pt-5 border-t border-white/[0.06]">
                                        <div>
                                            <p className="text-[8px] text-white/20 uppercase tracking-[0.15em] mb-1">Prix / nuit</p>
                                            <p className="text-2xl font-serif text-white">{hotel.price_per_night} <span className="text-base text-gold">{hotel.currency}</span></p>
                                        </div>
                                        <button onClick={() => handleBook(hotel)}
                                            className="bg-gold text-[#0A0D14] hover:bg-yellow-400 transition-all px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center gap-1.5 active:scale-95">
                                            Reserver <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-24 relative">
                    <div className="absolute inset-0 bg-gold/8 rounded-[40px] blur-[80px]" />
                    <div className="relative bg-white/[0.03] rounded-[40px] p-14 border border-white/[0.06] hover:border-gold/20 transition-colors overflow-hidden">
                        <div className="absolute top-0 right-0 w-72 h-72 bg-gold/[0.06] blur-[100px] rounded-full -mr-36 -mt-36" />
                        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                            <div className="flex-1">
                                <p className="text-[9px] text-gold/60 uppercase tracking-[0.3em] font-black mb-4">Conciergerie</p>
                                <h2 className="text-3xl md:text-4xl font-serif text-white mb-5">AIVANA <span className="text-gold italic">Luxe</span></h2>
                                <p className="text-white/35 mb-8 max-w-md leading-relaxed">Acces exclusif, suite particuliere ou vol prive. Notre IA gere tout pour vous.</p>
                                <button onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
                                    className="bg-gold text-[#0A0D14] px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all flex items-center gap-2.5">
                                    <Sparkles className="w-4 h-4" /> Activer mon Concierge
                                </button>
                            </div>
                            <div className="w-32 h-32 rounded-3xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                                <Bed className="w-14 h-14 text-gold/40" />
                            </div>
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
                            <h2 className="font-serif text-3xl text-white mb-2 text-center">Planifier ce <span className="text-gold italic">sejour</span></h2>
                            <p className="text-white/25 text-center text-sm mb-8">Associez cet hotel a un voyage.</p>
                            <div className="space-y-3 max-h-72 overflow-y-auto mb-8">
                                {trips.length > 0 ? trips.map(trip => (
                                    <button key={trip.id} onClick={() => confirmBooking(trip.id)}
                                        className="w-full text-left p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-gold/40 transition-all flex items-center justify-between group">
                                        <div>
                                            <p className="text-white font-serif text-lg group-hover:text-gold transition-colors">{trip.title}</p>
                                            <p className="text-[9px] text-white/20 uppercase tracking-widest mt-1">{trip.destination_name || "Destination"}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gold/25 group-hover:text-gold transition-colors" />
                                    </button>
                                )) : <p className="text-center text-white/20 py-8 text-sm">Aucun voyage actif</p>}
                            </div>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { if (selectedHotel) window.open(selectedHotel.booking_url, "_blank"); setShowTripSelector(false); }}
                                    className="text-[9px] text-white/25 hover:text-gold uppercase tracking-[0.2em] transition-colors py-1 text-center">
                                    Ou reservation libre
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
