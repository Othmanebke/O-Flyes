"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plane, Mail, RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
    const params = useSearchParams();
    const error = params.get("error");
    const [resendEmail, setResendEmail] = useState("");
    const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        setResendStatus("loading");
        try {
            const res = await fetch("/api/auth/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: resendEmail }),
            });
            if (res.ok) setResendStatus("sent");
            else setResendStatus("error");
        } catch {
            setResendStatus("error");
        }
    };

    // Render based on state
    if (!error) {
        return (
            <div className="min-h-screen bg-sand-50 flex items-center justify-center px-6">
                <div className="w-full max-w-md text-center">
                    {/* Logo */}
                    <div className="flex items-center gap-2 justify-center mb-10">
                        <div className="w-9 h-9 bg-dark rounded-xl flex items-center justify-center">
                            <Plane className="w-5 h-5 text-white -rotate-45" />
                        </div>
                        <span className="font-serif text-2xl text-dark">O-<span className="text-gold">Flyes</span></span>
                    </div>

                    {/* Icon */}
                    <div className="w-20 h-20 bg-yellow-50 border-2 border-yellow-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-9 h-9 text-yellow-500" />
                    </div>

                    <h1 className="font-serif text-4xl text-dark mb-3">Vérifiez votre email</h1>
                    <p className="text-dark-400 text-sm leading-relaxed mb-8">
                        Nous vous avons envoyé un lien de confirmation. Cliquez dessus pour activer votre compte.<br />
                        <span className="text-dark-300 text-xs mt-2 block">Le lien expire dans 24 heures. Vérifiez aussi vos spams.</span>
                    </p>

                    <div className="bg-white border border-sand-200 rounded-2xl p-6 mb-6 text-left">
                        <p className="text-xs font-medium text-dark-400 uppercase tracking-widest mb-4">Pas reçu l&apos;email ?</p>
                        <form onSubmit={handleResend} className="space-y-3">
                            <input
                                type="email"
                                value={resendEmail}
                                onChange={(e) => setResendEmail(e.target.value)}
                                placeholder="votre@email.com"
                                required
                                className="w-full bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-sm text-dark focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
                            />
                            <button
                                type="submit"
                                disabled={resendStatus === "loading"}
                                className="w-full btn-dark flex items-center justify-center gap-2 py-3 text-sm"
                            >
                                {resendStatus === "loading" ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</>
                                ) : (
                                    <><RefreshCw className="w-4 h-4" /> Renvoyer l&apos;email</>
                                )}
                            </button>
                        </form>
                        {resendStatus === "sent" && (
                            <p className="text-emerald-600 text-xs mt-3 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Email renvoyé !</p>
                        )}
                        {resendStatus === "error" && (
                            <p className="text-red-500 text-xs mt-3 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Erreur. Vérifiez l&apos;adresse email.</p>
                        )}
                    </div>

                    <Link href="/auth/login" className="text-xs text-dark-300 hover:text-dark underline">
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        );
    }

    // Error state (lien expiré, invalide, etc.)
    const errorMessages: Record<string, string> = {
        expired: "Ce lien de vérification a expiré. Demandez-en un nouveau.",
        invalid: "Ce lien est invalide ou a déjà été utilisé.",
        notfound: "Aucun compte trouvé avec cet email.",
        server: "Une erreur est survenue. Réessayez.",
    };

    return (
        <div className="min-h-screen bg-sand-50 flex items-center justify-center px-6">
            <div className="w-full max-w-md text-center">
                <div className="flex items-center gap-2 justify-center mb-10">
                    <div className="w-9 h-9 bg-dark rounded-xl flex items-center justify-center">
                        <Plane className="w-5 h-5 text-white -rotate-45" />
                    </div>
                    <span className="font-serif text-2xl text-dark">O-<span className="text-gold">Flyes</span></span>
                </div>
                <div className="w-20 h-20 bg-red-50 border-2 border-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-9 h-9 text-red-400" />
                </div>
                <h1 className="font-serif text-3xl text-dark mb-3">Lien invalide</h1>
                <p className="text-dark-400 text-sm mb-8">{errorMessages[error] || errorMessages.invalid}</p>
                <Link href="/auth/register" className="btn-gold inline-flex items-center gap-2 px-6 py-3">
                    Créer un nouveau compte
                </Link>
                <p className="mt-4">
                    <Link href="/auth/login" className="text-xs text-dark-300 hover:text-dark underline">Retour à la connexion</Link>
                </p>
            </div>
        </div>
    );
}
