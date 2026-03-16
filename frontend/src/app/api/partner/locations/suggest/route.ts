import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();

    if (q.length < 2) return NextResponse.json([]);

    try {
        // Photon API — OpenStreetMap geocoding, free, no API key required
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lang=fr`;
        const res = await fetch(url, {
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(4000),
        });

        if (!res.ok) throw new Error('Photon unavailable');

        const data = await res.json();

        // Filter to cities/countries and deduplicate
        const seen = new Set<string>();
        const suggestions = (data.features || [])
            .filter((f: any) => {
                const type = f.properties?.type;
                // Keep cities, towns, villages, countries, airports
                return ['city', 'town', 'village', 'county', 'state', 'country', 'district'].includes(type);
            })
            .map((f: any) => {
                const props = f.properties;
                const city = props.city || props.name || '';
                const country = props.country || '';
                const label = city && country ? `${city}, ${country}` : props.name || '';
                return { label, city: city || props.name, country };
            })
            .filter((s: any) => {
                if (!s.label || seen.has(s.label)) return false;
                seen.add(s.label);
                return true;
            })
            .slice(0, 6);

        return NextResponse.json(suggestions);
    } catch {
        // Fallback: broad static list filtered by query
        const fallback = [
            { label: "Paris, France", city: "Paris", country: "France" },
            { label: "Londres, Royaume-Uni", city: "Londres", country: "Royaume-Uni" },
            { label: "New York, États-Unis", city: "New York", country: "États-Unis" },
            { label: "Tokyo, Japon", city: "Tokyo", country: "Japon" },
            { label: "Dubai, Émirats arabes unis", city: "Dubai", country: "Émirats arabes unis" },
            { label: "Barcelone, Espagne", city: "Barcelone", country: "Espagne" },
            { label: "Rome, Italie", city: "Rome", country: "Italie" },
            { label: "Amsterdam, Pays-Bas", city: "Amsterdam", country: "Pays-Bas" },
            { label: "Bangkok, Thaïlande", city: "Bangkok", country: "Thaïlande" },
            { label: "Bali, Indonésie", city: "Bali", country: "Indonésie" },
            { label: "Marrakech, Maroc", city: "Marrakech", country: "Maroc" },
            { label: "Singapour, Singapour", city: "Singapour", country: "Singapour" },
            { label: "Istanbul, Turquie", city: "Istanbul", country: "Turquie" },
            { label: "Lisbonne, Portugal", city: "Lisbonne", country: "Portugal" },
            { label: "Berlin, Allemagne", city: "Berlin", country: "Allemagne" },
            { label: "Sydney, Australie", city: "Sydney", country: "Australie" },
            { label: "Kyoto, Japon", city: "Kyoto", country: "Japon" },
            { label: "Maldives, Maldives", city: "Maldives", country: "Maldives" },
            { label: "Santorini, Grèce", city: "Santorini", country: "Grèce" },
            { label: "Prague, République tchèque", city: "Prague", country: "République tchèque" },
        ].filter(s => s.label.toLowerCase().includes(q.toLowerCase()));

        return NextResponse.json(fallback.slice(0, 6));
    }
}
