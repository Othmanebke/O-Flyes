import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Outlook OAuth flow

    return NextResponse.json({ error: 'Fonctionnalité non disponible pour le moment.' }, { status: 501 });
}
