import type { PlanItem } from "@/lib/plan";

export const KIND: Record<string, string> = { flight: "Vol", hotel: "Hôtel", activity: "Activité" };

// Titre court : « Vol aller · CDG → LIS » plutôt que le nom de la compagnie
export function shortTitle(i: PlanItem) {
  if (i.type !== "flight") return i.title;
  const route = i.title.split(" · ")[1] || "";
  const leg = i.leg === "return" ? "Vol retour" : i.leg === "outbound" ? "Vol aller" : "Vol aller-retour";
  return route ? `${leg} · ${route}` : leg;
}

export const fmtDay = (
  iso: string,
  opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" },
) => new Date(iso + "T12:00:00Z").toLocaleDateString("fr-FR", opts);
