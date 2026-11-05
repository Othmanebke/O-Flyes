"use client";
// 2e étape après une connexion Google ou GitHub : un code est envoyé à l'adresse email
// du compte, et il faut le saisir pour accéder aux données (double authentification).
import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import Logo from "@/components/ui/Logo";
import Turnstile, { captchaOn } from "@/components/ui/Turnstile";
import { createClient } from "@/lib/supabase/browser";
import { safeNext } from "@/lib/safeNext";
import { CODE_MAX, CODE_MIN, cleanCode, emailVerified, maskEmail } from "@/lib/emailCode";

const RESEND_DELAY = 60; // secondes (Supabase refuse un nouvel envoi avant 60 s)

function VerifyContent() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [email, setEmail] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [state, setState] = useState<"loading" | "idle" | "sending" | "sent" | "checking" | "wrong" | "send-error">("loading");
  const [wait, setWait] = useState(0);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);
  const autoSent = useRef(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(w => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const send = useCallback(async (address: string, token: string | null) => {
    setState("sending");
    const { error } = await createClient().auth.signInWithOtp({
      email: address,
      options: { shouldCreateUser: false, captchaToken: token ?? undefined },
    });
    if (error) { setState("send-error"); setCaptchaReset(n => n + 1); return; }
    sessionStorage.setItem("aivana-code-sent", String(Date.now()));
    setState("sent");
    setWait(RESEND_DELAY);
    setTimeout(() => input.current?.focus(), 50);
  }, []);

  // Session ouverte par Google/GitHub : on récupère l'email du compte et on envoie le code
  useEffect(() => {
    (async () => {
      const { data: { session } } = await createClient().auth.getSession();
      if (!session) { window.location.replace(`/auth/login?next=${encodeURIComponent(next)}`); return; }
      if (emailVerified(session.access_token)) { window.location.replace(next); return; }
      const address = session.user.email;
      if (!address) { setState("send-error"); return; }
      setEmail(address);
      // envoi automatique (sauf si un code vient déjà de partir, ex. rechargement de la page)
      const last = Number(sessionStorage.getItem("aivana-code-sent") || 0);
      const elapsed = Math.floor((Date.now() - last) / 1000);
      if (elapsed < RESEND_DELAY) { setState("sent"); setWait(RESEND_DELAY - elapsed); return; }
      if (captchaOn()) { setState("idle"); return; }
      if (autoSent.current) return;
      autoSent.current = true;
      void send(address, null);
    })();
  }, [next, send]);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || code.length < CODE_MIN) return;
    setState("checking");
    // Valide le code : Supabase remplace la session par une session « vérifiée par email »
    const { error } = await createClient().auth.verifyOtp({ email, token: code, type: "email" });
    if (error) { setState("wrong"); setCode(""); input.current?.focus(); return; }
    sessionStorage.removeItem("aivana-code-sent");
    window.location.replace(next);
  };

  const cancel = async () => {
    await createClient().auth.signOut();
    window.location.replace("/auth/login");
  };

  const canResend = !!email && wait <= 0 && state !== "sending" && (!captchaOn() || !!captcha);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-14">
      <div className="flex w-full max-w-[420px] flex-col gap-6">
        <Link href="/" className="plain-link self-start text-ink" aria-label="Accueil"><Logo size={32} /></Link>
        <div className="flex flex-col gap-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-soft text-ink"><MailCheck className="h-6 w-6" aria-hidden /></span>
          <h1 className="m-0 text-4xl">Vérification par email</h1>
          <p className="m-0 text-[15px] text-muted-2">
            Pour protéger votre compte, nous envoyons un code à usage unique à
            {email ? <> <strong className="text-ink">{maskEmail(email)}</strong></> : " l'adresse de votre compte"}.
            Saisissez-le pour terminer la connexion.
          </p>
        </div>

        {state === "loading" ? <p className="m-0 text-sm text-muted">Préparation…</p> : (
          <form onSubmit={verify} className="flex flex-col gap-3">
            <label htmlFor="email-code" className="text-sm font-semibold">Code reçu par email</label>
            <input
              ref={input} id="email-code" inputMode="numeric" autoComplete="one-time-code" maxLength={CODE_MAX} required
              value={code} onChange={e => setCode(cleanCode(e.target.value))} placeholder="Code à 6 chiffres ou plus"
              className="h-14 rounded-full border border-line-2 bg-cream px-6 text-center font-mono text-2xl tracking-[0.3em] text-ink outline-none placeholder:font-sans placeholder:text-base placeholder:tracking-normal focus:border-gold-deep"
            />
            <button type="submit" disabled={state === "checking" || code.length < CODE_MIN} className="h-12 rounded-full bg-ink text-[15px] font-semibold text-paper hover:bg-ink-2 disabled:opacity-60">
              {state === "checking" ? "Vérification…" : "Valider"}
            </button>
            {state === "sent" && <span className="text-sm text-ok">Code envoyé. Pensez à regarder dans les spams.</span>}
            {state === "wrong" && <span className="text-sm text-danger">Code incorrect ou expiré. Vérifiez le dernier email reçu.</span>}
            {state === "send-error" && <span className="text-sm text-danger">L&apos;envoi du code a échoué. Patientez une minute puis renvoyez-le.</span>}
          </form>
        )}

        {email && (
          <div className="flex flex-col gap-2">
            <Turnstile onToken={setCaptcha} theme="light" resetKey={captchaReset} />
            <button onClick={() => email && send(email, captcha)} disabled={!canResend} className="self-start text-sm font-semibold text-ink hover:text-gold-deep disabled:text-muted">
              {state === "idle" ? "Envoyer le code" : wait > 0 ? `Renvoyer le code (${wait} s)` : "Renvoyer le code"}
            </button>
          </div>
        )}

        <button onClick={cancel} className="self-start text-sm text-muted-2 hover:text-ink">Annuler et se déconnecter</button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return <Suspense><VerifyContent /></Suspense>;
}
