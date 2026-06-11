import { getGroqChatCompletion } from '../ai/groq';
import type { TripContext } from './types';
import type { RoadtripProposal } from '@/types/roadtrip';

// Contrairement à api/chat/route.ts, pas de grounding ici : les coûts par étape
// (estimatedCost) viennent directement du LLM, à prendre comme un ordre de grandeur
// et non comme un prix Amadeus réel.
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

    const response = await getGroqChatCompletion(messages, "llama-3.3-70b-versatile", 3000, true);
    
    // Le mode JSON de Groq garantit en théorie un JSON valide, mais on parse quand
    // même dans un try/catch au cas où le modèle renverrait du texte tronqué.
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
