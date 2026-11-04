import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Client Supabase côté serveur, lié aux cookies de la requête : il agit avec les droits
// de l'utilisateur connecté, donc la RLS s'applique.
export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(list) {
                    try {
                        list.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                    } catch {
                        // appelé depuis un Server Component : le middleware gère le refresh
                    }
                },
            },
        }
    )
}
