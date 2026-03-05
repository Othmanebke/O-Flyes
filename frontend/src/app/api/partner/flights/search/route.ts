import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin') || 'Paris';
    const destination = searchParams.get('destination') || 'New York';

    // Check if empty
    if (!origin || !destination) {
        return NextResponse.json([]);
    }

    // Generate mock flights
    const mockFlights = Array.from({ length: 4 }).map((_, i) => ({
        id: crypto.randomUUID(),
        airline: ["Air France", "Emirates", "Delta", "Qatar Airways"][Math.floor(Math.random() * 4)],
        origin: origin,
        originCode: origin.substring(0, 3).toUpperCase(),
        destination: destination,
        destinationCode: destination.substring(0, 3).toUpperCase(),
        departure: new Date(Date.now() + i * 3600000).toISOString(),
        arrival: new Date(Date.now() + (i + 6) * 3600000).toISOString(),
        duration: "06:00",
        price: 300 + (Math.floor(Math.random() * 1200)),
        currency: "EUR",
        type: "Direct",
        class: i % 2 === 0 ? "Economy" : "Business",
        booking_url: "https://skyscanner.com"
    }));

    return NextResponse.json(mockFlights);
}
