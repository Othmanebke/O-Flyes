"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Plane, MapPin, ArrowLeft, Compass, Home, Search } from "lucide-react";

const DESTINATIONS = [
    { name: "Bali", emoji: "🌴" },
    { name: "Islande", emoji: "❄️" },
    { name: "Marrakech", emoji: "🕌" },
    { name: "Kyoto", emoji: "🌸" },
    { name: "Maldives", emoji: "🏝️" },
];

export default function NotFoundPage() {
    const [dest, setDest] = useState(DESTINATIONS[0]);

    useEffect(() => {
        const idx = Math.floor(Math.random() * DESTINATIONS.length);
        setDest(DESTINATIONS[idx]);
    }, []);

    return (
        <div className="min-h-screen bg-[#0A0D14] flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-gold/[0.04] rounded-full blur-[200px] pointer-events-none" />

            {/* Decorative planes */}
            <div className="absolute top-24 left-12 opacity-[0.04] rotate-[-30deg]">
                <Plane className="w-32 h-32 text-white" />
            </div>
            <div className="absolute bottom-24 right-12 opacity-[0.04] rotate-[45deg]">
                <Plane className="w-24 h-24 text-white" />
            </div>
            <div className="absolute top-1/2 right-8 opacity-[0.02] rotate-[15deg]">
                <Plane className="w-48 h-48 text-white" />
            </div>

            {/* Floating golden stars */}
            {["✦", "✦", "✦", "✦"].map((s, i) => (
                <div
                    key={i}
                    className="absolute text-gold/20 text-2xl font-bold animate-pulse"
                    style={{
                        top: `${[15, 70, 30, 80][i]}%`,
                        left: `${[10, 85, 60, 25][i]}%`,
                        animationDelay: `${i * 0.7}s`,
                    }}
                >
                    {s}
                </div>
            ))}

            {/* Content */}
            <div className="relative z-10 text-center max-w-lg">
                {/* Logo */}
                <Link href="/" className="inline-flex items-center gap-2 mb-12">
                    <div className="w-9 h-9 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center">
                        <Plane className="w-[18px] h-[18px] text-gold -rotate-45" />
                    </div>
                    <span className="font-serif text-2xl text-white">
                        AI<span className="text-gold">VANA</span>
                    </span>
                </Link>

                {/* 404 big number */}
                <div className="relative mb-6">
                    <p className="font-serif text-[120px] md:text-[160px] leading-none text-white/[0.04] font-bold select-none absolute inset-x-0 top-0 -translate-y-4">
                        404
                    </p>
                    <div className="relative pt-8">
                        <div className="w-20 h-20 bg-gold/10 border border-gold/20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 hover:rotate-6 transition-transform duration-300 cursor-default">
                            <Compass className="w-10 h-10 text-gold" />
                        </div>
                    </div>
                </div>

                <h1 className="font-serif text-4xl md:text-5xl text-white mb-4 leading-tight">
                    Page introuvable
                </h1>
                <p className="text-white/40 text-base leading-relaxed mb-2">
                    On dirait que cette page s&apos;est envolée vers {dest.emoji} <strong className="text-white/60">{dest.name}</strong>.
                </p>
                <p className="text-white/30 text-sm mb-10">
                    Pas de panique — voici où aller à la place :
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
                    <Link href="/"
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all hover:scale-105">
                        <Home className="w-4 h-4" /> Retour à l&apos;accueil
                    </Link>
                    <Link href="/explore"
                        className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-[#0A0D14] font-semibold text-sm px-6 py-3 rounded-xl transition-all hover:scale-105">
                        <MapPin className="w-4 h-4" /> Explorer les destinations
                    </Link>
                    <button onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
                        className="flex items-center gap-2 border border-white/10 hover:border-gold/40 text-white/50 hover:text-gold font-semibold text-sm px-6 py-3 rounded-xl transition-all">
                        <Search className="w-4 h-4" /> Demander à l&apos;IA
                    </button>
                </div>

                {/* Quick links */}
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-white/25">
                    {[
                        { href: "/blog", label: "Blog" },
                        { href: "/explore/activities", label: "Activités" },
                        { href: "/explore/flights", label: "Vols" },
                        { href: "/auth/login", label: "Connexion" },
                    ].map(({ href, label }) => (
                        <Link key={href} href={href} className="hover:text-white/60 underline underline-offset-2 transition-colors">
                            {label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
