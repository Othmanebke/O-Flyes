import { NextResponse } from 'next/server';
import { z } from 'zod';
import { runRoadtripAgent } from '@/lib/agents/roadtripAgent';
import { findDestination } from '@/lib/catalog';
import type { TripContext } from '@/lib/agents/types';
import { isUuid, requireUser } from '@/lib/api/guard';
import { rateLimit, tooManyRequests } from '@/lib/api/rateLimit';

type Ctx = { params: Promise<{ tripId: string }> };

const generateProposalSchema = z.object({
    originCity: z.string().min(1).max(100).optional(),
    budgetEur: z.number().positive().max(1000000).nullable().optional(),
    preferences: z.string().max(2000).optional(),
    travelers: z.number().int().positive().max(20).optional(),
    booked: z.array(z.string().max(200)).max(30).optional(),
});

// Itinéraire déjà généré pour ce voyage (enregistré dans trips.proposal_json)
export async function GET(_request: Request, { params }: Ctx) {
    const { tripId } = await params;
    if (!isUuid(tripId)) return NextResponse.json({ proposal: null, generatedAt: null });
    const g = await requireUser();
    if (!g.ok) return g.response;

    const { data } = await g.supabase
        .from('trips')
        .select('proposal_json, proposal_generated_at')
        .eq('id', tripId)
        .maybeSingle();
    return NextResponse.json({ proposal: data?.proposal_json ?? null, generatedAt: data?.proposal_generated_at ?? null });
}

export async function POST(request: Request, { params }: Ctx) {
    const { tripId } = await params;
    if (!isUuid(tripId)) return NextResponse.json({ error: 'Voyage introuvable' }, { status: 404 });
    const g = await requireUser();
    if (!g.ok) return g.response;
    const { supabase, user } = g;

    // Chaque génération appelle l'IA plusieurs fois : on limite par compte
    if (!(await rateLimit(`proposal:${user.id}`, 10, 3600))) return tooManyRequests(3600);

    try {
        const body = await request.json().catch(() => ({}));
        const validated = generateProposalSchema.parse(body);

        // La RLS de trips garantit que le voyage appartient à l'utilisateur
        const { data: trip, error: tripError } = await supabase
            .from('trips')
            .select('*, destinations(name, country)')
            .eq('id', tripId)
            .single();

        if (tripError || !trip) {
            return NextResponse.json({ error: 'Voyage introuvable' }, { status: 404 });
        }

        // Le titre du voyage est le nom de la destination (« Lisbonne », « Kyoto & Tokyo »…)
        const name = trip.destinations?.name || (trip.title || '').replace(/^Voyage\s*[:à]\s*/i, '').trim();
        const cat = findDestination(name);

        const context: TripContext = {
            tripId: trip.id,
            title: trip.title || 'Mon voyage',
            destinationName: cat?.name || name || 'la destination choisie',
            country: trip.destinations?.country ?? cat?.country ?? null,
            originCity: validated.originCity?.trim() || 'Paris',
            startDate: trip.start_date ?? null,
            endDate: trip.end_date ?? null,
            travelers: validated.travelers || 2,
            budgetEur: validated.budgetEur ?? null,
            preferences: validated.preferences?.trim() || (cat ? cat.styles.join(', ') : ''),
            booked: validated.booked,
        };

        const proposal = await runRoadtripAgent(context);

        // On garde l'itinéraire avec le voyage pour le retrouver sur tous les appareils
        await supabase.from('trips')
            .update({ proposal_json: proposal, proposal_generated_at: proposal.generatedAt })
            .eq('id', trip.id);

        return NextResponse.json({ proposal, generatedAt: proposal.generatedAt }, { status: 201 });
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation Error', details: err.issues }, { status: 400 });
        }
        console.error('Trip proposal generation error:', err);
        const message = (err as Error).message || '';
        return NextResponse.json({
            error: message.startsWith('Groq') || message.includes('timeout') || message.includes('aborted')
                ? "Le copilote met trop de temps à répondre. Réessayez dans un instant."
                : 'La génération a échoué. Réessayez dans un instant.',
        }, { status: 500 });
    }
}
