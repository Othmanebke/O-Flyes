"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
    Sparkles, Loader2, Plane, MapPin, Wallet, ShieldCheck,
    Compass, RefreshCcw, ExternalLink, AlertTriangle, CheckCircle2
} from "lucide-react";

// ── Types (mirrors lib/agents/types.ts) ──────────────────────────────────
interface FlightOption { airline: string; price: number; currency: string; duration: string; stops: number; departure: string; arrival: string; bookingUrl: string; }
interface TransportPlan { dataAvailable: boolean; recommendation: string; options: FlightOption[]; }
interface ActivityPlanItem { name: string; category: string; period: string; }
interface ActivityPlanDay { day: number; theme: string; items: ActivityPlanItem[]; }
interface ActivitiesPlan { dataAvailable: boolean; rhythm: string; days: ActivityPlanDay[]; }
interface BudgetBreakdown { dataAvailable: boolean; flightTotal: number | null; lodgingTotal: number | null; activitiesEstimate: number | null; grandTotal: number | null; statedBudget: number | null; verdict: 'within' | 'over' | 'unknown'; recommendation: string; }
interface SafetyBriefing { visa: string; health: string; climate: string; advisories: string; disclaimer: string; }
interface DestinationBrief { tripType: string; priorities: string[]; destinationName: string; country: string; ambiance: string; nights: number; summary: string; }
interface TripProposalData {
    generatedAt: string;
    originCity: string;
    destination: DestinationBrief;
    transport: TransportPlan;
    activities: ActivitiesPlan;
    budget: BudgetBreakdown;
    safety: SafetyBriefing;
    summary: string;
}

const fmtEUR = (n: number) => n.toLocaleString("fr-FR") + " €";

function AgentLabel({ icon: Icon, name, color }: { icon: any; name: string; color: string }) {
    return (
        <div className="flex items-center gap-2 mb-3">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${color}`}>
                <Icon className="w-3.5 h-3.5" />
            </div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500">{name}</p>
        </div>
    );
}

export default function TripProposal({ tripId }: { tripId: string }) {
    const [proposal, setProposal] = useState<TripProposalData | null>(null);
    const [generatedAt, setGeneratedAt] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchExisting = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/trips/${tripId}/proposal`);
            setProposal(res.data?.proposal || null);
            setGeneratedAt(res.data?.generatedAt || null);
        } catch {
            // no proposal yet — not an error state for the user
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchExisting(); }, [tripId]);

    const handleGenerate = async () => {
        setGenerating(true);
        setError(null);
        try {
            const res = await axios.post(`/api/trips/${tripId}/proposal`, {});
            setProposal(res.data?.proposal || null);
            setGeneratedAt(res.data?.generatedAt || null);
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
                        <Compass className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-3 relative z-10">Proposition de voyage complète</h3>
                    <p className="text-zinc-400 text-sm max-w-lg mx-auto leading-relaxed mb-8 relative z-10">
                        Six agents IA spécialisés (destination, transport, activités, budget, sécurité, orchestrateur) analysent votre voyage
                        et s'appuient sur des <span className="text-white">données réelles</span> (vols, hôtels, lieux) pour bâtir une proposition cohérente — sans prix inventés.
                        La génération prend environ 20-30 secondes.
                    </p>
                    {error && <p className="text-red-400 text-xs mb-4 relative z-10">{error}</p>}
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="flex items-center gap-2 px-8 py-3.5 bg-white text-zinc-950 font-medium text-sm rounded-lg hover:bg-zinc-200 transition-all disabled:opacity-60 relative z-10"
                    >
                        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {generating ? "Génération en cours…" : "Générer ma proposition complète"}
                    </button>
                </div>
            </div>
        );
    }

    const { destination, transport, activities, budget, safety, summary, originCity } = proposal;

    return (
        <div className="space-y-6">
            {/* Header / regenerate */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h3 className="text-lg font-medium text-white">Proposition générée pour {destination.destinationName}, {destination.country}</h3>
                    {generatedAt && <p className="text-xs text-zinc-500 mt-1">Générée le {new Date(generatedAt).toLocaleString("fr-FR")} · au départ de {originCity}</p>}
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-60"
                >
                    {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
                    Régénérer
                </button>
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}

            {/* Orchestrator summary */}
            <div className="bg-zinc-900/50 rounded-2xl border border-white/[0.04] p-6">
                <AgentLabel icon={Sparkles} name="orchestrator-agent · synthèse" color="bg-gold/10 border-gold/20 text-gold" />
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{summary}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                    {destination.priorities.map((p, i) => (
                        <span key={i} className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400">{p}</span>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Transport */}
                <div className="bg-zinc-900/50 rounded-2xl border border-white/[0.04] p-6">
                    <AgentLabel icon={Plane} name="transport-agent" color="bg-blue-500/10 border-blue-500/20 text-blue-400" />
                    <p className="text-sm text-zinc-300 leading-relaxed mb-4">{transport.recommendation}</p>
                    {transport.dataAvailable ? (
                        <div className="space-y-2">
                            {transport.options.map((o, i) => (
                                <a key={i} href={o.bookingUrl} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-between text-xs p-3 rounded-xl bg-zinc-950 border border-white/[0.04] hover:border-white/10 transition-colors group">
                                    <span className="text-zinc-300 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                        {o.airline} · {o.duration} · {o.stops === 0 ? "direct" : `${o.stops} escale(s)`}
                                    </span>
                                    <span className="text-white font-semibold flex items-center gap-1.5">
                                        {fmtEUR(o.price)}
                                        <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300" />
                                    </span>
                                </a>
                            ))}
                            <p className="text-[10px] text-emerald-400/70 flex items-center gap-1.5 pt-1">
                                <CheckCircle2 className="w-3 h-3" /> Prix réels (Amadeus, environnement test)
                            </p>
                        </div>
                    ) : (
                        <p className="text-[11px] text-zinc-500 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> Données de vol indisponibles à l'instant</p>
                    )}
                </div>

                {/* Budget */}
                <div className="bg-zinc-900/50 rounded-2xl border border-white/[0.04] p-6">
                    <AgentLabel icon={Wallet} name="budget-agent" color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400" />
                    <p className="text-sm text-zinc-300 leading-relaxed mb-4">{budget.recommendation}</p>
                    {budget.dataAvailable ? (
                        <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-white/[0.04]">
                                <span className="text-zinc-400">Vol (aller-retour, prix réel le moins cher ×2)</span>
                                <span className="text-white font-medium">{budget.flightTotal !== null ? fmtEUR(budget.flightTotal) : "—"}</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-white/[0.04]">
                                <span className="text-zinc-400">Hébergement ({destination.nights} nuits, tarif réel le moins cher)</span>
                                <span className="text-white font-medium">{budget.lodgingTotal !== null ? fmtEUR(budget.lodgingTotal) : "—"}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                                <span className="text-white font-semibold">Total réel estimé</span>
                                <span className="text-gold font-bold text-base">{budget.grandTotal !== null ? fmtEUR(budget.grandTotal) : "—"}</span>
                            </div>
                            {budget.statedBudget && (
                                <p className={`text-[11px] flex items-center gap-1.5 ${budget.verdict === 'over' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {budget.verdict === 'over' ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                                    Budget annoncé : {fmtEUR(budget.statedBudget)} — {budget.verdict === 'over' ? "à ajuster selon les coûts réels ci-dessus" : "cohérent avec les coûts réels"}
                                </p>
                            )}
                            <p className="text-[10px] text-zinc-600 pt-1">Activités non comprises (pas de tarification temps réel disponible — prévoir un budget complémentaire).</p>
                        </div>
                    ) : (
                        <p className="text-[11px] text-zinc-500 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> Données de coût indisponibles à l'instant — pas d'estimation affichée</p>
                    )}
                </div>
            </div>

            {/* Activities / rhythm */}
            <div className="bg-zinc-900/50 rounded-2xl border border-white/[0.04] p-6">
                <AgentLabel icon={Compass} name="activities-agent" color="bg-purple-500/10 border-purple-500/20 text-purple-400" />
                <p className="text-sm text-zinc-300 leading-relaxed mb-5">{activities.rhythm}</p>
                {activities.dataAvailable && activities.days.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activities.days.map(day => (
                            <div key={day.day} className="p-4 rounded-xl bg-zinc-950 border border-white/[0.04]">
                                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Jour {day.day}</p>
                                <p className="text-sm font-medium text-white mb-3">{day.theme}</p>
                                <div className="space-y-1.5">
                                    {day.items.map((item, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs">
                                            <span className="text-[9px] uppercase tracking-wider text-zinc-600 mt-0.5 w-16 shrink-0">{item.period}</span>
                                            <span className="text-zinc-300">{item.name}</span>
                                        </div>
                                    ))}
                                    {day.items.length === 0 && <p className="text-xs text-zinc-600 italic">Repos / temps libre</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-[11px] text-zinc-500 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> Aucune activité réelle disponible pour cette destination à l'instant</p>
                )}
                <p className="text-[10px] text-emerald-400/70 flex items-center gap-1.5 pt-4">
                    <MapPin className="w-3 h-3" /> Lieux réels (OpenTripMap) — durées et prix à confirmer sur place
                </p>
            </div>

            {/* Safety */}
            <div className="bg-zinc-900/50 rounded-2xl border border-white/[0.04] p-6">
                <AgentLabel icon={ShieldCheck} name="safety-agent" color="bg-amber-500/10 border-amber-500/20 text-amber-400" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div><p className="text-zinc-500 uppercase tracking-widest text-[10px] mb-1">Visa / entrée</p><p className="text-zinc-300 leading-relaxed">{safety.visa}</p></div>
                    <div><p className="text-zinc-500 uppercase tracking-widest text-[10px] mb-1">Santé</p><p className="text-zinc-300 leading-relaxed">{safety.health}</p></div>
                    <div><p className="text-zinc-500 uppercase tracking-widest text-[10px] mb-1">Climat</p><p className="text-zinc-300 leading-relaxed">{safety.climate}</p></div>
                    <div><p className="text-zinc-500 uppercase tracking-widest text-[10px] mb-1">Vigilance</p><p className="text-zinc-300 leading-relaxed">{safety.advisories}</p></div>
                </div>
                <p className="text-[10px] text-amber-400/70 flex items-start gap-1.5 mt-4 pt-4 border-t border-white/[0.04]">
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" /> {safety.disclaimer}
                </p>
            </div>
        </div>
    );
}
