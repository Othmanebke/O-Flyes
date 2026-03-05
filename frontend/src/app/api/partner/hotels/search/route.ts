import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'Paris';

    // Generate deterministic mock hotels
    const mockHotels = Array.from({ length: 6 }).map((_, i) => ({
        id: crypto.randomUUID(),
        name: `Hôtel de Luxe ${city} ${i + 1}`,
        city: city,
        country: "France", // Simplification
        price_per_night: 200 + (Math.floor(Math.random() * 800)),
        currency: "EUR",
        rating: (4 + Math.random()).toFixed(1),
        stars: 4 + Math.round(Math.random()),
        category: "Luxe",
        image_url: `https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80&sig=${Math.random()}`,
        description: `Un séjour inoubliable au cœur de ${city}. Profitez des meilleures installations.`,
        booking_url: "https://booking.com"
    }));

    return NextResponse.json(mockHotels);
}
