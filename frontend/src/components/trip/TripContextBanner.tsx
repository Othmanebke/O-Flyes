"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, MapPin } from "lucide-react";
import type { Trip } from "@/types/trip";

/* Bandeau affiché en haut d'une page explore quand tripId est dans l'URL */
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
    <div className="trip-ctx-banner">
      <div className="trip-ctx-inner">
        <div className="trip-ctx-left">
          <div className="trip-ctx-icon">
            <MapPin className="w-4 h-4 text-gold" />
          </div>
          <div>
            <p className="trip-ctx-sub">Vous enrichissez votre voyage</p>
            <p className="trip-ctx-name">
              {trip?.title ?? "Chargement…"}
              {dest && <span className="trip-ctx-dest"> · {dest}</span>}
            </p>
          </div>
        </div>
        <Link href="/dashboard" className="trip-ctx-back">
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour au dashboard
        </Link>
      </div>

      <style>{`
        .trip-ctx-banner {
          position: sticky; top: 72px; z-index: 40;
          background: rgba(197,160,89,0.08);
          border-bottom: 1px solid rgba(197,160,89,0.2);
          backdrop-filter: blur(16px);
        }
        .trip-ctx-inner {
          max-width: 1280px; margin: 0 auto; padding: 10px 24px;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          flex-wrap: wrap;
        }
        @media(min-width:768px) { .trip-ctx-inner { padding: 10px 48px; } }
        .trip-ctx-left { display: flex; align-items: center; gap: 10px; }
        .trip-ctx-icon {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          background: rgba(197,160,89,0.15); border: 1px solid rgba(197,160,89,0.3);
          display: flex; align-items: center; justify-content: center;
        }
        .trip-ctx-sub { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700; color: rgba(197,160,89,0.7); }
        .trip-ctx-name { font-size: 13px; font-weight: 700; color: #C5A059; }
        .trip-ctx-dest { color: var(--text-muted); font-weight: 400; }
        .trip-ctx-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
          color: var(--text-muted); padding: 6px 14px; border-radius: 8px;
          border: 1px solid var(--border-color); background: var(--bg-secondary);
          transition: all 0.2s; white-space: nowrap;
        }
        .trip-ctx-back:hover { color: var(--text-primary); border-color: var(--text-muted); }
      `}</style>
    </div>
  );
}
