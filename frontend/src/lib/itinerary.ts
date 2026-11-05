// Transforme l'itinéraire proposé par le copilote en éléments du carnet :
// une activité par ligne, rangée au bon jour, avec son prix estimé pour le groupe.
import type { RoadtripProposal } from "@/types/roadtrip";
import { addDays, nightsBetween, type Plan, type PlanItem } from "@/lib/plan";

/* « Musée national (12 €) » → { title: "Musée national", perPerson: 12 }
   « Plage de Cascais (gratuit) » → 0 ; « Dîner (20-30 €) » → 25 ; sans prix → null */
export function parseActivity(text: string): { title: string; perPerson: number | null } {
  const t = text.trim();
  const paren = t.match(/\(([^)]*)\)\s*$/);
  const inside = paren ? paren[1] : t;
  const title = (paren ? t.slice(0, paren.index) : t).replace(/[\s:–-]+$/, "").trim() || t;
  if (/gratuit|free|libre/i.test(inside)) return { title, perPerson: 0 };
  const nums = Array.from(inside.matchAll(/(\d+(?:[.,]\d+)?)\s*(?:[-–à]\s*(\d+(?:[.,]\d+)?)\s*)?(?:€|eur)/gi))[0];
  if (!nums) return { title, perPerson: null };
  const a = parseFloat(nums[1].replace(",", "."));
  const b = nums[2] ? parseFloat(nums[2].replace(",", ".")) : a;
  return { title, perPerson: Math.round((a + b) / 2) };
}

/* « Jour 3 » → 3 ; « Jour 3 à 4 » ou « Jours 3-4 » → 3 (premier jour de l'étape) */
export function firstDay(dayRange: string): number | null {
  const m = dayRange.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

export const aiKey = (tripId: string, step: number, act: number) => `ai:${tripId}:${step}:${act}`;

export function proposalItems(
  proposal: RoadtripProposal,
  plan: Plan,
  tripId: string,
): { step: number; items: PlanItem[] }[] {
  const lastDay = nightsBetween(plan.depart, plan.ret) + 1;
  return proposal.steps.map((s, i) => {
    const day = firstDay(s.dayRange);
    const date = day && day >= 1 && day <= lastDay ? addDays(plan.depart, day - 1) : undefined;
    return {
      step: i,
      items: (s.activities || []).map((text, j) => {
        const { title, perPerson } = parseActivity(text);
        return {
          key: aiKey(tripId, i, j),
          type: "activity" as const,
          title,
          subtitle: `Proposé par le copilote${s.locationName ? ` · ${s.locationName}` : ""}`,
          price: perPerson == null ? null : perPerson * plan.travelers,
          estimated: true,
          provider: "Copilote AIVANA",
          date,
        };
      }),
    };
  });
}

/* Sélection qui tient dans le budget restant : d'abord le gratuit, puis le moins cher.
   Les activités sans prix connu ne sont pas ajoutées automatiquement. */
export function fitToBudget(items: PlanItem[], remaining: number): PlanItem[] {
  const free = items.filter(i => i.price === 0);
  const paid = items.filter(i => (i.price ?? 0) > 0).sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  const kept: PlanItem[] = [...free];
  let left = remaining;
  for (const i of paid) {
    if ((i.price ?? 0) > left) continue;
    kept.push(i);
    left -= i.price ?? 0;
  }
  return kept;
}
