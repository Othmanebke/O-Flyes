"use client";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ExternalLink, Loader2 } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import TripBar from "@/components/trip/TripBar";
import CityInput, { Field, fieldInput } from "@/components/trip/CityInput";
import { planInputFrom, syncPlanWithSearch, useTripContext, type SearchContext } from "@/components/trip/useTripContext";
import { eur, findDestination } from "@/lib/catalog";
import { addItem, removeItem, toast, usePlan } from "@/lib/plan";

interface Flight {
  id: string;
  airline: string;
  originCode: string;
  destinationCode: string;
  departure: string;
  arrival: string;
  duration: string;
  returnDeparture: string | null;
  returnArrival: string | null;
  price: number; // total A/R tous voyageurs
  type: string;
  baggage: string;
  booking_url: string;
  source?: "amadeus" | "estimate";
}

const time = (iso?: string | null) => (iso ? iso.slice(11, 16) : "—");
const day = (iso?: string | null) => (iso ? new Date(iso.slice(0, 10) + "T12:00:00Z").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }) : "");
const minutes = (d: string) => { const m = d.match(/(\d+)\s*h\s*(\d+)?/i); return m ? Number(m[1]) * 60 + Number(m[2] || 0) : 9999; };

function FlightsContent() {
  const { ctx, setCtx, ready } = useTripContext();
  const plan = usePlan();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [searched, setSearched] = useState<SearchContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stops, setStops] = useState<"all" | "direct" | "one">("all");
  const [off, setOff] = useState<Record<string, boolean>>({});
  const [sort, setSort] = useState<"best" | "cheap" | "fast">("best");

  const search = useCallback(async (c: SearchContext) => {
    if (!c.dest.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<Flight[]>("/api/partner/flights/search", { params: { origin: c.origin, destination: c.dest, depart: c.depart, return: c.ret, adults: c.pax } });
      setFlights(res.data || []);
      setSearched(c);
      setOff({});
      syncPlanWithSearch(c);
    } catch {
      setError("La recherche de vols n'a pas abouti. Réessayez dans un instant.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (ready) void search(ctx); }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const airlines = useMemo(() => Array.from(new Set(flights.map(f => f.airline))), [flights]);
  const rows = useMemo(() => {
    const r = flights
      .filter(f => !off[f.airline])
      .filter(f => stops === "all" || (stops === "direct" ? f.type === "Direct" : f.type !== "Direct"));
    const score = (f: Flight) => f.price + minutes(f.duration) * 0.4;
    return [...r].sort((a, b) => sort === "cheap" ? a.price - b.price : sort === "fast" ? minutes(a.duration) - minutes(b.duration) : score(a) - score(b));
  }, [flights, off, stops, sort]);

  const estimated = flights.some(f => f.source !== "amadeus");
  const tripName = plan?.destination || findDestination(searched?.dest)?.name || searched?.dest || ctx.dest;
  const set = (k: keyof SearchContext) => (v: string) => setCtx(c => ({ ...c, [k]: k === "pax" ? Number(v) : v }));

  const toggle = async (f: Flight) => {
    if (!searched) return;
    const key = `flight:${f.id}:${searched.depart}`;
    if (plan?.items.some(i => i.key === key)) { await removeItem(key); return; }
    const p = await addItem({
      key, type: "flight",
      title: `Vol ${f.airline} · ${f.originCode} → ${f.destinationCode}`,
      subtitle: `Aller-retour · ${day(f.departure)} ${time(f.departure)} – retour ${day(f.returnDeparture)} · ${searched.pax} pers. · ${f.type}`,
      price: f.price, estimated: f.source !== "amadeus", provider: f.airline, url: f.booking_url, date: searched.depart,
    }, planInputFrom(searched));
    toast(`Vol ajouté au voyage ${p.destination}`, { label: "Voir le carnet", href: "/dashboard" });
  };

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-7 px-6 pb-24 pt-12">
      <h1 className="m-0 text-[clamp(36px,4.6vw,56px)] leading-[1.05]">Trouver <em className="accent">votre vol</em></h1>
      <TripBar />

      <form onSubmit={e => { e.preventDefault(); void search(ctx); }} className="grid gap-px overflow-hidden rounded-[22px] border border-line-2 bg-line-2 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        <CityInput id="origin" label="Départ" value={ctx.origin} onChange={set("origin")} />
        <CityInput id="dest" label="Destination" value={ctx.dest} onChange={set("dest")} />
        <Field id="out" label="Aller"><input id="out" type="date" value={ctx.depart} onChange={e => set("depart")(e.target.value)} className={fieldInput} /></Field>
        <Field id="back" label="Retour"><input id="back" type="date" value={ctx.ret} min={ctx.depart} onChange={e => set("ret")(e.target.value)} className={fieldInput} /></Field>
        <Field id="pax" label="Voyageurs">
          <select id="pax" value={ctx.pax} onChange={e => set("pax")(e.target.value)} className={fieldInput}>
            {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} adulte{n > 1 ? "s" : ""}</option>)}
          </select>
        </Field>
        <button type="submit" disabled={loading} className="col-span-full flex min-h-[52px] items-center justify-center gap-2 bg-ink text-[15px] font-semibold text-paper hover:bg-ink-2 disabled:opacity-70">
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Rechercher
        </button>
      </form>

      <div className="flex flex-wrap items-start gap-10">
        <aside className="flex min-w-[200px] flex-[0_1_220px] flex-col gap-6">
          <fieldset className="flex flex-col gap-2.5">
            <legend className="mb-2.5 text-sm font-semibold">Escales</legend>
            {([["all", "Toutes"], ["direct", "Direct uniquement"], ["one", "Avec escale"]] as const).map(([v, label]) => (
              <label key={v} className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-2">
                <input type="radio" name="stops" checked={stops === v} onChange={() => setStops(v)} />{label}
              </label>
            ))}
          </fieldset>
          {airlines.length > 0 && (
            <fieldset className="flex flex-col gap-2.5">
              <legend className="mb-2.5 text-sm font-semibold">Compagnies</legend>
              {airlines.map(a => (
                <label key={a} className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-2">
                  <input type="checkbox" checked={!off[a]} onChange={() => setOff(o => ({ ...o, [a]: !o[a] }))} />{a}
                </label>
              ))}
            </fieldset>
          )}
        </aside>

        <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-muted-2">
              {searched ? `${rows.length} vol${rows.length > 1 ? "s" : ""} · ${searched.origin} → ${searched.dest} · ${day(searched.depart)} – ${day(searched.ret)}` : "Recherche en cours…"}
            </span>
            <div className="flex gap-1 rounded-full border border-line bg-cream p-[3px]">
              {([["best", "Recommandé"], ["cheap", "Moins cher"], ["fast", "Plus rapide"]] as const).map(([v, label]) => (
                <button key={v} onClick={() => setSort(v)} aria-pressed={sort === v} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium ${sort === v ? "bg-ink text-paper" : "text-muted-2"}`}>{label}</button>
              ))}
            </div>
          </div>

          {error && <p className="rounded-2xl border border-danger/40 bg-danger/[0.08] px-4 py-3 text-sm text-danger">{error}</p>}

          <div className="flex flex-col border-t border-line">
            {loading && !flights.length && <p className="py-6 text-sm text-muted">Comparaison des vols…</p>}
            {rows.map(f => {
              const added = !!plan?.items.some(i => i.key === `flight:${f.id}:${searched?.depart}`);
              return (
                <div key={f.id} className="grid items-center gap-x-5 gap-y-3 border-b border-line py-[18px] [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
                  <div className="flex flex-col gap-[3px]">
                    <span className="text-[15px] font-semibold">{f.airline}</span>
                    <span className="text-[13px] text-muted">{f.baggage}</span>
                  </div>
                  <div className="tabular flex items-center gap-2.5 whitespace-nowrap text-[15px] font-semibold">
                    <span className="flex flex-col"><span>{time(f.departure)}</span><span className="text-xs font-normal text-muted">{f.originCode}</span></span>
                    <span className="h-px min-w-6 flex-1 bg-line-2" />
                    <span className="flex flex-col"><span>{time(f.arrival)}</span><span className="text-xs font-normal text-muted">{f.destinationCode}</span></span>
                  </div>
                  <div className="flex flex-col gap-[3px]">
                    <span className="text-sm">{f.duration.replace("h", " h ").replace("m", "")}</span>
                    <span className={`text-[13px] ${f.type === "Direct" ? "text-ok" : "text-muted-2"}`}>{f.type}</span>
                  </div>
                  <div className="flex items-center justify-end gap-3.5">
                    <span className="flex flex-col items-end">
                      <span className="tabular whitespace-nowrap text-base font-semibold">{eur(f.price / (searched?.pax || 1))}</span>
                      <span className="whitespace-nowrap text-xs text-muted">A/R par pers.{f.source !== "amadeus" ? " · estimé" : ""}</span>
                    </span>
                    <button onClick={() => toggle(f)} className={`whitespace-nowrap rounded-full border border-ink px-3 py-[9px] text-[13px] font-semibold ${added ? "bg-transparent text-ink" : "bg-ink text-paper hover:bg-ink-2"}`}>
                      {added ? "Ajouté ✓" : `Ajouter à ${tripName}`}
                    </button>
                    <a href={f.booking_url} target="_blank" rel="noopener noreferrer" aria-label={`Voir ce vol ${f.airline} chez le partenaire`} title="Vérifier et réserver chez le partenaire" className="text-muted hover:text-ink"><ExternalLink className="h-4 w-4" aria-hidden /></a>
                  </div>
                </div>
              );
            })}
            {!loading && searched && rows.length === 0 && <p className="py-6 text-sm text-muted-2">Aucun vol ne correspond à ces filtres.</p>}
          </div>
          <span className="text-[13px] text-muted">
            {estimated
              ? "Prix estimés à partir des tarifs habituels sur cette ligne : le service de prix en direct (Amadeus) n'est pas disponible. Vérifiez le tarif chez la compagnie avant de réserver."
              : "Prix Amadeus en euros, taxes incluses, pour tous les voyageurs. La réservation se fait chez la compagnie."}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function FlightsPage() {
  return (
    <div className="bg-paper">
      <PageBanner k="clouds" />
      <Suspense><FlightsContent /></Suspense>
    </div>
  );
}
