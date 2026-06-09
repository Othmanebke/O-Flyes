"use client";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function GlobalError({
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
        <html lang="fr">
            <body style={{ margin: 0, backgroundColor: "#0A0D14", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "sans-serif" }}>
                <div style={{ textAlign: "center", padding: "2rem", maxWidth: "480px" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
                    <h1 style={{ color: "#fff", fontFamily: "serif", fontSize: "2rem", marginBottom: "0.75rem" }}>
                        AI<span style={{ color: "#B8860B" }}>VANA</span>
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "2rem", lineHeight: 1.6 }}>
                        Une erreur critique est survenue. Veuillez recharger la page.
                    </p>
                    <button
                        onClick={reset}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: "0.5rem",
                            backgroundColor: "#B8860B", color: "#0A0D14",
                            border: "none", borderRadius: "0.75rem",
                            padding: "0.75rem 1.5rem", cursor: "pointer",
                            fontWeight: 700, fontSize: "0.875rem",
                        }}
                    >
                        Recharger la page
                    </button>
                </div>
            </body>
        </html>
    );
}
