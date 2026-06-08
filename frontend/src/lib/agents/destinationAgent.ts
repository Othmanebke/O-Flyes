import { callAgentJson } from './shared';
import type { TripContext, DestinationBrief } from './types';

/**
 * destination-agent — clarifies the type of trip and the traveler's priorities.
 * If the trip already has a fixed destination, it confirms and enriches it
 * (ambiance, trip type, priorities). Otherwise it picks the most relevant one
 * from the traveler's stated wishes. This is the only agent allowed to choose
 * "name"/"country" — every downstream agent treats them as ground truth.
 */
export async function runDestinationAgent(context: TripContext): Promise<DestinationBrief> {
    const systemPrompt = `Tu es le "destination-agent" d'AIVANA, spécialisé dans la clarification du projet de voyage.
Analyse le contexte du voyageur : type de voyage recherché, priorités (culture, détente, aventure, gastronomie...), ambiance souhaitée.
Si une destination est déjà fixée dans le contexte, confirme-la et enrichis-la. Sinon, choisis la destination la plus pertinente selon les envies exprimées.
Réponds STRICTEMENT en JSON avec cette structure (aucun texte autour) :
{
  "tripType": "ex: Citytrip culturel, Farniente plage, Road trip nature...",
  "priorities": ["string", "string"],
  "destinationName": "Nom de ville",
  "country": "Pays",
  "ambiance": "courte description de l'ambiance recherchée",
  "nights": 7,
  "summary": "2-3 phrases expliquant pourquoi cette destination correspond au voyageur"
}`;

    const userPrompt = `Contexte du voyage :
- Titre : ${context.title}
- Destination déjà fixée : ${context.destinationName ? `${context.destinationName}, ${context.country || ''}` : 'aucune — à proposer'}
- Ville de départ : ${context.originCity}
- Dates : ${context.startDate || 'non définies'} → ${context.endDate || 'non définies'}
- Voyageurs : ${context.travelers}
- Budget annoncé : ${context.budgetEur ? `${context.budgetEur} €` : 'non précisé'}
- Envies / préférences exprimées : ${context.preferences || 'aucune information particulière'}`;

    const fallback: DestinationBrief = {
        tripType: 'Découverte',
        priorities: ['Culture', 'Détente'],
        destinationName: context.destinationName || 'Paris',
        country: context.country || 'France',
        ambiance: 'Un mélange équilibré de visites et de moments de détente.',
        nights: 7,
        summary: `Un séjour pensé pour découvrir ${context.destinationName || 'la destination'} à votre rythme.`,
    };

    const result = await callAgentJson<DestinationBrief>(systemPrompt, userPrompt, fallback);

    // Defensive normalization — never let a malformed LLM response break downstream agents
    return {
        tripType: result.tripType || fallback.tripType,
        priorities: Array.isArray(result.priorities) && result.priorities.length > 0 ? result.priorities.slice(0, 5) : fallback.priorities,
        destinationName: result.destinationName || fallback.destinationName,
        country: result.country || fallback.country,
        ambiance: result.ambiance || fallback.ambiance,
        nights: result.nights && result.nights > 0 ? Math.min(Math.round(result.nights), 21) : fallback.nights,
        summary: result.summary || fallback.summary,
    };
}
