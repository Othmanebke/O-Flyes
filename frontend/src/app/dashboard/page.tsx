"use client";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  AlertCircle, ArrowUpRight, BedDouble, CalendarPlus, Check, ExternalLink, Loader2, MessageSquare,
  Pencil, Plane, Plus, Share2, Ticket, Trash2, Upload, Wallet, X,
} from "lucide-react";
import Photo from "@/components/ui/Photo";
import { CopilotMark } from "@/components/ui/Logo";
import TripProposal from "@/components/trip/TripProposal";
import { eur, findDestination, searchCity } from "@/lib/catalog";
import { ask } from "@/lib/chat";
import { isPhotoKey, photoFor, type PhotoKey } from "@/lib/photos";
import {
  addDays, clearPlan, flightCoverage, formatRange, nightsBetween, planTotal, removeItem, resumeTrip, savePlan, toast, updatePlan, usePlan,
  type Plan, type PlanItem,
} from "@/lib/plan";
import { createClient } from "@/lib/supabase/browser";
import { useSession } from "@/lib/session";
import type { Booking, Trip } from "@/types/trip";

type Tab = "overview" | "itinerary" | "proposal" | "docs";
const ICON = { flight: Plane, hotel: BedDouble, activity: Ticket };
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
  leg: b.metadata?.leg as PlanItem["leg"],
  serverId: b.id,
});

const photoOf = (name: string): PhotoKey => {
  const code = findDestination(name)?.code;
  return isPhotoKey(code) ? code : photoFor(name);
};

function countdown(depart: string): [string, string] {
  const days = Math.round((new Date(depart + "T12:00:00Z").getTime() - Date.now()) / 86400000);
  if (days > 60) return [`${Math.round(days / 30)} mois`, "avant le départ"];
  if (days > 1) return [`${days} jours`, "avant le départ"];
  if (days >= 0) return ["Bientôt", "départ imminent"];
  return ["Passé", "voyage terminé"];
}

// Titre court pour les cartes : « Vol aller · CDG → LIS » plutôt que le nom de la compagnie
function shortTitle(i: PlanItem) {
  if (i.type !== "flight") return i.title;
  const route = i.title.split(" · ")[1] || "";
  const leg = i.leg === "return" ? "Vol retour" : i.leg === "outbound" ? "Vol aller" : "Vol aller-retour";
  return route ? `${leg} · ${route}` : leg;
}

function downloadICS(plan: Plan) {
  const d = (iso: string) => iso.replace(/-/g, "");
  const esc = (s: string) => s.replace(/[,;]/g, " ");
  let ics = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//AIVANA//Carnet//FR\r\n";
  ics += `BEGIN:VEVENT\r\nUID:trip-${plan.createdAt}@aivana\r\nSUMMARY:${esc(`Voyage ${plan.destination}`)}\r\nDTSTART;VALUE=DATE:${d(plan.depart)}\r\nDTEND;VALUE=DATE:${d(plan.ret)}\r\nEND:VEVENT\r\n`;
  plan.items.forEach((i, n) => {
    ics += `BEGIN:VEVENT\r\nUID:item-${plan.createdAt}-${n}@aivana\r\nSUMMARY:${esc(shortTitle(i))}\r\nDESCRIPTION:${esc(i.subtitle || "")}\r\nDTSTART;VALUE=DATE:${d(i.date || plan.depart)}\r\nEND:VEVENT\r\n`;
  });
  ics += "END:VCALENDAR";
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `voyage-${plan.destination.toLowerCase().replace(/\W+/g, "-")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

async function share(plan: Plan) {
  const lines = [
    `Mon voyage : ${plan.destination}`,
    `${formatRange(plan.depart, plan.ret)} · ${plan.travelers} voyageur${plan.travelers > 1 ? "s" : ""}`,
    ...plan.items.map(i => `- ${shortTitle(i)}${i.price != null ? ` (${eur(i.price)})` : ""}`),
    `Total estimé : ${eur(planTotal(plan))}`,
  ];
  const text = lines.join("\n");
  try {
    if (navigator.share) { await navigator.share({ title: `Voyage ${plan.destination}`, text }); return; }
    await navigator.clipboard.writeText(text);
    toast("Résumé du voyage copié");
  } catch { /* partage annulé */ }
}

const glassBtn = "flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-white/15 text-white backdrop-blur-[10px] hover:bg-white/25";

/* ── page ──────────────────────────────────────────────────────────── */
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

  // Lien direct vers un voyage sauvegardé (menu « Mes voyages » de la navbar)
  useEffect(() => {
    const id = params.get("trip");
    if (!id || !trips.length) return;
    const t = trips.find(x => x.id === id);
    router.replace("/dashboard");
    if (t) void open(t);
  }, [params, trips]); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async () => {
    if (!plan || !confirm(`Supprimer le voyage « ${plan.destination} » ?`)) return;
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

  const pills = [
    ...(plan && !plan.tripId ? [{ id: "draft", name: plan.destination, active: true, onClick: () => setSettings(false) }] : []),
    ...trips.map(t => ({ id: t.id, name: t.title, active: plan?.tripId === t.id, onClick: () => { setSettings(false); void open(t); } })),
  ];

  return (
    <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-6 pb-[120px] pt-6">
      {/* Sélecteur de voyages */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
        {pills.map(t => (
          <button key={t.id} onClick={t.onClick} className={`flex shrink-0 items-center gap-2.5 rounded-full border py-[5px] pl-[5px] pr-4 text-sm font-bold ${t.active && !settings ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink"}`}>
            <Photo k={photoOf(t.name)} sizes="34px" className="h-[34px] w-[34px] rounded-full" />
            {t.name}
            {loadingTrip === t.id && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
          </button>
        ))}
        <Link href="/assistant" className="plain-link flex h-[46px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-dashed border-line-2 px-4 text-sm font-bold !text-muted-2 hover:border-ink hover:!text-ink">
          <Plus className="h-4 w-4" aria-hidden /> Nouveau voyage
        </Link>
      </div>

      {settings && user ? (
        <Settings name={user.name} email={user.email} onLogout={logout} onClose={() => setSettings(false)} />
      ) : !plan ? (
        <Empty loggedIn={!!user} />
      ) : (
        <TripView plan={plan} tab={tab} setTab={setTab} editing={editing} setEditing={setEditing} saving={saving} onSave={save} onRemove={remove} loggedIn={!!user} />
      )}

      {/* Compte */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-5 text-sm text-muted-2">
        {user ? (
          <>
            <span className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper">{user.name.charAt(0).toUpperCase()}</span>
              {user.name} · compte gratuit
            </span>
            <button onClick={() => setSettings(true)} className="hover:text-ink">Paramètres</button>
            <button onClick={logout} className="hover:text-danger">Se déconnecter</button>
          </>
        ) : (
          <span>Vos voyages restent dans ce navigateur tant que vous n&apos;êtes pas connecté. <Link href="/auth/login?next=/dashboard">Se connecter</Link></span>
        )}
      </div>
    </div>
  );
}

function Empty({ loggedIn }: { loggedIn: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[28px] border-[1.5px] border-dashed border-line-2 px-6 py-14 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft"><Plane className="h-7 w-7 -rotate-45" aria-hidden /></span>
      <span className="text-xl font-extrabold tracking-[-0.02em]">Votre carnet est vide</span>
      <p className="m-0 max-w-[460px] text-[15px] text-muted-2">Décrivez votre voyage au copilote ou choisissez une destination : vols, hôtels et activités se rangeront ici.</p>
      <div className="flex flex-wrap justify-center gap-2">
        <button onClick={() => ask("")} className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-paper hover:bg-ink-2">Planifier avec le copilote</button>
        <Link href="/explore" className="plain-link rounded-full border border-line-2 px-5 py-3 text-sm font-bold hover:border-ink">Explorer les destinations</Link>
      </div>
      {!loggedIn && <span className="text-[13px] text-muted">Déjà un compte ? <Link href="/auth/login?next=/dashboard">Connectez-vous</Link> pour retrouver vos voyages.</span>}
    </div>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 52, c = 2 * Math.PI * r;
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#EFEBE4" strokeWidth="12" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={pct > 100 ? "#A33A3A" : "#C9A24B"} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(Math.min(pct, 100) / 100) * c} ${c}`} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[22px] font-extrabold tracking-[-0.03em]">{pct}%</span>
    </div>
  );
}

function TripView({ plan, tab, setTab, editing, setEditing, saving, onSave, onRemove, loggedIn }: {
  plan: Plan; tab: Tab; setTab: (t: Tab) => void; editing: boolean; setEditing: (b: boolean) => void;
  saving: boolean; onSave: () => void; onRemove: () => void; loggedIn: boolean;
}) {
  const spent = planTotal(plan);
  const nights = nightsBetween(plan.depart, plan.ret);
  const cat = findDestination(plan.destination);
  const city = cat ? searchCity(cat) : plan.destination;
  const ctx = `dest=${encodeURIComponent(city)}&depart=${plan.depart}&return=${plan.ret}&pax=${plan.travelers}`;
  const cover = flightCoverage(plan);
  const has = (t: string) => plan.items.some(i => i.type === t);
  const steps = [cover.outbound, cover.return, has("hotel"), has("activity")].filter(Boolean).length;
  const [big, small] = countdown(plan.depart);
  const shortDate = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

  const alert = !cover.outbound ? { t: "Vol aller à ajouter", href: `/explore/flights?${ctx}` }
    : !cover.return ? { t: `Vol retour du ${shortDate(plan.ret)} à ajouter`, href: "/explore/flights?leg=retour" }
    : !has("hotel") ? { t: `Hébergement à choisir pour ${nights} nuit${nights > 1 ? "s" : ""}`, href: `/explore/hotels?${ctx}` }
    : !has("activity") ? { t: "Une activité à prévoir sur place ?", href: `/explore/activities?${ctx}` }
    : null;

  const days = useMemo(() => {
    const out: { date: string; items: PlanItem[] }[] = [];
    for (let n = 0; n <= Math.min(nights, 30); n++) {
      const date = addDays(plan.depart, n);
      out.push({ date, items: plan.items.filter(i => (i.date || "") === date) });
    }
    return out;
  }, [plan, nights]);
  const unplaced = plan.items.filter(i => !i.date || !days.some(d => d.date === i.date));
  const dayPhotos: PhotoKey[] = [photoOf(plan.destination), "market", "alley", "lake", "food", "boat", "hike", "balloons"];

  return (
    <>
      {/* Hero du voyage */}
      <section className="relative flex min-h-[clamp(300px,38vw,420px)] flex-col justify-between overflow-hidden rounded-[32px] bg-ink-2 p-[clamp(20px,3vw,32px)] text-white">
        <Photo k={photoOf(plan.destination)} alt={plan.destination} priority sizes="(max-width: 1240px) 100vw, 1240px" className="absolute inset-0" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,14,26,0.8) 0%, rgba(8,14,26,0.2) 55%, rgba(8,14,26,0.35) 100%)" }} />
        <div className="relative flex items-center justify-between gap-3">
          <span className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-bold text-ink ${plan.tripId ? "bg-[#CFE6D6]" : "bg-gold-soft"}`}>{plan.tripId ? "Sauvegardé" : "Brouillon"}</span>
          <div className="flex gap-2">
            <button onClick={() => setEditing(!editing)} aria-label="Modifier les dates et voyageurs" title="Modifier" className={glassBtn}><Pencil className="h-[18px] w-[18px]" aria-hidden /></button>
            <button onClick={() => share(plan)} aria-label="Partager" title="Partager" className={glassBtn}><Share2 className="h-[18px] w-[18px]" aria-hidden /></button>
            <button onClick={() => downloadICS(plan)} aria-label="Exporter dans l'agenda" title="Exporter dans l'agenda (.ics)" className={glassBtn}><CalendarPlus className="h-[18px] w-[18px]" aria-hidden /></button>
            <button onClick={onRemove} aria-label="Supprimer ce voyage" title="Supprimer" className={glassBtn}><Trash2 className="h-[18px] w-[18px]" aria-hidden /></button>
          </div>
        </div>
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-[clamp(48px,7vw,96px)] font-extrabold leading-[0.95] tracking-[-0.05em] text-white">{plan.destination}</h1>
            <span className="text-base font-semibold text-white/90">{formatRange(plan.depart, plan.ret)} · {plan.travelers} voyageur{plan.travelers > 1 ? "s" : ""}</span>
          </div>
          <div className="flex flex-col items-end gap-0.5 whitespace-nowrap rounded-[22px] border border-white/30 bg-white/15 px-5 py-3.5 backdrop-blur-[12px] max-[1100px]:mr-16">
            <span className="text-[clamp(28px,3vw,40px)] font-extrabold leading-none tracking-[-0.04em]">{big}</span>
            <span className="text-[13px] font-semibold text-white/85">{small}</span>
          </div>
        </div>
      </section>

      {editing && <EditTrip plan={plan} onClose={() => setEditing(false)} />}

      {!plan.tripId && (
        <div className="flex flex-wrap items-center gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-white max-sm:rounded-[24px]">
          <span className="min-w-0 flex-1 text-sm font-semibold">{loggedIn ? "Ce voyage n'est enregistré que dans ce navigateur." : "Créez un compte gratuit pour garder ce voyage et le retrouver partout."}</span>
          <button onClick={onSave} disabled={saving} className="flex items-center gap-2 whitespace-nowrap rounded-full bg-white py-2 pl-4 pr-2 text-sm font-bold text-ink hover:bg-gold-soft disabled:opacity-60">
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {loggedIn ? "Sauvegarder" : "Sauvegarder avec un compte"}
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-gold"><ArrowUpRight className="h-4 w-4" aria-hidden /></span>
          </button>
        </div>
      )}

      {alert && (
        <Link href={alert.href} className="plain-link flex items-center gap-3 rounded-full bg-gold-soft py-2 pl-4 pr-2 hover:bg-[#E8D3A4]">
          <AlertCircle className="h-[18px] w-[18px] shrink-0 text-gold-deep" aria-hidden />
          <span className="min-w-0 flex-1 text-sm font-semibold">{alert.t}</span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-gold"><ArrowUpRight className="h-4 w-4" aria-hidden /></span>
        </Link>
      )}

      {/* Chiffres */}
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))]">
        <div className="flex items-center gap-5 rounded-[28px] bg-white p-[22px] shadow-[0_1px_0_#E4DFD5]">
          <Ring pct={plan.budget ? Math.round((spent / plan.budget) * 100) : 0} />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[13px] font-semibold text-muted">Budget utilisé</span>
            <span className="whitespace-nowrap text-2xl font-extrabold tracking-[-0.03em]">{eur(spent)}</span>
            {plan.budget
              ? <span className="whitespace-nowrap text-[13px] text-muted">sur {eur(plan.budget)}</span>
              : <button onClick={() => setEditing(true)} className="self-start text-[13px] font-semibold text-gold-deep hover:text-[#6E5323]">Fixer un budget</button>}
          </div>
        </div>
        <div className="flex flex-col justify-between gap-4 rounded-[28px] bg-white p-[22px] shadow-[0_1px_0_#E4DFD5]">
          <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#DCEFE3] text-ok"><Wallet className="h-5 w-5" aria-hidden /></span>
          <div className="flex flex-col gap-0.5">
            {plan.budget ? (
              <>
                <span className={`whitespace-nowrap text-[26px] font-extrabold tracking-[-0.03em] ${spent > plan.budget ? "text-danger" : "text-ok"}`}>{eur(Math.abs(plan.budget - spent))}</span>
                <span className="text-[13px] font-semibold text-muted">{spent > plan.budget ? "Au-dessus du budget" : "Reste disponible"}</span>
              </>
            ) : (
              <>
                <span className="whitespace-nowrap text-[26px] font-extrabold tracking-[-0.03em]">{eur(spent)}</span>
                <span className="text-[13px] font-semibold text-muted">Total estimé du voyage</span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col justify-between gap-4 rounded-[28px] bg-white p-[22px] shadow-[0_1px_0_#E4DFD5]">
          <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-gold-soft"><Check className="h-5 w-5" aria-hidden /></span>
          <div className="flex flex-col gap-0.5">
            <span className="whitespace-nowrap text-[26px] font-extrabold tracking-[-0.03em]">{steps} / 4</span>
            <span className="text-[13px] font-semibold text-muted">Étapes prêtes · aller, retour, hôtel, activité</span>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex max-w-full gap-1 self-start overflow-x-auto rounded-full bg-[#EFEBE4] p-1" role="tablist">
        {([["overview", "Aperçu"], ["itinerary", "Itinéraire"], ["proposal", "Proposition IA"], ["docs", "Documents"]] as const).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`shrink-0 whitespace-nowrap rounded-full px-[18px] py-2.5 text-sm font-bold ${tab === id ? "bg-white text-ink shadow-[0_1px_3px_rgba(15,27,45,0.12)]" : "text-muted-2"}`}>{label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="flex flex-col gap-4">
          {plan.items.length > 0 && (
            <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,270px),1fr))]">
              {plan.items.map(i => {
                const Icon = ICON[i.type];
                return (
                  <div key={i.key} className="flex flex-col gap-3.5 rounded-[24px] bg-white p-[18px] shadow-[0_1px_0_#E4DFD5]">
                    <div className="flex items-center justify-between">
                      <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#F3EEE6]"><Icon className="h-[18px] w-[18px]" aria-hidden /></span>
                      <span className="flex items-center gap-2">
                        {i.url && <a href={i.url} target="_blank" rel="noopener noreferrer" aria-label="Réserver chez le partenaire" title="Réserver chez le partenaire" className="text-muted hover:text-ink"><ExternalLink className="h-4 w-4" aria-hidden /></a>}
                        <button onClick={() => removeItem(i.key)} aria-label={`Retirer ${i.title}`} title="Retirer" className="text-muted hover:text-danger"><X className="h-4 w-4" aria-hidden /></button>
                        <span className="whitespace-nowrap rounded-full bg-gold-soft px-[11px] py-[5px] text-xs font-bold text-gold-deep">À réserver</span>
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-col gap-[3px]">
                      <span className="text-base font-bold tracking-[-0.02em]">{shortTitle(i)}</span>
                      {i.subtitle && <span className="line-clamp-2 text-[13px] text-muted">{i.subtitle}</span>}
                    </div>
                    <span className="whitespace-nowrap text-xl font-extrabold tracking-[-0.03em]">
                      {i.price === 0 ? "Gratuit" : i.price != null ? eur(i.price) : "—"}
                      {i.estimated && i.price ? <span className="ml-1.5 text-xs font-semibold text-muted">estimé</span> : null}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))]">
            {[
              { label: "Un vol", href: cover.outbound && !cover.return ? "/explore/flights?leg=retour" : `/explore/flights?${ctx}`, Icon: Plane, bg: "bg-sky" },
              { label: "Un hôtel", href: `/explore/hotels?${ctx}`, Icon: BedDouble, bg: "bg-gold-soft" },
              { label: "Une activité", href: `/explore/activities?${ctx}`, Icon: Ticket, bg: "bg-[#DCEFE3]" },
            ].map(a => (
              <Link key={a.label} href={a.href} className="plain-link flex items-center gap-3.5 rounded-full border-[1.5px] border-dashed border-line-2 px-4 py-3.5 text-[15px] font-bold hover:border-ink hover:bg-white">
                <span className={`flex h-[38px] w-[38px] items-center justify-center rounded-full ${a.bg}`}><a.Icon className="h-[17px] w-[17px]" aria-hidden /></span>{a.label}
              </Link>
            ))}
            <button onClick={() => ask(`Je prépare ${plan.destination} (${formatRange(plan.depart, plan.ret)}, ${plan.travelers} personnes). Que me conseilles-tu ?`)} className="flex items-center gap-3.5 rounded-full border-[1.5px] border-dashed border-line-2 px-4 py-3.5 text-left text-[15px] font-bold hover:border-ink hover:bg-white">
              <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-ink text-gold"><MessageSquare className="h-[17px] w-[17px]" aria-hidden /></span>Le copilote
            </button>
          </div>
          <p className="m-0 text-[13px] text-muted">Prix estimés. AIVANA ne réserve pas à votre place : l&apos;icône de chaque élément ouvre le partenaire avec vos dates.</p>
        </div>
      )}

      {tab === "itinerary" && (
        <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr))]">
          {days.map((d, n) => {
            const lines = [
              ...(n === 0 ? [{ t: "Départ", what: `Depuis ${plan.origin}` }] : []),
              ...d.items.map(i => ({ t: KIND[i.type], what: shortTitle(i) })),
              ...(n === days.length - 1 && n > 0 ? [{ t: "Retour", what: `Vers ${plan.origin}` }] : []),
            ];
            return (
              <div key={d.date} className="overflow-hidden rounded-[24px] bg-white shadow-[0_1px_0_#E4DFD5]">
                <div className="relative h-[120px]">
                  <Photo k={dayPhotos[n % dayPhotos.length]} sizes="320px" className="h-full w-full" />
                  <span className="absolute left-3 top-3 rounded-full bg-white px-[11px] py-[5px] text-xs font-extrabold">Jour {n + 1}</span>
                </div>
                <div className="flex flex-col gap-3 px-[18px] pb-[18px] pt-4">
                  <span className="text-[13px] font-semibold text-muted">{new Date(d.date + "T12:00:00Z").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</span>
                  {lines.length ? lines.map((l, j) => (
                    <div key={j} className="flex items-baseline gap-3"><span className="w-[64px] shrink-0 text-[13px] font-extrabold text-gold-deep">{l.t}</span><span className="text-[15px] font-semibold">{l.what}</span></div>
                  )) : <span className="text-[15px] font-semibold text-muted">Journée libre</span>}
                </div>
              </div>
            );
          })}
          {unplaced.length > 0 && (
            <div className="flex flex-col gap-3 rounded-[24px] border-[1.5px] border-dashed border-line-2 p-[18px]">
              <span className="text-[13px] font-semibold text-muted">À placer dans le séjour</span>
              {unplaced.map(i => <div key={i.key} className="flex items-baseline gap-3"><span className="w-[64px] shrink-0 text-[13px] font-extrabold text-gold-deep">{KIND[i.type]}</span><span className="text-[15px] font-semibold">{shortTitle(i)}</span></div>)}
            </div>
          )}
        </div>
      )}

      {tab === "proposal" && (
        <div className="flex max-w-[760px] items-start gap-3.5">
          <CopilotMark size={44} />
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="rounded-[6px_24px_24px_24px] bg-white px-5 py-[18px] text-base leading-relaxed shadow-[0_1px_0_#E4DFD5]">
              {plan.tripId
                ? <TripProposal tripId={plan.tripId} destinationName={plan.destination} />
                : <>Sauvegardez ce voyage et je vous proposerai un itinéraire jour par jour pour {plan.destination} : où aller, quoi ne pas manquer et comment se déplacer.</>}
            </div>
            <div className="flex flex-wrap gap-2">
              {[`${nights} nuits`, `${plan.travelers} voyageur${plan.travelers > 1 ? "s" : ""}`, ...(cat ? [`Idéal en ${cat.months.slice(0, 2).join(", ")}`] : [])].map(t => (
                <span key={t} className="rounded-full bg-[#EFEBE4] px-3.5 py-2 text-[13px] font-semibold">{t}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {!plan.tripId && <button onClick={onSave} disabled={saving} className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white hover:bg-ink-2 disabled:opacity-60">{loggedIn ? "Sauvegarder" : "Sauvegarder avec un compte"}</button>}
              <button onClick={() => ask(`Affine mon voyage à ${plan.destination} (${formatRange(plan.depart, plan.ret)}, ${plan.travelers} personnes${plan.budget ? `, budget ${plan.budget} €` : ""}).`)} className="flex items-center gap-3 self-start rounded-full bg-ink py-[5px] pl-[18px] pr-[5px] text-sm font-bold text-white hover:bg-ink-2">
                Affiner avec le copilote
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink"><ArrowUpRight className="h-4 w-4" aria-hidden /></span>
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "docs" && (
        <div className="flex flex-col items-center gap-3.5 rounded-[28px] border-[1.5px] border-dashed border-line-2 px-6 py-12 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft"><Upload className="h-6 w-6" aria-hidden /></span>
          <span className="text-lg font-extrabold tracking-[-0.02em]">Glissez vos billets ici</span>
          <span className="text-sm text-muted">Bientôt : billets et confirmations en PDF, accessibles hors ligne</span>
          <button disabled className="cursor-not-allowed rounded-full bg-ink px-5 py-3 text-sm font-bold text-white opacity-40">Importer un fichier</button>
        </div>
      )}
    </>
  );
}

function EditTrip({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const [form, setForm] = useState({ depart: plan.depart, ret: plan.ret, travelers: plan.travelers, budget: plan.budget ? String(plan.budget) : "" });
  const apply = async () => {
    const patch = { depart: form.depart, ret: form.ret < form.depart ? form.depart : form.ret, travelers: form.travelers, budget: form.budget ? Number(form.budget) : null };
    updatePlan(patch);
    if (plan.tripId) {
      try { await axios.patch(`/api/trips/${plan.tripId}`, { start_date: patch.depart, end_date: patch.ret }); } catch { /* ignoré */ }
    }
    onClose();
  };
  const field = "rounded-full border border-line-2 bg-white px-3 py-2 text-sm text-ink";
  return (
    <div className="grid gap-3 rounded-[28px] bg-white p-5 shadow-[0_1px_0_#E4DFD5] [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
      <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Départ<input type="date" value={form.depart} onChange={e => setForm(f => ({ ...f, depart: e.target.value }))} className={field} /></label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Retour<input type="date" value={form.ret} min={form.depart} onChange={e => setForm(f => ({ ...f, ret: e.target.value }))} className={field} /></label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Voyageurs<input type="number" min={1} max={9} value={form.travelers} onChange={e => setForm(f => ({ ...f, travelers: Math.max(1, Number(e.target.value) || 1) }))} className={field} /></label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Budget total (€)<input type="number" min={0} step={50} value={form.budget} placeholder="Facultatif" onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} className={field} /></label>
      <div className="col-span-full flex gap-2">
        <button onClick={apply} className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-paper hover:bg-ink-2">Enregistrer</button>
        <button onClick={onClose} className="rounded-full border border-line-2 px-5 py-2.5 text-sm font-bold hover:border-ink">Annuler</button>
      </div>
    </div>
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
    <div className="flex max-w-[560px] flex-col gap-5 rounded-[28px] bg-white p-6 shadow-[0_1px_0_#E4DFD5]">
      <div className="flex items-center justify-between">
        <h1 className="m-0 text-[28px]">Paramètres</h1>
        <button onClick={onClose} className="text-sm text-muted-2 hover:text-ink">Retour au voyage</button>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Nom<input value={n} onChange={e => setN(e.target.value)} className="h-[46px] rounded-full border border-line-2 bg-cream px-4 text-[15px] font-normal" /></label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Adresse email<input value={email} disabled className="h-[46px] rounded-full border border-line bg-paper px-4 text-[15px] font-normal text-muted" /></label>
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={save} className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-paper hover:bg-ink-2">Enregistrer</button>
        <Link href="/onboarding" className="text-sm">Mes préférences de voyage</Link>
        {status && <span className="text-sm text-muted">{status}</span>}
      </div>
      <button onClick={onLogout} className="self-start rounded-full border border-line-2 px-5 py-2.5 text-sm hover:border-danger hover:text-danger">Se déconnecter</button>
    </div>
  );
}

export default function DashboardPage() {
  return <Suspense><DashboardContent /></Suspense>;
}
