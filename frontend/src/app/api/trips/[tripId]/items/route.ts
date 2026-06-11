import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createTripItemSchema = z.object({
    type: z.enum(['flight', 'hotel', 'activity', 'transport', 'restaurant', 'note']),
    title: z.string().min(1),
    price_estimate: z.number().optional().nullable(),
    provider: z.string().optional().nullable(),
    external_url: z.string().url().optional().nullable(),
    metadata: z.record(z.string(), z.any()).optional(),
});

export async function GET(request: Request, { params }: { params: { tripId: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Pas de filtre user_id ici : la policy RLS "Users can view own trip items" vérifie déjà
    // que trip_id appartient à un trip dont user_id = auth.uid(), donc Supabase renvoie []
    // si on essaie de lire les items d'un voyage qui n'est pas le nôtre.
    const { data: items, error } = await supabase
        .from('trip_items')
        .select('*')
        .eq('trip_id', params.tripId)
        .order('created_at', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(items);
}

export async function POST(request: Request, { params }: { params: { tripId: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validatedData = createTripItemSchema.parse(body);

        // Idem côté insert : la policy "Users can insert own trip items" rejette l'insertion
        // si trip_id ne correspond pas à un voyage de l'utilisateur connecté.
        const { data: newItem, error } = await supabase
            .from('trip_items')
            .insert({
                trip_id: params.tripId,
                ...validatedData
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(newItem, { status: 201 });
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation Error', details: err.issues }, { status: 400 });
        }
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
