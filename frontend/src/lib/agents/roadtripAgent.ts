import { getGroqChatCompletion } from '../ai/groq';
import type { TripContext } from './types';

export interface RoadtripStep {
    dayRange: string;
    locationName: string;
    country: string;
    description: string;
    transportToNext?: string;
    activities: string[];
}

export interface RoadtripProposal {
    title: string;
    summary: string;
    totalDays: number;
    steps: RoadtripStep[];
    generatedAt?: string;
}

export async function runRoadtripAgent(context: TripContext): Promise<RoadtripProposal> {
    const prompt = `
Tu es un agent expert mondial en création d'itinéraires de voyage et de roadtrips.
L'utilisateur souhaite un roadtrip mémorable.
Destination de base ciblée par l'utilisateur : ${context.destinationName} ${context.country ? `(${context.country})` : ''}.
Ville d'origine : ${context.originCity}.
Nombre de voyageurs : ${context.travelers}.
Préférences de l'utilisateur : ${context.preferences || 'Aventure, découverte, incontournables'}.

Instructions :
- Génère un itinéraire de roadtrip multi-étapes très logique et réaliste.
- Si la destination de base est très connue pour des roadtrips (ex: Thaïlande), n'hésite pas à faire un parcours emblématique (ex: Nord vers le Sud) ou même traverser des frontières (ex: Thaïlande vers Malaisie) si ça a du sens.
- Sois inspirant, concret et professionnel.
- Ne propose pas de prix inventés, concentre-toi sur l'itinéraire, les transports et les activités.
- REPONDS UNIQUEMENT AVEC DU JSON VALIDE.

Le JSON doit ABSOLUMENT respecter ce format exact :
{
    "title": "Titre accrocheur du roadtrip",
    "summary": "Résumé du concept de ce roadtrip et pourquoi il est génial",
    "totalDays": 10,
    "steps": [
        {
            "dayRange": "Jour 1 à 3",
            "locationName": "Nom de la ville ou région étape",
            "country": "Pays de cette étape",
            "description": "Description de l'ambiance et de ce qu'on y fait",
            "transportToNext": "Train de nuit (12h)",
            "activities": ["Activité 1", "Activité 2"]
        }
    ]
}
`;

    const messages = [
        { role: 'system' as const, content: 'You are a helpful travel assistant that outputs JSON only.' },
        { role: 'user' as const, content: prompt }
    ];

    const response = await getGroqChatCompletion(messages, "llama-3.3-70b-versatile", 3000, true);
    
    let parsed: any;
    try {
        parsed = JSON.parse(response.choices[0].message.content);
    } catch (e) {
        throw new Error("Failed to parse JSON from AI response");
    }

    return {
        ...parsed,
        generatedAt: new Date().toISOString()
    };
}
