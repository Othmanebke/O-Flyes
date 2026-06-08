// ── Shared Amadeus client (test environment) ───────────────────────────────
// Returns null whenever real data isn't available (no keys, API error, no results)
// so callers can fall back gracefully instead of presenting invented numbers as real.

let amadeusToken: string | null = null;
let amadeusTokenExpiry = 0;

export async function getAmadeusToken(): Promise<string | null> {
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
            signal: AbortSignal.timeout(6000),
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

export interface RealFlightOffer {
    id: string;
    airline: string;
    origin: string;
    destination: string;
    departure: string;
    arrival: string;
    duration: string;
    // Présents uniquement quand une date de retour est fournie (vol aller-retour)
    returnDeparture?: string;
    returnArrival?: string;
    returnDuration?: string;
    // `price` est le total aller-retour quand `returnDate` est fourni, sinon le prix aller simple
    price: number;
    currency: string;
    stops: number;
    cabin: string;
}

export async function searchFlights(
    originCode: string,
    destCode: string,
    departDate: string,
    adults: number = 1,
    returnDate?: string
): Promise<RealFlightOffer[] | null> {
    const token = await getAmadeusToken();
    if (!token) return null;

    try {
        const params = new URLSearchParams({
            originLocationCode: originCode,
            destinationLocationCode: destCode,
            departureDate: departDate,
            adults: String(adults),
            max: '5',
            currencyCode: 'EUR',
        });
        if (returnDate) {
            params.append('returnDate', returnDate);
        }
        const res = await fetch(
            `https://test.api.amadeus.com/v2/shopping/flight-offers?${params}`,
            { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(7000) }
        );
        if (!res.ok) return null;
        const data = await res.json();
        const offers = data.data || [];
        if (offers.length === 0) return null;

        return offers.map((offer: any) => {
            const outbound = offer.itineraries[0];
            const seg = outbound.segments[0];
            const lastSeg = outbound.segments[outbound.segments.length - 1];
            const inbound = offer.itineraries[1];

            const result: RealFlightOffer = {
                id: offer.id,
                airline: seg.carrierCode,
                origin: seg.departure.iataCode,
                destination: lastSeg.arrival.iataCode,
                departure: seg.departure.at,
                arrival: lastSeg.arrival.at,
                duration: outbound.duration.replace('PT', '').replace('H', 'h').replace('M', 'm').toLowerCase(),
                price: Math.round(parseFloat(offer.price.total)),
                currency: offer.price.currency || 'EUR',
                stops: outbound.segments.length - 1,
                cabin: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin === 'BUSINESS' ? 'Business' : 'Economy',
            };

            if (inbound) {
                const inSeg = inbound.segments[0];
                const inLastSeg = inbound.segments[inbound.segments.length - 1];
                result.returnDeparture = inSeg.departure.at;
                result.returnArrival = inLastSeg.arrival.at;
                result.returnDuration = inbound.duration.replace('PT', '').replace('H', 'h').replace('M', 'm').toLowerCase();
            }

            return result;
        });
    } catch {
        return null;
    }
}

export interface RealHotelOffer {
    id: string;
    name: string;
    pricePerNight: number;
    currency: string;
    rating: number | null;
    address: string;
}

export async function searchHotelOffers(
    city: string,
    checkin: string,
    checkout: string,
    adults: number = 2
): Promise<RealHotelOffer[] | null> {
    const token = await getAmadeusToken();
    if (!token) return null;

    try {
        const cityRes = await fetch(
            `https://test.api.amadeus.com/v1/reference-data/locations?keyword=${encodeURIComponent(city)}&subType=CITY&max=1`,
            { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(5000) }
        );
        if (!cityRes.ok) return null;
        const cityData = await cityRes.json();
        const cityCode = cityData.data?.[0]?.iataCode;
        if (!cityCode) return null;

        const hotelsRes = await fetch(
            `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}`,
            { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(5000) }
        );
        if (!hotelsRes.ok) return null;
        const hotelsData = await hotelsRes.json();
        const hotelIds = (hotelsData.data || []).slice(0, 8).map((h: any) => h.hotelId).join(',');
        if (!hotelIds) return null;

        const offersRes = await fetch(
            `https://test.api.amadeus.com/v3/shopping/hotel-offers?hotelIds=${hotelIds}&adults=${adults}&checkInDate=${checkin}&checkOutDate=${checkout}&currencyCode=EUR`,
            { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(9000) }
        );
        if (!offersRes.ok) return null;
        const offersData = await offersRes.json();
        const items = offersData.data || [];
        if (items.length === 0) return null;

        return items.map((item: any) => {
            const hotel = item.hotel;
            const offer = item.offers?.[0];
            const total = parseFloat(offer?.price?.total || '0');
            const nights = Math.max(1, Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000));
            return {
                id: hotel.hotelId,
                name: hotel.name,
                pricePerNight: Math.round(total / nights),
                currency: offer?.price?.currency || 'EUR',
                rating: hotel.rating ? parseFloat(hotel.rating) : null,
                address: [hotel.address?.lines?.[0], hotel.address?.cityName].filter(Boolean).join(', '),
            };
        });
    } catch {
        return null;
    }
}
