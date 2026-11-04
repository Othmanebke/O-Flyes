"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ArrowUpRight, ChevronDown, Loader2, Menu, Plus, X } from "lucide-react";
import { clsx } from "clsx";
import Logo from "@/components/ui/Logo";
import Photo from "@/components/ui/Photo";
import { ask } from "@/lib/chat";
import { clearPlan, formatRange, tripName, usePlan } from "@/lib/plan";
import { createClient } from "@/lib/supabase/browser";
import { findDestination } from "@/lib/catalog";
import { isPhotoKey, photoFor, type PhotoKey } from "@/lib/photos";
import type { Trip } from "@/types/trip";
import { useSession } from "@/lib/session";

const LINKS = [
  { label: "Accueil", href: "/", note: "Le point de départ" },
  { label: "Destinations", href: "/explore", note: "22 idées" },
  { label: "Vols", href: "/explore/flights", note: "Depuis Paris" },
  { label: "Hôtels", href: "/explore/hotels", note: "Prix par nuit" },
  { label: "Activités", href: "/explore/activities", note: "Sur place" },
  { label: "Journal", href: "/blog", note: "Récits" },
  { label: "Mes voyages", href: "/dashboard", note: "Votre carnet" },
  { label: "Aide", href: "/aide", note: "Questions fréquentes" },
];

/* Liens visibles dans la barre sur grand écran (le menu burger les reprend tous) */
const NAV = [
  { label: "Destinations", href: "/explore" },
  { label: "Vols", href: "/explore/flights" },
  { label: "Hôtels", href: "/explore/hotels" },
  { label: "Activités", href: "/explore/activities" },
  { label: "Journal", href: "/blog" },
];

/* Pastilles de la barre, chacune séparée : verre dépoli sur la photo de l'accueil,
   blanc cassé sur les autres pages (même famille que les cartes du site). */
const pill = (glass: boolean) => clsx(
  "pointer-events-auto flex h-12 shrink-0 items-center rounded-full border backdrop-blur-md transition-colors",
  glass
    ? "border-white/25 bg-white/[0.12] text-white shadow-[0_8px_24px_rgba(15,27,45,0.18)]"
    : "border-line bg-white/85 text-ink shadow-[0_6px_20px_rgba(15,27,45,0.06)]",
);
const pillHover = (glass: boolean) => (glass ? "hover:bg-white/[0.2]" : "hover:bg-white");

/* Menu « Mes voyages » : accès au carnet, voyage en cours et voyages sauvegardés. */
function TripsMenu({ loggedIn, glass }: { loggedIn: boolean; glass: boolean }) {
  const plan = usePlan();
  const [open, setOpen] = useState(false);
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    if (loggedIn) axios.get<Trip[]>("/api/trips").then(r => setTrips(r.data || [])).catch(() => setTrips([]));
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onKey); };
  }, [open, loggedIn]);

  const photoOf = (name: string): PhotoKey => { const c = findDestination(name)?.code; return isPhotoKey(c) ? c : photoFor(name); };
  const draft = plan && !plan.tripId ? plan : null;
  const saved = (trips || []).map(t => ({ ...t, current: plan?.tripId === t.id }));
  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative hidden min-[860px]:block">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={clsx(pill(glass), pillHover(glass), "gap-1.5 whitespace-nowrap px-5 text-[14px] font-semibold")}
      >
        Mes voyages <ChevronDown className={clsx("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+10px)] z-[120] flex w-[320px] animate-fade-up flex-col gap-1 rounded-[24px] border border-line bg-cream p-2 text-ink shadow-panel">
          <Link href="/dashboard" onClick={close} className="plain-link flex items-center justify-between gap-3 rounded-[18px] bg-ink px-4 py-3 text-sm font-bold !text-white hover:bg-ink-2">
            Voir mon carnet <ArrowUpRight className="h-4 w-4 text-gold" aria-hidden />
          </Link>

          {draft && (
            <Link href="/dashboard" onClick={close} className="plain-link flex items-center gap-3 rounded-[18px] px-2 py-2 hover:bg-white">
              <Photo k={photoOf(draft.destination)} sizes="40px" className="h-10 w-10 shrink-0 rounded-full" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-bold">{tripName(draft)}</span>
                <span className="text-xs text-muted">{formatRange(draft.depart, draft.ret)} · {draft.items.length} élément{draft.items.length > 1 ? "s" : ""}</span>
              </span>
              <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-bold">Brouillon</span>
            </Link>
          )}

          {loggedIn && trips === null && (
            <span className="flex items-center gap-2 px-3 py-3 text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Chargement…</span>
          )}
          {saved.map(t => (
            <Link key={t.id} href={`/dashboard?trip=${t.id}`} onClick={close} className="plain-link flex items-center gap-3 rounded-[18px] px-2 py-2 hover:bg-white">
              <Photo k={photoOf(t.title)} sizes="40px" className="h-10 w-10 shrink-0 rounded-full" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-bold">{t.name || t.title}</span>
                <span className="text-xs text-muted">{formatRange(t.start_date, t.end_date)}</span>
              </span>
              {t.current && <span className="rounded-full bg-[#CFE6D6] px-2 py-0.5 text-[11px] font-bold">Ouvert</span>}
            </Link>
          ))}

          {!draft && loggedIn && trips?.length === 0 && (
            <span className="px-3 py-3 text-sm text-muted">Aucun voyage sauvegardé pour le moment.</span>
          )}
          {!loggedIn && (
            <Link href="/auth/login?next=/dashboard" onClick={close} className="plain-link rounded-[18px] px-3 py-3 text-sm hover:bg-white">
              <span className="font-bold">Se connecter</span> <span className="text-muted">pour retrouver vos voyages sauvegardés</span>
            </Link>
          )}

          <Link href="/assistant" onClick={close} className="plain-link mt-1 flex items-center gap-2 rounded-[18px] border-[1.5px] border-dashed border-line-2 px-3 py-2.5 text-sm font-bold !text-muted-2 hover:border-ink hover:!text-ink">
            <Plus className="h-4 w-4" aria-hidden /> Nouveau voyage
          </Link>
        </div>
      )}
    </div>
  );
}

/* Menu du compte : carnet, paramètres, déconnexion */
function AccountMenu({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onKey); };
  }, [open]);
  const logout = async () => {
    setOpen(false);
    await createClient().auth.signOut();
    clearPlan();
    router.push("/");
  };
  const item = "plain-link block w-full rounded-[14px] px-3 py-2.5 text-left text-sm font-semibold !text-ink hover:bg-white";
  return (
    <div ref={ref} className="relative hidden min-[860px]:block">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Mon compte"
        className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold-soft text-[16px] font-bold text-ink shadow-[0_6px_20px_rgba(15,27,45,0.12)] ring-gold/60 ring-offset-2 ring-offset-transparent transition-shadow hover:ring-2 aria-expanded:ring-2"
      >
        {name.charAt(0).toUpperCase()}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+10px)] z-[120] flex w-[260px] animate-fade-up flex-col gap-0.5 rounded-[22px] border border-line bg-cream p-2 text-ink shadow-panel">
          <div className="flex flex-col px-3 pb-2 pt-1.5">
            <span className="truncate text-sm font-bold">{name}</span>
            <span className="truncate text-xs text-muted">{email}</span>
          </div>
          <Link href="/dashboard" onClick={() => setOpen(false)} className={item}>Mon carnet de voyage</Link>
          <Link href="/dashboard?settings=1" onClick={() => setOpen(false)} className={item}>Paramètres du compte</Link>
          <Link href="/onboarding" onClick={() => setOpen(false)} className={item}>Mes préférences de voyage</Link>
          <button onClick={logout} className="mt-1 w-full rounded-[14px] border-t border-line px-3 py-2.5 text-left text-sm font-semibold text-danger hover:bg-white">Se déconnecter</button>
        </div>
      )}
    </div>
  );
}

export default function Navbar({ overlay = false }: { overlay?: boolean }) {
  const pathname = usePathname();
  const { user } = useSession();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const plan = () => { setOpen(false); ask(""); };
  const draft = usePlan();
  const glass = overlay;
  const isActive = (href: string) => {
    const p = pathname || "";
    if (href !== "/explore") return p.startsWith(href);
    return p.startsWith("/explore") && !NAV.some(l => l.href !== "/explore" && p.startsWith(l.href));
  };

  return (
    <>
      {/* Trois groupes séparés : menu + logo à gauche, liens au centre, actions à droite.
          Chaque élément est sa propre pastille arrondie ; le conteneur laisse passer les clics. */}
      <nav aria-label="Navigation principale" className={clsx("pointer-events-none font-sans", overlay ? "px-4 pt-4 sm:px-8 sm:pt-6" : "px-4 py-3 sm:px-8")}>
        <div className="mx-auto grid max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex items-center gap-3 justify-self-start">
            <button onClick={() => setOpen(true)} aria-label="Ouvrir le menu" className={clsx(pill(glass), pillHover(glass), "w-12 justify-center")}>
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            {/* Sur l'accueil, le logo est dans le hero (au-dessus du titre) */}
            {!overlay && <Link href="/" aria-label="Accueil Aivana" className="plain-link pointer-events-auto !text-ink"><Logo size={30} /></Link>}
          </div>

          <div className={clsx(pill(glass), "hidden gap-0.5 px-1.5 min-[1100px]:flex")}>
            {NAV.map(l => {
              const on = isActive(l.href);
              return (
                <Link key={l.href} href={l.href} aria-current={on ? "page" : undefined}
                  className={clsx(
                    "plain-link flex h-9 items-center whitespace-nowrap rounded-full px-4 text-[14px] font-semibold transition-colors",
                    on
                      ? glass ? "bg-white !text-ink" : "bg-ink !text-white"
                      : glass ? "!text-white/85 hover:bg-white/15 hover:!text-white" : "!text-ink/75 hover:bg-ink/[0.06] hover:!text-ink",
                  )}>
                  {l.label}
                </Link>
              );
            })}
          </div>

          <div className="col-start-3 flex items-center gap-2 justify-self-end">
            {(user || draft) && <span className="hidden min-[860px]:block"><TripsMenu loggedIn={!!user} glass={glass} /></span>}
            {user ? (
              <span className="hidden min-[860px]:block"><AccountMenu name={user.name} email={user.email} /></span>
            ) : (
              <Link href="/auth/login" className={clsx("plain-link hidden whitespace-nowrap px-5 text-[14px] font-semibold min-[860px]:flex", pill(glass), pillHover(glass), glass ? "!text-white" : "!text-ink")}>Connexion</Link>
            )}
            <button onClick={plan} aria-label="Planifier un voyage avec le copilote"
              className={clsx(
                "pointer-events-auto flex h-12 items-center gap-3 rounded-full p-0 text-[14px] font-bold tracking-[-0.01em] transition-colors min-[860px]:p-1.5 min-[860px]:pl-5",
                glass ? "bg-white text-ink shadow-[0_8px_24px_rgba(15,27,45,0.18)] hover:bg-[#FBF6EA]" : "bg-ink text-white shadow-[0_6px_20px_rgba(15,27,45,0.16)] hover:bg-ink-2",
              )}>
              <span className="hidden whitespace-nowrap min-[860px]:inline">Planifier un voyage</span>
              <span className={clsx("flex h-12 w-12 items-center justify-center rounded-full min-[860px]:h-9 min-[860px]:w-9", glass ? "bg-ink text-gold" : "bg-gold text-ink")}><ArrowUpRight className="h-4 w-4" aria-hidden /></span>
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-[300] flex bg-paper font-sans text-ink" role="dialog" aria-modal="true" aria-label="Menu">
          {/* Colonne des liens : défile si l'écran est trop bas, tailles indexées sur largeur ET hauteur */}
          <div className="flex min-w-0 flex-1 flex-col gap-[clamp(16px,3vh,28px)] overflow-y-auto px-5 py-5 sm:px-10 sm:py-[clamp(20px,4vh,40px)]">
            <div className="flex items-center justify-between">
              <button onClick={() => setOpen(false)} className="flex items-center gap-3 text-[15px] font-bold text-ink">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white"><X className="h-5 w-5" aria-hidden /></span>
                Fermer
              </button>
              <Logo size={28} />
            </div>
            <nav className="grid gap-x-10 sm:grid-cols-2 sm:my-auto">
              {[...LINKS, user ? { label: "Mon compte", href: "/dashboard", note: user.name } : { label: "Connexion", href: "/auth/login", note: "Ou créer un compte" }].map(l => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="plain-link flex items-baseline justify-between gap-4 border-b border-dashed border-line-2 py-[clamp(8px,1.4vh,14px)] transition-colors hover:!text-gold-deep"
                >
                  <span className={clsx("text-[clamp(20px,min(3vw,4.2vh),34px)] font-bold leading-[1.1] tracking-[-0.035em]", pathname === l.href && "text-gold-deep")}>{l.label}</span>
                  <span className="hidden whitespace-nowrap font-serif text-[15px] italic text-muted min-[420px]:inline">{l.note}</span>
                </Link>
              ))}
            </nav>
            <ArrowPillInline onClick={plan} />
          </div>
          {/* Photo : uniquement sur grand écran, elle ne prend jamais la place des liens */}
          <div className="relative m-4 hidden w-[38%] max-w-[560px] shrink-0 overflow-hidden rounded-[28px] bg-[#2A2620] min-[1100px]:block">
            <Photo k="balloons" sizes="40vw" className="absolute inset-0" />
            <div className="absolute inset-x-6 bottom-6 flex flex-col gap-1.5 text-white">
              <span className="font-serif text-[26px] italic">Où partez-vous ensuite ?</span>
              <span className="text-[15px] text-white/85">22 destinations, de 650 € à deux.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ArrowPillInline({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 self-start rounded-full bg-ink py-1.5 pl-[22px] pr-1.5 text-[15px] font-bold text-white hover:bg-ink-2">
      Demander au copilote
      <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-gold-soft text-ink"><ArrowUpRight className="h-4 w-4" aria-hidden /></span>
    </button>
  );
}
