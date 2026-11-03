// Compagnies qui desservent habituellement chaque destination du catalogue depuis Paris,
// avec l'aéroport de départ, l'escale éventuelle et une durée totale indicative.
// Les horaires et les prix restent des estimations : le tarif réel se vérifie sur
// Google Flights (lien sur chaque vol). Les programmes changent selon la saison.
import { findDestination } from '@/lib/catalog';
import { IATA } from '@/lib/iata';

export type FareKind = 'low' | 'legacy' | 'gulf';

export interface RouteOption {
    airline: string;
    paris: 'CDG' | 'ORY' | 'BVA'; // aéroport parisien utilisé
    dest?: string; // aéroport d'arrivée s'il diffère du code de la destination (ex. Tokyo-Haneda)
    via?: string; // ville d'escale
    stops: 0 | 1 | 2;
    hours: number; // durée totale indicative d'un trajet
    kind: FareKind;
}

const o = (airline: string, paris: RouteOption['paris'], hours: number, kind: FareKind, via?: string, extra: Partial<RouteOption> = {}): RouteOption =>
    ({ airline, paris, hours, kind, via, stops: via ? (via.includes('+') ? 2 : 1) : 0, ...extra });

// Clé = code aéroport de la destination dans le catalogue
export const ROUTES: Record<string, RouteOption[]> = {
    RAK: [o('Transavia', 'ORY', 3.3, 'low'), o('Royal Air Maroc', 'ORY', 3.3, 'legacy'), o('easyJet', 'CDG', 3.3, 'low'), o('Ryanair', 'BVA', 3.4, 'low'), o('Air France', 'CDG', 3.3, 'legacy')],
    LIS: [o('TAP Air Portugal', 'ORY', 2.5, 'legacy'), o('Transavia', 'ORY', 2.5, 'low'), o('easyJet', 'CDG', 2.5, 'low'), o('Air France', 'CDG', 2.5, 'legacy')],
    DPS: [o('Qatar Airways', 'CDG', 18.5, 'gulf', 'Doha'), o('Emirates', 'CDG', 19, 'gulf', 'Dubaï'), o('Singapore Airlines', 'CDG', 17.5, 'gulf', 'Singapour'), o('Turkish Airlines', 'CDG', 18.5, 'legacy', 'Istanbul')],
    MDE: [o('Iberia', 'ORY', 14, 'legacy', 'Madrid'), o('Air Europa', 'ORY', 14, 'legacy', 'Madrid'), o('Air France', 'CDG', 14.5, 'legacy', 'Bogotá')],
    ZQN: [o('Emirates', 'CDG', 29, 'gulf', 'Dubaï + Sydney'), o('Qatar Airways', 'CDG', 28, 'gulf', 'Doha + Auckland'), o('Singapore Airlines', 'CDG', 28.5, 'gulf', 'Singapour + Auckland')],
    BUD: [o('Air France', 'CDG', 2.3, 'legacy'), o('Wizz Air', 'BVA', 2.3, 'low'), o('easyJet', 'CDG', 2.3, 'low')],
    TBS: [o('Turkish Airlines', 'CDG', 7.5, 'legacy', 'Istanbul'), o('Pegasus Airlines', 'CDG', 8, 'low', 'Istanbul'), o('LOT Polish Airlines', 'CDG', 7.5, 'legacy', 'Varsovie')],
    CNX: [o('Thai Airways', 'CDG', 14.5, 'legacy', 'Bangkok'), o('Qatar Airways', 'CDG', 16, 'gulf', 'Doha + Bangkok'), o('Emirates', 'CDG', 16.5, 'gulf', 'Dubaï + Bangkok')],
    HAN: [o('Vietnam Airlines', 'CDG', 12, 'legacy'), o('Qatar Airways', 'CDG', 15.5, 'gulf', 'Doha'), o('Emirates', 'CDG', 16, 'gulf', 'Dubaï')],
    KRK: [o('Ryanair', 'BVA', 2.2, 'low'), o('easyJet', 'CDG', 2.2, 'low'), o('LOT Polish Airlines', 'CDG', 4.5, 'legacy', 'Varsovie')],
    ATH: [o('Air France', 'CDG', 3.3, 'legacy'), o('Aegean Airlines', 'CDG', 3.3, 'legacy'), o('Transavia', 'ORY', 3.3, 'low')],
    IST: [o('Turkish Airlines', 'CDG', 3.4, 'legacy'), o('Pegasus Airlines', 'CDG', 3.4, 'low', undefined, { dest: 'SAW' }), o('Air France', 'CDG', 3.4, 'legacy')],
    HKT: [o('Qatar Airways', 'CDG', 15, 'gulf', 'Doha'), o('Emirates', 'CDG', 15, 'gulf', 'Dubaï'), o('Thai Airways', 'CDG', 14.5, 'legacy', 'Bangkok')],
    EZE: [o('Air France', 'CDG', 13.5, 'legacy'), o('Iberia', 'ORY', 16, 'legacy', 'Madrid'), o('Air Europa', 'ORY', 16, 'legacy', 'Madrid')],
    NBO: [o('Kenya Airways', 'CDG', 8.5, 'legacy'), o('Air France', 'CDG', 8.5, 'legacy'), o('Qatar Airways', 'CDG', 12, 'gulf', 'Doha')],
    NRT: [o('Air France', 'CDG', 14, 'legacy', undefined, { dest: 'HND' }), o('Japan Airlines', 'CDG', 14, 'legacy', undefined, { dest: 'HND' }), o('ANA', 'CDG', 14, 'legacy', undefined, { dest: 'HND' })],
    KEF: [o('Icelandair', 'CDG', 3.3, 'legacy'), o('Transavia', 'ORY', 3.3, 'low')],
    JFK: [o('Air France', 'CDG', 8.5, 'legacy'), o('Delta', 'CDG', 8.5, 'legacy'), o('French bee', 'ORY', 8.5, 'low', undefined, { dest: 'EWR' })],
    SYD: [o('Qatar Airways', 'CDG', 22.5, 'gulf', 'Doha'), o('Emirates', 'CDG', 22.5, 'gulf', 'Dubaï'), o('Singapore Airlines', 'CDG', 21.5, 'gulf', 'Singapour')],
    MLE: [o('Qatar Airways', 'CDG', 13, 'gulf', 'Doha'), o('Emirates', 'CDG', 13, 'gulf', 'Dubaï'), o('Turkish Airlines', 'CDG', 13.5, 'legacy', 'Istanbul')],
    PPT: [o('Air Tahiti Nui', 'CDG', 22, 'legacy', 'Los Angeles'), o('Air France', 'CDG', 22, 'legacy', 'Los Angeles'), o('French bee', 'ORY', 22.5, 'low', 'San Francisco')],
    DXB: [o('Emirates', 'CDG', 6.75, 'gulf'), o('Air France', 'CDG', 6.75, 'legacy')],
};

// Multiplicateur de prix selon le type de compagnie (base = tarif « dès » du catalogue)
export const FARE: Record<FareKind, number> = { low: 1, gulf: 1.15, legacy: 1.3 };
// Sur les long-courriers (plus de 6 h), l'écart entre compagnies se resserre
export const fareFactor = (kind: FareKind, hours: number) => (hours > 6 ? { low: 1, gulf: 1, legacy: 1.1 }[kind] : FARE[kind]);

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const isParis = (city: string) => /^paris\b/.test(norm(city));

/* Code aéroport d'une ville : catalogue d'abord, puis la table IATA exacte.
   null si on ne le connaît pas (on affiche alors le nom de la ville, jamais un faux code). */
export function airportCode(city: string): string | null {
    const cat = findDestination(city);
    if (cat) return cat.code;
    const exact = Object.entries(IATA).find(([name]) => norm(name) === norm(city));
    return exact ? exact[1] : null;
}

/* Options de vol pour un trajet. Depuis/vers Paris : les compagnies réelles de la ligne.
   Ligne inconnue : on ne nomme aucune compagnie ; la durée et le prix sont déduits
   de la distance (calculée par l'appelant, voir unknownRoute). */
export function routeOptions(origin: string, destination: string): { options: RouteOption[]; reverse: boolean; known: boolean } {
    const toCode = airportCode(destination);
    const fromCode = airportCode(origin);
    if (isParis(origin) && toCode && ROUTES[toCode]) return { options: ROUTES[toCode], reverse: false, known: true };
    if (isParis(destination) && fromCode && ROUTES[fromCode]) return { options: ROUTES[fromCode], reverse: true, known: true };
    return { options: [], reverse: false, known: false };
}

/* Ligne hors table : un vol direct et un vol avec escale, sans nom de compagnie,
   durée et prix estimés d'après la distance à vol d'oiseau. */
export function unknownRoute(distanceKm: number): { options: RouteOption[]; baseFare: number } {
    const directH = Math.max(1, distanceKm / 800 + 0.5);
    const long = distanceKm > 4500;
    return {
        options: [
            ...(long ? [] : [o('Vol direct · plusieurs compagnies', 'CDG', directH, 'low')]),
            o('Avec escale · plusieurs compagnies', 'CDG', directH + 2.5, 'legacy', 'selon la compagnie'),
            ...(long ? [o('Avec escale · compagnies du Golfe', 'CDG', directH + 3, 'gulf', 'Doha ou Dubaï')] : []),
        ],
        // aller simple par personne, ordre de grandeur des tarifs observés
        baseFare: Math.round(30 + Math.min(distanceKm, 3000) * 0.05 + Math.max(0, distanceKm - 3000) * 0.025),
    };
}

export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
    const rad = (x: number) => (x * Math.PI) / 180;
    const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.sqrt(h));
}
