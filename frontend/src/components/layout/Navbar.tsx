"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, Plane, X } from "lucide-react";
import { clsx } from "clsx";
import Logo from "@/components/ui/Logo";
import Photo from "@/components/ui/Photo";
import { ask } from "@/lib/chat";
import { usePlan } from "@/lib/plan";
import { useSession } from "@/lib/session";

const LINKS = [
  { label: "Accueil", href: "/", note: "Le point de départ" },
  { label: "Destinations", href: "/explore", note: "22 idées" },
  { label: "Vols", href: "/explore/flights", note: "Depuis Paris" },
  { label: "Hôtels", href: "/explore/hotels", note: "Prix par nuit" },
  { label: "Activités", href: "/explore/activities", note: "Sur place" },
  { label: "Journal", href: "/blog", note: "Récits" },
  { label: "Mes voyages", href: "/dashboard", note: "Votre carnet" },
  { label: "Tarifs", href: "/pricing", note: "Gratuit ou Pro" },
];

/* Compteur du voyage en cours : « Lisbonne · 3 éléments », mène au carnet. */
function PlanCounter({ overlay }: { overlay: boolean }) {
  const plan = usePlan();
  if (!plan) return null;
  const n = plan.items.length;
  return (
    <Link
      href="/dashboard"
      title="Voir mon voyage en cours"
      className={clsx(
        "plain-link flex h-[46px] items-center gap-2 whitespace-nowrap rounded-full border pl-1.5 pr-3.5 text-sm font-semibold transition-colors sm:h-[52px]",
        overlay ? "border-white/55 text-white hover:bg-white/10" : "border-line-2 bg-white text-ink hover:border-ink",
      )}
    >
      <span className={clsx("flex h-8 w-8 items-center justify-center rounded-full sm:h-9 sm:w-9", overlay ? "bg-white/15" : "bg-gold-soft")}>
        <Plane className="h-4 w-4 -rotate-45" aria-hidden />
      </span>
      <span className="max-w-[120px] truncate sm:max-w-[160px]">{plan.destination}</span>
      <span className={clsx("tabular rounded-full px-2 py-0.5 text-xs", overlay ? "bg-white text-ink" : "bg-ink text-white")}>
        {n}<span className="hidden sm:inline"> élément{n > 1 ? "s" : ""}</span>
      </span>
    </Link>
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
  const fg = overlay ? "text-white" : "text-ink";
  const account = user
    ? { label: "Mes voyages", href: "/dashboard" }
    : { label: "Connexion", href: "/auth/login" };

  return (
    <>
      <nav
        className={clsx(
          "font-sans",
          overlay
            ? "px-4 py-4 sm:px-9 sm:py-7"
            : "border-b border-line-2/60 bg-paper/80 px-4 py-2.5 backdrop-blur-[18px] backdrop-saturate-150 sm:px-8 sm:py-3",
        )}
      >
        <div className="mx-auto grid max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center gap-4">
          <button onClick={() => setOpen(true)} className={clsx("flex items-center gap-3 justify-self-start text-[15px] font-bold", fg)} aria-label="Ouvrir le menu">
            <span className={clsx(
              "flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white text-xl text-ink",
              overlay ? "sm:h-[60px] sm:w-[60px]" : "shadow-[0_0_0_1px_#E4DFD5] sm:h-[50px] sm:w-[50px]",
            )}>
              <Menu className="h-5 w-5" aria-hidden />
            </span>
            <span className="hidden sm:inline">Menu</span>
          </button>

          <Link href="/" aria-label="Accueil Aivana" className={clsx("plain-link", fg)}>
            <span className="sm:hidden"><Logo size={30} /></span>
            <span className="hidden sm:inline"><Logo size={overlay ? 44 : 36} /></span>
          </Link>

          <div className="flex items-center gap-2.5 justify-self-end">
            <span className="hidden md:flex"><PlanCounter overlay={overlay} /></span>
            <Link
              href={account.href}
              className={clsx(
                "plain-link hidden items-center whitespace-nowrap rounded-full border px-[18px] text-[15px] font-bold transition-colors min-[860px]:flex",
                overlay ? "h-[60px] border-white/55 text-white hover:bg-white/10" : "h-[52px] border-line-2 text-ink hover:bg-white",
              )}
            >
              {account.label}
            </Link>
            <button
              onClick={plan}
              className={clsx(
                "flex items-center gap-3.5 rounded-full bg-white p-[5px] text-[15px] font-bold tracking-[-0.01em] text-ink transition-colors hover:bg-[#FBF6EA] min-[860px]:pl-[26px]",
                !overlay && "shadow-[0_0_0_1px_#E4DFD5]",
              )}
              aria-label="Planifier un voyage avec le copilote"
            >
              <span className="hidden whitespace-nowrap min-[860px]:inline">Planifier un voyage</span>
              <span className={clsx(
                "flex h-[38px] w-[38px] items-center justify-center rounded-full bg-ink text-gold",
                overlay ? "sm:h-[50px] sm:w-[50px]" : "sm:h-[42px] sm:w-[42px]",
              )}>
                <ArrowUpRight className="h-[18px] w-[18px]" aria-hidden />
              </span>
            </button>
          </div>
        </div>
        {/* Compteur du voyage en dessous sur mobile */}
        <div className="mt-2 flex justify-center md:hidden empty:hidden"><PlanCounter overlay={overlay} /></div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-[300] grid overflow-y-auto bg-paper font-sans text-ink [grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))]" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex flex-col gap-7 p-6 sm:p-12">
            <div className="flex items-center justify-between">
              <button onClick={() => setOpen(false)} className="flex items-center gap-3 text-base font-bold text-ink">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white"><X className="h-[22px] w-[22px]" aria-hidden /></span>
                Fermer
              </button>
              <Logo size={30} />
            </div>
            <div className="mt-auto flex flex-col">
              {[...LINKS, user ? { label: "Mon compte", href: "/dashboard", note: user.name } : { label: "Connexion", href: "/auth/login", note: "Ou créer un compte" }].map(l => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="plain-link flex items-baseline justify-between gap-4 border-b border-dashed border-line-2 py-3 transition-colors hover:!text-gold-deep"
                >
                  <span className={clsx("text-[clamp(28px,4vw,48px)] font-bold leading-[1.05] tracking-[-0.04em]", pathname === l.href && "text-gold-deep")}>{l.label}</span>
                  <span className="font-serif text-base italic text-muted">{l.note}</span>
                </Link>
              ))}
            </div>
            <ArrowPillInline onClick={plan} />
          </div>
          <div className="relative m-4 hidden min-h-[300px] overflow-hidden rounded-[28px] bg-[#2A2620] min-[980px]:block">
            <Photo k="balloons" sizes="50vw" className="absolute inset-0" />
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
