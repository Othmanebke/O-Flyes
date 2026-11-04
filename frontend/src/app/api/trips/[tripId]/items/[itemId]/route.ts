import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

export async function DELETE(
    _request: Request,
    { params }: { params: { tripId: string; itemId: string } }
) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
        .from('trip_items')
        .delete()
        .eq('id', params.itemId)
        .eq('trip_id', params.tripId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
}

const patchSchema = z.object({
    // date de l'élément dans le séjour (AAAA-MM-JJ), null pour « à placer »
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
});

// Change le jour d'un élément (activité, hôtel…) dans l'itinéraire
export async function PATCH(
    request: Request,
    { params }: { params: { tripId: string; itemId: string } }
) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const parsed = patchSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: 'Date invalide' }, { status: 400 });

    // La RLS limite la lecture et l'écriture aux éléments des voyages de l'utilisateur
    const { data: item } = await supabase
        .from('trip_items')
        .select('metadata')
        .eq('id', params.itemId)
        .eq('trip_id', params.tripId)
        .single();
    if (!item) return NextResponse.json({ error: 'Élément introuvable' }, { status: 404 });

    const { error } = await supabase
        .from('trip_items')
        .update({ metadata: { ...(item.metadata || {}), date: parsed.data.date } })
        .eq('id', params.itemId)
        .eq('trip_id', params.tripId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
}
