import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // Simply accept metrics (no-op)
    return NextResponse.json({ success: true });
}
