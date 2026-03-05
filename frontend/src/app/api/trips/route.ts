import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createTripSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    destination_id: z.string().uuid().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
});

export async function GET() {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: trips, error } = await supabase
        .from('trips')
        .select('*, destinations(name, country, image_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format array payload to match existing frontend expectations if needed
    const formattedTrips = trips.map(trip => ({
        ...trip,
        destination_name: trip.destinations?.name,
        country: trip.destinations?.country,
        img: trip.destinations?.image_url,
    }));

    return NextResponse.json(formattedTrips);
}

export async function POST(request: Request) {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validatedData = createTripSchema.parse(body);

        const { data: newTrip, error } = await supabase
            .from('trips')
            .insert({
                user_id: user.id,
                ...validatedData
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(newTrip, { status: 201 });
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation Error', details: err.issues }, { status: 400 });
        }
        return NextResponse.json({ error: (err as Error).message || 'Internal Server Error' }, { status: 500 });
    }
}
