import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // Code OAuth arrivé sur l'accueil (URL de redirection mal réglée) : on le renvoie
    // vers /auth/callback qui fait l'échange.
    const { pathname, searchParams, origin } = request.nextUrl
    const code = searchParams.get('code')
    if (code && (pathname === '/' || pathname === '')) {
        const callbackUrl = new URL('/auth/callback', origin)
        callbackUrl.searchParams.set('code', code)
        const next = searchParams.get('next')
        if (next) callbackUrl.searchParams.set('next', next)
        return NextResponse.redirect(callbackUrl)
    }

    let response = NextResponse.next({ request })

    // Sans clés Supabase (ex. .env.local incomplet), on laisse passer
    // plutôt que de renvoyer une 500 sur toutes les pages publiques.
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return response
    }

    // Visiteur non connecté : pas de session à rafraîchir, on ne fait rien.
    if (!request.cookies.getAll().some(c => c.name.startsWith('sb-'))) {
        return response
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(list) {
                    list.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({ request })
                    list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
                },
            },
        }
    )

    // Rafraîchit le jeton s'il a expiré et réécrit les cookies. getSession() lit la session
    // localement : pas d'appel réseau à chaque clic. Aucune décision d'accès n'est prise
    // ici : les routes API vérifient l'utilisateur avec getUser() (lib/api/guard.ts),
    // et la base applique la RLS.
    await supabase.auth.getSession()

    return response
}

export const config = {
    matcher: [
        // toutes les routes sauf l'API et les assets statiques
        '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
