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

const SEG_H = 52;
// Capsule de la barre : même hauteur et même bleu nuit partout, pour que les ponts se raccordent
const SEG = "pointer-events-auto relative z-[1] flex h-[52px] shrink-0 items-center rounded-full bg-ink";
// Élément texte dans une capsule
const PILL_ITEM = "flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[14px] font-semibold !text-white/80 transition-colors hover:bg-white/10 hover:!text-white";

/* Pont concave entre deux capsules (effet « goutte ») : il déborde sous les bouts
   arrondis de chaque capsule et se resserre au milieu. */
function Bridge() {
  const w = 30, h = SEG_H, waist = 15;
  return (
    <svg aria-hidden width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="-mx-[10px] block shrink-0 text-ink" style={{ zIndex: 0 }}>
      <path fill="currentColor" d={`M0 6 C${w * 0.32} 6 ${w * 0.38} ${waist} ${w / 2} ${waist} C${w * 0.62} ${waist} ${w * 0.68} 6 ${w} 6 L${w} ${h - 6} C${w * 0.68} ${h - 6} ${w * 0.62} ${h - waist} ${w / 2} ${h - waist} C${w * 0.38} ${h - waist} ${w * 0.32} ${h - 6} 0 ${h - 6} Z`} />
    </svg>
  );
}

/* Menu « Mes voyages » : accès au carnet, voyage en cours et voyages sauvegardés. */
function TripsMenu({ loggedIn }: { loggedIn: boolean }) {
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
        className={clsx(PILL_ITEM, open && "bg-white/10 text-white")}
      >
        Mes voyages <ChevronDown className={clsx("h-3.5 w-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+18px)] z-[120] flex w-[320px] animate-fade-up flex-col gap-1 rounded-[24px] border border-line bg-cream p-2 text-ink shadow-panel">
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
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-soft text-[15px] font-bold text-ink ring-gold/60 transition-shadow hover:ring-2 aria-expanded:ring-2"
      >
        {name.charAt(0).toUpperCase()}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+18px)] z-[120] flex w-[260px] animate-fade-up flex-col gap-0.5 rounded-[22px] border border-line bg-cream p-2 text-ink shadow-panel">
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
  const isActive = (href: string) => {
    const p = pathname || "";
    if (href !== "/explore") return p.startsWith(href);
    return p.startsWith("/explore") && !NAV.some(l => l.href !== "/explore" && p.startsWith(l.href));
  };

  return (
    <>
      {/* Capsules bleu nuit reliées : menu (rond) · logo + liens · actions.
          Le conteneur laisse passer les clics hors des capsules. */}
      <nav aria-label="Navigation principale" className={clsx("pointer-events-none font-sans", overlay ? "px-3 pt-4 sm:pt-6" : "px-3 py-3")}>
        <div className="mx-auto flex w-fit max-w-full items-center text-white drop-shadow-[0_10px_24px_rgba(15,27,45,0.22)]">
          <button onClick={() => setOpen(true)} aria-label="Ouvrir le menu" className={clsx(SEG, "w-[52px] justify-center")}>
            <span className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"><Menu className="h-[19px] w-[19px]" aria-hidden /></span>
          </button>
          <Bridge />

          <div className={clsx(SEG, "min-w-0 gap-1 px-2")}>
            <Link href="/" aria-label="Accueil Aivana" className="plain-link flex h-10 items-center px-3 !text-white"><Logo size={26} /></Link>
            <span className="hidden items-center gap-0.5 min-[1100px]:flex">
              {NAV.map(l => (
                <span key={l.href} className="flex items-center">
                  <span aria-hidden className="mx-0.5 h-4 w-px bg-white/15" />
                  <Link href={l.href} aria-current={isActive(l.href) ? "page" : undefined}
                    className={clsx("plain-link", PILL_ITEM, isActive(l.href) && "!text-gold")}>
                    {l.label}
                  </Link>
                </span>
              ))}
            </span>
          </div>
          <Bridge />

          <div className={clsx(SEG, "gap-1 px-1.5 min-[860px]:pl-2")}>
            {(user || draft) && <span className="hidden min-[860px]:block"><TripsMenu loggedIn={!!user} /></span>}
            {user ? (
              <span className="hidden min-[860px]:block"><AccountMenu name={user.name} email={user.email} /></span>
            ) : (
              <Link href="/auth/login" className={clsx("plain-link hidden min-[860px]:flex", PILL_ITEM)}>Connexion</Link>
            )}
            <button onClick={plan} aria-label="Planifier un voyage avec le copilote"
              className="flex h-10 items-center gap-2.5 rounded-full bg-gold p-1 text-[14px] font-bold tracking-[-0.01em] text-ink transition-colors hover:bg-[#D6B261] min-[860px]:pl-4">
              <span className="hidden whitespace-nowrap min-[860px]:inline">Planifier un voyage</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full text-ink min-[860px]:bg-ink min-[860px]:text-gold"><ArrowUpRight className="h-4 w-4" aria-hidden /></span>
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
