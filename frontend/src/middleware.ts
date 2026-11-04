import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // Intercept OAuth code landing on homepage and forward to /auth/callback
    const { pathname, searchParams, origin } = request.nextUrl;
    const code = searchParams.get('code');
    if (code && (pathname === '/' || pathname === '')) {
        const callbackUrl = new URL('/auth/callback', origin);
        callbackUrl.searchParams.set('code', code);
        const next = searchParams.get('next');
        if (next) callbackUrl.searchParams.set('next', next);
        return NextResponse.redirect(callbackUrl);
    }

    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Sans clés Supabase (ex. .env.local incomplet), on laisse passer
    // plutôt que de renvoyer une 500 sur toutes les pages publiques.
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return supabaseResponse
    }

    // Visiteur non connecté : pas de session à rafraîchir, on ne fait rien.
    if (!request.cookies.getAll().some(c => c.name.startsWith('sb-'))) {
        return supabaseResponse
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    supabaseResponse = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    supabaseResponse.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    supabaseResponse = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    supabaseResponse.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // Rafraîchit le jeton s'il a expiré et réécrit les cookies. getSession() lit la session
    // localement : pas d'appel réseau à chaque clic (getUser() en faisait un, ~150 ms par
    // requête). Aucune décision d'accès n'est prise ici : les routes API vérifient
    // elles-mêmes l'utilisateur avec getUser().
    await supabase.auth.getSession()

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * toutes les routes sauf les assets statiques
         */
        '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
