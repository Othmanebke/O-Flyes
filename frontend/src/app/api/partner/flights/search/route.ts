import { NextResponse } from 'next/server';
import { googleFlightsUrl } from '@/lib/iata';
import { findDestination } from '@/lib/catalog';
import { airportCode, fareFactor, distanceKm, routeOptions, unknownRoute } from '@/lib/travel/airlines';
import { cityCoordinates } from '@/lib/travel/wikipedia';


// tarifs habituels au départ de Paris, base de l'estimation
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


function addHours(date: Date, h: number) {
    return new Date(date.getTime() + h * 3600000);
}

// Heure "murale" sans fuseau (AAAA-MM-JJTHH:MM:00) : le navigateur
// l'affiche telle quelle au lieu de la décaler selon son fuseau.
function wallClock(d: Date) {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:00`;
}

function formatHours(h: number) {
    const total = Math.round(h * 60);
    return `${Math.floor(total / 60)}h${String(total % 60).padStart(2, '0')}`;
}


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin') || 'Paris';
    const destination = searchParams.get('destination') || 'New York';
    const depart = searchParams.get('depart') || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    // trip=oneway : aller simple (ou vol retour cherché séparément) ; sinon aller-retour
    const oneWay = searchParams.get('trip') === 'oneway';
    const returnDate = oneWay ? null : (searchParams.get('return') || new Date(new Date(depart + 'T00:00:00').getTime() + 7 * 86400000).toISOString().split('T')[0]);
    const adults = parseInt(searchParams.get('adults') || '1', 10);
    const children = Math.max(0, parseInt(searchParams.get('children') || '0', 10) || 0);
    const infants = Math.max(0, parseInt(searchParams.get('infants') || '0', 10) || 0);
    // équivalent « places adultes » : enfant ≈ 75 % du tarif, bébé sur les genoux ≈ 10 %
    const seats = adults + children * 0.75 + infants * 0.1;

    // Compagnies réelles de la ligne quand on la connaît (voir lib/travel/airlines.ts).
    // Plus d'API gratuite de prix en direct (offre gratuite Amadeus fermée en juillet 2026) :
    // horaires et prix sont des estimations, le tarif du jour est sur Google Flights.
    const route = routeOptions(origin, destination);
    const { reverse, known } = route;
    let { options } = route;
    const fromCode = airportCode(origin);
    const toCode = airportCode(destination);
    const farCode = reverse ? fromCode : toCode; // l'aéroport qui n'est pas à Paris
    const cat = findDestination(reverse ? origin : destination);
    const routeInfo = farCode ? ROUTE_PRICES[farCode] : undefined;
    // tarif « dès » d'un aller simple par personne
    let base = cat ? cat.flightFrom : routeInfo ? routeInfo.base + routeInfo.range / 2 : 300;
    if (!known) {
        // Ligne inconnue : durée et prix d'après la distance réelle entre les deux villes
        const [a, b] = await Promise.all([cityCoordinates(origin), cityCoordinates(destination)]);
        const u = unknownRoute(a && b ? distanceKm(a, b) : 1500);
        options = u.options;
        base = u.baseFare;
    }

    const key = farCode || destination;
    const seed = [...key].reduce((a, c) => a + c.charCodeAt(0), 0);
    const departDate = new Date(depart + 'T07:00:00Z');
    const returnDeptDate = returnDate ? new Date(returnDate + 'T07:00:00Z') : null;
    const offsets = [0, 2.5, 5.5, 9, 11.5];

    const flights = options.map((opt, i) => {
        const hours = opt.hours;
        const far = opt.dest || farCode;
        const from = known ? (reverse ? (far || origin) : opt.paris) : (fromCode || origin);
        const to = known ? (reverse ? opt.paris : (far || destination)) : (toCode || destination);
        const dep = addHours(departDate, offsets[i % offsets.length]);
        const arr = addHours(dep, hours);
        const retDep = returnDeptDate ? addHours(returnDeptDate, offsets[i % offsets.length] + 1) : null;
        const retArr = retDep ? addHours(retDep, hours) : null;

        // prix = total pour tous les voyageurs (un trajet, ou les deux en aller-retour)
        const perPerson = base * fareFactor(opt.kind, hours) * (1 + ((seed * (i + 3)) % 14) / 100);
        const price = Math.round(perPerson * seats * (oneWay ? 1 : 2));
        const stopsLabel = opt.stops === 0 ? 'Direct' : `${opt.stops} escale${opt.stops > 1 ? 's' : ''} · ${opt.via}`;
        const link = googleFlightsUrl({ origin, destination, depart, return: returnDate || undefined, airline: opt.airline });

        return {
            id: `${from}-${to}-${opt.airline.replace(/\W+/g, '')}-${oneWay ? 'ow' : 'rt'}`,
            airline: opt.airline,
            origin,
            originCode: from,
            destination,
            destinationCode: to,
            departure: wallClock(dep),
            arrival: wallClock(arr),
            duration: formatHours(hours),
            returnDeparture: retDep ? wallClock(retDep) : null,
            returnArrival: retArr ? wallClock(retArr) : null,
            returnDuration: retDep ? formatHours(hours) : null,
            price,
            currency: "EUR",
            type: stopsLabel,
            class: "Economy",
            baggage: opt.kind === 'low' ? 'Bagage cabine, soute en option' : 'Bagages selon le tarif',
            booking_url: link,
            google_flights_url: link,
            source: 'estimate',
            // true = compagnies qui desservent habituellement cette ligne ; false = correspondances indicatives
            knownRoute: known,
        };
    });

    flights.sort((a, b) => a.price - b.price);
    return NextResponse.json(flights);
}
