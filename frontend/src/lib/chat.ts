"use client";
// Conversation unique avec le copilote, partagée par la bulle (ChatDock) et la page
// /assistant : c'est la même discussion, en petit ou en plein écran.
import { useSyncExternalStore } from "react";
import axios from "axios";
import { DESTINATIONS, estimate, eur, findDestination, type CatalogDestination } from "@/lib/catalog";
import { addDays, defaultDepart, getPrefs } from "@/lib/plan";
import type { EnrichedDestination } from "@/types/chat";

export interface ChatOption {
    name: string;
    country: string;
    destId?: string;
    code?: string;
    nights: number;
    pax: number;
    depart: string;
    ret: string;
    flight: number | null;
    hotel: number | null;
    activities: number | null;
    total: number | null;
    estimated: boolean; // toujours true aujourd'hui : pas d'API gratuite de prix en direct
}

export interface ChatLink { label: string; href: string }

export interface ChatMsg {
    role: "user" | "assistant";
    text: string;
    options?: ChatOption[];
    links?: ChatLink[];
}

interface ChatState {
    messages: ChatMsg[];
    loading: boolean;
    open: boolean;
    selected: ChatOption | null; // proposition affichée en détail sur /assistant
}

export const GREETING: ChatMsg = {
    role: "assistant",
    text: "Bonjour ! Dites-moi votre budget, la période et ce que vous aimez. Je vous propose des destinations avec un coût total estimé, puis on affine ensemble.",
};

export const SUGGESTIONS = [
    "Soleil en avril, 1 500 € à deux",
    "Aurores boréales en décembre",
    "Week-end culturel en Europe, 600 €",
    "Plage tropicale, 2 semaines, 3 000 €",
];

const KEY = "aivana-chat";
let state: ChatState | undefined;
const listeners = new Set<() => void>();

function load(): ChatState {
    if (state) return state;
    let saved: Partial<ChatState> = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { /* ignoré */ }
    state = {
        messages: saved.messages?.length ? saved.messages : [GREETING],
        loading: false,
        open: !!saved.open,
        selected: saved.selected || null,
    };
    return state;
}

const SERVER_STATE: ChatState = { messages: [GREETING], loading: false, open: false, selected: null };

function set(patch: Partial<ChatState> | ((s: ChatState) => Partial<ChatState>)) {
    const prev = load();
    state = { ...prev, ...(typeof patch === "function" ? patch(prev) : patch) };
    try {
        const { messages, open, selected } = state;
        localStorage.setItem(KEY, JSON.stringify({ messages: messages.slice(-30), open, selected }));
    } catch { /* ignoré */ }
    listeners.forEach(l => l());
}

function subscribe(l: () => void) {
    listeners.add(l);
    return () => { listeners.delete(l); };
}

export function useChat() {
    return useSyncExternalStore(subscribe, load, () => SERVER_STATE);
}

export const setChatOpen = (open: boolean) => set({ open });
export const selectOption = (selected: ChatOption | null) => set({ selected });
export const resetChat = () => set({ messages: [GREETING], selected: null });

/* Ouvre la bulle depuis n'importe où (hero, « Planifier un voyage », CTA…) et,
   si un texte est fourni, l'envoie directement. */
export function ask(text = "") {
    set({ open: true });
    if (text.trim()) void send(text);
}

/* ── réponses ──────────────────────────────────────────────────────── */
function toOption(d: CatalogDestination, nights: number, pax: number, depart: string): ChatOption {
    const e = estimate(d, nights, pax);
    return {
        name: d.name, country: d.country, destId: d.id, code: d.code, nights, pax, depart, ret: addDays(depart, nights),
        flight: e.flight, hotel: e.hotel, activities: e.activities, total: e.total, estimated: true,
    };
}

function fromEnriched(e: EnrichedDestination): ChatOption {
    const cat = findDestination(e.name);
    const nights = e.nights || 7;
    const pax = e.adults || 2;
    // Destination du catalogue : estimation complète ; sinon pas de chiffre inventé
    if (cat) return toOption(cat, nights, pax, e.depart_date || defaultDepart());
    return {
        name: e.name, country: e.country, nights, pax, depart: e.depart_date, ret: e.return_date,
        flight: null, hotel: null, activities: null, total: null, estimated: true,
    };
}

// Réponse de secours quand le copilote IA ne répond pas : on lit budget, durée,
// voyageurs et envies dans la phrase et on filtre le catalogue.
function localAnswer(text: string): ChatMsg {
    if (/\b(vol|avion|billet)/i.test(text) && !/\d{3,}/.test(text)) {
        return { role: "assistant", text: "Je peux comparer les vols au départ de Paris. Indiquez une destination et des dates, ou ouvrez directement la recherche.", links: [{ label: "Rechercher un vol", href: "/explore/flights" }] };
    }
    if (/hôtel|hotel|dormir|logement/i.test(text) && !/\d{3,}/.test(text)) {
        return { role: "assistant", text: "Dites-moi la ville et le nombre de nuits. Vous pouvez aussi comparer les hôtels tout de suite.", links: [{ label: "Voir les hôtels", href: "/explore/hotels" }] };
    }
    const bm = text.replace(/\s/g, "").match(/(\d{3,6})€?/);
    const budget = bm ? parseInt(bm[1], 10) : 1500;
    const jm = text.match(/(\d+)\s*(jours|j\b|nuits)/i);
    const sm = /(\d+)\s*semaines?/i.exec(text);
    const nights = jm ? Math.max(2, parseInt(jm[1], 10) - (/nuits/i.test(jm[2]) ? 0 : 1)) : sm ? parseInt(sm[1], 10) * 7 : /deux semaines/i.test(text) ? 14 : /week-end/i.test(text) ? 3 : 7;
    const pax = /solo|seul/i.test(text) ? 1 : /famille|enfants/i.test(text) ? 4 : 2;
    let pool = DESTINATIONS.slice();
    const keep = (f: (d: CatalogDestination) => boolean) => { const p = pool.filter(f); if (p.length) pool = p; };
    if (/froid|neige|aurore|décembre/i.test(text)) keep(d => d.months.includes("Déc") || d.name === "Islande");
    if (/plage|tropical|soleil|mer/i.test(text)) keep(d => d.styles.includes("Plage") || ["Marrakech", "Istanbul"].includes(d.name));
    if (/nature|rando|montagne/i.test(text)) keep(d => d.styles.includes("Nature"));
    if (/culture|musée|ville/i.test(text)) keep(d => d.styles.includes("Culture"));
    if (/europe/i.test(text)) keep(d => d.continent === "Europe");
    if (/asie/i.test(text)) keep(d => d.continent === "Asie");
    const cost = (d: CatalogDestination) => estimate(d, nights, pax).total;
    let fit = pool.filter(d => cost(d) <= budget).sort((a, b) => b.rating - a.rating || cost(a) - cost(b)).slice(0, 3);
    const over = !fit.length;
    if (over) fit = pool.sort((a, b) => cost(a) - cost(b)).slice(0, 3);
    const who = `${pax} voyageur${pax > 1 ? "s" : ""}`;
    const depart = defaultDepart();
    return {
        role: "assistant",
        text: (over
            ? `Avec ${eur(budget)} pour ${who} et ${nights} nuits, c'est serré. Voici les options les plus proches :`
            : `Pour ${who}, ${nights} nuits et ${eur(budget)} maximum, voici mes trois idées :`)
            + "\n\n_Le copilote IA ne répond pas pour l'instant : ces totaux sont des estimations tirées de notre catalogue._",
        options: fit.map(d => toOption(d, nights, pax, depart)),
    };
}

export async function send(text: string) {
    const s = load();
    if (!text.trim() || s.loading) return;
    const userMsg: ChatMsg = { role: "user", text: text.trim() };
    // L'historique envoyé commence au premier message de l'utilisateur (sans le message d'accueil)
    const all = [...s.messages, userMsg].slice(-12);
    const history = all.slice(Math.max(0, all.findIndex(m => m.role === "user")));
    set(st => ({ messages: [...st.messages, userMsg], loading: true, open: true }));
    try {
        // Préférences de l'onboarding : ville de départ, budget habituel, envies
        const res = await axios.post("/api/chat", { messages: history.map(m => ({ role: m.role, content: m.text })), prefs: getPrefs() });
        const options = ((res.data.enriched || []) as EnrichedDestination[]).map(fromEnriched);
        set(st => ({
            messages: [...st.messages, { role: "assistant", text: res.data.content || "Voici ce que j'ai trouvé :", options }],
            loading: false,
            selected: options[0] || st.selected,
        }));
    } catch (err: unknown) {
        const answer = localAnswer(text);
        set(st => ({ messages: [...st.messages, answer], loading: false, selected: answer.options?.[0] || st.selected }));
    }
}

/* Lien vers la fiche (catalogue) ou vers la recherche de vols (ville hors catalogue) */
export function optionHref(o: ChatOption) {
    const q = `nights=${o.nights}&pax=${o.pax}&depart=${o.depart}`;
    if (o.destId) return `/destination/${o.destId}?${q}`;
    return `/explore/flights?dest=${encodeURIComponent(o.name)}&depart=${o.depart}&return=${o.ret}&pax=${o.pax}`;
}
