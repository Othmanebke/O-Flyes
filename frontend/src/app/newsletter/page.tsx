"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import PageBanner from "@/components/layout/PageBanner";

function Unsubscribe() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  useEffect(() => { setEmail(params.get("email") || ""); }, [params]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try { await axios.delete("/api/newsletter", { data: { email } }); setStatus("done"); }
    catch { setStatus("error"); }
  };

  return (
    <div className="mx-auto flex max-w-[560px] flex-col gap-5 px-6 pb-24 pt-12">
      <h1 className="m-0 text-[clamp(32px,4.4vw,48px)] leading-[1.08]">Se <em className="accent">désinscrire</em></h1>
      {status === "done" ? (
        <p className="m-0 rounded-[20px] border border-ok/40 bg-ok/[0.08] px-4 py-3 text-[15px] text-ok">C&apos;est fait : vous ne recevrez plus la lettre d&apos;AIVANA.</p>
      ) : (
        <>
          <p className="m-0 text-base text-muted-2">Indiquez l&apos;adresse inscrite à la lettre mensuelle. Elle sera retirée de la liste immédiatement.</p>
          <form onSubmit={submit} className="flex flex-wrap gap-2">
            <label htmlFor="unsub-email" className="sr-only">Adresse email</label>
            <input id="unsub-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.fr" className="h-12 min-w-0 flex-1 rounded-full border border-line-2 bg-cream px-5 text-[15px] outline-none focus:border-gold-deep" />
            <button type="submit" disabled={status === "sending"} className="h-12 rounded-full bg-ink px-5 text-sm font-semibold text-paper hover:bg-ink-2 disabled:opacity-60">{status === "sending" ? "Envoi…" : "Me désinscrire"}</button>
          </form>
          {status === "error" && <p className="m-0 text-sm text-danger">La désinscription n&apos;a pas pu être enregistrée. Réessayez ou écrivez-nous.</p>}
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
