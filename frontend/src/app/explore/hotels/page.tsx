"use client";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ExternalLink, Loader2 } from "lucide-react";
import SearchHero from "@/components/layout/SearchHero";
import TripBar from "@/components/trip/TripBar";
import Photo from "@/components/ui/Photo";
import { Chip } from "@/components/ui/Pill";
import CityInput, { Field, fieldInput } from "@/components/trip/CityInput";
import { planInputFrom, syncPlanWithSearch, useTripContext, type SearchContext } from "@/components/trip/useTripContext";
import { eur, findDestination } from "@/lib/catalog";
import { addItem, nightsBetween, removeItem, toast, usePlan } from "@/lib/plan";
import { isPhotoKey, photoFor } from "@/lib/photos";

interface Hotel {
  id: string;
  name: string;
  city: string;
  price_per_night: number;
  stars: number; // niveau de confort
  category: string; // quartier / contexte
  amenities: string[];
  photo: string;
  booking_url: string;
}

function HotelsContent() {
  const { ctx, setCtx, ready } = useTripContext();
  const plan = usePlan();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [searched, setSearched] = useState<SearchContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stars, setStars] = useState(0);
  const [max, setMax] = useState(400);
  const [sort, setSort] = useState<"best" | "cheap" | "stars">("best");

  const search = useCallback(async (c: SearchContext) => {
    if (!c.dest.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<Hotel[]>("/api/partner/hotels/search", { params: { city: c.dest, checkin: c.depart, checkout: c.ret, adults: c.pax } });
      setHotels(res.data || []);
      setSearched(c);
      syncPlanWithSearch(c);
    } catch {
      setError("La recherche d'hôtels n'a pas abouti. Réessayez dans un instant.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (ready) void search(ctx); }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const nights = searched ? nightsBetween(searched.depart, searched.ret) : 7;
  const rows = useMemo(() => {
    const r = hotels.filter(h => (!stars || h.stars === stars) && (max >= 400 || h.price_per_night <= max));
    return [...r].sort((a, b) => sort === "cheap" ? a.price_per_night - b.price_per_night : sort === "stars" ? b.stars - a.stars : (b.stars * 40 - b.price_per_night * 0.3) - (a.stars * 40 - a.price_per_night * 0.3));
  }, [hotels, stars, max, sort]);

  const tripName = plan?.destination || findDestination(searched?.dest)?.name || searched?.dest || ctx.dest;
  const set = (k: keyof SearchContext) => (v: string) => setCtx(c => ({ ...c, [k]: k === "pax" ? Number(v) : v }));

  const toggle = async (h: Hotel) => {
    if (!searched) return;
    const key = `hotel:${h.id}:${searched.depart}`;
    if (plan?.items.some(i => i.key === key)) { await removeItem(key); return; }
    const p = await addItem({
      key, type: "hotel",
      title: h.name,
      subtitle: `${h.category} · ${nights} nuit${nights > 1 ? "s" : ""} · ${eur(h.price_per_night)} / nuit`,
      price: h.price_per_night * nights, estimated: true, provider: "Booking.com", url: h.booking_url, date: searched.depart,
    }, planInputFrom(searched));
    toast(`Hôtel ajouté au voyage ${p.destination}`, { label: "Voir le carnet", href: "/dashboard" });
  };

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-7 px-6 pb-24 pt-0">
      <form onSubmit={e => { e.preventDefault(); void search(ctx); }} className="relative z-10 -mt-[72px] flex flex-wrap gap-px overflow-hidden rounded-[22px] border border-line-2 bg-line-2 shadow-[0_24px_60px_rgba(15,27,45,0.18)] [&>*]:flex-[1_1_170px]">
        <CityInput id="city" label="Ville" value={ctx.dest} onChange={set("dest")} />
        <Field id="in" label="Arrivée"><input id="in" type="date" value={ctx.depart} onChange={e => set("depart")(e.target.value)} className={fieldInput} /></Field>
        <Field id="out" label="Départ"><input id="out" type="date" value={ctx.ret} min={ctx.depart} onChange={e => set("ret")(e.target.value)} className={fieldInput} /></Field>
        <Field id="pax" label="Voyageurs">
          <select id="pax" value={ctx.pax} onChange={e => set("pax")(e.target.value)} className={fieldInput}>
            {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} adulte{n > 1 ? "s" : ""}</option>)}
          </select>
        </Field>
        <button type="submit" disabled={loading} className="flex min-h-[52px] !basis-full items-center justify-center gap-2 bg-ink text-[15px] font-semibold text-paper hover:bg-ink-2 disabled:opacity-70">
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Rechercher
        </button>
      </form>

      <TripBar />

      <div className="flex flex-wrap items-start gap-10">
        <aside className="flex min-w-[200px] flex-[0_1_220px] flex-col gap-6">
          <div className="flex flex-col gap-2.5">
            <span className="text-sm font-semibold">Confort</span>
            <div className="flex flex-wrap gap-1.5">
              {[[0, "Tous"], [3, "3 ★"], [4, "4 ★"], [5, "5 ★"]].map(([v, label]) => (
                <Chip key={v} active={stars === v} onClick={() => setStars(v as number)}>{label}</Chip>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <label htmlFor="max" className="text-sm font-semibold">Prix maximum par nuit</label>
            <input id="max" type="range" min={60} max={400} step={10} value={max} onChange={e => setMax(Number(e.target.value))} className="w-full" />
            <span className="tabular whitespace-nowrap text-[13px] font-semibold text-muted-2">{max >= 400 ? "Sans limite" : `Jusqu'à ${eur(max)}`}</span>
          </div>
        </aside>

        <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-muted-2">{searched ? `${rows.length} hébergement${rows.length > 1 ? "s" : ""} · ${searched.dest} · ${nights} nuit${nights > 1 ? "s" : ""}` : "Recherche en cours…"}</span>
            <div className="flex gap-1 rounded-full border border-line bg-cream p-[3px]">
              {([["best", "Recommandé"], ["cheap", "Moins cher"], ["stars", "Plus d'étoiles"]] as const).map(([v, label]) => (
                <button key={v} onClick={() => setSort(v)} aria-pressed={sort === v} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium ${sort === v ? "bg-ink text-paper" : "text-muted-2"}`}>{label}</button>
              ))}
            </div>
          </div>

          {error && <p className="rounded-2xl border border-danger/40 bg-danger/[0.08] px-4 py-3 text-sm text-danger">{error}</p>}

          <div className="flex flex-col border-t border-line">
            {loading && !hotels.length && <p className="py-6 text-sm text-muted">Recherche des hôtels…</p>}
            {rows.map(h => {
              const added = !!plan?.items.some(i => i.key === `hotel:${h.id}:${searched?.depart}`);
              return (
                <div key={h.id} className="flex flex-wrap gap-5 border-b border-line py-[18px]">
                  <Photo k={isPhotoKey(h.photo) ? h.photo : photoFor(h.name, "hotel")} alt="" sizes="168px" className="h-[120px] flex-[0_0_168px] rounded-[18px] border border-line" />
                  <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-1.5">
                    <span className="text-base font-semibold">{h.name}</span>
                    <span className="text-[13px] text-muted">{h.category} · <span className="text-gold-deep" aria-label={`Confort ${h.stars} sur 5`}>{"★".repeat(h.stars)}</span></span>
                    {!!h.amenities?.length && <span className="text-[13px] text-muted-2">{h.amenities.join(", ")}</span>}
                  </div>
                  <div className="ml-auto flex flex-[0_0_auto] flex-col items-end justify-between gap-2.5">
                    <span className="flex flex-col items-end">
                      <span className="tabular whitespace-nowrap text-base font-semibold">{eur(h.price_per_night)} / nuit</span>
                      <span className="whitespace-nowrap text-xs text-muted">{eur(h.price_per_night * nights)} pour {nights} nuit{nights > 1 ? "s" : ""} · estimé</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <a href={h.booking_url} target="_blank" rel="noopener noreferrer" title="Vérifier et réserver chez le partenaire" aria-label={`Voir ${h.name} chez le partenaire`} className="text-muted hover:text-ink"><ExternalLink className="h-4 w-4" aria-hidden /></a>
                      <button onClick={() => toggle(h)} className={`whitespace-nowrap rounded-full border border-ink px-3 py-[9px] text-[13px] font-semibold ${added ? "bg-transparent text-ink" : "bg-ink text-paper hover:bg-ink-2"}`}>
                        {added ? "Ajouté ✓" : `Ajouter à ${tripName}`}
                      </button>
                    </span>
                  </div>
                </div>
              );
            })}
            {!loading && searched && rows.length === 0 && <p className="py-5 text-sm text-muted-2">Aucun hôtel ne correspond. Augmentez le prix maximum ou changez de catégorie.</p>}
          </div>
          <span className="text-[13px] text-muted">
            Les types d&apos;hébergement qu&apos;on trouve sur place, avec un prix par nuit estimé. L&apos;icône ouvre Booking.com avec vos dates et ce type de logement, pour choisir une adresse et voir le prix du jour.
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HotelsPage() {
  return (
    <div className="bg-paper">
      <SearchHero
        photo="hotel1"
        eyebrow="Hôtels et appartements"
        title={<>Où <em className="font-serif font-medium italic tracking-[-0.02em]">dormir</em></>}
        text="Riad, villa, ryokan ou hôtel : les logements typiques de votre destination, le bon quartier et le prix du séjour entier."
        points={["Hébergements typiques du pays", "Prix total du séjour", "Adresses sur Booking.com"]}
      />
      <Suspense><HotelsContent /></Suspense>
    </div>
  );
}
