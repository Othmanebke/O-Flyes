"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { ExternalLink } from "lucide-react";
import { MONTHS_LONG } from "@/lib/catalog";

interface Info {
  month: number;
  weather: { year: number; maxAvg: number | null; minAvg: number | null; rainyDays: number; days: number } | null;
  exchange: { currency: string; rate: number; currencyName: string; updated: string | null } | null;
  sights: { title: string; url: string; km: number }[];
}

const fmtRate = (r: number) => r.toLocaleString("fr-FR", { maximumFractionDigits: r >= 100 ? 0 : r >= 10 ? 1 : 2 });

/* Données réelles et gratuites pour la fiche : météo mesurée, taux de change du jour,
   lieux à voir (Wikipédia). Chaque bloc disparaît s'il n'a pas pu être chargé. */
export default function DestinationFacts({ id, depart }: { id: string; depart: string }) {
  const month = depart ? Number(depart.slice(5, 7)) - 1 : new Date().getMonth();
  const [info, setInfo] = useState<Info | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    axios
      .get<Info>("/api/destination-info", { params: { id, month } })
      .then(r => setInfo(r.data))
      .catch(() => setFailed(true));
  }, [id, month]);

  if (failed) return null;
  const w = info?.weather,
    fx = info?.exchange;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="m-0 text-[28px]">
          Sur place, <em className="accent">en vrai</em>
        </h2>
        <span className="text-[13px] text-muted">Données réelles : Open-Meteo, ExchangeRate-API, Wikipédia</span>
      </div>
      {!info ? (
        <p className="m-0 text-sm text-muted">Chargement de la météo, du change et des lieux à voir…</p>
      ) : (
        <>
          <div className="grid border-y border-line [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
            {w && w.maxAvg !== null && (
              <div className="flex flex-col gap-1.5 py-[18px] pr-4">
                <span className="text-[13px] text-muted">
                  Météo en {MONTHS_LONG[info.month]} (relevés {w.year})
                </span>
                <span className="tabular text-[17px] font-medium">
                  {w.minAvg}° / {w.maxAvg} °C
                </span>
                <span className="text-[13px] text-muted-2">
                  {w.rainyDays} jour{w.rainyDays > 1 ? "s" : ""} de pluie sur {w.days}
                </span>
              </div>
            )}
            {fx && (
              <div className="flex flex-col gap-1.5 py-[18px] pr-4">
                <span className="text-[13px] text-muted">Change du jour</span>
                <span className="tabular text-[17px] font-medium">
                  1 € = {fmtRate(fx.rate)} {fx.currency}
                </span>
                <span className="text-[13px] text-muted-2">
                  {fx.currencyName} · 100 € = {fmtRate(fx.rate * 100)} {fx.currency}
                </span>
              </div>
            )}
            {!fx && (
              <div className="flex flex-col gap-1.5 py-[18px] pr-4">
                <span className="text-[13px] text-muted">Monnaie</span>
                <span className="text-[17px] font-medium">Euro</span>
                <span className="text-[13px] text-muted-2">Pas de change à prévoir</span>
              </div>
            )}
          </div>
          {info.sights.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[15px] font-semibold">Lieux à voir autour</span>
              <div className="grid gap-x-8 border-t border-line [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
                {info.sights.map(s => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="plain-link flex items-center justify-between gap-3 border-b border-line py-3 text-[15px] hover:!text-gold-deep"
                  >
                    <span className="min-w-0 truncate">{s.title}</span>
                    <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted">
                      {s.km} km <ExternalLink className="h-3 w-3" aria-hidden />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
