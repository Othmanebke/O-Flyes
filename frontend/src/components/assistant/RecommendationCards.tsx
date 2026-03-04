"use client";

import { useState } from "react";
import { Recommendation } from "@/lib/mockRecommendations";
import { Plane, Hotel, Calendar, CreditCard, Sparkles, Loader2, ArrowUpRight } from "lucide-react";
import axios from "axios";

interface RecommendationCardsProps {
    recommendations: Recommendation[];
}

export function RecommendationCards({ recommendations }: RecommendationCardsProps) {
    const [savingId, setSavingId] = useState<string | null>(null);
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

    const handleSaveToDashboard = async (rec: Recommendation) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
            // Not logged in -> Redirect to login
            window.location.href = "/auth/login";
            return;
        }

        try {
            setSavingId(rec.id);
            console.log("add_to_dashboard", rec);

            // Parse JWT to get user ID
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join(''));
            const payload = JSON.parse(jsonPayload);

            // We don't have exact dates from the mock yet, just a period, so we make some up locally for the DB
            const startDate = new Date();
            startDate.setDate(startDate.getDate() + 30); // 1 month from now
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 7); // 1 week duration

            await axios.post("/api/db/trips", {
                user_id: payload.id,
                title: `Voyage à ${rec.destination}`,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                budget: rec.budgetTotal,
            });

            setSavedIds((prev) => new Set(prev).add(rec.id));
        } catch (err: any) {
            console.error("Erreur lors de l'ajout au dashboard", err.message);
            alert("Erreur lors de l'ajout au dashboard.");
        } finally {
            setSavingId(null);
        }
    };

    const getTierBadge = (budget: number) => {
        if (budget < 500) return <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-xs border border-white/10">Essentiel</span>;
        if (budget < 1500) return <span className="bg-[#C9A84C]/20 text-[#C9A84C] px-2 py-0.5 rounded text-xs border border-[#C9A84C]/30">Confort</span>;
        if (budget < 3000) return <span className="bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded text-xs border border-purple-500/30">Premium</span>;
        return <span className="bg-rose-900/40 text-rose-300 px-2 py-0.5 rounded text-xs border border-rose-500/30">Prestige</span>;
    };

    if (!recommendations || recommendations.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {recommendations.map((rec) => (
                <div key={rec.id} className="bg-dark-900/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-[#C9A84C]/50 transition-all duration-300 flex flex-col group shadow-xl">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                    {rec.destination} <span className="text-xl">{rec.emoji}</span>
                                </h3>
                                <p className="text-gray-400 text-sm mt-1">{rec.country}</p>
                            </div>
                            {getTierBadge(rec.budgetTotal)}
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed mb-4">{rec.description}</p>
                        <div className="inline-flex items-center gap-2 bg-dark-800 rounded-lg px-3 py-1.5 border border-white/5">
                            <Calendar className="w-4 h-4 text-[#C9A84C]" />
                            <span className="text-xs text-gray-200">Meilleure période : <span className="text-white font-medium">{rec.bestPeriod}</span></span>
                        </div>
                    </div>

                    {/* Budget & Details */}
                    <div className="p-6 bg-dark-800/50 flex-1">
                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-3xl font-bold text-[#C9A84C]">{rec.budgetTotal}€</span>
                            <span className="text-xs text-gray-400 mb-1">budget estimé</span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                <span className="text-gray-400 flex items-center gap-2"><Plane className="w-4 h-4" /> Vol estimé</span>
                                <span className="text-white">~{rec.budgetBreakdown.flight}€</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                <span className="text-gray-400 flex items-center gap-2"><Hotel className="w-4 h-4" /> Hôtel / nuit</span>
                                <span className="text-white">~{rec.budgetBreakdown.hotelPerNight}€</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                <span className="text-gray-400 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Budget sur place</span>
                                <span className="text-white">~{rec.budgetBreakdown.extras}€</span>
                            </div>
                        </div>

                        {/* Hotels Recommendation */}
                        <div className="mt-6">
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Hôtels recommandés</p>
                            <div className="space-y-2">
                                {rec.hotels.map((hotel, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-dark-900 p-2.5 rounded-xl border border-white/5">
                                        <div>
                                            <p className="text-sm text-gray-200 font-medium">{hotel.name}</p>
                                            <p className="text-xs text-[#C9A84C] flex items-center gap-1 mt-0.5">
                                                ⭐ {hotel.rating}
                                            </p>
                                        </div>
                                        <span className="text-sm text-gray-400 font-medium">{hotel.pricePerNight}€/n</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 pt-0 mt-4 bg-dark-800/50 flex flex-col gap-3">
                        <a
                            href={rec.partnerLinks.hotelsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full bg-[#C9A84C] hover:bg-[#b09340] text-dark-900 font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            Réserver sur Booking <ArrowUpRight className="w-4 h-4" />
                        </a>
                        <button
                            onClick={() => handleSaveToDashboard(rec)}
                            disabled={savingId === rec.id || savedIds.has(rec.id)}
                            className="w-full bg-transparent border border-white/20 hover:border-white/50 text-white font-medium py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:border-white/20"
                        >
                            {savingId === rec.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : savedIds.has(rec.id) ? (
                                "✓ Sauvegardé"
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 text-[#C9A84C]" /> Ajouter au dashboard
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
