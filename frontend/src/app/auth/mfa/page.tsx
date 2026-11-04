"use client";
// Second facteur à la connexion : code à 6 chiffres de l'application d'authentification
// (Google Authenticator, Microsoft Authenticator, 1Password…).
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/browser";
import { safeNext } from "@/lib/safeNext";

function MfaContent() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "checking" | "error" | "none">("loading");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      // Déjà vérifié, ou pas de 2FA sur ce compte : rien à faire ici
      if (!aal || aal.currentLevel === "aal2" || aal.nextLevel !== "aal2") { window.location.replace(next); return; }
      const { data } = await supabase.auth.mfa.listFactors();
      const totp = data?.totp?.find(f => f.status === "verified");
      if (!totp) { setState("none"); return; }
      setFactorId(totp.id);
      setState("ready");
      setTimeout(() => input.current?.focus(), 50);
    })();
  }, [next]);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || code.length !== 6) return;
    setState("checking");
    const { error } = await createClient().auth.mfa.challengeAndVerify({ factorId, code });
    if (error) { setState("error"); setCode(""); input.current?.focus(); return; }
    // Rechargement complet : les cookies de session (désormais aal2) sont relus partout
    window.location.replace(next);
  };

  const cancel = async () => {
    await createClient().auth.signOut();
    window.location.replace("/auth/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-14">
      <div className="flex w-full max-w-[400px] flex-col gap-6">
        <Link href="/" className="plain-link self-start text-ink" aria-label="Accueil"><Logo size={32} /></Link>
        <div className="flex flex-col gap-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-soft text-ink"><ShieldCheck className="h-6 w-6" aria-hidden /></span>
          <h1 className="m-0 text-4xl">Double authentification</h1>
          <p className="m-0 text-[15px] text-muted-2">Ouvrez votre application d&apos;authentification et saisissez le code à 6 chiffres affiché pour AIVANA.</p>
        </div>

        {state === "loading" && <p className="m-0 text-sm text-muted">Vérification de la session…</p>}

        {state === "none" && (
          <div className="rounded-2xl border border-danger/40 bg-danger/[0.08] px-4 py-3 text-sm text-danger">
            Aucun appareil d&apos;authentification n&apos;est disponible pour ce compte. Contactez-nous depuis la page <Link href="/contact">Contact</Link>.
          </div>
        )}

        {(state === "ready" || state === "checking" || state === "error") && (
          <form onSubmit={verify} className="flex flex-col gap-3">
            <label htmlFor="mfa-code" className="text-sm font-semibold">Code de vérification</label>
            <input
              ref={input} id="mfa-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required
              value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              className="h-14 rounded-full border border-line-2 bg-cream px-6 text-center font-mono text-2xl tracking-[0.4em] text-ink outline-none focus:border-gold-deep"
            />
            <button type="submit" disabled={state === "checking" || code.length !== 6} className="h-12 rounded-full bg-ink text-[15px] font-semibold text-paper hover:bg-ink-2 disabled:opacity-60">
              {state === "checking" ? "Vérification…" : "Valider"}
            </button>
            {state === "error" && <span className="text-sm text-danger">Code incorrect ou expiré. Utilisez le code affiché en ce moment.</span>}
          </form>
        )}

        <button onClick={cancel} className="self-start text-sm text-muted-2 hover:text-ink">Annuler et se déconnecter</button>
      </div>
    </div>
  );
}

export default function MfaPage() {
  return <Suspense><MfaContent /></Suspense>;
}
