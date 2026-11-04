import { NextResponse } from 'next/server';
import { limitPublic } from '@/lib/api/rateLimit';
import { bookingHotelUrl } from '@/lib/iata';
import { costFactor, findDestination } from '@/lib/catalog';
import { GENERIC, LODGING } from '@/lib/travel/lodging';

// Pas d'API gratuite de disponibilités hôtelières : on propose les types d'hébergement
// typiques de la destination (riad, ryokan, lodge…) avec un prix par nuit estimé.
// Le lien Booking cherche ce type d'hébergement dans la ville, aux dates du voyage.
export async function GET(request: Request) {
    const limited = limitPublic(request, 'partner-hotels-search');
    if (limited) return limited;
    const { searchParams } = new URL(request.url);
    const city = (searchParams.get('city') || 'Paris').trim();
    const checkin = searchParams.get('checkin') || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const checkout = searchParams.get('checkout') || new Date(Date.now() + 37 * 86400000).toISOString().split('T')[0];
    const adults = parseInt(searchParams.get('adults') || '2', 10);

    const cat = findDestination(city);
    const types = (cat && LODGING[cat.id]) || GENERIC;
    // prix « dès » par nuit : catalogue, sinon 90 € ajustés au coût de la vie
    const base = cat ? cat.hotelFrom : Math.round(90 * costFactor(city));
    const seed = [...city].reduce((a, c) => a + c.charCodeAt(0), 0);

    const hotels = types.map((t, i) => ({
        id: `lodging-${cat?.id || city}-${i}`,
        name: t.label,
        city,
        price_per_night: Math.round(base * t.factor * (1 + ((seed * (i + 2)) % 12) / 100)),
        currency: 'EUR',
        stars: t.stars,
        category: t.area,
        amenities: t.amenities,
        photo: t.photo,
        booking_url: bookingHotelUrl({ city, hotelName: t.query, checkin, checkout, adults }),
        source: 'estimate',
    }));

    return NextResponse.json(hotels);
}
