import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'Paris';

    const mockActivities = Array.from({ length: 6 }).map((_, i) => ({
        id: crypto.randomUUID(),
        title: `Activité Exclusive à ${city} ${i + 1}`,
        city: city,
        country: "Local",
        price: 50 + (Math.floor(Math.random() * 200)),
        currency: "EUR",
        rating: (4.2 + Math.random() * 0.8).toFixed(1),
        reviews: Math.floor(Math.random() * 300),
        image_url: `https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80&sig=${Math.random()}`,
        description: `Découvrez les merveilles cachées de ${city} avec notre guide privé.`,
        booking_url: "https://getyourguide.com",
        category: "Expérience"
    }));

    return NextResponse.json(mockActivities);
}
