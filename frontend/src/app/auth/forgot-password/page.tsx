"use client";
import { useState } from "react";
import Link from "next/link";
import { Plane, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import axios from "axios";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");
        try {
            const res = await axios.post("/api/auth/forgot-password", { email });
            setStatus("success");
            setMessage(res.data.message || "Si un compte existe à cette adresse, un email de réinitialisation vous a été envoyé.");
        } catch (err: any) {
            setStatus("error");
            setMessage(err.response?.data?.error || "Une erreur est survenue.");
        }
    };

    return (
        <div className="min-h-screen bg-sand-50 py-20 px-6 flex flex-col items-center justify-center -mt-20">
            <div className="w-full max-w-md">
                <div className="flex items-center gap-2 justify-center mb-10">
                    <div className="w-9 h-9 bg-dark rounded-xl flex items-center justify-center">
                        <Plane className="w-5 h-5 text-gold -rotate-45" />
                    </div>
                    <span className="font-serif text-2xl text-dark">AI<span className="text-gold">VANA</span></span>
                </div>

                <div className="mb-8">
                    <Link href="/auth/login" className="inline-flex items-center gap-2 text-dark-300 hover:text-dark text-sm mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Retour à la connexion
                    </Link>
                    <h1 className="font-serif text-3xl text-dark mb-2">Mot de passe oublié</h1>
                    <p className="text-dark-400 text-sm">
                        Entrez votre adresse email ci-dessous. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
                    </p>
                </div>

                {status === "success" ? (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-5 rounded-2xl flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p leading-relaxed>{message}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {status === "error" && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                                {message}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium text-dark-400 uppercase tracking-widest mb-2">Adresse Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                className="w-full bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-sm text-dark placeholder-dark-200 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                                placeholder="vous@exemple.com" />
                        </div>

                        <button type="submit" disabled={status === "loading" || !email}
                            className="btn-dark w-full flex items-center justify-center gap-2 py-3">
                            {status === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</> : "Envoyer le lien"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
