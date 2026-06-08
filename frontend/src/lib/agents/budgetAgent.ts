import { callAgentJson } from './shared';
import { searchHotelOffers } from '@/lib/travel/amadeus';
import type { TripContext, DestinationBrief, TransportPlan, BudgetBreakdown } from './types';

/**
 * budget-agent — assembles real costs (flights from transport-agent, lodging
 * fetched here) into a breakdown, compares it to the stated budget, and asks
 * the LLM only for the narrative trade-off advice — every number it sees and
 * must reuse verbatim is real, fetched from Amadeus.
 */
export async function runBudgetAgent(
    context: TripContext,
    brief: DestinationBrief,
    transport: TransportPlan,
    checkin: string,
    checkout: string
): Promise<BudgetBreakdown> {
    const adults = Math.max(1, context.travelers);
    const hotels = await searchHotelOffers(brief.destinationName, checkin, checkout, adults);

    const cheapestFlight = transport.dataAvailable && transport.options.length > 0
        ? Math.min(...transport.options.map(o => o.price))
        : null;
    const cheapestHotelPerNight = hotels && hotels.length > 0
        ? Math.min(...hotels.map(h => h.pricePerNight))
        : null;

    const flightTotal = cheapestFlight !== null ? Math.round(cheapestFlight * 2) : null;
    const lodgingTotal = cheapestHotelPerNight !== null ? Math.round(cheapestHotelPerNight * brief.nights) : null;
    const grandTotal = flightTotal !== null && lodgingTotal !== null ? flightTotal + lodgingTotal : null;
    const dataAvailable = grandTotal !== null;

    let verdict: BudgetBreakdown['verdict'] = 'unknown';
    if (grandTotal !== null && context.budgetEur) {
        verdict = grandTotal > context.budgetEur * 1.1 ? 'over' : 'within';
    }

    if (!dataAvailable) {
        return {
            dataAvailable: false,
            flightTotal,
            lodgingTotal,
            activitiesEstimate: null,
            grandTotal: null,
            statedBudget: context.budgetEur,
            verdict: 'unknown',
            recommendation: `Les prix réels en temps réel n'ont pas pu être récupérés pour ${brief.destinationName} à l'instant — pas d'estimation chiffrée affichée pour éviter d'annoncer un budget peu fiable. Réessaie la génération dans un instant.`,
        };
    }

    const systemPrompt = `Tu es le "budget-agent" d'AIVANA. Tu reçois des chiffres RÉELS (vol + hébergement) et le budget annoncé par le voyageur. Donne un avis sur l'adéquation budget/coûts réels et propose des arbitrages concrets si besoin (changer de période, réduire le nombre de nuits, viser une catégorie d'hôtel différente, etc.).
RÈGLE ABSOLUE : reprends EXACTEMENT les montants fournis, n'en invente ni n'en modifie aucun.
Réponds STRICTEMENT en JSON : { "recommendation": "3-5 phrases d'analyse et de conseils concrets et chiffrés à partir des montants fournis" }`;

    const userPrompt = `Destination : ${brief.destinationName}, ${brief.nights} nuits, ${adults} voyageur(s).
Coût de vol (aller-retour, estimation à partir du prix réel le moins cher) : ${flightTotal} €
Coût d'hébergement (${brief.nights} nuits au tarif réel le moins cher trouvé) : ${lodgingTotal} €
Total réel estimé (vol + hôtel) : ${grandTotal} €
Budget annoncé par le voyageur : ${context.budgetEur ? `${context.budgetEur} €` : 'non précisé'}
Verdict calculé : ${verdict === 'over' ? 'le total dépasse le budget annoncé' : verdict === 'within' ? 'le total rentre dans le budget annoncé' : 'pas de budget annoncé pour comparer'}`;

    const fallback = {
        recommendation: verdict === 'over'
            ? `Le total réel estimé (${grandTotal} €) dépasse le budget annoncé de ${context.budgetEur} €. Pour rentrer dans l'enveloppe, tu peux par exemple raccourcir le séjour, viser une période hors haute saison, ou choisir un hébergement plus économique.`
            : `Le total réel estimé (${grandTotal} €) reste cohérent avec le budget annoncé${context.budgetEur ? ` de ${context.budgetEur} €` : ''}. Garde une marge pour les repas, transports locaux et activités sur place.`,
    };
    const { recommendation } = await callAgentJson<{ recommendation: string }>(systemPrompt, userPrompt, fallback, 500);

    return {
        dataAvailable: true,
        flightTotal,
        lodgingTotal,
        activitiesEstimate: null,
        grandTotal,
        statedBudget: context.budgetEur,
        verdict,
        recommendation: recommendation || fallback.recommendation,
    };
}
