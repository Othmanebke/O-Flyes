"use client";

import { motion } from "framer-motion";
import { Plane, Globe, Compass, Stars } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface GlobalLoaderProps {
    /** Appelé une seule fois lorsque la barre de progression atteint 100%. */
    onComplete?: () => void;
}

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
                // Random increment between 1 and 15
                return Math.min(p + Math.floor(Math.random() * 15) + 1, 100);
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
            {/* Deep Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] bg-gold/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />
            
            {/* Cinematic Scanning Line */}
            <motion.div 
                initial={{ top: "-10%" }}
                animate={{ top: "110%" }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent shadow-[0_0_20px_rgba(255,215,0,0.5)] z-0"
            />

            <div className="relative z-10 flex flex-col items-center">
                {/* 3D-like Orbital Structure */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-12">
                    
                    {/* Outer Ring */}
                    <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-[2px] border-dashed border-white/10"
                    />
                    
                    {/* Middle Ring */}
                    <motion.div 
                        animate={{ rotate: -360 }} 
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-6 rounded-full border border-gold/20"
                    />

                    {/* Inner Solid Ring */}
                    <div className="absolute inset-12 rounded-full border-4 border-white/5 backdrop-blur-sm bg-black/20" />

                    {/* The Plane flying on an orbit */}
                    <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0"
                    >
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0A0D14] p-2 rounded-full shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                            <Plane className="w-8 h-8 text-gold transform rotate-90" />
                        </div>
                    </motion.div>

                    {/* Center Element */}
                    <motion.div 
                        animate={{ scale: [0.95, 1.05, 0.95] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-10 flex items-center justify-center"
                    >
                        <Globe className="w-20 h-20 md:w-28 md:h-28 text-white/80 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]" strokeWidth={1} />
                        <div className="absolute inset-0 bg-gradient-to-b from-gold/20 to-transparent mix-blend-overlay rounded-full" />
                    </motion.div>
                </div>

                {/* Title Reveal */}
                <div className="overflow-hidden">
                    <motion.h1 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-5xl md:text-7xl font-serif text-white tracking-[0.25em] uppercase mb-6 drop-shadow-2xl"
                    >
                        O-Flyes
                    </motion.h1>
                </div>

                {/* Progress Bar & Text */}
                <div className="flex flex-col items-center w-64 md:w-80">
                    <div className="flex justify-between w-full mb-3">
                        <motion.p 
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-gold uppercase tracking-[0.3em] text-[10px] md:text-xs font-black"
                        >
                            Initialisation
                        </motion.p>
                        <span className="text-white/60 font-mono text-[10px] md:text-xs tracking-wider">{progress}%</span>
                    </div>

                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-gold/50 to-gold"
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "circOut" }}
                        />
                    </div>
                </div>
            </div>

            {/* Tech details in corners */}
            <div className="absolute top-8 left-8 hidden md:block">
                <p className="text-[10px] text-white/20 font-mono tracking-[0.2em] leading-relaxed">
                    SYS.OFLYES.CORE<br/>
                    V2.0.4.BETA<br/>
                    COORD: 48°52'5"N 2°19'59"E
                </p>
            </div>
            
            <div className="absolute bottom-8 right-8 flex items-center gap-3">
                <div className="w-12 h-[1px] bg-gold/30" />
                <Stars className="w-4 h-4 text-gold/50" />
                <div className="flex gap-1.5">
                    <motion.div animate={{ height: [4, 12, 4] }} transition={{ duration: 1, repeat: Infinity }} className="w-1 bg-white/20" />
                    <motion.div animate={{ height: [8, 16, 8] }} transition={{ duration: 1, delay: 0.2, repeat: Infinity }} className="w-1 bg-white/40" />
                    <motion.div animate={{ height: [6, 10, 6] }} transition={{ duration: 1, delay: 0.4, repeat: Infinity }} className="w-1 bg-gold/60" />
                </div>
            </div>
        </div>
    );
}
