"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useSession } from "@/lib/session";
import PageBanner from "@/components/layout/PageBanner";

function Unsubscribe() {
  const params = useSearchParams();
  const token = params.get("token");
  const { user } = useSession();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error" | "login">("idle");
  useEffect(() => { setEmail(params.get("email") || user?.email || ""); }, [params, user]);

  // Désinscription : soit avec le jeton secret du lien reçu par email,
  // soit en étant connecté avec l'adresse à retirer.
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await axios.delete("/api/newsletter", { data: token ? { token } : { email } });
      setStatus("done");
    } catch (err) {
      setStatus(axios.isAxiosError(err) && err.response?.status === 401 ? "login" : "error");
    }
  };

  if (token && status !== "done") {
    return (
      <div className="mx-auto flex max-w-[560px] flex-col gap-5 px-6 pb-24 pt-12">
        <h1 className="m-0 text-[clamp(32px,4.4vw,48px)] leading-[1.08]">Se <em className="accent">désinscrire</em></h1>
        <p className="m-0 text-base text-muted-2">Confirmez pour ne plus recevoir la lettre mensuelle d&apos;AIVANA.</p>
        <form onSubmit={submit}>
          <button type="submit" disabled={status === "sending"} className="h-12 rounded-full bg-ink px-6 text-sm font-semibold text-paper hover:bg-ink-2 disabled:opacity-60">{status === "sending" ? "Envoi…" : "Confirmer la désinscription"}</button>
        </form>
        {status === "error" && <p className="m-0 text-sm text-danger">Ce lien n&apos;est plus valide ou la désinscription a échoué. Écrivez-nous si le problème persiste.</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[560px] flex-col gap-5 px-6 pb-24 pt-12">
      <h1 className="m-0 text-[clamp(32px,4.4vw,48px)] leading-[1.08]">Se <em className="accent">désinscrire</em></h1>
      {status === "done" ? (
        <p className="m-0 rounded-[20px] border border-ok/40 bg-ok/[0.08] px-4 py-3 text-[15px] text-ok">C&apos;est fait : vous ne recevrez plus la lettre d&apos;AIVANA.</p>
      ) : (
        <>
          <p className="m-0 text-base text-muted-2">Le plus simple : cliquez sur « Se désinscrire » en bas de n&apos;importe quelle lettre. Sinon, connectez-vous avec l&apos;adresse inscrite et confirmez ici.</p>
          <form onSubmit={submit} className="flex flex-wrap gap-2">
            <label htmlFor="unsub-email" className="sr-only">Adresse email</label>
            <input id="unsub-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.fr" className="h-12 min-w-0 flex-1 rounded-full border border-line-2 bg-cream px-5 text-[15px] outline-none focus:border-gold-deep" />
            <button type="submit" disabled={status === "sending"} className="h-12 rounded-full bg-ink px-5 text-sm font-semibold text-paper hover:bg-ink-2 disabled:opacity-60">{status === "sending" ? "Envoi…" : "Me désinscrire"}</button>
          </form>
          {status === "login" && (
            <p className="m-0 text-sm text-danger">
              Pour protéger les abonnés, connectez-vous d&apos;abord avec cette adresse : <Link href={`/auth/login?next=${encodeURIComponent("/newsletter")}`}>se connecter</Link>.
            </p>
          )}
          {status === "error" &&<p className="m-0 text-sm text-danger">La désinscription n&apos;a pas pu être enregistrée. Réessayez ou écrivez-nous.</p>}
        </>
      )}
    </div>
  );
}

export default function NewsletterPage() {
  return (
    <div className="bg-paper">
      <PageBanner k="clouds" />
      <Suspense><Unsubscribe /></Suspense>
    </div>
  );
}
