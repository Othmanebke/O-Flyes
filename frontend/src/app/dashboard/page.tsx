"use client";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { ArrowRight, ExternalLink, Loader2, Trash2 } from "lucide-react";
import Logo from "@/components/ui/Logo";
import TripProposal from "@/components/trip/TripProposal";
import { eur, findDestination, searchCity } from "@/lib/catalog";
import { ask } from "@/lib/chat";
import {
  clearPlan, formatRange, nightsBetween, planTotal, removeItem, resumeTrip, savePlan, toast, updatePlan, usePlan,
  type Plan, type PlanItem,
} from "@/lib/plan";
import { createClient } from "@/lib/supabase/browser";
import { useSession } from "@/lib/session";
import type { Booking, Trip } from "@/types/trip";

type Tab = "overview" | "itinerary" | "proposal" | "docs";
const KIND: Record<string, string> = { flight: "Vol", hotel: "Hôtel", activity: "Activité" };

const toPlanItem = (b: Booking): PlanItem => ({
  key: (b.metadata?.key as string) || `srv:${b.id}`,
  type: (["flight", "hotel", "activity"].includes(b.type) ? b.type : "activity") as PlanItem["type"],
  title: b.title,
  subtitle: b.metadata?.subtitle as string | undefined,
  price: b.price_estimate ?? null,
  estimated: !!b.metadata?.estimated,
  provider: b.provider,
  url: b.external_url,
  date: b.metadata?.date as string | undefined,
  serverId: b.id,
});

function countdown(depart: string) {
  const days = Math.round((new Date(depart + "T12:00:00Z").getTime() - Date.now()) / 86400000);
  if (days > 60) return `départ dans ${Math.round(days / 30)} mois`;
  if (days > 1) return `départ dans ${days} jours`;
  if (days >= 0) return "départ imminent";
  return "voyage passé";
}

function downloadICS(plan: Plan) {
  const d = (iso: string) => iso.replace(/-/g, "");
  const esc = (s: string) => s.replace(/[,;]/g, " ");
  let ics = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//AIVANA//Carnet//FR\r\n";
  ics += `BEGIN:VEVENT\r\nUID:trip-${plan.createdAt}@aivana\r\nSUMMARY:${esc(`Voyage ${plan.destination}`)}\r\nDTSTART;VALUE=DATE:${d(plan.depart)}\r\nDTEND;VALUE=DATE:${d(plan.ret)}\r\nEND:VEVENT\r\n`;
  plan.items.forEach((i, n) => {
    const day = i.date || plan.depart;
    ics += `BEGIN:VEVENT\r\nUID:item-${plan.createdAt}-${n}@aivana\r\nSUMMARY:${esc(i.title)}\r\nDESCRIPTION:${esc(i.subtitle || "")}\r\nDTSTART;VALUE=DATE:${d(day)}\r\nEND:VEVENT\r\n`;
  });
  ics += "END:VCALENDAR";
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `voyage-${plan.destination.toLowerCase().replace(/\W+/g, "-")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function Empty({ loggedIn }: { loggedIn: boolean }) {
  return (
    <div className="flex max-w-[640px] flex-col items-start gap-4 rounded-[22px] border border-dashed border-line-2 p-9">
      <span className="text-xl font-bold tracking-[-0.03em]">Votre carnet est vide</span>
      <p className="m-0 text-[15px] leading-relaxed text-muted-2">
        Décrivez votre voyage au copilote ou choisissez une destination : vos vols, hôtels et activités se rangeront ici, avec le budget à jour.
      </p>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => ask("")} className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-ink-2">Planifier avec le copilote</button>
        <Link href="/explore" className="plain-link rounded-full border border-line-2 px-4 py-2.5 text-sm font-semibold hover:border-ink">Explorer les destinations</Link>
      </div>
      {!loggedIn && <p className="m-0 text-[13px] text-muted">Vous avez déjà un compte ? <Link href="/auth/login?next=/dashboard">Connectez-vous</Link> pour retrouver vos voyages.</p>}
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = usePlan();
  const { user, ready } = useSession();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [settings, setSettings] = useState(false);
  const [loadingTrip, setLoadingTrip] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    try { setTrips((await axios.get<Trip[]>("/api/trips")).data || []); } catch { setTrips([]); }
  }, []);

  useEffect(() => { if (user) void fetchTrips(); }, [user, fetchTrips]);

  // Premier passage après la création du compte : on propose l'onboarding
  useEffect(() => {
    if (!ready || !user || user.onboarded || params.get("save")) return;
    if (localStorage.getItem("aivana-onboarded")) return;
    router.push("/onboarding");
  }, [ready, user, params, router]);

  const save = useCallback(async () => {
    if (!user) { router.push("/auth/login?next=" + encodeURIComponent("/dashboard?save=1")); return; }
    setSaving(true);
    try {
      await savePlan();
      toast("Voyage sauvegardé dans votre compte");
      void fetchTrips();
    } catch {
      toast("La sauvegarde a échoué. Réessayez dans un instant.");
    } finally {
      setSaving(false);
    }
  }, [user, router, fetchTrips]);

  // Retour de la connexion avec ?save=1 : on sauvegarde le voyage en cours
  useEffect(() => {
    if (!ready || !user || params.get("save") !== "1") return;
    router.replace("/dashboard");
    if (plan && !plan.tripId) void save();
  }, [ready, user, params]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = async (t: Trip) => {
    if (plan?.tripId === t.id) return;
    if (plan && !plan.tripId && plan.items.length && !confirm(`Le voyage « ${plan.destination} » n'est pas sauvegardé. L'abandonner pour ouvrir « ${t.title} » ?`)) return;
    setLoadingTrip(t.id);
    try {
      const items = (await axios.get<Booking[]>(`/api/trips/${t.id}/items`)).data || [];
      resumeTrip(t, items.map(toPlanItem));
      setTab("overview");
      setSettings(false);
    } finally {
      setLoadingTrip(null);
    }
  };

  const remove = async () => {
    if (!plan) return;
    if (!confirm(`Supprimer le voyage « ${plan.destination} » ?`)) return;
    if (plan.tripId) {
      try { await axios.delete(`/api/trips/${plan.tripId}`); } catch { /* ignoré */ }
      void fetchTrips();
    }
    clearPlan();
  };

  const logout = async () => {
    await createClient().auth.signOut();
    clearPlan();
    router.push("/");
  };

  const draft = plan && !plan.tripId;
  const sideTrips = [
    ...(draft ? [{ id: "draft", name: plan.destination, dates: formatRange(plan.depart, plan.ret), status: "Brouillon", active: true, onClick: () => setSettings(false) }] : []),
    ...trips.map(t => ({
      id: t.id, name: t.title, dates: formatRange(t.start_date, t.end_date), status: "Sauvegardé",
      active: plan?.tripId === t.id, onClick: () => { setSettings(false); void open(t); },
    })),
  ];

  return (
    <div className="flex min-h-screen flex-col bg-paper min-[900px]:flex-row">
      <aside className="flex shrink-0 flex-col gap-5 border-b border-line bg-[#F2EFE9] px-4 py-5 min-[900px]:w-[260px] min-[900px]:border-b-0 min-[900px]:border-r">
        <div className="flex items-center justify-between gap-3 px-2">
          <Link href="/" className="plain-link text-ink" aria-label="Accueil"><Logo size={28} /></Link>
          <Link href="/assistant" className="plain-link whitespace-nowrap rounded-full bg-ink px-[11px] py-[7px] text-[13px] font-semibold !text-paper hover:bg-ink-2">Nouveau voyage</Link>
        </div>
        <div className="flex flex-col gap-1">
          <span className="px-2 pb-1.5 text-xs text-muted">Mes voyages</span>
          <div className="flex gap-1 overflow-x-auto min-[900px]:flex-col">
            {sideTrips.length === 0 && <span className="px-2 text-[13px] text-muted">Aucun voyage pour l&apos;instant</span>}
            {sideTrips.map(t => (
              <button key={t.id} onClick={t.onClick} className={`flex shrink-0 flex-col gap-0.5 rounded-[18px] px-3 py-2.5 text-left ${t.active && !settings ? "bg-[#ECE7DE]" : "hover:bg-[#F3F0EA]"}`}>
                <span className="flex items-center gap-2 text-sm font-semibold">{t.name}{loadingTrip === t.id && <Loader2 className="h-3 w-3 animate-spin" aria-hidden />}</span>
                <span className="text-xs text-muted">{t.dates} · {t.status}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-0.5 border-t border-line pt-3.5">
          <Link href="/explore" className="plain-link p-2 text-sm !text-muted-2 hover:!text-ink">Explorer les destinations</Link>
          <Link href="/pricing" className="plain-link p-2 text-sm !text-muted-2 hover:!text-ink">Formules</Link>
          {user ? (
            <>
              <button onClick={() => setSettings(true)} className="p-2 text-left text-sm text-muted-2 hover:text-ink">Paramètres</button>
              <div className="flex items-center gap-2.5 px-2 pt-2.5">
                <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-ink text-[13px] font-semibold text-paper">{user.name.charAt(0).toUpperCase()}</span>
                <span className="flex min-w-0 flex-col"><span className="truncate text-sm">{user.name}</span><span className="text-xs text-muted">Compte gratuit</span></span>
              </div>
            </>
          ) : (
            <Link href="/auth/login?next=/dashboard" className="plain-link p-2 text-sm font-semibold">Se connecter</Link>
          )}
        </div>
      </aside>

      <main className="flex min-w-0 max-w-[1040px] flex-1 flex-col gap-7 p-[clamp(20px,4vw,40px)]">
        {settings && user ? (
          <Settings name={user.name} email={user.email} onLogout={logout} onClose={() => setSettings(false)} />
        ) : !plan ? (
          <Empty loggedIn={!!user} />
        ) : (
          <TripView plan={plan} tab={tab} setTab={setTab} editing={editing} setEditing={setEditing} saving={saving} onSave={save} onRemove={remove} loggedIn={!!user} />
        )}
      </main>
    </div>
  );
}

function TripView({ plan, tab, setTab, editing, setEditing, saving, onSave, onRemove, loggedIn }: {
  plan: Plan; tab: Tab; setTab: (t: Tab) => void; editing: boolean; setEditing: (b: boolean) => void;
  saving: boolean; onSave: () => void; onRemove: () => void; loggedIn: boolean;
}) {
  const [form, setForm] = useState({ depart: plan.depart, ret: plan.ret, travelers: plan.travelers, budget: plan.budget ? String(plan.budget) : "" });
  useEffect(() => setForm({ depart: plan.depart, ret: plan.ret, travelers: plan.travelers, budget: plan.budget ? String(plan.budget) : "" }), [plan.depart, plan.ret, plan.travelers, plan.budget]);

  const spent = planTotal(plan);
  const sum = (t: string) => plan.items.filter(i => i.type === t).reduce((s, i) => s + (i.price || 0), 0);
  const has = (t: string) => plan.items.some(i => i.type === t);
  const nights = nightsBetween(plan.depart, plan.ret);
  const cat = findDestination(plan.destination);
  const city = cat ? searchCity(cat) : plan.destination;
  const ctx = `dest=${encodeURIComponent(city)}&depart=${plan.depart}&return=${plan.ret}&pax=${plan.travelers}`;
  const alert = !has("flight") ? { t: "Aucun vol n'est encore ajouté à ce voyage.", cta: "Chercher un vol", href: `/explore/flights?${ctx}` }
    : !has("hotel") ? { t: "L'hébergement n'est pas encore choisi.", cta: "Trouver un hôtel", href: `/explore/hotels?${ctx}` }
    : !has("activity") ? { t: "Aucune activité prévue sur place.", cta: "Ajouter des activités", href: `/explore/activities?${ctx}` }
    : null;

  const applyEdit = async () => {
    const patch = { depart: form.depart, ret: form.ret < form.depart ? form.depart : form.ret, travelers: form.travelers, budget: form.budget ? Number(form.budget) : null };
    updatePlan(patch);
    if (plan.tripId) {
      try { await axios.patch(`/api/trips/${plan.tripId}`, { start_date: patch.depart, end_date: patch.ret }); } catch { /* ignoré */ }
    }
    setEditing(false);
  };

  // Itinéraire : un jour par date du séjour, les éléments datés à leur place
  const days = useMemo(() => {
    const out: { date: string; items: PlanItem[] }[] = [];
    for (let n = 0; n <= Math.min(nights, 30); n++) {
      const date = new Date(new Date(plan.depart + "T12:00:00Z").getTime() + n * 86400000).toISOString().slice(0, 10);
      out.push({ date, items: plan.items.filter(i => (i.date || "") === date) });
    }
    return out;
  }, [plan, nights]);
  const unplaced = plan.items.filter(i => !i.date || !days.some(d => d.date === i.date));

  return (
    <>
      {!plan.tripId && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-gold-deep/40 bg-gold-deep/[0.06] px-4 py-3.5">
          <span className="text-sm">
            Ce voyage est enregistré dans ce navigateur seulement. {loggedIn ? "Sauvegardez-le pour le retrouver partout." : "Créez un compte gratuit pour le garder et le retrouver sur tous vos appareils."}
          </span>
          <button onClick={onSave} disabled={saving} className="flex items-center gap-2 whitespace-nowrap rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-ink-2 disabled:opacity-60">
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {loggedIn ? "Sauvegarder" : "Sauvegarder avec un compte"}
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] text-muted">{plan.tripId ? "Sauvegardé" : "Brouillon"} · {countdown(plan.depart)}</span>
          <h1 className="m-0 text-[clamp(32px,4vw,48px)] leading-[1.05]">{plan.destination}</h1>
          <span className="text-[15px] text-muted-2">{formatRange(plan.depart, plan.ret)} · {nights} nuit{nights > 1 ? "s" : ""} · {plan.travelers} voyageur{plan.travelers > 1 ? "s" : ""}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setEditing(!editing)} className="whitespace-nowrap rounded-full border border-line-2 px-3.5 py-[9px] text-sm font-medium hover:border-ink">Modifier</button>
          <button onClick={() => downloadICS(plan)} className="whitespace-nowrap rounded-full border border-line-2 px-3.5 py-[9px] text-sm font-medium hover:border-ink">Exporter dans l&apos;agenda</button>
          <button onClick={onRemove} aria-label="Supprimer ce voyage" title="Supprimer ce voyage" className="flex items-center rounded-full border border-line-2 px-3 py-[9px] text-muted-2 hover:border-danger hover:text-danger"><Trash2 className="h-4 w-4" aria-hidden /></button>
        </div>
      </div>

      {editing && (
        <div className="grid gap-3 rounded-[20px] border border-line bg-cream p-4 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
          <label className="flex flex-col gap-1 text-xs text-muted">Départ<input type="date" value={form.depart} onChange={e => setForm(f => ({ ...f, depart: e.target.value }))} className="rounded-full border border-line-2 bg-white px-3 py-2 text-sm text-ink" /></label>
          <label className="flex flex-col gap-1 text-xs text-muted">Retour<input type="date" value={form.ret} min={form.depart} onChange={e => setForm(f => ({ ...f, ret: e.target.value }))} className="rounded-full border border-line-2 bg-white px-3 py-2 text-sm text-ink" /></label>
          <label className="flex flex-col gap-1 text-xs text-muted">Voyageurs<input type="number" min={1} max={9} value={form.travelers} onChange={e => setForm(f => ({ ...f, travelers: Math.max(1, Number(e.target.value) || 1) }))} className="rounded-full border border-line-2 bg-white px-3 py-2 text-sm text-ink" /></label>
          <label className="flex flex-col gap-1 text-xs text-muted">Budget total (€)<input type="number" min={0} step={50} value={form.budget} placeholder="Facultatif" onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} className="rounded-full border border-line-2 bg-white px-3 py-2 text-sm text-ink" /></label>
          <div className="col-span-full flex gap-2">
            <button onClick={applyEdit} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-ink-2">Enregistrer</button>
            <button onClick={() => setEditing(false)} className="rounded-full border border-line-2 px-4 py-2 text-sm hover:border-ink">Annuler</button>
          </div>
        </div>
      )}

      <div className="flex gap-6 overflow-x-auto border-b border-line" role="tablist">
        {([["overview", "Aperçu"], ["itinerary", "Itinéraire"], ["proposal", "Proposition IA"], ["docs", "Documents"]] as const).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`shrink-0 border-b-2 pb-3 text-sm font-medium ${tab === id ? "border-gold-deep text-ink" : "border-transparent text-muted"}`}>{label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="flex flex-col gap-8">
          {alert && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-gold-deep/40 bg-gold-deep/[0.06] px-4 py-3.5">
              <span className="text-sm">{alert.t}</span>
              <Link href={alert.href} className="text-sm font-semibold">{alert.cta} <ArrowRight className="inline h-[1em] w-[1em]" aria-hidden /></Link>
            </div>
          )}
          <div className="grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[15px] font-semibold">Budget</span>
                <span className="tabular whitespace-nowrap text-sm font-semibold">{eur(spent)}{plan.budget ? ` / ${eur(plan.budget)}` : ""}</span>
              </div>
              {plan.budget ? (
                <div className="h-1.5 overflow-hidden rounded-sm bg-line"><div className={`h-full ${spent > plan.budget ? "bg-danger" : "bg-gold-deep"}`} style={{ width: `${Math.min(100, Math.round((spent / plan.budget) * 100))}%` }} /></div>
              ) : (
                <button onClick={() => setEditing(true)} className="self-start text-[13px] text-gold-deep hover:text-[#6E5323]">Fixer un budget</button>
              )}
              <div className="mt-1 flex flex-col border-t border-line">
                {[["Vols", sum("flight")], ["Hébergement", sum("hotel")], ["Activités", sum("activity")]].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between border-b border-line py-[11px] text-sm"><span className="text-muted-2">{k}</span><span className="tabular whitespace-nowrap font-semibold">{eur(v as number)}</span></div>
                ))}
                {plan.budget ? (
                  <div className="flex justify-between py-[11px] text-sm">
                    <span className="text-muted-2">{spent > plan.budget ? "Dépassement" : "Reste disponible"}</span>
                    <span className={`tabular whitespace-nowrap font-semibold ${spent > plan.budget ? "text-danger" : "text-ok"}`}>{eur(Math.abs(plan.budget - spent))}</span>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[15px] font-semibold">Compléter le voyage</span>
              <div className="flex flex-col border-t border-line">
                {[["Rechercher un vol", `/explore/flights?${ctx}`], ["Trouver un hébergement", `/explore/hotels?${ctx}`], ["Ajouter des activités", `/explore/activities?${ctx}`]].map(([label, href]) => (
                  <Link key={label} href={href} className="plain-link flex justify-between border-b border-line py-[13px] text-sm hover:!text-gold-deep"><span>{label}</span><ArrowRight className="h-4 w-4 text-muted" aria-hidden /></Link>
                ))}
                <button onClick={() => ask(`Je prépare ${plan.destination} du ${formatRange(plan.depart, plan.ret)} pour ${plan.travelers} personnes. Que me conseilles-tu ?`)} className="flex justify-between py-[13px] text-left text-sm hover:text-gold-deep"><span>Demander au copilote</span><ArrowRight className="h-4 w-4 text-muted" aria-hidden /></button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-[15px] font-semibold">Éléments du voyage</span>
            {plan.items.length === 0 ? (
              <p className="m-0 text-sm text-muted">Rien pour l&apos;instant. Les vols, hôtels et activités que vous ajoutez apparaissent ici.</p>
            ) : (
              <div className="flex flex-col border-t border-line">
                {plan.items.map(i => (
                  <div key={i.key} className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-4 border-b border-line py-3.5">
                    <span className="text-[13px] text-muted">{KIND[i.type]}</span>
                    <span className="flex min-w-0 flex-col gap-0.5"><span className="text-[15px] font-medium">{i.title}</span>{i.subtitle && <span className="text-[13px] text-muted">{i.subtitle}</span>}</span>
                    <span className="flex items-center gap-3">
                      <span className="flex flex-col items-end gap-0.5">
                        <span className="tabular whitespace-nowrap text-sm font-semibold">{i.price != null ? eur(i.price) : "—"}</span>
                        <span className="text-xs text-gold-deep">{i.estimated ? "Estimé · à réserver" : "À réserver"}</span>
                      </span>
                      {i.url && <a href={i.url} target="_blank" rel="noopener noreferrer" aria-label="Réserver chez le partenaire" title="Réserver chez le partenaire" className="text-muted hover:text-ink"><ExternalLink className="h-4 w-4" aria-hidden /></a>}
                      <button onClick={() => removeItem(i.key)} aria-label={`Retirer ${i.title}`} title="Retirer" className="text-muted hover:text-danger"><Trash2 className="h-4 w-4" aria-hidden /></button>
                    </span>
                  </div>
                ))}
              </div>
            )}
            <p className="m-0 text-[13px] text-muted">AIVANA ne réserve pas à votre place : chaque élément renvoie vers le partenaire (compagnie, Booking.com, GetYourGuide).</p>
          </div>
        </div>
      )}

      {tab === "itinerary" && (
        <div className="flex flex-col">
          {days.map((d, n) => (
            <div key={d.date} className="grid gap-5 border-b border-line py-[18px] [grid-template-columns:minmax(90px,140px)_minmax(0,1fr)]">
              <div className="flex flex-col gap-0.5"><span className="text-[15px] font-semibold">Jour {n + 1}</span><span className="text-[13px] text-muted">{new Date(d.date + "T12:00:00Z").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</span></div>
              <div className="flex flex-col gap-2.5 text-sm">
                {n === 0 && <span className="text-muted-2">Départ de {plan.origin}</span>}
                {d.items.map(i => <span key={i.key}><span className="text-muted">{KIND[i.type]} · </span>{i.title}</span>)}
                {n === days.length - 1 && n > 0 && <span className="text-muted-2">Retour vers {plan.origin}</span>}
                {n > 0 && n < days.length - 1 && !d.items.length && <span className="text-muted">Journée libre</span>}
              </div>
            </div>
          ))}
          {unplaced.length > 0 && (
            <div className="flex flex-col gap-2 py-5 text-sm">
              <span className="font-semibold">À placer dans le séjour</span>
              {unplaced.map(i => <span key={i.key}><span className="text-muted">{KIND[i.type]} · </span>{i.title}</span>)}
            </div>
          )}
        </div>
      )}

      {tab === "proposal" && (plan.tripId
        ? <TripProposal tripId={plan.tripId} destinationName={plan.destination} />
        : (
          <div className="flex max-w-[640px] flex-col items-start gap-3 rounded-[22px] border border-dashed border-line-2 p-9">
            <span className="text-base font-semibold">Sauvegardez d&apos;abord le voyage</span>
            <p className="m-0 text-sm leading-relaxed text-muted-2">L&apos;itinéraire jour par jour est généré à partir de votre voyage enregistré.</p>
            <button onClick={onSave} disabled={saving} className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-ink-2 disabled:opacity-60">{loggedIn ? "Sauvegarder" : "Sauvegarder avec un compte"}</button>
          </div>
        ))}

      {tab === "docs" && (
        <div className="flex max-w-[640px] flex-col items-start gap-3 rounded-[22px] border border-dashed border-line-2 p-9">
          <span className="text-base font-semibold">Documents : bientôt</span>
          <p className="m-0 text-sm leading-relaxed text-muted-2">Le rangement des billets et confirmations en PDF, et l&apos;import depuis Gmail ou Outlook, arrivent dans une prochaine version. Pour l&apos;instant, gardez vos confirmations dans votre boîte mail.</p>
        </div>
      )}
    </>
  );
}

function Settings({ name, email, onLogout, onClose }: { name: string; email: string; onLogout: () => void; onClose: () => void }) {
  const [n, setN] = useState(name);
  const [status, setStatus] = useState<string | null>(null);
  const save = async () => {
    setStatus("Enregistrement…");
    const { error } = await createClient().auth.updateUser({ data: { full_name: n.trim() || name } });
    setStatus(error ? "L'enregistrement a échoué." : "Profil mis à jour.");
  };
  return (
    <div className="flex max-w-[520px] flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="m-0 text-[32px]">Paramètres</h1>
        <button onClick={onClose} className="text-sm text-muted-2 hover:text-ink">Retour au voyage</button>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Nom<input value={n} onChange={e => setN(e.target.value)} className="h-[46px] rounded-full border border-line-2 bg-cream px-4 text-[15px] font-normal" /></label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Adresse email<input value={email} disabled className="h-[46px] rounded-full border border-line bg-paper px-4 text-[15px] font-normal text-muted" /></label>
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={save} className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-ink-2">Enregistrer</button>
        <Link href="/onboarding" className="text-sm">Modifier mes préférences de voyage</Link>
        {status && <span className="text-sm text-muted">{status}</span>}
      </div>
      <button onClick={onLogout} className="self-start rounded-full border border-line-2 px-4 py-2.5 text-sm hover:border-danger hover:text-danger">Se déconnecter</button>
    </div>
  );
}

export default function DashboardPage() {
  return <Suspense><DashboardContent /></Suspense>;
}
