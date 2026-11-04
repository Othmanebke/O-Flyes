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
import Turnstile, { captchaOn } from "@/components/ui/Turnstile";
import { GitHubMark, GoogleMark } from "@/components/ui/BrandIcons";
import { safeNext } from "@/lib/safeNext";

type Provider = "google" | "github";

const TILES: [PhotoKey, string, string][] = [["DPS", "Bali", "Indonésie"], ["NRT", "Kyoto", "Japon"], ["RAK", "Marrakech", "Maroc"]];

function LoginContent() {
  const params = useSearchParams();
  const plan = usePlan();
  const error = params.get("error");
  // Uniquement des chemins internes, pour ne pas servir de redirection ouverte
  const next = safeNext(params.get("next"));
  const [loading, setLoading] = useState<Provider | null>(null);
  const [failed, setFailed] = useState(false);

  const signIn = async (provider: Provider) => {
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
  const [mail, setMail] = useState<"idle" | "sending" | "sent" | "error" | "captcha">("idle");
  // Captcha anti-robot (Cloudflare Turnstile) : Supabase vérifie le jeton lui-même
  // quand la protection est activée dans Authentication > Attack Protection.
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);
  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaOn() && !captcha) { setMail("captcha"); return; }
    setMail("sending");
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        captchaToken: captcha ?? undefined,
      },
    });
    setMail(error ? "error" : "sent");
    if (error) setCaptchaReset(n => n + 1);
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
                  <Turnstile onToken={setCaptcha} theme="light" resetKey={captchaReset} />
                  {mail === "captcha" && <span className="text-sm text-danger">Cochez la vérification anti-robot avant d&apos;envoyer le lien.</span>}
                  {mail === "error" && <span className="text-sm text-danger">L&apos;envoi a échoué. Vérifiez l&apos;adresse ou réessayez dans une minute.</span>}
                </form>
              )}
              <div className="my-1 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" />ou<span className="h-px flex-1 bg-line" /></div>
              <button onClick={() => signIn("google")} disabled={!!loading} className="flex h-12 items-center justify-center gap-3 rounded-full border border-line-2 bg-cream text-[15px] font-medium hover:border-muted disabled:opacity-70">
                <GoogleMark />
                {loading === "google" ? "Redirection…" : "Continuer avec Google"}
              </button>
              <button onClick={() => signIn("github")} disabled={!!loading} className="flex h-12 items-center justify-center gap-3 rounded-full border border-line-2 bg-cream text-[15px] font-medium hover:border-muted disabled:opacity-70">
                <GitHubMark />
                {loading === "github" ? "Redirection…" : "Continuer avec GitHub"}
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
