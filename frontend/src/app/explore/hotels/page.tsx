"use client";
import React, { useState, useEffect } from "react";
import { Search, MapPin, Calendar, Star, ArrowRight, ExternalLink, Sparkles, Bed, History, Compass } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { parseJwt } from "@/lib/jwt";
import { motion, AnimatePresence } from "framer-motion";

interface Hotel {
    id: string;
    name: string;
    city: string;
    country: string;
    price_per_night: number;
    currency: string;
    rating: number;
    stars: number;
    category?: string;
    image_url: string;
    description: string;
    booking_url: string;
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
                if (payload && payload.id) {
                    setUserId(payload.id);
                    fetchTrips(payload.id);
                }
            } catch (e) {
                console.error("Invalid token", e);
            }
        }
        fetchHotels("Paris");
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

    const fetchHotels = async (city: string) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/partner/hotels/search?city=${city}`);
            setHotels(res.data);
        } catch (err) {
            console.error("Failed to fetch hotels", err);
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
            fetchHotels(searchTerm);
        }
    };

    const handleSelectSuggestion = (suggestion: any) => {
        setSearchTerm(suggestion.label);
        const searchCity = suggestion.city || suggestion.country;
        setSelectedLocation(searchCity);
        setShowSuggestions(false);
        fetchHotels(searchCity);
    };

    const handleBook = async (hotel: Hotel) => {
        if (!userId) {
            router.push("/auth/login");
            return;
        }

        setSelectedHotel(hotel);
        if (trips.length > 0) {
            setShowTripSelector(true);
        } else {
            trackClick('hotel');
            window.open(hotel.booking_url, "_blank");
        }
    };

    const confirmBooking = async (tripId: string) => {
        if (!selectedHotel || !userId) return;

        try {
            await axios.post("/api/db/bookings", {
                trip_id: tripId,
                type: 'hotel',
                title: selectedHotel.name,
                provider: 'Partner',
                price: selectedHotel.price_per_night,
                currency: selectedHotel.currency,
                status: 'pending',
                external_url: selectedHotel.booking_url
            });

            setShowTripSelector(false);
            trackClick('hotel');
            window.open(selectedHotel.booking_url, "_blank");
        } catch (err) {
            console.error("Failed to create pending hotel booking", err);
            alert("Une erreur est survenue lors de la planification.");
            window.open(selectedHotel.booking_url, "_blank");
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0D14] relative overflow-hidden pt-32 pb-20">
            {/* Premium Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-gold/5 blur-[100px] rounded-full delay-1000"></div>
                <div className="absolute top-[20%] right-[15%] w-px h-64 bg-gradient-to-b from-transparent via-gold/20 to-transparent"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                        <Bed className="w-3 h-3" /> Hébergements d'Exception
                    </div>
                    <h1 className="font-serif text-6xl md:text-7xl text-white mb-6 leading-tight">
                        Trouvez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-300 to-gold">refuge idéal</span>
                    </h1>
                    <p className="text-white/40 text-lg max-w-2xl mx-auto">
                        Des palaces légendaires aux retraites confidentielles, nous avons sélectionné le meilleur du monde pour vos nuits.
                    </p>
                </motion.div>

                {/* Search Bar Implementation */}
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
                                    placeholder="Une destination, un hôtel..."
                                    className="bg-transparent border-none outline-none w-full text-white text-lg placeholder:text-white/20 font-light"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                                />
                            </div>
                            <button type="submit" className="bg-gold text-dark font-black px-10 py-5 rounded-[24px] hover:bg-gold-300 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-gold/10 active:scale-95">
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
                                                {suggestion.city ? <MapPin className="w-4 h-4 text-gold" /> : <Compass className="w-4 h-4 text-gold-300" />}
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

                {/* Results Section */}
                <div className="relative">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-3xl font-serif text-white">
                                Sélection à <span className="text-gold italic">{selectedLocation}</span>
                            </h2>
                            <div className="h-px w-24 bg-gradient-to-r from-gold/50 to-transparent hidden md:block"></div>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            <History className="w-4 h-4 text-gold/60" />
                            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{hotels.length} Établissements trouvés</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="animate-pulse bg-white/5 rounded-[40px] h-[500px] border border-white/10"></div>
                            ))}
                        </div>
                    ) : hotels.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-white/5 backdrop-blur-xl rounded-[40px] p-24 text-center border border-white/10"
                        >
                            <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-gold/20">
                                <Bed className="w-10 h-10 text-gold" />
                            </div>
                            <h3 className="text-2xl font-serif text-white mb-4">Horizon inexploré</h3>
                            <p className="text-white/40 max-w-sm mx-auto mb-10">
                                Nous n'avons pas encore d'hôtels répertoriés ici. Essayez une destination comme "Paris" ou "Dubaï".
                            </p>
                            <button onClick={() => { setSearchTerm("Dubaï"); fetchHotels("Dubaï"); }} className="text-gold font-bold uppercase tracking-widest text-xs hover:text-white transition-colors">
                                Explorer Dubaï
                            </button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {hotels.map((hotel, idx) => (
                                <motion.div
                                    key={hotel.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group relative bg-[#141822]/40 backdrop-blur-2xl rounded-[40px] border border-white/5 overflow-hidden hover:border-gold/40 transition-all duration-500 shadow-2xl"
                                >
                                    {/* Image Section */}
                                    <div className="relative h-72 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#141822] via-transparent to-transparent z-10 opacity-60"></div>
                                        <img
                                            src={hotel.image_url}
                                            alt={hotel.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out"
                                        />

                                        {/* Badges */}
                                        <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
                                            <span className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] text-dark shadow-xl">
                                                {hotel.category || "Hôtel"}
                                            </span>
                                            {hotel.stars === 5 && (
                                                <span className="bg-gradient-to-r from-[#B8860B] to-[#FFD700] text-dark px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-lg w-fit">
                                                    ✨ Palace & Luxe
                                                </span>
                                            )}
                                        </div>

                                        <div className="absolute top-6 right-6 z-20">
                                            <div className="bg-dark/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl">
                                                <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                                                {hotel.rating}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-8">
                                        <div className="mb-6">
                                            <div className="flex gap-0.5 mb-3 text-gold">
                                                {[...Array(hotel.stars)].map((_, i) => (
                                                    <Star key={i} className="w-3 h-3 fill-current" />
                                                ))}
                                            </div>
                                            <h3 className="font-serif text-2xl text-white mb-3 group-hover:text-gold transition-colors leading-tight">
                                                {hotel.name}
                                            </h3>
                                            <p className="text-white/40 text-xs leading-relaxed line-clamp-2">
                                                {hotel.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-8 border-t border-white/5">
                                            <div>
                                                <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] mb-1">Prix indicatif</p>
                                                <p className="text-3xl font-serif text-white">
                                                    {hotel.price_per_night}
                                                    <span className="text-lg ml-1 text-gold">{hotel.currency}</span>
                                                    <span className="text-[10px] text-white/20 ml-2 font-sans tracking-normal font-normal lowercase">/nuit</span>
                                                </p>
                                            </div>

                                            {/* Luxury Reserve Button */}
                                            <button
                                                onClick={() => handleBook(hotel)}
                                                className="relative group/btn h-14 w-14 rounded-2xl border border-gold/30 flex items-center justify-center overflow-hidden transition-all hover:w-32"
                                            >
                                                <div className="absolute inset-0 bg-gold translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
                                                <span className="absolute left-12 text-[10px] font-bold text-dark uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-opacity delay-100">Réserver</span>
                                                <ExternalLink className="w-5 h-5 text-gold group-hover/btn:text-dark relative z-10 transition-colors" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* VIP Services CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-32 relative group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-gold/40 to-gold-600 rounded-[50px] blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
                    <div className="relative bg-[#141822] rounded-[50px] p-16 border border-white/10 overflow-hidden group-hover:border-gold/30 transition-all">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[120px] rounded-full -mr-48 -mt-48 transition-transform group-hover:scale-150 duration-1000"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">Conciergerie <span className="text-gold italic">AIVANA Luxe</span></h2>
                                <p className="text-white/60 text-lg mb-10 max-w-xl">
                                    Besoin d'un accès exclusif, d'une suite particulière ou d'un vol privé ? Notre IA gère l'impossible pour vous.
                                </p>
                                <button
                                    onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
                                    className="bg-white text-dark hover:bg-gold hover:text-dark px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-2xl flex items-center gap-3 mx-auto md:mx-0 active:scale-95"
                                >
                                    <Sparkles className="w-4 h-4" /> Activer mon Concierge
                                </button>
                            </div>
                            <div className="w-full md:w-1/3 aspect-square relative">
                                <div className="absolute inset-0 bg-gold/10 rounded-3xl rotate-6 animate-pulse"></div>
                                <div className="absolute inset-0 bg-[#0A0B10] border border-white/5 rounded-3xl flex items-center justify-center p-8">
                                    <Bed className="w-24 h-24 text-gold opacity-80" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Trip Selector Modal */}
                <AnimatePresence>
                    {showTripSelector && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setShowTripSelector(false)}
                                className="absolute inset-0 bg-[#06080C]/90 backdrop-blur-xl"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-[#141822] border border-white/10 rounded-[48px] w-full max-w-xl p-12 shadow-2xl"
                            >
                                <div className="mb-10 text-center">
                                    <h2 className="font-serif text-4xl text-white mb-3">Planifier ce séjour</h2>
                                    <p className="text-white/40">Associez cet hôtel à l'un de vos voyages en cours.</p>
                                </div>

                                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 mb-10 custom-scrollbar">
                                    {trips.length > 0 ? trips.map(trip => (
                                        <button
                                            key={trip.id}
                                            onClick={() => confirmBooking(trip.id)}
                                            className="w-full text-left p-6 rounded-[28px] bg-white/[0.03] border border-white/5 hover:border-gold/50 hover:bg-gold/5 transition-all group flex items-center justify-between"
                                        >
                                            <div>
                                                <p className="font-bold text-white text-lg group-hover:text-gold transition-colors">{trip.title}</p>
                                                <p className="text-xs text-white/30 uppercase tracking-widest mt-1">{trip.destination_name || "Destination"}</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold group-hover:translate-x-1 transition-all">
                                                <ArrowRight className="w-5 h-5 text-white group-hover:text-dark" />
                                            </div>
                                        </button>
                                    )) : (
                                        <div className="text-center py-10 opacity-40">Aucun voyage actif</div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={() => {
                                            if (selectedHotel) window.open(selectedHotel.booking_url, "_blank");
                                            setShowTripSelector(false);
                                        }}
                                        className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] hover:text-gold transition-colors py-2"
                                    >
                                        Ou faire une réservation libre
                                    </button>
                                    <button
                                        onClick={() => setShowTripSelector(false)}
                                        className="bg-white/5 text-white/60 font-bold py-5 rounded-[24px] hover:bg-white/10 transition-all border border-white/10"
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
