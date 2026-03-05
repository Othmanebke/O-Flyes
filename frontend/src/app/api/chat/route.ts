import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGroqChatCompletion } from '@/lib/ai/groq';
import { z } from 'zod';

const chatRequestSchema = z.object({
    messages: z.array(
        z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string().min(1).max(2000), // Validate message length and roles
        })
    ).min(1).max(50), // Limited message history
});

export async function POST(request: Request) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validatedData = chatRequestSchema.parse(body);

        // Call Groq AI Helper
        const completion = await getGroqChatCompletion(validatedData.messages);

        // Extract the text content from the Groq message format
        const assistantMessage = completion.choices[0]?.message?.content || "";

        return NextResponse.json({
            role: 'assistant',
            content: assistantMessage
        });
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation Error', details: err.issues }, { status: 400 });
        }
        console.error("Chat API Error:", err);
        return NextResponse.json({ error: (err as Error).message || 'Internal Server Error' }, { status: 500 });
    }
}
