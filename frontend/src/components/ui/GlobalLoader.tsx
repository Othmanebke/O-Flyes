"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Plane } from "lucide-react";
import { DEPARTURES } from "@/lib/destinations";

interface GlobalLoaderProps {
    onComplete?: () => void;
}

const LETTERS = "AIVANA".split("");

export default function GlobalLoader({ onComplete }: GlobalLoaderProps) {
    const [progress, setProgress] = useState(0);
    const completedRef = useRef(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return Math.min(p + Math.floor(Math.random() * 12) + 1, 100);
            });
        }, 150);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (progress >= 100 && !completedRef.current) {
            completedRef.current = true;
            onComplete?.();
        }
    }, [progress, onComplete]);

    return (
        // theme-locked-dark : l'écran de chargement est toujours sombre, donc les briques
        // du tableau des départs (qui suivent les variables de thème) doivent l'être aussi.
        <div className="theme-locked-dark fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0A0D14] overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] bg-gold/[0.05] rounded-full blur-[160px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center w-full px-6">
                <div className="flex">
                    {LETTERS.map((letter, i) => (
                        <span key={i} className="overflow-hidden inline-block">
                            <motion.span
                                initial={{ y: "100%", opacity: 0 }}
                                animate={{ y: "0%", opacity: 1 }}
                                transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                                className="block text-6xl sm:text-7xl md:text-8xl font-serif text-white tracking-[0.12em]"
                            >
                                {letter}
                            </motion.span>
                        </span>
                    ))}
                </div>

                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    transition={{ duration: 0.8, delay: LETTERS.length * 0.08 + 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mt-6 mb-8 w-40 md:w-56"
                />

                {/* Même langage visuel que le bandeau de l'accueil : badge + tuiles
                    destination/code IATA qui défilent, dans un panneau façon tableau
                    d'aéroport. Les classes viennent de globals.css, partagées avec l'accueil. */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: LETTERS.length * 0.08 + 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-xl rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm"
                >
                    <div className="departures-strip !border-t-0 !bg-transparent">
                        <div className="departures-badge !bg-transparent">
                            <span className="departures-dot" />
                            Tableau des départs
                        </div>
                        <div className="departures-track">
                            <div className="marquee-inner">
                                {[...Array(2)].map((_, k) => (
                                    <div key={k} className="flex items-center">
                                        {DEPARTURES.map((d) => (
                                            <div key={`${d.city}-${k}`} className="departure-tile">
                                                <span className="departure-city">{d.city}</span>
                                                <Plane className="departure-sep w-3 h-3 -rotate-45" />
                                                <span className="departure-code">{d.code}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Barre de progression intégrée au bas du panneau, comme la ligne
                        d'un tableau d'affichage qui se remplit. */}
                    <div className="h-[3px] w-full bg-white/[0.06]">
                        <motion.div
                            className="h-full bg-gold"
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "circOut" }}
                        />
                    </div>
                </motion.div>

                <div className="mt-5 flex items-center gap-3">
                    <motion.p
                        animate={{ opacity: [0.35, 0.9, 0.35] }}
                        transition={{ duration: 2.2, repeat: Infinity }}
                        className="text-white/40 uppercase tracking-[0.4em] text-[9px] md:text-[10px] font-medium"
                    >
                        {progress < 100 ? "Embarquement en préparation" : "Bienvenue à bord"}
                    </motion.p>
                    <span className="loader-progress-chip">{progress}%</span>
                </div>
            </div>

            <style>{`
                /* Même traitement que les codes IATA du bandeau, pour que le pourcentage
                   se lise comme une valeur d'affichage d'aéroport. */
                .loader-progress-chip {
                    font-family: ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace;
                    font-size: 10px;
                    font-weight: 600;
                    letter-spacing: 0.06em;
                    color: #C5A059;
                    padding: 2px 7px;
                    border: 1px solid rgba(197, 160, 89, 0.35);
                    border-radius: 5px;
                    background: rgba(197, 160, 89, 0.08);
                    font-variant-numeric: tabular-nums;
                }
            `}</style>
        </div>
    );
}
