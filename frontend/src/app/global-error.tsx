"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F9F8F6", color: "#0F1B2D", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ textAlign: "center", padding: 24, display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: 36, letterSpacing: "-0.035em" }}>AIVANA rencontre un problème</h1>
          <p style={{ margin: 0, color: "#4D4943" }}>Votre voyage en cours est conservé dans ce navigateur.</p>
          <button onClick={reset} style={{ border: "none", borderRadius: 999, background: "#0F1B2D", color: "#F9F8F6", padding: "12px 20px", fontWeight: 600, cursor: "pointer" }}>Réessayer</button>
        </div>
      </body>
    </html>
  );
}
