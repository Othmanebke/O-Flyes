import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createClient } from '@/lib/supabase/server';

// Active le lien public d'un voyage (lecture seule) et renvoie son identifiant.
// Nécessite la migration 0006 (colonne trips.share_id).
export async function POST(request: Request, { params }: { params: { tripId: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({})) as { travelers?: number; budget?: number | null; name?: string | null };
    const { data: trip, error } = await supabase.from('trips').select('id, share_id').eq('id', params.tripId).single();
    if (error || !trip) {
        const missing = error?.message?.includes('share_id');
        return NextResponse.json({ error: missing ? 'Partage indisponible : exécutez la migration 0006 dans Supabase.' : 'Voyage introuvable' }, { status: missing ? 503 : 404 });
    }

    const shareId = trip.share_id || randomUUID();
    const { error: upd } = await supabase.from('trips').update({
        share_id: shareId,
        travelers: typeof body.travelers === 'number' ? body.travelers : undefined,
        budget: typeof body.budget === 'number' ? body.budget : undefined,
        name: typeof body.name === 'string' ? body.name : undefined,
    }).eq('id', trip.id);
    if (upd) return NextResponse.json({ error: 'Partage indisponible pour le moment.' }, { status: 503 });

    return NextResponse.json({ shareId });
}

// Désactive le lien : l'ancienne adresse ne mène plus à rien
export async function DELETE(_request: Request, { params }: { params: { tripId: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { error } = await supabase.from('trips').update({ share_id: null }).eq('id', params.tripId);
    if (error) return NextResponse.json({ error: 'Impossible de désactiver le lien.' }, { status: 500 });
    return new NextResponse(null, { status: 204 });
}
