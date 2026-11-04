import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeNext } from '@/lib/safeNext'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // "next" : page où revenir après la connexion
    const next = safeNext(searchParams.get('next'))

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Double authentification activée sur ce compte : on demande le code
            // à 6 chiffres avant d'ouvrir l'accès aux données.
            const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
            if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
                return NextResponse.redirect(`${origin}/auth/mfa?next=${encodeURIComponent(next)}`)
            }
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    return NextResponse.redirect(`${origin}/auth/login?error=1`)
}
