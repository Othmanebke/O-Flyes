import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isUuid, requireUser, serverError } from '@/lib/api/guard';
import { rateLimit, tooManyRequests } from '@/lib/api/rateLimit';

type Ctx = { params: Promise<{ tripId: string }> };

// Uniquement des liens http(s) : z.string().url() accepte aussi « javascript:alert(1) »,
// qui deviendrait une faille XSS une fois placé dans un <a href>.
const webUrl = z.string().max(2000).url().refine(u => /^https?:\/\//i.test(u), 'Lien http(s) uniquement');

const createTripItemSchema = z.object({
    type: z.enum(['flight', 'hotel', 'activity', 'transport', 'restaurant', 'note']),
    title: z.string().trim().min(1).max(300),
    price_estimate: z.number().min(0).max(1000000).optional().nullable(),
    provider: z.string().max(100).optional().nullable(),
    external_url: webUrl.optional().nullable(),
    metadata: z.record(z.string().max(40), z.union([z.string().max(500), z.number(), z.boolean(), z.null()]))
        .refine(m => Object.keys(m).length <= 30, 'Trop de champs')
        .optional(),
});

export async function GET(_request: Request, { params }: Ctx) {
    const { tripId } = await params;
    if (!isUuid(tripId)) return NextResponse.json([]);
    const g = await requireUser();
    if (!g.ok) return g.response;

    // La policy RLS « Users can view own trip items » vérifie que trip_id appartient à un
    // voyage de l'utilisateur : pour le voyage de quelqu'un d'autre, Supabase renvoie [].
    const { data: items, error } = await g.supabase
        .from('trip_items')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true });

    if (error) return serverError('items:list', error);
    return NextResponse.json(items);
}

export async function POST(request: Request, { params }: Ctx) {
    const { tripId } = await params;
    if (!isUuid(tripId)) return NextResponse.json({ error: 'Voyage introuvable' }, { status: 404 });
    const g = await requireUser();
    if (!g.ok) return g.response;

    if (!(await rateLimit(`items:create:${g.user.id}`, 200, 3600))) return tooManyRequests(600);

    const parsed = createTripItemSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
        return NextResponse.json({ error: 'Validation Error', details: parsed.error.issues }, { status: 400 });
    }

    // La policy « Users can insert own trip items » rejette l'insertion si trip_id
    // ne correspond pas à un voyage de l'utilisateur connecté.
    const { data: newItem, error } = await g.supabase
        .from('trip_items')
        .insert({ trip_id: tripId, ...parsed.data })
        .select()
        .single();

    if (error) return serverError('items:create', error);
    return NextResponse.json(newItem, { status: 201 });
}
