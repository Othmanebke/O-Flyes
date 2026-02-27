"use client";
import React, { useState, useEffect } from "react";
import { Search, MapPin, Calendar, Star, ArrowRight, ExternalLink, Sparkles, Plane, Clock, ChevronRight } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseJwt } from "@/lib/jwt";

interface Flight {
    id: string;
    airline: string;
    origin: string;
    destination: string;
    departure: string;
    arrival: string;
    price: number;
    currency: string;
    type: string;
    booking_url: string;
}

export default function FlightsPage() {
    const router = useRouter();
    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(true);
    const [origin, setOrigin] = useState("Paris (CDG)");
    const [destination, setDestination] = useState("Marrakech (RAK)");
    const [userId, setUserId] = useState<string | null>(null);
    const [trips, setTrips] = useState<any[]>([]);
    const [showTripSelector, setShowTripSelector] = useState(false);
    const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

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
        fetchFlights("Marrakech");
    }, []);

    const fetchTrips = async (uid: string) => {
        try {
            const res = await axios.get(`/api/db/trips/user/${uid}`);
            setTrips(res.data || []);
        } catch (err) {
            console.error("Failed to fetch trips", err);
        }
    };

    const fetchFlights = async (dst: string) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/partner/flights/search?destination=${dst}`);
            setFlights(res.data);
        } catch (err) {
            console.error("Failed to fetch flights", err);
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
        fetchFlights(destination);
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
            trackClick('flight');
            window.open(flight.booking_url, "_blank");
        }
    };

    const confirmBooking = async (tripId: string) => {
        if (!selectedFlight || !userId) return;

        try {
            await axios.post("/api/db/bookings", {
                trip_id: tripId,
                type: 'flight',
                title: `Vol ${selectedFlight.airline} : ${selectedFlight.origin} → ${selectedFlight.destination}`,
                provider: selectedFlight.airline,
                price: selectedFlight.price,
                currency: selectedFlight.currency,
                status: 'pending',
                external_url: selectedFlight.booking_url,
                start_date: selectedFlight.departure,
                end_date: selectedFlight.arrival
            });

            setShowTripSelector(false);
            trackClick('flight');
            window.open(selectedFlight.booking_url, "_blank");
        } catch (err) {
            console.error("Failed to create pending flight booking", err);
            alert("Une erreur est survenue lors de la planification.");
            window.open(selectedFlight.booking_url, "_blank");
        }
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-[#f9f7f4] pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header Section */}
                <div className="mb-12">
                    <h1 className="font-serif text-5xl text-dark mb-4">Réserver un vol</h1>
                    <p className="text-dark-400 text-lg max-w-2xl">
                        Comparez les meilleures offres et envolez-vous vers votre prochaine destination.
                    </p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-16">
                    <div className="flex flex-col lg:flex-row gap-4 p-2 bg-white rounded-3xl shadow-xl shadow-dark/5 border border-sand-200">
                        <div className="flex-1 flex items-center px-4 gap-3 border-b lg:border-b-0 lg:border-r border-sand-200 py-3">
                            <MapPin className="w-5 h-5 text-gold" />
                            <div className="flex-1">
                                <p className="text-[10px] text-dark-400 uppercase font-bold tracking-wider">Départ</p>
                                <input
                                    type="text"
                                    placeholder="D'où partez-vous ?"
                                    className="bg-transparent border-none outline-none w-full text-dark font-medium"
                                    value={origin}
                                    onChange={(e) => setOrigin(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex-1 flex items-center px-4 gap-3 border-b lg:border-b-0 lg:border-r border-sand-200 py-3">
                            <MapPin className="w-5 h-5 text-gold" />
                            <div className="flex-1">
                                <p className="text-[10px] text-dark-400 uppercase font-bold tracking-wider">Arrivée</p>
                                <input
                                    type="text"
                                    placeholder="Où allez-vous ?"
                                    className="bg-transparent border-none outline-none w-full text-dark font-medium"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                />
                            </div>
                        </div>
                        <button type="submit" className="bg-dark text-white font-bold px-10 py-4 rounded-2xl hover:bg-dark/90 transition-all flex items-center justify-center gap-2">
                            <Search className="w-5 h-5" />
                            Trouver un vol
                        </button>
                    </div>
                </form>

                {/* Results List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-serif text-dark flex items-center gap-2">
                            Vols vers <span className="text-gold-500">{destination || "Marrakech"}</span>
                            <Plane className="w-5 h-5 text-gold inline opacity-60" />
                        </h2>
                        <span className="text-dark-400 text-sm">{flights.length} vols trouvés</span>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse bg-white rounded-3xl h-24 border border-sand-200 shadow-sm shadow-dark/5"></div>
                            ))}
                        </div>
                    ) : flights.length === 0 ? (
                        <div className="bg-white rounded-3xl p-20 text-center border border-sand-200">
                            <div className="text-4xl mb-6">✈️</div>
                            <h3 className="text-xl font-bold text-dark mb-2">Aucun vol trouvé</h3>
                            <p className="text-dark-400">Essayez une autre destination.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {flights.map((flight) => (
                                <div key={flight.id} className="group bg-white rounded-3xl border border-sand-200 overflow-hidden hover:shadow-xl hover:shadow-dark/5 transition-all duration-300 p-6">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="flex items-center gap-6 w-full md:w-auto">
                                            <div className="w-12 h-12 bg-sand-50 rounded-2xl flex items-center justify-center">
                                                <Plane className="w-6 h-6 text-dark" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-dark text-lg">{flight.airline}</p>
                                                <p className="text-dark-400 text-xs uppercase tracking-widest">{flight.type}</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 flex items-center justify-center gap-10 w-full">
                                            <div className="text-center">
                                                <p className="text-2xl font-serif text-dark">{formatTime(flight.departure)}</p>
                                                <p className="text-dark-400 text-xs">{flight.origin.split('(')[1].replace(')', '')}</p>
                                            </div>
                                            <div className="flex flex-col items-center flex-1 max-w-[200px]">
                                                <p className="text-[10px] text-dark-400 uppercase font-bold tracking-tighter mb-1">3h 15m</p>
                                                <div className="w-full h-px bg-sand-200 relative">
                                                    <div className="absolute -top-1 right-0 w-2 h-2 rounded-full border border-sand-200 bg-white"></div>
                                                    <div className="absolute -top-1 left-0 w-2 h-2 rounded-full border border-sand-200 bg-white"></div>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-serif text-dark">{formatTime(flight.arrival)}</p>
                                                <p className="text-dark-400 text-xs">{flight.destination.split('(')[1].replace(')', '')}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                                            <div className="text-right">
                                                <p className="text-[10px] text-dark-400 uppercase tracking-widest mb-1">Prix TTC</p>
                                                <p className="text-2xl font-serif text-dark">{flight.price} {flight.currency}</p>
                                            </div>
                                            <button
                                                onClick={() => handleBook(flight)}
                                                className="bg-dark text-white font-bold px-8 py-3 rounded-2xl hover:bg-gold hover:text-dark transition-all flex items-center gap-2 group/btn shadow-lg shadow-dark/10"
                                            >
                                                Sélectionner
                                                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* AI CTA */}
                <div className="mt-20 bg-dark rounded-[40px] p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold opacity-10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-serif text-white mb-4">Besoin d'aide pour choisir ?</h2>
                        <p className="text-white/60 mb-8 max-w-xl mx-auto">
                            Notre IA peut comparer les escales, les durées et les prix pour vous trouver le vol idéal.
                        </p>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
                            className="bg-gold hover:bg-gold-300 text-dark px-10 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 mx-auto"
                        >
                            <Sparkles className="w-5 h-5" /> Analyser les vols
                        </button>
                    </div>
                </div>

                {/* Trip Selector Modal */}
                {showTripSelector && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                            <h2 className="font-serif text-3xl text-dark mb-2">Associer à un voyage</h2>
                            <p className="text-dark-400 mb-8">Pour quel voyage planifiez-vous ce vol ?</p>

                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 mb-8">
                                {trips.map(trip => (
                                    <button
                                        key={trip.id}
                                        onClick={() => confirmBooking(trip.id)}
                                        className="w-full text-left p-4 rounded-2xl border border-sand-200 hover:border-gold hover:bg-gold/5 transition-all group flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="font-bold text-dark">{trip.title}</p>
                                            <p className="text-xs text-dark-400">{trip.destination_name || "Destination non définie"}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-dark-200 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        if (selectedFlight) window.open(selectedFlight.booking_url, "_blank");
                                        setShowTripSelector(false);
                                    }}
                                    className="text-sm font-bold text-dark-400 hover:text-dark py-2 transition-colors"
                                >
                                    Continuer sans associer
                                </button>
                                <button
                                    onClick={() => setShowTripSelector(false)}
                                    className="bg-dark text-white font-bold py-4 rounded-2xl hover:bg-dark/90 transition-all"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
