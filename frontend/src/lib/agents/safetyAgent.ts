import { callAgentJson } from './shared';
import type { TripContext, DestinationBrief, SafetyBriefing } from './types';

/**
 * safety-agent — general risk/visa/health/climate guidance for the destination.
 * There is no connected real-time travel-advisory feed (no API for that here),
 * so this agent is explicitly framed as general background knowledge with a
 * mandatory disclaimer pointing to official sources — never presented as a
 * live safety feed.
 */
export async function runSafetyAgent(context: TripContext, brief: DestinationBrief): Promise<SafetyBriefing> {
    const systemPrompt = `Tu es le "safety-agent" d'AIVANA. Tu donnes un éclairage général (pas en temps réel) sur les points de vigilance pour un voyage à ${brief.destinationName}, ${brief.country}, pour des voyageurs au départ de ${context.originCity}.
Couvre : conditions d'entrée/visa généralement attendues pour des voyageurs français, recommandations sanitaires usuelles (vaccins, eau, etc.), climat à la période envisagée, et points de vigilance générale (zones à éviter, arnaques courantes, etc.).
RÈGLE ABSOLUE : précise que ce sont des informations générales et qu'elles doivent être vérifiées sur les sources officielles avant le départ — ne prétends jamais détenir une information à jour en temps réel.
Réponds STRICTEMENT en JSON :
{
  "visa": "1-2 phrases sur les conditions d'entrée généralement attendues",
  "health": "1-2 phrases sur les recommandations sanitaires usuelles",
  "climate": "1-2 phrases sur le climat à prévoir pour ce type de séjour",
  "advisories": "1-2 phrases sur les points de vigilance générale"
}`;

    const userPrompt = `Destination : ${brief.destinationName}, ${brief.country}
Période envisagée : ${context.startDate || 'non définie'} → ${context.endDate || 'non définie'}
Type de voyage : ${brief.tripType}`;

    const fallback: Omit<SafetyBriefing, 'disclaimer'> = {
        visa: `Vérifie les conditions d'entrée à jour pour ${brief.country} sur le site France Diplomatie avant de réserver.`,
        health: `Renseigne-toi sur les recommandations vaccinales et sanitaires pour ${brief.country} auprès d'un centre de vaccination international.`,
        climate: `Consulte les prévisions climatiques saisonnières pour ${brief.destinationName} afin d'adapter tes bagages et activités.`,
        advisories: `Consulte les conseils aux voyageurs officiels pour connaître les zones de vigilance à ${brief.destinationName} au moment de ton départ.`,
    };

    const result = await callAgentJson<Omit<SafetyBriefing, 'disclaimer'>>(systemPrompt, userPrompt, fallback, 700);

    return {
        visa: result.visa || fallback.visa,
        health: result.health || fallback.health,
        climate: result.climate || fallback.climate,
        advisories: result.advisories || fallback.advisories,
        disclaimer: "Informations générales données à titre indicatif (non temps réel) — vérifie toujours les conditions d'entrée, sanitaires et de sécurité sur les sources officielles (France Diplomatie, OMS, ambassade) avant de partir.",
    };
}
