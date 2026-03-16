/** Map of city/airport name → IATA code (3-letter) */
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

/**
 * Returns the IATA code for a city, or a 3-letter abbreviation as fallback.
 */
export function getIATA(city: string): string {
    if (!city) return 'XXX';
    // Direct match
    if (IATA[city]) return IATA[city];
    // Case-insensitive
    const lower = city.toLowerCase();
    const found = Object.keys(IATA).find(k => k.toLowerCase() === lower);
    if (found) return IATA[found];
    // Partial match (city contains key or key contains city)
    const partial = Object.keys(IATA).find(k => lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower));
    if (partial) return IATA[partial];
    // Fallback: first 3 uppercase letters
    return city.substring(0, 3).toUpperCase().replace(/\s/g, 'X');
}

/** Format a date string YYYY-MM-DD → YYMMDD (Skyscanner format) */
export function toSkyscannerDate(dateStr: string): string {
    return dateStr.replace(/-/g, '').substring(2); // "2025-06-01" → "250601"
}

/** Build a Skyscanner deep link */
export function skyscannerFlightUrl(params: {
    origin: string;
    destination: string;
    depart: string;  // YYYY-MM-DD
    return?: string; // YYYY-MM-DD
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

/** Build a Booking.com hotel search deep link */
export function bookingHotelUrl(params: {
    city: string;
    checkin?: string;  // YYYY-MM-DD
    checkout?: string; // YYYY-MM-DD
    adults?: number;
    rooms?: number;
}): string {
    const base = 'https://www.booking.com/searchresults.fr.html';
    const p = new URLSearchParams({
        ss: params.city,
        lang: 'fr',
        ...(params.checkin ? { checkin: params.checkin } : {}),
        ...(params.checkout ? { checkout: params.checkout } : {}),
        group_adults: String(params.adults || 2),
        no_rooms: String(params.rooms || 1),
    });
    return `${base}?${p.toString()}`;
}

/** Build a GetYourGuide activity search deep link */
export function gygActivityUrl(city: string): string {
    return `https://www.getyourguide.fr/s/?q=${encodeURIComponent(city)}&et=2&currency=EUR`;
}

/** Build a Viator activity search deep link */
export function viatorActivityUrl(city: string): string {
    return `https://www.viator.com/fr-FR/search?text=${encodeURIComponent(city)}`;
}
