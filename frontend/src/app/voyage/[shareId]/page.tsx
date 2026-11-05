import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BedDouble, Plane, Ticket } from "lucide-react";
import Photo from "@/components/ui/Photo";
import ArrowPill from "@/components/ui/Pill";
import { createAdminClient } from "@/lib/supabase/admin";
import { eur, findDestination } from "@/lib/catalog";
import { isPhotoKey, photoFor } from "@/lib/photos";

// Page publique en lecture seule d'un voyage partagé (/voyage/<share_id>).
// Lue avec le client serveur : seul un voyage dont le lien est actif est visible.

interface SharedTrip {
  title: string;
  name: string | null;
  start_date: string | null;
  end_date: string | null;
  travelers: number | null;
  budget: number | null;
  items: {
    id: string;
    type: string;
    title: string;
    price_estimate: number | null;
    metadata: { subtitle?: string; date?: string; leg?: string } | null;
  }[];
}

async function load(shareId: string): Promise<SharedTrip | null> {
  if (!/^[0-9a-f-]{36}$/i.test(shareId)) return null;
  const admin = createAdminClient();
  if (!admin) return null;
  const { data: trip } = await admin
    .from("trips")
    .select("id, title, name, start_date, end_date, travelers, budget")
    .eq("share_id", shareId)
    .single();
  if (!trip) return null;
  const { data: items } = await admin
    .from("trip_items")
    .select("id, type, title, price_estimate, metadata")
    .eq("trip_id", trip.id)
    .order("created_at");
  return { ...trip, items: items || [] } as SharedTrip;
}

export async function generateMetadata({ params }: { params: Promise<{ shareId: string }> }): Promise<Metadata> {
  const t = await load((await params).shareId);
  return t ? { title: t.name || `Voyage à ${t.title}`, robots: { index: false } } : { title: "Voyage introuvable" };
}

const ICON: Record<string, typeof Plane> = { flight: Plane, hotel: BedDouble, activity: Ticket };
const day = (iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }) =>
  new Date(iso + "T12:00:00Z").toLocaleDateString("fr-FR", opts);
const short = (title: string, leg?: string) => {
  const route = title.split(" · ")[1];
  if (!leg) return title;
  return `${leg === "return" ? "Vol retour" : leg === "outbound" ? "Vol aller" : "Vol aller-retour"}${route ? ` · ${route}` : ""}`;
};

export default async function SharedTripPage({ params }: { params: Promise<{ shareId: string }> }) {
  const t = await load((await params).shareId);
  if (!t) notFound();

  const cat = findDestination(t.title);
  const photo = isPhotoKey(cat?.code) ? cat!.code : photoFor(t.title);
  const total = t.items.reduce((s, i) => s + (i.price_estimate || 0), 0);
  const nights =
    t.start_date && t.end_date ? Math.round((Date.parse(t.end_date) - Date.parse(t.start_date)) / 86400000) : null;

  // jours du séjour, et ce qui est prévu chaque jour
  const days: { date: string; items: SharedTrip["items"] }[] = [];
  if (t.start_date && nights != null) {
    for (let n = 0; n <= Math.min(nights, 30); n++) {
      const date = new Date(Date.parse(t.start_date + "T12:00:00Z") + n * 86400000).toISOString().slice(0, 10);
      days.push({ date, items: t.items.filter(i => i.metadata?.date === date) });
    }
  }
  const unplaced = t.items.filter(i => !days.some(d => d.date === i.metadata?.date));

  return (
    <div className="mx-auto flex max-w-[1000px] flex-col gap-6 px-5 pb-24 pt-6">
      <section className="relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-[28px] bg-ink-2 p-6 text-white">
        <Photo k={photo} priority sizes="1000px" className="absolute inset-0" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(8,14,26,0.82) 0%, rgba(8,14,26,0.1) 70%)" }}
        />
        <div className="relative flex flex-col gap-2">
          <span className="self-start rounded-full bg-gold-soft px-3 py-1 text-xs font-bold text-ink">
            Voyage partagé
          </span>
          <h1 className="m-0 text-[clamp(36px,6vw,64px)] font-extrabold leading-[0.95] tracking-[-0.05em] text-white">
            {t.name || t.title}
          </h1>
          <span className="text-[15px] font-semibold text-white/90">
            {[
              t.name && t.title,
              t.start_date &&
                t.end_date &&
                `${day(t.start_date, { day: "numeric", month: "long" })} – ${day(t.end_date, { day: "numeric", month: "long", year: "numeric" })}`,
              t.travelers && `${t.travelers} voyageur${t.travelers > 1 ? "s" : ""}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </div>
      </section>

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))]">
        {[
          ["Total estimé", eur(total)],
          ...(t.budget ? [["Budget prévu", eur(t.budget)]] : []),
          ...(nights != null ? [["Durée", `${nights} nuit${nights > 1 ? "s" : ""}`]] : []),
          ["Éléments", String(t.items.length)],
        ].map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1 rounded-[20px] border border-line bg-white p-4">
            <span className="text-[13px] font-semibold text-muted">{k}</span>
            <span className="text-2xl font-extrabold tracking-[-0.03em]">{v}</span>
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-3 rounded-[24px] border border-line bg-white p-5">
        <h2 className="m-0 text-[17px] font-extrabold">Programme</h2>
        {days.length ? (
          days.map((d, n) => (
            <div
              key={d.date}
              className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 border-b border-line pb-3 last:border-0"
            >
              <span className="text-[13px] font-bold text-muted">
                Jour {n + 1}
                <br />
                <span className="font-semibold">
                  {day(d.date, { weekday: "short", day: "numeric", month: "short" })}
                </span>
              </span>
              <span className="flex flex-col gap-1.5">
                {d.items.length ? (
                  d.items.map(i => {
                    const Icon = ICON[i.type] || Ticket;
                    return (
                      <span key={i.id} className="flex items-center gap-2 text-sm">
                        <Icon className="h-4 w-4 shrink-0 text-gold-deep" aria-hidden />
                        <span className="flex-1">
                          {short(i.title, i.type === "flight" ? i.metadata?.leg || "roundtrip" : undefined)}
                        </span>
                        {i.price_estimate != null && (
                          <span className="tabular whitespace-nowrap font-semibold">
                            {i.price_estimate === 0 ? "Gratuit" : eur(i.price_estimate)}
                          </span>
                        )}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-sm text-muted">Journée libre</span>
                )}
              </span>
            </div>
          ))
        ) : (
          <p className="m-0 text-sm text-muted">Dates à fixer.</p>
        )}
        {unplaced.length > 0 && (
          <div className="flex flex-col gap-1.5 rounded-[16px] bg-paper p-3 text-sm">
            <span className="text-[13px] font-bold text-muted">Aussi prévu</span>
            {unplaced.map(i => (
              <span key={i.id}>
                {short(i.title, i.type === "flight" ? i.metadata?.leg || "roundtrip" : undefined)}
                {i.price_estimate ? ` · ${eur(i.price_estimate)}` : ""}
              </span>
            ))}
          </div>
        )}
        <p className="m-0 text-xs text-muted">Prix estimés par AIVANA, à confirmer chez les partenaires.</p>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-sky p-5">
        <span className="text-lg font-bold tracking-[-0.02em]">Envie de préparer le vôtre ?</span>
        <div className="flex flex-wrap gap-2">
          {cat && (
            <Link
              href={`/destination/${cat.id}`}
              className="plain-link rounded-full border border-ink px-4 py-2 text-sm font-bold hover:bg-white"
            >
              Voir {cat.name}
            </Link>
          )}
          <ArrowPill href="/assistant">Demander au copilote</ArrowPill>
        </div>
      </div>
    </div>
  );
}
