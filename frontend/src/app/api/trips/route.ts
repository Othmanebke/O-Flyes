import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser, serverError } from '@/lib/api/guard';
import { rateLimit, tooManyRequests } from '@/lib/api/rateLimit';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const createTripSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    destination_id: z.string().uuid().optional().nullable(),
    start_date: isoDate.optional(),
    end_date: isoDate.optional(),
});

export async function GET() {
    const g = await requireUser();
    if (!g.ok) return g.response;
    const { supabase, user } = g;

    // .eq('user_id', ...) en plus de la RLS : ceinture et bretelles
    const { data: trips, error } = await supabase
        .from('trips')
        .select('*, destinations(name, country, image_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) return serverError('trips:list', error);

    const formattedTrips = trips.map(trip => ({
        ...trip,
        destination_name: trip.destinations?.name,
        country: trip.destinations?.country,
        img: trip.destinations?.image_url,
    }));

    return NextResponse.json(formattedTrips);
}

export async function POST(request: Request) {
    const g = await requireUser();
    if (!g.ok) return g.response;
    const { supabase, user } = g;

    if (!(await rateLimit(`trips:create:${user.id}`, 30, 3600))) return tooManyRequests(3600);

    const parsed = createTripSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
        return NextResponse.json({ error: 'Validation Error', details: parsed.error.issues }, { status: 400 });
    }

    const { data: newTrip, error } = await supabase
        .from('trips')
        .insert({ user_id: user.id, ...parsed.data })
        .select()
        .single();

    if (error) return serverError('trips:create', error);
    return NextResponse.json(newTrip, { status: 201 });
}
