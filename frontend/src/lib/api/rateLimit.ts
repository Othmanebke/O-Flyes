import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Limitation du nombre de requêtes (anti-abus : quota de l'IA, spam newsletter…).
//
// Le compteur est stocké dans Postgres (table rate_limits + fonction rate_limit_hit,
// migration 0007) : il est partagé entre toutes les instances serverless, contrairement
// à une variable en mémoire. Si la migration n'est pas encore appliquée, on se rabat
// sur un compteur en mémoire, moins fiable mais mieux que rien.

const memory = new Map<string, { count: number; start: number }>();

function memoryHit(key: string, max: number, windowSec: number): boolean {
    const now = Date.now();
    const cur = memory.get(key);
    if (!cur || now - cur.start > windowSec * 1000) {
        memory.set(key, { count: 1, start: now });
        if (memory.size > 5000) memory.clear(); // garde-fou mémoire
        return true;
    }
    cur.count++;
    return cur.count <= max;
}

export async function rateLimit(key: string, max: number, windowSec: number): Promise<boolean> {
    const admin = createAdminClient();
    if (admin) {
        const { data, error } = await admin.rpc('rate_limit_hit', { p_key: key, p_max: max, p_window_seconds: windowSec });
        if (!error && typeof data === 'boolean') return data;
    }
    return memoryHit(key, max, windowSec);
}

// Routes publiques très sollicitées (autocomplétion, recherches) : un compteur en mémoire
// suffit et évite un aller-retour en base à chaque frappe. 120 requêtes / minute / IP.
export function limitPublic(request: Request, name: string, max = 120, windowSec = 60): NextResponse | null {
    const fwd = request.headers.get('x-forwarded-for');
    const ip = (fwd?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown').trim();
    return memoryHit(`${name}:${ip}`, max, windowSec) ? null : tooManyRequests(windowSec);
}

export function tooManyRequests(retryAfterSec: number) {
    return NextResponse.json(
        { error: 'Trop de requêtes. Patientez un instant avant de réessayer.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
    );
}
