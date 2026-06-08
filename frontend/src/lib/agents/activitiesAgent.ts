import { callAgentJson } from './shared';
import { searchRealActivities } from '@/lib/travel/opentripmap';
import type { TripContext, DestinationBrief, ActivitiesPlan, ActivityPlanDay } from './types';

const VALID_PERIODS = ['Matin', 'Après-midi', 'Soir'] as const;

/**
 * activities-agent — proposes activities and a day-by-day rhythm.
 * Real place names come from OpenTripMap; the LLM only organizes them into an
 * itinerary (day, period, pacing). Any item the LLM returns that doesn't match
 * a real place name supplied to it is dropped — it must never introduce a
 * fictitious activity into the plan.
 */
export async function runActivitiesAgent(context: TripContext, brief: DestinationBrief): Promise<ActivitiesPlan> {
    const realActivities = await searchRealActivities(brief.destinationName, 12);

    if (!realActivities || realActivities.length === 0) {
        return {
            dataAvailable: false,
            rhythm: `Aucune activité réelle n'a pu être récupérée pour ${brief.destinationName} à l'instant. Plutôt que d'inventer un programme, je te recommande de consulter les activités disponibles directement dans l'onglet "Activités" une fois la connexion rétablie.`,
            days: [],
        };
    }

    const realNames = new Set(realActivities.map(a => a.title));
    const dayCount = Math.max(2, Math.min(brief.nights, 10));

    const systemPrompt = `Tu es l' "activities-agent" d'AIVANA. Tu reçois une liste RÉELLE de lieux/activités à ${brief.destinationName} (avec leur catégorie) et tu dois construire un rythme de séjour sur ${dayCount} jours, en répartissant ces activités par journée et par moment (Matin / Après-midi / Soir).
RÈGLE ABSOLUE : utilise UNIQUEMENT les noms exacts fournis dans la liste. N'invente aucun lieu, aucune activité, aucun nom. Tu peux laisser des moments libres ("Repos / temps libre") si besoin pour garder un bon rythme.
Adapte le rythme au profil : priorités = ${brief.priorities.join(', ')}, ambiance = ${brief.ambiance}.
Réponds STRICTEMENT en JSON :
{
  "rhythm": "2-3 phrases décrivant le rythme global proposé (intense / posé / mixte) et pourquoi",
  "days": [
    { "day": 1, "theme": "Titre court de la journée", "items": [ { "name": "nom EXACT de la liste", "category": "catégorie fournie", "period": "Matin" } ] }
  ]
}`;

    const userPrompt = `Lieux et activités réels disponibles à ${brief.destinationName} :
${realActivities.map((a, i) => `${i + 1}. ${a.title} (catégorie : ${a.category}, note : ${a.rating}/5)`).join('\n')}`;

    const fallbackDays: ActivityPlanDay[] = Array.from({ length: dayCount }).map((_, i) => ({
        day: i + 1,
        theme: i === 0 ? 'Premiers pas dans la ville' : `Journée ${i + 1}`,
        items: realActivities.slice(i * 2, i * 2 + 2).map((a, j) => ({
            name: a.title,
            category: a.category,
            period: (j === 0 ? 'Matin' : 'Après-midi') as ActivityPlanDay['items'][number]['period'],
        })),
    }));
    const fallback = {
        rhythm: `Un rythme équilibré entre découvertes incontournables et temps libre, réparti sur ${dayCount} jours.`,
        days: fallbackDays,
    };

    const result = await callAgentJson<{ rhythm: string; days: ActivityPlanDay[] }>(systemPrompt, userPrompt, fallback, 1800);

    // Defensive filtering: drop any item whose name isn't one of the real places we supplied
    const cleanDays: ActivityPlanDay[] = (Array.isArray(result.days) ? result.days : fallback.days)
        .slice(0, dayCount)
        .map(d => ({
            day: d.day,
            theme: d.theme || `Journée ${d.day}`,
            items: (Array.isArray(d.items) ? d.items : [])
                .filter(item => realNames.has(item?.name))
                .map(item => ({
                    name: item.name,
                    category: item.category,
                    period: VALID_PERIODS.includes(item.period) ? item.period : 'Matin',
                })),
        }));

    return {
        dataAvailable: true,
        rhythm: result.rhythm || fallback.rhythm,
        days: cleanDays,
    };
}
