import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGroqChatCompletion } from '@/lib/ai/groq';
import { extractJsonFromText } from '@/lib/ai/json';
import { z } from 'zod';
import { FREE_SEARCHES_PER_MONTH } from '@/lib/limits';
import { bookingHotelUrl, skyscannerFlightUrl } from '@/lib/iata';
import { estimate, findDestination } from '@/lib/catalog';
import type { DraftDestination, EnrichedDestination } from '@/types/chat';

const chatRequestSchema = z.object({
    messages: z.array(
        z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string().min(1).max(50000),
        })
    ).min(1).max(50),
});

// 3 destinations maximum par réponse
const MAX_DESTINATIONS_TO_GROUND = 3;

function addDays(date: Date, days: number): string {
    return new Date(date.getTime() + days * 86400000).toISOString().split('T')[0];
}

function parseTravelDate(estimate: unknown): string | null {
    if (typeof estimate !== 'string') return null;
    const d = new Date(estimate + 'T00:00:00');
    if (isNaN(d.getTime())) return null;
    if (d.getTime() < Date.now()) return null;
    return estimate;
}

// Prix : il n'existe plus d'API gratuite de prix en direct (Amadeus a fermé son offre
// gratuite en juillet 2026). Pour les destinations du catalogue, on renvoie une
// estimation explicite ; pour les autres, aucun chiffre plutôt qu'un prix inventé.
async function groundDestination(draft: DraftDestination, originCity: string, travelDate: string | null): Promise<EnrichedDestination> {
    const nights = draft.nights && draft.nights > 0 ? Math.min(draft.nights, 21) : 7;
    // 45 jours = première fenêtre dispo sur la plupart des compagnies low-cost
    const departDate = travelDate || addDays(new Date(), 45);
    const checkin = departDate;
    const checkout = addDays(new Date(departDate + 'T00:00:00'), nights);
    const adults = 2;
    const cat = findDestination(draft.name);
    const est = cat ? estimate(cat, nights, adults) : null;

    return {
        name: cat?.name || draft.name,
        country: cat?.country || draft.country,
        emoji: '',
        dataSource: est ? 'estimate' : 'unavailable',
        price_estimate: est ? est.flight + est.hotel : null,
        flight_price: est ? est.flight : null,
        hotel_price_per_night: cat ? cat.hotelFrom : null,
        nights,
        depart_date: departDate,
        return_date: checkout,
        adults,
        booking_url: bookingHotelUrl({ city: draft.name, checkin, checkout, adults }),
        flights_url: skyscannerFlightUrl({ origin: originCity, destination: draft.name, depart: departDate, return: checkout, adults }),
        activities: [],
    };
}

function buildBudgetNote(budgetEur: number | null, grounded: EnrichedDestination[]): string {
    if (!budgetEur) return '';
    const over = grounded.filter(d => d.price_estimate !== null && d.price_estimate > budgetEur * 1.1);
    if (over.length === 0) return '';
    const lines = over.map(d => `- **${d.name}** : environ **${d.price_estimate!.toLocaleString('fr-FR')} €** (vols + hôtel pour 2, estimation) pour ${budgetEur.toLocaleString('fr-FR')} € annoncés`);
    return `\n\n**À noter sur le budget** : d'après nos estimations, ${budgetEur.toLocaleString('fr-FR')} € risque d'être juste pour :\n${lines.join('\n')}`;
}

// Sans compte : 5 recherches par mois, comptées dans un cookie (c'est l'offre affichée
// sur /pricing). Avec un compte gratuit : pas de limite pendant la bêta.

const QUOTA_COOKIE = 'aivana_q';

function readQuota(request: Request): { month: string; used: number } {
    const month = new Date().toISOString().slice(0, 7);
    const raw = request.headers.get('cookie')?.match(new RegExp(`${QUOTA_COOKIE}=([^;]+)`))?.[1];
    const [m, n] = decodeURIComponent(raw || '').split(':');
    return { month, used: m === month ? Number(n) || 0 : 0 };
}

async function getUserSafely() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
    try {
        const { data: { user } } = await createClient().auth.getUser();
        return user;
    } catch {
        return null;
    }
}

export async function POST(request: Request) {
    const user = await getUserSafely();
    const quota = readQuota(request);

    if (!user && quota.used >= FREE_SEARCHES_PER_MONTH) {
        return NextResponse.json({
            error: `Vous avez utilisé vos ${FREE_SEARCHES_PER_MONTH} recherches gratuites de ce mois. Créez un compte gratuit pour continuer sans limite.`,
            limitReached: true,
            remaining: 0,
        }, { status: 429 });
    }

    try {
        const body = await request.json();
        const validatedData = chatRequestSchema.parse(body);

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

        const completion = await getGroqChatCompletion(messagesWithSystem, "openai/gpt-oss-20b", 2000, true);
        const responseText = completion.choices[0]?.message?.content || "{}";

        let assistantMessage = "";
        let draftDestinations: DraftDestination[] = [];
        let originCity = "Paris";
        let budgetEur: number | null = null;
        let travelDate: string | null = null;

        try {
            // extractJsonFromText : le modèle peut entourer son JSON de texte ou de balises
            // markdown quand response_format n'est pas accepté (voir lib/ai/groq.ts).
            const parsed = JSON.parse(extractJsonFromText(responseText));
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
            assistantMessage = responseText;
        }

        const toGround = draftDestinations.slice(0, MAX_DESTINATIONS_TO_GROUND);
        const grounded = await Promise.all(toGround.map(d => groundDestination(d, originCity, travelDate)));

        if (grounded.some(d => d.price_estimate !== null)) {
            assistantMessage += `

_Totaux estimés à partir de notre catalogue : vérifiez le prix du jour chez la compagnie et l'hôtel avant de réserver._`;
        }

        if (originCity === "Paris" && grounded.length > 0) {
            const userMentionedParis = JSON.stringify(validatedData.messages).toLowerCase().includes('paris');
            if (!userMentionedParis) {
                assistantMessage += `\n\n_Estimation calculée au départ de Paris — précise ta ville de départ pour des prix de vol exacts._`;
            }
        }

        assistantMessage += buildBudgetNote(budgetEur, grounded);

        const res = NextResponse.json({
            role: 'assistant',
            content: assistantMessage,
            enriched: grounded,
            // null = illimité (compte connecté)
            remaining: user ? null : FREE_SEARCHES_PER_MONTH - quota.used - 1,
        });
        if (!user) {
            res.cookies.set(QUOTA_COOKIE, `${quota.month}:${quota.used + 1}`, {
                path: '/', maxAge: 60 * 60 * 24 * 40, sameSite: 'lax', httpOnly: true,
            });
        }
        return res;
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation Error', details: err.issues }, { status: 400 });
        }
        console.error("Chat API Error:", err);
        return NextResponse.json({ error: (err as Error).message || 'Internal Server Error' }, { status: 500 });
    }
}
