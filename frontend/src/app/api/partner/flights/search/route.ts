import { NextResponse } from 'next/server';
import { getIATA, googleFlightsUrl } from '@/lib/iata';

const AIRLINES = [
    { name: "Air France", logo: "AF", hub: "CDG" },
    { name: "Emirates", logo: "EK", hub: "DXB" },
    { name: "Qatar Airways", logo: "QR", hub: "DOH" },
    { name: "Lufthansa", logo: "LH", hub: "FRA" },
    { name: "British Airways", logo: "BA", hub: "LHR" },
    { name: "Turkish Airlines", logo: "TK", hub: "IST" },
    { name: "Singapore Airlines", logo: "SQ", hub: "SIN" },
    { name: "KLM", logo: "KL", hub: "AMS" },
    { name: "Swiss International", logo: "LX", hub: "ZRH" },
    { name: "Iberia", logo: "IB", hub: "MAD" },
];

// buckets approximatifs au départ de Paris, utilisés en fallback si Amadeus ne répond pas
const ROUTE_PRICES: Record<string, { base: number; range: number; duration: string }> = {
    // Europe (short-haul)
    "LHR": { base: 80,  range: 120, duration: "01:20" },
    "AMS": { base: 60,  range: 100, duration: "01:10" },
    "BCN": { base: 70,  range: 130, duration: "01:50" },
    "MAD": { base: 80,  range: 140, duration: "02:00" },
    "FCO": { base: 90,  range: 150, duration: "02:10" },
    "MXP": { base: 70,  range: 110, duration: "01:45" },
    "BER": { base: 80,  range: 120, duration: "01:45" },
    "FRA": { base: 60,  range: 100, duration: "01:10" },
    "ZRH": { base: 80,  range: 120, duration: "01:20" },
    "GVA": { base: 60,  range: 100, duration: "01:10" },
    "VIE": { base: 100, range: 150, duration: "02:05" },
    "PRG": { base: 90,  range: 140, duration: "01:55" },
    "BUD": { base: 100, range: 150, duration: "02:10" },
    "LIS": { base: 90,  range: 150, duration: "02:20" },
    "ATH": { base: 100, range: 180, duration: "03:20" },
    "IST": { base: 110, range: 200, duration: "03:30" },
    // North Africa / Middle East (medium-haul)
    "RAK": { base: 80,  range: 120, duration: "03:10" },
    "CMN": { base: 70,  range: 110, duration: "03:00" },
    "TUN": { base: 80,  range: 120, duration: "02:30" },
    "CAI": { base: 140, range: 200, duration: "04:30" },
    "DXB": { base: 200, range: 400, duration: "06:40" },
    "AUH": { base: 200, range: 380, duration: "06:50" },
    "DOH": { base: 190, range: 350, duration: "06:00" },
    "TLV": { base: 130, range: 200, duration: "04:15" },
    // Africa
    "NBO": { base: 400, range: 400, duration: "08:30" },
    "CPT": { base: 500, range: 500, duration: "11:00" },
    "ZNZ": { base: 500, range: 500, duration: "10:30" },
    // Asia
    "BKK": { base: 350, range: 500, duration: "10:30" },
    "DPS": { base: 500, range: 600, duration: "14:00" },
    "SIN": { base: 400, range: 600, duration: "12:30" },
    "NRT": { base: 500, range: 700, duration: "12:00" },
    "KIX": { base: 500, range: 700, duration: "12:10" },
    "ICN": { base: 500, range: 700, duration: "11:30" },
    "HKG": { base: 450, range: 600, duration: "11:30" },
    "KUL": { base: 400, range: 600, duration: "12:45" },
    "HKT": { base: 400, range: 550, duration: "11:30" },
    "MLE": { base: 600, range: 600, duration: "10:00" },
    "DEL": { base: 350, range: 500, duration: "08:40" },
    "BOM": { base: 350, range: 500, duration: "08:45" },
    "SGN": { base: 450, range: 600, duration: "11:45" },
    // Americas
    "JFK": { base: 300, range: 700, duration: "08:00" },
    "LAX": { base: 400, range: 800, duration: "11:00" },
    "MIA": { base: 350, range: 700, duration: "09:30" },
    "ORD": { base: 350, range: 700, duration: "09:00" },
    "SFO": { base: 420, range: 800, duration: "11:20" },
    "YYZ": { base: 300, range: 600, duration: "08:10" },
    "GRU": { base: 600, range: 600, duration: "11:30" },
    "EZE": { base: 650, range: 600, duration: "14:00" },
    "MEX": { base: 500, range: 600, duration: "11:30" },
    "CUN": { base: 480, range: 600, duration: "10:40" },
    // Oceania
    "SYD": { base: 900, range: 800, duration: "22:00" },
    "MEL": { base: 900, range: 800, duration: "22:30" },
};

function pickAirlines(count: number, seed: number) {
    const arr = [...AIRLINES];
    // pseudo-shuffle based on seed
    for (let i = arr.length - 1; i > 0; i--) {
        const j = (seed * (i + 1) * 7) % (i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, count);
}

function addHours(date: Date, h: number) {
    return new Date(date.getTime() + h * 3600000);
}

function parseDuration(dur: string): number {
    const [h, m] = dur.split(':').map(Number);
    return h + m / 60;
}

let amadeusToken: string | null = null;
let amadeusTokenExpiry = 0;

async function getAmadeusToken(): Promise<string | null> {
    const clientId = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;

    if (amadeusToken && Date.now() < amadeusTokenExpiry) return amadeusToken;

    try {
        const res = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret,
            }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        amadeusToken = data.access_token;
        amadeusTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
        return amadeusToken;
    } catch {
        return null;
    }
}

async function fetchAmadeusFlights(originCode: string, destCode: string, departDate: string, adults: number, originCity: string, destCity: string, returnDate: string) {
    const token = await getAmadeusToken();
    if (!token) return null;

    try {
        const params = new URLSearchParams({
            originLocationCode: originCode,
            destinationLocationCode: destCode,
            departureDate: departDate,
            returnDate: returnDate,
            adults: String(adults),
            max: '5',
            currencyCode: 'EUR',
        });

        const res = await fetch(
            `https://test.api.amadeus.com/v2/shopping/flight-offers?${params}`,
            { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(6000) }
        );
        if (!res.ok) return null;
        const data = await res.json();

        return (data.data || []).map((offer: any) => {
            const outbound = offer.itineraries[0];
            const inbound = offer.itineraries[1];
            const seg = outbound.segments[0];
            const lastSeg = outbound.segments[outbound.segments.length - 1];
            // price.total = aller-retour complet, pas le prix par personne
            const price = parseFloat(offer.price.total);
            const fareDetails = offer.travelerPricings[0].fareDetailsBySegment[0];
            const includedBags = fareDetails.includedCheckedBags?.quantity || 0;
            const baggageStatus = includedBags > 0 ? "Bagage cabine + soute" : "Sans bagage (cabine uniquement)";

            const inSeg = inbound?.segments[0];
            const inLastSeg = inbound?.segments[inbound.segments.length - 1];

            return {
                id: offer.id,
                airline: seg.carrierCode,
                origin: seg.departure.iataCode,
                originCode: seg.departure.iataCode,
                destination: lastSeg.arrival.iataCode,
                destinationCode: lastSeg.arrival.iataCode,
                departure: seg.departure.at,
                arrival: lastSeg.arrival.at,
                duration: outbound.duration.replace('PT', '').replace('H', 'h').replace('M', 'm').toLowerCase(),
                returnDeparture: inSeg?.departure.at ?? null,
                returnArrival: inLastSeg?.arrival.at ?? null,
                returnDuration: inbound ? inbound.duration.replace('PT', '').replace('H', 'h').replace('M', 'm').toLowerCase() : null,
                price: Math.round(price),
                currency: 'EUR',
                type: outbound.segments.length === 1 ? 'Direct' : 'Escale',
                class: fareDetails.cabin === 'BUSINESS' ? 'Business' : 'Economy',
                baggage: baggageStatus,
                booking_url: googleFlightsUrl({ origin: originCity, destination: destCity, depart: departDate, return: returnDate, airline: seg.carrierCode }),
            };
        });
    } catch {
        return null;
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin') || 'Paris';
    const destination = searchParams.get('destination') || 'New York';
    const depart = searchParams.get('depart') || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    // on impose toujours un retour, pas de one-way sur le site
    const returnDate = searchParams.get('return') || new Date(new Date(depart + 'T00:00:00').getTime() + 7 * 86400000).toISOString().split('T')[0];
    const adults = parseInt(searchParams.get('adults') || '1', 10);

    const originCode = getIATA(origin);
    const destCode = getIATA(destination);

    const amadeusFlights = await fetchAmadeusFlights(originCode, destCode, depart, adults, origin, destination, returnDate);
    if (amadeusFlights && amadeusFlights.length > 0) {
        return NextResponse.json(amadeusFlights);
    }

    // fallback statique si Amadeus est KO ou quota atteint
    const routeInfo = ROUTE_PRICES[destCode] || { base: 200, range: 400, duration: "05:00" };
    const durationH = parseDuration(routeInfo.duration);

    // Use destCode as seed for deterministic pseudo-random
    const seed = destCode.charCodeAt(0) + destCode.charCodeAt(1) * 3 + (destCode.charCodeAt(2) || 0) * 7;
    const airlines = pickAirlines(4, seed);

    const departDate = new Date(depart + 'T08:00:00');
    const returnDeptDate = new Date(returnDate + 'T08:00:00');

    const flights = airlines.map((airline, i) => {
        // Spread departures through the day
        const depOffset = [0, 2.5, 5.5, 9][i];
        const dep = addHours(departDate, depOffset);
        const arr = addHours(dep, durationH + (i % 2 === 1 ? 1.5 : 0)); // escale sur vol impair

        // Vol retour : décalage symétrique sur la journée de retour, même compagnie/itinéraire
        const retDep = addHours(returnDeptDate, depOffset + 1);
        const retArr = addHours(retDep, durationH + (i % 2 === 1 ? 1.5 : 0));

        // Price variation: cheapest early morning, more expensive midday — prix = total ALLER-RETOUR
        const priceMultiplier = [0.85, 1.0, 1.2, 0.95][i];
        const basePrice = routeInfo.base + Math.floor((seed * (i + 1) * 13) % routeInfo.range);
        const price = Math.round(basePrice * priceMultiplier * adults * 2);

        const isStop = durationH > 8 && i % 2 === 1;

        return {
            id: `${originCode}-${destCode}-${i}`,
            airline: airline.name,
            airlineCode: airline.logo,
            origin,
            originCode,
            destination,
            destinationCode: destCode,
            departure: dep.toISOString(),
            arrival: arr.toISOString(),
            duration: routeInfo.duration,
            returnDeparture: retDep.toISOString(),
            returnArrival: retArr.toISOString(),
            returnDuration: routeInfo.duration,
            price,
            currency: "EUR",
            type: isStop ? "1 escale" : "Direct",
            class: i === 3 ? "Business" : "Economy",
            baggage: "Sans bagage (cabine uniquement)",
            booking_url: googleFlightsUrl({ origin, destination, depart, return: returnDate, airline: airline.name }),
            google_flights_url: googleFlightsUrl({ origin, destination, depart, return: returnDate, airline: airline.name }),
        };
    });

    // Sort by price
    flights.sort((a, b) => a.price - b.price);

    return NextResponse.json(flights);
}
