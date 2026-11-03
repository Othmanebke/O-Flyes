"use client";
import Link from "next/link";
import { useState } from "react";
import PageBanner from "@/components/layout/PageBanner";
import { FREE_SEARCHES_PER_MONTH } from "@/lib/limits";

const FREE = [
  `Sans compte : ${FREE_SEARCHES_PER_MONTH} recherches avec le copilote par mois`,
  "Avec un compte gratuit : copilote sans limite pendant la bêta",
  "Toutes les destinations, vols, hôtels et activités",
  "Carnet de voyage, budget et export agenda",
];
const PRO = ["Alertes de prix sur vos vols", "Export PDF de l'itinéraire", "Import Gmail et Outlook", "Support prioritaire"];
const ROWS: [string, string, string][] = [
  ["Recherches avec le copilote", `${FREE_SEARCHES_PER_MONTH} / mois sans compte · illimitées avec compte`, "Illimitées"],
  ["Voyages sauvegardés", "Illimités pendant la bêta", "Illimités"],
  ["Vols, hôtels et activités", "✓", "✓"],
  ["Carnet, budget et export agenda", "✓", "✓"],
  ["Export PDF", "—", "Prévu"],
  ["Alertes de prix", "—", "Prévu"],
  ["Import Gmail / Outlook", "—", "Prévu"],
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  return (
    <div className="bg-paper">
      <PageBanner k="map" />
      <div className="mx-auto flex max-w-[960px] flex-col gap-12 px-6 pb-24 pt-16">
        <div className="flex flex-col items-start gap-3">
          <h1 className="m-0 text-[clamp(36px,4.6vw,56px)] leading-[1.05]">Des tarifs <em className="accent">simples</em></h1>
          <p className="m-0 text-[17px] text-muted-2">Gratuit pour commencer. Sans engagement, sans carte bancaire.</p>
          <div className="mt-2 flex gap-1 rounded-full border border-line bg-cream p-[3px]">
            {[["Mensuel", false], ["Annuel", true]].map(([label, v]) => (
              <button key={label as string} onClick={() => setYearly(v as boolean)} aria-pressed={yearly === v} className={`rounded-full px-3.5 py-[7px] text-[13px] font-medium ${yearly === v ? "bg-ink text-paper" : "text-muted-2"}`}>{label}</button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))]">
          <div className="flex flex-col gap-6 rounded-3xl border border-line p-7">
            <div className="flex flex-col gap-1.5">
              <span className="text-base font-semibold">Gratuit</span>
              <span className="flex items-baseline gap-1.5"><span className="text-5xl font-bold tracking-[-0.035em]">0 €</span><span className="text-sm text-muted">pour toujours</span></span>
            </div>
            <div className="flex flex-col border-t border-line">
              {FREE.map(f => <div key={f} className="flex gap-3 border-b border-line py-[11px] text-sm text-muted-2"><span className="text-muted">✓</span><span>{f}</span></div>)}
            </div>
            <Link href="/auth/login" className="plain-link mt-auto rounded-full border border-line-2 px-4 py-3 text-center text-sm font-semibold hover:border-muted">Créer un compte gratuit</Link>
          </div>
          <div className="flex flex-col gap-6 rounded-3xl border border-gold-deep bg-cream p-7">
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between"><span className="text-base font-semibold text-gold-deep">Pro</span><span className="rounded-full bg-gold-soft px-2.5 py-1 text-xs font-semibold">Bientôt</span></span>
              <span className="flex items-baseline gap-1.5"><span className="text-5xl font-bold tracking-[-0.035em]">{yearly ? "99 €" : "9,99 €"}</span><span className="text-sm text-muted">{yearly ? "par an · 2 mois offerts" : "par mois"}</span></span>
            </div>
            <div className="flex flex-col border-t border-line">
              {PRO.map(f => <div key={f} className="flex gap-3 border-b border-line py-[11px] text-sm"><span className="text-gold-deep">✓</span><span>{f}</span></div>)}
            </div>
            <p className="m-0 text-[13px] text-muted">La formule Pro n&apos;est pas encore ouverte : aucun paiement n&apos;est demandé aujourd&apos;hui.</p>
            <a href="#newsletter" className="plain-link mt-auto rounded-full bg-ink px-4 py-3 text-center text-sm font-semibold !text-paper hover:bg-ink-2">Être prévenu du lancement</a>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="m-0 text-[28px]">Comparer en détail</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead><tr className="border-b border-line-2 text-left text-[13px] text-muted"><th className="py-3 font-normal" /><th className="py-3 font-normal">Gratuit</th><th className="py-3 font-normal">Pro</th></tr></thead>
              <tbody>
                {ROWS.map(([f, a, b]) => (
                  <tr key={f} className="border-b border-line"><td className="w-1/2 py-[13px] pr-4">{f}</td><td className="py-[13px] pr-4 text-muted-2">{a}</td><td className="py-[13px]">{b}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
