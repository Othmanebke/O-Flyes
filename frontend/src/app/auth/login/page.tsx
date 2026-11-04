"use client";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/ui/Logo";
import Photo from "@/components/ui/Photo";
import { createClient } from "@/lib/supabase/browser";
import { supabaseConfigured } from "@/lib/session";
import { usePlan } from "@/lib/plan";
import type { PhotoKey } from "@/lib/photos";

const TILES: [PhotoKey, string, string][] = [["DPS", "Bali", "Indonésie"], ["NRT", "Kyoto", "Japon"], ["RAK", "Marrakech", "Maroc"]];

function LoginContent() {
  const params = useSearchParams();
  const plan = usePlan();
  const error = params.get("error");
  // Uniquement des chemins internes, pour ne pas servir de redirection ouverte
  const rawNext = params.get("next") || "/dashboard";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";
  const [loading, setLoading] = useState<"google" | null>(null);
  const [failed, setFailed] = useState(false);

  const signIn = async (provider: "google") => {
    setLoading(provider);
    setFailed(false);
    const { error } = await createClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) { setFailed(true); setLoading(null); }
  };

  // Lien magique par email : marche sans aucun réglage externe (pas de Google Cloud)
  const [email, setEmail] = useState("");
  const [mail, setMail] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMail("sending");
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setMail(error ? "error" : "sent");
  };

  const saving = next.includes("save=1") && plan;

  return (
    <div className="flex min-h-screen flex-wrap bg-paper">
      <div className="flex flex-[1_1_440px] flex-col justify-between gap-12 border-r border-line bg-[#F2EFE9] px-[clamp(24px,5vw,56px)] py-8">
        <Link href="/" className="plain-link self-start text-ink" aria-label="Accueil"><Logo size={32} /></Link>
        <div className="flex max-w-[440px] flex-col gap-4">
          <h2 className="m-0 text-[clamp(34px,4vw,52px)] leading-[1.05]">Chaque voyage <em className="accent">commence ici.</em></h2>
          <p className="m-0 text-base leading-relaxed text-muted-2">Votre compte garde vos voyages, vos recherches et votre budget au même endroit, sur tous vos appareils.</p>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {TILES.map(([k, title, sub]) => (
            <div key={k} className="relative h-[120px] overflow-hidden rounded-[18px] border border-line">
              <Photo k={k} sizes="180px" className="h-full w-full" />
              <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(18,16,12,0.72) 0%, rgba(18,16,12,0) 70%)" }} />
              <span className="absolute bottom-2.5 left-3 flex flex-col text-white"><span className="text-[15px] font-bold leading-tight">{title}</span><span className="text-[11px] text-white/85">{sub}</span></span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-[1_1_440px] items-center justify-center px-6 py-14">
        <div className="flex w-full max-w-[380px] flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-4xl">{saving ? "Sauvegarder votre voyage" : "Se connecter"}</h1>
            <p className="m-0 text-[15px] text-muted-2">
              {saving
                ? `Connectez-vous pour garder « ${plan!.destination} » et ses ${plan!.items.length} élément${plan!.items.length > 1 ? "s" : ""}. Le compte est créé automatiquement à la première connexion.`
                : "Pas encore de compte ? Il est créé automatiquement à la première connexion."}
            </p>
          </div>

          {(error || failed) && (
            <div className="rounded-2xl border border-danger/40 bg-danger/[0.08] px-3.5 py-3 text-sm text-danger">Impossible de vous authentifier. Veuillez réessayer.</div>
          )}

          {supabaseConfigured() ? (
            <div className="flex flex-col gap-2.5">
              {mail === "sent" ? (
                <div className="rounded-2xl border border-ok/40 bg-ok/[0.08] px-4 py-3 text-sm text-ok">
                  Lien envoyé à <strong>{email}</strong>. Ouvrez-le depuis ce navigateur pour vous connecter.
                </div>
              ) : (
                <form onSubmit={sendLink} className="flex flex-col gap-2.5">
                  <label htmlFor="login-email" className="text-sm font-semibold">Votre email</label>
                  <input id="login-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.fr" className="h-12 rounded-full border border-line-2 bg-cream px-5 text-[15px] text-ink outline-none focus:border-gold-deep" />
                  <button type="submit" disabled={mail === "sending"} className="h-12 rounded-full bg-ink text-[15px] font-semibold text-paper hover:bg-ink-2 disabled:opacity-60">
                    {mail === "sending" ? "Envoi…" : "Recevoir un lien de connexion"}
                  </button>
                  {mail === "error" && <span className="text-sm text-danger">L&apos;envoi a échoué. Vérifiez l&apos;adresse ou réessayez dans une minute.</span>}
                </form>
              )}
              <div className="my-1 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" />ou<span className="h-px flex-1 bg-line" /></div>
              <button onClick={() => signIn("google")} disabled={!!loading} className="flex h-12 items-center justify-center gap-3 rounded-full border border-line-2 bg-cream text-[15px] font-medium hover:border-muted disabled:opacity-70">
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                {loading === "google" ? "Redirection…" : "Continuer avec Google"}
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line-2 px-4 py-3 text-sm text-muted-2">
              La connexion n&apos;est pas configurée sur cette installation (clés Supabase manquantes dans <code>.env.local</code>).
            </div>
          )}

          <p className="m-0 text-[13px] leading-relaxed text-muted">
            En continuant, vous acceptez les <Link href="/legal">conditions d&apos;utilisation</Link> et la <Link href="/legal#confidentialite">politique de confidentialité</Link>.
          </p>
          <Link href="/" className="text-sm text-muted-2">Continuer sans compte</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginContent /></Suspense>;
}
