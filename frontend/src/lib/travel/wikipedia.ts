// Lieux réels autour d'une ville, gratuits et sans clé :
// - Photon (OpenStreetMap) pour trouver les coordonnées d'une ville hors catalogue
// - Wikipédia (recherche géographique) pour les lieux à voir et leur photo
import { GEO, findDestination } from "@/lib/catalog";

const DAY = 60 * 60 * 24;
// Wikimédia demande un User-Agent qui identifie l'application
const HEADERS = { "User-Agent": "AIVANA/1.0 (projet etudiant de planification de voyage)", Accept: "application/json" };

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: HEADERS, next: { revalidate: DAY }, signal: AbortSignal.timeout(6000) });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

const norm = (x: string) => x.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

export async function cityCoordinates(city: string): Promise<{ lat: number; lon: number } | null> {
  // Coordonnées du catalogue seulement pour son nom exact (« Kyoto & Tokyo » est centré sur Kyoto :
  // une recherche « Tokyo » doit passer par le géocodage)
  const cat = findDestination(city);
  if (cat && GEO[cat.id] && norm(cat.name) === norm(city)) return { lat: GEO[cat.id].lat, lon: GEO[cat.id].lon };
  const data = await getJson<{
    features?: { geometry: { coordinates: [number, number] }; properties: { type?: string } }[];
  }>(`https://photon.komoot.io/api/?q=${encodeURIComponent(city)}&limit=5&lang=fr`);
  const f =
    data?.features?.find(x =>
      ["city", "town", "village", "county", "state", "district"].includes(x.properties?.type || ""),
    ) || data?.features?.[0];
  return f ? { lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0] } : null;
}

export interface Sight {
  id: number;
  title: string;
  url: string;
  km: number;
  image: string | null;
}

// On écarte transports, administrations, entreprises, événements datés et pages d'homonymie « X (Ville) »
const SKIP =
  /gare|station|métro|arrêt|aéroport|ambassade|consulat|école|lycée|université|hôpital|^rue |^avenue |^boulevard |district|arrondissement|quartier|paroisse|freguesia|tournoi|championnat|grand prix|élection|liste|affaire|révolte|bataille|siège de|incendie|d[ōo]ri|-machi|group|holdings|corporation|banque|bank|building|life|financial|^ville de |\(|\d{4}/i;

interface GeoPage {
  pageid: number;
  title: string;
  thumbnail?: { source: string };
  coordinates?: { dist?: number }[];
}

export async function nearbySights(lat: number, lon: number, limit = 8): Promise<Sight[]> {
  const data = await getJson<{ query?: { pages?: Record<string, GeoPage> } }>(
    `https://fr.wikipedia.org/w/api.php?action=query&generator=geosearch&ggscoord=${lat}%7C${lon}&ggsradius=10000&ggslimit=60` +
      `&prop=pageimages%7Ccoordinates&piprop=thumbnail&pithumbsize=640&codistancefrompoint=${lat}%7C${lon}&format=json`,
  );
  const pages = Object.values(data?.query?.pages || {})
    .map(p => ({ ...p, dist: p.coordinates?.[0]?.dist ?? 99999 }))
    .filter(p => !SKIP.test(p.title))
    // les lieux illustrés d'abord : ce sont en général les plus notables
    .sort((a, b) => Number(!!b.thumbnail) - Number(!!a.thumbnail) || a.dist - b.dist);
  return pages.slice(0, limit).map(p => ({
    id: p.pageid,
    title: p.title,
    url: `https://fr.wikipedia.org/?curid=${p.pageid}`,
    km: Math.round(p.dist / 100) / 10,
    image: p.thumbnail?.source || null,
  }));
}

export async function sightsForCity(city: string, limit = 8): Promise<Sight[]> {
  const c = await cityCoordinates(city);
  if (!c) return [];
  // La page de la ville elle-même n'est pas un lieu à visiter
  const names = city.split(/[&,+]/).map(norm);
  return (await nearbySights(c.lat, c.lon, limit + 2)).filter(s => !names.includes(norm(s.title))).slice(0, limit);
}

// Prix d'entrée estimé d'un lieu selon son type, avant ajustement au pays (null = inconnu)
export function sightPrice(title: string): number | null {
  const t = norm(title);
  if (
    /eglise|mosquee|chapelle|place|pont|jardin|parc|fontaine|plage|marche|porte|statue|monument|belvedere|miradouro|promenade|lac|colline|baie|bairro|vieille ville|medina|souk|rossio|gion|-jinja|sanctuaire shinto/.test(
      t,
    )
  )
    return 0;
  if (/ascenseur|funiculaire|telepherique|tramway/.test(t)) return 5;
  if (
    /musee|palais|chateau|monastere|cathedrale|basilique|tour|zoo|aquarium|temple|sanctuaire|forteresse|citadelle|opera|theatre|galerie|fondation|maison/.test(
      t,
    )
  )
    return 12;
  return null;
}
