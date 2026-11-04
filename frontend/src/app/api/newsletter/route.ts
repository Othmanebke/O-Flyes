import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { clientIp, isUuid } from '@/lib/api/guard';
import { rateLimit, tooManyRequests } from '@/lib/api/rateLimit';
import { verifyCaptcha } from '@/lib/api/captcha';

const subscribeSchema = z.object({
    email: z.string().trim().email().max(200),
    captchaToken: z.string().max(2048).optional(),
});

// Inscription (formulaire du footer). Protégée par captcha + limite par IP contre le spam.
export async function POST(request: Request) {
    const ip = clientIp(request);
    if (!(await rateLimit(`newsletter:${ip}`, 5, 3600))) return tooManyRequests(3600);

    const parsed = subscribeSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
        return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 });
    }
    if (!(await verifyCaptcha(parsed.data.captchaToken, ip))) {
        return NextResponse.json({ error: 'Vérification anti-robot échouée. Réessayez.' }, { status: 400 });
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        return NextResponse.json({ error: 'Inscription indisponible' }, { status: 503 });
    }
    // Insertion simple : un upsert (ON CONFLICT) exigerait aussi un droit de lecture RLS.
    // Email déjà inscrit (23505) = succès pour la personne (on ne révèle pas qui est abonné).
    const supabase = await createClient();
    const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: parsed.data.email.toLowerCase() });
    if (error && error.code !== '23505') {
        console.error('[newsletter:subscribe]', error);
        return NextResponse.json({ error: 'Inscription indisponible' }, { status: 503 });
    }
    return NextResponse.json({ ok: true }, { status: 201 });
}

// Désinscription. Deux façons de prouver que l'adresse est la sienne :
//  - le jeton secret présent dans le lien de chaque lettre (/newsletter?token=…) ;
//  - être connecté avec cette adresse.
// Connaître l'adresse seule ne suffit plus (avant, n'importe qui pouvait désinscrire n'importe qui).
const unsubscribeSchema = z.union([
    z.object({ token: z.string().refine(isUuid) }),
    z.object({ email: z.string().trim().email().max(200) }),
]);

export async function DELETE(request: Request) {
    const ip = clientIp(request);
    if (!(await rateLimit(`newsletter:unsub:${ip}`, 10, 3600))) return tooManyRequests(3600);

    const parsed = unsubscribeSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: 'Lien de désinscription invalide' }, { status: 400 });

    const admin = createAdminClient();
    if (!admin) return NextResponse.json({ error: 'Désinscription indisponible' }, { status: 503 });

    let query;
    if ('token' in parsed.data) {
        query = admin.from('newsletter_subscribers').delete().eq('unsubscribe_token', parsed.data.token);
    } else {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const email = parsed.data.email.toLowerCase();
        if (!user || user.email?.toLowerCase() !== email) {
            return NextResponse.json({ error: 'login_required' }, { status: 401 });
        }
        query = admin.from('newsletter_subscribers').delete().eq('email', email);
    }

    const { error } = await query;
    if (error) {
        console.error('[newsletter:unsubscribe]', error);
        return NextResponse.json({ error: 'Désinscription indisponible' }, { status: 503 });
    }
    // même réponse que l'adresse soit inscrite ou non : on ne révèle pas qui est abonné
    return NextResponse.json({ ok: true });
}
