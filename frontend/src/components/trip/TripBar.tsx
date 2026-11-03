"use client";
import Link from "next/link";
import { ArrowRight, Plane } from "lucide-react";
import { clearPlan, formatRange, planTotal, usePlan } from "@/lib/plan";
import { eur } from "@/lib/catalog";

/* Bandeau « voyage en cours » en haut de Vols, Hôtels, Activités et des fiches :
   on sait toujours pour quel voyage on cherche, et où vont les ajouts. */
export default function TripBar({ emptyHint }: { emptyHint?: string }) {
  const plan = usePlan();

  if (!plan) {
    return (
      <div className="rounded-[20px] border border-dashed border-line-2 px-4 py-3 text-sm text-muted-2">
        {emptyHint || "Aucun voyage en cours : votre premier ajout créera le voyage, que vous retrouverez dans votre carnet."}
      </div>
    );
  }

  const n = plan.items.length;
  const total = planTotal(plan);
  const leave = () => {
    if (n && !plan.tripId && !confirm(`Fermer le voyage « ${plan.destination} » ? Les ${n} éléments non sauvegardés seront perdus.`)) return;
    clearPlan();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-gold-deep/40 bg-gold-deep/[0.06] py-2.5 pl-2.5 pr-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-gold"><Plane className="h-4 w-4 -rotate-45" aria-hidden /></span>
        <div className="flex min-w-0 flex-col">
          <span className="text-xs text-muted">Voyage en cours{plan.tripId ? " · sauvegardé" : ""}</span>
          <span className="truncate text-[15px] font-semibold">
            {plan.destination} <span className="font-normal text-muted-2">· {formatRange(plan.depart, plan.ret)} · {plan.travelers} voyageur{plan.travelers > 1 ? "s" : ""}</span>
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="tabular whitespace-nowrap text-sm text-muted-2">{n} élément{n > 1 ? "s" : ""}{total ? ` · ${eur(total)}` : ""}</span>
        <button onClick={leave} className="whitespace-nowrap rounded-full border border-line-2 px-3 py-1.5 text-[13px] text-muted-2 hover:border-ink">Fermer</button>
        <Link href="/dashboard" className="plain-link flex items-center gap-1.5 whitespace-nowrap rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-semibold !text-white hover:bg-ink-2">
          Voir le carnet <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
