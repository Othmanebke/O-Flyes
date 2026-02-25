"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { Plane, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
    const params = useSearchParams();
    const token = params.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    if (!token) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-600 p-5 rounded-2xl flex items-start gap-3 text-sm">
                <p>Le lien de réinitialisation est manquant ou invalide.</p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setStatus("error");
            setMessage("Les mots de passe ne correspondent pas.");
            return;
        }
        if (password.length < 8) {
            setStatus("error");
            setMessage("Le mot de passe doit faire au moins 8 caractères.");
            return;
        }

        setStatus("loading");
        setMessage("");

        try {
            await axios.post("/api/auth/reset-password", { token, password });
            setStatus("success");
            setMessage("Votre mot de passe a été réinitialisé avec succès.");
        } catch (err: any) {
            setStatus("error");
            setMessage(err.response?.data?.error || "Le lien est expiré ou invalide.");
        }
    };

    if (status === "success") {
        return (
            <div className="space-y-6">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-5 rounded-2xl flex flex-col items-center text-center gap-3">
                    <CheckCircle2 className="w-10 h-10" />
                    <p className="font-medium">{message}</p>
                </div>
                <Link href="/auth/login" className="btn-dark w-full flex items-center justify-center gap-2 py-3">
                    Se connecter
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {status === "error" && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                    {message}
                </div>
            )}

            <div>
                <label className="block text-xs font-medium text-dark-400 uppercase tracking-widest mb-2">Nouveau mot de passe</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="w-full bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-sm text-dark placeholder-dark-200 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                    placeholder="••••••••" />
            </div>

            <div>
                <label className="block text-xs font-medium text-dark-400 uppercase tracking-widest mb-2">Confirmer le mot de passe</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                    className="w-full bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-sm text-dark placeholder-dark-200 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                    placeholder="••••••••" />
            </div>

            <button type="submit" disabled={status === "loading" || !password || !confirmPassword}
                className="btn-dark w-full flex items-center justify-center gap-2 py-3 mt-2">
                {status === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</> : <><span>Réinitialiser</span><ArrowRight className="w-4 h-4" /></>}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-sand-50 py-20 px-6 flex flex-col items-center justify-center -mt-20">
            <div className="w-full max-w-md">
                <div className="flex items-center gap-2 justify-center mb-10">
                    <div className="w-9 h-9 bg-dark rounded-xl flex items-center justify-center">
                        <Plane className="w-5 h-5 text-gold -rotate-45" />
                    </div>
                    <span className="font-serif text-2xl text-dark">AI<span className="text-gold">VANA</span></span>
                </div>

                <div className="mb-8 text-center">
                    <h1 className="font-serif text-3xl text-dark mb-2">Nouveau mot de passe</h1>
                    <p className="text-dark-400 text-sm">
                        Choisissez un nouveau mot de passe sécurisé pour votre compte.
                    </p>
                </div>

                <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
