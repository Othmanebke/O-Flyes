import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { generateTripProposal } from '@/lib/agents/pipeline';
import type { TripContext } from '@/lib/agents/types';

const generateProposalSchema = z.object({
    originCity: z.string().min(1).max(100).optional(),
    budgetEur: z.number().positive().max(1000000).optional(),
    preferences: z.string().max(2000).optional(),
    travelers: z.number().int().positive().max(20).optional(),
});

// Trips saved from chatbot/recommendation suggestions have no destinations FK
// match (local catalog ids aren't real UUIDs), so destination_id stays null and
// the only trace of the chosen place is the title ("Voyage à X" / "Voyage : X").
// Parse it back out so destination-agent confirms the SAME place the user saved
// instead of guessing a different one from scratch.
function extractDestinationFromTitle(title: string): string | null {
    const match = title.match(/^Voyage\s*[:à]\s*(.+)$/i);
    return match ? match[1].trim() || null : null;
}

function extractBudgetFromRange(range: unknown): number | null {
    if (range && typeof range === 'object') {
        const r = range as Record<string, unknown>;
        if (typeof r.max === 'number') return r.max;
        if (typeof r.min === 'number') return r.min;
    }
    return null;
}

function buildPreferencesText(prefs: Record<string, unknown> | null | undefined): string {
    if (!prefs) return '';
    const parts: string[] = [];
    if (typeof prefs.travel_style === 'string' && prefs.travel_style) parts.push(`style de voyage : ${prefs.travel_style}`);
    if (Array.isArray(prefs.interests) && prefs.interests.length) parts.push(`centres d'intérêt : ${prefs.interests.join(', ')}`);
    if (Array.isArray(prefs.preferred_seasons) && prefs.preferred_seasons.length) parts.push(`saisons préférées : ${prefs.preferred_seasons.join(', ')}`);
    return parts.join(' ; ');
}

// Returns the previously generated & persisted proposal for this trip, if any.
export async function GET(request: Request, { params }: { params: { tripId: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: trip, error } = await supabase
        .from('trips')
        .select('id, proposal_json, proposal_generated_at')
        .eq('id', params.tripId)
        .single();

    if (error || !trip) {
        return NextResponse.json({ error: 'Trip not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ proposal: trip.proposal_json || null, generatedAt: trip.proposal_generated_at || null });
}

// Runs the full multi-agent pipeline (destination → transport/activities/safety → budget → orchestrator)
// grounded in real flight/hotel/activity data, then persists the result on the trip.
export async function POST(request: Request, { params }: { params: { tripId: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json().catch(() => ({}));
        const validated = generateProposalSchema.parse(body);

        const { data: trip, error: tripError } = await supabase
            .from('trips')
            .select('*, destinations(name, country)')
            .eq('id', params.tripId)
            .single();

        if (tripError || !trip) {
            return NextResponse.json({ error: 'Trip not found or unauthorized' }, { status: 404 });
        }

        const { data: prefs } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();

        const fallbackDestinationName = trip.destinations?.name ?? extractDestinationFromTitle(trip.title || '');

        const context: TripContext = {
            tripId: trip.id,
            title: trip.title || 'Mon voyage',
            destinationName: fallbackDestinationName,
            country: trip.destinations?.country ?? null,
            originCity: validated.originCity?.trim() || 'Paris',
            startDate: trip.start_date ?? null,
            endDate: trip.end_date ?? null,
            travelers: validated.travelers || 2,
            budgetEur: validated.budgetEur ?? extractBudgetFromRange(prefs?.budget_range),
            preferences: validated.preferences?.trim() || buildPreferencesText(prefs),
        };

        const proposal = await generateTripProposal(context);

        const { error: updateError } = await supabase
            .from('trips')
            .update({ proposal_json: proposal, proposal_generated_at: proposal.generatedAt })
            .eq('id', trip.id);

        if (updateError) throw updateError;

        return NextResponse.json({ proposal, generatedAt: proposal.generatedAt }, { status: 201 });
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation Error', details: err.issues }, { status: 400 });
        }
        console.error('Trip proposal generation error:', err);
        return NextResponse.json({ error: (err as Error).message || 'Internal Server Error' }, { status: 500 });
    }
}
