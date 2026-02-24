"use client";
import React, { useState, useEffect } from "react";
import { Search, MapPin, Calendar, Star, ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    const [searchTerm, setSearchTerm] = useState("Marrakech");
    const [userId, setUserId] = useState<string | null>(null);
    const [trips, setTrips] = useState<any[]>([]);
    const [showTripSelector, setShowTripSelector] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserId(payload.id);
                fetchTrips(payload.id);
            } catch (e) {
                console.error("Invalid token", e);
            }
        }
        fetchActivities("Marrakech");
    }, []);

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
        fetchActivities(searchTerm);
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
        <div className="min-h-screen bg-[#f9f7f4] pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header Section */}
                <div className="mb-12">
                    <h1 className="font-serif text-5xl text-dark mb-4">Explorer des expériences</h1>
                    <p className="text-dark-400 text-lg max-w-2xl">
                        Réservez les meilleures activités, visites guidées et aventures pour votre prochain voyage.
                    </p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-16">
                    <div className="flex flex-col md:flex-row gap-4 p-2 bg-white rounded-3xl shadow-xl shadow-dark/5 border border-sand-200">
                        <div className="flex-1 flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-sand-200 py-3">
                            <MapPin className="w-5 h-5 text-gold" />
                            <input
                                type="text"
                                placeholder="Quelle destination ?"
                                className="bg-transparent border-none outline-none w-full text-dark font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="bg-dark text-white font-bold px-8 py-4 rounded-2xl hover:bg-dark/90 transition-all flex items-center justify-center gap-2">
                            <Search className="w-5 h-5" />
                            Rechercher
                        </button>
                    </div>
                </form>

                {/* Results Grid */}
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-serif text-dark flex items-center gap-2">
                            Activités à <span className="text-gold-500">{searchTerm || "Marrakech"}</span>
                            <Sparkles className="w-5 h-5 text-gold inline opacity-60" />
                        </h2>
                        <span className="text-dark-400 text-sm">{activities.length} résultats trouvés</span>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse bg-white rounded-3xl h-96 border border-sand-200 shadow-sm shadow-dark/5"></div>
                            ))}
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="bg-white rounded-3xl p-20 text-center border border-sand-200">
                            <div className="text-4xl mb-6">🏜️</div>
                            <h3 className="text-xl font-bold text-dark mb-2">Aucune activité trouvée</h3>
                            <p className="text-dark-400">Essayez une autre destination comme "Marrakech".</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {activities.map((activity) => (
                                <div key={activity.id} className="group bg-white rounded-3xl border border-sand-200 overflow-hidden hover:shadow-2xl hover:shadow-dark/10 transition-all duration-500">
                                    <div className="relative h-64 overflow-hidden">
                                        <img
                                            src={activity.image_url}
                                            alt={activity.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-dark shadow-sm">
                                                Activités
                                            </span>
                                        </div>
                                        <div className="absolute top-4 right-4">
                                            <div className="bg-dark/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                <Star className="w-3 h-3 text-gold fill-gold" />
                                                {activity.rating}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-serif text-xl text-dark leading-tight group-hover:text-gold-600 transition-colors">
                                                {activity.title}
                                            </h3>
                                        </div>

                                        <p className="text-dark-400 text-sm mb-6 line-clamp-2">
                                            {activity.description}
                                        </p>

                                        <div className="flex items-center justify-between pt-6 border-t border-sand-100">
                                            <div>
                                                <p className="text-[10px] text-dark-400 uppercase tracking-widest mb-1">À partir de</p>
                                                <p className="text-2xl font-serif text-dark">{activity.price} {activity.currency}</p>
                                            </div>
                                            <button
                                                onClick={() => handleBook(activity)}
                                                className="bg-sand-50 hover:bg-gold text-dark font-bold p-4 rounded-2xl transition-all group/btn shadow-md shadow-dark/5"
                                            >
                                                <ExternalLink className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
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
                        <h2 className="text-3xl font-serif text-white mb-4">Besoin d'un itinéraire sur mesure ?</h2>
                        <p className="text-white/60 mb-8 max-w-xl mx-auto">
                            Laissez notre IA planifier votre journée parfaite incluant ces activités et bien d'autres découvertes locales.
                        </p>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
                            className="bg-gold hover:bg-gold-300 text-dark px-10 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 mx-auto"
                        >
                            <Sparkles className="w-5 h-5" /> Planifier avec l'IA
                        </button>
                    </div>
                </div>

                {/* Trip Selector Modal */}
                {showTripSelector && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                            <h2 className="font-serif text-3xl text-dark mb-2">Choisir un voyage</h2>
                            <p className="text-dark-400 mb-8">Pour quel voyage souhaitez-vous planifier cette activité ?</p>

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
                                        if (selectedActivity) window.open(selectedActivity.booking_url, "_blank");
                                        setShowTripSelector(false);
                                    }}
                                    className="text-sm font-bold text-dark-400 hover:text-dark py-2 transition-colors"
                                >
                                    Réserver sans associer à un voyage
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
