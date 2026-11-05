"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Plus } from "lucide-react";
import { eur } from "@/lib/catalog";
import { fitToBudget, proposalItems } from "@/lib/itinerary";
import { addItem, planTotal, removeItem, toast, usePlan, type PlanItem } from "@/lib/plan";
import type { RoadtripProposal } from "@/types/roadtrip";

export interface ProposalContext {
  originCity?: string;
  travelers?: number;
  budgetEur?: number | null;
  booked?: string[];
}

/* Itinéraire jour par jour généré par le copilote pour un voyage sauvegardé. */
export default function TripProposal({
  tripId,
  destinationName,
  context,
}: {
  tripId: string;
  destinationName?: string;
  context?: ProposalContext;
}) {
  const [proposal, setProposal] = useState<RoadtripProposal | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const plan = usePlan();

  // Itinéraire enregistré avec le voyage ; à défaut, la copie locale
  useEffect(() => {
    let cancelled = false;
    let local: RoadtripProposal | null = null;
    try {
      local = JSON.parse(localStorage.getItem(`roadtrip_${tripId}`) || "null");
    } catch {
      /* ignoré */
    }
    setProposal(local?.steps?.length ? local : null);
    axios
      .get(`/api/trips/${tripId}/proposal`)
      .then(r => {
        if (!cancelled && r.data?.proposal?.steps?.length) setProposal(r.data.proposal);
      })
      .catch(() => {
        /* hors ligne : on garde la copie locale */
      });
    return () => {
      cancelled = true;
    };
  }, [tripId]);

  const generate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await axios.post(`/api/trips/${tripId}/proposal`, context || {}, { timeout: 90000 });
      if (res.data?.proposal) {
        setProposal(res.data.proposal);
        localStorage.setItem(`roadtrip_${tripId}`, JSON.stringify(res.data.proposal));
      }
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          "La génération a échoué. Réessayez dans un instant.",
      );
    } finally {
      setGenerating(false);
    }
  };

  if (!proposal) {
    return (
      <div className="flex flex-col items-start gap-3">
        <span className="text-base font-semibold">Itinéraire jour par jour</span>
        <p className="m-0 text-sm leading-relaxed text-muted-2">
          Le copilote propose un parcours en étapes pour {destinationName || "ce voyage"} : où aller, combien de jours
          rester, quoi ne pas manquer et comment se déplacer.
        </p>
        {error && <p className="m-0 text-sm text-danger">{error}</p>}
        <button
          onClick={generate}
          disabled={generating}
          className="flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-ink-2 disabled:opacity-60"
        >
          {generating && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {generating ? "Génération…" : "Générer l'itinéraire"}
        </button>
      </div>
    );
  }

  const groups = plan ? proposalItems(proposal, plan, tripId) : [];
  const all = groups.flatMap(g => g.items);
  const inTrip = (key: string) => !!plan?.items.some(i => i.key === key);
  const pending = all.filter(i => !inTrip(i.key));
  const added = all.length - pending.length;
  const pendingCost = pending.reduce((s, i) => s + (i.price || 0), 0);
  const spent = planTotal(plan);
  const budget = plan?.budget ?? null;
  const remaining = budget != null ? budget - spent : null;
  const fitting = remaining != null && pendingCost > remaining ? fitToBudget(pending, Math.max(0, remaining)) : null;

  const addAll = async (items: PlanItem[]) => {
    for (const i of items) await addItem(i);
    toast(
      `${items.length} activité${items.length > 1 ? "s" : ""} ajoutée${items.length > 1 ? "s" : ""} à l'itinéraire`,
    );
  };
  const removeAll = async () => {
    for (const i of all) if (inTrip(i.key)) await removeItem(i.key);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xl font-bold tracking-[-0.03em]">{proposal.title}</span>
          <span className="text-[13px] text-muted">
            {proposal.totalDays} jours
            {proposal.generatedAt ? ` · généré le ${new Date(proposal.generatedAt).toLocaleDateString("fr-FR")}` : ""}
          </span>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="flex items-center gap-2 rounded-full border border-line-2 px-3.5 py-2 text-[13px] hover:border-ink disabled:opacity-60"
        >
          {generating && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />} Régénérer
        </button>
      </div>
      {error && <p className="m-0 text-sm text-danger">{error}</p>}
      <p className="m-0 text-base leading-[1.65] text-muted-2">{proposal.summary}</p>

      {/* Ajout au voyage, avec l'effet sur le budget */}
      {plan && all.length > 0 && (
        <div className="flex flex-col gap-3 rounded-[20px] bg-paper p-4">
          {pending.length > 0 ? (
            <>
              <span className="text-sm">
                <strong>
                  {pending.length} activité{pending.length > 1 ? "s" : ""}
                </strong>{" "}
                à ajouter · environ <strong>{eur(pendingCost)}</strong> pour {plan.travelers} voyageur
                {plan.travelers > 1 ? "s" : ""}
                {remaining != null &&
                  (pendingCost <= remaining ? (
                    <span className="text-ok"> · il restera {eur(remaining - pendingCost)} sur votre budget</span>
                  ) : (
                    <span className="text-danger"> · dépasse votre budget de {eur(pendingCost - remaining)}</span>
                  ))}
                {budget == null && <span className="text-muted"> · aucun budget fixé</span>}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => addAll(pending)}
                  className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-ink-2"
                >
                  <Plus className="h-4 w-4" aria-hidden /> Tout ajouter au voyage
                </button>
                {fitting && fitting.length > 0 && (
                  <button
                    onClick={() => addAll(fitting)}
                    className="rounded-full border border-ink px-4 py-2 text-sm font-bold hover:bg-white"
                  >
                    Ajouter en restant dans le budget ({fitting.length} activité{fitting.length > 1 ? "s" : ""},{" "}
                    {eur(fitting.reduce((s, i) => s + (i.price || 0), 0))})
                  </button>
                )}
              </div>
            </>
          ) : (
            <span className="text-sm text-ok">
              L&apos;itinéraire est dans votre voyage : les activités sont rangées jour par jour dans le carnet.
            </span>
          )}
          {added > 0 && (
            <button onClick={removeAll} className="self-start text-[13px] text-muted-2 hover:text-danger">
              Retirer les {added} activité{added > 1 ? "s" : ""} ajoutée{added > 1 ? "s" : ""} depuis cet itinéraire
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col border-t border-line">
        {proposal.steps.map((s, i) => {
          const items = groups[i]?.items || [];
          const missing = items.filter(it => !inTrip(it.key));
          const cost = missing.reduce((sum, it) => sum + (it.price || 0), 0);
          return (
            <div
              key={i}
              className="grid gap-5 border-b border-line py-[18px] [grid-template-columns:minmax(90px,140px)_minmax(0,1fr)]"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold">{s.dayRange}</span>
                <span className="text-[13px] text-muted">{s.locationName}</span>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <p className="m-0 leading-relaxed text-muted-2">{s.description}</p>
                {!!s.activities?.length && (
                  <ul className="m-0 flex flex-col gap-1 pl-0">
                    {s.activities.map((a, j) => (
                      <li key={j} className="flex gap-3">
                        <span className={items[j] && inTrip(items[j].key) ? "text-ok" : "text-gold-deep"}>
                          {items[j] && inTrip(items[j].key) ? "✓" : "—"}
                        </span>
                        {a}
                      </li>
                    ))}
                  </ul>
                )}
                {(s.transportToNext || s.estimatedCost) && (
                  <span className="text-[13px] text-muted">
                    {[
                      s.transportToNext && `Ensuite : ${s.transportToNext}`,
                      s.estimatedCost && `Coût estimé : ${s.estimatedCost}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                )}
                {plan && missing.length > 0 && (
                  <button
                    onClick={() => addAll(missing)}
                    className="flex items-center gap-1.5 self-start rounded-full border border-line-2 px-3 py-1.5 text-[13px] font-semibold hover:border-ink"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden /> Ajouter ce jour{cost ? ` · ${eur(cost)}` : ""}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
