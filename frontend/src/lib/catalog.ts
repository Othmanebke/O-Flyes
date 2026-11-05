// Catalogue des destinations AIVANA (source unique pour toutes les pages) :
// 22 destinations d'origine + les villes de lib/world/places.ts.
// Budgets estimés pour deux voyageurs, vols depuis Paris compris.
import { PLACES, CURRENCY } from "@/lib/world/places";

export type Tier = "Essentiel" | "Confort" | "Premium" | "Prestige";
export type Continent = "Europe" | "Afrique" | "Asie" | "Amérique" | "Océanie";

export interface CatalogDestination {
  id: string;
  name: string;
  country: string;
  continent: Continent;
  code: string; // code aéroport, sert aussi de clé photo
  tier: Tier;
  budgetMin: number;
  budgetMax: number;
  flightFrom: number; // aller simple par personne
  hotelFrom: number; // par nuit
  months: string[];
  duration: string;
  rating: number;
  styles: string[];
  desc: string;
}

type Row = [
  string,
  string,
  string,
  Continent,
  string,
  Tier,
  number,
  number,
  number,
  number,
  string[],
  string,
  number,
  string[],
  string,
];

const ROWS: Row[] = [
  [
    "t1",
    "Marrakech",
    "Maroc",
    "Afrique",
    "RAK",
    "Essentiel",
    650,
    900,
    80,
    35,
    ["Mars", "Avr", "Oct", "Nov"],
    "10 – 14 jours",
    4.7,
    ["Culture", "Gastronomie", "Aventure"],
    "Cité impériale, souks et riads. Vol depuis Paris dès 80 €, riads abordables.",
  ],
  [
    "t2",
    "Lisbonne",
    "Portugal",
    "Europe",
    "LIS",
    "Confort",
    1400,
    1900,
    60,
    90,
    ["Avr", "Mai", "Juin", "Sept"],
    "10 – 14 jours",
    4.8,
    ["Culture", "Gastronomie", "Plage"],
    "Azulejos, fado et océan à 2 h 30 de Paris. L'un des meilleurs rapports qualité-prix d'Europe.",
  ],
  [
    "t3",
    "Bali",
    "Indonésie",
    "Asie",
    "DPS",
    "Confort",
    1600,
    2400,
    400,
    40,
    ["Avr", "Mai", "Juin", "Sept", "Oct"],
    "14 – 21 jours",
    4.9,
    ["Plage", "Nature", "Bien-être"],
    "Rizières, temples et surf. Villas avec piscine dès 40 € la nuit.",
  ],
  [
    "t4",
    "Medellín",
    "Colombie",
    "Amérique",
    "MDE",
    "Confort",
    1700,
    2300,
    560,
    35,
    ["Déc", "Jan", "Fév", "Juil"],
    "14 – 21 jours",
    4.6,
    ["Culture", "Aventure", "Nature"],
    "22 °C toute l'année à 1 500 m d'altitude. Métropole culturelle et fleurie.",
  ],
  [
    "t5",
    "Queenstown",
    "Nouvelle-Zélande",
    "Océanie",
    "ZQN",
    "Premium",
    4200,
    5500,
    900,
    120,
    ["Nov", "Déc", "Jan", "Fév"],
    "14 – 21 jours",
    4.8,
    ["Aventure", "Nature"],
    "Fjords, ski et sports extrêmes au bord du lac Wakatipu.",
  ],
  [
    "b1",
    "Budapest",
    "Hongrie",
    "Europe",
    "BUD",
    "Essentiel",
    800,
    1200,
    50,
    45,
    ["Avr", "Mai", "Juin", "Sept"],
    "7 – 10 jours",
    4.6,
    ["Culture", "Bien-être", "Gastronomie"],
    "Bains thermaux, ruin bars et architecture austro-hongroise.",
  ],
  [
    "b2",
    "Tbilissi",
    "Géorgie",
    "Europe",
    "TBS",
    "Essentiel",
    750,
    1100,
    120,
    30,
    ["Avr", "Mai", "Sept", "Oct"],
    "10 – 14 jours",
    4.5,
    ["Culture", "Gastronomie", "Aventure"],
    "Façades sculptées, vins naturels et gorges du Caucase.",
  ],
  [
    "b3",
    "Chiang Mai",
    "Thaïlande",
    "Asie",
    "CNX",
    "Essentiel",
    950,
    1400,
    350,
    20,
    ["Nov", "Déc", "Jan", "Fév"],
    "14 – 21 jours",
    4.7,
    ["Culture", "Nature", "Bien-être"],
    "Temples, jungle et massages traditionnels à petit prix.",
  ],
  [
    "b4",
    "Hanoï",
    "Vietnam",
    "Asie",
    "HAN",
    "Essentiel",
    900,
    1300,
    380,
    18,
    ["Oct", "Nov", "Déc", "Mars"],
    "14 – 21 jours",
    4.5,
    ["Culture", "Gastronomie", "Aventure"],
    "Vieux quartier, baie d'Halong et cuisine de rue.",
  ],
  [
    "b5",
    "Cracovie",
    "Pologne",
    "Europe",
    "KRK",
    "Essentiel",
    700,
    1000,
    50,
    40,
    ["Avr", "Mai", "Juin", "Sept"],
    "5 – 8 jours",
    4.4,
    ["Culture", "Histoire"],
    "Ville médiévale, place du marché et château du Wawel.",
  ],
  [
    "m1",
    "Athènes + Santorin",
    "Grèce",
    "Europe",
    "ATH",
    "Confort",
    2000,
    2800,
    120,
    90,
    ["Mai", "Juin", "Sept", "Oct"],
    "14 jours",
    4.8,
    ["Culture", "Plage", "Gastronomie"],
    "L'Acropole puis les couchers de soleil d'Oia.",
  ],
  [
    "m2",
    "Istanbul",
    "Turquie",
    "Europe",
    "IST",
    "Confort",
    1300,
    1900,
    90,
    65,
    ["Avr", "Mai", "Sept", "Oct"],
    "10 – 14 jours",
    4.7,
    ["Culture", "Gastronomie", "Histoire"],
    "Mosquées, bazars et Bosphore, entre deux continents.",
  ],
  [
    "m3",
    "Phuket & Ko Phi Phi",
    "Thaïlande",
    "Asie",
    "HKT",
    "Confort",
    1700,
    2500,
    350,
    55,
    ["Nov", "Déc", "Jan", "Fév"],
    "14 – 21 jours",
    4.8,
    ["Plage", "Bien-être", "Aventure"],
    "Eaux turquoise et kayak entre falaises calcaires.",
  ],
  [
    "m4",
    "Buenos Aires",
    "Argentine",
    "Amérique",
    "EZE",
    "Confort",
    1900,
    2700,
    600,
    50,
    ["Mars", "Avr", "Oct", "Nov"],
    "14 – 21 jours",
    4.7,
    ["Culture", "Gastronomie", "Fête"],
    "Tango, asados et architecture néoclassique.",
  ],
  [
    "m5",
    "Nairobi & Masai Mara",
    "Kenya",
    "Afrique",
    "NBO",
    "Confort",
    2500,
    3500,
    380,
    80,
    ["Juil", "Août", "Sept", "Jan"],
    "14 jours",
    4.9,
    ["Nature", "Aventure", "Faune"],
    "Big Five et grande migration dans la savane.",
  ],
  [
    "c1",
    "Kyoto & Tokyo",
    "Japon",
    "Asie",
    "NRT",
    "Premium",
    3200,
    4500,
    700,
    100,
    ["Mars", "Avr", "Oct", "Nov"],
    "14 – 21 jours",
    5.0,
    ["Culture", "Gastronomie", "Bien-être"],
    "Temples zen, ramen et néons de Shibuya.",
  ],
  [
    "c2",
    "Islande",
    "Islande",
    "Europe",
    "KEF",
    "Premium",
    3500,
    4800,
    120,
    160,
    ["Déc", "Jan", "Fév", "Juil"],
    "10 – 14 jours",
    4.9,
    ["Nature", "Aventure", "Bien-être"],
    "Aurores boréales, geysers et glaciers à 3 h de Paris.",
  ],
  [
    "c3",
    "New York",
    "États-Unis",
    "Amérique",
    "JFK",
    "Premium",
    3800,
    5200,
    350,
    180,
    ["Sept", "Oct", "Avr", "Mai"],
    "10 – 14 jours",
    4.8,
    ["Culture", "Gastronomie", "Shopping"],
    "Manhattan, musées et Central Park.",
  ],
  [
    "c4",
    "Sydney",
    "Australie",
    "Océanie",
    "SYD",
    "Premium",
    4000,
    5500,
    900,
    130,
    ["Sept", "Oct", "Nov", "Avr"],
    "21 jours",
    4.8,
    ["Plage", "Nature", "Aventure"],
    "Opera House, Bondi et la Grande Barrière de corail.",
  ],
  [
    "l1",
    "Maldives",
    "Maldives",
    "Asie",
    "MLE",
    "Prestige",
    6000,
    12000,
    700,
    350,
    ["Nov", "Déc", "Jan", "Fév"],
    "10 – 14 jours",
    5.0,
    ["Plage", "Luxe", "Bien-être"],
    "Bungalows sur pilotis et plongée avec les raies manta.",
  ],
  [
    "l2",
    "Polynésie française",
    "France",
    "Océanie",
    "PPT",
    "Prestige",
    7000,
    14000,
    1000,
    400,
    ["Mai", "Juin", "Juil", "Août"],
    "14 – 21 jours",
    5.0,
    ["Plage", "Luxe", "Bien-être"],
    "Bora Bora, Moorea et leurs lagons.",
  ],
  [
    "l3",
    "Dubaï",
    "Émirats arabes unis",
    "Asie",
    "DXB",
    "Prestige",
    4500,
    8000,
    200,
    250,
    ["Oct", "Nov", "Déc", "Jan"],
    "7 – 10 jours",
    4.6,
    ["Luxe", "Shopping", "Gastronomie"],
    "Burj Khalifa, désert et gastronomie internationale.",
  ],
];

// Budget « dès » pour deux (vols A/R + nuits + 60 € d'activités par personne) et niveau
const round50 = (n: number) => Math.round(n / 50) * 50;
const tierOf = (min: number): Tier =>
  min < 1500 ? "Essentiel" : min < 3500 ? "Confort" : min < 6000 ? "Premium" : "Prestige";
for (const c of PLACES) {
  const min = round50(c.flightFrom * 2 * 2 + c.hotelFrom * c.nights + 120);
  ROWS.push([
    c.id,
    c.name,
    c.country,
    c.continent,
    c.code,
    tierOf(min),
    min,
    round50(min * 1.45),
    c.flightFrom,
    c.hotelFrom,
    c.months,
    c.duration,
    c.rating,
    c.styles,
    c.desc,
  ]);
}

export const DESTINATIONS: CatalogDestination[] = ROWS.map(r => ({
  id: r[0],
  name: r[1],
  country: r[2],
  continent: r[3],
  code: r[4],
  tier: r[5],
  budgetMin: r[6],
  budgetMax: r[7],
  flightFrom: r[8],
  hotelFrom: r[9],
  months: r[10],
  duration: r[11],
  rating: r[12],
  styles: r[13],
  desc: r[14],
}));

export const TIERS: { label: Tier; range: string }[] = [
  { label: "Essentiel", range: "< 1 500 €" },
  { label: "Confort", range: "1 500 – 3 500 €" },
  { label: "Premium", range: "3 500 – 6 000 €" },
  { label: "Prestige", range: "6 000 € +" },
];

export const CONTINENTS: Continent[] = ["Europe", "Afrique", "Asie", "Amérique", "Océanie"];

export const MONTHS_SHORT = ["Jan", "Fév", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
export const MONTHS_LONG = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

export const eur = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} €`;

export const byId = (id: string | null | undefined) => DESTINATIONS.find(d => d.id === id);

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

// Villes ou régions que le copilote cite et qui correspondent à une destination du catalogue
const ALIASES: Record<string, string> = {
  reykjavik: "c2",
  islande: "c2",
  iceland: "c2",
  tokyo: "c1",
  kyoto: "c1",
  japon: "c1",
  athenes: "m1",
  santorin: "m1",
  santorini: "m1",
  phuket: "m3",
  "ko phi phi": "m3",
  nairobi: "m5",
  "masai mara": "m5",
  kenya: "m5",
  male: "l1",
  "bora bora": "l2",
  papeete: "l2",
  tahiti: "l2",
  moorea: "l2",
  lisbon: "t2",
  ubud: "t3",
  "chiang mai": "b3",
  hanoi: "b4",
  "baie d'halong": "b4",
  krakow: "b5",
  tbilisi: "b2",
  dubai: "l3",
};
for (const c of PLACES) for (const a of c.aliases || []) ALIASES[norm(a)] = c.id;

// Texte de recherche d'une destination : nom, pays, continent et autres noms (Tulum → Cancún)
export function searchText(d: CatalogDestination): string {
  const alias = Object.entries(ALIASES)
    .filter(([, id]) => id === d.id)
    .map(([a]) => a);
  return norm([d.name, d.country, d.continent, ...alias].join(" "));
}

// Retrouve une destination du catalogue à partir d'un nom libre ("Kyoto", "lisbon", "Reykjavik"…)
export function findDestination(name: string | null | undefined): CatalogDestination | undefined {
  if (!name) return undefined;
  const n = norm(name);
  if (!n) return undefined;
  if (ALIASES[n]) return byId(ALIASES[n]);
  return (
    DESTINATIONS.find(d => norm(d.name) === n) ||
    DESTINATIONS.find(d =>
      norm(d.name)
        .split(/[\s&+]+/)
        .some(part => part.length > 3 && n.includes(part)),
    ) ||
    DESTINATIONS.find(d => n.includes(norm(d.name)) || norm(d.name).includes(n)) ||
    DESTINATIONS.find(d => norm(d.country) === n)
  );
}

// Ville à utiliser pour les recherches de vols / hôtels ("Kyoto & Tokyo" → "Tokyo")
export function searchCity(d: CatalogDestination): string {
  const special: Record<string, string> = {
    m1: "Athènes",
    m3: "Phuket",
    m5: "Nairobi",
    c1: "Tokyo",
    c2: "Reykjavik",
    l1: "Malé",
    l2: "Papeete",
  };
  return special[d.id] || PLACES.find(c => c.id === d.id)?.searchCity || d.name;
}

// Estimation simple : vols A/R + hôtel + 60 € d'activités par personne
export function estimate(d: CatalogDestination, nights: number, pax: number) {
  const flight = d.flightFrom * 2 * pax;
  const hotel = d.hotelFrom * nights;
  const activities = 60 * pax;
  return { flight, hotel, activities, total: flight + hotel + activities };
}

export function currentMonthShort(date = new Date()) {
  return MONTHS_SHORT[date.getMonth()];
}

// Coordonnées (ville de référence) et monnaie locale : utilisées pour la météo,
// le taux de change et les lieux à voir (sources gratuites, voir /api/destination-info).
export const GEO: Record<string, { lat: number; lon: number; currency: string; currencyName: string }> = {
  t1: { lat: 31.63, lon: -7.99, currency: "MAD", currencyName: "dirham marocain" },
  t2: { lat: 38.72, lon: -9.14, currency: "EUR", currencyName: "euro" },
  t3: { lat: -8.51, lon: 115.26, currency: "IDR", currencyName: "roupie indonésienne" },
  t4: { lat: 6.24, lon: -75.58, currency: "COP", currencyName: "peso colombien" },
  t5: { lat: -45.03, lon: 168.66, currency: "NZD", currencyName: "dollar néo-zélandais" },
  b1: { lat: 47.5, lon: 19.04, currency: "HUF", currencyName: "forint" },
  b2: { lat: 41.72, lon: 44.79, currency: "GEL", currencyName: "lari" },
  b3: { lat: 18.79, lon: 98.98, currency: "THB", currencyName: "baht" },
  b4: { lat: 21.03, lon: 105.85, currency: "VND", currencyName: "dong" },
  b5: { lat: 50.06, lon: 19.94, currency: "PLN", currencyName: "zloty" },
  m1: { lat: 37.98, lon: 23.73, currency: "EUR", currencyName: "euro" },
  m2: { lat: 41.01, lon: 28.98, currency: "TRY", currencyName: "livre turque" },
  m3: { lat: 7.88, lon: 98.39, currency: "THB", currencyName: "baht" },
  m4: { lat: -34.6, lon: -58.38, currency: "ARS", currencyName: "peso argentin" },
  m5: { lat: -1.29, lon: 36.82, currency: "KES", currencyName: "shilling kényan" },
  c1: { lat: 35.01, lon: 135.77, currency: "JPY", currencyName: "yen" },
  c2: { lat: 64.15, lon: -21.94, currency: "ISK", currencyName: "couronne islandaise" },
  c3: { lat: 40.71, lon: -74.01, currency: "USD", currencyName: "dollar américain" },
  c4: { lat: -33.87, lon: 151.21, currency: "AUD", currencyName: "dollar australien" },
  l1: { lat: 4.18, lon: 73.51, currency: "MVR", currencyName: "rufiyaa" },
  l2: { lat: -17.54, lon: -149.57, currency: "XPF", currencyName: "franc Pacifique" },
  l3: { lat: 25.2, lon: 55.27, currency: "AED", currencyName: "dirham des Émirats" },
};
for (const c of PLACES)
  GEO[c.id] = { lat: c.lat, lon: c.lon, ...(CURRENCY[c.country] || { currency: "EUR", currencyName: "euro" }) };

// Coût de la vie sur place selon le niveau de la destination (1 = Europe de l'Ouest)
export function costFactor(name: string | null | undefined): number {
  const tier = findDestination(name)?.tier;
  return tier === "Essentiel" ? 0.6 : tier === "Premium" ? 1.3 : tier === "Prestige" ? 1.5 : 1;
}
