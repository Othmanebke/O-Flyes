"use client";
import React, { useState, useEffect } from "react";
import { Search, MapPin, ArrowRight, Sparkles, Plane, Clock, Compass, Globe, Luggage, Calendar, Users, ArrowLeftRight, ChevronRight } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { motion, AnimatePresence } from "framer-motion";

interface Flight {
    id: string;
    airline: string;
    origin: string;
    originCode: string;
    destination: string;
    destinationCode: string;
    departure: string;
    arrival: string;
    duration: string;
    price: number;
    currency: string;
    type: string;
    class: string;
    booking_url: string;
}

export default function FlightsPage() {
    const router = useRouter();
    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(true);
    const [originSearch, setOriginSearch] = useState("Paris");
    const [destSearch, setDestSearch] = useState("New York");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [activeSearch, setActiveSearch] = useState<"origin" | "dest" | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [trips, setTrips] = useState<any[]>([]);
    const [showTripSelector, setShowTripSelector] = useState(false);
    const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
    const [debouncedOrigin, setDebouncedOrigin] = useState("");
    const [debouncedDest, setDebouncedDest] = useState("");
    const [departDate, setDepartDate] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() + 30);
        return d.toISOString().split('T')[0];
    });
    const [returnDate, setReturnDate] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() + 37);
        return d.toISOString().split('T')[0];
    });
    const [passengers, setPassengers] = useState(1);

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
        fetchFlights("Paris", "New York", departDate, returnDate, passengers);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedOrigin(originSearch), 300);
        return () => clearTimeout(timer);
    }, [originSearch]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedDest(destSearch), 300);
        return () => clearTimeout(timer);
    }, [destSearch]);

    useEffect(() => {
        const term = activeSearch === "origin" ? debouncedOrigin : debouncedDest;
        if (activeSearch && term.length >= 2) {
            axios.get(`/api/partner/locations/suggest?q=${term}`)
                .then(res => setSuggestions(res.data))
                .catch(err => console.error("Failed to fetch suggestions", err));
        } else {
            setSuggestions([]);
        }
    }, [debouncedOrigin, debouncedDest, activeSearch]);

    const fetchTrips = async () => {
        try {
            const res = await axios.get(`/api/trips`);
            setTrips(res.data || []);
        } catch (err) {
            console.error("Failed to fetch trips", err);
        }
    };

    const fetchFlights = async (org: string, dst: string, dep?: string, ret?: string, adults?: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                origin: org,
                destination: dst,
                ...(dep ? { depart: dep } : {}),
                ...(ret ? { return: ret } : {}),
                adults: String(adults || 1),
            });
            const res = await axios.get(`/api/partner/flights/search?${params}`);
            setFlights(res.data);
        } catch (err) {
            console.error("Failed to fetch flights", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setActiveSearch(null);
        fetchFlights(originSearch, destSearch, departDate, returnDate, passengers);
    };

    const handleSwap = () => {
        setOriginSearch(destSearch);
        setDestSearch(originSearch);
    };

    const handleSelectSuggestion = (suggestion: any) => {
        const label = suggestion.city || suggestion.label;
        if (activeSearch === "origin") setOriginSearch(label);
        else setDestSearch(label);
        setActiveSearch(null);
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    };

    const handleBook = async (flight: Flight) => {
        if (!userId) { router.push("/auth/login"); return; }
        setSelectedFlight(flight);
        if (trips.length > 0) setShowTripSelector(true);
        else window.open(flight.booking_url, "_blank");
    };

    const confirmBooking = async (tripId: string) => {
        if (!selectedFlight || !userId) return;
        try {
            await axios.post(`/api/trips/${tripId}/items`, {
                type: 'flight',
                title: `Vol ${selectedFlight.airline} : ${selectedFlight.originCode} → ${selectedFlight.destinationCode}`,
                provider: selectedFlight.airline,
                price_estimate: selectedFlight.price,
                external_url: selectedFlight.booking_url
            });
            setShowTripSelector(false);
            window.dispatchEvent(new CustomEvent("bookings-updated", { detail: { tripId } }));
            window.open(selectedFlight.booking_url, "_blank");
        } catch (err) {
            console.error("Failed to create pending flight booking", err);
            window.open(selectedFlight.booking_url, "_blank");
        }
    };

    return (
        <div className="min-h-screen -mt-20" style={{ backgroundColor: 'var(--bg-primary)' }}>

            {/* ── HERO ─────────────────────────────────────────────────── */}
            <div className="relative h-[70vh] min-h-[500px]">
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1800&q=85"
                        alt="Vols"
                        className="absolute inset-0 w-full h-full object-cover scale-105"
                    />
                    {/* Gradient overlays */}
                    <div className="absolute inset-0 bg-[#0A0D14]/50" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#0A0D14]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D14]/60 via-transparent to-transparent" />

                    {/* Ambient glow */}
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/10 blur-[120px] rounded-full pointer-events-none" />
                </div>

                {/* Hero content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pt-16">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/15 border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-[0.25em] mb-6 backdrop-blur-md">
                            <Plane className="w-3 h-3" /> Navigation Aérienne Privée
                        </div>
                        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-5 leading-[1.05]">
                            Envolez-vous<br />avec <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-300 to-gold italic">distinction</span>
                        </h1>
                        <p className="text-white/50 text-lg max-w-xl mx-auto">
                            Les meilleures routes aériennes mondiales dans le confort et l'élégance absolue.
                        </p>
                    </motion.div>
                </div>

                {/* Search bar floats at bottom of hero */}
                <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-1/2 px-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-5xl mx-auto">
                        <form onSubmit={handleSearch} className="relative flex flex-col md:flex-row gap-0 bg-[#0A0D14] border border-white/10 rounded-[28px] shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-2xl">

                            {/* Origin */}
                            <div className="flex-1 flex items-center gap-4 px-6 py-5 border-b md:border-b-0 md:border-r border-white/[0.06] relative">
                                <MapPin className="w-4 h-4 text-gold/60 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] text-white/25 uppercase font-black tracking-[0.2em] mb-0.5">Départ</p>
                                    <input
                                        type="text"
                                        placeholder="Ville d'origine"
                                        className="bg-transparent border-none outline-none w-full text-white placeholder:text-white/15 text-base font-light"
                                        value={originSearch}
                                        onFocus={() => setActiveSearch("origin")}
                                        onChange={(e) => setOriginSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Swap icon */}
                            <div className="hidden md:flex items-center justify-center px-3">
                                <button type="button" onClick={handleSwap} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gold/40 hover:text-gold hover:border-gold/40 transition-colors">
                                    <ArrowLeftRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Destination */}
                            <div className="flex-1 flex items-center gap-4 px-6 py-5 border-b md:border-b-0 md:border-r border-white/[0.06]">
                                <MapPin className="w-4 h-4 text-gold shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] text-white/25 uppercase font-black tracking-[0.2em] mb-0.5">Destination</p>
                                    <input
                                        type="text"
                                        placeholder="Où allez-vous ?"
                                        className="bg-transparent border-none outline-none w-full text-white placeholder:text-white/15 text-base font-light"
                                        value={destSearch}
                                        onFocus={() => setActiveSearch("dest")}
                                        onChange={(e) => setDestSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Départ date */}
                            <div className="flex items-center gap-3 px-5 py-5 border-b md:border-b-0 md:border-r border-white/[0.06] shrink-0">
                                <Calendar className="w-4 h-4 text-gold/60 shrink-0" />
                                <div>
                                    <p className="text-[9px] text-white/25 uppercase font-black tracking-[0.2em] mb-0.5">Aller</p>
                                    <input
                                        type="date"
                                        value={departDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setDepartDate(e.target.value)}
                                        className="bg-transparent border-none outline-none text-white text-sm font-light [color-scheme:dark] cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Retour date */}
                            <div className="flex items-center gap-3 px-5 py-5 border-b md:border-b-0 md:border-r border-white/[0.06] shrink-0">
                                <Calendar className="w-4 h-4 text-white/20 shrink-0" />
                                <div>
                                    <p className="text-[9px] text-white/25 uppercase font-black tracking-[0.2em] mb-0.5">Retour</p>
                                    <input
                                        type="date"
                                        value={returnDate}
                                        min={departDate}
                                        onChange={(e) => setReturnDate(e.target.value)}
                                        className="bg-transparent border-none outline-none text-white text-sm font-light [color-scheme:dark] cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Passengers */}
                            <div className="flex items-center gap-3 px-5 py-5 border-b md:border-b-0 md:border-r border-white/[0.06] shrink-0">
                                <Users className="w-4 h-4 text-gold/60 shrink-0" />
                                <div>
                                    <p className="text-[9px] text-white/25 uppercase font-black tracking-[0.2em] mb-0.5">Passagers</p>
                                    <select
                                        value={passengers}
                                        onChange={(e) => setPassengers(parseInt(e.target.value))}
                                        className="bg-transparent border-none outline-none text-white text-sm font-light cursor-pointer"
                                    >
                                        {[1,2,3,4,5,6,7,8].map(n => (
                                            <option key={n} value={n} className="bg-[#141822]">{n} {n === 1 ? 'passager' : 'passagers'}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="bg-gold text-[#0A0D14] font-black px-8 py-5 m-2 rounded-[20px] hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest shrink-0">
                                <Search className="w-4 h-4" /> Rechercher
                            </button>

                            {/* Suggestions */}
                            <AnimatePresence>
                                {activeSearch && suggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
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
                                                    <p className="text-[9px] text-white/25 uppercase tracking-widest">{s.city ? 'Ville' : 'Pays'}</p>
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

            {/* ── RESULTS ───────────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-6 pt-40 pb-24 relative z-10">

                {/* Section header */}
                <div className="flex items-center justify-between mb-12 pb-8 border-b border-white/[0.06]">
                    <h2 className="text-2xl font-serif text-white">
                        <span className="text-white/30">Itinéraire</span> <span className="text-gold italic">{originSearch} → {destSearch}</span>
                    </h2>
                    <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08]">
                        <Plane className="w-3.5 h-3.5 text-gold" />
                        <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">{flights.length} Vols</span>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-5">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse bg-white/[0.03] rounded-3xl h-36 border border-white/[0.06]" />
                        ))}
                    </div>
                ) : flights.length === 0 ? (
                    <div className="bg-white/[0.03] rounded-[40px] p-24 text-center border border-white/[0.06]">
                        <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-gold/20">
                            <Globe className="w-9 h-9 text-gold/50" />
                        </div>
                        <h3 className="text-xl font-serif text-white mb-3">Aucune liaison directe</h3>
                        <p className="text-white/30 text-sm max-w-sm mx-auto">Essayez une autre combinaison de villes.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {flights.map((flight, idx) => (
                            <motion.div
                                key={flight.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-gold/25 rounded-3xl p-8 transition-all duration-400 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-48 h-48 bg-gold/[0.04] blur-[60px] rounded-full -mr-24 -mt-24 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">

                                    {/* Airline */}
                                    <div className="flex items-center gap-5 w-full lg:w-52 shrink-0">
                                        <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.08] group-hover:border-gold/30 flex items-center justify-center transition-colors shrink-0">
                                            <Plane className="w-6 h-6 text-gold/70" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-serif text-white truncate">{flight.airline}</h3>
                                            <div className="flex gap-1.5 mt-1 flex-wrap">
                                                <span className="bg-gold/10 text-gold text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">{flight.class}</span>
                                                <span className="bg-white/[0.05] text-white/30 text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">{flight.type}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="flex-1 w-full flex items-center justify-between gap-6">
                                        <div className="text-center shrink-0">
                                            <p className="text-3xl font-serif text-white leading-none mb-1">{formatTime(flight.departure)}</p>
                                            <p className="text-gold font-black text-base tracking-tighter uppercase">{flight.originCode}</p>
                                            <p className="text-white/20 text-[9px] mt-0.5 uppercase tracking-wider truncate max-w-[80px]">{flight.origin}</p>
                                        </div>

                                        <div className="flex-1 relative flex flex-col items-center">
                                            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent relative">
                                                <motion.div
                                                    initial={{ left: "0%" }}
                                                    animate={{ left: "100%" }}
                                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                    className="absolute -top-[3px] w-1.5 h-1.5 bg-gold rounded-full shadow-[0_0_8px_rgba(184,134,11,0.8)]"
                                                />
                                            </div>
                                            <div className="mt-3 flex items-center gap-1.5 text-white/25 text-[9px] uppercase font-black tracking-widest">
                                                <Clock className="w-2.5 h-2.5" /> {flight.duration}
                                            </div>
                                        </div>

                                        <div className="text-center shrink-0">
                                            <p className="text-3xl font-serif text-white leading-none mb-1">{formatTime(flight.arrival)}</p>
                                            <p className="text-gold font-black text-base tracking-tighter uppercase">{flight.destinationCode}</p>
                                            <p className="text-white/20 text-[9px] mt-0.5 uppercase tracking-wider truncate max-w-[80px]">{flight.destination}</p>
                                        </div>
                                    </div>

                                    {/* Price & CTA */}
                                    <div className="flex flex-col items-end gap-4 shrink-0 border-l border-white/[0.06] pl-8">
                                        <div className="text-right">
                                            <p className="text-[9px] text-white/20 uppercase tracking-[0.15em] mb-1">Tarif</p>
                                            <p className="text-3xl font-serif text-white">
                                                {flight.price} <span className="text-gold text-xl">{flight.currency}</span>
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleBook(flight)}
                                            className="bg-gold text-[#0A0D14] hover:bg-yellow-400 transition-all px-8 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 active:scale-95"
                                        >
                                            Skyscanner <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                        {(flight as any).google_flights_url && (
                                            <a
                                                href={(flight as any).google_flights_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="border border-white/10 text-white/50 hover:border-white/30 hover:text-white/80 transition-all px-5 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
                                            >
                                                <Globe className="w-3 h-3" /> Google
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* VIP CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-24 relative"
                >
                    <div className="absolute inset-0 bg-gold/8 rounded-[40px] blur-[80px]" />
                    <div className="relative bg-white/[0.03] rounded-[40px] p-14 border border-white/[0.06] hover:border-gold/20 transition-colors overflow-hidden">
                        <div className="absolute top-0 right-0 w-72 h-72 bg-gold/[0.06] blur-[100px] rounded-full -mr-36 -mt-36" />
                        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                            <div className="flex-1">
                                <p className="text-[9px] text-gold/60 uppercase tracking-[0.3em] font-black mb-4">Service Premium</p>
                                <h2 className="text-3xl md:text-4xl font-serif text-white mb-5">Jet Privé & <span className="text-gold italic">First Class</span></h2>
                                <p className="text-white/35 mb-8 max-w-md leading-relaxed">Logistique d'exception pour vos déplacements les plus critiques. Lounges exclusifs et conciergerie VIP inclus.</p>
                                <button
                                    onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
                                    className="bg-gold text-[#0A0D14] px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all flex items-center gap-2.5"
                                >
                                    <Sparkles className="w-4 h-4" /> Configurer mon vol
                                </button>
                            </div>
                            <div className="flex items-center gap-8 shrink-0">
                                <div className="text-center">
                                    <p className="text-4xl font-serif text-white mb-1">180+</p>
                                    <p className="text-[9px] text-white/25 uppercase tracking-widest">Destinations</p>
                                </div>
                                <div className="w-px h-16 bg-white/[0.06]" />
                                <div className="text-center">
                                    <Luggage className="w-10 h-10 text-gold/40 mx-auto mb-2" />
                                    <p className="text-[9px] text-white/25 uppercase tracking-widest">Bagages inclus</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ── Trip Selector Modal ────────────────────────────────── */}
            <AnimatePresence>
                {showTripSelector && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowTripSelector(false)}
                            className="absolute inset-0 bg-[#06080C]/95 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            className="relative bg-[#141822] border border-gold/15 rounded-[40px] w-full max-w-lg p-10 shadow-[0_0_80px_rgba(184,134,11,0.08)]"
                        >
                            <h2 className="font-serif text-3xl text-white mb-2 text-center">Ajouter à votre <span className="text-gold italic">Odyssée</span></h2>
                            <p className="text-white/25 text-center text-sm mb-8">Synchronisez ce vol avec un itinéraire.</p>
                            <div className="space-y-3 max-h-72 overflow-y-auto mb-8">
                                {trips.map(trip => (
                                    <button key={trip.id} onClick={() => confirmBooking(trip.id)}
                                        className="w-full text-left p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-gold/40 transition-all flex items-center justify-between group">
                                        <div>
                                            <p className="text-white font-serif text-lg group-hover:text-gold transition-colors">{trip.title}</p>
                                            <p className="text-[9px] text-white/20 uppercase tracking-widest mt-1">{trip.destination_name || 'Multi-destinations'}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gold/25 group-hover:text-gold transition-colors" />
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { if (selectedFlight) window.open(selectedFlight.booking_url, "_blank"); setShowTripSelector(false); }}
                                    className="text-[9px] text-white/25 hover:text-gold uppercase tracking-[0.2em] transition-colors py-1 text-center">
                                    Ou réserver directement
                                </button>
                                <button onClick={() => setShowTripSelector(false)}
                                    className="bg-white/[0.05] text-white/50 font-bold py-4 rounded-2xl hover:bg-white/[0.08] transition-all border border-white/[0.08] text-sm">
                                    Annuler
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
