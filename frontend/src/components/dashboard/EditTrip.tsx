"use client";
// Formulaire de modification du voyage (dates, voyageurs, budget, nom)
import { useState } from "react";
import axios from "axios";
import { today, updatePlan, type Plan } from "@/lib/plan";

export default function EditTrip({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const [form, setForm] = useState({
    name: plan.name || "",
    depart: plan.depart,
    ret: plan.ret,
    travelers: plan.travelers,
    budget: plan.budget ? String(plan.budget) : "",
  });
  const apply = async () => {
    const patch = {
      name: form.name.trim() || undefined,
      depart: form.depart,
      ret: form.ret < form.depart ? form.depart : form.ret,
      travelers: form.travelers,
      budget: form.budget ? Number(form.budget) : null,
    };
    updatePlan(patch);
    if (plan.tripId) {
      try {
        await axios.patch(`/api/trips/${plan.tripId}`, { start_date: patch.depart, end_date: patch.ret });
      } catch {
        /* ignoré */
      }
      // nom, voyageurs, budget : colonnes de la migration 0006
      try {
        await axios.patch(`/api/trips/${plan.tripId}`, {
          name: patch.name ?? null,
          travelers: patch.travelers,
          budget: patch.budget,
        });
      } catch {
        /* ignoré */
      }
    }
    onClose();
  };
  const field = "rounded-full border border-line-2 bg-white px-3 py-2 text-sm text-ink";
  return (
    <div className="grid gap-3 rounded-[24px] border border-line bg-white p-5 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
      <label className="col-span-full flex flex-col gap-1 text-xs font-semibold text-muted">
        Nom du voyage
        <input
          value={form.name}
          maxLength={80}
          placeholder={plan.destination}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
        Départ
        <input
          type="date"
          min={today()}
          value={form.depart}
          onChange={e => setForm(f => ({ ...f, depart: e.target.value }))}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
        Retour
        <input
          type="date"
          value={form.ret}
          min={form.depart}
          onChange={e => setForm(f => ({ ...f, ret: e.target.value }))}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
        Voyageurs
        <input
          type="number"
          min={1}
          max={9}
          value={form.travelers}
          onChange={e => setForm(f => ({ ...f, travelers: Math.max(1, Number(e.target.value) || 1) }))}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
        Budget total (€)
        <input
          type="number"
          min={0}
          step={50}
          value={form.budget}
          placeholder="Facultatif"
          onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
          className={field}
        />
      </label>
      <div className="col-span-full flex gap-2">
        <button onClick={apply} className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-paper hover:bg-ink-2">
          Enregistrer
        </button>
        <button
          onClick={onClose}
          className="rounded-full border border-line-2 px-5 py-2.5 text-sm font-bold hover:border-ink"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
