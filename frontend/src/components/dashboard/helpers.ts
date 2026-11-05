// Fonctions utilitaires du carnet : conversion des données serveur, export calendrier (.ics),
// partage public du voyage.
import axios from "axios";
import { BedDouble, Plane, Ticket } from "lucide-react";
import { shortTitle } from "@/lib/trip-format";
import { findDestination } from "@/lib/catalog";
import { isPhotoKey, photoFor, type PhotoKey } from "@/lib/photos";
import { toast, tripName, updatePlan, type Plan, type PlanItem } from "@/lib/plan";
import type { Booking } from "@/types/trip";

export const ICON = { flight: Plane, hotel: BedDouble, activity: Ticket };
export const COLORS = { flight: "#0F1B2D", hotel: "#C9A24B", activity: "#2E7650" };

export const toPlanItem = (b: Booking): PlanItem => ({
  key: (b.metadata?.key as string) || `srv:${b.id}`,
  type: (["flight", "hotel", "activity"].includes(b.type) ? b.type : "activity") as PlanItem["type"],
  title: b.title,
  subtitle: b.metadata?.subtitle as string | undefined,
  price: b.price_estimate ?? null,
  estimated: !!b.metadata?.estimated,
  provider: b.provider,
  url: b.external_url,
  date: b.metadata?.date as string | undefined,
  leg: b.metadata?.leg as PlanItem["leg"],
  booked: !!b.metadata?.booked,
  serverId: b.id,
});

export const photoOf = (name: string): PhotoKey => {
  const code = findDestination(name)?.code;
  return isPhotoKey(code) ? code : photoFor(name);
};

export const daysUntil = (iso: string) => Math.round((new Date(iso + "T12:00:00Z").getTime() - Date.now()) / 86400000);

export function downloadICS(plan: Plan) {
  const d = (iso: string) => iso.replace(/-/g, "");
  const esc = (s: string) => s.replace(/[,;]/g, " ");
  let ics = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//AIVANA//Carnet//FR\r\n";
  ics += `BEGIN:VEVENT\r\nUID:trip-${plan.createdAt}@aivana\r\nSUMMARY:${esc(`Voyage ${plan.destination}`)}\r\nDTSTART;VALUE=DATE:${d(plan.depart)}\r\nDTEND;VALUE=DATE:${d(plan.ret)}\r\nEND:VEVENT\r\n`;
  plan.items.forEach((i, n) => {
    ics += `BEGIN:VEVENT\r\nUID:item-${plan.createdAt}-${n}@aivana\r\nSUMMARY:${esc(shortTitle(i))}\r\nDESCRIPTION:${esc(i.subtitle || "")}\r\nDTSTART;VALUE=DATE:${d(i.date || plan.depart)}\r\nEND:VEVENT\r\n`;
  });
  ics += "END:VCALENDAR";
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `voyage-${plan.destination.toLowerCase().replace(/\W+/g, "-")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export const shareUrl = (id: string) => `${window.location.origin}/voyage/${id}`;

export async function share(plan: Plan) {
  if (!plan.tripId) {
    toast("Sauvegardez d'abord le voyage pour obtenir un lien de partage");
    return;
  }
  try {
    const res = await axios.post(`/api/trips/${plan.tripId}/share`, {
      travelers: plan.travelers,
      budget: plan.budget ?? null,
      name: plan.name ?? null,
    });
    const id = res.data.shareId as string;
    updatePlan({ shareId: id });
    const url = shareUrl(id);
    if (navigator.share) {
      try {
        await navigator.share({ title: `Voyage ${tripName(plan)}`, url });
        return;
      } catch {
        /* partage annulé : on copie */
      }
    }
    await navigator.clipboard.writeText(url);
    toast("Lien du voyage copié", { label: "Ouvrir", href: `/voyage/${id}` });
  } catch (err: unknown) {
    toast(
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Le partage n'a pas pu être activé.",
    );
  }
}

export async function stopSharing(plan: Plan) {
  if (!plan.tripId) return;
  try {
    await axios.delete(`/api/trips/${plan.tripId}/share`);
    updatePlan({ shareId: undefined });
    toast("Lien de partage désactivé");
  } catch {
    toast("Impossible de désactiver le lien.");
  }
}
