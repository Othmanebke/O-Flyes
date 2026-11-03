import { NextResponse } from 'next/server';
import { GEO, byId } from '@/lib/catalog';

// Données réelles et gratuites (sans clé) pour la fiche destination :
// - météo du mois choisi, mesurée l'an dernier : Open-Meteo (archive)
// - taux de change du jour : open.er-api.com
// - lieux à voir autour : Wikipédia (recherche géographique)
// Chaque bloc est indépendant : s'il échoue, il vaut null et la fiche s'affiche sans lui.

const DAY = 60 * 60 * 24;

async function json<T>(url: string): Promise<T | null> {
    try {
        // Wikimédia demande un User-Agent qui identifie l'application
        const res = await fetch(url, { next: { revalidate: DAY }, signal: AbortSignal.timeout(6000), headers: { 'User-Agent': 'AIVANA/1.0 (projet etudiant de planification de voyage)' } });
        return res.ok ? (await res.json()) as T : null;
    } catch {
        return null;
    }
}

async function weather(lat: number, lon: number, month: number) {
    // Même mois, l'année précédente (les archives ont quelques jours de retard)
    const now = new Date();
    const year = now.getFullYear() - 1;
    const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const end = new Date(Date.UTC(year, month + 1, 0)).toISOString().slice(0, 10);
    const data = await json<{ daily?: { temperature_2m_max: (number | null)[]; temperature_2m_min: (number | null)[]; precipitation_sum: (number | null)[] } }>(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${start}&end_date=${end}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
    );
    const d = data?.daily;
    if (!d?.temperature_2m_max?.length) return null;
    const avg = (xs: (number | null)[]) => {
        const v = xs.filter((x): x is number => x !== null);
        return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null;
    };
    return {
        year,
        maxAvg: avg(d.temperature_2m_max),
        minAvg: avg(d.temperature_2m_min),
        rainyDays: d.precipitation_sum.filter(p => (p ?? 0) >= 1).length,
        days: d.temperature_2m_max.length,
    };
}

async function exchange(currency: string) {
    if (currency === 'EUR') return null;
    const data = await json<{ result?: string; rates?: Record<string, number>; time_last_update_utc?: string }>('https://open.er-api.com/v6/latest/EUR');
    const rate = data?.rates?.[currency];
    return rate ? { currency, rate, updated: data?.time_last_update_utc || null } : null;
}

async function sights(lat: number, lon: number) {
    const data = await json<{ query?: { geosearch?: { pageid: number; title: string; dist: number }[] } }>(
        `https://fr.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}%7C${lon}&gsradius=10000&gslimit=60&format=json&origin=*`
    );
    // On écarte transports, administrations, événements datés et pages d'homonymie « X (Ville) »
    const skip = /gare|station|métro|arrêt|aéroport|ambassade|consulat|école|lycée|université|hôpital|^rue |^avenue |^boulevard |district|arrondissement|quartier|paroisse|freguesia|tournoi|championnat|grand prix|élection|liste|\(|\d{4}/i;
    return (data?.query?.geosearch || [])
        .filter(p => !skip.test(p.title))
        .slice(0, 8)
        .map(p => ({ title: p.title, url: `https://fr.wikipedia.org/?curid=${p.pageid}`, km: Math.round(p.dist / 100) / 10 }));
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const d = byId(searchParams.get('id'));
    const geo = d ? GEO[d.id] : undefined;
    if (!d || !geo) return NextResponse.json({ error: 'Destination inconnue' }, { status: 404 });

    const month = Math.min(11, Math.max(0, Number(searchParams.get('month') ?? new Date().getMonth()) || 0));
    const [w, fx, places] = await Promise.all([weather(geo.lat, geo.lon, month), exchange(geo.currency), sights(geo.lat, geo.lon)]);

    return NextResponse.json({
        month,
        weather: w,
        exchange: fx ? { ...fx, currencyName: geo.currencyName } : null,
        sights: places,
    });
}
