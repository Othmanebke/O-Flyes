export interface RealActivity {
    id: string;
    title: string;
    category: string;
    rating: number;
    description: string;
}

// retourne null si pas de clé ou si l'API ne répond pas, le caller gère le fallback
export async function searchRealActivities(city: string, limit: number = 8): Promise<RealActivity[] | null> {
    const apiKey = process.env.OPENTRIPMAP_API_KEY;
    if (!apiKey) return null;

    try {
        const geoRes = await fetch(
            `https://api.opentripmap.com/0.1/fr/places/geoname?name=${encodeURIComponent(city)}&apikey=${apiKey}`,
            { signal: AbortSignal.timeout(5000) }
        );
        if (!geoRes.ok) return null;
        const geo = await geoRes.json();
        const { lon, lat } = geo;
        if (lon === undefined || lat === undefined) return null;

        const placesRes = await fetch(
            `https://api.opentripmap.com/0.1/fr/places/radius?radius=5000&lon=${lon}&lat=${lat}&kinds=interesting_places,tourist_facilities,cultural,natural&format=json&limit=${limit}&apikey=${apiKey}`,
            { signal: AbortSignal.timeout(5000) }
        );
        if (!placesRes.ok) return null;
        const places = await placesRes.json();

        const activities = places
            .filter((p: any) => p.name && p.rate > 2)
            .slice(0, limit)
            .map((p: any) => ({
                id: `otm-${p.xid}`,
                title: p.name,
                category: p.kinds?.split(',')[0] || 'Attraction',
                rating: Number((4.0 + Math.min(p.rate, 7) / 10).toFixed(1)),
                description: `Visitez ${p.name}, une attraction incontournable de ${city}.`,
            }));

        return activities.length > 0 ? activities : null;
    } catch {
        return null;
    }
}
