import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({ email: z.string().email().max(200) });

// Enregistre l'inscription dans newsletter_subscribers (migration 0004).
// Si la table ou Supabase manquent, on le dit au lieu d'afficher un faux « Merci ».
export async function POST(request: Request) {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
        return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 });
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        return NextResponse.json({ error: 'Inscription indisponible' }, { status: 503 });
    }
    // Insertion simple : un upsert (ON CONFLICT) exigerait aussi un droit de lecture RLS.
    // Email déjà inscrit (23505) = succès pour la personne.
    const { error } = await createClient()
        .from('newsletter_subscribers')
        .insert({ email: parsed.data.email.toLowerCase() });
    if (error && error.code !== '23505') {
        return NextResponse.json({ error: 'Inscription indisponible' }, { status: 503 });
    }
    return NextResponse.json({ ok: true }, { status: 201 });
}
