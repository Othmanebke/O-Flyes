"use client";
import React, { useState, useEffect } from "react";
import { Search, MapPin, Calendar, Star, ArrowRight, ExternalLink, Sparkles, Plane, Clock, ChevronRight, History, Compass, Globe, Luggage } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { parseJwt } from "@/lib/jwt";
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
        fetchFlights("Paris", "New York");
    }, []);

    // Debouncing origin
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedOrigin(originSearch), 300);
        return () => clearTimeout(timer);
    }, [originSearch]);

    // Debouncing dest
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

    const fetchTrips = async (uid: string) => {
        try {
            const res = await axios.get(`/api/db/trips/user/${uid}`);
            setTrips(res.data || []);
        } catch (err) {
            console.error("Failed to fetch trips", err);
        }
    };

    const fetchFlights = async (org: string, dst: string) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/partner/flights/search?origin=${org}&destination=${dst}`);
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
        fetchFlights(originSearch, destSearch);
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
        if (!userId) {
            router.push("/auth/login");
            return;
        }
        setSelectedFlight(flight);
        if (trips.length > 0) {
            setShowTripSelector(true);
        } else {
            window.open(flight.booking_url, "_blank");
        }
    };

    const confirmBooking = async (tripId: string) => {
        if (!selectedFlight || !userId) return;
        try {
            await axios.post("/api/db/bookings", {
                trip_id: tripId,
                type: 'flight',
                title: `Vol ${selectedFlight.airline} : ${selectedFlight.originCode} → ${selectedFlight.destinationCode}`,
                provider: selectedFlight.airline,
                price: selectedFlight.price,
                currency: selectedFlight.currency,
                status: 'pending',
                external_url: selectedFlight.booking_url
            });
            setShowTripSelector(false);
            window.open(selectedFlight.booking_url, "_blank");
        } catch (err) {
            console.error("Failed to create pending flight booking", err);
            window.open(selectedFlight.booking_url, "_blank");
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0D14] relative overflow-hidden pt-32 pb-20">
            {/* Premium Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-gold/5 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[20%] left-[-5%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                        <Plane className="w-3 h-3" /> Navigation Aérienne Privée
                    </div>
                    <h1 className="font-serif text-6xl md:text-7xl text-white mb-6 leading-tight">
                        Envolez-vous avec <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-300 to-gold">distinction</span>
                    </h1>
                    <p className="text-white/40 text-lg max-w-2xl mx-auto">
                        Accédez aux meilleures routes aériennes mondiales dans le confort et l'élégance absolue.
                    </p>
                </motion.div>

                {/* Dual Search Bar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-5xl mx-auto mb-20 relative px-4"
                >
                    <form onSubmit={handleSearch} className="relative flex flex-col md:flex-row gap-4 p-4 bg-white/[0.03] backdrop-blur-3xl rounded-[40px] border border-white/10 shadow-2xl">
                        {/* Origin Search */}
                        <div className="flex-1 relative group">
                            <div className="flex items-center px-6 gap-4 py-4 min-w-[200px]">
                                <MapPin className="w-5 h-5 text-gold/60" />
                                <div className="flex-1">
                                    <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">Origine</p>
                                    <input
                                        type="text"
                                        placeholder="Ville de départ"
                                        className="bg-transparent border-none outline-none w-full text-white text-lg placeholder:text-white/10 font-light"
                                        value={originSearch}
                                        onFocus={() => setActiveSearch("origin")}
                                        onChange={(e) => setOriginSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Switch Icon */}
                        <div className="hidden md:flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gold/40 hover:rotate-180 transition-transform cursor-pointer overflow-hidden backdrop-blur-md">
                                <Globe className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Destination Search */}
                        <div className="flex-1 relative group">
                            <div className="flex items-center px-6 gap-4 py-4 min-w-[200px]">
                                <MapPin className="w-5 h-5 text-gold" />
                                <div className="flex-1">
                                    <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">Destination</p>
                                    <input
                                        type="text"
                                        placeholder="Où allez-vous ?"
                                        className="bg-transparent border-none outline-none w-full text-white text-lg placeholder:text-white/10 font-light"
                                        value={destSearch}
                                        onFocus={() => setActiveSearch("dest")}
                                        onChange={(e) => setDestSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="bg-gold text-dark font-black px-12 py-5 rounded-[30px] hover:bg-gold-300 transition-all shadow-xl flex items-center justify-center gap-3">
                            <Search className="w-5 h-5" />
                            <span className="uppercase tracking-widest text-xs">Rechercher</span>
                        </button>

                        {/* Shared Suggestions Dropdown */}
                        <AnimatePresence>
                            {activeSearch && suggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute left-0 right-0 top-full mt-4 bg-[#141822]/95 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden z-[100] shadow-2xl p-2"
                                >
                                    {suggestions.map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSelectSuggestion(suggestion)}
                                            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-all text-left rounded-2xl group/item"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center group-hover/item:bg-gold/20 transition-colors">
                                                <Compass className="w-4 h-4 text-gold-300" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-medium text-sm group-hover/item:text-gold transition-colors">{suggestion.label}</p>
                                                <p className="text-[9px] text-white/30 uppercase tracking-widest">{suggestion.city ? 'Ville' : 'Pays'}</p>
                                            </div>
                                            <ArrowRight className="w-3 h-3 text-white/10 group-hover/item:text-gold group-hover/item:translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </motion.div>

                {/* Results Section */}
                <div className="relative">
                    <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-10">
                        <h2 className="text-3xl font-serif text-white">
                            Itinéraire <span className="text-gold italic">{originSearch} → {destSearch}</span>
                        </h2>
                        <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10">
                            <Plane className="w-4 h-4 text-gold-300 animate-pulse" />
                            <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">{flights.length} Vols Disponibles</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse bg-white/5 rounded-[40px] h-32 border border-white/10"></div>
                            ))}
                        </div>
                    ) : flights.length === 0 ? (
                        <div className="bg-white/5 backdrop-blur-2xl rounded-[50px] p-24 text-center border border-white/10">
                            <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-gold/20">
                                <Globe className="w-10 h-10 text-gold opacity-50" />
                            </div>
                            <h3 className="text-2xl font-serif text-white mb-4">Aucune liaison directe</h3>
                            <p className="text-white/30 max-w-sm mx-auto">Nos partenaires aériens ne couvrent pas encore cette route spécifique en vol direct. Essayez une autre combinaison.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {flights.map((flight, idx) => (
                                <motion.div
                                    key={flight.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group relative bg-[#141822]/40 backdrop-blur-2xl rounded-[40px] border border-white/5 p-10 hover:border-gold/30 transition-all duration-500 overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[80px] rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">

                                        {/* Airline & Class */}
                                        <div className="flex items-center gap-8 w-full lg:w-1/4">
                                            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold/40 transition-colors">
                                                <Plane className="w-10 h-10 text-gold opacity-80" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-serif text-white mb-2">{flight.airline}</h3>
                                                <div className="flex gap-2">
                                                    <span className="bg-gold/10 text-gold text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{flight.class}</span>
                                                    <span className="bg-white/5 text-white/40 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{flight.type}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Flight Timeline */}
                                        <div className="flex-1 w-full flex items-center justify-between gap-12">
                                            <div className="text-center">
                                                <p className="text-4xl font-serif text-white mb-2">{formatTime(flight.departure)}</p>
                                                <p className="text-gold font-black text-xl tracking-tighter uppercase">{flight.originCode}</p>
                                                <p className="text-white/20 text-[10px] mt-1 uppercase tracking-widest">{flight.origin}</p>
                                            </div>

                                            <div className="flex-1 relative flex flex-col items-center">
                                                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent relative">
                                                    <motion.div
                                                        initial={{ left: 0 }}
                                                        animate={{ left: "100%" }}
                                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                                        className="absolute -top-[2px] w-1 h-1 bg-gold rounded-full shadow-[0_0_10px_gold]"
                                                    ></motion.div>
                                                    <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-gold/20 rotate-90" />
                                                </div>
                                                <div className="mt-4 flex items-center gap-2 text-white/30 text-[10px] uppercase font-black tracking-widest">
                                                    <Clock className="w-3 h-3" /> {flight.duration}
                                                </div>
                                            </div>

                                            <div className="text-center">
                                                <p className="text-4xl font-serif text-white mb-2">{formatTime(flight.arrival)}</p>
                                                <p className="text-gold font-black text-xl tracking-tighter uppercase">{flight.destinationCode}</p>
                                                <p className="text-white/20 text-[10px] mt-1 uppercase tracking-widest">{flight.destination}</p>
                                            </div>
                                        </div>

                                        {/* Pricing & CTA */}
                                        <div className="flex flex-col items-end gap-6 w-full lg:w-auto border-l border-white/5 pl-12">
                                            <div className="text-right">
                                                <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.2em] mb-2">Tarif Exclusif</p>
                                                <p className="text-4xl font-serif text-white decoration-gold group-hover:underline underline-offset-8">
                                                    {flight.price} <span className="text-gold text-2xl font-sans ml-1">{flight.currency}</span>
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleBook(flight)}
                                                className="bg-white text-dark hover:bg-gold transition-all px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 active:scale-95 group/btn"
                                            >
                                                Réserver
                                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>

                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* VIP Services Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-32 relative group"
                >
                    <div className="absolute inset-0 bg-gold/10 rounded-[60px] blur-[150px] opacity-20 transition-opacity group-hover:opacity-40"></div>
                    <div className="relative bg-gradient-to-br from-[#141822] to-[#0A0D14] rounded-[60px] p-20 border border-gold/10 overflow-hidden">
                        <div className="flex flex-col md:flex-row items-center gap-20">
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-4xl md:text-5xl font-serif text-white mb-8">Service <span className="text-gold italic">Jet Privé & First Class</span></h2>
                                <p className="text-white/40 text-lg mb-12 max-w-xl">
                                    Une logistique d'exception pour vos déplacements les plus critiques. Accès aux lounges exclusifs et conciergerie VIP inclus.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
                                    <button
                                        onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
                                        className="bg-gold text-dark px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gold-300 transition-all flex items-center gap-3 justify-center"
                                    >
                                        <Sparkles className="w-5 h-5" /> Configurer mon Jet
                                    </button>
                                    <div className="flex items-center gap-4 text-white/40 text-xs px-6 py-4 rounded-2xl border border-white/5 backdrop-blur-md">
                                        <Luggage className="w-4 h-4 text-gold" /> Bagages Illimités inclus
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-1/3 aspect-square bg-white/5 rounded-full border border-gold/20 flex items-center justify-center p-12 animate-pulse">
                                <Globe className="w-full h-full text-gold/20" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Trip Selection Modal */}
                <AnimatePresence>
                    {showTripSelector && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setShowTripSelector(false)}
                                className="absolute inset-0 bg-[#06080C]/95 backdrop-blur-2xl"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-[#141822] border border-gold/20 rounded-[48px] w-full max-w-xl p-12 shadow-[0_0_100px_rgba(184,134,11,0.1)]"
                            >
                                <h2 className="font-serif text-4xl text-white mb-4 text-center">Ajouter à votre <span className="text-gold">Odyssée</span></h2>
                                <p className="text-white/30 text-center mb-12">Synchronisez ce vol avec l'un de vos itinéraires.</p>

                                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar mb-10">
                                    {trips.map(trip => (
                                        <button
                                            key={trip.id}
                                            onClick={() => confirmBooking(trip.id)}
                                            className="w-full text-left p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-gold/50 transition-all flex items-center justify-between group"
                                        >
                                            <div>
                                                <p className="text-white font-serif text-xl group-hover:text-gold transition-colors">{trip.title}</p>
                                                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-2">{trip.destination_name || 'Multi-destinations'}</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gold/30 group-hover:text-gold group-hover:translate-x-2 transition-all" />
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={() => {
                                            if (selectedFlight) window.open(selectedFlight.booking_url, "_blank");
                                            setShowTripSelector(false);
                                        }}
                                        className="text-[10px] text-white/30 hover:text-white uppercase tracking-[0.2em] transition-colors py-2 text-center"
                                    >
                                        Ou réserver directement
                                    </button>
                                    <button
                                        onClick={() => setShowTripSelector(false)}
                                        className="bg-white/5 text-white/60 font-bold py-5 rounded-[24px] hover:bg-white/10 transition-all border border-white/10"
                                    >
                                        Annuler
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
