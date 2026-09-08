"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, MapPin } from "lucide-react";
import type { Trip } from "@/types/trip";

/* Pastille flottante affichée en haut d'une page explore quand tripId est dans l'URL.
   Volontairement en position fixed et calée sur la géométrie de la navbar (même largeur
   max, même style verre) : elle se lit comme un prolongement de la navbar plutôt que
   comme un second en-tête pleine largeur, et surtout elle ne prend aucune place dans le
   flux, donc le hero de la page reste plein cadre exactement comme sans voyage en cours. */
export default function TripContextBanner() {
  const params = useSearchParams();
  const tripId = params.get("tripId");
  const dest = params.get("dest");
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    if (!tripId) return;
    axios.get<Trip[]>("/api/trips")
      .then(res => {
        const found = res.data.find(t => t.id === tripId);
        if (found) setTrip(found);
      })
      .catch(() => {});
  }, [tripId]);

  if (!tripId) return null;

  return (
    <div className="trip-ctx-wrap">
      <div className="trip-ctx-pill">
        <div className="trip-ctx-left">
          <span className="trip-ctx-icon">
            <MapPin className="w-3.5 h-3.5" />
          </span>
          <span className="trip-ctx-labels">
            <span className="trip-ctx-sub">Voyage en cours</span>
            <span className="trip-ctx-name">
              {trip?.title ?? "Chargement…"}
              {dest && dest !== trip?.title && <span className="trip-ctx-dest"> · {dest}</span>}
            </span>
          </span>
        </div>

        <Link href={`/dashboard?trip=${tripId}`} className="trip-ctx-back">
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          <span className="trip-ctx-back-long">Retour au dashboard</span>
          <span className="trip-ctx-back-short">Dashboard</span>
        </Link>
      </div>

      <style>{`
        .trip-ctx-wrap {
          position: fixed;
          top: 88px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 45;
          width: calc(100% - 2rem);
          max-width: 72rem;
          pointer-events: none;
        }
        .trip-ctx-pill {
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 10px 8px 14px;
          border-radius: 18px;
          background: rgba(20, 24, 34, 0.72);
          border: 1px solid rgba(197, 160, 89, 0.28);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        .trip-ctx-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .trip-ctx-icon {
          width: 26px;
          height: 26px;
          border-radius: 8px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #C5A059;
          background: rgba(197, 160, 89, 0.14);
          border: 1px solid rgba(197, 160, 89, 0.28);
        }
        .trip-ctx-labels {
          display: flex;
          flex-direction: column;
          min-width: 0;
          line-height: 1.25;
        }
        .trip-ctx-sub {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-weight: 700;
          color: rgba(197, 160, 89, 0.65);
        }
        .trip-ctx-name {
          font-size: 12.5px;
          font-weight: 600;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .trip-ctx-dest {
          color: rgba(255, 255, 255, 0.45);
          font-weight: 400;
        }
        .trip-ctx-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.62);
          padding: 8px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(255, 255, 255, 0.04);
          transition: color 0.2s, border-color 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .trip-ctx-back:hover {
          color: #ffffff;
          border-color: rgba(197, 160, 89, 0.45);
          background: rgba(197, 160, 89, 0.10);
        }
        .trip-ctx-back:focus-visible {
          outline: 2px solid rgba(197, 160, 89, 0.6);
          outline-offset: 2px;
        }
        .trip-ctx-back-short { display: none; }

        /* Sur mobile la navbar est plus basse et la place manque : pastille plus compacte,
           libellé du bouton raccourci, et on garde le nom du voyage tronqué plutôt que
           de laisser la pastille déborder de l'écran. */
        @media (max-width: 640px) {
          .trip-ctx-wrap { top: 80px; width: calc(100% - 1.5rem); }
          .trip-ctx-pill { padding: 7px 8px 7px 10px; border-radius: 15px; gap: 8px; }
          .trip-ctx-sub { display: none; }
          .trip-ctx-name { font-size: 12px; }
          .trip-ctx-dest { display: none; }
          .trip-ctx-back { padding: 7px 10px; font-size: 9.5px; }
          .trip-ctx-back-long { display: none; }
          .trip-ctx-back-short { display: inline; }
        }
      `}</style>
    </div>
  );
}
