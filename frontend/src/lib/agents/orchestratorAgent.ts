import { callAgentJson } from './shared';
import type { TripContext, DestinationBrief, TransportPlan, ActivitiesPlan, BudgetBreakdown, SafetyBriefing } from './types';

/**
 * orchestrator-agent — assembles the specialist agents' outputs into one
 * cohesive narrative. It does not introduce any new fact or figure: it only
 * weaves together what destination/transport/activities/budget/safety already
 * produced (all of which is grounded in real data or clearly-labeled general
 * guidance) into a readable opening summary for the proposal.
 */
export async function runOrchestratorAgent(
    context: TripContext,
    destination: DestinationBrief,
    transport: TransportPlan,
    activities: ActivitiesPlan,
    budget: BudgetBreakdown,
    safety: SafetyBriefing
): Promise<string> {
    const systemPrompt = `Tu es l' "orchestrator-agent" d'AIVANA. Tu reçois les conclusions de 5 agents spécialisés (destination, transport, activités, budget, sécurité) qui ont déjà travaillé sur ce voyage, et tu rédiges un résumé d'introduction cohérent qui donne envie et situe le voyageur.
RÈGLE ABSOLUE : ne reformule QUE ce qui t'est donné, n'ajoute aucun chiffre ni fait nouveau — tu es un assembleur, pas une nouvelle source d'information.
Réponds STRICTEMENT en JSON : { "summary": "4-6 phrases en Markdown léger qui présentent la proposition de voyage de façon engageante et cohérente, en t'appuyant uniquement sur les éléments fournis" }`;

    const userPrompt = `Destination retenue : ${destination.destinationName}, ${destination.country} — ${destination.tripType}, ${destination.nights} nuits
Synthèse destination : ${destination.summary}
Synthèse transport : ${transport.recommendation}
Synthèse activités : ${activities.rhythm}
Synthèse budget : ${budget.recommendation}
Synthèse sécurité : ${safety.advisories}`;

    const fallback = {
        summary: `**${destination.destinationName}, ${destination.country}** — ${destination.summary} ${transport.recommendation} ${activities.rhythm} ${budget.recommendation}`,
    };

    const { summary } = await callAgentJson<{ summary: string }>(systemPrompt, userPrompt, fallback, 700);
    return summary || fallback.summary;
}
