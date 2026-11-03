"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { findDestination, searchCity } from "@/lib/catalog";
import { addDays, defaultDepart, getPlan, getPrefs, updatePlan, type PlanInput } from "@/lib/plan";

export interface SearchContext {
  origin: string;
  dest: string;
  depart: string;
  ret: string;
  pax: number;
}

/* Contexte de recherche des pages Vols / Hôtels / Activités, par ordre de priorité :
   1. paramètres d'URL (on arrive d'une fiche ou du copilote)
   2. voyage en cours
   3. valeurs par défaut
   `ready` passe à true une fois le contexte lu côté navigateur. */
export function useTripContext() {
  const params = useSearchParams();
  const [ctx, setCtx] = useState<SearchContext>({ origin: "Paris", dest: "", depart: "", ret: "", pax: 2 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const plan = getPlan();
    const planCity = plan ? (findDestination(plan.destination) ? searchCity(findDestination(plan.destination)!) : plan.destination) : "";
    const depart = params.get("depart") || plan?.depart || defaultDepart();
    setCtx({
      origin: params.get("origin") || plan?.origin || getPrefs().city || "Paris",
      dest: params.get("dest") || planCity || "Lisbonne",
      depart,
      ret: params.get("return") || plan?.ret || addDays(depart, 7),
      pax: Number(params.get("pax")) || plan?.travelers || 2,
    });
    setReady(true);
  }, [params]);

  return { ctx, setCtx, ready };
}

/* Après une recherche : si elle porte sur le voyage en cours, on met ses dates à jour. */
export function syncPlanWithSearch(c: SearchContext) {
  const plan = getPlan();
  if (!plan) return;
  const cat = findDestination(plan.destination);
  const same = [plan.destination, cat ? searchCity(cat) : ""].some(n => n && n.toLowerCase() === c.dest.trim().toLowerCase());
  if (same) updatePlan({ depart: c.depart, ret: c.ret, travelers: c.pax, origin: c.origin });
}

/* Contexte à utiliser pour créer le voyage si on ajoute un élément sans voyage en cours */
export function planInputFrom(c: SearchContext): PlanInput {
  const cat = findDestination(c.dest);
  return { destination: cat?.name || c.dest, destId: cat?.id, country: cat?.country, origin: c.origin, depart: c.depart, ret: c.ret, travelers: c.pax };
}

