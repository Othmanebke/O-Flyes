/* Villes ajoutées au catalogue : pays faciles d'accès avec un passeport français et
   fréquentés par les voyageurs français. Chaque ville apporte tout ce dont les pages
   ont besoin pour être aussi détaillées que les destinations d'origine :
   - les compagnies qui desservent habituellement la ligne depuis Paris ;
   - les coordonnées et la monnaie (météo, change, lieux à voir) ;
   - les types d'hébergement du pays ;
   - la période conseillée, la durée et une courte description.
   Les prix (« dès ») sont des ordres de grandeur pour construire un budget :
   vol aller simple par personne, nuit pour deux en hébergement correct. */
import type { Continent } from "@/lib/catalog";
import type { FareKind, RouteOption } from "@/lib/travel/airlines";

type Paris = "CDG" | "ORY" | "BVA";

/* Vol : compagnie, aéroport parisien, durée totale (h), type de tarif, escale, aéroport d'arrivée */
const f = (airline: string, paris: Paris, hours: number, kind: FareKind, via?: string, dest?: string): RouteOption =>
    ({ airline, paris, hours, kind, via, stops: via ? 1 : 0, ...(dest ? { dest } : {}) });

export interface Place {
    id: string;
    name: string;
    country: string;
    continent: Continent;
    code: string; // aéroport d'arrivée, sert aussi de clé photo
    flightFrom: number;
    hotelFrom: number;
    nights: number; // durée type pour le budget « dès »
    months: string[];
    duration: string;
    rating: number;
    styles: string[];
    desc: string;
    lat: number;
    lon: number;
    routes: RouteOption[];
    aliases?: string[];
    searchCity?: string; // ville utilisée pour les recherches (vols, hôtels)
}

export const PLACES: Place[] = [
    // ── Espagne ──────────────────────────────────────────────────────────
    { id: "es-bcn", name: "Barcelone", country: "Espagne", continent: "Europe", code: "BCN", flightFrom: 45, hotelFrom: 90, nights: 4, months: ["Avr", "Mai", "Juin", "Sept", "Oct"], duration: "4 – 5 jours", rating: 4.7, styles: ["Culture", "Plage", "Gastronomie"],
      desc: "Gaudí, tapas et plage en pleine ville, à moins de 2 h de Paris.", lat: 41.39, lon: 2.17, aliases: ["barcelona"],
      routes: [f("Vueling", "ORY", 1.8, "low"), f("Transavia", "ORY", 1.8, "low"), f("easyJet", "CDG", 1.8, "low"), f("Air France", "CDG", 1.8, "legacy")] },
    { id: "es-mad", name: "Madrid", country: "Espagne", continent: "Europe", code: "MAD", flightFrom: 50, hotelFrom: 80, nights: 4, months: ["Mars", "Avr", "Mai", "Oct", "Nov"], duration: "4 – 5 jours", rating: 4.6, styles: ["Culture", "Gastronomie", "Fête"],
      desc: "Le Prado, le Retiro et les terrasses jusqu'à tard : la capitale la plus vivante d'Espagne.", lat: 40.42, lon: -3.7,
      routes: [f("Iberia", "ORY", 2, "legacy"), f("Air Europa", "ORY", 2, "legacy"), f("Transavia", "ORY", 2, "low"), f("Air France", "CDG", 2, "legacy")] },
    { id: "es-svq", name: "Séville", country: "Espagne", continent: "Europe", code: "SVQ", flightFrom: 55, hotelFrom: 70, nights: 4, months: ["Mars", "Avr", "Mai", "Oct", "Nov"], duration: "3 – 5 jours", rating: 4.8, styles: ["Culture", "Histoire", "Gastronomie"],
      desc: "Alcázar, flamenco et orangers. À éviter en plein été : il y fait souvent plus de 40 °C.", lat: 37.39, lon: -5.98, aliases: ["sevilla", "seville", "andalousie"],
      routes: [f("Transavia", "ORY", 2.3, "low"), f("Vueling", "ORY", 2.3, "low"), f("Ryanair", "BVA", 2.4, "low")] },
    { id: "es-vlc", name: "Valence", country: "Espagne", continent: "Europe", code: "VLC", flightFrom: 45, hotelFrom: 70, nights: 4, months: ["Avr", "Mai", "Juin", "Sept", "Oct"], duration: "3 – 5 jours", rating: 4.6, styles: ["Plage", "Gastronomie", "Culture"],
      desc: "La paella dans sa ville d'origine, la Cité des arts et des plages à 20 minutes du centre.", lat: 39.47, lon: -0.38, aliases: ["valencia"],
      routes: [f("Transavia", "ORY", 1.9, "low"), f("Vueling", "ORY", 1.9, "low"), f("Ryanair", "BVA", 2, "low")] },
    { id: "es-agp", name: "Malaga", country: "Espagne", continent: "Europe", code: "AGP", flightFrom: 60, hotelFrom: 75, nights: 6, months: ["Avr", "Mai", "Juin", "Sept", "Oct"], duration: "5 – 7 jours", rating: 4.6, styles: ["Plage", "Culture", "Gastronomie"],
      desc: "Porte d'entrée de l'Andalousie : musée Picasso, Alcazaba, puis Grenade et Ronda en excursion.", lat: 36.72, lon: -4.42, aliases: ["málaga", "costa del sol", "grenade", "granada"],
      routes: [f("Transavia", "ORY", 2.6, "low"), f("Vueling", "ORY", 2.6, "low"), f("easyJet", "CDG", 2.6, "low"), f("Air France", "CDG", 2.6, "legacy")] },
    { id: "es-pmi", name: "Majorque", country: "Espagne", continent: "Europe", code: "PMI", flightFrom: 55, hotelFrom: 95, nights: 6, months: ["Mai", "Juin", "Sept", "Oct"], duration: "5 – 7 jours", rating: 4.6, styles: ["Plage", "Nature", "Bien-être"],
      desc: "Criques turquoise, villages de la Serra de Tramuntana et Palma pour les soirées.", lat: 39.57, lon: 2.65, aliases: ["mallorca", "palma", "palma de majorque", "baleares", "baléares"], searchCity: "Palma",
      routes: [f("Transavia", "ORY", 1.9, "low"), f("Vueling", "ORY", 1.9, "low"), f("easyJet", "CDG", 1.9, "low")] },
    { id: "es-tfs", name: "Tenerife", country: "Espagne", continent: "Europe", code: "TFS", flightFrom: 110, hotelFrom: 80, nights: 7, months: ["Nov", "Déc", "Jan", "Fév", "Mars", "Avr"], duration: "7 jours", rating: 4.5, styles: ["Nature", "Plage", "Aventure"],
      desc: "Le volcan Teide, des plages de sable noir et 20 °C en plein hiver.", lat: 28.29, lon: -16.63, aliases: ["canaries", "îles canaries", "teide"],
      routes: [f("Transavia", "ORY", 4.5, "low"), f("Iberia", "ORY", 6.5, "legacy", "Madrid")] },

    // ── Italie ───────────────────────────────────────────────────────────
    { id: "it-rom", name: "Rome", country: "Italie", continent: "Europe", code: "FCO", flightFrom: 55, hotelFrom: 95, nights: 4, months: ["Mars", "Avr", "Mai", "Sept", "Oct"], duration: "4 – 5 jours", rating: 4.8, styles: ["Culture", "Histoire", "Gastronomie"],
      desc: "Colisée, Vatican et Trastevere : trois mille ans d'histoire à parcourir à pied.", lat: 41.9, lon: 12.5, aliases: ["roma", "vatican"],
      routes: [f("ITA Airways", "CDG", 2.1, "legacy"), f("Air France", "CDG", 2.1, "legacy"), f("easyJet", "CDG", 2.1, "low"), f("Vueling", "ORY", 2.1, "low"), f("Transavia", "ORY", 2.1, "low")] },
    { id: "it-flr", name: "Florence", country: "Italie", continent: "Europe", code: "FLR", flightFrom: 70, hotelFrom: 100, nights: 4, months: ["Avr", "Mai", "Juin", "Sept", "Oct"], duration: "4 – 6 jours", rating: 4.8, styles: ["Culture", "Histoire", "Gastronomie"],
      desc: "Le Duomo, les Offices et les collines de Toscane, à combiner avec Sienne et le Chianti.", lat: 43.77, lon: 11.26, aliases: ["firenze", "toscane", "tuscany"],
      routes: [f("Air France", "CDG", 1.8, "legacy"), f("Vueling", "ORY", 1.8, "low")] },
    { id: "it-vce", name: "Venise", country: "Italie", continent: "Europe", code: "VCE", flightFrom: 50, hotelFrom: 120, nights: 3, months: ["Avr", "Mai", "Sept", "Oct", "Nov"], duration: "3 – 4 jours", rating: 4.7, styles: ["Culture", "Histoire"],
      desc: "Canaux, palais et îles de la lagune. Dormir sur place permet de la voir sans la foule.", lat: 45.44, lon: 12.32, aliases: ["venezia", "venice", "burano", "murano"],
      routes: [f("Air France", "CDG", 1.6, "legacy"), f("easyJet", "CDG", 1.6, "low"), f("Transavia", "ORY", 1.6, "low")] },
    { id: "it-nap", name: "Naples", country: "Italie", continent: "Europe", code: "NAP", flightFrom: 60, hotelFrom: 80, nights: 6, months: ["Avr", "Mai", "Juin", "Sept", "Oct"], duration: "5 – 7 jours", rating: 4.7, styles: ["Culture", "Gastronomie", "Plage"],
      desc: "La pizza napolitaine, Pompéi, puis la côte amalfitaine et Capri en bateau.", lat: 40.85, lon: 14.27, aliases: ["napoli", "amalfi", "côte amalfitaine", "positano", "capri", "pompei", "pompéi"],
      routes: [f("Air France", "CDG", 2.2, "legacy"), f("easyJet", "CDG", 2.2, "low"), f("Transavia", "ORY", 2.2, "low")] },
    { id: "it-mil", name: "Milan", country: "Italie", continent: "Europe", code: "MXP", flightFrom: 40, hotelFrom: 100, nights: 3, months: ["Avr", "Mai", "Juin", "Sept", "Oct"], duration: "3 – 4 jours", rating: 4.4, styles: ["Culture", "Shopping", "Gastronomie"],
      desc: "Le Duomo, la Cène de Léonard de Vinci et le lac de Côme à une heure de train.", lat: 45.46, lon: 9.19, aliases: ["milano", "lac de côme", "come", "côme"],
      routes: [f("easyJet", "CDG", 1.4, "low"), f("Air France", "CDG", 1.4, "legacy", undefined, "LIN"), f("ITA Airways", "CDG", 1.4, "legacy", undefined, "LIN")] },
    { id: "it-cta", name: "Sicile", country: "Italie", continent: "Europe", code: "CTA", flightFrom: 70, hotelFrom: 75, nights: 7, months: ["Mai", "Juin", "Sept", "Oct"], duration: "7 – 10 jours", rating: 4.7, styles: ["Plage", "Histoire", "Gastronomie"],
      desc: "L'Etna, Taormina, Syracuse et les temples grecs, avec une cuisine à part.", lat: 37.5, lon: 15.09, aliases: ["sicily", "catane", "catania", "taormina", "palerme", "palermo", "syracuse", "etna"], searchCity: "Catane",
      routes: [f("Transavia", "ORY", 2.6, "low"), f("Air France", "CDG", 2.6, "legacy")] },

    // ── Portugal ─────────────────────────────────────────────────────────
    { id: "pt-opo", name: "Porto", country: "Portugal", continent: "Europe", code: "OPO", flightFrom: 50, hotelFrom: 70, nights: 4, months: ["Avr", "Mai", "Juin", "Sept", "Oct"], duration: "3 – 5 jours", rating: 4.8, styles: ["Culture", "Gastronomie"],
      desc: "Les quais de la Ribeira, les caves de porto et la vallée du Douro en excursion.", lat: 41.15, lon: -8.61, aliases: ["oporto", "douro"],
      routes: [f("TAP Air Portugal", "ORY", 2.1, "legacy"), f("Transavia", "ORY", 2.1, "low"), f("easyJet", "CDG", 2.1, "low"), f("Ryanair", "BVA", 2.1, "low")] },
    { id: "pt-fnc", name: "Madère", country: "Portugal", continent: "Europe", code: "FNC", flightFrom: 110, hotelFrom: 75, nights: 7, months: ["Mars", "Avr", "Mai", "Juin", "Sept", "Oct"], duration: "7 jours", rating: 4.8, styles: ["Nature", "Aventure"],
      desc: "Randonnées le long des levadas, falaises et piscines naturelles, doux toute l'année.", lat: 32.65, lon: -16.91, aliases: ["madeira", "funchal"], searchCity: "Funchal",
      routes: [f("Transavia", "ORY", 3.9, "low"), f("TAP Air Portugal", "ORY", 5.5, "legacy", "Lisbonne")] },
    { id: "pt-fao", name: "Algarve", country: "Portugal", continent: "Europe", code: "FAO", flightFrom: 60, hotelFrom: 80, nights: 7, months: ["Mai", "Juin", "Sept", "Oct"], duration: "5 – 7 jours", rating: 4.6, styles: ["Plage", "Nature"],
      desc: "Falaises dorées, grottes de Benagil et villages de pêcheurs au sud du Portugal.", lat: 37.02, lon: -7.93, aliases: ["faro", "lagos", "benagil"], searchCity: "Faro",
      routes: [f("Transavia", "ORY", 2.6, "low"), f("easyJet", "CDG", 2.6, "low"), f("Ryanair", "BVA", 2.7, "low")] },

    // ── Grèce ────────────────────────────────────────────────────────────
    { id: "gr-her", name: "Crète", country: "Grèce", continent: "Europe", code: "HER", flightFrom: 90, hotelFrom: 70, nights: 7, months: ["Mai", "Juin", "Sept", "Oct"], duration: "7 – 10 jours", rating: 4.7, styles: ["Plage", "Nature", "Histoire"],
      desc: "Lagons de Balos, gorges de Samaria et palais de Knossos sur la plus grande île grecque.", lat: 35.34, lon: 25.13, aliases: ["crete", "héraklion", "heraklion", "chania", "la canée"], searchCity: "Héraklion",
      routes: [f("Transavia", "ORY", 3.5, "low"), f("easyJet", "CDG", 3.5, "low"), f("Aegean Airlines", "CDG", 5.5, "legacy", "Athènes")] },
    { id: "gr-cfu", name: "Corfou", country: "Grèce", continent: "Europe", code: "CFU", flightFrom: 85, hotelFrom: 75, nights: 7, months: ["Mai", "Juin", "Sept", "Oct"], duration: "7 jours", rating: 4.5, styles: ["Plage", "Culture"],
      desc: "Vieille ville vénitienne, oliveraies et criques de la mer Ionienne.", lat: 39.62, lon: 19.92, aliases: ["corfu", "kerkyra"],
      routes: [f("Transavia", "ORY", 2.8, "low"), f("easyJet", "CDG", 2.8, "low"), f("Aegean Airlines", "CDG", 5, "legacy", "Athènes")] },

    // ── Croatie ──────────────────────────────────────────────────────────
    { id: "hr-dbv", name: "Dubrovnik", country: "Croatie", continent: "Europe", code: "DBV", flightFrom: 90, hotelFrom: 120, nights: 5, months: ["Mai", "Juin", "Sept", "Oct"], duration: "4 – 6 jours", rating: 4.6, styles: ["Culture", "Plage", "Histoire"],
      desc: "Remparts sur l'Adriatique et îles Élaphites en bateau. Très fréquentée en juillet-août.", lat: 42.65, lon: 18.09,
      routes: [f("Transavia", "ORY", 2.3, "low"), f("Croatia Airlines", "CDG", 2.3, "legacy")] },
    { id: "hr-spu", name: "Split", country: "Croatie", continent: "Europe", code: "SPU", flightFrom: 80, hotelFrom: 95, nights: 7, months: ["Mai", "Juin", "Sept", "Oct"], duration: "5 – 8 jours", rating: 4.6, styles: ["Plage", "Culture", "Nature"],
      desc: "Le palais de Dioclétien, les îles de Hvar et Brač, et les cascades de Krka.", lat: 43.51, lon: 16.44, aliases: ["hvar", "croatie", "croatia"],
      routes: [f("Transavia", "ORY", 2.2, "low"), f("easyJet", "CDG", 2.2, "low"), f("Croatia Airlines", "CDG", 2.2, "legacy")] },

    // ── Maroc ────────────────────────────────────────────────────────────
    { id: "ma-fez", name: "Fès", country: "Maroc", continent: "Afrique", code: "FEZ", flightFrom: 50, hotelFrom: 35, nights: 5, months: ["Mars", "Avr", "Mai", "Oct", "Nov"], duration: "4 – 6 jours", rating: 4.6, styles: ["Culture", "Histoire", "Shopping"],
      desc: "La plus grande médina du monde, ses tanneries et ses artisans, à 3 h de Paris.", lat: 34.03, lon: -5, aliases: ["fes", "fez", "meknès", "meknes"],
      routes: [f("Transavia", "ORY", 2.8, "low"), f("Ryanair", "BVA", 2.9, "low"), f("Royal Air Maroc", "ORY", 2.8, "legacy")] },
    { id: "ma-aga", name: "Agadir", country: "Maroc", continent: "Afrique", code: "AGA", flightFrom: 70, hotelFrom: 50, nights: 7, months: ["Oct", "Nov", "Déc", "Jan", "Fév", "Mars", "Avr"], duration: "7 jours", rating: 4.3, styles: ["Plage", "Bien-être", "Aventure"],
      desc: "Grande plage, soleil en hiver et surf à Taghazout, à 20 minutes au nord.", lat: 30.43, lon: -9.6, aliases: ["taghazout"],
      routes: [f("Transavia", "ORY", 3.7, "low"), f("Ryanair", "BVA", 3.8, "low"), f("Royal Air Maroc", "ORY", 5.5, "legacy", "Casablanca")] },
    { id: "ma-esu", name: "Essaouira", country: "Maroc", continent: "Afrique", code: "ESU", flightFrom: 80, hotelFrom: 45, nights: 5, months: ["Avr", "Mai", "Juin", "Sept", "Oct"], duration: "4 – 6 jours", rating: 4.6, styles: ["Plage", "Culture", "Aventure"],
      desc: "Médina blanche et bleue face à l'Atlantique, port de pêche et kitesurf.", lat: 31.51, lon: -9.77, aliases: ["mogador"],
      routes: [f("Transavia", "ORY", 3.4, "low"), f("Royal Air Maroc", "ORY", 5.5, "legacy", "Casablanca")] },
    { id: "ma-tng", name: "Tanger", country: "Maroc", continent: "Afrique", code: "TNG", flightFrom: 60, hotelFrom: 45, nights: 5, months: ["Avr", "Mai", "Juin", "Sept", "Oct"], duration: "4 – 6 jours", rating: 4.5, styles: ["Culture", "Nature", "Histoire"],
      desc: "La kasbah face au détroit de Gibraltar, puis Chefchaouen, la ville bleue du Rif, à 2 h de route.", lat: 35.76, lon: -5.83, aliases: ["tangier", "chefchaouen", "chaouen", "tetouan", "tétouan"],
      routes: [f("Transavia", "ORY", 2.6, "low"), f("Royal Air Maroc", "ORY", 2.6, "legacy"), f("Ryanair", "BVA", 2.7, "low")] },

    // ── Tunisie ──────────────────────────────────────────────────────────
    { id: "tn-dje", name: "Djerba", country: "Tunisie", continent: "Afrique", code: "DJE", flightFrom: 110, hotelFrom: 55, nights: 7, months: ["Avr", "Mai", "Juin", "Sept", "Oct"], duration: "7 jours", rating: 4.3, styles: ["Plage", "Bien-être", "Culture"],
      desc: "Plages de sable fin, houmts aux maisons blanches et synagogue de la Ghriba.", lat: 33.81, lon: 10.86, aliases: ["jerba", "houmt souk"],
      routes: [f("Transavia", "ORY", 2.8, "low"), f("Tunisair", "ORY", 2.8, "legacy"), f("Nouvelair", "ORY", 2.8, "low")] },
    { id: "tn-tun", name: "Tunis", country: "Tunisie", continent: "Afrique", code: "TUN", flightFrom: 90, hotelFrom: 50, nights: 5, months: ["Avr", "Mai", "Juin", "Sept", "Oct"], duration: "4 – 6 jours", rating: 4.4, styles: ["Culture", "Histoire", "Plage"],
      desc: "La médina, Carthage, le musée du Bardo et Sidi Bou Saïd, blanc et bleu au-dessus de la mer.", lat: 36.81, lon: 10.18, aliases: ["sidi bou said", "sidi bou saïd", "carthage", "hammamet"],
      routes: [f("Tunisair", "ORY", 2.2, "legacy"), f("Transavia", "ORY", 2.2, "low"), f("Nouvelair", "ORY", 2.2, "low"), f("Air France", "CDG", 2.2, "legacy")] },

    // ── Égypte ───────────────────────────────────────────────────────────
    { id: "eg-cai", name: "Le Caire", country: "Égypte", continent: "Afrique", code: "CAI", flightFrom: 200, hotelFrom: 45, nights: 4, months: ["Oct", "Nov", "Déc", "Jan", "Fév", "Mars"], duration: "3 – 5 jours", rating: 4.5, styles: ["Histoire", "Culture"],
      desc: "Les pyramides de Gizeh, le Grand Musée égyptien et le Caire islamique.", lat: 30.04, lon: 31.24, aliases: ["cairo", "caire", "gizeh", "giza", "pyramides"],
      routes: [f("Air France", "CDG", 4.3, "legacy"), f("EgyptAir", "CDG", 4.3, "legacy")] },
    { id: "eg-hrg", name: "Hurghada", country: "Égypte", continent: "Afrique", code: "HRG", flightFrom: 170, hotelFrom: 50, nights: 7, months: ["Oct", "Nov", "Mars", "Avr", "Mai"], duration: "7 jours", rating: 4.3, styles: ["Plage", "Aventure", "Bien-être"],
      desc: "Plongée et snorkeling sur les récifs de la mer Rouge, soleil presque garanti.", lat: 27.26, lon: 33.81, aliases: ["mer rouge", "red sea", "el gouna", "marsa alam"],
      routes: [f("Transavia", "ORY", 4.8, "low"), f("EgyptAir", "CDG", 7.5, "legacy", "Le Caire")] },
    { id: "eg-lxr", name: "Louxor", country: "Égypte", continent: "Afrique", code: "LXR", flightFrom: 260, hotelFrom: 40, nights: 5, months: ["Oct", "Nov", "Déc", "Jan", "Fév", "Mars"], duration: "4 – 7 jours", rating: 4.7, styles: ["Histoire", "Culture"],
      desc: "Karnak, la Vallée des Rois et la croisière sur le Nil vers Assouan.", lat: 25.69, lon: 32.64, aliases: ["luxor", "nil", "croisière sur le nil", "assouan", "aswan"],
      routes: [f("Transavia", "ORY", 4.9, "low"), f("EgyptAir", "CDG", 7, "legacy", "Le Caire")] },

    // ── Turquie ──────────────────────────────────────────────────────────
    { id: "tr-nav", name: "Cappadoce", country: "Turquie", continent: "Asie", code: "NAV", flightFrom: 180, hotelFrom: 70, nights: 4, months: ["Avr", "Mai", "Juin", "Sept", "Oct"], duration: "3 – 4 jours", rating: 4.8, styles: ["Nature", "Aventure", "Histoire"],
      desc: "Cheminées de fée, villes souterraines et montgolfières au lever du soleil.", lat: 38.64, lon: 34.83, aliases: ["cappadocia", "goreme", "göreme", "kayseri"], searchCity: "Göreme",
      routes: [f("Turkish Airlines", "CDG", 6, "legacy", "Istanbul"), f("Pegasus Airlines", "CDG", 6.5, "low", "Istanbul", "ASR")] },
    { id: "tr-ayt", name: "Antalya", country: "Turquie", continent: "Asie", code: "AYT", flightFrom: 120, hotelFrom: 60, nights: 7, months: ["Mai", "Juin", "Sept", "Oct"], duration: "7 jours", rating: 4.4, styles: ["Plage", "Histoire", "Bien-être"],
      desc: "La riviera turque : vieille ville de Kaleiçi, plages et sites antiques de Lycie.", lat: 36.9, lon: 30.7, aliases: ["kas", "kaş", "side", "alanya"],
      routes: [f("Transavia", "ORY", 4, "low"), f("Turkish Airlines", "CDG", 6, "legacy", "Istanbul"), f("Pegasus Airlines", "CDG", 6.5, "low", "Istanbul")] },

    // ── Thaïlande ────────────────────────────────────────────────────────
    { id: "th-bkk", name: "Bangkok", country: "Thaïlande", continent: "Asie", code: "BKK", flightFrom: 380, hotelFrom: 40, nights: 4, months: ["Nov", "Déc", "Jan", "Fév"], duration: "3 – 4 jours (avant les îles)", rating: 4.6, styles: ["Culture", "Gastronomie", "Fête"],
      desc: "Temples dorés, marchés flottants et cuisine de rue, souvent en début de voyage.", lat: 13.76, lon: 100.5, aliases: ["bangkok thailande"],
      routes: [f("Thai Airways", "CDG", 11.5, "legacy"), f("Air France", "CDG", 11.5, "legacy"), f("Qatar Airways", "CDG", 14, "gulf", "Doha"), f("Emirates", "CDG", 14.5, "gulf", "Dubaï")] },
    { id: "th-kbv", name: "Krabi", country: "Thaïlande", continent: "Asie", code: "KBV", flightFrom: 450, hotelFrom: 40, nights: 8, months: ["Nov", "Déc", "Jan", "Fév", "Mars", "Avr"], duration: "7 – 10 jours", rating: 4.7, styles: ["Plage", "Nature", "Aventure"],
      desc: "Pitons calcaires, plage de Railay et îles de la mer d'Andaman en long-tail.", lat: 8.09, lon: 98.91, aliases: ["ao nang", "railay", "koh lanta", "ko lanta"],
      routes: [f("Thai Airways", "CDG", 14, "legacy", "Bangkok"), f("Qatar Airways", "CDG", 15, "gulf", "Doha")] },
    { id: "th-usm", name: "Koh Samui", country: "Thaïlande", continent: "Asie", code: "USM", flightFrom: 520, hotelFrom: 55, nights: 8, months: ["Fév", "Mars", "Avr", "Mai", "Juin", "Juil", "Août"], duration: "7 – 10 jours", rating: 4.5, styles: ["Plage", "Bien-être"],
      desc: "Île du golfe de Thaïlande, avec Koh Phangan et Koh Tao à côté. Meilleure en été, quand la côte ouest est sous la mousson.", lat: 9.51, lon: 100.01, aliases: ["ko samui", "samui", "koh tao", "koh phangan"],
      routes: [f("Thai Airways + Bangkok Airways", "CDG", 14.5, "legacy", "Bangkok"), f("Air France + Bangkok Airways", "CDG", 14.5, "legacy", "Bangkok")] },

    // ── Vietnam ──────────────────────────────────────────────────────────
    { id: "vn-sgn", name: "Hô Chi Minh-Ville", country: "Vietnam", continent: "Asie", code: "SGN", flightFrom: 420, hotelFrom: 35, nights: 7, months: ["Déc", "Jan", "Fév", "Mars", "Avr"], duration: "4 jours, puis le delta du Mékong", rating: 4.4, styles: ["Culture", "Gastronomie"],
      desc: "L'ancienne Saïgon, sa cuisine de rue, puis le delta du Mékong en bateau.", lat: 10.78, lon: 106.7, aliases: ["saigon", "saïgon", "ho chi minh", "mekong", "mékong"],
      routes: [f("Vietnam Airlines", "CDG", 12.5, "legacy"), f("Air France", "CDG", 12.5, "legacy"), f("Qatar Airways", "CDG", 15.5, "gulf", "Doha")] },
    { id: "vn-dad", name: "Hoi An", country: "Vietnam", continent: "Asie", code: "DAD", flightFrom: 480, hotelFrom: 35, nights: 6, months: ["Fév", "Mars", "Avr", "Mai", "Juin", "Juil"], duration: "4 – 6 jours", rating: 4.8, styles: ["Culture", "Plage", "Gastronomie"],
      desc: "Vieille ville aux lanternes, tailleurs et rizières, avec les plages de Da Nang à côté.", lat: 15.88, lon: 108.33, aliases: ["hội an", "da nang", "danang", "hue", "hué"], searchCity: "Hoi An",
      routes: [f("Vietnam Airlines", "CDG", 15, "legacy", "Hanoï"), f("Singapore Airlines", "CDG", 16, "gulf", "Singapour")] },

    // ── Japon ────────────────────────────────────────────────────────────
    { id: "jp-kix", name: "Osaka", country: "Japon", continent: "Asie", code: "KIX", flightFrom: 450, hotelFrom: 80, nights: 5, months: ["Mars", "Avr", "Mai", "Oct", "Nov"], duration: "4 – 5 jours", rating: 4.6, styles: ["Gastronomie", "Culture", "Fête"],
      desc: "Capitale de la cuisine de rue japonaise, à 15 minutes de train de Kyoto et de Nara.", lat: 34.69, lon: 135.5, aliases: ["nara", "kobe"],
      routes: [f("Air France", "CDG", 13.5, "legacy"), f("Finnair", "CDG", 16, "legacy", "Helsinki"), f("Emirates", "CDG", 18, "gulf", "Dubaï")] },

    // ── États-Unis ───────────────────────────────────────────────────────
    { id: "us-lax", name: "Los Angeles", country: "États-Unis", continent: "Amérique", code: "LAX", flightFrom: 330, hotelFrom: 170, nights: 6, months: ["Avr", "Mai", "Juin", "Sept", "Oct"], duration: "5 – 7 jours (ou road trip)", rating: 4.3, styles: ["Plage", "Culture", "Shopping"],
      desc: "Hollywood, Santa Monica et Malibu, point de départ des road trips vers l'Ouest.", lat: 34.05, lon: -118.24, aliases: ["la", "hollywood", "californie", "california"],
      routes: [f("Air France", "CDG", 11.5, "legacy"), f("Air Tahiti Nui", "CDG", 11.5, "legacy")] },
    { id: "us-sfo", name: "San Francisco", country: "États-Unis", continent: "Amérique", code: "SFO", flightFrom: 340, hotelFrom: 190, nights: 5, months: ["Mai", "Juin", "Sept", "Oct"], duration: "4 – 6 jours", rating: 4.5, styles: ["Culture", "Nature", "Gastronomie"],
      desc: "Golden Gate, cable cars et Yosemite à quatre heures de route.", lat: 37.77, lon: -122.42, aliases: ["yosemite"],
      routes: [f("Air France", "CDG", 11.5, "legacy"), f("United", "CDG", 11.5, "legacy"), f("French bee", "ORY", 11.5, "low")] },
    { id: "us-mia", name: "Miami", country: "États-Unis", continent: "Amérique", code: "MIA", flightFrom: 280, hotelFrom: 170, nights: 6, months: ["Nov", "Déc", "Jan", "Fév", "Mars", "Avr"], duration: "5 – 7 jours", rating: 4.3, styles: ["Plage", "Fête", "Nature"],
      desc: "Art déco de South Beach, Everglades et route des Keys jusqu'à Key West.", lat: 25.76, lon: -80.19, aliases: ["floride", "florida", "key west", "everglades"],
      routes: [f("Air France", "CDG", 10, "legacy"), f("American Airlines", "CDG", 10, "legacy")] },

    // ── Canada ───────────────────────────────────────────────────────────
    { id: "ca-yul", name: "Montréal", country: "Canada", continent: "Amérique", code: "YUL", flightFrom: 240, hotelFrom: 130, nights: 6, months: ["Juin", "Juil", "Août", "Sept", "Oct"], duration: "5 – 7 jours", rating: 4.6, styles: ["Culture", "Gastronomie", "Fête"],
      desc: "Le Vieux-Montréal, les festivals d'été et les couleurs de l'automne, en français.", lat: 45.5, lon: -73.57, aliases: ["montreal", "canada"],
      routes: [f("Air Canada", "CDG", 7.5, "legacy"), f("Air France", "CDG", 7.5, "legacy"), f("Air Transat", "CDG", 7.5, "low"), f("Corsair", "ORY", 7.5, "low")] },
    { id: "ca-yqb", name: "Québec", country: "Canada", continent: "Amérique", code: "YQB", flightFrom: 300, hotelFrom: 130, nights: 6, months: ["Juin", "Juil", "Août", "Sept", "Oct", "Fév"], duration: "5 – 7 jours", rating: 4.7, styles: ["Culture", "Nature", "Histoire"],
      desc: "Vieille ville fortifiée, Château Frontenac, et baleines à Tadoussac en été.", lat: 46.81, lon: -71.21, aliases: ["quebec", "ville de québec", "tadoussac", "charlevoix"],
      routes: [f("Air Transat", "CDG", 7.5, "low"), f("Air Canada", "CDG", 9.5, "legacy", "Montréal")] },
    { id: "ca-yvr", name: "Vancouver", country: "Canada", continent: "Amérique", code: "YVR", flightFrom: 380, hotelFrom: 150, nights: 8, months: ["Juin", "Juil", "Août", "Sept"], duration: "7 – 14 jours (avec les Rocheuses)", rating: 4.6, styles: ["Nature", "Aventure", "Culture"],
      desc: "Ville entre océan et montagnes, porte d'entrée de l'île de Vancouver et des Rocheuses.", lat: 49.28, lon: -123.12, aliases: ["rocheuses", "banff", "colombie-britannique", "whistler"],
      routes: [f("Air France", "CDG", 10.5, "legacy"), f("Air Canada", "CDG", 10.5, "legacy"), f("Air Transat", "CDG", 10.5, "low")] },

    // ── Mexique ──────────────────────────────────────────────────────────
    { id: "mx-cun", name: "Cancún", country: "Mexique", continent: "Amérique", code: "CUN", flightFrom: 330, hotelFrom: 110, nights: 9, months: ["Déc", "Jan", "Fév", "Mars", "Avr"], duration: "10 – 14 jours", rating: 4.5, styles: ["Plage", "Histoire", "Aventure"],
      desc: "Riviera maya : Tulum, Chichén Itzá, cenotes et mer des Caraïbes.", lat: 21.16, lon: -86.85, aliases: ["cancun", "tulum", "playa del carmen", "riviera maya", "yucatan", "yucatán", "chichen itza"],
      routes: [f("Air France", "CDG", 11, "legacy"), f("Iberia", "ORY", 14, "legacy", "Madrid"), f("Air Europa", "ORY", 14, "legacy", "Madrid")] },
    { id: "mx-mex", name: "Mexico", country: "Mexique", continent: "Amérique", code: "MEX", flightFrom: 380, hotelFrom: 70, nights: 6, months: ["Oct", "Nov", "Déc", "Jan", "Fév", "Mars", "Avr"], duration: "5 – 7 jours, puis Oaxaca", rating: 4.6, styles: ["Culture", "Gastronomie", "Histoire"],
      desc: "Musées, quartiers de Coyoacán et Roma, pyramides de Teotihuacán et cuisine de rue.", lat: 19.43, lon: -99.13, aliases: ["mexico city", "ciudad de mexico", "ciudad de méxico", "oaxaca", "teotihuacan"],
      routes: [f("Air France", "CDG", 12, "legacy"), f("Aeroméxico", "CDG", 12, "legacy")] },

    // ── Brésil ───────────────────────────────────────────────────────────
    { id: "br-gig", name: "Rio de Janeiro", country: "Brésil", continent: "Amérique", code: "GIG", flightFrom: 430, hotelFrom: 80, nights: 7, months: ["Avr", "Mai", "Juin", "Sept", "Oct"], duration: "6 – 8 jours", rating: 4.6, styles: ["Plage", "Fête", "Nature"],
      desc: "Pain de Sucre, Christ rédempteur, Copacabana et Ipanema. Carnaval en février ou mars.", lat: -22.91, lon: -43.17, aliases: ["rio", "copacabana", "ipanema", "bresil", "brazil"],
      routes: [f("Air France", "CDG", 11.5, "legacy"), f("TAP Air Portugal", "ORY", 14, "legacy", "Lisbonne")] },
    { id: "br-gru", name: "São Paulo", country: "Brésil", continent: "Amérique", code: "GRU", flightFrom: 420, hotelFrom: 70, nights: 4, months: ["Avr", "Mai", "Juin", "Sept", "Oct"], duration: "3 – 4 jours", rating: 4.2, styles: ["Culture", "Gastronomie", "Fête"],
      desc: "La plus grande ville d'Amérique du Sud : musées, street art et restaurants.", lat: -23.55, lon: -46.63, aliases: ["sao paulo", "sampa"],
      routes: [f("Air France", "CDG", 11.5, "legacy"), f("LATAM", "CDG", 11.5, "legacy"), f("TAP Air Portugal", "ORY", 14, "legacy", "Lisbonne")] },
    { id: "br-ssa", name: "Salvador de Bahia", country: "Brésil", continent: "Amérique", code: "SSA", flightFrom: 450, hotelFrom: 60, nights: 7, months: ["Sept", "Oct", "Nov", "Déc", "Jan", "Fév"], duration: "6 – 8 jours", rating: 4.5, styles: ["Culture", "Plage", "Fête"],
      desc: "Le Pelourinho coloré, la culture afro-brésilienne et les plages de Bahia.", lat: -12.97, lon: -38.5, aliases: ["salvador", "bahia", "morro de sao paulo"],
      routes: [f("TAP Air Portugal", "ORY", 12, "legacy", "Lisbonne"), f("Air Europa", "ORY", 13, "legacy", "Madrid")] },

    // ── Royaume-Uni, Irlande, Pays-Bas, Allemagne ────────────────────────
    { id: "gb-lon", name: "Londres", country: "Royaume-Uni", continent: "Europe", code: "LHR", flightFrom: 60, hotelFrom: 150, nights: 4, months: ["Avr", "Mai", "Juin", "Juil", "Sept", "Déc"], duration: "3 – 5 jours", rating: 4.6, styles: ["Culture", "Shopping", "Fête"],
      desc: "Musées gratuits, marchés et quartiers très différents. En train, l'Eurostar relie Paris en 2 h 20.", lat: 51.51, lon: -0.13, aliases: ["london", "angleterre", "england", "uk"],
      routes: [f("Air France", "CDG", 1.3, "legacy"), f("British Airways", "CDG", 1.3, "legacy"), f("easyJet", "CDG", 1.3, "low", undefined, "LGW")] },
    { id: "gb-edi", name: "Édimbourg", country: "Royaume-Uni", continent: "Europe", code: "EDI", flightFrom: 70, hotelFrom: 130, nights: 5, months: ["Mai", "Juin", "Juil", "Août", "Sept"], duration: "4 – 6 jours (avec les Highlands)", rating: 4.7, styles: ["Culture", "Histoire", "Nature"],
      desc: "Château, vieille ville médiévale, festival d'août et excursions dans les Highlands.", lat: 55.95, lon: -3.19, aliases: ["edinburgh", "edimbourg", "ecosse", "écosse", "scotland", "highlands"],
      routes: [f("easyJet", "CDG", 1.8, "low"), f("Air France", "CDG", 1.8, "legacy")] },
    { id: "ie-dub", name: "Dublin", country: "Irlande", continent: "Europe", code: "DUB", flightFrom: 50, hotelFrom: 140, nights: 5, months: ["Mai", "Juin", "Juil", "Août", "Sept"], duration: "4 – 7 jours", rating: 4.4, styles: ["Culture", "Fête", "Nature"],
      desc: "Pubs et musique live, puis les falaises de Moher et le Connemara en road trip.", lat: 53.35, lon: -6.26, aliases: ["irlande", "ireland", "connemara", "galway"],
      routes: [f("Aer Lingus", "CDG", 1.6, "legacy"), f("Air France", "CDG", 1.6, "legacy"), f("Ryanair", "BVA", 1.6, "low")] },
    { id: "nl-ams", name: "Amsterdam", country: "Pays-Bas", continent: "Europe", code: "AMS", flightFrom: 50, hotelFrom: 140, nights: 3, months: ["Avr", "Mai", "Juin", "Sept"], duration: "3 – 4 jours", rating: 4.5, styles: ["Culture", "Fête", "Shopping"],
      desc: "Canaux, Rijksmuseum et vélos. Le train direct depuis Paris met environ 3 h 20.", lat: 52.37, lon: 4.9, aliases: ["pays-bas", "hollande", "netherlands"],
      routes: [f("KLM", "CDG", 1.3, "legacy"), f("Air France", "CDG", 1.3, "legacy"), f("Transavia", "ORY", 1.3, "low")] },
    { id: "de-ber", name: "Berlin", country: "Allemagne", continent: "Europe", code: "BER", flightFrom: 50, hotelFrom: 90, nights: 4, months: ["Mai", "Juin", "Juil", "Août", "Sept", "Déc"], duration: "3 – 5 jours", rating: 4.5, styles: ["Culture", "Histoire", "Fête"],
      desc: "Mémoire du Mur, île aux Musées et vie nocturne, pour un week-end prolongé.", lat: 52.52, lon: 13.4, aliases: ["allemagne", "germany"],
      routes: [f("Air France", "CDG", 1.8, "legacy"), f("easyJet", "CDG", 1.8, "low")] },

    // ── Outre-mer, océan Indien, Afrique de l'Ouest, Caraïbes ───────────
    { id: "fr-run", name: "La Réunion", country: "France", continent: "Afrique", code: "RUN", flightFrom: 380, hotelFrom: 80, nights: 12, months: ["Avr", "Mai", "Juin", "Sept", "Oct", "Nov"], duration: "12 – 15 jours", rating: 4.8, styles: ["Nature", "Aventure", "Plage"],
      desc: "Piton de la Fournaise, cirques de Mafate et Cilaos, lagon de l'Ouest, sans passeport.", lat: -21.12, lon: 55.54, aliases: ["reunion", "réunion", "saint-denis", "mafate", "cilaos"], searchCity: "Saint-Denis, La Réunion",
      routes: [f("Air Austral", "CDG", 11, "legacy"), f("Air France", "ORY", 11, "legacy"), f("Corsair", "ORY", 11, "low"), f("French bee", "ORY", 11, "low")] },
    { id: "fr-ptp", name: "Guadeloupe", country: "France", continent: "Amérique", code: "PTP", flightFrom: 260, hotelFrom: 90, nights: 10, months: ["Déc", "Jan", "Fév", "Mars", "Avr", "Mai"], duration: "10 – 14 jours", rating: 4.6, styles: ["Plage", "Nature", "Gastronomie"],
      desc: "Plages de Grande-Terre, forêt et cascades de Basse-Terre, Marie-Galante et les Saintes.", lat: 16.24, lon: -61.53, aliases: ["pointe-à-pitre", "pointe-a-pitre", "basse-terre", "marie-galante", "les saintes", "antilles"], searchCity: "Pointe-à-Pitre",
      routes: [f("Air France", "ORY", 8.5, "legacy"), f("Air Caraïbes", "ORY", 8.5, "legacy"), f("Corsair", "ORY", 8.5, "low")] },
    { id: "fr-fdf", name: "Martinique", country: "France", continent: "Amérique", code: "FDF", flightFrom: 260, hotelFrom: 90, nights: 10, months: ["Déc", "Jan", "Fév", "Mars", "Avr", "Mai"], duration: "10 – 14 jours", rating: 4.6, styles: ["Plage", "Nature", "Gastronomie"],
      desc: "La montagne Pelée, les anses du sud, la route des rhums et la cuisine créole.", lat: 14.61, lon: -61.05, aliases: ["fort-de-france", "les trois-îlets", "sainte-anne"], searchCity: "Fort-de-France",
      routes: [f("Air France", "ORY", 8.5, "legacy"), f("Air Caraïbes", "ORY", 8.5, "legacy"), f("Corsair", "ORY", 8.5, "low")] },
    { id: "mu-mru", name: "Île Maurice", country: "Maurice", continent: "Afrique", code: "MRU", flightFrom: 450, hotelFrom: 90, nights: 10, months: ["Avr", "Mai", "Juin", "Sept", "Oct", "Nov"], duration: "10 – 14 jours", rating: 4.6, styles: ["Plage", "Bien-être", "Nature"],
      desc: "Lagons, Le Morne, terre des Sept Couleurs et cuisine métissée, sans visa.", lat: -20.16, lon: 57.5, aliases: ["maurice", "mauritius", "ile maurice", "port-louis", "le morne"], searchCity: "Port-Louis",
      routes: [f("Air Mauritius", "CDG", 11.5, "legacy"), f("Air France", "CDG", 11.5, "legacy"), f("Emirates", "CDG", 15, "gulf", "Dubaï")] },
    { id: "sn-dss", name: "Dakar", country: "Sénégal", continent: "Afrique", code: "DSS", flightFrom: 230, hotelFrom: 70, nights: 8, months: ["Nov", "Déc", "Jan", "Fév", "Mars", "Avr"], duration: "7 – 10 jours", rating: 4.4, styles: ["Culture", "Plage", "Nature"],
      desc: "L'île de Gorée, le lac Rose, puis le Sine-Saloum et la Petite-Côte.", lat: 14.72, lon: -17.47, aliases: ["senegal", "sénégal", "goree", "gorée", "saly", "saint-louis du sénégal"],
      routes: [f("Air France", "CDG", 5.5, "legacy"), f("Air Sénégal", "CDG", 5.5, "legacy"), f("Transavia", "ORY", 5.5, "low")] },
    { id: "do-puj", name: "Punta Cana", country: "République dominicaine", continent: "Amérique", code: "PUJ", flightFrom: 350, hotelFrom: 120, nights: 9, months: ["Déc", "Jan", "Fév", "Mars", "Avr"], duration: "8 – 12 jours", rating: 4.3, styles: ["Plage", "Bien-être", "Fête"],
      desc: "Longues plages de cocotiers, souvent en tout compris, et la presqu'île de Samaná.", lat: 18.58, lon: -68.4, aliases: ["republique dominicaine", "république dominicaine", "dominican republic", "samana", "samaná"],
      routes: [f("Air France", "CDG", 9.5, "legacy"), f("Air Europa", "ORY", 13, "legacy", "Madrid")] },
];

/* Monnaie par pays (pour le taux de change du jour) */
export const CURRENCY: Record<string, { currency: string; currencyName: string }> = {
    "Espagne": { currency: "EUR", currencyName: "euro" },
    "Italie": { currency: "EUR", currencyName: "euro" },
    "Portugal": { currency: "EUR", currencyName: "euro" },
    "Grèce": { currency: "EUR", currencyName: "euro" },
    "Croatie": { currency: "EUR", currencyName: "euro" },
    "Irlande": { currency: "EUR", currencyName: "euro" },
    "Pays-Bas": { currency: "EUR", currencyName: "euro" },
    "Allemagne": { currency: "EUR", currencyName: "euro" },
    "France": { currency: "EUR", currencyName: "euro" },
    "Maroc": { currency: "MAD", currencyName: "dirham marocain" },
    "Tunisie": { currency: "TND", currencyName: "dinar tunisien" },
    "Égypte": { currency: "EGP", currencyName: "livre égyptienne" },
    "Turquie": { currency: "TRY", currencyName: "livre turque" },
    "Thaïlande": { currency: "THB", currencyName: "baht" },
    "Vietnam": { currency: "VND", currencyName: "dong" },
    "Japon": { currency: "JPY", currencyName: "yen" },
    "États-Unis": { currency: "USD", currencyName: "dollar américain" },
    "Canada": { currency: "CAD", currencyName: "dollar canadien" },
    "Mexique": { currency: "MXN", currencyName: "peso mexicain" },
    "Brésil": { currency: "BRL", currencyName: "réal brésilien" },
    "Royaume-Uni": { currency: "GBP", currencyName: "livre sterling" },
    "Maurice": { currency: "MUR", currencyName: "roupie mauricienne" },
    "Sénégal": { currency: "XOF", currencyName: "franc CFA" },
    "République dominicaine": { currency: "DOP", currencyName: "peso dominicain" },
};
