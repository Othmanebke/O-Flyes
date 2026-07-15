import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const text = body.emailBody || "";

        let type = 'flight';
        if (text.toLowerCase().includes("hotel") || text.toLowerCase().includes("chambre")) {
            type = 'hotel';
        }

        return NextResponse.json({
            booking: {
                type: type,
                title: "Réservation importée via Email",
                provider: "Import IA",
                start_datetime: new Date(Date.now() + 86400000).toISOString(),
                end_datetime: new Date(Date.now() + 172800000).toISOString(),
                location: "Détectée de l'email",
                price: 150,
                currency: "EUR",
                confirmation_number: "IA-7382"
            }
        });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to process email' }, { status: 400 });
    }
}
