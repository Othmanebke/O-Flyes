"use client";
// Prochaines étapes du voyage en cours (sauvegarde, vols, hôtel, activités…)
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarPlus,
  Check,
  ExternalLink,
  FileText,
  Loader2,
  MessageSquare,
  Share2,
} from "lucide-react";
import Photo from "@/components/ui/Photo";
import { shortTitle } from "@/lib/trip-format";
import { eur } from "@/lib/catalog";
import { ask } from "@/lib/chat";
import { formatRange, setItemBooked, type Plan } from "@/lib/plan";
import { ICON, photoOf, daysUntil, downloadICS, share } from "./helpers";

export default function NextSteps({
  plan,
  loggedIn,
  saving,
  onSave,
}: {
  plan: Plan;
  loggedIn: boolean;
  saving: boolean;
  onSave: () => void;
}) {
  const over = daysUntil(plan.ret) < 0;
  const until = daysUntil(plan.depart);
  const todo = plan.items.filter(i => !i.booked);
  const done = plan.items.length - todo.length;
  const ghost =
    "flex items-center gap-2 whitespace-nowrap rounded-full border border-white/25 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10";

  if (over) {
    return (
      <section className="relative overflow-hidden rounded-[24px] bg-ink p-6 text-white sm:p-8">
        <Photo k={photoOf(plan.destination)} alt="" sizes="100vw" className="absolute inset-0 opacity-25" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div className="flex max-w-[560px] flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-gold">Voyage terminé</span>
            <h2 className="m-0 text-[clamp(24px,3vw,34px)] font-extrabold leading-tight tracking-[-0.03em]">
              Bon retour de {plan.destination}
            </h2>
            <p className="m-0 text-[15px] text-white/75">
              Ce carnet reste disponible pour retrouver vos adresses. Prêt pour la suite ?
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => ask("")}
              className="flex items-center gap-3 rounded-full bg-white py-1.5 pl-4 pr-1.5 text-sm font-bold text-ink hover:bg-[#FBF6EA]"
            >
              Planifier le prochain voyage
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-gold">
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </span>
            </button>
            <Link href="/explore" className={`plain-link !text-white ${ghost}`}>
              Trouver une idée
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (todo.length === 0) {
    return (
      <section className="relative overflow-hidden rounded-[24px] bg-ink p-6 text-white sm:p-8">
        <Photo k={photoOf(plan.destination)} alt="" sizes="100vw" className="absolute inset-0 opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-transparent" />
        <div className="relative flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-gold">
              <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> Tout est réservé
            </span>
            <h2 className="m-0 text-[clamp(24px,3vw,34px)] font-extrabold leading-tight tracking-[-0.03em]">
              Bon voyage !{" "}
              {until > 0
                ? `Départ dans ${until} jour${until > 1 ? "s" : ""}.`
                : until === 0
                  ? "C'est aujourd'hui."
                  : "Profitez bien."}
            </h2>
          </div>
          <ul className="m-0 grid list-none gap-2 p-0 text-sm text-white/80 [grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))]">
            {[
              "Pièce d'identité ou passeport valide pour les dates du voyage",
              "Assurance voyage et carte de paiement utilisable à l'étranger",
              "Confirmations de réservation enregistrées hors ligne",
              "Enregistrement en ligne du vol, souvent ouvert 24 à 48 h avant",
            ].map(t => (
              <li key={t} className="flex items-start gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                {t}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <a href="/carnet" target="_blank" rel="noopener noreferrer" className={`plain-link !text-white ${ghost}`}>
              <FileText className="h-4 w-4" aria-hidden /> Carnet PDF
            </a>
            <button onClick={() => downloadICS(plan)} className={ghost}>
              <CalendarPlus className="h-4 w-4" aria-hidden /> Ajouter à l&apos;agenda
            </button>
            <button onClick={() => share(plan)} className={ghost}>
              <Share2 className="h-4 w-4" aria-hidden /> Partager avec mes compagnons
            </button>
            <button
              onClick={() =>
                ask(
                  `Je pars à ${plan.destination} (${formatRange(plan.depart, plan.ret)}). Que mettre dans ma valise ?`,
                )
              }
              className={ghost}
            >
              <MessageSquare className="h-4 w-4" aria-hidden /> Conseils valise
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4 rounded-[24px] border border-gold/40 bg-[#FBF6EA] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex max-w-[620px] flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-gold-deep">
            Voyage planifié · dernière étape
          </span>
          <h2 className="m-0 text-[clamp(22px,2.6vw,28px)] font-extrabold leading-tight tracking-[-0.03em]">
            Il ne reste plus qu&apos;à réserver
          </h2>
          <p className="m-0 text-sm text-muted-2">
            AIVANA ne réserve pas à votre place : chaque lien ouvre le site du partenaire avec vos dates, où vous verrez
            le prix du jour. Cochez « C&apos;est réservé » au fur et à mesure.
          </p>
        </div>
        <div className="flex min-w-[160px] flex-col items-end gap-1.5">
          <span className="tabular text-2xl font-extrabold">
            {done} / {plan.items.length}
          </span>
          <span className="text-xs text-muted">réservé{done > 1 ? "s" : ""}</span>
          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-ok transition-all"
              style={{ width: `${(done / Math.max(1, plan.items.length)) * 100}%` }}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {todo.map(i => {
          const Icon = ICON[i.type];
          return (
            <div key={i.key} className="flex flex-wrap items-center gap-3 rounded-[16px] bg-white px-3 py-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3EEE6]">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-bold">{shortTitle(i)}</span>
                <span className="truncate text-xs text-muted">
                  {i.provider ? `Chez ${i.provider} · ` : ""}
                  {i.price != null ? `${eur(i.price)} estimé` : "prix à vérifier"}
                </span>
              </span>
              <span className="flex items-center gap-2">
                {i.url && (
                  <a
                    href={i.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="plain-link flex items-center gap-1.5 whitespace-nowrap rounded-full bg-ink px-3.5 py-2 text-xs font-bold !text-white hover:bg-ink-2"
                  >
                    Réserver <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                )}
                <button
                  onClick={() => setItemBooked(i.key, true)}
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line-2 px-3.5 py-2 text-xs font-bold hover:border-ok hover:text-ok"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> C&apos;est réservé
                </button>
              </span>
            </div>
          );
        })}
      </div>
      {!plan.tripId && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gold/30 pt-4 text-sm">
          <span className="text-muted-2">Ce voyage n&apos;est enregistré que sur cet appareil.</span>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white hover:bg-ink-2 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {loggedIn ? "Sauvegarder dans mon compte" : "Sauvegarder avec un compte"}
          </button>
        </div>
      )}
    </section>
  );
}
