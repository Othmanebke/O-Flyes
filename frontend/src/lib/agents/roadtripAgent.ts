import { getGroqChatCompletion } from '../ai/groq';
import type { TripContext } from './types';
import type { RoadtripProposal } from '@/types/roadtrip';

export async function runRoadtripAgent(context: TripContext): Promise<RoadtripProposal> {
    const prompt = `
Tu es un agent expert mondial en création d'itinéraires de voyage et de roadtrips.
L'utilisateur souhaite un roadtrip mémorable, réaliste et chiffré.
Destination de base ciblée par l'utilisateur : ${context.destinationName} ${context.country ? `(${context.country})` : ''}.
Ville d'origine : ${context.originCity}.
Nombre de voyageurs : ${context.travelers}.
Préférences de l'utilisateur : ${context.preferences || 'Aventure, découverte, incontournables'}.

Instructions :
- Génère un itinéraire de roadtrip multi-étapes très logique, ambitieux et hyper réaliste.
- Si la destination s'y prête (ex: Grèce, Thaïlande, Europe de l'Est), n'hésite SURTOUT PAS à proposer un roadtrip multi-pays (ex: Grèce -> Turquie -> Chypre, ou Thaïlande -> Malaisie). L'itinéraire doit être une vraie aventure.
- Pour chaque étape, fournis une estimation RÉALISTE du coût (transport, logement basique et activités) dans la devise locale ou en EUR (ex: "Environ 150€ / pers"). Sers-toi de tes connaissances pour donner de vrais prix de marché.
- Précise le moyen de transport exact et son prix estimé (ex: "Ferry rapide (60€)", "Vol interne AirAsia (45€)").
- REPONDS UNIQUEMENT AVEC DU JSON VALIDE.

Le JSON doit ABSOLUMENT respecter ce format exact :
{
    "title": "Titre accrocheur du roadtrip (ex: Odyssée en mer Égée : Grèce, Turquie & Chypre)",
    "summary": "Résumé du concept de ce roadtrip, pourquoi c'est génial, et l'estimation du budget global.",
    "totalDays": 14,
    "steps": [
        {
            "dayRange": "Jour 1 à 3",
            "locationName": "Athènes",
            "country": "Grèce",
            "description": "Description de l'ambiance et de ce qu'on y fait.",
            "transportToNext": "Ferry vers Izmir (Turquie) - env. 80€",
            "estimatedCost": "120€ / jour / pers.",
            "activities": ["Visite de l'Acropole (20€)", "Dîner typique à Plaka (25€)"]
        }
    ]
}
`;

    const messages = [
        { role: 'system' as const, content: 'You are a helpful travel assistant that outputs JSON only.' },
        { role: 'user' as const, content: prompt }
    ];

    const response = await getGroqChatCompletion(messages, "qwen/qwen3.6-27b", 3000, true);
    
    // le mode JSON de Groq garantit pas toujours un JSON valide si le texte est tronqué
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
