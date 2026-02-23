export interface Flight {
    airline: string;
    type: string;
    duration: string;
    stops: string;
    price: number;
    logo: string;
}

export interface HotelOption {
    name: string;
    stars: number;
    rating: number;
    pricePerNight: number;
    badge: string;
    amenities: string[];
    img: string;
}

export interface Activity {
    name: string;
    description: string;
    price: string;
    duration: string;
    emoji: string;
    category: string;
}

export interface CarRental {
    category: string;
    model: string;
    pricePerDay: number;
    features: string[];
    emoji: string;
}

export interface Destination {
    id: string;
    name: string;
    country: string;
    continent: string;
    climate: string;
    style: string[];
    budgetTier: "petit" | "moyen" | "confort" | "luxe";
    tripBudget: { min: number; max: number };
    flightFrom: number;
    hotelPerNight: number;
    bestMonths: string[];
    duration: string;
    description: string;
    highlight: string;
    img: string;
    topDest?: boolean;
    continentRank?: string;
    rating: number;
    flights?: Flight[];
    hotels?: HotelOption[];
    activities?: Activity[];
    carRentals?: CarRental[];
}

// Helper to generate flights based on base price
function makeFlights(base: number, city: string): Flight[] {
    return [
        { airline: "Vueling / easyJet", type: "Low-cost", duration: base < 150 ? "2h30" : base < 500 ? "5h" : "11h", stops: "Direct", price: base, logo: "✈️" },
        { airline: "Air France", type: "Standard", duration: base < 150 ? "2h45" : base < 500 ? "5h30" : "12h", stops: "Direct", price: Math.round(base * 1.4), logo: "🛫" },
        { airline: "Turkish Airlines", type: "Confort+", duration: base < 150 ? "4h" : base < 500 ? "8h" : "14h", stops: "1 escale", price: Math.round(base * 1.8), logo: "🌟" },
    ];
}

function makeHotels(base: number, city: string): HotelOption[] {
    return [
        {
            name: `Auberge & Co ${city}`,
            stars: 2,
            rating: 7.8,
            pricePerNight: base,
            badge: "Économique",
            amenities: ["WiFi", "Petit-déjeuner inclus", "Climatisation"],
            img: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80",
        },
        {
            name: `Hotel Boutique ${city}`,
            stars: 4,
            rating: 8.7,
            pricePerNight: Math.round(base * 2.2),
            badge: "Coup de cœur",
            amenities: ["Piscine", "Spa", "Restaurant", "WiFi", "Salle de sport"],
            img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80",
        },
        {
            name: `Grand Luxury ${city}`,
            stars: 5,
            rating: 9.3,
            pricePerNight: Math.round(base * 4.5),
            badge: "Premium",
            amenities: ["Piscine à débordement", "Spa 5★", "Conciergerie 24h", "Vue panoramique", "Butler privé"],
            img: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&q=80",
        },
    ];
}

function makeCarRentals(base: number): CarRental[] {
    return [
        { category: "Citadine", model: "Toyota Yaris / Similaire", pricePerDay: Math.round(base * 0.6), features: ["A/C", "GPS", "Kilométrage illimité"], emoji: "🚗" },
        { category: "SUV", model: "Toyota RAV4 / Similaire", pricePerDay: Math.round(base * 1.1), features: ["A/C", "GPS", "4x4", "7 places"], emoji: "🚙" },
        { category: "Premium", model: "Mercedes Classe C / Similaire", pricePerDay: Math.round(base * 2), features: ["A/C", "GPS", "Cuir", "Conducteur optionnel"], emoji: "🏎️" },
    ];
}

const ACTIVITIES_BY_STYLE: Record<string, Activity[]> = {
    culture: [
        { name: "Visite guidée de la vieille ville", description: "Découvrez l'histoire et l'architecture locale avec un guide expert.", price: "15 – 35€/pers", duration: "3h", emoji: "🏛️", category: "Culture" },
        { name: "Musée national", description: "Collections permanentes et expositions temporaires incontournables.", price: "10 – 20€/pers", duration: "2–3h", emoji: "🎨", category: "Culture" },
        { name: "Cours de cuisine locale", description: "Apprenez à préparer les plats typiques du pays.", price: "40 – 80€/pers", duration: "4h", emoji: "👨‍🍳", category: "Gastronomie" },
    ],
    plage: [
        { name: "Snorkeling & plongée", description: "Explorez les fonds marins avec un moniteur certifié.", price: "30 – 90€/pers", duration: "3h", emoji: "🤿", category: "Eau" },
        { name: "Coucher de soleil en bateau", description: "Croisière panoramique au coucher du soleil avec cocktails.", price: "45 – 70€/pers", duration: "2h", emoji: "⛵", category: "Détente" },
        { name: "Kayak de mer", description: "Explorez les côtes et grottes marines en kayak.", price: "20 – 40€/pers", duration: "2–4h", emoji: "🚣", category: "Sport" },
    ],
    nature: [
        { name: "Randonnée guidée", description: "Treks de difficulté variable avec guide local. Paysages époustouflants.", price: "20 – 50€/pers", duration: "6h", emoji: "🥾", category: "Nature" },
        { name: "Safari / Observation faune", description: "Rencontrez la faune sauvage locale dans son habitat naturel.", price: "60 – 200€/pers", duration: "Journée", emoji: "🦁", category: "Nature" },
        { name: "Visite parc national", description: "Entrée + balade dans les plus beaux parcs du pays.", price: "10 – 30€/pers", duration: "Journée", emoji: "🌿", category: "Nature" },
    ],
    aventure: [
        { name: "Parachutisme / Saut à l'élastique", description: "Sensations fortes garanties avec moniteurs expérimentés.", price: "80 – 250€/pers", duration: "2h", emoji: "🪂", category: "Extrême" },
        { name: "Quad & 4x4 dans le désert/jungle", description: "Excursion tout-terrain dans les paysages les plus sauvages.", price: "50 – 120€/pers", duration: "4h", emoji: "🏍️", category: "Aventure" },
        { name: "Via ferrata / Escalade", description: "Parcours d'aventure en montagne adapté à votre niveau.", price: "35 – 80€/pers", duration: "4–6h", emoji: "🧗", category: "Sport" },
    ],
    gastronomie: [
        { name: "Tour gastronomique des marchés", description: "Dégustations dans les marchés locaux avec un guide foodie.", price: "25 – 55€/pers", duration: "3h", emoji: "🍜", category: "Food" },
        { name: "Dîner dans un restaurant étoilé", description: "Menu dégustation dans l'un des meilleurs restaurants du pays.", price: "80 – 200€/pers", duration: "3h", emoji: "⭐", category: "Gastronomie" },
        { name: "Atelier dégustpation de vins/spiritueux", description: "Découverte des saveurs locales avec un sommelier.", price: "30 – 70€/pers", duration: "2h", emoji: "🍷", category: "Gastronomie" },
    ],
    "bien-être": [
        { name: "Spa & massage traditionnel", description: "Soins du corps selon les traditions locales.", price: "30 – 120€/pers", duration: "2h", emoji: "💆", category: "Détente" },
        { name: "Retraite yoga au lever du soleil", description: "Séance de yoga face aux plus beaux panoramas du pays.", price: "15 – 40€/pers", duration: "1h30", emoji: "🧘", category: "Bien-être" },
        { name: "Bains thermaux / Hot springs", description: "Bains naturels aux propriétés relaxantes et thérapeutiques.", price: "10 – 50€/pers", duration: "2–4h", emoji: "♨️", category: "Bien-être" },
    ],
    luxe: [
        { name: "Hélicoptère panoramique", description: "Survol des sites iconiques en hélicoptère privé.", price: "200 – 800€/pers", duration: "1h", emoji: "🚁", category: "Luxe" },
        { name: "Dîner privé sur la plage", description: "Table dressée en bord de mer pour une soirée inoubliable.", price: "150 – 400€/couple", duration: "3h", emoji: "🕯️", category: "Luxe" },
        { name: "Yacht privatisé", description: "Location de yacht avec équipage pour une journée en mer.", price: "500 – 2000€/groupe", duration: "Journée", emoji: "⛴️", category: "Luxe" },
    ],
    histoire: [
        { name: "Visite archéologique", description: "Découverte des sites historiques avec archéologue-guide.", price: "20 – 50€/pers", duration: "4h", emoji: "🏺", category: "Histoire" },
        { name: "Musée d'histoire nationale", description: "Plongez dans l'histoire du pays à travers ses collections.", price: "8 – 15€/pers", duration: "2h", emoji: "📜", category: "Histoire" },
        { name: "Quartiers historiques en soirée", description: "Balade nocturne dans les ruelles historiques éclairées.", price: "15 – 30€/pers", duration: "2h", emoji: "🌙", category: "Culture" },
    ],
    faune: [
        { name: "Safari grande migration", description: "Observation de la grande migration des gnous et zèbres.", price: "150 – 400€/pers", duration: "Journée", emoji: "🦓", category: "Safari" },
        { name: "Big Five en jeep", description: "Pistage des 5 grands animaux africains avec un ranger expert.", price: "100 – 300€/pers", duration: "Journée", emoji: "🐘", category: "Safari" },
        { name: "Plongée avec requins baleine", description: "Nage avec les plus grands poissons du monde.", price: "80 – 200€/pers", duration: "4h", emoji: "🦈", category: "Océan" },
    ],
    shopping: [
        { name: "Marchés & souks locaux", description: "Shopping dans les marchés authentiques avec guide négociateur.", price: "Gratuit", duration: "2–4h", emoji: "🛍️", category: "Shopping" },
        { name: "Tour des boutiques de créateurs", description: "Découverte des créateurs locaux et ateliers artisanaux.", price: "Gratuit", duration: "3h", emoji: "👗", category: "Mode" },
        { name: "Mall premium & duty-free", description: "Shopping dans les centres commerciaux haut de gamme.", price: "Gratuit", duration: "2–3h", emoji: "🏬", category: "Shopping" },
    ],
    fête: [
        { name: "Cours de danse locale", description: "Tango, salsa ou danse traditionnelle avec un professeur certifié.", price: "20 – 50€/pers", duration: "2h", emoji: "💃", category: "Fête" },
        { name: "Bar crawl & vie nocturne", description: "Tour des meilleurs bars et clubs de la ville avec un guide.", price: "30 – 60€/pers", duration: "4–5h", emoji: "🍹", category: "Nuit" },
        { name: "Show culturel & spectacle", description: "Spectacle folklorique ou show local dans une salle renommée.", price: "25 – 80€/pers", duration: "2h", emoji: "🎭", category: "Culture" },
    ],
};

function getActivities(styles: string[]): Activity[] {
    const result: Activity[] = [];
    const seen = new Set<string>();
    for (const style of styles) {
        const acts = ACTIVITIES_BY_STYLE[style] || [];
        for (const a of acts) {
            if (!seen.has(a.name)) {
                seen.add(a.name);
                result.push(a);
            }
        }
    }
    return result.slice(0, 8);
}

const DESTINATIONS_RAW: Omit<Destination, "flights" | "hotels" | "activities" | "carRentals">[] = [
    { id: "t1", name: "Marrakech", country: "Maroc", continent: "Afrique", climate: "arid", style: ["culture", "gastronomie", "aventure"], budgetTier: "petit", tripBudget: { min: 650, max: 900 }, flightFrom: 80, hotelPerNight: 35, bestMonths: ["Mars", "Avr", "Oct", "Nov"], duration: "10 – 14 jours", rating: 4.7, description: "Cité impériale aux mille couleurs et épices. Vol depuis Paris à moins de 100€, riads abordables, souks envoûtants.", highlight: "Petits budgets bienvenus — riads pour 20€/nuit.", img: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=900&q=85", topDest: true, continentRank: "🌍 Afrique #1" },
    { id: "t2", name: "Lisbonne", country: "Portugal", continent: "Europe", climate: "temperate", style: ["culture", "gastronomie", "plage"], budgetTier: "moyen", tripBudget: { min: 1400, max: 1900 }, flightFrom: 60, hotelPerNight: 90, bestMonths: ["Avr", "Mai", "Juin", "Sept"], duration: "10 – 14 jours", rating: 4.8, description: "Capitale des azulejos, du vin et du fado. Vols à partir de 60€, pastéis de nata inclus.", highlight: "Meilleur rapport qualité-vie en Europe.", img: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=900&q=85", topDest: true, continentRank: "🌍 Europe #1" },
    { id: "t3", name: "Bali", country: "Indonésie", continent: "Asie", climate: "tropical", style: ["plage", "nature", "culture", "bien-être"], budgetTier: "moyen", tripBudget: { min: 1600, max: 2400 }, flightFrom: 400, hotelPerNight: 40, bestMonths: ["Avr", "Mai", "Juin", "Sept", "Oct"], duration: "14 – 21 jours", rating: 4.9, description: "Île des dieux entre rizières, temples et surf. Vols ~400€, villas avec piscine pour 40€/nuit.", highlight: "Villas avec piscine privée dès 40€/nuit.", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&q=85", topDest: true, continentRank: "🌏 Asie #1" },
    { id: "t4", name: "Medellín", country: "Colombie", continent: "Amérique", climate: "tropical", style: ["culture", "aventure", "nature"], budgetTier: "moyen", tripBudget: { min: 1700, max: 2300 }, flightFrom: 560, hotelPerNight: 35, bestMonths: ["Déc", "Jan", "Fév", "Juil", "Août"], duration: "14 – 21 jours", rating: 4.6, description: "La \"Ville éternelle du printemps\" à 1500m d'altitude. Ancienne ville devenue métropole culturelle et fleurie.", highlight: "Printemps éternel — il fait 22°C toute l'année.", img: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=900&q=85", topDest: true, continentRank: "🌎 Amérique #1" },
    { id: "t5", name: "Queenstown", country: "Nouvelle-Zélande", continent: "Océanie", climate: "temperate", style: ["aventure", "nature"], budgetTier: "confort", tripBudget: { min: 4200, max: 5500 }, flightFrom: 900, hotelPerNight: 120, bestMonths: ["Nov", "Déc", "Jan", "Fév"], duration: "14 – 21 jours", rating: 4.8, description: "Capitale mondiale de l'aventure. Bungy, saut en para, ski, fjords. La Terre du Milieu pour de vrai.", highlight: "Le pays du Seigneur des Anneaux pour de vrai.", img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=85", topDest: true, continentRank: "🌏 Océanie #1" },
    { id: "b1", name: "Budapest", country: "Hongrie", continent: "Europe", climate: "temperate", style: ["culture", "bien-être", "gastronomie"], budgetTier: "petit", tripBudget: { min: 800, max: 1200 }, flightFrom: 50, hotelPerNight: 45, bestMonths: ["Avr", "Mai", "Juin", "Sept"], duration: "7 – 10 jours", rating: 4.6, description: "La \"Paris de l'Est\" fascinante. Bains thermaux, ruines bar, architecture austro-hongroise.", highlight: "Bière à 1€, bains thermaux à 15€.", img: "https://images.unsplash.com/photo-1565426873118-a17ed65d74b9?w=700&q=80" },
    { id: "b2", name: "Tbilissi", country: "Géorgie", continent: "Europe", climate: "temperate", style: ["culture", "gastronomie", "aventure"], budgetTier: "petit", tripBudget: { min: 750, max: 1100 }, flightFrom: 120, hotelPerNight: 30, bestMonths: ["Avr", "Mai", "Sept", "Oct"], duration: "10 – 14 jours", rating: 4.5, description: "Ville aux mille façades sculptées, vins naturels et gorges sauvages.", highlight: "Le vin le moins cher et le meilleur du monde.", img: "https://images.unsplash.com/photo-1565008576549-57569a49a3f5?w=700&q=80" },
    { id: "b3", name: "Chiang Mai", country: "Thaïlande", continent: "Asie", climate: "tropical", style: ["culture", "nature", "bien-être"], budgetTier: "petit", tripBudget: { min: 950, max: 1400 }, flightFrom: 350, hotelPerNight: 20, bestMonths: ["Nov", "Déc", "Jan", "Fév"], duration: "14 – 21 jours", rating: 4.7, description: "Rose du Nord, temples dorés, jungle, massages à 5€. Paradis des nomades digitaux.", highlight: "Massages traditionels à 7€, temples gratuits.", img: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=700&q=80" },
    { id: "b4", name: "Hanoï", country: "Vietnam", continent: "Asie", climate: "tropical", style: ["culture", "gastronomie", "aventure"], budgetTier: "petit", tripBudget: { min: 900, max: 1300 }, flightFrom: 380, hotelPerNight: 18, bestMonths: ["Oct", "Nov", "Déc", "Mars", "Avr"], duration: "14 – 21 jours", rating: 4.5, description: "Vieux quartier, baie d'Halong, pho fumant à l'aube. Parmi les destinations les plus abordables.", highlight: "Repas complets pour 2€, hôtels propres à 15€.", img: "https://images.unsplash.com/photo-1552751753-0fc84ae5b6c8?w=700&q=80" },
    { id: "b5", name: "Cracovie", country: "Pologne", continent: "Europe", climate: "cold", style: ["culture", "histoire"], budgetTier: "petit", tripBudget: { min: 700, max: 1000 }, flightFrom: 50, hotelPerNight: 40, bestMonths: ["Avr", "Mai", "Juin", "Sept"], duration: "5 – 8 jours", rating: 4.4, description: "Perle médiévale, place du marché monumentale, château Wawel. Escapade week-end ultra-abordable.", highlight: "L'une des plus belles villes médiévales d'Europe.", img: "https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=700&q=80" },
    { id: "m1", name: "Athènes + Santorin", country: "Grèce", continent: "Europe", climate: "temperate", style: ["culture", "plage", "gastronomie"], budgetTier: "moyen", tripBudget: { min: 2000, max: 2800 }, flightFrom: 120, hotelPerNight: 90, bestMonths: ["Mai", "Juin", "Sept", "Oct"], duration: "14 jours", rating: 4.8, description: "Acropole mythique + couchers de soleil à Oia. Combo parfait entre histoire et plages bleues.", highlight: "Couchers de soleil classés \"meilleurs du monde\".", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=700&q=80" },
    { id: "m2", name: "Istanbul", country: "Turquie", continent: "Europe", climate: "temperate", style: ["culture", "gastronomie", "histoire"], budgetTier: "moyen", tripBudget: { min: 1300, max: 1900 }, flightFrom: 90, hotelPerNight: 65, bestMonths: ["Avr", "Mai", "Sept", "Oct"], duration: "10 – 14 jours", rating: 4.7, description: "Entre deux continents, mosquées, bazars, meze et Bosphore. Incroyable densité culturelle.", highlight: "2 continents, 1 seule ville.", img: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=700&q=80" },
    { id: "m3", name: "Phuket & Ko Phi Phi", country: "Thaïlande", continent: "Asie", climate: "tropical", style: ["plage", "bien-être", "aventure"], budgetTier: "moyen", tripBudget: { min: 1700, max: 2500 }, flightFrom: 350, hotelPerNight: 55, bestMonths: ["Nov", "Déc", "Jan", "Fév", "Mars"], duration: "14 – 21 jours", rating: 4.8, description: "Eaux turquoise, plages de rêve, kayak entre calcaires. La quintessence du paradis équatorial.", highlight: "Eaux turquoise à 28°C garantis.", img: "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=700&q=80" },
    { id: "m4", name: "Buenos Aires", country: "Argentine", continent: "Amérique", climate: "temperate", style: ["culture", "gastronomie", "fête"], budgetTier: "moyen", tripBudget: { min: 1900, max: 2700 }, flightFrom: 600, hotelPerNight: 50, bestMonths: ["Mars", "Avr", "Oct", "Nov"], duration: "14 – 21 jours", rating: 4.7, description: "Tango, boeuf argentin, architecture néo-classique. Buenos Aires défie les clichés.", highlight: "Le meilleur bifteck du monde.", img: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=700&q=80" },
    { id: "m5", name: "Nairobi & Safari Masai Mara", country: "Kenya", continent: "Afrique", climate: "tropical", style: ["nature", "aventure", "faune"], budgetTier: "moyen", tripBudget: { min: 2500, max: 3500 }, flightFrom: 380, hotelPerNight: 80, bestMonths: ["Juil", "Août", "Sept", "Jan", "Fév"], duration: "14 jours", rating: 4.9, description: "Big Five, migration des gnous, couchers de soleil sur la savane. Le safari africain accessible.", highlight: "La grande migration — un spectacle d'une vie.", img: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=700&q=80" },
    { id: "c1", name: "Kyoto & Tokyo", country: "Japon", continent: "Asie", climate: "temperate", style: ["culture", "gastronomie", "bien-être"], budgetTier: "confort", tripBudget: { min: 3200, max: 4500 }, flightFrom: 700, hotelPerNight: 100, bestMonths: ["Mars", "Avr", "Oct", "Nov"], duration: "14 – 21 jours", rating: 5.0, description: "Sakura, ramen, temples zen, néons de Shibuya. Le Japon est une expérience totale qui transcende tous les voyageurs.", highlight: "La cerise des sakura en mars-avril, un rêve éveillé.", img: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=700&q=80" },
    { id: "c2", name: "Islande", country: "Islande", continent: "Europe", climate: "cold", style: ["nature", "aventure", "bien-être"], budgetTier: "confort", tripBudget: { min: 3500, max: 4800 }, flightFrom: 120, hotelPerNight: 160, bestMonths: ["Déc", "Jan", "Fév", "Juil", "Août"], duration: "10 – 14 jours", rating: 4.9, description: "Aurores boréales, geysers, glaciers, cascades. Un paysage de fin du monde à 3h de Paris.", highlight: "Aurores boréales et bains chauds sous les étoiles.", img: "https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=700&q=80" },
    { id: "c3", name: "New York", country: "États-Unis", continent: "Amérique", climate: "temperate", style: ["culture", "gastronomie", "shopping"], budgetTier: "confort", tripBudget: { min: 3800, max: 5200 }, flightFrom: 350, hotelPerNight: 180, bestMonths: ["Sept", "Oct", "Avr", "Mai"], duration: "10 – 14 jours", rating: 4.8, description: "Manhattan, Times Square, muséums, Central Park. Éternellement iconique.", highlight: "La skyline de Manhattan à l'aube depuis Brooklyn Bridge.", img: "https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?w=700&q=80" },
    { id: "c4", name: "Sydney & Great Barrier Reef", country: "Australie", continent: "Océanie", climate: "temperate", style: ["plage", "nature", "aventure"], budgetTier: "confort", tripBudget: { min: 4000, max: 5500 }, flightFrom: 900, hotelPerNight: 130, bestMonths: ["Sept", "Oct", "Nov", "Avr"], duration: "21 jours", rating: 4.8, description: "Opera House, Bondi Beach, plongée sur la Grande Barrière. L'Australie justifie le long vol.", highlight: "Plonger dans la plus grande barrière de corail du monde.", img: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=700&q=80" },
    { id: "l1", name: "Maldives", country: "Maldives", continent: "Asie", climate: "tropical", style: ["plage", "luxe", "bien-être"], budgetTier: "luxe", tripBudget: { min: 6000, max: 12000 }, flightFrom: 700, hotelPerNight: 350, bestMonths: ["Nov", "Déc", "Jan", "Fév", "Mars", "Avr"], duration: "10 – 14 jours", rating: 5.0, description: "Bungalows sur pilotis, lagon turquoise, plongée avec raies mantas. La quintessence du luxe tropical.", highlight: "Dormir au-dessus du lagon cristallin.", img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=700&q=80" },
    { id: "l2", name: "Polynésie Française", country: "France", continent: "Océanie", climate: "tropical", style: ["plage", "luxe", "bien-être"], budgetTier: "luxe", tripBudget: { min: 7000, max: 14000 }, flightFrom: 1000, hotelPerNight: 400, bestMonths: ["Mai", "Juin", "Juil", "Août", "Sept"], duration: "14 – 21 jours", rating: 5.0, description: "Bora Bora, Moorea — lagons d'outremer, requins baleines, fare polynésiens. Le paradis absolu.", highlight: "Les eaux les plus bleues de la planète.", img: "https://images.unsplash.com/photo-1589802829985-817e51171b92?w=700&q=80" },
    { id: "l3", name: "Dubaï", country: "Émirats Arabes", continent: "Asie", climate: "arid", style: ["luxe", "shopping", "gastronomie"], budgetTier: "luxe", tripBudget: { min: 4500, max: 8000 }, flightFrom: 200, hotelPerNight: 250, bestMonths: ["Oct", "Nov", "Déc", "Jan", "Fév", "Mars"], duration: "7 – 10 jours", rating: 4.6, description: "Burj Khalifa, désert en 4x4, dîner 200 étages. L'excès dans toute sa splendeur ultra-moderne.", highlight: "Vue depuis le Burj Khalifa au coucher de soleil.", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=80" },
];

export const DESTINATIONS: Destination[] = DESTINATIONS_RAW.map(d => ({
    ...d,
    flights: makeFlights(d.flightFrom, d.name),
    hotels: makeHotels(d.hotelPerNight, d.name),
    activities: getActivities(d.style),
    carRentals: makeCarRentals(Math.max(20, Math.round(d.hotelPerNight * 0.7))),
}));

export const BUDGET_BADGE: Record<string, string> = {
    petit: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    moyen: "bg-sky-50 text-sky-800 border border-sky-200",
    confort: "bg-violet-50 text-violet-800 border border-violet-200",
    luxe: "bg-amber-50 text-amber-800 border border-amber-200",
};

export const BUDGET_TIERS = [
    { id: "tous", label: "Tous", color: "bg-dark-900 text-white", emoji: "" },
    { id: "petit", label: "Essentiel", color: "bg-emerald-700 text-white", emoji: "✦", range: "< 1 500€" },
    { id: "moyen", label: "Confort", color: "bg-sky-700 text-white", emoji: "✦✦", range: "1 500 — 3 500€" },
    { id: "confort", label: "Premium", color: "bg-violet-700 text-white", emoji: "✦✦✦", range: "3 500 — 6 000€" },
    { id: "luxe", label: "Prestige", color: "bg-gold-500 text-dark-900", emoji: "✦✦✦✦", range: "6 000€+" },
];

export const ALL_MONTHS = ["Jan", "Fév", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
