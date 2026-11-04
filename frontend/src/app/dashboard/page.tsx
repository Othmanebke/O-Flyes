"use client";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  ArrowUpRight, BedDouble, CalendarClock, CalendarPlus, Check, Circle, ExternalLink, FileText, Loader2,
  MessageSquare, Pencil, Plane, Plus, Share2, Ticket, Trash2, Wallet, X,
} from "lucide-react";
import Photo from "@/components/ui/Photo";
import { CopilotMark } from "@/components/ui/Logo";
import TripProposal from "@/components/trip/TripProposal";
import TravelAdvice from "@/components/trip/TravelAdvice";
import AccountSecurity from "@/components/account/AccountSecurity";
import { KIND, fmtDay, shortTitle } from "@/lib/trip-format";
import { eur, findDestination, searchCity } from "@/lib/catalog";
import { ask } from "@/lib/chat";
import { isPhotoKey, photoFor, type PhotoKey } from "@/lib/photos";
import {
  addDays, clearPlan, flightCoverage, formatRange, nightsBetween, planTotal, removeItem, resumeTrip, savePlan, setItemBooked, setItemDate, toast, today, tripDays, tripName, updatePlan, usePlan,
  type Plan, type PlanItem,
} from "@/lib/plan";
import { createClient } from "@/lib/supabase/browser";
import { useSession } from "@/lib/session";
import type { Booking, Trip } from "@/types/trip";

const ICON = { flight: Plane, hotel: BedDouble, activity: Ticket };
const COLORS = { flight: "#0F1B2D", hotel: "#C9A24B", activity: "#2E7650" };

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
  booked: !!b.metadata?.booked,
  serverId: b.id,
});

const photoOf = (name: string): PhotoKey => {
  const code = findDestination(name)?.code;
  return isPhotoKey(code) ? code : photoFor(name);
};

const daysUntil = (iso: string) => Math.round((new Date(iso + "T12:00:00Z").getTime() - Date.now()) / 86400000);

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

const shareUrl = (id: string) => `${window.location.origin}/voyage/${id}`;

async function share(plan: Plan) {
  if (!plan.tripId) { toast("Sauvegardez d'abord le voyage pour obtenir un lien de partage"); return; }
  try {
    const res = await axios.post(`/api/trips/${plan.tripId}/share`, { travelers: plan.travelers, budget: plan.budget ?? null, name: plan.name ?? null });
    const id = res.data.shareId as string;
    updatePlan({ shareId: id });
    const url = shareUrl(id);
    if (navigator.share) {
      try { await navigator.share({ title: `Voyage ${tripName(plan)}`, url }); return; } catch { /* partage annulé : on copie */ }
    }
    await navigator.clipboard.writeText(url);
    toast("Lien du voyage copié", { label: "Ouvrir", href: `/voyage/${id}` });
  } catch (err: unknown) {
    toast((err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Le partage n'a pas pu être activé.");
  }
}

async function stopSharing(plan: Plan) {
  if (!plan.tripId) return;
  try { await axios.delete(`/api/trips/${plan.tripId}/share`); updatePlan({ shareId: undefined }); toast("Lien de partage désactivé"); }
  catch { toast("Impossible de désactiver le lien."); }
}

/* ── briques visuelles ─────────────────────────────────────────────── */
function Panel({ title, action, children, className = "" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`flex min-w-0 flex-col gap-4 rounded-[24px] border border-line bg-white p-5 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="m-0 text-[17px] font-extrabold tracking-[-0.02em]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Kpi({ icon, label, value, sub, children }: { icon: ReactNode; label: string; value: ReactNode; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-[24px] border border-line bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold text-muted">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper text-ink">{icon}</span>
      </div>
      <span className="tabular whitespace-nowrap text-[28px] font-extrabold leading-none tracking-[-0.03em]">{value}</span>
      {sub && <span className="text-[13px] text-muted">{sub}</span>}
      {children}
    </div>
  );
}

const iconBtn = "flex h-10 w-10 items-center justify-center rounded-full border border-line-2 bg-white text-ink hover:border-ink";

/* ── page ──────────────────────────────────────────────────────────── */
function DashboardContent() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = usePlan();
  const { user, ready } = useSession();
  const [trips, setTrips] = useState<Trip[]>([]);
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
    if (!ready || !user || user.onboarded || params.get("save") || params.get("trip")) return;
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
      setSettings(false);
    } finally {
      setLoadingTrip(null);
    }
  };

  useEffect(() => { if (params.get("settings") === "1") { setSettings(true); router.replace("/dashboard"); } }, [params, router]);

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
    ...(plan && !plan.tripId ? [{ id: "draft", name: tripName(plan), place: plan.destination, active: true, onClick: () => setSettings(false) }] : []),
    ...trips.map(t => ({ id: t.id, name: t.name || t.title, place: t.title, active: plan?.tripId === t.id, onClick: () => { setSettings(false); void open(t); } })),
  ];

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-4 pb-[120px] pt-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-semibold text-muted">Tableau de bord</span>
          <span className="text-2xl font-extrabold tracking-[-0.03em]">Mes voyages</span>
        </div>
        {user && (
          <div className="flex items-center gap-3 text-sm text-muted-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper">{user.name.charAt(0).toUpperCase()}</span>
            <span className="hidden sm:inline">{user.name}</span>
            <button onClick={() => setSettings(true)} className="hover:text-ink">Paramètres</button>
            <button onClick={logout} className="hover:text-danger">Déconnexion</button>
          </div>
        )}
      </div>

      {/* Sélecteur de voyages */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {pills.map(t => (
          <button key={t.id} onClick={t.onClick} className={`flex shrink-0 items-center gap-2.5 rounded-full border py-1 pl-1 pr-4 text-sm font-bold ${t.active && !settings ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink"}`}>
            <Photo k={photoOf(t.place)} sizes="32px" className="h-8 w-8 rounded-full" />
            {t.name}
            {loadingTrip === t.id && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
          </button>
        ))}
        <Link href="/assistant" className="plain-link flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-dashed border-line-2 px-4 text-sm font-bold !text-muted-2 hover:border-ink hover:!text-ink">
          <Plus className="h-4 w-4" aria-hidden /> Nouveau voyage
        </Link>
      </div>

      {settings && user ? (
        <Settings name={user.name} email={user.email} onLogout={logout} onClose={() => setSettings(false)} />
      ) : !plan ? (
        <Empty loggedIn={!!user} />
      ) : (
        <TripDashboard plan={plan} editing={editing} setEditing={setEditing} saving={saving} onSave={save} onRemove={remove} loggedIn={!!user} />
      )}

      {!user && (
        <p className="m-0 text-[13px] text-muted">Vos voyages restent dans ce navigateur tant que vous n&apos;êtes pas connecté. <Link href="/auth/login?next=/dashboard">Se connecter</Link></p>
      )}
    </div>
  );
}

function Empty({ loggedIn }: { loggedIn: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[24px] border-[1.5px] border-dashed border-line-2 px-6 py-14 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft"><Plane className="h-7 w-7 -rotate-45" aria-hidden /></span>
      <span className="text-xl font-extrabold tracking-[-0.02em]">Aucun voyage en cours</span>
      <p className="m-0 max-w-[460px] text-[15px] text-muted-2">Décrivez votre voyage au copilote ou choisissez une destination : vols, hôtels et activités apparaîtront ici avec le budget.</p>
      <div className="flex flex-wrap justify-center gap-2">
        <button onClick={() => ask("")} className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-paper hover:bg-ink-2">Planifier avec le copilote</button>
        <Link href="/explore" className="plain-link rounded-full border border-line-2 px-5 py-3 text-sm font-bold hover:border-ink">Explorer les destinations</Link>
      </div>
      {!loggedIn && <span className="text-[13px] text-muted">Déjà un compte ? <Link href="/auth/login?next=/dashboard">Connectez-vous</Link> pour retrouver vos voyages.</span>}
    </div>
  );
}

/* Ce qui se passe une fois le voyage planifié. AIVANA ne réserve pas : l'utilisateur
   réserve chez chaque partenaire puis le coche ici. Trois états :
   1. planifié, réservations en cours · 2. tout est réservé · 3. voyage terminé. */
function NextSteps({ plan, loggedIn, saving, onSave }: { plan: Plan; loggedIn: boolean; saving: boolean; onSave: () => void }) {
  const over = daysUntil(plan.ret) < 0;
  const until = daysUntil(plan.depart);
  const todo = plan.items.filter(i => !i.booked);
  const done = plan.items.length - todo.length;
  const ghost = "flex items-center gap-2 whitespace-nowrap rounded-full border border-white/25 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10";

  if (over) {
    return (
      <section className="relative overflow-hidden rounded-[24px] bg-ink p-6 text-white sm:p-8">
        <Photo k={photoOf(plan.destination)} alt="" sizes="100vw" className="absolute inset-0 opacity-25" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div className="flex max-w-[560px] flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-gold">Voyage terminé</span>
            <h2 className="m-0 text-[clamp(24px,3vw,34px)] font-extrabold leading-tight tracking-[-0.03em]">Bon retour de {plan.destination}</h2>
            <p className="m-0 text-[15px] text-white/75">Ce carnet reste disponible pour retrouver vos adresses. Prêt pour la suite ?</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => ask("")} className="flex items-center gap-3 rounded-full bg-white py-1.5 pl-4 pr-1.5 text-sm font-bold text-ink hover:bg-[#FBF6EA]">
              Planifier le prochain voyage
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-gold"><ArrowUpRight className="h-4 w-4" aria-hidden /></span>
            </button>
            <Link href="/explore" className={`plain-link !text-white ${ghost}`}>Trouver une idée</Link>
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
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-gold"><Check className="h-4 w-4" strokeWidth={3} aria-hidden /> Tout est réservé</span>
            <h2 className="m-0 text-[clamp(24px,3vw,34px)] font-extrabold leading-tight tracking-[-0.03em]">
              Bon voyage ! {until > 0 ? `Départ dans ${until} jour${until > 1 ? "s" : ""}.` : until === 0 ? "C'est aujourd'hui." : "Profitez bien."}
            </h2>
          </div>
          <ul className="m-0 grid list-none gap-2 p-0 text-sm text-white/80 [grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))]">
            {[
              "Pièce d'identité ou passeport valide pour les dates du voyage",
              "Assurance voyage et carte de paiement utilisable à l'étranger",
              "Confirmations de réservation enregistrées hors ligne",
              "Enregistrement en ligne du vol, souvent ouvert 24 à 48 h avant",
            ].map(t => <li key={t} className="flex items-start gap-2"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />{t}</li>)}
          </ul>
          <div className="flex flex-wrap gap-2">
            <a href="/carnet" target="_blank" rel="noopener noreferrer" className={`plain-link !text-white ${ghost}`}><FileText className="h-4 w-4" aria-hidden /> Carnet PDF</a>
            <button onClick={() => downloadICS(plan)} className={ghost}><CalendarPlus className="h-4 w-4" aria-hidden /> Ajouter à l&apos;agenda</button>
            <button onClick={() => share(plan)} className={ghost}><Share2 className="h-4 w-4" aria-hidden /> Partager avec mes compagnons</button>
            <button onClick={() => ask(`Je pars à ${plan.destination} (${formatRange(plan.depart, plan.ret)}). Que mettre dans ma valise ?`)} className={ghost}><MessageSquare className="h-4 w-4" aria-hidden /> Conseils valise</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4 rounded-[24px] border border-gold/40 bg-[#FBF6EA] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex max-w-[620px] flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-gold-deep">Voyage planifié · dernière étape</span>
          <h2 className="m-0 text-[clamp(22px,2.6vw,28px)] font-extrabold leading-tight tracking-[-0.03em]">Il ne reste plus qu&apos;à réserver</h2>
          <p className="m-0 text-sm text-muted-2">AIVANA ne réserve pas à votre place : chaque lien ouvre le site du partenaire avec vos dates, où vous verrez le prix du jour. Cochez « C&apos;est réservé » au fur et à mesure.</p>
        </div>
        <div className="flex min-w-[160px] flex-col items-end gap-1.5">
          <span className="tabular text-2xl font-extrabold">{done} / {plan.items.length}</span>
          <span className="text-xs text-muted">réservé{done > 1 ? "s" : ""}</span>
          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-ok transition-all" style={{ width: `${(done / Math.max(1, plan.items.length)) * 100}%` }} /></div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {todo.map(i => {
          const Icon = ICON[i.type];
          return (
            <div key={i.key} className="flex flex-wrap items-center gap-3 rounded-[16px] bg-white px-3 py-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3EEE6]"><Icon className="h-4 w-4" aria-hidden /></span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-bold">{shortTitle(i)}</span>
                <span className="truncate text-xs text-muted">{i.provider ? `Chez ${i.provider} · ` : ""}{i.price != null ? `${eur(i.price)} estimé` : "prix à vérifier"}</span>
              </span>
              <span className="flex items-center gap-2">
                {i.url && (
                  <a href={i.url} target="_blank" rel="noopener noreferrer" className="plain-link flex items-center gap-1.5 whitespace-nowrap rounded-full bg-ink px-3.5 py-2 text-xs font-bold !text-white hover:bg-ink-2">
                    Réserver <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                )}
                <button onClick={() => setItemBooked(i.key, true)} className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line-2 px-3.5 py-2 text-xs font-bold hover:border-ok hover:text-ok">
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
          <button onClick={onSave} disabled={saving} className="flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white hover:bg-ink-2 disabled:opacity-60">
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {loggedIn ? "Sauvegarder dans mon compte" : "Sauvegarder avec un compte"}
          </button>
        </div>
      )}
    </section>
  );
}

function TripDashboard({ plan, editing, setEditing, saving, onSave, onRemove, loggedIn }: {
  plan: Plan; editing: boolean; setEditing: (b: boolean) => void;
  saving: boolean; onSave: () => void; onRemove: () => void; loggedIn: boolean;
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
    { label: "Vol retour", done: cover.return, href: cover.outbound ? "/explore/flights?leg=retour" : `/explore/flights?${ctx}` },
    { label: `Hébergement · ${nights} nuit${nights > 1 ? "s" : ""}`, done: has("hotel"), href: `/explore/hotels?${ctx}` },
    { label: "Activités sur place", done: has("activity"), href: `/explore/activities?${ctx}` },
  ];
  const ready = checklist.filter(c => c.done).length;

  const byType = (["flight", "hotel", "activity"] as const).map(t => ({
    type: t, label: t === "flight" ? "Vols" : t === "hotel" ? "Hébergement" : "Activités",
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
        <Photo k={photoOf(plan.destination)} alt={plan.destination} sizes="88px" className="h-[72px] w-[88px] shrink-0 rounded-[16px]" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="m-0 text-[clamp(24px,3vw,32px)] font-extrabold leading-none tracking-[-0.03em]">{tripName(plan)}</h1>
            <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${plan.tripId ? "bg-[#CFE6D6] text-ok" : "bg-gold-soft text-gold-deep"}`}>{plan.tripId ? "Sauvegardé" : "Brouillon"}</span>
          </div>
          <span className="text-sm text-muted-2">{formatRange(plan.depart, plan.ret)} · {nights} nuit{nights > 1 ? "s" : ""} · {plan.travelers} voyageur{plan.travelers > 1 ? "s" : ""} · depuis {plan.origin}{plan.name ? ` · ${plan.destination}` : ""}</span>
          {plan.shareId && (
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
              <span className="font-semibold text-ok">Lien public actif</span>
              <button onClick={() => navigator.clipboard.writeText(shareUrl(plan.shareId!)).then(() => toast("Lien copié"))} className="font-semibold text-gold-deep hover:text-[#6E5323]">Copier</button>
              <a href={`/voyage/${plan.shareId}`} target="_blank" rel="noopener noreferrer" className="font-semibold">Ouvrir</a>
              <button onClick={() => stopSharing(plan)} className="text-muted-2 hover:text-danger">Désactiver</button>
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!plan.tripId && (
            <button onClick={onSave} disabled={saving} className="flex items-center gap-2 whitespace-nowrap rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white hover:bg-ink-2 disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {loggedIn ? "Sauvegarder" : "Sauvegarder avec un compte"}
            </button>
          )}
          <button onClick={() => setEditing(!editing)} aria-label="Modifier les dates, voyageurs et budget" title="Modifier" className={iconBtn}><Pencil className="h-4 w-4" aria-hidden /></button>
          <button onClick={() => share(plan)} aria-label="Partager" title="Partager" className={iconBtn}><Share2 className="h-4 w-4" aria-hidden /></button>
          <a href="/carnet" target="_blank" rel="noopener noreferrer" aria-label="Télécharger le carnet en PDF" title="Carnet PDF" className={`plain-link !text-ink ${iconBtn}`}><FileText className="h-4 w-4" aria-hidden /></a>
          <button onClick={() => downloadICS(plan)} aria-label="Exporter dans l'agenda" title="Exporter dans l'agenda (.ics)" className={iconBtn}><CalendarPlus className="h-4 w-4" aria-hidden /></button>
          <button onClick={onRemove} aria-label="Supprimer ce voyage" title="Supprimer" className={`${iconBtn} hover:!border-danger hover:text-danger`}><Trash2 className="h-4 w-4" aria-hidden /></button>
        </div>
      </div>

      {editing && <EditTrip plan={plan} onClose={() => setEditing(false)} />}

      {/* Fin de la planification : ce qui se passe ensuite */}
      {plan.items.length > 0 && (ready === checklist.length || daysUntil(plan.ret) < 0) && (
        <NextSteps plan={plan} loggedIn={loggedIn} saving={saving} onSave={onSave} />
      )}

      {/* Indicateurs */}
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))]">
        <Kpi icon={<Wallet className="h-4 w-4" aria-hidden />} label="Total estimé" value={eur(spent)} sub={`${plan.items.length} élément${plan.items.length > 1 ? "s" : ""} · ${eur(spent / plan.travelers)} / pers.`} />
        <Kpi
          icon={<Circle className="h-4 w-4" aria-hidden />}
          label="Budget"
          value={plan.budget ? `${Math.round((spent / plan.budget) * 100)} %` : "—"}
          sub={plan.budget
            ? (spent > plan.budget ? <span className="text-danger">{eur(spent - plan.budget)} au-dessus de {eur(plan.budget)}</span> : <span className="text-ok">{eur(plan.budget - spent)} restants sur {eur(plan.budget)}</span>)
            : <button onClick={() => setEditing(true)} className="font-semibold text-gold-deep hover:text-[#6E5323]">Fixer un budget</button>}
        >
          {plan.budget ? <div className="h-1.5 overflow-hidden rounded-full bg-[#EFEBE4]"><div className={`h-full rounded-full ${spent > plan.budget ? "bg-danger" : "bg-gold"}`} style={{ width: `${Math.min(100, (spent / plan.budget) * 100)}%` }} /></div> : null}
        </Kpi>
        <Kpi icon={<CalendarClock className="h-4 w-4" aria-hidden />} label="Départ" value={until > 0 ? `J-${until}` : until === 0 ? "Aujourd'hui" : "Passé"} sub={fmtDay(plan.depart, { weekday: "long", day: "numeric", month: "long" })} />
        <Kpi icon={<Check className="h-4 w-4" aria-hidden />} label="Étapes prêtes" value={`${ready} / 4`} sub="Aller, retour, hôtel, activité">
          <div className="grid grid-cols-4 gap-1">{checklist.map(c => <span key={c.label} className={`h-1.5 rounded-full ${c.done ? "bg-ok" : "bg-[#EFEBE4]"}`} />)}</div>
        </Kpi>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
        {/* Colonne principale */}
        <div className="flex min-w-0 flex-col gap-5">
          <Panel
            title="Réservations"
            action={<span className="text-[13px] text-muted">{plan.items.length} élément{plan.items.length > 1 ? "s" : ""} · prix estimés</span>}
          >
            {sorted.length === 0 ? (
              <p className="m-0 text-sm text-muted">Rien pour l&apos;instant. Ajoutez un vol, un hôtel ou une activité avec la checklist.</p>
            ) : (
              <div className="flex flex-col divide-y divide-line">
                {sorted.map(i => {
                  const Icon = ICON[i.type];
                  return (
                    <div key={i.key} className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3EEE6]"><Icon className="h-[17px] w-[17px]" aria-hidden /></span>
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
                            {dayOptions.map(d => <option key={d.date} value={d.date}>{d.label}</option>)}
                          </select>
                        )}
                        {i.type === "flight" && i.date && <span className="text-[13px] text-muted">{fmtDay(i.date)}</span>}
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="flex flex-col items-end">
                          <span className="tabular whitespace-nowrap text-[15px] font-extrabold">{i.price === 0 ? "Gratuit" : i.price != null ? eur(i.price) : "—"}</span>
                          <button
                            onClick={() => setItemBooked(i.key, !i.booked)}
                            title={i.booked ? "Annuler : pas encore réservé" : "Je l'ai réservé chez le partenaire"}
                            className={`mt-0.5 flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold transition-colors ${i.booked ? "bg-[#CFE6D6] text-ok hover:bg-[#BFDCC8]" : "bg-gold-soft text-gold-deep hover:bg-[#EAD7AC]"}`}
                          >
                            {i.booked ? <><Check className="h-3 w-3" strokeWidth={3} aria-hidden /> Réservé</> : "À réserver"}
                          </button>
                        </span>
                        {i.url && <a href={i.url} target="_blank" rel="noopener noreferrer" aria-label="Réserver chez le partenaire" title="Réserver chez le partenaire" className="text-muted hover:text-ink"><ExternalLink className="h-4 w-4" aria-hidden /></a>}
                        <button onClick={() => removeItem(i.key)} aria-label={`Retirer ${i.title}`} title="Retirer" className="text-muted hover:text-danger"><X className="h-4 w-4" aria-hidden /></button>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          <Panel title="Itinéraire" action={<span className="text-[13px] text-muted">{days.length} jour{days.length > 1 ? "s" : ""}</span>}>
            <ol className="m-0 flex list-none flex-col p-0">
              {days.map((d, n) => {
                const lines = [
                  ...(n === 0 ? [`Départ de ${plan.origin}`] : []),
                  ...d.items.map(i => `${KIND[i.type]} · ${shortTitle(i)}`),
                  ...(n === days.length - 1 && n > 0 ? [`Retour vers ${plan.origin}`] : []),
                ];
                return (
                  <li key={d.date} className="grid grid-cols-[64px_16px_minmax(0,1fr)] gap-3">
                    <span className="pt-0.5 text-right text-[13px] font-bold text-muted">{fmtDay(d.date, { day: "numeric", month: "short" })}</span>
                    <span className="relative flex justify-center">
                      <span className={`relative z-[1] mt-1.5 h-2.5 w-2.5 rounded-full ${lines.length ? "bg-gold" : "bg-line-2"}`} />
                      {n < days.length - 1 && <span className="absolute bottom-0 top-3 w-px bg-line" />}
                    </span>
                    <span className="flex flex-col gap-0.5 pb-4">
                      <span className="text-[13px] font-extrabold">Jour {n + 1}</span>
                      {lines.length ? lines.map((l, j) => <span key={j} className="text-sm text-muted-2">{l}</span>) : <span className="text-sm text-muted">Journée libre</span>}
                    </span>
                  </li>
                );
              })}
            </ol>
            {unplaced.length > 0 && (
              <div className="flex flex-col gap-1 rounded-[16px] bg-paper p-3 text-sm">
                <span className="text-[13px] font-bold text-muted">À placer dans le séjour</span>
                {unplaced.map(i => <span key={i.key} className="text-muted-2">{KIND[i.type]} · {shortTitle(i)}</span>)}
              </div>
            )}
          </Panel>

          <Panel title="Bon à savoir avant de partir" action={<span className="text-[13px] text-muted">{plan.country || cat?.country || plan.destination}</span>}>
            <TravelAdvice country={plan.country || cat?.country} />
          </Panel>
        </div>

        {/* Colonne latérale */}
        <div className="flex min-w-0 flex-col gap-5">
          <Panel title="Checklist" action={<span className="text-[13px] font-bold text-ok">{ready}/4</span>}>
            <div className="flex flex-col gap-2">
              {checklist.map(c => (
                <Link key={c.label} href={c.href} className={`plain-link flex items-center gap-3 rounded-[16px] border px-3 py-2.5 text-sm ${c.done ? "border-transparent bg-[#EEF6F0]" : "border-dashed border-line-2 hover:border-ink"}`}>
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${c.done ? "bg-ok text-white" : "border-[1.5px] border-line-2"}`}>{c.done && <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />}</span>
                  <span className={`flex-1 font-semibold ${c.done ? "text-muted-2 line-through decoration-ok/50" : ""}`}>{c.label}</span>
                  {!c.done && <span className="text-[13px] font-bold text-gold-deep">Ajouter</span>}
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="Répartition du budget">
            {spent > 0 ? (
              <>
                <div className="flex h-3 overflow-hidden rounded-full bg-[#EFEBE4]">
                  {byType.filter(b => b.amount > 0).map(b => <span key={b.type} style={{ width: `${(b.amount / spent) * 100}%`, background: COLORS[b.type] }} />)}
                </div>
                <div className="flex flex-col gap-2">
                  {byType.map(b => (
                    <div key={b.type} className="flex items-center gap-2.5 text-sm">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[b.type] }} />
                      <span className="flex-1 text-muted-2">{b.label}</span>
                      <span className="tabular font-bold">{eur(b.amount)}</span>
                      <span className="tabular w-10 text-right text-[13px] text-muted">{spent ? Math.round((b.amount / spent) * 100) : 0} %</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <p className="m-0 text-sm text-muted">La répartition apparaîtra dès le premier ajout.</p>}
          </Panel>

          <Panel title="Copilote">
            <div className="flex items-start gap-3">
              <CopilotMark size={36} />
              <p className="m-0 rounded-[4px_16px_16px_16px] bg-paper px-3 py-2.5 text-sm text-muted-2">
                {!cover.outbound ? "Commencez par le vol aller : je peux vous aider à choisir les dates."
                  : !cover.return ? "Il manque le vol retour. Voulez-vous que je compare les options ?"
                  : !has("hotel") ? `Quel quartier pour ${nights} nuits à ${plan.destination} ? Je peux vous conseiller.`
                  : plan.items.some(i => !i.booked) ? "Tout est planifié. Réservez chaque élément chez le partenaire, puis cochez-le « Réservé »."
                  : "Tout est réservé. Je peux affiner l'itinéraire jour par jour ou vous conseiller pour la valise."}
              </p>
            </div>
            <button onClick={() => ask(`Je prépare ${plan.destination} (${formatRange(plan.depart, plan.ret)}, ${plan.travelers} personnes${plan.budget ? `, budget ${plan.budget} €` : ""}). Que me conseilles-tu ?`)} className="flex items-center justify-between gap-3 rounded-full bg-ink py-1.5 pl-4 pr-1.5 text-sm font-bold text-white hover:bg-ink-2">
              Demander au copilote
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink"><MessageSquare className="h-4 w-4" aria-hidden /></span>
            </button>
          </Panel>

          <Panel title="Carnet de voyage">
            <p className="m-0 text-sm text-muted-2">Tout le voyage sur une page : réservations, itinéraire jour par jour, budget et conseils pratiques. À garder hors ligne ou à imprimer.</p>
            <a href="/carnet" target="_blank" rel="noopener noreferrer" className="plain-link flex items-center justify-between gap-3 rounded-full bg-ink py-1.5 pl-4 pr-1.5 text-sm font-bold !text-white hover:bg-ink-2">
              Télécharger le PDF
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink"><FileText className="h-4 w-4" aria-hidden /></span>
            </a>
          </Panel>
        </div>
      </div>

      {/* Proposition IA */}
      <Panel title="Itinéraire proposé par le copilote" action={<CopilotMark size={28} />}>
        {plan.tripId
          ? <TripProposal tripId={plan.tripId} destinationName={plan.destination} context={{ originCity: plan.origin, travelers: plan.travelers, budgetEur: plan.budget ?? null, booked: plan.items.map(shortTitle) }} />
          : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="m-0 text-sm text-muted-2">Sauvegardez ce voyage pour recevoir un itinéraire jour par jour : où aller, quoi ne pas manquer, comment se déplacer.</p>
              <button onClick={onSave} disabled={saving} className="flex items-center gap-2 rounded-full bg-ink py-1.5 pl-4 pr-1.5 text-sm font-bold text-white hover:bg-ink-2 disabled:opacity-60">
                {loggedIn ? "Sauvegarder" : "Sauvegarder avec un compte"}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink"><ArrowUpRight className="h-4 w-4" aria-hidden /></span>
              </button>
            </div>
          )}
      </Panel>
    </>
  );
}

function EditTrip({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const [form, setForm] = useState({ name: plan.name || "", depart: plan.depart, ret: plan.ret, travelers: plan.travelers, budget: plan.budget ? String(plan.budget) : "" });
  const apply = async () => {
    const patch = { name: form.name.trim() || undefined, depart: form.depart, ret: form.ret < form.depart ? form.depart : form.ret, travelers: form.travelers, budget: form.budget ? Number(form.budget) : null };
    updatePlan(patch);
    if (plan.tripId) {
      try { await axios.patch(`/api/trips/${plan.tripId}`, { start_date: patch.depart, end_date: patch.ret }); } catch { /* ignoré */ }
      // nom, voyageurs, budget : colonnes de la migration 0006
      try { await axios.patch(`/api/trips/${plan.tripId}`, { name: patch.name ?? null, travelers: patch.travelers, budget: patch.budget }); } catch { /* ignoré */ }
    }
    onClose();
  };
  const field = "rounded-full border border-line-2 bg-white px-3 py-2 text-sm text-ink";
  return (
    <div className="grid gap-3 rounded-[24px] border border-line bg-white p-5 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
      <label className="col-span-full flex flex-col gap-1 text-xs font-semibold text-muted">Nom du voyage<input value={form.name} maxLength={80} placeholder={plan.destination} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={field} /></label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Départ<input type="date" min={today()} value={form.depart} onChange={e => setForm(f => ({ ...f, depart: e.target.value }))} className={field} /></label>
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
    <div className="flex max-w-[640px] flex-col gap-5">
    <div className="flex flex-col gap-5 rounded-[24px] border border-line bg-white p-6">
      <div className="flex items-center justify-between">
        <h1 className="m-0 text-[24px]">Paramètres</h1>
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
    <AccountSecurity />
    </div>
  );
}

export default function DashboardPage() {
  return <Suspense><DashboardContent /></Suspense>;
}
