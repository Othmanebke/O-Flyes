import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    // Mock suggestions
    const suggestions = [
        { label: "Paris, France", city: "Paris", country: "France" },
        { label: "Dubai, EAU", city: "Dubai", country: "EAU" },
        { label: "New York, USA", city: "New York", country: "USA" },
        { label: "Tokyo, Japon", city: "Tokyo", country: "Japon" }
    ].filter(s => s.label.toLowerCase().includes(q.toLowerCase()));

    return NextResponse.json(suggestions);
}
