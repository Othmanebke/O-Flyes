"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { findDestination, searchCity } from "@/lib/catalog";
import { addDays, defaultDepart, getPlan, getPrefs, updatePlan, type PlanInput } from "@/lib/plan";

export type TripType = "roundtrip" | "oneway";
export type Leg = "outbound" | "return";

export interface SearchContext {
  origin: string;
  dest: string;
  depart: string;
  ret: string;
  pax: number; // adultes
  children: number; // 2 à 11 ans
  infants: number; // moins de 2 ans, sur les genoux
  trip: TripType; // vols uniquement
  leg: Leg; // en aller simple : on cherche l'aller ou le retour
}

/* Contexte de recherche des pages Vols / Hôtels / Activités, par ordre de priorité :
   1. paramètres d'URL (on arrive d'une fiche, du copilote ou du carnet)
   2. voyage en cours
   3. valeurs par défaut
   ?leg=retour ouvre directement la recherche du vol retour du voyage en cours.
   `ready` passe à true une fois le contexte lu côté navigateur. */
export function useTripContext() {
  const params = useSearchParams();
  const [ctx, setCtx] = useState<SearchContext>({ origin: "Paris", dest: "", depart: "", ret: "", pax: 2, children: 0, infants: 0, trip: "roundtrip", leg: "outbound" });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const plan = getPlan();
    const cat = plan ? findDestination(plan.destination) : undefined;
    const planCity = plan ? (cat ? searchCity(cat) : plan.destination) : "";
    const home = params.get("origin") || plan?.origin || getPrefs().city || "Paris";
    const depart = params.get("depart") || plan?.depart || defaultDepart();
    const ret = params.get("return") || plan?.ret || addDays(depart, 7);
    const pax = Number(params.get("pax")) || plan?.travelers || 2;
    const dest = params.get("dest") || planCity || "Lisbonne";

    if (params.get("leg") === "retour") {
      // Vol retour : de la destination vers la maison, à la date de retour
      setCtx({ origin: dest, dest: home, depart: ret, ret, pax, children: 0, infants: 0, trip: "oneway", leg: "return" });
    } else {
      setCtx({ origin: home, dest, depart, ret, pax, children: 0, infants: 0, trip: params.get("trip") === "oneway" ? "oneway" : "roundtrip", leg: "outbound" });
    }
    setReady(true);
  }, [params]);

  return { ctx, setCtx, ready };
}

/* Après une recherche : si elle porte sur le voyage en cours, on met ses dates à jour.
   (Pas pour une recherche de vol retour : origine et destination y sont inversées.) */
export function syncPlanWithSearch(c: SearchContext) {
  const plan = getPlan();
  if (!plan || c.leg === "return") return;
  const cat = findDestination(plan.destination);
  const same = [plan.destination, cat ? searchCity(cat) : ""].some(n => n && n.toLowerCase() === c.dest.trim().toLowerCase());
  if (!same) return;
  updatePlan(c.trip === "roundtrip"
    ? { depart: c.depart, ret: c.ret, travelers: c.pax + c.children + c.infants, origin: c.origin }
    : { depart: c.depart, travelers: c.pax + c.children + c.infants, origin: c.origin });
}

/* Contexte à utiliser pour créer le voyage si on ajoute un élément sans voyage en cours */
export function planInputFrom(c: SearchContext): PlanInput {
  const place = c.leg === "return" ? c.origin : c.dest;
  const cat = findDestination(place);
  return {
    destination: cat?.name || place, destId: cat?.id, country: cat?.country,
    origin: c.leg === "return" ? c.dest : c.origin,
    depart: c.leg === "return" ? undefined : c.depart,
    ret: c.trip === "roundtrip" || c.leg === "return" ? c.ret : undefined,
    travelers: c.pax + c.children + c.infants,
  };
}
