"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Minus, Plus } from "lucide-react";
import Photo from "@/components/ui/Photo";
import TripBar from "@/components/trip/TripBar";
import { byId, eur, searchCity } from "@/lib/catalog";
import { ask } from "@/lib/chat";
import { addDays, defaultDepart, startPlan, toast, usePlan } from "@/lib/plan";
import type { PhotoKey } from "@/lib/photos";

const ACT: Record<string, [string, string][]> = {
  Culture: [["Visite guidée de la vieille ville", "3 h · 15 – 35 €"], ["Musée national", "2 – 3 h · 10 – 20 €"]],
  Gastronomie: [["Tour des marchés", "3 h · 25 – 55 €"], ["Cours de cuisine locale", "4 h · 40 – 80 €"]],
  Plage: [["Snorkeling avec moniteur", "3 h · 30 – 90 €"], ["Coucher de soleil en bateau", "2 h · 45 – 70 €"]],
  Nature: [["Randonnée guidée", "6 h · 20 – 50 €"], ["Parc national", "Journée · 10 – 30 €"]],
  Aventure: [["Quad ou 4×4", "4 h · 50 – 120 €"], ["Via ferrata", "4 – 6 h · 35 – 80 €"]],
  "Bien-être": [["Spa et massage traditionnel", "2 h · 30 – 120 €"], ["Bains thermaux", "2 – 4 h · 10 – 50 €"]],
  Luxe: [["Survol en hélicoptère", "1 h · 200 – 800 €"], ["Dîner privé sur la plage", "3 h · 150 – 400 €"]],
  Histoire: [["Site archéologique guidé", "4 h · 20 – 50 €"], ["Quartiers historiques de nuit", "2 h · 15 – 30 €"]],
  Faune: [["Safari en jeep", "Journée · 100 – 300 €"], ["Observation de la migration", "Journée · 150 – 400 €"]],
  Shopping: [["Marchés et créateurs locaux", "3 h · gratuit"]],
  Fête: [["Cours de danse", "2 h · 20 – 50 €"], ["Spectacle local", "2 h · 25 – 80 €"]],
};

function Radio({ on }: { on: boolean }) {
  return (
    <span className={`flex h-4 w-4 items-center justify-center rounded-full border-[1.5px] ${on ? "border-gold-deep" : "border-line-2"}`}>
      <span className={`h-2 w-2 rounded-full ${on ? "bg-gold-deep" : "bg-transparent"}`} />
    </span>
  );
}

function Stepper({ label, value, set, min, max }: { label: string; value: number; set: (n: number) => void; min: number; max: number }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-3">
      <span className="text-sm text-muted-2">{label}</span>
      <span className="flex items-center gap-3">
        <button onClick={() => set(Math.max(min, value - 1))} aria-label={`Moins de ${label.toLowerCase()}`} className="flex h-8 w-8 items-center justify-center rounded-full border border-line-2 hover:border-ink"><Minus className="h-3.5 w-3.5" aria-hidden /></button>
        <span className="tabular w-[22px] text-center font-semibold">{value}</span>
        <button onClick={() => set(Math.min(max, value + 1))} aria-label={`Plus de ${label.toLowerCase()}`} className="flex h-8 w-8 items-center justify-center rounded-full border border-line-2 hover:border-ink"><Plus className="h-3.5 w-3.5" aria-hidden /></button>
      </span>
    </div>
  );
}

function View({ id }: { id: string }) {
  const d = byId(id)!;
  const router = useRouter();
  const params = useSearchParams();
  const plan = usePlan();
  const [f, setF] = useState(0);
  const [h, setH] = useState(1);
  const [nights, setNights] = useState(7);
  const [pax, setPax] = useState(2);
  const [depart, setDepart] = useState("");

  useEffect(() => {
    const n = Number(params.get("nights")), p = Number(params.get("pax"));
    if (n > 0) setNights(Math.min(30, n));
    if (p > 0) setPax(Math.min(9, p));
    setDepart(params.get("depart") || defaultDepart());
  }, [params]);

  const b = d.flightFrom * 2;
  const hb = d.hotelFrom;
  const dur = d.flightFrom < 150 ? ["2 h 30", "2 h 45", "4 h 10"] : d.flightFrom < 500 ? ["5 h", "5 h 30", "8 h"] : ["11 h", "12 h", "14 h"];
  const flights = [
    { airline: "Compagnie low-cost", meta: `Low-cost · Direct · ${dur[0]}`, price: b },
    { airline: "Compagnie régulière", meta: `Bagage inclus · Direct · ${dur[1]}`, price: Math.round(b * 1.4) },
    { airline: "Avec escale", meta: `Confort+ · 1 escale · ${dur[2]}`, price: Math.round(b * 1.8) },
  ];
  const hotels = [
    { name: "Auberge ou maison d'hôtes", meta: "2 étoiles · petit-déjeuner souvent inclus", price: hb },
    { name: "Hôtel de charme", meta: "4 étoiles · piscine ou spa", price: Math.round(hb * 2.2) },
    { name: "Hôtel de luxe", meta: "5 étoiles · vue, conciergerie", price: Math.round(hb * 4.5) },
  ];
  const activities = d.styles.flatMap(s => ACT[s] || []).slice(0, 6);
  const flight = flights[f].price * pax, hotel = hotels[h].price * nights, act = 60 * pax, total = flight + hotel + act;

  const ret = depart ? addDays(depart, nights) : "";
  const current = plan && plan.destId === d.id;
  const city = searchCity(d);
  const ctx = `dest=${encodeURIComponent(city)}&depart=${depart}&return=${ret}&pax=${pax}`;

  const create = () => {
    startPlan({ destination: d.name, destId: d.id, country: d.country, depart, ret, travelers: pax, budget: total });
    toast(`Voyage « ${d.name} » créé. Choisissez maintenant votre vol.`);
    router.push("/explore/flights");
  };

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-7 px-6 pb-24 pt-7">
      <nav aria-label="Fil d'Ariane" className="flex gap-2 text-[13px] text-muted">
        <Link href="/explore" className="plain-link !text-muted hover:!text-ink">Destinations</Link><span>/</span><span className="text-muted-2">{d.name}</span>
      </nav>

      {plan && <TripBar />}

      <Photo k={d.code as PhotoKey} alt={d.name} priority sizes="(max-width: 1200px) 100vw, 1200px" className="h-[clamp(200px,30vw,340px)] rounded-3xl border border-line" />

      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex max-w-[640px] flex-col gap-2.5">
          <span className="text-sm text-muted">{d.country} · {d.continent}</span>
          <h1 className="m-0 text-[clamp(36px,4.6vw,56px)] leading-[1.05]">{d.name}</h1>
          <p className="m-0 text-pretty text-[17px] leading-[1.55] text-muted-2">{d.desc}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {d.styles.map(s => <span key={s} className="rounded-full border border-line-2 px-[11px] py-[5px] text-[13px] text-muted-2">{s}</span>)}
        </div>
      </div>

      <div className="grid border-y border-line [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        {[
          ["Budget pour deux", `${eur(d.budgetMin)} – ${eur(d.budgetMax)}`],
          ["Vol A/R dès", eur(b)],
          ["Hôtel dès", `${eur(hb)} / nuit`],
          ["Meilleure période", d.months.join(", ")],
          ["Durée conseillée", d.duration],
        ].map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1.5 py-[18px] pr-4">
            <span className="text-[13px] text-muted">{k}</span>
            <span className="text-[17px] font-medium">{v}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-12">
        <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-12">
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="m-0 text-[28px]">Vols depuis Paris</h2>
              <Link href={`/explore/flights?${ctx}`} className="text-sm">Voir les vols du jour <ArrowRight className="inline h-[1em] w-[1em]" aria-hidden /></Link>
            </div>
            <p className="-mt-2 text-[13px] text-muted">Fourchettes indicatives pour estimer le budget. Les horaires et prix réels sont dans la recherche de vols.</p>
            <div className="flex flex-col border-t border-line">
              {flights.map((x, i) => (
                <button key={x.airline} onClick={() => setF(i)} aria-pressed={i === f} className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3.5 border-b border-line px-1 py-4 text-left hover:bg-cream">
                  <Radio on={i === f} />
                  <span className="flex min-w-0 flex-col gap-[3px]"><span className="text-[15px] font-semibold">{x.airline}</span><span className="text-[13px] text-muted">{x.meta}</span></span>
                  <span className="flex flex-col items-end gap-[3px]"><span className="tabular whitespace-nowrap text-[15px] font-semibold">{eur(x.price)}</span><span className="text-xs text-muted">A/R par pers.</span></span>
                </button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="m-0 text-[28px]">Où dormir</h2>
              <Link href={`/explore/hotels?${ctx}`} className="text-sm">Voir les hôtels <ArrowRight className="inline h-[1em] w-[1em]" aria-hidden /></Link>
            </div>
            <div className="flex flex-col border-t border-line">
              {hotels.map((x, i) => (
                <button key={x.name} onClick={() => setH(i)} aria-pressed={i === h} className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3.5 border-b border-line px-1 py-4 text-left hover:bg-cream">
                  <Radio on={i === h} />
                  <span className="flex min-w-0 flex-col gap-[3px]"><span className="text-[15px] font-semibold">{x.name}</span><span className="text-[13px] text-muted">{x.meta}</span></span>
                  <span className="flex flex-col items-end gap-[3px]"><span className="tabular whitespace-nowrap text-[15px] font-semibold">{eur(x.price)}</span><span className="text-xs text-muted">par nuit</span></span>
                </button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="m-0 text-[28px]">À faire sur place</h2>
              <Link href={`/explore/activities?${ctx}`} className="text-sm">Toutes les activités <ArrowRight className="inline h-[1em] w-[1em]" aria-hidden /></Link>
            </div>
            <div className="grid gap-x-8 border-t border-line [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
              {activities.map(([name, meta]) => (
                <div key={name} className="flex flex-col gap-1 border-b border-line py-4">
                  <span className="text-[15px] font-semibold">{name}</span>
                  <span className="text-[13px] text-muted">{meta}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="sticky top-[88px] flex max-w-full flex-[1_1_320px] flex-col gap-[18px] rounded-3xl border border-line bg-cream p-[22px]">
          <span className="text-[22px] font-bold tracking-[-0.035em]">Votre estimation</span>
          <div className="flex flex-col border-t border-line">
            <label className="flex items-center justify-between border-b border-line py-3">
              <span className="text-sm text-muted-2">Départ le</span>
              <input type="date" value={depart} min={new Date().toISOString().slice(0, 10)} onChange={e => setDepart(e.target.value)} className="rounded-full border border-line-2 bg-white px-3 py-1.5 text-sm" />
            </label>
            <Stepper label="Nuits" value={nights} set={setNights} min={1} max={30} />
            <Stepper label="Voyageurs" value={pax} set={setPax} min={1} max={9} />
            {[
              [`Vol × ${pax}`, eur(flight)],
              [`Hôtel × ${nights} nuits`, eur(hotel)],
              ["Activités (estimation)", eur(act)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-line py-3 text-sm"><span className="text-muted-2">{k}</span><span className="tabular whitespace-nowrap font-semibold">{v}</span></div>
            ))}
            <div className="flex justify-between pt-3.5 text-base font-semibold"><span>Total estimé</span><span className="tabular whitespace-nowrap text-gold-deep">{eur(total)}</span></div>
          </div>
          {current ? (
            <Link href="/explore/flights" className="plain-link rounded-full bg-ink px-4 py-3 text-center text-sm font-semibold !text-paper hover:bg-ink-2">Continuer ce voyage</Link>
          ) : (
            <button onClick={create} disabled={!depart} className="rounded-full bg-ink px-4 py-3 text-center text-sm font-semibold text-paper hover:bg-ink-2 disabled:opacity-50">Créer ce voyage</button>
          )}
          <p className="-mt-2 text-center text-xs text-muted">
            {current ? "Ce voyage est en cours : ajoutez vols, hôtel et activités." : "Étape suivante : choisir le vol, puis l'hôtel et les activités. Sans compte, rien à payer."}
          </p>
          <button onClick={() => ask(`${d.name}, ${nights} nuits, ${pax} voyageurs, budget ${total} €. Que me conseilles-tu ?`)} className="text-center text-sm font-medium text-gold-deep hover:text-[#6E5323]">Adapter avec le copilote</button>
        </aside>
      </div>
    </div>
  );
}

export default function DestinationView({ id }: { id: string }) {
  return <Suspense><View id={id} /></Suspense>;
}
