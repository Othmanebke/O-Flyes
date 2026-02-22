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
        <div className="min-h-screen bg-[#f9f7f4] flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
            {/* Decorative planes */}
            <div className="absolute top-24 left-12 opacity-5 rotate-[-30deg]">
                <Plane className="w-32 h-32 text-gray-900" />
            </div>
            <div className="absolute bottom-24 right-12 opacity-5 rotate-[45deg]">
                <Plane className="w-24 h-24 text-gray-900" />
            </div>
            <div className="absolute top-1/2 right-8 opacity-[0.03] rotate-[15deg]">
                <Plane className="w-48 h-48 text-gray-900" />
            </div>

            {/* Floating golden stars */}
            {["✦", "✦", "✦", "✦"].map((s, i) => (
                <div
                    key={i}
                    className="absolute text-yellow-400/20 text-2xl font-bold animate-pulse"
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
                    <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center">
                        <Plane className="w-4.5 h-4.5 text-white -rotate-45" />
                    </div>
                    <span className="font-serif text-2xl text-gray-900">
                        O-<span className="text-yellow-500">Flyes</span>
                    </span>
                </Link>

                {/* 404 big number */}
                <div className="relative mb-6">
                    <p className="font-serif text-[120px] md:text-[160px] leading-none text-gray-900/[0.06] font-bold select-none absolute inset-x-0 top-0 -translate-y-4">
                        404
                    </p>
                    <div className="relative pt-8">
                        <div className="w-20 h-20 bg-yellow-50 border-2 border-yellow-200 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 hover:rotate-6 transition-transform duration-300 cursor-default">
                            <Compass className="w-10 h-10 text-yellow-500" />
                        </div>
                    </div>
                </div>

                <h1 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4 leading-tight">
                    Page introuvable
                </h1>
                <p className="text-gray-400 text-base leading-relaxed mb-2">
                    On dirait que cette page s&apos;est envolée vers {dest.emoji} <strong className="text-gray-600">{dest.name}</strong>.
                </p>
                <p className="text-gray-400 text-sm mb-10">
                    Pas de panique — voici où aller à la place :
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
                    <Link href="/"
                        className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all hover:scale-105">
                        <Home className="w-4 h-4" /> Retour à l&apos;accueil
                    </Link>
                    <Link href="/explore"
                        className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold text-sm px-6 py-3 rounded-xl transition-all hover:scale-105">
                        <MapPin className="w-4 h-4" /> Explorer les destinations
                    </Link>
                    <Link href="/chat"
                        className="flex items-center gap-2 border border-gray-200 hover:border-yellow-300 text-gray-700 hover:text-yellow-600 font-semibold text-sm px-6 py-3 rounded-xl transition-all">
                        <Search className="w-4 h-4" /> Demander à l&apos;IA
                    </Link>
                </div>

                {/* Quick links */}
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400">
                    {[
                        { href: "/blog", label: "Blog" },
                        { href: "/gallery", label: "Galerie" },
                        { href: "/pricing", label: "Tarifs" },
                        { href: "/auth/login", label: "Connexion" },
                    ].map(({ href, label }) => (
                        <Link key={href} href={href} className="hover:text-gray-700 underline underline-offset-2 transition-colors">
                            {label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
