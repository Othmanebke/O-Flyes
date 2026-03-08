import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGroqChatCompletion } from '@/lib/ai/groq';
import { z } from 'zod';

const chatRequestSchema = z.object({
    messages: z.array(
        z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string().min(1).max(50000), // Increased max length for detailed itineraries
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

        // Inject a system prompt to guide the AI and force a JSON structure
        const systemPrompt = {
            role: 'system',
            content: `Tu es AIVANA, un assistant de voyage expert, luxueux et intelligent. 
Ton objectif est de planifier des voyages parfaits selon le budget et les envies de l'utilisateur.
Tu dois TOUJOURS répondre au format JSON valide.
La structure JSON doit être EXACTEMENT :
{
  "content": "Ta réponse textuelle amicale, formatée en Markdown, détaillant le plan de voyage ou posant des questions...",
  "enriched": [
    {
      "name": "Nom de la ville",
      "country": "Pays",
      "emoji": "✈️",
      "price_estimate": 1500, // Nombre entier, prix estimé total
      "booking_url": "https://www.booking.com/searchresults.html?ss=Ville",
      "flights_url": "https://www.google.com/travel/flights?q=Ville",
      "activities": [
        { "name": "Visite locale", "price": 50, "emoji": "🏛️" }
      ]
    }
  ] // Liste d'idées de destinations si applicable, sinon tableau vide []
}
IMPORTANT: Ne renvoie QUE le JSON, pas de code markdown ou d'explications avant ou après. Rédige ton texte de \`content\` en Markdown.`
        };

        const messagesWithSystem = [systemPrompt, ...validatedData.messages];

        // Call Groq AI Helper with json mode
        const completion = await getGroqChatCompletion(messagesWithSystem, "llama-3.3-70b-versatile", 2000, true);

        // Extract the text content from the Groq message format
        const responseText = completion.choices[0]?.message?.content || "{}";

        let assistantMessage = "";
        let enrichedData = [];

        try {
            const parsed = JSON.parse(responseText);
            assistantMessage = parsed.content || "";
            enrichedData = parsed.enriched || [];
        } catch (e) {
            console.error("Failed to parse AI JSON response", responseText);
            // Fallback in case the LLM didn't respect the JSON format
            assistantMessage = responseText;
        }

        return NextResponse.json({
            role: 'assistant',
            content: assistantMessage,
            enriched: enrichedData
        });
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation Error', details: err.issues }, { status: 400 });
        }
        console.error("Chat API Error:", err);
        return NextResponse.json({ error: (err as Error).message || 'Internal Server Error' }, { status: 500 });
    }
}
