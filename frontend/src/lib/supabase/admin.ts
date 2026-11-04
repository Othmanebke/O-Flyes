import { createClient } from '@supabase/supabase-js';

// Client serveur avec la clé secrète : contourne la RLS. À n'utiliser que dans des
// routes API, pour des opérations précises (ex. désinscription de la newsletter).
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key, { auth: { persistSession: false } });
}
