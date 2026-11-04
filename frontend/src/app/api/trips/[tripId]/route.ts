import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isUuid, requireUser, serverError } from '@/lib/api/guard';

type Ctx = { params: Promise<{ tripId: string }> };

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const updateTripSchema = z.object({
    title: z.string().trim().min(1).max(200).optional(),
    destination_id: z.string().uuid().optional().nullable(),
    start_date: isoDate.optional().nullable(),
    end_date: isoDate.optional().nullable(),
    name: z.string().trim().max(80).optional().nullable(),
    travelers: z.number().int().min(1).max(20).optional().nullable(),
    budget: z.number().min(0).max(1000000).optional().nullable(),
});

const notFound = () => NextResponse.json({ error: 'Voyage introuvable' }, { status: 404 });

export async function GET(_request: Request, { params }: Ctx) {
    const { tripId } = await params;
    if (!isUuid(tripId)) return notFound();
    const g = await requireUser();
    if (!g.ok) return g.response;

    // La RLS ne renvoie le voyage que s'il appartient à l'utilisateur
    const { data: trip, error } = await g.supabase
        .from('trips')
        .select('*, destinations(*)')
        .eq('id', tripId)
        .single();

    if (error || !trip) return notFound();
    return NextResponse.json(trip);
}

export async function PATCH(request: Request, { params }: Ctx) {
    const { tripId } = await params;
    if (!isUuid(tripId)) return notFound();
    const g = await requireUser();
    if (!g.ok) return g.response;

    const parsed = updateTripSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
        return NextResponse.json({ error: 'Validation Error', details: parsed.error.issues }, { status: 400 });
    }

    const { data: updatedTrip, error } = await g.supabase
        .from('trips')
        .update(parsed.data)
        .eq('id', tripId)
        .select()
        .maybeSingle();

    if (error) return serverError('trips:update', error);
    if (!updatedTrip) return notFound();
    return NextResponse.json(updatedTrip);
}

export async function DELETE(_request: Request, { params }: Ctx) {
    const { tripId } = await params;
    if (!isUuid(tripId)) return notFound();
    const g = await requireUser();
    if (!g.ok) return g.response;

    const { error } = await g.supabase.from('trips').delete().eq('id', tripId);
    if (error) return serverError('trips:delete', error);
    return new NextResponse(null, { status: 204 });
}
