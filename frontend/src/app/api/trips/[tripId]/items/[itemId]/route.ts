import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
    _request: Request,
    { params }: { params: { tripId: string; itemId: string } }
) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership via RLS: item must belong to a trip owned by the user
    const { error } = await supabase
        .from('trip_items')
        .delete()
        .eq('id', params.itemId)
        .eq('trip_id', params.tripId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
}
