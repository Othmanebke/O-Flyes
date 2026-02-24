"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, Mail, Plus, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    return (
        <div className="min-h-screen bg-sand-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-2xl text-center mb-12">
                <div className="flex items-center gap-2 justify-center mb-8">
                    <div className="w-10 h-10 bg-dark rounded-xl flex items-center justify-center">
                        <Plane className="w-5 h-5 text-white -rotate-45" />
                    </div>
                    <span className="font-serif text-2xl text-dark">AI<span className="text-gold">VANA</span></span>
                </div>

                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="font-serif text-4xl md:text-5xl text-dark mb-4">Bienvenue à bord !</h1>
                        <p className="text-dark-400 text-lg max-w-lg mx-auto leading-relaxed">
                            Pour une expérience 100% automatique, nous vous recommandons de connecter votre boîte email.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-6 mt-12">
                            {/* Recommended choice */}
                            <div className="relative p-8 rounded-3xl bg-white border-2 border-gold shadow-xl shadow-gold/5 flex flex-col items-center text-center group translate-y-[-4px]">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-dark text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                                    Recommandé
                                </div>
                                <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center text-3xl mb-6">
                                    📬
                                </div>
                                <h3 className="text-xl font-bold text-dark mb-2">Synchronisation Email</h3>
                                <p className="text-dark-400 text-xs mb-8 flex-1">
                                    Connectez Gmail ou Outlook. L&apos;IA extrait automatiquement vos réservations.
                                </p>
                                <button
                                    onClick={() => setStep(2)}
                                    className="btn-gold w-full mt-auto"
                                >
                                    Connecter maintenant
                                </button>
                            </div>

                            {/* Fallback choice */}
                            <div className="p-8 rounded-3xl bg-white border border-sand-200 flex flex-col items-center text-center opacity-80 hover:opacity-100 transition-opacity">
                                <div className="w-16 h-16 bg-sand-50 rounded-2xl flex items-center justify-center text-3xl mb-6">
                                    ✍️
                                </div>
                                <h3 className="text-xl font-bold text-dark mb-2">Mode Manuel</h3>
                                <p className="text-dark-400 text-xs mb-8 flex-1">
                                    Ajoutez vos voyages et réservations vous-même. Pas de connexion email requise.
                                </p>
                                <Link href="/dashboard" className="btn-dark w-full mt-auto">
                                    Commencer manuellement
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto bg-white p-10 rounded-3xl border border-sand-200 shadow-xl shadow-dark/5">
                        <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                            🔒
                        </div>
                        <h2 className="text-2xl font-bold text-dark mb-4">Sécurisé et Privé</h2>
                        <p className="text-dark-400 text-sm mb-8 leading-relaxed">
                            AIVANA analyse uniquement vos emails de confirmation de voyage (vols, hôtels, trains).
                            Vos données personnelles restent protégées.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="w-full flex items-center justify-between px-6 py-4 border border-sand-300 rounded-2xl hover:bg-sand-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-white border border-sand-200 rounded flex items-center justify-center">
                                        <img src="https://www.gstatic.com/images/branding/product/1x/gmail_32dp.png" alt="Gmail" className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-sm">Continuer avec Google</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-dark-300" />
                            </button>

                            <button
                                onClick={() => router.push("/dashboard")}
                                className="w-full flex items-center justify-between px-6 py-4 border border-sand-300 rounded-2xl hover:bg-sand-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-white border border-sand-200 rounded flex items-center justify-center">
                                        <img src="https://img.icons8.com/color/48/000000/microsoft-outlook-2019.png" alt="Outlook" className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-sm">Continuer avec Outlook</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-dark-300" />
                            </button>
                        </div>

                        <button
                            onClick={() => setStep(1)}
                            className="mt-8 text-xs font-bold text-dark-400 hover:text-dark transition-colors uppercase tracking-widest"
                        >
                            Retour
                        </button>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 text-dark-300 text-[10px] uppercase tracking-[0.2em]">
                <CheckCircle2 className="w-3 h-3 text-gold" />
                Configuration Rapide
            </div>
        </div>
    );
}
