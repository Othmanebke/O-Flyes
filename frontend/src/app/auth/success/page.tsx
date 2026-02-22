"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Plane } from "lucide-react";

export default function AuthSuccessPage() {
    const params = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const token = params.get("token");
        if (token) {
            localStorage.setItem("token", token);
            router.replace("/explore");
        } else {
            router.replace("/auth/login?error=google");
        }
    }, [params, router]);

    return (
        <div className="min-h-screen bg-sand-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 bg-dark rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Plane className="w-6 h-6 text-white -rotate-45" />
                </div>
                <Loader2 className="w-6 h-6 animate-spin text-gold mx-auto mb-3" />
                <p className="text-dark-400 text-sm">Connexion en cours…</p>
            </div>
        </div>
    );
}
