"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import Photo from "@/components/ui/Photo";
import { Chip } from "@/components/ui/Pill";
import { CONTINENTS, DESTINATIONS, MONTHS_SHORT, TIERS, eur } from "@/lib/catalog";
import type { PhotoKey } from "@/lib/photos";
import { getPrefs } from "@/lib/plan";

const STYLES = ["Nature", "Aventure", "Plage", "Culture", "Gastronomie", "Bien-être"];

function DestinationsContent() {
  const params = useSearchParams();
  const [tier, setTier] = useState("Tous");
  const [cont, setCont] = useState("Toutes");
  const [month, setMonth] = useState("");
  const [style, setStyle] = useState("");

  const [liked, setLiked] = useState<string[]>([]);
  const [fromPrefs, setFromPrefs] = useState(false);
  useEffect(() => { setStyle(params.get("style") || ""); }, [params]);
  // Préférences de l'onboarding : budget habituel présélectionné, envies mises en avant
  useEffect(() => {
    const p = getPrefs();
    setLiked(p.styles || []);
    if (p.budget && !params.get("style") && TIERS.some(t => t.label === p.budget)) { setTier(p.budget); setFromPrefs(true); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const results = DESTINATIONS
    .filter(d => tier === "Tous" || d.tier === tier)
    .filter(d => cont === "Toutes" || d.continent === cont)
    .filter(d => !month || d.months.includes(month))
    .filter(d => !style || d.styles.includes(style))
    // ce qui correspond à vos envies en premier
    .sort((a, b) => b.styles.filter(x => liked.includes(x)).length - a.styles.filter(x => liked.includes(x)).length);

  const clear = () => { setTier("Tous"); setCont("Toutes"); setMonth(""); setStyle(""); };

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 pb-24 pt-12">
      <div className="flex flex-col gap-3">
        <h1 className="m-0 text-[clamp(36px,4.6vw,56px)] leading-[1.05]">Où <em className="accent">partir</em> ensuite ?</h1>
        <p className="m-0 max-w-[560px] text-base text-muted-2">Budgets estimés pour deux voyageurs, vols depuis Paris compris. Choisissez une destination pour voir le détail et créer votre voyage.</p>
      </div>

      <div className="flex flex-col gap-3.5 border-y border-line py-[18px]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-[72px] text-[13px] text-muted">Budget</span>
          <Chip active={tier === "Tous"} onClick={() => setTier("Tous")}>Tous</Chip>
          {TIERS.map(t => (
            <Chip key={t.label} active={tier === t.label} onClick={() => setTier(t.label)}>
              {t.label} <span className={tier === t.label ? "text-white/60" : "text-muted"}>{t.range}</span>
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-[72px] text-[13px] text-muted">Région</span>
          {["Toutes", ...CONTINENTS].map(c => <Chip key={c} active={cont === c} onClick={() => setCont(c)}>{c}</Chip>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-[72px] text-[13px] text-muted">Envie</span>
          {["", ...STYLES].map(s => <Chip key={s || "all"} active={style === s} onClick={() => setStyle(s)}>{s || "Toutes"}</Chip>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="month" className="w-[72px] text-[13px] text-muted">Départ en</label>
          <select id="month" value={month} onChange={e => setMonth(e.target.value)} className="h-[34px] rounded-full border border-line-2 bg-cream px-2.5 text-[13px] text-ink">
            <option value="">N&apos;importe quand</option>
            {MONTHS_SHORT.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <div className="flex-1" />
          <span className="text-[13px] text-muted">{results.length} destination{results.length > 1 ? "s" : ""}</span>
        </div>
        {fromPrefs && tier !== "Tous" && (
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-2">
            Filtré selon votre budget habituel ({tier}){liked.length ? `, vos envies en premier` : ""}.
            <button onClick={() => { setTier("Tous"); setFromPrefs(false); }} className="font-semibold text-gold-deep hover:text-[#6E5323]">Tout voir</button>
          </div>
        )}
      </div>

      <div className="grid gap-x-5 gap-y-7 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
        {results.map(d => (
          <Link key={d.id} href={`/destination/${d.id}`} className="plain-link group flex flex-col gap-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] border border-line">
              <Photo k={d.code as PhotoKey} alt={d.name} sizes="(max-width: 600px) 100vw, 300px" className="h-full w-full" imgClassName="transition-transform duration-700 group-hover:scale-105" />
              <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(18,16,12,0.72) 0%, rgba(18,16,12,0.2) 45%, rgba(18,16,12,0) 70%)" }} />
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-4 py-3.5">
                <span className="self-start rounded-full bg-cream/90 px-2.5 py-1 text-xs font-semibold tracking-[0.04em] text-ink">{d.code}</span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-balance text-[clamp(20px,2vw,28px)] font-bold leading-[1.05] tracking-[-0.03em] text-white">{d.name}</span>
                  <span className="text-[13px] text-white/90">{d.country}</span>
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between gap-3 text-sm">
                <span className="font-semibold">{d.tier}</span>
                <span className="tabular whitespace-nowrap font-semibold">{eur(d.budgetMin)} – {eur(d.budgetMax)}</span>
              </div>
              <span className="text-[13px] text-muted">{d.duration} · idéal {d.months.slice(0, 3).join(", ")}</span>
            </div>
          </Link>
        ))}
      </div>

      {results.length === 0 && (
        <div className="flex flex-col items-start gap-2.5 rounded-[22px] border border-dashed border-line-2 p-8">
          <span className="text-base font-semibold">Aucune destination pour ces filtres</span>
          <button onClick={clear} className="rounded-full border border-line-2 px-3.5 py-[9px] text-sm hover:border-ink">Réinitialiser les filtres</button>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <div className="bg-paper">
      <PageBanner k="lake" />
      <Suspense><DestinationsContent /></Suspense>
    </div>
  );
}
