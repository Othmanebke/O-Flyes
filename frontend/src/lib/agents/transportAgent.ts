import { callAgentJson } from './shared';
import { getIATA, skyscannerFlightUrl } from '@/lib/iata';
import { searchFlights, type RealFlightOffer } from '@/lib/travel/amadeus';
import type { TripContext, DestinationBrief, TransportPlan, FlightOption } from './types';

/**
 * transport-agent — proposes real transport options and recommends one.
 * The numeric data (price, duration, stops...) comes straight from Amadeus;
 * the LLM is only asked to pick and justify a recommendation in natural language —
 * it never gets to invent or alter a number.
 */
export async function runTransportAgent(context: TripContext, brief: DestinationBrief, departDate: string): Promise<TransportPlan> {
    const originCode = getIATA(context.originCity);
    const destCode = getIATA(brief.destinationName);
    const offers = await searchFlights(originCode, destCode, departDate, Math.max(1, context.travelers));

    if (!offers || offers.length === 0) {
        return {
            dataAvailable: false,
            recommendation: `Aucune donnée de vol en temps réel n'a pu être récupérée pour ${context.originCity} → ${brief.destinationName} à l'instant. Plutôt que d'estimer un prix au hasard, je te conseille de vérifier directement sur un comparateur de vols pour ces dates.`,
            options: [],
        };
    }

    const options: FlightOption[] = offers
        .slice()
        .sort((a, b) => a.price - b.price)
        .slice(0, 4)
        .map((o: RealFlightOffer) => ({
            airline: o.airline,
            price: o.price,
            currency: o.currency,
            duration: o.duration,
            stops: o.stops,
            departure: o.departure,
            arrival: o.arrival,
            bookingUrl: skyscannerFlightUrl({ origin: context.originCity, destination: brief.destinationName, depart: departDate, adults: context.travelers }),
        }));

    const systemPrompt = `Tu es le "transport-agent" d'AIVANA. Tu reçois une liste RÉELLE d'options de vol (prix, durée, escales) et tu dois recommander la meilleure option pour ce voyageur précis, en justifiant ton choix (rapport prix/confort/durée selon le contexte du voyage).
RÈGLE ABSOLUE : ne cite que les chiffres fournis dans la liste, n'en invente aucun. Ne mentionne aucune compagnie ou prix qui ne figure pas dans la liste.
Réponds STRICTEMENT en JSON : { "recommendation": "2-4 phrases recommandant une option précise de la liste et expliquant pourquoi" }`;

    const userPrompt = `Trajet : ${context.originCity} → ${brief.destinationName}, ${context.travelers} voyageur(s), type de voyage : ${brief.tripType} (${brief.nights} nuits).
Options réelles disponibles (triées par prix croissant) :
${options.map((o, i) => `${i + 1}. ${o.airline} — ${o.price} ${o.currency} — ${o.duration} — ${o.stops === 0 ? 'vol direct' : `${o.stops} escale(s)`} — départ ${o.departure}`).join('\n')}`;

    const fallback = { recommendation: `L'option la plus économique est ${options[0].airline} à ${options[0].price} ${options[0].currency} (${options[0].stops === 0 ? 'vol direct' : `${options[0].stops} escale(s)`}, ${options[0].duration}).` };
    const { recommendation } = await callAgentJson<{ recommendation: string }>(systemPrompt, userPrompt, fallback, 500);

    return { dataAvailable: true, recommendation: recommendation || fallback.recommendation, options };
}
