"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface GlobalLoaderProps {
    /** Appelé une seule fois lorsque la barre de progression atteint 100%. */
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
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0A0D14] overflow-hidden">
            {/* Lueur discrète centrale */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] bg-gold/[0.05] rounded-full blur-[160px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
                {/* Lettres animées une par une */}
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

                {/* Trait fin sous le titre */}
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    transition={{ duration: 0.8, delay: LETTERS.length * 0.08 + 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mt-6 mb-10 w-40 md:w-56"
                />

                {/* Barre de progression épurée */}
                <div className="flex flex-col items-center w-44 md:w-56">
                    <div className="w-full h-px bg-white/10 overflow-hidden rounded-full">
                        <motion.div
                            className="h-full bg-gold"
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "circOut" }}
                        />
                    </div>
                    <motion.p
                        animate={{ opacity: [0.35, 0.9, 0.35] }}
                        transition={{ duration: 2.2, repeat: Infinity }}
                        className="mt-4 text-white/40 uppercase tracking-[0.4em] text-[9px] md:text-[10px] font-medium"
                    >
                        {progress < 100 ? "Préparation de votre voyage" : "Bienvenue"}
                    </motion.p>
                </div>
            </div>
        </div>
    );
}
