import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const updateTripSchema = z.object({
    title: z.string().min(1).optional(),
    destination_id: z.string().uuid().optional().nullable(),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
});

export async function GET(request: Request, { params }: { params: { tripId: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: trip, error } = await supabase
        .from('trips')
        .select('*, destinations(*)')
        .eq('id', params.tripId)
        .single();

    if (error || !trip) {
        return NextResponse.json({ error: 'Trip not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json(trip);
}

export async function PATCH(request: Request, { params }: { params: { tripId: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validatedData = updateTripSchema.parse(body);

        const { data: updatedTrip, error } = await supabase
            .from('trips')
            .update(validatedData)
            .eq('id', params.tripId)
            .select()
            .single();

        if (error) throw error;

        if (!updatedTrip) {
            return NextResponse.json({ error: 'Trip not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json(updatedTrip);
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation Error', details: err.issues }, { status: 400 });
        }
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { tripId: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', params.tripId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
}
