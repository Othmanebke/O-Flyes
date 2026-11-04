"use client";
// « Voyage en cours » : le fil qui relie les pages entre elles.
// Il vit dans le navigateur (localStorage) pour qu'on puisse composer un voyage sans
// compte ; à la sauvegarde il devient un voyage Supabase (tripId) et chaque ajout
// suivant est aussi envoyé au serveur.
import { useSyncExternalStore } from "react";
import axios from "axios";
import { findDestination } from "@/lib/catalog";

export type ItemType = "flight" | "hotel" | "activity";
export type FlightLeg = "roundtrip" | "outbound" | "return";

export interface PlanItem {
    key: string; // identifiant stable, sert à savoir si un résultat est déjà ajouté
    type: ItemType;
    title: string;
    subtitle?: string;
    price: number | null; // coût total pour le voyage (tous voyageurs)
    estimated?: boolean; // prix estimé plutôt que tarif en direct
    provider?: string;
    url?: string;
    date?: string; // AAAA-MM-JJ, pour l'itinéraire
    leg?: FlightLeg; // vols : aller-retour, aller seul ou retour seul
    booked?: boolean; // l'utilisateur a indiqué l'avoir réservé chez le partenaire
    serverId?: string;
}

export interface Plan {
    destination: string;
    destId?: string;
    country?: string;
    origin: string;
    depart: string; // AAAA-MM-JJ
    ret: string;
    travelers: number;
    budget?: number | null;
    items: PlanItem[];
    tripId?: string;
    name?: string; // nom choisi par la personne (« Lisbonne en amoureux »)
    shareId?: string; // lien public actif
    createdAt: number;
}

const KEY = "aivana-plan";
const META_KEY = "aivana-trip-meta";

/* ── dates ─────────────────────────────────────────────────────────── */
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
export const addDays = (iso: string, n: number) => isoDate(new Date(new Date(iso + "T12:00:00Z").getTime() + n * 86400000));
export const defaultDepart = () => addDays(isoDate(new Date()), 30);
export const nightsBetween = (a: string, b: string) =>
    Math.max(1, Math.round((new Date(b + "T12:00:00Z").getTime() - new Date(a + "T12:00:00Z").getTime()) / 86400000));

export function formatRange(a?: string, b?: string) {
    if (!a) return "Dates à fixer";
    const f = (iso: string, withYear = false) => new Date(iso + "T12:00:00Z").toLocaleDateString("fr-FR", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}) });
    return b ? `${f(a)} – ${f(b, true)}` : f(a, true);
}

/* ── store ─────────────────────────────────────────────────────────── */
let current: Plan | null | undefined; // undefined = pas encore lu
const listeners = new Set<() => void>();

function read(): Plan | null {
    if (current !== undefined) return current;
    try {
        current = JSON.parse(localStorage.getItem(KEY) || "null");
    } catch {
        current = null;
    }
    return current ?? null;
}

function write(next: Plan | null) {
    current = next;
    try {
        if (next) localStorage.setItem(KEY, JSON.stringify(next));
        else localStorage.removeItem(KEY);
    } catch { /* stockage plein ou désactivé : le voyage reste en mémoire */ }
    listeners.forEach(l => l());
}

function subscribe(l: () => void) {
    listeners.add(l);
    const onStorage = (e: StorageEvent) => {
        if (e.key === KEY) { current = undefined; l(); }
    };
    window.addEventListener("storage", onStorage);
    return () => { listeners.delete(l); window.removeEventListener("storage", onStorage); };
}

export function usePlan(): Plan | null {
    return useSyncExternalStore(subscribe, read, () => null);
}

export const getPlan = () => (typeof window === "undefined" ? null : read());

export const planTotal = (p: Plan | null) => (p?.items || []).reduce((s, i) => s + (i.price || 0), 0);

export function planNights(p: Plan) {
    return nightsBetween(p.depart, p.ret);
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/* ── actions ───────────────────────────────────────────────────────── */
export interface PlanInput {
    destination: string;
    destId?: string;
    country?: string;
    origin?: string;
    depart?: string;
    ret?: string;
    travelers?: number;
    budget?: number | null;
}

// Démarre un voyage, ou met à jour celui en cours s'il s'agit de la même destination.
export function startPlan(input: PlanInput): Plan {
    const prev = read();
    const cat = input.destId ? undefined : findDestination(input.destination);
    const depart = input.depart || prev?.depart || defaultDepart();
    const base = {
        destination: input.destination,
        destId: input.destId ?? cat?.id,
        country: input.country ?? cat?.country,
        origin: input.origin || prev?.origin || getPrefs().city || "Paris",
        depart,
        ret: input.ret || (prev && prev.depart === depart ? prev.ret : addDays(depart, 7)),
        travelers: input.travelers || prev?.travelers || 2,
        budget: input.budget ?? null,
    };
    if (prev && same(prev.destination, input.destination)) {
        const next = { ...prev, ...base, budget: input.budget ?? prev.budget };
        write(next);
        return next;
    }
    const next: Plan = { ...base, items: [], createdAt: Date.now() };
    write(next);
    return next;
}

export function updatePlan(patch: Partial<Omit<Plan, "items" | "createdAt">>) {
    const prev = read();
    if (!prev) return;
    write({ ...prev, ...patch });
}

export function clearPlan() {
    write(null);
}

export function hasItem(key: string) {
    return !!read()?.items.some(i => i.key === key);
}

function toServerPayload(i: PlanItem) {
    const url = i.url && /^https?:\/\//.test(i.url) ? i.url : null;
    return {
        type: i.type,
        title: i.title,
        price_estimate: i.price,
        provider: i.provider || null,
        external_url: url,
        metadata: { key: i.key, subtitle: i.subtitle, date: i.date, estimated: !!i.estimated, leg: i.leg, booked: !!i.booked },
    };
}

// Ajoute un élément au voyage en cours (en le créant si besoin à partir du contexte).
export async function addItem(item: PlanItem, context?: PlanInput): Promise<Plan> {
    let plan = read();
    if (!plan || (context && !same(plan.destination, context.destination) && plan.items.length === 0)) {
        plan = startPlan(context || { destination: item.title });
    }
    if (plan.items.some(i => i.key === item.key)) return plan;
    plan = { ...plan, items: [...plan.items, item] };
    write(plan);

    if (plan.tripId) {
        try {
            const res = await axios.post(`/api/trips/${plan.tripId}/items`, toServerPayload(item));
            const p = read();
            if (p) write({ ...p, items: p.items.map(i => (i.key === item.key ? { ...i, serverId: res.data?.id } : i)) });
        } catch { /* reste dans le voyage local ; il sera réenvoyé à la prochaine sauvegarde */ }
    }
    return read()!;
}

export async function removeItem(key: string) {
    const plan = read();
    if (!plan) return;
    const item = plan.items.find(i => i.key === key);
    write({ ...plan, items: plan.items.filter(i => i.key !== key) });
    if (plan.tripId && item?.serverId) {
        try { await axios.delete(`/api/trips/${plan.tripId}/items/${item.serverId}`); } catch { /* ignoré */ }
    }
}

// Enregistre le voyage en cours sur le compte. Lève une erreur 401 si non connecté.
export async function savePlan(): Promise<string> {
    const plan = read();
    if (!plan) throw new Error("Aucun voyage en cours");
    let tripId = plan.tripId;
    if (!tripId) {
        const res = await axios.post("/api/trips", { title: plan.destination, start_date: plan.depart, end_date: plan.ret });
        tripId = res.data.id as string;
        // colonnes de la migration 0006 : sans elles, le voyage est quand même sauvegardé
        try { await axios.patch(`/api/trips/${tripId}`, { travelers: plan.travelers, budget: plan.budget ?? null, name: plan.name ?? null }); } catch { /* ignoré */ }
    }
    const items = [...plan.items];
    for (let n = 0; n < items.length; n++) {
        if (items[n].serverId) continue;
        try {
            const res = await axios.post(`/api/trips/${tripId}/items`, toServerPayload(items[n]));
            items[n] = { ...items[n], serverId: res.data?.id };
        } catch { /* on continue avec les autres */ }
    }
    write({ ...plan, tripId, items });
    setTripMeta(tripId, { travelers: plan.travelers, budget: plan.budget ?? null, destId: plan.destId, origin: plan.origin });
    return tripId;
}

/* ── métadonnées locales des voyages sauvegardés ──────────────────────
   La table trips ne stocke ni le nombre de voyageurs ni le budget : on les garde ici. */
export interface TripMeta { travelers?: number; budget?: number | null; destId?: string; origin?: string }

export function getTripMeta(id: string): TripMeta {
    try { return JSON.parse(localStorage.getItem(META_KEY) || "{}")[id] || {}; } catch { return {}; }
}

export function setTripMeta(id: string, meta: TripMeta) {
    try {
        const all = JSON.parse(localStorage.getItem(META_KEY) || "{}");
        all[id] = { ...all[id], ...meta };
        localStorage.setItem(META_KEY, JSON.stringify(all));
    } catch { /* ignoré */ }
}

// Reprend un voyage sauvegardé comme voyage en cours (depuis le carnet).
export function resumeTrip(trip: { id: string; title: string; start_date?: string; end_date?: string; name?: string | null; travelers?: number | null; budget?: number | null; share_id?: string | null }, items: PlanItem[]) {
    const meta = getTripMeta(trip.id);
    const depart = trip.start_date || defaultDepart();
    write({
        destination: trip.title,
        destId: meta.destId ?? findDestination(trip.title)?.id,
        country: findDestination(trip.title)?.country,
        origin: meta.origin || getPrefs().city || "Paris",
        depart,
        ret: trip.end_date || addDays(depart, 7),
        travelers: trip.travelers || meta.travelers || 2,
        budget: trip.budget ?? meta.budget ?? null,
        name: trip.name || undefined,
        shareId: trip.share_id || undefined,
        items,
        tripId: trip.id,
        createdAt: Date.now(),
    });
}

/* ── préférences (onboarding) ─────────────────────────────────────── */
export interface Prefs { city?: string; budget?: string; styles?: string[] }

export function getPrefs(): Prefs {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("aivana-prefs") || "{}"); } catch { return {}; }
}

export function setPrefs(p: Prefs) {
    try { localStorage.setItem("aivana-prefs", JSON.stringify(p)); } catch { /* ignoré */ }
}

/* ── notifications ─────────────────────────────────────────────────── */
export interface ToastDetail { message: string; action?: { label: string; href: string } }

export function toast(message: string, action?: ToastDetail["action"]) {
    window.dispatchEvent(new CustomEvent<ToastDetail>("aivana-toast", { detail: { message, action } }));
}

/* ── vols : quels trajets sont couverts ? ──────────────────────────── */
export function flightCoverage(p: Plan | null) {
    const legs = (p?.items || []).filter(i => i.type === "flight").map(i => i.leg || "roundtrip");
    return {
        outbound: legs.includes("roundtrip") || legs.includes("outbound"),
        return: legs.includes("roundtrip") || legs.includes("return"),
    };
}

/* Place un élément à un jour du séjour (null = « à placer »), localement et sur le compte */
export async function setItemDate(key: string, date: string | null) {
    const plan = read();
    if (!plan) return;
    const item = plan.items.find(i => i.key === key);
    write({ ...plan, items: plan.items.map(i => (i.key === key ? { ...i, date: date || undefined } : i)) });
    if (plan.tripId && item?.serverId) {
        try { await axios.patch(`/api/trips/${plan.tripId}/items/${item.serverId}`, { date }); } catch { /* reste modifié localement */ }
    }
}

/* Marque un élément comme réservé (ou non) : AIVANA ne réserve pas lui-même,
   c'est l'utilisateur qui le confirme après être passé chez le partenaire. */
export async function setItemBooked(key: string, booked: boolean) {
    const plan = read();
    if (!plan) return;
    const item = plan.items.find(i => i.key === key);
    write({ ...plan, items: plan.items.map(i => (i.key === key ? { ...i, booked } : i)) });
    if (plan.tripId && item?.serverId) {
        try { await axios.patch(`/api/trips/${plan.tripId}/items/${item.serverId}`, { booked }); } catch { /* reste modifié localement */ }
    }
}

/* Jours du séjour, pour les sélecteurs « Jour 1 · sam. 12 déc. » */
export function tripDays(p: Plan): { date: string; label: string }[] {
    const n = Math.min(nightsBetween(p.depart, p.ret), 30);
    return Array.from({ length: n + 1 }, (_, k) => {
        const date = addDays(p.depart, k);
        const d = new Date(date + "T12:00:00Z").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
        return { date, label: `Jour ${k + 1} · ${d}` };
    });
}

/* Date du jour (AAAA-MM-JJ) : minimum des sélecteurs de dates */
export const today = () => isoDate(new Date());

/* Nom affiché : celui choisi par la personne, sinon la destination */
export const tripName = (p: Pick<Plan, "name" | "destination">) => p.name?.trim() || p.destination;
