import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateRecommendationsJson, extractJsonFromText } from '@/lib/ai/recommendations';
import { recommendationResultSchema, generateRecommendationRequestSchema } from '@/lib/validation/recommendations';

export async function GET() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: recommendations, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(recommendations);
}

export async function POST(request: Request) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validatedRequest = generateRecommendationRequestSchema.parse(body);

        // Get user preferences context
        const { data: prefs } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // Context aggregation
        const contextStr = `User Preferences: ${JSON.stringify(prefs || {})}\nUser Prompt: ${validatedRequest.prompt}`;

        // Generate with Groq
        const rawAiResponse = await generateRecommendationsJson(contextStr);

        // Parse and validate strictly using Zod
        const jsonStr = extractJsonFromText(rawAiResponse);
        let parsedJson;
        try {
            parsedJson = JSON.parse(jsonStr);
        } catch (e) {
            console.error("AI returned malformed JSON", rawAiResponse);
            throw new Error("AI returned malformed JSON");
        }

        const validatedResult = recommendationResultSchema.parse(parsedJson);

        // Insert to DB
        const { data: insertedRec, error: dbError } = await supabase
            .from('ai_recommendations')
            .insert({
                user_id: user.id,
                context_json: { prompt: validatedRequest.prompt, prefsData: prefs },
                result_json: validatedResult
            })
            .select()
            .single();

        if (dbError) throw dbError;

        return NextResponse.json(insertedRec, { status: 201 });

    } catch (err: any) {
        if (err.name === 'ZodError') {
            return NextResponse.json({ error: 'AI output validation failed or invalid request', details: err.errors }, { status: 400 });
        }
        console.error("Recommendations API Error", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
