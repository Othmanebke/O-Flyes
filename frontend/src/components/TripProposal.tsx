"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
    Sparkles, Loader2, MapPin, Compass, RefreshCcw, Car, ArrowRight, Calendar, Info
} from "lucide-react";
import { motion } from "framer-motion";

interface RoadtripStep {
    dayRange: string;
    locationName: string;
    country: string;
    description: string;
    transportToNext?: string;
    estimatedCost?: string;
    activities: string[];
}

interface RoadtripProposalData {
    title: string;
    summary: string;
    totalDays: number;
    steps: RoadtripStep[];
    generatedAt?: string;
}

export default function TripProposal({ tripId, destinationName }: { tripId: string, destinationName?: string }) {
    const [proposal, setProposal] = useState<RoadtripProposalData | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Load from local storage
        const cached = localStorage.getItem(`roadtrip_${tripId}`);
        if (cached) {
            try {
                setProposal(JSON.parse(cached));
            } catch (e) {
                // Error parsing, ignore
            }
        }
        setLoading(false);
    }, [tripId]);

    const handleGenerate = async () => {
        setGenerating(true);
        setError(null);
        try {
            const res = await axios.post(`/api/trips/${tripId}/proposal`, {});
            const newProposal = res.data?.proposal;
            if (newProposal) {
                setProposal(newProposal);
                localStorage.setItem(`roadtrip_${tripId}`, JSON.stringify(newProposal));
            }
        } catch (err: any) {
            setError(err?.response?.data?.error || "La génération a échoué. Réessaie dans un instant.");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-zinc-900/50 rounded-2xl border border-white/[0.04] p-12 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
            </div>
        );
    }

    if (!proposal) {
        return (
            <div className="bg-zinc-900/50 rounded-2xl border border-white/[0.04] p-8">
                <div className="flex flex-col items-center justify-center py-16 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 relative z-10">
                        <Car className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-3 relative z-10">Générateur de Roadtrip IA</h3>
                    <p className="text-zinc-400 text-sm max-w-lg mx-auto leading-relaxed mb-8 relative z-10">
                        Transformez votre voyage à <span className="text-white font-medium">{destinationName || 'cette destination'}</span> en une aventure multi-étapes. 
                        Notre IA va imaginer pour vous un <span className="text-white">roadtrip sur-mesure</span> avec les meilleures étapes, transports et activités, en se basant sur les parcours les plus célèbres !
                    </p>
                    {error && <p className="text-red-400 text-xs mb-4 relative z-10">{error}</p>}
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="flex items-center gap-2 px-8 py-3.5 bg-white text-zinc-950 font-medium text-sm rounded-lg hover:bg-zinc-200 transition-all disabled:opacity-60 relative z-10"
                    >
                        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {generating ? "Création du roadtrip..." : "Générer mon Roadtrip sur-mesure"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / regenerate */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-serif text-white">{proposal.title}</h3>
                    <p className="text-sm text-emerald-400 font-medium mt-1">Roadtrip de {proposal.totalDays} jours</p>
                    {proposal.generatedAt && <p className="text-xs text-zinc-500 mt-1">Généré le {new Date(proposal.generatedAt).toLocaleString("fr-FR")}</p>}
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-60 shrink-0"
                >
                    {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
                    Régénérer
                </button>
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            {/* Summary */}
            <div className="bg-zinc-900/50 rounded-2xl border border-white/[0.04] p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-[50px] pointer-events-none rounded-full" />
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center border bg-gold/10 border-gold/20 text-gold">
                        <Info className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500">Le concept</p>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed relative z-10">{proposal.summary}</p>
            </div>

            {/* Steps Timeline */}
            <div className="bg-zinc-900/50 rounded-2xl border border-white/[0.04] p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                        <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500">L'itinéraire détaillé</p>
                </div>

                <div className="space-y-8 relative">
                    {proposal.steps.map((step, index) => (
                        <div key={index} className="relative group">
                            {/* Vertical Line */}
                            {index !== proposal.steps.length - 1 && (
                                <div className="absolute left-[19px] top-10 bottom-[-2rem] w-[2px] bg-white/5 z-0"></div>
                            )}

                            <div className="flex gap-4 sm:gap-6 relative">
                                <div className="w-10 h-10 bg-zinc-950 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 text-emerald-400 border border-white/10 text-xs font-black shadow-xl shadow-black/50">
                                    {index + 1}
                                </div>
                                <div className="flex-1 pb-6">
                                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-2">
                                        <h4 className="text-lg font-medium text-white">{step.locationName}</h4>
                                        <span className="text-xs text-zinc-500 uppercase tracking-widest">{step.country}</span>
                                        <span className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-emerald-400/80 sm:ml-auto font-medium flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" /> {step.dayRange}
                                        </span>
                                    </div>
                                    <div className="mb-4">
                                        <p className="text-sm text-zinc-400 leading-relaxed mb-1">{step.description}</p>
                                        {step.estimatedCost && (
                                            <p className="text-[10px] uppercase tracking-wider text-gold font-bold">Estimation : {step.estimatedCost}</p>
                                        )}
                                    </div>
                                    
                                    <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 mb-4">
                                        <h5 className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-3 flex items-center gap-1.5">
                                            <Compass className="w-3 h-3 text-gold" /> À ne pas rater
                                        </h5>
                                        <ul className="space-y-2">
                                            {step.activities.map((act, i) => (
                                                <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                                                    <span className="text-gold mt-0.5">•</span> {act}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {step.transportToNext && index !== proposal.steps.length - 1 && (
                                        <div className="inline-flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg font-medium">
                                            <Car className="w-3.5 h-3.5" /> En route : {step.transportToNext} <ArrowRight className="w-3 h-3 opacity-50" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
