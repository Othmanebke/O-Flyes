"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Plane, RefreshCw, Home } from "lucide-react";

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#0A0D14] flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-red-500/[0.03] rounded-full blur-[200px] pointer-events-none" />

            <div className="relative z-10 text-center max-w-lg">
                <Link href="/" className="inline-flex items-center gap-2 mb-12">
                    <div className="w-9 h-9 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center">
                        <Plane className="w-[18px] h-[18px] text-gold -rotate-45" />
                    </div>
                    <span className="font-serif text-2xl text-white">
                        AI<span className="text-gold">VANA</span>
                    </span>
                </Link>

                <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">⚠️</span>
                </div>

                <h1 className="font-serif text-4xl md:text-5xl text-white mb-4 leading-tight">
                    Une erreur est survenue
                </h1>
                <p className="text-white/40 text-base leading-relaxed mb-10">
                    Quelque chose s&apos;est mal passé. Réessayez ou retournez à l&apos;accueil.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-[#0A0D14] font-semibold text-sm px-6 py-3 rounded-xl transition-all hover:scale-105"
                    >
                        <RefreshCw className="w-4 h-4" /> Réessayer
                    </button>
                    <Link href="/"
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all hover:scale-105">
                        <Home className="w-4 h-4" /> Retour à l&apos;accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}
