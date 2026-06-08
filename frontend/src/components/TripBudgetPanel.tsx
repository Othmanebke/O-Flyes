"use client";
import { motion } from "framer-motion";
import { Plane, Hotel, Compass, AlertCircle, TrendingUp, CheckCircle2 } from "lucide-react";

interface Booking {
  id: string;
  type: "flight" | "hotel" | "activity" | "transport";
  title: string;
  price_estimate?: number;
  status?: string;
}

interface Props {
  bookings: Booking[];
  tripTitle: string;
}

const TYPES = [
  { key: "flight", label: "Vols", icon: Plane, color: "#6B8ED6", bg: "rgba(107,142,214,0.12)", border: "rgba(107,142,214,0.25)" },
  { key: "hotel", label: "Hébergement", icon: Hotel, color: "#C5A059", bg: "rgba(197,160,89,0.12)", border: "rgba(197,160,89,0.25)" },
  { key: "activity", label: "Activités", icon: Compass, color: "#5BB88A", bg: "rgba(91,184,138,0.12)", border: "rgba(91,184,138,0.25)" },
  { key: "transport", label: "Transport", icon: Plane, color: "#A78BFA", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.25)" },
] as const;

export default function TripBudgetPanel({ bookings, tripTitle }: Props) {
  const total = bookings.reduce((s, b) => s + (b.price_estimate || 0), 0);
  const hasUnknownPrice = bookings.some(b => !b.price_estimate);
  const confirmed = bookings.filter(b => b.status === "confirmed").length;

  // Per-type breakdown
  const breakdown = TYPES.map(t => {
    const items = bookings.filter(b => b.type === t.key);
    const amount = items.reduce((s, b) => s + (b.price_estimate || 0), 0);
    const pct = total > 0 ? (amount / total) * 100 : 0;
    return { ...t, items, amount, pct, count: items.length };
  }).filter(t => t.count > 0);

  // Completion score based on required types
  const hasFlight = bookings.some(b => b.type === "flight");
  const hasHotel = bookings.some(b => b.type === "hotel");
  const hasActivity = bookings.some(b => b.type === "activity");
  const score = (hasFlight ? 35 : 0) + (hasHotel ? 35 : 0) + (hasActivity ? 20 : 0) + (bookings.length > 0 ? 10 : 0);

  if (bookings.length === 0) return null;

  return (
    <div className="trip-budget-panel">
      {/* Header */}
      <div className="tbp-header">
        <div>
          <p className="tbp-eyebrow">Budget estimé</p>
          <div className="tbp-total">
            <span className="tbp-amount">{total.toLocaleString("fr-FR")}€</span>
            {hasUnknownPrice && (
              <span className="tbp-unconfirmed">
                <AlertCircle className="w-3 h-3" /> estimation partielle
              </span>
            )}
          </div>
          {hasUnknownPrice && (
            <p className="tbp-note">
              Certains éléments n'ont pas de prix connu — le total est indicatif.
            </p>
          )}
        </div>
        <div className="tbp-score-wrap">
          <svg className="tbp-score-ring" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
            <motion.circle
              cx="18" cy="18" r="15" fill="none"
              stroke={score >= 80 ? "#5BB88A" : score >= 50 ? "#6B8ED6" : "#C5A059"}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="94.25"
              initial={{ strokeDashoffset: 94.25 }}
              animate={{ strokeDashoffset: 94.25 - (94.25 * score) / 100 }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
            />
          </svg>
          <div className="tbp-score-val">
            <span className="tbp-score-num">{score}</span>
            <span className="tbp-score-label">/ 100</span>
          </div>
          <p className="tbp-score-status">
            {score >= 80 ? "✅ Optimisé" : score >= 50 ? "🔄 En cours" : "⚠️ Incomplet"}
          </p>
        </div>
      </div>

      {/* Multi-bar */}
      <div className="tbp-multibar-wrap">
        <div className="tbp-multibar">
          {breakdown.map(t => (
            <motion.div
              key={t.key}
              className="tbp-bar-segment"
              style={{ backgroundColor: t.color }}
              initial={{ width: 0 }}
              animate={{ width: `${t.pct}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              title={`${t.label}: ${t.amount}€`}
            />
          ))}
        </div>
        <div className="tbp-legend">
          {breakdown.map(t => (
            <div key={t.key} className="tbp-legend-item">
              <span className="tbp-legend-dot" style={{ backgroundColor: t.color }} />
              <span className="tbp-legend-label">{t.label}</span>
              <span className="tbp-legend-pct">{Math.round(t.pct)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-type rows */}
      <div className="tbp-rows">
        {breakdown.map(t => {
          const Icon = t.icon;
          return (
            <div key={t.key} className="tbp-row">
              <div className="tbp-row-icon" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
                <Icon className="w-3.5 h-3.5" style={{ color: t.color }} />
              </div>
              <div className="tbp-row-info">
                <span className="tbp-row-label">{t.label}</span>
                <span className="tbp-row-count">{t.count} élément{t.count > 1 ? "s" : ""}</span>
              </div>
              <div className="tbp-row-bar-wrap">
                <div className="tbp-row-bar-bg">
                  <motion.div
                    className="tbp-row-bar-fill"
                    style={{ backgroundColor: t.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${t.pct}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                  />
                </div>
              </div>
              <span className="tbp-row-amount">{t.amount.toLocaleString("fr-FR")}€</span>
            </div>
          );
        })}
      </div>

      {/* Missing alerts */}
      {(!hasFlight || !hasHotel) && (
        <div className="tbp-alerts">
          {!hasFlight && (
            <div className="tbp-alert">
              <Plane className="w-3.5 h-3.5 text-orange-400" />
              <span>Aucun vol ajouté — ajoutez-en un depuis la section vols</span>
            </div>
          )}
          {!hasHotel && (
            <div className="tbp-alert">
              <Hotel className="w-3.5 h-3.5 text-orange-400" />
              <span>Hébergement non réservé</span>
            </div>
          )}
        </div>
      )}

      <style>{`
        .trip-budget-panel {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 24px;
          display: flex; flex-direction: column; gap: 20px;
        }
        .tbp-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
        .tbp-eyebrow { font-size: 10px; text-transform: uppercase; letter-spacing: 0.16em; font-weight: 700; color: var(--text-muted); margin-bottom: 6px; }
        .tbp-total { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
        .tbp-amount { font-size: 32px; font-weight: 800; color: var(--text-primary); line-height: 1; }
        .tbp-unconfirmed {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
          color: #f97316; background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.25);
          padding: 3px 8px; border-radius: 999px;
        }
        .tbp-note { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
        .tbp-score-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0; }
        .tbp-score-ring { width: 64px; height: 64px; }
        .tbp-score-val { position: absolute; display: flex; flex-direction: column; align-items: center; }
        .tbp-score-wrap { position: relative; width: 64px; }
        .tbp-score-val { position: absolute; top: 10px; left: 0; right: 0; display: flex; flex-direction: column; align-items: center; }
        .tbp-score-num { font-size: 18px; font-weight: 800; color: var(--text-primary); line-height: 1; }
        .tbp-score-label { font-size: 9px; color: var(--text-muted); }
        .tbp-score-status { font-size: 10px; font-weight: 600; color: var(--text-muted); text-align: center; margin-top: 4px; }

        .tbp-multibar-wrap { display: flex; flex-direction: column; gap: 10px; }
        .tbp-multibar { display: flex; height: 8px; border-radius: 999px; overflow: hidden; background: var(--bg-primary); gap: 2px; }
        .tbp-bar-segment { height: 100%; border-radius: 999px; min-width: 4px; }
        .tbp-legend { display: flex; flex-wrap: wrap; gap: 12px; }
        .tbp-legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; }
        .tbp-legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .tbp-legend-label { color: var(--text-muted); }
        .tbp-legend-pct { color: var(--text-primary); font-weight: 700; }

        .tbp-rows { display: flex; flex-direction: column; gap: 10px; }
        .tbp-row { display: flex; align-items: center; gap: 10px; }
        .tbp-row-icon { width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .tbp-row-info { display: flex; flex-direction: column; min-width: 100px; flex-shrink: 0; }
        .tbp-row-label { font-size: 12px; font-weight: 600; color: var(--text-primary); }
        .tbp-row-count { font-size: 10px; color: var(--text-muted); }
        .tbp-row-bar-wrap { flex: 1; }
        .tbp-row-bar-bg { height: 4px; background: var(--bg-primary); border-radius: 999px; overflow: hidden; }
        .tbp-row-bar-fill { height: 100%; border-radius: 999px; }
        .tbp-row-amount { font-size: 13px; font-weight: 800; color: var(--text-primary); flex-shrink: 0; min-width: 60px; text-align: right; }

        .tbp-alerts { display: flex; flex-direction: column; gap: 6px; }
        .tbp-alert {
          display: flex; align-items: center; gap: 8px;
          background: rgba(249,115,22,0.06); border: 1px solid rgba(249,115,22,0.2);
          border-radius: 10px; padding: 8px 12px;
          font-size: 11px; color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
