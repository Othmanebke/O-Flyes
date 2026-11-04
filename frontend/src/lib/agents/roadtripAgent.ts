import { getGroqChatCompletion } from '../ai/groq';
import { extractJsonFromText } from '../ai/json';
import type { TripContext } from './types';
import type { RoadtripProposal, RoadtripStep } from '@/types/roadtrip';

const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v.trim() : fallback);

// Le modèle oublie parfois un champ : on garde une forme toujours affichable.
function normalize(raw: unknown, days: number): RoadtripProposal {
    const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const steps: RoadtripStep[] = (Array.isArray(r.steps) ? r.steps : [])
        .filter((s): s is Record<string, unknown> => !!s && typeof s === 'object')
        .map(s => ({
            dayRange: str(s.dayRange, 'Étape'),
            locationName: str(s.locationName),
            country: str(s.country),
            description: str(s.description),
            transportToNext: str(s.transportToNext) || undefined,
            estimatedCost: str(s.estimatedCost) || undefined,
            activities: (Array.isArray(s.activities) ? s.activities : []).map(a => str(a)).filter(Boolean),
        }))
        .filter(s => s.description || s.activities.length);
    if (!steps.length) throw new Error("L'itinéraire reçu est vide.");
    return {
        title: str(r.title, 'Votre itinéraire'),
        summary: str(r.summary),
        totalDays: typeof r.totalDays === 'number' ? r.totalDays : days,
        steps,
        generatedAt: new Date().toISOString(),
    };
}

export async function runRoadtripAgent(context: TripContext): Promise<RoadtripProposal> {
    const days = context.startDate && context.endDate
        ? Math.max(1, Math.round((Date.parse(context.endDate) - Date.parse(context.startDate)) / 86400000) + 1)
        : 7;
    const dates = context.startDate && context.endDate ? `du ${context.startDate} au ${context.endDate}` : `${days} jours`;

    const prompt = `Prépare un itinéraire jour par jour, réaliste et concret, pour ce voyage :
- Destination : ${context.destinationName}${context.country ? ` (${context.country})` : ''}
- Dates : ${dates} (${days} jours, jour d'arrivée et jour de départ compris)
- Départ de : ${context.originCity}
- Voyageurs : ${context.travelers}
${context.budgetEur ? `- Budget total : ${context.budgetEur} €\n` : ''}${context.booked?.length ? `- Déjà prévu : ${context.booked.join(' ; ')}\n` : ''}${context.preferences ? `- Envies : ${context.preferences}\n` : ''}
Règles :
- Reste dans la destination et ses environs proches (excursions d'une journée possibles). Pas de roadtrip dans d'autres pays.
- Une étape par jour, ou par groupe de 2 jours si le séjour dépasse 8 jours. Le jour 1 tient compte de l'arrivée, le dernier jour du départ.
- 2 à 4 activités par étape, avec un prix indicatif quand c'est payant (ex. "Musée national (12 €)").
- Descriptions courtes : 2 phrases maximum.
- Prix en euros, réalistes pour le pays.
Réponds UNIQUEMENT avec ce JSON :
{"title":"...","summary":"2 phrases avec l'esprit du séjour et un ordre de grandeur du budget sur place","totalDays":${days},"steps":[{"dayRange":"Jour 1","locationName":"quartier ou lieu","country":"pays","description":"...","transportToNext":"comment se déplacer ce jour-là (facultatif)","estimatedCost":"ex. 60 € / pers.","activities":["...","..."]}]}`;

    const messages = [
        { role: 'system' as const, content: 'Tu es un expert en organisation de voyages. Tu réponds uniquement en JSON valide, en français.' },
        { role: 'user' as const, content: prompt },
    ];

    // Marge large : le modèle « réfléchit » avant de répondre et ces jetons comptent aussi
    const call = (json: boolean) => getGroqChatCompletion(messages, 'openai/gpt-oss-20b', 7000, json, 60000);

    let response = await call(true);
    let content: string = response.choices?.[0]?.message?.content || '';
    // Réponse coupée (limite atteinte) ou JSON illisible : un second essai sans le mode JSON strict
    if (response.choices?.[0]?.finish_reason === 'length' || !content.trim()) {
        response = await call(false);
        content = response.choices?.[0]?.message?.content || '';
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(extractJsonFromText(content));
    } catch {
        throw new Error("Le copilote n'a pas renvoyé un itinéraire lisible. Réessayez.");
    }
    return normalize(parsed, days);
}
