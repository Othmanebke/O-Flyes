import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Email parsing logic
    // 1. Fetch encrypted tokens from 'email_connections'
    // 2. Use them to hit Gmail/Outlook APIs for recent messages
    // 3. Run messages through Regex/AI to identify bookings
    // 4. Map them to 'trips' and 'trip_items' tables

    return NextResponse.json({
        message: 'Inbox syncing and booking parsing is not fully implemented yet.',
        status: 'pending_implementation'
    }, { status: 501 });
}
