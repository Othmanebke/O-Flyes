import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGroqChatCompletion } from '@/lib/ai/groq';
import { z } from 'zod';
import { getIATA, bookingHotelUrl, skyscannerFlightUrl } from '@/lib/iata';
import { searchFlights, searchHotelOffers } from '@/lib/travel/amadeus';
import { searchRealActivities } from '@/lib/travel/opentripmap';

const chatRequestSchema = z.object({
    messages: z.array(
        z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string().min(1).max(50000), // Increased max length for detailed itineraries
        })
    ).min(1).max(50), // Limited message history
});

interface DraftDestination {
    name: string;
    country: string;
    emoji: string;
    nights?: number;
}

interface EnrichedDestination {
    name: string;
    country: string;
    emoji: string;
    dataSource: 'real' | 'unavailable';
    price_estimate: number | null;
    booking_url: string;
    flights_url: string;
    activities: { name: string; emoji: string; price: number | null }[];
}

const MAX_DESTINATIONS_TO_GROUND = 3;

function addDays(date: Date, days: number): string {
    return new Date(date.getTime() + days * 86400000).toISOString().split('T')[0];
}

// Validates an LLM-estimated travel date: must be a real, parseable, future date.
// Falls back to null (caller defaults to +45 days) for anything malformed or in the past —
// we'd rather ground prices on a sane default than on a hallucinated/expired date.
function parseTravelDate(estimate: unknown): string | null {
    if (typeof estimate !== 'string') return null;
    const d = new Date(estimate + 'T00:00:00');
    if (isNaN(d.getTime())) return null;
    if (d.getTime() < Date.now()) return null;
    return estimate;
}

const ACTIVITY_EMOJIS = ['🏛️', '🌅', '🍽️', '🚶', '🎭', '🌿', '🏖️', '🛶'];

// Ground a single LLM-suggested destination in real flight/hotel/activity data.
// Returns dataSource: 'unavailable' (rather than fabricated numbers) when no real source responds.
async function groundDestination(draft: DraftDestination, originCity: string, travelDate: string | null): Promise<EnrichedDestination> {
    const nights = draft.nights && draft.nights > 0 ? Math.min(draft.nights, 21) : 7;
    const departDate = travelDate || addDays(new Date(), 45);
    const checkin = departDate;
    const checkout = addDays(new Date(departDate + 'T00:00:00'), nights);
    const originCode = getIATA(originCity);
    const destCode = getIATA(draft.name);
    const adults = 2;

    const [flights, hotels, activities] = await Promise.all([
        searchFlights(originCode, destCode, departDate, adults, checkout),
        searchHotelOffers(draft.name, checkin, checkout, adults),
        searchRealActivities(draft.name, 6),
    ]);

    // `flights` is now a round-trip search (returnDate = checkout) — `price` is already the full aller-retour total
    const cheapestFlight = flights ? Math.min(...flights.map(f => f.price)) : null;
    const cheapestHotel = hotels ? Math.min(...hotels.map(h => h.pricePerNight)) : null;

    let dataSource: 'real' | 'unavailable' = 'unavailable';
    let priceEstimate: number | null = null;

    if (cheapestFlight !== null && cheapestHotel !== null) {
        priceEstimate = Math.round(cheapestFlight + cheapestHotel * nights);
        dataSource = 'real';
    }

    const realActivities = (activities || []).slice(0, 3).map((a, i) => ({
        name: a.title,
        emoji: ACTIVITY_EMOJIS[i % ACTIVITY_EMOJIS.length],
        price: null, // OpenTripMap exposes real places but not real pricing — never invent a number here
    }));

    return {
        name: draft.name,
        country: draft.country,
        emoji: draft.emoji || '✈️',
        dataSource,
        price_estimate: priceEstimate,
        booking_url: bookingHotelUrl({ city: draft.name, checkin, checkout, adults }),
        flights_url: skyscannerFlightUrl({ origin: originCity, destination: draft.name, depart: departDate, return: checkout, adults }),
        activities: realActivities,
    };
}

function buildBudgetNote(budgetEur: number | null, grounded: EnrichedDestination[]): string {
    if (!budgetEur) return '';

    const overBudget = grounded.filter(d => d.dataSource === 'real' && d.price_estimate !== null && d.price_estimate > budgetEur * 1.1);
    if (overBudget.length === 0) return '';

    const lines = overBudget.map(d => `- **${d.name}** : environ **${d.price_estimate!.toLocaleString('fr-FR')} €** (vol + hôtel pour 2, données réelles actuelles) contre ${budgetEur.toLocaleString('fr-FR')} € annoncés`);
    return `\n\n⚠️ **À noter sur le budget** : d'après les prix réels actuels, le budget de ${budgetEur.toLocaleString('fr-FR')} € est en dessous de ce qu'il faut prévoir pour :\n${lines.join('\n')}\n\nJe te conseille d'ajuster ton budget en conséquence (ou de viser une autre période/destination moins chère).`;
}

export async function POST(request: Request) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validatedData = chatRequestSchema.parse(body);

        // Inject a system prompt to guide the AI and force a JSON structure.
        // IMPORTANT: the LLM only proposes destination *ideas* here — it must NOT invent
        // prices or activities. Real prices/activities are fetched server-side afterwards
        // from Amadeus/OpenTripMap and merged in, so users never see fabricated numbers.
        const today = new Date().toISOString().split('T')[0];
        const systemPrompt = {
            role: 'system' as const,
            content: `Tu es AIVANA, un assistant de voyage expert, luxueux et intelligent.
Nous sommes le ${today}.
Ton objectif est de planifier des voyages parfaits selon le budget et les envies de l'utilisateur.
Tu dois TOUJOURS répondre au format JSON valide.
La structure JSON doit être EXACTEMENT :
{
  "content": "Ta réponse textuelle amicale, formatée en Markdown, détaillant le plan de voyage ou posant des questions...",
  "originCity": "Nom de la ville de départ mentionnée par l'utilisateur (ex: Lyon), ou null si non mentionnée",
  "budgetEur": 1500, // Nombre entier = budget TOTAL en euros mentionné par l'utilisateur, ou null si non mentionné
  "travelDateEstimate": "2026-09-15", // Date de départ au format AAAA-MM-JJ. Déduis-la de ce que dit l'utilisateur (mois, "dans X semaines", saison...) en te basant sur la date du jour ci-dessus. Mets null si vraiment aucun indice de période n'est donné.
  "enriched": [
    {
      "name": "Nom de la ville",
      "country": "Pays",
      "emoji": "✈️",
      "nights": 7 // Nombre de nuits envisagé pour ce séjour (déduis-le du contexte, 7 par défaut)
    }
  ] // Liste d'idées de destinations si applicable, sinon tableau vide []
}
RÈGLES DE CONVERSATION (très important) :
- Les DEUX informations minimales pour proposer de vraies destinations chiffrées sont : le BUDGET et la PÉRIODE/DATE du voyage. Si l'utilisateur ne t'a donné NI l'une NI l'autre dans la conversation, ne remplis PAS "enriched" (tableau vide []) et demande-lui ces deux infos dans "content", de façon chaleureuse et concise — ne pose pas 10 questions, juste budget + période (et éventuellement ville de départ).
- Si l'utilisateur a donné au moins une des deux infos (budget OU période), tu peux proposer des idées de destinations dans "enriched", mais mentionne dans "content" l'info manquante pour affiner les prochaines suggestions.
- Si le budget annoncé est manifestement trop bas pour la/les destination(s) demandée(s) ou évoquées (ex : "50€ pour Dubaï"), dis-le clairement et tout de suite dans "content" — explique que ce budget ne permettra pas de couvrir vol + hôtel pour cette destination, et invite l'utilisateur à soit augmenter son budget, soit choisir une destination plus abordable. Les prix réels affichés ensuite confirmeront ton message.
- N'INVENTE JAMAIS de prix, de noms d'hôtels ou d'activités : ne mets PAS ces champs dans le JSON, ils seront ajoutés automatiquement à partir de données réelles après ta réponse.
- Dans "content", ne donne pas de chiffres de prix précis toi-même — limite-toi aux idées, ambiances, période, conseils. Les prix réels seront affichés séparément dans les cartes destination.
- Ne renvoie QUE le JSON, pas de code markdown ou d'explications avant ou après. Rédige ton texte de \`content\` en Markdown.`
        };

        const messagesWithSystem = [systemPrompt, ...validatedData.messages];

        // Call Groq AI Helper with json mode
        const completion = await getGroqChatCompletion(messagesWithSystem, "llama-3.3-70b-versatile", 2000, true);

        // Extract the text content from the Groq message format
        const responseText = completion.choices[0]?.message?.content || "{}";

        let assistantMessage = "";
        let draftDestinations: DraftDestination[] = [];
        let originCity = "Paris";
        let budgetEur: number | null = null;
        let travelDate: string | null = null;

        try {
            const parsed = JSON.parse(responseText);
            assistantMessage = parsed.content || "";
            draftDestinations = Array.isArray(parsed.enriched) ? parsed.enriched : [];
            if (typeof parsed.originCity === 'string' && parsed.originCity.trim()) {
                originCity = parsed.originCity.trim();
            }
            if (typeof parsed.budgetEur === 'number' && parsed.budgetEur > 0) {
                budgetEur = parsed.budgetEur;
            }
            travelDate = parseTravelDate(parsed.travelDateEstimate);
        } catch (e) {
            console.error("Failed to parse AI JSON response", responseText);
            // Fallback in case the LLM didn't respect the JSON format
            assistantMessage = responseText;
        }

        // Ground each suggested destination in real flight/hotel/activity data (parallel, capped)
        const toGround = draftDestinations.slice(0, MAX_DESTINATIONS_TO_GROUND);
        const grounded = await Promise.all(toGround.map(d => groundDestination(d, originCity, travelDate)));

        if (grounded.some(d => d.dataSource === 'unavailable')) {
            assistantMessage += `\n\n_Note : pour certaines destinations, les prix en temps réel n'ont pas pu être récupérés à l'instant — pas de chiffre affiché plutôt qu'une estimation peu fiable. Réessaie dans un instant pour des prix à jour._`;
        }

        // If we silently defaulted the departure city to Paris (LLM found no mention of one),
        // say so explicitly rather than letting the user think the price reflects their own city.
        if (originCity === "Paris" && grounded.length > 0) {
            const userMentionedParis = JSON.stringify(validatedData.messages).toLowerCase().includes('paris');
            if (!userMentionedParis) {
                assistantMessage += `\n\n_Estimation calculée au départ de Paris — précise ta ville de départ pour des prix de vol exacts._`;
            }
        }

        assistantMessage += buildBudgetNote(budgetEur, grounded);

        return NextResponse.json({
            role: 'assistant',
            content: assistantMessage,
            enriched: grounded,
        });
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation Error', details: err.issues }, { status: 400 });
        }
        console.error("Chat API Error:", err);
        return NextResponse.json({ error: (err as Error).message || 'Internal Server Error' }, { status: 500 });
    }
}
