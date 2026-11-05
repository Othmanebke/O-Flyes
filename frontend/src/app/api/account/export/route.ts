import { NextResponse } from 'next/server';
import { requireUser, serverError } from '@/lib/api/guard';
import { rateLimit, tooManyRequests } from '@/lib/api/rateLimit';
import { createAdminClient } from '@/lib/supabase/admin';

// RGPD, articles 15 et 20 (droit d'accès et portabilité) : toutes les données
// que le site conserve sur l'utilisateur, dans un fichier JSON lisible.
export async function GET() {
    const g = await requireUser();
    if (!g.ok) return g.response;
    const { supabase, user } = g;

    if (!(await rateLimit(`account:export:${user.id}`, 10, 3600))) return tooManyRequests(3600);

    const { data: trips, error } = await supabase
        .from('trips')
        .select('id, title, name, start_date, end_date, travelers, budget, share_id, proposal_json, proposal_generated_at, created_at, updated_at, trip_items(id, type, title, price_estimate, provider, external_url, metadata, created_at)')
        .eq('user_id', user.id)
        .order('created_at');
    if (error) return serverError('account:export', error);

    let newsletter: { subscribed: boolean; since: string | null } = { subscribed: false, since: null };
    const admin = createAdminClient();
    if (admin && user.email) {
        const { data } = await admin.from('newsletter_subscribers').select('created_at').eq('email', user.email.toLowerCase()).maybeSingle();
        if (data) newsletter = { subscribed: true, since: data.created_at };
    }

    const payload = {
        exported_at: new Date().toISOString(),
        service: 'AIVANA',
        account: {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            sign_in_methods: (user.identities || []).map(i => ({ provider: i.provider, linked_at: i.created_at })),
            profile: user.user_metadata,
        },
        newsletter,
        trips: trips || [],
    };

    const day = new Date().toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(payload, null, 2), {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Disposition': `attachment; filename="aivana-mes-donnees-${day}.json"`,
            'Cache-Control': 'no-store',
        },
    });
}
