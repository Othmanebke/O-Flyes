// city → IATA code, utilisé pour construire les liens Skyscanner/Google Flights
export const IATA: Record<string, string> = {
    // France
    "Paris": "CDG",
    "Paris CDG": "CDG",
    "Paris Orly": "ORY",
    "Lyon": "LYS",
    "Marseille": "MRS",
    "Nice": "NCE",
    "Bordeaux": "BOD",
    "Toulouse": "TLS",
    "Strasbourg": "SXB",
    "Nantes": "NTE",
    // UK
    "Londres": "LHR",
    "London": "LHR",
    "Manchester": "MAN",
    "Édimbourg": "EDI",
    "Edinburgh": "EDI",
    // USA
    "New York": "JFK",
    "Los Angeles": "LAX",
    "Miami": "MIA",
    "Chicago": "ORD",
    "San Francisco": "SFO",
    "Las Vegas": "LAS",
    "Boston": "BOS",
    "Washington": "IAD",
    "Seattle": "SEA",
    "Orlando": "MCO",
    // Canada
    "Toronto": "YYZ",
    "Montréal": "YUL",
    "Montreal": "YUL",
    "Vancouver": "YVR",
    // Europe
    "Amsterdam": "AMS",
    "Barcelone": "BCN",
    "Barcelona": "BCN",
    "Madrid": "MAD",
    "Rome": "FCO",
    "Milano": "MXP",
    "Milan": "MXP",
    "Berlin": "BER",
    "Munich": "MUC",
    "Francfort": "FRA",
    "Frankfurt": "FRA",
    "Zurich": "ZRH",
    "Genève": "GVA",
    "Geneva": "GVA",
    "Vienne": "VIE",
    "Vienna": "VIE",
    "Prague": "PRG",
    "Budapest": "BUD",
    "Varsovie": "WAW",
    "Warsaw": "WAW",
    "Lisbonne": "LIS",
    "Lisbon": "LIS",
    "Athènes": "ATH",
    "Athens": "ATH",
    "Bruxelles": "BRU",
    "Brussels": "BRU",
    "Copenhague": "CPH",
    "Copenhagen": "CPH",
    "Stockholm": "ARN",
    "Oslo": "OSL",
    "Helsinki": "HEL",
    "Dublin": "DUB",
    "Istanbul": "IST",
    "Santorini": "JTR",
    // Middle East / Africa
    "Dubai": "DXB",
    "Abu Dhabi": "AUH",
    "Doha": "DOH",
    "Riyad": "RUH",
    "Riyadh": "RUH",
    "Beyrouth": "BEY",
    "Beirut": "BEY",
    "Tel Aviv": "TLV",
    "Le Caire": "CAI",
    "Cairo": "CAI",
    "Casablanca": "CMN",
    "Marrakech": "RAK",
    "Tunis": "TUN",
    "Alger": "ALG",
    "Nairobi": "NBO",
    "Cape Town": "CPT",
    "Johannesburg": "JNB",
    "Lagos": "LOS",
    "Dakar": "DSS",
    "Zanzibar": "ZNZ",
    // Asia
    "Tokyo": "NRT",
    "Osaka": "KIX",
    "Kyoto": "KIX",
    "Séoul": "ICN",
    "Seoul": "ICN",
    "Beijing": "PEK",
    "Pékin": "PEK",
    "Shanghai": "PVG",
    "Hong Kong": "HKG",
    "Singapour": "SIN",
    "Singapore": "SIN",
    "Bangkok": "BKK",
    "Phuket": "HKT",
    "Bali": "DPS",
    "Kuala Lumpur": "KUL",
    "Ho Chi Minh": "SGN",
    "Hanoi": "HAN",
    "Maldives": "MLE",
    "Mumbai": "BOM",
    "Delhi": "DEL",
    "New Delhi": "DEL",
    "Colombo": "CMB",
    "Katmandou": "KTM",
    "Kathmandu": "KTM",
    // Oceania
    "Sydney": "SYD",
    "Melbourne": "MEL",
    "Auckland": "AKL",
    // Latin America
    "Buenos Aires": "EZE",
    "São Paulo": "GRU",
    "Sao Paulo": "GRU",
    "Rio de Janeiro": "GIG",
    "Mexico": "MEX",
    "Cancun": "CUN",
    "Cancún": "CUN",
    "Bogota": "BOG",
    "Bogotá": "BOG",
    "Lima": "LIM",
    "Santiago": "SCL",
    // Caribbean
    "La Havane": "HAV",
    "Havana": "HAV",
    "Punta Cana": "PUJ",
    "Saint-Martin": "SXM",
    // Indian Ocean
    "La Réunion": "RUN",
    "Maurice": "MRU",
    "Mauritius": "MRU",
    "Seychelles": "SEZ",
};

export function getIATA(city: string): string {
    if (!city) return 'XXX';
    if (IATA[city]) return IATA[city];
    const lower = city.toLowerCase();
    const found = Object.keys(IATA).find(k => k.toLowerCase() === lower);
    if (found) return IATA[found];
    // gère les cas "Lyon, France" ou "Barcelone (Espagne)" renvoyés par l'autocomplete
    const partial = Object.keys(IATA).find(k => lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower));
    if (partial) return IATA[partial];
    return city.substring(0, 3).toUpperCase().replace(/\s/g, 'X');
}

// YYYY-MM-DD → YYMMDD (format attendu par Skyscanner dans l'URL)
export function toSkyscannerDate(dateStr: string): string {
    return dateStr.replace(/-/g, '').substring(2);
}

export function skyscannerFlightUrl(params: {
    origin: string;
    destination: string;
    depart: string;
    return?: string;
    adults?: number;
}): string {
    const orig = getIATA(params.origin);
    const dest = getIATA(params.destination);
    const dep = toSkyscannerDate(params.depart);
    const ret = params.return ? toSkyscannerDate(params.return) : '';
    const adults = params.adults || 1;
    const path = ret
        ? `${orig}/${dest}/${dep}/${ret}/`
        : `${orig}/${dest}/${dep}/`;
    return `https://www.skyscanner.fr/transport/vols/${path}?adults=${adults}&currency=EUR`;
}

export function bookingHotelUrl(params: {
    city: string;
    hotelName?: string;
    checkin?: string;  // YYYY-MM-DD
    checkout?: string; // YYYY-MM-DD
    adults?: number;
    rooms?: number;
}): string {
    const base = 'https://www.booking.com/searchresults.fr.html';
    const p = new URLSearchParams({
        ss: params.hotelName ? `${params.hotelName}, ${params.city}` : params.city,
        lang: 'fr',
        ...(params.checkin ? { checkin: params.checkin } : {}),
        ...(params.checkout ? { checkout: params.checkout } : {}),
        group_adults: String(params.adults || 2),
        no_rooms: String(params.rooms || 1),
    });
    return `${base}?${p.toString()}`;
}

export function googleFlightsUrl(params: {
    origin: string;
    destination: string;
    depart: string;
    return?: string;
    airline?: string;
}): string {
    const formatDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const parts = [`Vols de ${params.origin} à ${params.destination}`, `le ${formatDate(params.depart)}`];
    if (params.return) parts.push(`retour le ${formatDate(params.return)}`);
    if (params.airline) parts.push(`avec ${params.airline}`);
    return `https://www.google.com/travel/flights?q=${encodeURIComponent(parts.join(' '))}`;
}

export function gygActivityUrl(city: string): string {
    return `https://www.getyourguide.fr/s/?q=${encodeURIComponent(city)}&et=2&currency=EUR`;
}

export function viatorActivityUrl(city: string): string {
    return `https://www.viator.com/fr-FR/search?text=${encodeURIComponent(city)}`;
}
