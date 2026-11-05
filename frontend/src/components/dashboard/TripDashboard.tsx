"use client";
// Tableau de bord d'un voyage : indicateurs, itinéraire jour par jour, budget, éléments
import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  CalendarPlus,
  Check,
  Circle,
  ExternalLink,
  FileText,
  Loader2,
  MessageSquare,
  Pencil,
  Share2,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import Photo from "@/components/ui/Photo";
import { CopilotMark } from "@/components/ui/Logo";
import TripProposal from "@/components/trip/TripProposal";
import TravelAdvice from "@/components/trip/TravelAdvice";
import { KIND, fmtDay, shortTitle } from "@/lib/trip-format";
import { eur, findDestination, searchCity } from "@/lib/catalog";
import { ask } from "@/lib/chat";
import {
  addDays,
  flightCoverage,
  formatRange,
  nightsBetween,
  planTotal,
  removeItem,
  setItemBooked,
  setItemDate,
  toast,
  tripDays,
  tripName,
  type Plan,
  type PlanItem,
} from "@/lib/plan";
import { ICON, COLORS, photoOf, daysUntil, downloadICS, shareUrl, share, stopSharing } from "./helpers";
import { Panel, Kpi, iconBtn } from "./ui";
import NextSteps from "./NextSteps";
import EditTrip from "./EditTrip";

export default function TripDashboard({
  plan,
  editing,
  setEditing,
  saving,
  onSave,
  onRemove,
  loggedIn,
}: {
  plan: Plan;
  editing: boolean;
  setEditing: (b: boolean) => void;
  saving: boolean;
  onSave: () => void;
  onRemove: () => void;
  loggedIn: boolean;
}) {
  const spent = planTotal(plan);
  const nights = nightsBetween(plan.depart, plan.ret);
  const cat = findDestination(plan.destination);
  const city = cat ? searchCity(cat) : plan.destination;
  const ctx = `dest=${encodeURIComponent(city)}&depart=${plan.depart}&return=${plan.ret}&pax=${plan.travelers}`;
  const cover = flightCoverage(plan);
  const has = (t: string) => plan.items.some(i => i.type === t);
  const until = daysUntil(plan.depart);

  const checklist = [
    { label: "Vol aller", done: cover.outbound, href: `/explore/flights?${ctx}` },
    {
      label: "Vol retour",
      done: cover.return,
      href: cover.outbound ? "/explore/flights?leg=retour" : `/explore/flights?${ctx}`,
    },
    {
      label: `Hébergement · ${nights} nuit${nights > 1 ? "s" : ""}`,
      done: has("hotel"),
      href: `/explore/hotels?${ctx}`,
    },
    { label: "Activités sur place", done: has("activity"), href: `/explore/activities?${ctx}` },
  ];
  const ready = checklist.filter(c => c.done).length;

  const byType = (["flight", "hotel", "activity"] as const).map(t => ({
    type: t,
    label: t === "flight" ? "Vols" : t === "hotel" ? "Hébergement" : "Activités",
    amount: plan.items.filter(i => i.type === t).reduce((s, i) => s + (i.price || 0), 0),
  }));

  const days = useMemo(() => {
    const out: { date: string; items: PlanItem[] }[] = [];
    for (let n = 0; n <= Math.min(nights, 30); n++) {
      const date = addDays(plan.depart, n);
      out.push({ date, items: plan.items.filter(i => (i.date || "") === date) });
    }
    return out;
  }, [plan, nights]);
  const unplaced = plan.items.filter(i => !i.date || !days.some(d => d.date === i.date));
  const dayOptions = tripDays(plan);
  const sorted = [...plan.items].sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));

  return (
    <>
      {/* En-tête du voyage */}
      <div className="flex flex-wrap items-center gap-4 rounded-[24px] border border-line bg-white p-4">
        <Photo
          k={photoOf(plan.destination)}
          alt={plan.destination}
          sizes="88px"
          className="h-[72px] w-[88px] shrink-0 rounded-[16px]"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="m-0 text-[clamp(24px,3vw,32px)] font-extrabold leading-none tracking-[-0.03em]">
              {tripName(plan)}
            </h1>
            <span
              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${plan.tripId ? "bg-[#CFE6D6] text-ok" : "bg-gold-soft text-gold-deep"}`}
            >
              {plan.tripId ? "Sauvegardé" : "Brouillon"}
            </span>
          </div>
          <span className="text-sm text-muted-2">
            {formatRange(plan.depart, plan.ret)} · {nights} nuit{nights > 1 ? "s" : ""} · {plan.travelers} voyageur
            {plan.travelers > 1 ? "s" : ""} · depuis {plan.origin}
            {plan.name ? ` · ${plan.destination}` : ""}
          </span>
          {plan.shareId && (
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
              <span className="font-semibold text-ok">Lien public actif</span>
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl(plan.shareId!)).then(() => toast("Lien copié"))}
                className="font-semibold text-gold-deep hover:text-[#6E5323]"
              >
                Copier
              </button>
              <a href={`/voyage/${plan.shareId}`} target="_blank" rel="noopener noreferrer" className="font-semibold">
                Ouvrir
              </a>
              <button onClick={() => stopSharing(plan)} className="text-muted-2 hover:text-danger">
                Désactiver
              </button>
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!plan.tripId && (
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-2 whitespace-nowrap rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white hover:bg-ink-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {loggedIn ? "Sauvegarder" : "Sauvegarder avec un compte"}
            </button>
          )}
          <button
            onClick={() => setEditing(!editing)}
            aria-label="Modifier les dates, voyageurs et budget"
            title="Modifier"
            className={iconBtn}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button onClick={() => share(plan)} aria-label="Partager" title="Partager" className={iconBtn}>
            <Share2 className="h-4 w-4" aria-hidden />
          </button>
          <a
            href="/carnet"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Télécharger le carnet en PDF"
            title="Carnet PDF"
            className={`plain-link !text-ink ${iconBtn}`}
          >
            <FileText className="h-4 w-4" aria-hidden />
          </a>
          <button
            onClick={() => downloadICS(plan)}
            aria-label="Exporter dans l'agenda"
            title="Exporter dans l'agenda (.ics)"
            className={iconBtn}
          >
            <CalendarPlus className="h-4 w-4" aria-hidden />
          </button>
          <button
            onClick={onRemove}
            aria-label="Supprimer ce voyage"
            title="Supprimer"
            className={`${iconBtn} hover:!border-danger hover:text-danger`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      {editing && <EditTrip plan={plan} onClose={() => setEditing(false)} />}

      {/* Fin de la planification : ce qui se passe ensuite */}
      {plan.items.length > 0 && (ready === checklist.length || daysUntil(plan.ret) < 0) && (
        <NextSteps plan={plan} loggedIn={loggedIn} saving={saving} onSave={onSave} />
      )}

      {/* Indicateurs */}
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))]">
        <Kpi
          icon={<Wallet className="h-4 w-4" aria-hidden />}
          label="Total estimé"
          value={eur(spent)}
          sub={`${plan.items.length} élément${plan.items.length > 1 ? "s" : ""} · ${eur(spent / plan.travelers)} / pers.`}
        />
        <Kpi
          icon={<Circle className="h-4 w-4" aria-hidden />}
          label="Budget"
          value={plan.budget ? `${Math.round((spent / plan.budget) * 100)} %` : "—"}
          sub={
            plan.budget ? (
              spent > plan.budget ? (
                <span className="text-danger">
                  {eur(spent - plan.budget)} au-dessus de {eur(plan.budget)}
                </span>
              ) : (
                <span className="text-ok">
                  {eur(plan.budget - spent)} restants sur {eur(plan.budget)}
                </span>
              )
            ) : (
              <button onClick={() => setEditing(true)} className="font-semibold text-gold-deep hover:text-[#6E5323]">
                Fixer un budget
              </button>
            )
          }
        >
          {plan.budget ? (
            <div className="h-1.5 overflow-hidden rounded-full bg-[#EFEBE4]">
              <div
                className={`h-full rounded-full ${spent > plan.budget ? "bg-danger" : "bg-gold"}`}
                style={{ width: `${Math.min(100, (spent / plan.budget) * 100)}%` }}
              />
            </div>
          ) : null}
        </Kpi>
        <Kpi
          icon={<CalendarClock className="h-4 w-4" aria-hidden />}
          label="Départ"
          value={until > 0 ? `J-${until}` : until === 0 ? "Aujourd'hui" : "Passé"}
          sub={fmtDay(plan.depart, { weekday: "long", day: "numeric", month: "long" })}
        />
        <Kpi
          icon={<Check className="h-4 w-4" aria-hidden />}
          label="Étapes prêtes"
          value={`${ready} / 4`}
          sub="Aller, retour, hôtel, activité"
        >
          <div className="grid grid-cols-4 gap-1">
            {checklist.map(c => (
              <span key={c.label} className={`h-1.5 rounded-full ${c.done ? "bg-ok" : "bg-[#EFEBE4]"}`} />
            ))}
          </div>
        </Kpi>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
        {/* Colonne principale */}
        <div className="flex min-w-0 flex-col gap-5">
          <Panel
            title="Réservations"
            action={
              <span className="text-[13px] text-muted">
                {plan.items.length} élément{plan.items.length > 1 ? "s" : ""} · prix estimés
              </span>
            }
          >
            {sorted.length === 0 ? (
              <p className="m-0 text-sm text-muted">
                Rien pour l&apos;instant. Ajoutez un vol, un hôtel ou une activité avec la checklist.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-line">
                {sorted.map(i => {
                  const Icon = ICON[i.type];
                  return (
                    <div
                      key={i.key}
                      className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3EEE6]">
                        <Icon className="h-[17px] w-[17px]" aria-hidden />
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-[15px] font-bold">{shortTitle(i)}</span>
                        <span className="truncate text-[13px] text-muted">{i.subtitle}</span>
                        {/* Les vols suivent leurs dates ; hôtels et activités se placent dans le séjour */}
                        {i.type !== "flight" && (
                          <select
                            value={i.date && dayOptions.some(d => d.date === i.date) ? i.date : ""}
                            onChange={e => setItemDate(i.key, e.target.value || null)}
                            aria-label={`Jour de « ${shortTitle(i)} »`}
                            className={`mt-1 self-start rounded-full border px-2.5 py-1 text-xs font-semibold ${i.date ? "border-line-2 bg-white text-ink" : "border-gold-deep/50 bg-gold-soft text-gold-deep"}`}
                          >
                            <option value="">À placer dans le séjour</option>
                            {dayOptions.map(d => (
                              <option key={d.date} value={d.date}>
                                {d.label}
                              </option>
                            ))}
                          </select>
                        )}
                        {i.type === "flight" && i.date && (
                          <span className="text-[13px] text-muted">{fmtDay(i.date)}</span>
                        )}
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="flex flex-col items-end">
                          <span className="tabular whitespace-nowrap text-[15px] font-extrabold">
                            {i.price === 0 ? "Gratuit" : i.price != null ? eur(i.price) : "—"}
                          </span>
                          <button
                            onClick={() => setItemBooked(i.key, !i.booked)}
                            title={i.booked ? "Annuler : pas encore réservé" : "Je l'ai réservé chez le partenaire"}
                            className={`mt-0.5 flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold transition-colors ${i.booked ? "bg-[#CFE6D6] text-ok hover:bg-[#BFDCC8]" : "bg-gold-soft text-gold-deep hover:bg-[#EAD7AC]"}`}
                          >
                            {i.booked ? (
                              <>
                                <Check className="h-3 w-3" strokeWidth={3} aria-hidden /> Réservé
                              </>
                            ) : (
                              "À réserver"
                            )}
                          </button>
                        </span>
                        {i.url && (
                          <a
                            href={i.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Réserver chez le partenaire"
                            title="Réserver chez le partenaire"
                            className="text-muted hover:text-ink"
                          >
                            <ExternalLink className="h-4 w-4" aria-hidden />
                          </a>
                        )}
                        <button
                          onClick={() => removeItem(i.key)}
                          aria-label={`Retirer ${i.title}`}
                          title="Retirer"
                          className="text-muted hover:text-danger"
                        >
                          <X className="h-4 w-4" aria-hidden />
                        </button>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          <Panel
            title="Itinéraire"
            action={
              <span className="text-[13px] text-muted">
                {days.length} jour{days.length > 1 ? "s" : ""}
              </span>
            }
          >
            <ol className="m-0 flex list-none flex-col p-0">
              {days.map((d, n) => {
                const lines = [
                  ...(n === 0 ? [`Départ de ${plan.origin}`] : []),
                  ...d.items.map(i => `${KIND[i.type]} · ${shortTitle(i)}`),
                  ...(n === days.length - 1 && n > 0 ? [`Retour vers ${plan.origin}`] : []),
                ];
                return (
                  <li key={d.date} className="grid grid-cols-[64px_16px_minmax(0,1fr)] gap-3">
                    <span className="pt-0.5 text-right text-[13px] font-bold text-muted">
                      {fmtDay(d.date, { day: "numeric", month: "short" })}
                    </span>
                    <span className="relative flex justify-center">
                      <span
                        className={`relative z-[1] mt-1.5 h-2.5 w-2.5 rounded-full ${lines.length ? "bg-gold" : "bg-line-2"}`}
                      />
                      {n < days.length - 1 && <span className="absolute bottom-0 top-3 w-px bg-line" />}
                    </span>
                    <span className="flex flex-col gap-0.5 pb-4">
                      <span className="text-[13px] font-extrabold">Jour {n + 1}</span>
                      {lines.length ? (
                        lines.map((l, j) => (
                          <span key={j} className="text-sm text-muted-2">
                            {l}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted">Journée libre</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>
            {unplaced.length > 0 && (
              <div className="flex flex-col gap-1 rounded-[16px] bg-paper p-3 text-sm">
                <span className="text-[13px] font-bold text-muted">À placer dans le séjour</span>
                {unplaced.map(i => (
                  <span key={i.key} className="text-muted-2">
                    {KIND[i.type]} · {shortTitle(i)}
                  </span>
                ))}
              </div>
            )}
          </Panel>

          <Panel
            title="Bon à savoir avant de partir"
            action={<span className="text-[13px] text-muted">{plan.country || cat?.country || plan.destination}</span>}
          >
            <TravelAdvice country={plan.country || cat?.country} />
          </Panel>
        </div>

        {/* Colonne latérale */}
        <div className="flex min-w-0 flex-col gap-5">
          <Panel title="Checklist" action={<span className="text-[13px] font-bold text-ok">{ready}/4</span>}>
            <div className="flex flex-col gap-2">
              {checklist.map(c => (
                <Link
                  key={c.label}
                  href={c.href}
                  className={`plain-link flex items-center gap-3 rounded-[16px] border px-3 py-2.5 text-sm ${c.done ? "border-transparent bg-[#EEF6F0]" : "border-dashed border-line-2 hover:border-ink"}`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${c.done ? "bg-ok text-white" : "border-[1.5px] border-line-2"}`}
                  >
                    {c.done && <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />}
                  </span>
                  <span
                    className={`flex-1 font-semibold ${c.done ? "text-muted-2 line-through decoration-ok/50" : ""}`}
                  >
                    {c.label}
                  </span>
                  {!c.done && <span className="text-[13px] font-bold text-gold-deep">Ajouter</span>}
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="Répartition du budget">
            {spent > 0 ? (
              <>
                <div className="flex h-3 overflow-hidden rounded-full bg-[#EFEBE4]">
                  {byType
                    .filter(b => b.amount > 0)
                    .map(b => (
                      <span
                        key={b.type}
                        style={{ width: `${(b.amount / spent) * 100}%`, background: COLORS[b.type] }}
                      />
                    ))}
                </div>
                <div className="flex flex-col gap-2">
                  {byType.map(b => (
                    <div key={b.type} className="flex items-center gap-2.5 text-sm">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[b.type] }} />
                      <span className="flex-1 text-muted-2">{b.label}</span>
                      <span className="tabular font-bold">{eur(b.amount)}</span>
                      <span className="tabular w-10 text-right text-[13px] text-muted">
                        {spent ? Math.round((b.amount / spent) * 100) : 0} %
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="m-0 text-sm text-muted">La répartition apparaîtra dès le premier ajout.</p>
            )}
          </Panel>

          <Panel title="Copilote">
            <div className="flex items-start gap-3">
              <CopilotMark size={36} />
              <p className="m-0 rounded-[4px_16px_16px_16px] bg-paper px-3 py-2.5 text-sm text-muted-2">
                {!cover.outbound
                  ? "Commencez par le vol aller : je peux vous aider à choisir les dates."
                  : !cover.return
                    ? "Il manque le vol retour. Voulez-vous que je compare les options ?"
                    : !has("hotel")
                      ? `Quel quartier pour ${nights} nuits à ${plan.destination} ? Je peux vous conseiller.`
                      : plan.items.some(i => !i.booked)
                        ? "Tout est planifié. Réservez chaque élément chez le partenaire, puis cochez-le « Réservé »."
                        : "Tout est réservé. Je peux affiner l'itinéraire jour par jour ou vous conseiller pour la valise."}
              </p>
            </div>
            <button
              onClick={() =>
                ask(
                  `Je prépare ${plan.destination} (${formatRange(plan.depart, plan.ret)}, ${plan.travelers} personnes${plan.budget ? `, budget ${plan.budget} €` : ""}). Que me conseilles-tu ?`,
                )
              }
              className="flex items-center justify-between gap-3 rounded-full bg-ink py-1.5 pl-4 pr-1.5 text-sm font-bold text-white hover:bg-ink-2"
            >
              Demander au copilote
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink">
                <MessageSquare className="h-4 w-4" aria-hidden />
              </span>
            </button>
          </Panel>

          <Panel title="Carnet de voyage">
            <p className="m-0 text-sm text-muted-2">
              Tout le voyage sur une page : réservations, itinéraire jour par jour, budget et conseils pratiques. À
              garder hors ligne ou à imprimer.
            </p>
            <a
              href="/carnet"
              target="_blank"
              rel="noopener noreferrer"
              className="plain-link flex items-center justify-between gap-3 rounded-full bg-ink py-1.5 pl-4 pr-1.5 text-sm font-bold !text-white hover:bg-ink-2"
            >
              Télécharger le PDF
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink">
                <FileText className="h-4 w-4" aria-hidden />
              </span>
            </a>
          </Panel>
        </div>
      </div>

      {/* Proposition IA */}
      <Panel title="Itinéraire proposé par le copilote" action={<CopilotMark size={28} />}>
        {plan.tripId ? (
          <TripProposal
            tripId={plan.tripId}
            destinationName={plan.destination}
            context={{
              originCity: plan.origin,
              travelers: plan.travelers,
              budgetEur: plan.budget ?? null,
              booked: plan.items.map(shortTitle),
            }}
          />
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="m-0 text-sm text-muted-2">
              Sauvegardez ce voyage pour recevoir un itinéraire jour par jour : où aller, quoi ne pas manquer, comment
              se déplacer.
            </p>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-ink py-1.5 pl-4 pr-1.5 text-sm font-bold text-white hover:bg-ink-2 disabled:opacity-60"
            >
              {loggedIn ? "Sauvegarder" : "Sauvegarder avec un compte"}
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink">
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </span>
            </button>
          </div>
        )}
      </Panel>
    </>
  );
}
