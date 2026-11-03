"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[640px] flex-col items-center justify-center gap-5 px-6 py-24 text-center">
      <span className="eyebrow">Un imprévu</span>
      <h1 className="m-0 text-[clamp(32px,4.6vw,52px)] leading-[1.05]">Quelque chose <em className="accent">s&apos;est mal passé</em></h1>
      <p className="m-0 text-base text-muted-2">Votre voyage en cours est conservé. Réessayez, ou revenez à l&apos;accueil.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-ink-2">Réessayer</button>
        <Link href="/" className="plain-link rounded-full border border-line-2 px-4 py-2.5 text-sm font-semibold hover:border-ink">Accueil</Link>
      </div>
    </div>
  );
}
