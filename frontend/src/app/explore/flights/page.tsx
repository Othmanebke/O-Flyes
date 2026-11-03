"use client";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ArrowRight, ExternalLink, Loader2 } from "lucide-react";
import SearchHero from "@/components/layout/SearchHero";
import TripBar from "@/components/trip/TripBar";
import { Chip } from "@/components/ui/Pill";
import CityInput, { Field, fieldInput } from "@/components/trip/CityInput";
import { planInputFrom, syncPlanWithSearch, useTripContext, type SearchContext } from "@/components/trip/useTripContext";
import { eur, findDestination } from "@/lib/catalog";
import { addItem, flightCoverage, removeItem, toast, usePlan, type FlightLeg } from "@/lib/plan";

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
  price: number; // total pour tous les voyageurs
  type: string;
  baggage: string;
  booking_url: string;
  knownRoute?: boolean;
}

const time = (iso?: string | null) => (iso ? iso.slice(11, 16) : "—");
const day = (iso?: string | null) => (iso ? new Date(iso.slice(0, 10) + "T12:00:00Z").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }) : "");
const minutes = (d: string) => { const m = d.match(/(\d+)\s*h\s*(\d+)?/i); return m ? Number(m[1]) * 60 + Number(m[2] || 0) : 9999; };
const hours = (d: string) => d.replace("h", " h ").replace("m", "");

/* Une ligne de trajet : « Aller · sam. 12 déc. · 08:00 CDG ─ 10:20 LIS » */
function LegLine({ label, dep, arr, from, to }: { label: string; dep: string | null; arr: string | null; from: string; to: string }) {
  return (
    <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-3">
      <span className="flex flex-col"><span className="text-xs font-semibold text-gold-deep">{label}</span><span className="text-xs text-muted">{day(dep)}</span></span>
      <div className="tabular flex items-center gap-2.5 whitespace-nowrap text-[15px] font-semibold">
        <span className="flex flex-col"><span>{time(dep)}</span><span className="text-xs font-normal text-muted">{from}</span></span>
        <span className="h-px min-w-6 flex-1 bg-line-2" />
        <span className="flex flex-col"><span>{time(arr)}</span><span className="text-xs font-normal text-muted">{to}</span></span>
      </div>
    </div>
  );
}

function FlightsContent() {
  const router = useRouter();
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
    if (!c.dest.trim() || !c.origin.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<Flight[]>("/api/partner/flights/search", {
        params: { origin: c.origin, destination: c.dest, depart: c.depart, adults: c.pax, ...(c.trip === "oneway" ? { trip: "oneway" } : { return: c.ret }) },
      });
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

  useEffect(() => { if (ready) void search(ctx); }, [ready, ctx.leg, ctx.trip]); // eslint-disable-line react-hooks/exhaustive-deps

  const airlines = useMemo(() => Array.from(new Set(flights.map(f => f.airline))), [flights]);
  const rows = useMemo(() => {
    const r = flights
      .filter(f => !off[f.airline])
      .filter(f => stops === "all" || (stops === "direct" ? f.type === "Direct" : f.type !== "Direct"));
    const score = (f: Flight) => f.price + minutes(f.duration) * 0.4;
    return [...r].sort((a, b) => sort === "cheap" ? a.price - b.price : sort === "fast" ? minutes(a.duration) - minutes(b.duration) : score(a) - score(b));
  }, [flights, off, stops, sort]);

  const set = (k: keyof SearchContext) => (v: string) => setCtx(c => ({ ...c, [k]: k === "pax" ? Number(v) : v }));
  const setTrip = (trip: SearchContext["trip"]) => setCtx(c => ({ ...c, trip, leg: "outbound" }));
  const isReturn = ctx.leg === "return";
  const tripName = plan?.destination || findDestination(isReturn ? ctx.origin : ctx.dest)?.name || (isReturn ? ctx.origin : ctx.dest);
  const cover = flightCoverage(plan);

  const legOf = (s: SearchContext): FlightLeg => (s.trip === "roundtrip" ? "roundtrip" : s.leg === "return" ? "return" : "outbound");
  const keyOf = (f: Flight, s: SearchContext) => `flight:${f.id}:${s.depart}`;

  const toggle = async (f: Flight) => {
    if (!searched) return;
    const key = keyOf(f, searched);
    if (plan?.items.some(i => i.key === key)) { await removeItem(key); return; }
    const leg = legOf(searched);
    const title = leg === "roundtrip"
      ? `Vol aller-retour ${f.airline} · ${f.originCode} ⇄ ${f.destinationCode}`
      : `Vol ${leg === "return" ? "retour" : "aller"} ${f.airline} · ${f.originCode} → ${f.destinationCode}`;
    const when = leg === "roundtrip"
      ? `${day(f.departure)} ${time(f.departure)} · retour ${day(f.returnDeparture)} ${time(f.returnDeparture)}`
      : `${day(f.departure)} ${time(f.departure)} → ${time(f.arrival)}`;
    const p = await addItem({
      key, type: "flight", leg, title,
      subtitle: `${when} · ${searched.pax} pers. · ${f.type}`,
      price: f.price, estimated: true, provider: f.airline, url: f.booking_url, date: searched.depart,
    }, planInputFrom(searched));
    if (leg === "outbound" && !flightCoverage(p).return) {
      toast(`Vol aller ajouté au voyage ${p.destination}`, { label: "Chercher le retour", href: "/explore/flights?leg=retour" });
    } else {
      toast(`Vol ${leg === "return" ? "retour" : "aller-retour"} ajouté au voyage ${p.destination}`, { label: "Voir le carnet", href: "/dashboard" });
    }
  };

  const priceLabel = searched?.trip === "roundtrip" ? "A/R par pers. · estimé" : "trajet par pers. · estimé";

  return (
    <>
    <SearchHero
      photo="plane"
      eyebrow={isReturn ? `Retour vers ${ctx.dest}` : `Vols au départ de ${ctx.origin || "Paris"}`}
      title={isReturn ? <>Votre <em className="font-serif font-medium italic tracking-[-0.02em]">vol retour</em></> : <>Trouver <em className="font-serif font-medium italic tracking-[-0.02em]">votre vol</em></>}
      text="Comparez vols directs et avec escale, en aller-retour ou en aller simple, et gardez le meilleur dans votre carnet."
      points={["Prix estimés par personne", "Direct ou avec escale", "Tarif du jour sur Google Flights"]}
    />
    <div className="mx-auto flex max-w-[1200px] flex-col gap-7 px-6 pb-24 pt-0">

      <form onSubmit={e => { e.preventDefault(); void search(ctx); }} className="relative z-10 -mt-[72px] flex flex-wrap gap-px overflow-hidden rounded-[22px] border border-line-2 bg-line-2 shadow-[0_24px_60px_rgba(15,27,45,0.18)] [&>*]:flex-[1_1_170px]">
        <div className="flex !basis-full flex-wrap items-center gap-2 bg-cream px-3.5 py-2.5">
          {isReturn ? (
            <>
              <span className="text-sm text-muted-2">Aller simple, de {ctx.origin} vers {ctx.dest}.</span>
              <button type="button" onClick={() => router.push("/explore/flights")} className="text-sm font-semibold text-gold-deep hover:text-[#6E5323]">Revenir à la recherche aller</button>
            </>
          ) : (
            <>
              <Chip active={ctx.trip === "roundtrip"} onClick={() => setTrip("roundtrip")}>Aller-retour</Chip>
              <Chip active={ctx.trip === "oneway"} onClick={() => setTrip("oneway")}>Aller simple</Chip>
              {ctx.trip === "oneway" && <span className="text-[13px] text-muted">Vous pourrez chercher le retour juste après.</span>}
            </>
          )}
        </div>
        <CityInput id="origin" label="Départ" value={ctx.origin} onChange={set("origin")} />
        <CityInput id="dest" label="Destination" value={ctx.dest} onChange={set("dest")} />
        <Field id="out" label={isReturn ? "Date du retour" : "Aller"}><input id="out" type="date" value={ctx.depart} onChange={e => set("depart")(e.target.value)} className={fieldInput} /></Field>
        {ctx.trip === "roundtrip" && (
          <Field id="back" label="Retour"><input id="back" type="date" value={ctx.ret} min={ctx.depart} onChange={e => set("ret")(e.target.value)} className={fieldInput} /></Field>
        )}
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
      {/* Rappel : l'aller est choisi mais pas le retour */}
      {plan && cover.outbound && !cover.return && !isReturn && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-gold-deep/40 bg-gold-deep/[0.06] px-4 py-3">
          <span className="text-sm">Votre vol aller est choisi. Il reste le vol retour.</span>
          <Link href="/explore/flights?leg=retour" className="text-sm font-semibold">Chercher le retour <ArrowRight className="inline h-[1em] w-[1em]" aria-hidden /></Link>
        </div>
      )}

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
              {searched
                ? `${rows.length} vol${rows.length > 1 ? "s" : ""} · ${searched.origin} → ${searched.dest} · ${searched.trip === "roundtrip" ? `${day(searched.depart)} – ${day(searched.ret)}` : `aller simple, ${day(searched.depart)}`}`
                : "Recherche en cours…"}
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
            {searched && rows.map(f => {
              const added = !!plan?.items.some(i => i.key === keyOf(f, searched));
              return (
                <div key={f.id} className="grid items-center gap-x-6 gap-y-3 border-b border-line py-[18px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))]">
                  <div className="flex flex-col gap-[3px]">
                    <span className="text-[15px] font-semibold">{f.airline}</span>
                    <span className="text-[13px] text-muted">{hours(f.duration)} · <span className={f.type === "Direct" ? "text-ok" : ""}>{f.type}</span></span>
                    <span className="text-[13px] text-muted">{f.baggage}</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <LegLine label={searched.leg === "return" ? "Retour" : "Aller"} dep={f.departure} arr={f.arrival} from={f.originCode} to={f.destinationCode} />
                    {f.returnDeparture && <LegLine label="Retour" dep={f.returnDeparture} arr={f.returnArrival} from={f.destinationCode} to={f.originCode} />}
                  </div>
                  <div className="flex items-center justify-end gap-3.5">
                    <span className="flex flex-col items-end">
                      <span className="tabular whitespace-nowrap text-base font-semibold">{eur(f.price / searched.pax)}</span>
                      <span className="whitespace-nowrap text-xs text-muted">{priceLabel}</span>
                    </span>
                    <button onClick={() => toggle(f)} className={`whitespace-nowrap rounded-full border border-ink px-3 py-[9px] text-[13px] font-semibold ${added ? "bg-transparent text-ink" : "bg-ink text-paper hover:bg-ink-2"}`}>
                      {added ? "Ajouté ✓" : `Ajouter à ${tripName}`}
                    </button>
                    <a href={f.booking_url} target="_blank" rel="noopener noreferrer" aria-label={`Voir ce vol ${f.airline} sur Google Flights`} title="Voir le prix du jour sur Google Flights" className="text-muted hover:text-ink"><ExternalLink className="h-4 w-4" aria-hidden /></a>
                  </div>
                </div>
              );
            })}
            {!loading && searched && rows.length === 0 && <p className="py-6 text-sm text-muted-2">Aucun vol ne correspond à ces filtres.</p>}
          </div>
          <span className="text-[13px] text-muted">
            {flights.some(f => f.knownRoute)
              ? "Compagnies qui desservent habituellement cette ligne depuis Paris (programme variable selon la saison). Horaires et prix sont estimés pour construire votre budget."
              : "Correspondances indicatives via les grands aéroports européens. Horaires et prix sont estimés pour construire votre budget."} L&apos;icône à côté de chaque vol ouvre Google Flights avec vos dates pour voir le tarif du jour et réserver.
          </span>
        </div>
      </div>
    </div>
    </>
  );
}

export default function FlightsPage() {
  return (
    <div className="bg-paper">
      <Suspense><FlightsContent /></Suspense>
    </div>
  );
}
