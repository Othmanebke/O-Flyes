// Lieux réels autour d'une ville, gratuits et sans clé :
// - Photon (OpenStreetMap) pour trouver les coordonnées d'une ville hors catalogue
// - Wikipédia (recherche géographique) pour les lieux à voir autour
import { GEO, findDestination } from '@/lib/catalog';

const DAY = 60 * 60 * 24;
// Wikimédia demande un User-Agent qui identifie l'application
const HEADERS = { 'User-Agent': 'AIVANA/1.0 (projet etudiant de planification de voyage)', Accept: 'application/json' };

async function getJson<T>(url: string): Promise<T | null> {
    try {
        const res = await fetch(url, { headers: HEADERS, next: { revalidate: DAY }, signal: AbortSignal.timeout(6000) });
        return res.ok ? (await res.json()) as T : null;
    } catch {
        return null;
    }
}

export async function cityCoordinates(city: string): Promise<{ lat: number; lon: number } | null> {
    // Coordonnées du catalogue seulement pour son nom exact (« Kyoto & Tokyo » est centré sur Kyoto :
    // une recherche « Tokyo » doit passer par le géocodage)
    const cat = findDestination(city);
    const norm = (x: string) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    if (cat && GEO[cat.id] && norm(cat.name) === norm(city)) return { lat: GEO[cat.id].lat, lon: GEO[cat.id].lon };
    const data = await getJson<{ features?: { geometry: { coordinates: [number, number] }; properties: { type?: string } }[] }>(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(city)}&limit=5&lang=fr`
    );
    const f = data?.features?.find(x => ['city', 'town', 'village', 'county', 'state', 'district'].includes(x.properties?.type || '')) || data?.features?.[0];
    return f ? { lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0] } : null;
}

export interface Sight { id: number; title: string; url: string; km: number }

// On écarte transports, administrations, événements datés et pages d'homonymie « X (Ville) »
const SKIP = /gare|station|métro|arrêt|aéroport|ambassade|consulat|école|lycée|université|hôpital|^rue |^avenue |^boulevard |district|arrondissement|quartier|paroisse|freguesia|tournoi|championnat|grand prix|élection|liste|affaire|révolte|bataille|siège de|incendie|d[ōo]ri|-machi|group|holdings|corporation|banque|bank|building|life|financial|^ville de |\(|\d{4}/i;

export async function nearbySights(lat: number, lon: number, limit = 8): Promise<Sight[]> {
    const data = await getJson<{ query?: { geosearch?: { pageid: number; title: string; dist: number }[] } }>(
        `https://fr.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}%7C${lon}&gsradius=10000&gslimit=60&format=json`
    );
    return (data?.query?.geosearch || [])
        .filter(p => !SKIP.test(p.title))
        .slice(0, limit)
        .map(p => ({ id: p.pageid, title: p.title, url: `https://fr.wikipedia.org/?curid=${p.pageid}`, km: Math.round(p.dist / 100) / 10 }));
}

export async function sightsForCity(city: string, limit = 8): Promise<Sight[]> {
    const c = await cityCoordinates(city);
    return c ? nearbySights(c.lat, c.lon, limit) : [];
}
