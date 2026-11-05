"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Globe, MapPin, MessageSquare, Plane, Search } from "lucide-react";
import Photo from "@/components/ui/Photo";
import Logo from "@/components/ui/Logo";
import ArrowPill from "@/components/ui/Pill";
import { useMotionLoop, useReveal } from "@/components/ui/motion";
import { ask } from "@/lib/chat";
import { DESTINATIONS, MONTHS_LONG, byId, currentMonthShort, eur } from "@/lib/catalog";
import type { PhotoKey } from "@/lib/photos";
import { FAQ } from "@/lib/faq";

const STYLES: { label: string; k: PhotoKey; d: string }[] = [
  { label: "Nature", k: "lake", d: "Lacs, fjords et sentiers : des voyages au grand air." },
  { label: "Aventure", k: "hike", d: "Randonnées, safaris et sports extrêmes pour les curieux." },
  { label: "Plage", k: "MLE", d: "Eaux turquoise, villas et couchers de soleil." },
  { label: "Culture", k: "NRT", d: "Temples, musées et vieux quartiers à pied." },
  { label: "Gastronomie", k: "food", d: "Marchés, tables locales et dégustations." },
];

const STEPS: { t: string; d: string; k: PhotoKey; th: PhotoKey }[] = [
  {
    t: "Vous décrivez",
    d: "Une phrase suffit : budget, dates, voyageurs, envies. Le copilote pose les questions qui manquent.",
    k: "notebook",
    th: "notes",
  },
  {
    t: "On compare",
    d: "Vols, hôtels et activités chiffrés pour vos dates. Vous voyez le coût total, pas un prix d'appel.",
    k: "laptop",
    th: "plane",
  },
  {
    t: "Vous choisissez",
    d: "Ajoutez au carnet ce qui vous plaît. Le budget se met à jour à chaque ajout.",
    k: "map",
    th: "hotel1",
  },
  {
    t: "Vous partez",
    d: "Vols, hôtels et activités rangés dans votre carnet, exportables dans votre agenda.",
    k: "gate",
    th: "tarmac",
  },
];

const BAND: [string, PhotoKey][] = [
  ["Kyoto", "NRT"],
  ["Islande", "KEF"],
  ["Marrakech", "RAK"],
  ["Bali", "DPS"],
  ["Lisbonne", "LIS"],
  ["Maldives", "MLE"],
  ["Istanbul", "IST"],
  ["Sydney", "SYD"],
];
const GALLERY: PhotoKey[] = ["friends", "hike", "balloons", "backpack", "KEF", "paddle", "road"];
const GW = [300, 340, 400, 320, 380, 300, 360];
const GH = [400, 440, 480, 420, 500, 400, 460];

const STICKERS = [
  {
    t: "Coût total estimé",
    Icon: MapPin,
    bg: "#F1E3C2",
    x: "3%",
    y: "20px",
    size: 290,
    f: 1,
    radius: 0,
    clip: "polygon(100.0% 50.0%,99.1% 53.2%,96.6% 56.1%,93.2% 58.6%,89.6% 60.6%,86.7% 62.5%,85.1% 64.5%,84.8% 67.2%,85.5% 70.5%,86.6% 74.4%,87.3% 78.6%,87.0% 82.4%,85.4% 85.4%,82.4% 87.0%,78.6% 87.3%,74.4% 86.6%,70.5% 85.5%,67.2% 84.8%,64.5% 85.1%,62.5% 86.7%,60.6% 89.6%,58.6% 93.2%,56.1% 96.6%,53.2% 99.1%,50.0% 100.0%,46.8% 99.1%,43.9% 96.6%,41.4% 93.2%,39.4% 89.6%,37.5% 86.7%,35.5% 85.1%,32.8% 84.8%,29.5% 85.5%,25.6% 86.6%,21.4% 87.3%,17.6% 87.0%,14.6% 85.4%,13.0% 82.4%,12.7% 78.6%,13.4% 74.4%,14.5% 70.5%,15.2% 67.2%,14.9% 64.5%,13.3% 62.5%,10.4% 60.6%,6.8% 58.6%,3.4% 56.1%,0.9% 53.2%,0.0% 50.0%,0.9% 46.8%,3.4% 43.9%,6.8% 41.4%,10.4% 39.4%,13.3% 37.5%,14.9% 35.5%,15.2% 32.8%,14.5% 29.5%,13.4% 25.6%,12.7% 21.4%,13.0% 17.6%,14.6% 14.6%,17.6% 13.0%,21.4% 12.7%,25.6% 13.4%,29.5% 14.5%,32.8% 15.2%,35.5% 14.9%,37.5% 13.3%,39.4% 10.4%,41.4% 6.8%,43.9% 3.4%,46.8% 0.9%,50.0% 0.0%,53.2% 0.9%,56.1% 3.4%,58.6% 6.8%,60.6% 10.4%,62.5% 13.3%,64.5% 14.9%,67.2% 15.2%,70.5% 14.5%,74.4% 13.4%,78.6% 12.7%,82.4% 13.0%,85.4% 14.6%,87.0% 17.6%,87.3% 21.4%,86.6% 25.6%,85.5% 29.5%,84.8% 32.8%,85.1% 35.5%,86.7% 37.5%,89.6% 39.4%,93.2% 41.4%,96.6% 43.9%,99.1% 46.8%)",
  },
  {
    t: "Copilote IA 24 h/24",
    Icon: MessageSquare,
    bg: "#F1E3C2",
    x: "min(81%, calc(100% - 310px))",
    y: "-40px",
    size: 300,
    f: 2,
    radius: 0,
    clip: "polygon(50.0% 0.0%,60.4% 11.4%,75.0% 6.7%,78.3% 21.7%,93.3% 25.0%,88.6% 39.6%,100.0% 50.0%,88.6% 60.4%,93.3% 75.0%,78.3% 78.3%,75.0% 93.3%,60.4% 88.6%,50.0% 100.0%,39.6% 88.6%,25.0% 93.3%,21.7% 78.3%,6.7% 75.0%,11.4% 60.4%,0.0% 50.0%,11.4% 39.6%,6.7% 25.0%,21.7% 21.7%,25.0% 6.7%,39.6% 11.4%)",
  },
  {
    t: "Itinéraires sur mesure",
    Icon: Plane,
    bg: "#E6DCCB",
    x: "12%",
    y: "400px",
    size: 300,
    f: 3,
    radius: 60,
    clip: "polygon(30% 0%,70% 0%,70% 30%,100% 30%,100% 70%,70% 70%,70% 100%,30% 100%,30% 70%,0% 70%,0% 30%,30% 30%)",
  },
  {
    t: `${DESTINATIONS.length} destinations`,
    Icon: Globe,
    bg: "#DCE6EF",
    x: "min(70%, calc(100% - 320px))",
    y: "440px",
    size: 290,
    f: 4,
    radius: 70,
    clip: "none",
    rotate: 45,
  },
];

const STATS = [
  { v: "5", k: "Continents", d: "De l'Europe à l'Océanie, avec un vol depuis Paris.", bg: "#F1E3C2", rot: -4 },
  { v: "12", k: "Mois couverts", d: "Une destination idéale pour chaque saison.", bg: "#E6DCCB", rot: -3 },
  { v: "650 €", k: "Budget minimum", d: "Pour deux, vols et hébergement compris.", bg: "#DCE6EF", rot: 3 },
];

const AVATARS: { k: PhotoKey; x: string; y: string; s: number; f: number }[] = [
  { k: "backpack", x: "8%", y: "170px", s: 64, f: 1 },
  { k: "balloons", x: "84%", y: "40px", s: 60, f: 2 },
  { k: "paddle", x: "88%", y: "190px", s: 64, f: 3 },
  { k: "friends", x: "4%", y: "36px", s: 54, f: 4 },
];

const STORIES = [
  {
    slug: "bali-meilleure-periode",
    t: "Dix jours entre rizières et temples à Bali",
    tag: "Itinéraire",
    place: "Indonésie",
    meta: "6 min de lecture",
    k: "DPS" as PhotoKey,
    wide: true,
  },
  {
    slug: "voyager-comme-un-local-maroc",
    t: "Perdu dans la médina de Marrakech",
    tag: "Carnet",
    place: "Maroc",
    meta: "5 min de lecture",
    k: "RAK" as PhotoKey,
    wide: false,
  },
];

function Stamp({
  k,
  className,
  rot,
  w,
  h,
  f,
}: {
  k: PhotoKey;
  className: string;
  rot: number;
  w: number;
  h: number;
  f: number;
}) {
  return (
    <div
      data-float={f}
      aria-hidden
      className={`absolute hidden bg-white p-1.5 shadow-float outline-dashed outline-2 outline-offset-[-3px] outline-line min-[900px]:block ${className}`}
      style={{ width: w, height: h, transform: `rotate(${rot}deg)` }}
    >
      <Photo tall k={k} sizes="120px" className="h-full w-full" />
    </div>
  );
}

export default function HomePage() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  useMotionLoop(root);

  const [q, setQ] = useState("");
  const [style, setStyle] = useState(1);
  const [styleAuto, setStyleAuto] = useState(true);
  const [season, setSeason] = useState(0);
  const [step, setStep] = useState(0);
  const [stepAuto, setStepAuto] = useState(true);
  const [month, setMonth] = useState<number | null>(null);

  useEffect(() => setMonth(new Date().getMonth()), []);
  useEffect(() => {
    if (!styleAuto) return;
    const t = setInterval(() => setStyle(s => (s + 1) % STYLES.length), 4000);
    return () => clearInterval(t);
  }, [styleAuto]);
  useEffect(() => {
    if (!stepAuto) return;
    const t = setInterval(() => setStep(s => (s + 1) % STEPS.length), 5000);
    return () => clearInterval(t);
  }, [stepAuto]);

  const pickStyle = (i: number) => {
    setStyleAuto(false);
    setStyle(i);
  };
  const pickStep = (i: number) => {
    setStepAuto(false);
    setStep(i);
  };

  // Les 10 destinations les mieux notées pour ce mois (la liste complète est dans Destinations)
  const seasonal =
    month == null
      ? []
      : DESTINATIONS.filter(d => d.months.includes(currentMonthShort(new Date(2000, month, 1))))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 10);
  const sd = seasonal.length ? seasonal[season % seasonal.length] : null;
  const cur = STYLES[style];
  const trips = ["c1", "t1", "l1"].map(id => byId(id)!);

  return (
    <div ref={root} className="overflow-x-hidden bg-paper">
      {/* 01 — Hero */}
      <section className="relative flex min-h-[max(740px,100vh)] flex-col overflow-hidden bg-[#1E2420]">
        <div data-parallax="0.2" className="absolute inset-x-0 top-0 h-[115%]">
          <Photo k="hero" alt="Montagnes au lever du soleil" priority sizes="100vw" className="h-full w-full" />
        </div>
        <div className="absolute inset-0 bg-[rgba(10,16,26,0.28)]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,14,20,0.5) 0%, rgba(10,14,20,0.18) 40%, rgba(10,14,20,0.05) 70%)",
          }}
        />
        <div className="relative z-[2] flex flex-1 flex-col items-center gap-6 px-6 pb-[260px] pt-[calc(clamp(40px,9vh,110px)+116px)] text-center">
          <span data-reveal className="text-white">
            <Logo size={64} />
          </span>
          <h1
            data-reveal
            className="m-0 max-w-[1000px] text-balance text-[clamp(52px,7.4vw,112px)] font-bold leading-[0.98] tracking-[-0.045em] text-white"
          >
            Voyagez <span className="whitespace-nowrap">au-delà</span>
            <br />
            de <em className="accent">l&apos;ordinaire</em>
          </h1>
          <p
            data-reveal
            className="m-0 max-w-[620px] text-pretty text-[clamp(16px,1.4vw,21px)] font-medium leading-[1.45] text-white/85"
          >
            Décrivez votre budget, vos dates et vos envies. Le copilote propose des destinations avec un coût total
            estimé, puis vous composez votre voyage étape par étape.
          </p>
          <form
            data-reveal
            onSubmit={e => {
              e.preventDefault();
              ask(q || "Soleil en avril, 1 500 € à deux");
              setQ("");
            }}
            className="flex w-full max-w-[700px] items-center gap-2 rounded-full bg-white py-1.5 pl-7 pr-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
          >
            <label htmlFor="hero-q" className="sr-only">
              Décrivez votre voyage
            </label>
            <input
              id="hero-q"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Ex. : 10 jours au soleil en avril, 1 500 € à deux"
              className="h-14 min-w-0 flex-1 border-none bg-transparent text-[17px] text-ink outline-none"
            />
            <button
              type="submit"
              aria-label="Demander au copilote"
              className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-ink text-white hover:bg-ink-2"
            >
              <Search className="h-[22px] w-[22px]" aria-hidden />
            </button>
          </form>
        </div>
        {/* Fondu continu vers la couleur de la page : la jonction avec la section suivante
            est exactement de la même couleur, donc aucun trait visible. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[280px]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(249,248,246,0) 0%, rgba(249,248,246,0.75) 50%, #F9F8F6 82%, #F9F8F6 100%)",
          }}
        />
        {/* Brume par-dessus (formes de nuages). Elle ne bouge pas (une animation la soulevait
            et laissait voir un trait sombre en bas), et déborde largement sur les côtés. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-[70px] -left-[160px] -right-[160px] z-[3] h-[300px] blur-[26px]"
          style={{
            background:
              "radial-gradient(ellipse 22% 55% at 12% 62%, #F9F8F6 55%, transparent 72%), radial-gradient(ellipse 20% 50% at 38% 82%, #F9F8F6 55%, transparent 72%), radial-gradient(ellipse 24% 55% at 66% 70%, #F9F8F6 55%, transparent 72%), radial-gradient(ellipse 22% 60% at 90% 58%, #F9F8F6 55%, transparent 72%), linear-gradient(to top, #F9F8F6 38%, transparent 80%)",
          }}
        />
      </section>

      {/* 02 — Par envie */}
      <section className="relative z-[3] -mt-[120px] flex flex-col items-center gap-3.5 px-6 pb-[110px] pt-10 text-center">
        <Stamp k="IST" f={1} rot={-10} w={96} h={118} className="left-[max(3%,calc(50%-620px))] top-10" />
        <Stamp k="ATH" f={2} rot={9} w={84} h={104} className="right-[max(3%,calc(50%-620px))] top-2.5" />
        <span className="eyebrow">Par envie</span>
        <h2 data-reveal className="m-0 max-w-[640px] text-balance text-[clamp(34px,4.6vw,60px)] leading-[1.02]">
          Des <em className="accent">aventures</em> qui vous ressemblent
        </h2>
        <div className="mt-9 flex min-h-[300px] w-full items-center justify-center gap-[clamp(10px,3vw,40px)]">
          {[-1, 0, 1].map(o => {
            const i = (style + o + STYLES.length) % STYLES.length;
            const s = STYLES[i];
            const center = o === 0;
            return (
              <button key={o} onClick={() => pickStyle(i)} className="flex flex-col items-center gap-3.5 text-ink">
                <span
                  className={`block overflow-hidden rounded-full transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${center ? "h-[170px] w-[170px] shadow-[0_24px_50px_rgba(15,27,45,0.22)] sm:h-[240px] sm:w-[240px]" : "h-[84px] w-[84px] sm:h-[150px] sm:w-[150px]"}`}
                >
                  <Photo tall k={s.k} alt={s.label} sizes="240px" className="h-full w-full" />
                </span>
                <span className={center ? "text-base font-semibold" : "text-[13px] font-semibold"}>{s.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 min-h-6 max-w-[420px] text-[15px] text-muted">{cur.d}</p>
        <div className="mt-1 flex gap-1.5">
          {STYLES.map((s, i) => (
            <button
              key={s.label}
              onClick={() => pickStyle(i)}
              aria-label={s.label}
              className={`h-2 rounded-full transition-all ${i === style ? "w-6 bg-ink" : "w-2 bg-line-2"}`}
            />
          ))}
        </div>
        <ArrowPill href={`/explore?style=${encodeURIComponent(cur.label)}`} className="mt-3.5">
          Voir les destinations
        </ArrowPill>
      </section>

      {/* 03 — Notre promesse */}
      <section className="relative mx-auto max-w-[1400px] px-6 pb-20 pt-[60px] min-[1100px]:min-h-[760px]">
        <Stamp k="LIS" f={2} rot={-6} w={92} h={112} className="left-[40%] top-[640px] !hidden min-[1100px]:!block" />
        <Stamp k="DPS" f={4} rot={8} w={86} h={106} className="right-[38%] top-[20px] !hidden min-[1100px]:!block" />
        <div className="relative z-[2] flex flex-col items-center gap-[22px] py-5 text-center min-[1100px]:pt-[120px]">
          <span data-reveal className="eyebrow">
            Notre promesse
          </span>
          <p
            data-reveal
            className="m-0 max-w-[960px] text-balance text-[clamp(32px,4.4vw,64px)] font-bold leading-[1.08] tracking-[-0.045em]"
          >
            On ne vend pas des séjours, on construit des <em className="accent">voyages</em> qui tiennent dans{" "}
            <em className="accent">votre budget</em>
          </p>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3 min-[1100px]:pointer-events-none min-[1100px]:absolute min-[1100px]:inset-0 min-[1100px]:mt-0 min-[1100px]:block">
          {STICKERS.map(s => (
            <div
              key={s.t}
              data-float={s.f}
              className="relative h-[200px] w-[200px] min-[1100px]:absolute min-[1100px]:h-[var(--s)] min-[1100px]:w-[var(--s)] min-[1100px]:[left:var(--x)] min-[1100px]:[top:var(--y)]"
              style={{ ["--s" as string]: `${s.size}px`, ["--x" as string]: s.x, ["--y" as string]: s.y }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: s.bg,
                  clipPath: s.clip,
                  borderRadius: s.radius,
                  transform: `rotate(${s.rotate || 0}deg)`,
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-[18%] text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink">
                  <s.Icon className="h-[26px] w-[26px]" strokeWidth={1.8} aria-hidden />
                </span>
                <span className="text-[clamp(15px,1.4vw,20px)] font-semibold leading-[1.2] tracking-[-0.02em]">
                  {s.t}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 04 — Sélection + CTA */}
      <section className="px-6 pb-20">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="flex flex-col items-start gap-3">
              <span className="eyebrow">Sélection</span>
              <h2 data-reveal className="m-0 max-w-[460px] text-[clamp(30px,3.6vw,46px)] leading-[1.04]">
                Des voyages <em className="accent">pensés</em> pour chaque voyageur
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <p className="m-0 max-w-[280px] text-[13px] text-muted">
                Prix estimés pour deux, vols depuis Paris et hébergement compris.
              </p>
              <ArrowPill href="/explore">Tout voir</ArrowPill>
            </div>
          </div>
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))]">
            {trips.map(d => (
              <Link
                key={d.id}
                data-reveal
                href={`/destination/${d.id}`}
                className="plain-link group flex flex-col gap-3.5"
              >
                <div className="relative aspect-[5/4] overflow-hidden rounded-[22px]">
                  <Photo
                    tall
                    k={d.code as PhotoKey}
                    alt={d.name}
                    sizes="(max-width: 700px) 100vw, 400px"
                    className="h-full w-full"
                    imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white px-[11px] py-[5px] text-[11px] font-bold">
                    {d.country}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 px-1">
                  <span className="text-lg font-bold tracking-[-0.02em]">{d.name}</span>
                  <span className="text-[13px] leading-normal text-muted">{d.desc}</span>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="flex items-baseline gap-1.5">
                      <span className="whitespace-nowrap text-lg font-extrabold">dès {eur(d.budgetMin)}</span>
                      <span className="text-xs text-muted">à deux</span>
                    </span>
                    <span className="whitespace-nowrap rounded-full bg-ink px-[11px] py-[5px] text-[11px] font-bold text-white">
                      {d.duration}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div
            data-reveal
            className="relative mt-[60px] flex flex-wrap items-center justify-center gap-[clamp(20px,3vw,40px)] self-center rounded-[32px] bg-sky py-[clamp(24px,3vw,40px)] pl-[clamp(24px,3vw,44px)] pr-[clamp(28px,4vw,64px)]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-3 rounded-[22px] border-[1.5px] border-dashed border-white/90"
            />
            <div aria-hidden className="relative h-[150px] w-[200px] shrink-0">
              <Photo
                tall
                k="RAK"
                sizes="100px"
                className="absolute left-0 top-2.5 h-[130px] w-[100px] -rotate-[8deg] rounded-2xl opacity-85 blur-[3px]"
              />
              <Photo
                tall
                k="lake"
                sizes="100px"
                className="absolute right-0 top-2.5 h-[130px] w-[100px] rotate-[8deg] rounded-2xl opacity-85 blur-[3px]"
              />
              <Photo
                tall
                k="pyr"
                sizes="100px"
                className="absolute left-[50px] top-0 h-[150px] w-[100px] rounded-2xl shadow-[0_12px_24px_rgba(15,27,45,0.2)]"
              />
            </div>
            <div className="relative flex flex-col items-start gap-[18px]">
              <span className="text-[clamp(24px,2.4vw,36px)] font-bold leading-[1.1] tracking-[-0.035em]">
                Prêt à planifier votre
                <br />
                <em className="accent">voyage</em> de rêve ?
              </span>
              <ArrowPill
                tone="white"
                circle={46}
                onClick={() => ask("")}
                className="gap-5 !py-1.5 !pl-[26px] !pr-1.5 !text-base !font-bold"
              >
                Écrire au copilote
              </ArrowPill>
            </div>
            <Plane
              data-float="2"
              aria-hidden
              className="absolute -right-10 top-1.5 hidden h-16 w-16 text-white min-[700px]:block"
              style={{ transform: "rotate(-18deg)", filter: "drop-shadow(0 6px 14px rgba(40,80,120,0.25))" }}
            />
          </div>
        </div>
      </section>

      {/* 05 — Bandeau timbre */}
      <div
        aria-hidden
        className="relative h-[clamp(260px,26vw,400px)] overflow-hidden"
        style={{ background: "linear-gradient(to bottom, #F9F8F6 50%, #E9E1D3 50%)" }}
      >
        <div
          className="absolute -left-[10%] -right-[10%] top-1/2 bg-ink py-[clamp(28px,3vw,48px)]"
          style={{
            transform: "translateY(-50%) rotate(-4deg)",
            WebkitMask:
              "radial-gradient(circle 10px at 50% 0, transparent 97%, #000) 0 0/28px 51% repeat-x, radial-gradient(circle 10px at 50% 100%, transparent 97%, #000) 0 100%/28px 51% repeat-x",
            mask: "radial-gradient(circle 10px at 50% 0, transparent 97%, #000) 0 0/28px 51% repeat-x, radial-gradient(circle 10px at 50% 100%, transparent 97%, #000) 0 100%/28px 51% repeat-x",
          }}
        >
          <div data-marquee="0.9" className="flex w-max items-center gap-11 whitespace-nowrap">
            {[...BAND, ...BAND].map(([name, k], i) => (
              <span
                key={i}
                className="flex items-center gap-11 text-[clamp(56px,8vw,140px)] font-extrabold leading-none tracking-[-0.05em] text-white"
              >
                {name}
                <Photo
                  tall
                  k={k}
                  sizes="120px"
                  className="h-[clamp(64px,7vw,120px)] w-[clamp(64px,7vw,120px)] -rotate-[8deg] rounded-full border-4 border-white"
                />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 06 — Saison */}
      <section
        className="relative overflow-hidden px-6 pb-[140px] pt-[60px]"
        style={{ background: "linear-gradient(to bottom, #E9E1D3 0%, #E9E1D3 72%, #F9F8F6 100%)" }}
      >
        <Stamp
          k="KEF"
          f={3}
          rot={12}
          w={110}
          h={84}
          className="right-[max(3%,calc(50%-600px))] top-[170px] !outline-[#D9CDB8]"
        />
        <Stamp
          k="RAK"
          f={1}
          rot={-14}
          w={84}
          h={104}
          className="bottom-[120px] left-[max(3%,calc(50%-600px))] !outline-[#D9CDB8]"
        />
        <div className="relative mx-auto flex max-w-[900px] flex-col items-center gap-9">
          <div className="flex flex-col items-center gap-3.5 text-center">
            <span className="eyebrow bg-white/60">Idéal en {month == null ? "ce moment" : MONTHS_LONG[month]}</span>
            <h2 data-reveal className="m-0 text-[clamp(34px,4.6vw,60px)] leading-[1.02]">
              Les destinations <em className="accent">de la saison</em>
            </h2>
          </div>
          {sd && (
            <>
              <div className="flex w-full items-center gap-3.5">
                <button
                  onClick={() => setSeason(s => (s - 1 + seasonal.length) % seasonal.length)}
                  aria-label="Destination précédente"
                  className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/20 bg-white/50 hover:bg-white sm:flex"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                </button>
                <div className="grid min-w-0 flex-1 gap-[18px] rounded-[28px] bg-white p-3.5 shadow-card [grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))]">
                  <Photo
                    tall
                    k={sd.code as PhotoKey}
                    alt={sd.name}
                    sizes="(max-width: 700px) 100vw, 430px"
                    className="min-h-[280px] rounded-[20px]"
                  />
                  <div className="flex flex-col justify-center gap-3 p-[clamp(8px,2vw,24px)]">
                    <span className="text-xs font-semibold text-muted">
                      {sd.country} · {sd.continent}
                    </span>
                    <span className="text-[clamp(28px,3vw,40px)] font-extrabold leading-none tracking-[-0.04em]">
                      {sd.name}
                    </span>
                    <p className="m-0 text-sm leading-relaxed text-muted-2">{sd.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-[#F3EEE6] px-[11px] py-[5px] text-xs font-semibold">
                        {sd.duration}
                      </span>
                      <span className="whitespace-nowrap rounded-full bg-[#F3EEE6] px-[11px] py-[5px] text-xs font-semibold">
                        Dès {eur(sd.budgetMin)} à deux
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      <ArrowPill href={`/destination/${sd.id}`}>Découvrir</ArrowPill>
                      <button
                        onClick={() => ask(`Itinéraire ${sd.name}, ${sd.duration}, à deux`)}
                        className="rounded-full border border-line-2 px-4 py-[9px] text-[13px] font-semibold hover:border-ink"
                      >
                        Itinéraire IA
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSeason(s => (s + 1) % seasonal.length)}
                  aria-label="Destination suivante"
                  className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white hover:bg-ink-2 sm:flex"
                >
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {seasonal.map((d, i) => {
                  const on = i === season % seasonal.length;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setSeason(i)}
                      aria-label={d.name}
                      className={`overflow-hidden rounded-full border-2 bg-white p-0 transition-all ${on ? "h-[52px] w-[52px] border-ink" : "h-10 w-10 border-white"}`}
                    >
                      <Photo tall k={d.code as PhotoKey} sizes="52px" className="h-full w-full" />
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* 07 — Méthode */}
      <section className="mx-auto grid max-w-[1400px] overflow-hidden rounded-[32px] bg-ink text-white grid-cols-1 min-[880px]:grid-cols-2 max-[1432px]:mx-4">
        <div className="relative min-h-[420px] overflow-hidden bg-ink min-[880px]:min-h-[560px]">
          {STEPS.map((s, i) => (
            <div
              key={s.t}
              className="absolute inset-0 transition-opacity duration-[800ms]"
              style={{ opacity: i === step ? 1 : 0 }}
            >
              <Photo k={s.k} sizes="(min-width: 880px) 50vw, 100vw" className="h-full w-full" />
            </div>
          ))}
          {/* Fondu vers le bloc encre : à droite côte à côte, en bas quand empilé */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-ink/45 to-ink min-[880px]:inset-x-auto min-[880px]:inset-y-0 min-[880px]:right-0 min-[880px]:h-auto min-[880px]:w-[28%] min-[880px]:bg-gradient-to-r"
          />
        </div>
        <div className="flex flex-col items-center justify-center gap-7 p-[clamp(32px,6vw,80px)] text-center">
          <h2 data-reveal className="m-0 text-[clamp(34px,4.2vw,56px)] leading-[1.02]">
            Comment on <em className="accent">planifie</em>
            <br />
            votre voyage
          </h2>
          <div className="flex gap-2.5">
            {STEPS.map((s, i) => (
              <button
                key={s.t}
                onClick={() => pickStep(i)}
                aria-label={`Étape ${i + 1} : ${s.t}`}
                className={`h-11 w-11 rounded-full border text-[13px] font-bold transition-colors ${i === step ? "border-white bg-white text-ink" : "border-white/30 bg-transparent text-white"}`}
              >
                0{i + 1}
              </button>
            ))}
          </div>
          <Photo
            tall
            k={STEPS[step].th}
            sizes="120px"
            className="h-[120px] w-[120px] rounded-full border-4 border-white/15"
          />
          <div className="flex min-h-[130px] max-w-[420px] flex-col gap-2.5">
            <span className="text-2xl font-bold tracking-[-0.03em]">{STEPS[step].t}</span>
            <p className="m-0 text-[15px] leading-[1.65] text-white/70">{STEPS[step].d}</p>
          </div>
          <div className="h-[3px] w-40 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full bg-gold transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </section>

      {/* 08 — Chiffres */}
      <section
        className="relative overflow-hidden px-6 pb-[60px] pt-[150px]"
        style={{ background: "linear-gradient(to bottom, #F9F8F6 0%, #EAEFF4 140px, #EAEFF4 100%)" }}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(#C3CFDB 1.4px, transparent 1.8px)",
            backgroundSize: "11px 11px",
            WebkitMask: "radial-gradient(ellipse 55% 38% at 50% 55%, #000 30%, transparent 75%)",
            mask: "radial-gradient(ellipse 55% 38% at 50% 55%, #000 30%, transparent 75%)",
          }}
        />
        {AVATARS.map(a => (
          <div
            key={a.k}
            data-float={a.f}
            aria-hidden
            className="absolute hidden overflow-hidden rounded-full border-[3px] border-white shadow-float min-[1180px]:block"
            style={{ left: a.x, top: a.y, width: a.s, height: a.s }}
          >
            <Photo tall k={a.k} sizes="64px" className="h-full w-full" />
          </div>
        ))}
        <div className="relative mx-auto flex max-w-[1300px] flex-col items-center gap-20 text-center">
          <div className="relative inline-flex flex-col items-center">
            <span className="text-[clamp(110px,17vw,260px)] font-extrabold leading-[0.85] tracking-[-0.06em]">
              {DESTINATIONS.length}
            </span>
            <span className="-mt-2 rotate-[-3deg] whitespace-nowrap rounded-full bg-white px-[22px] py-2 text-[clamp(16px,1.6vw,24px)] font-semibold shadow-[0_8px_20px_rgba(15,27,45,0.08)] lg:absolute lg:-right-[70px] lg:-top-1.5 lg:mt-0 lg:rotate-[12deg]">
              Destinations choisies
            </span>
          </div>
          <div className="grid w-full gap-x-6 gap-y-12 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] lg:gap-12">
            {STATS.map(s => (
              <div key={s.k} data-reveal className="flex flex-col items-center">
                <span className="whitespace-nowrap font-serif text-[clamp(72px,8vw,120px)] font-medium italic leading-[0.9] tracking-[-0.02em]">
                  {s.v}
                </span>
                <span
                  className="-mt-3.5 rounded-full px-4 py-1.5 text-[15px] font-semibold"
                  style={{ background: s.bg, transform: `rotate(${s.rot}deg)` }}
                >
                  {s.k}
                </span>
                <span className="mb-5 mt-8 w-[min(320px,90%)] border-t-[1.5px] border-dashed border-ink/25" />
                <span className="max-w-[260px] text-base font-medium leading-[1.45] text-muted-2">{s.d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 09 — Galerie en arc */}
      <section
        aria-hidden
        className="relative overflow-hidden pb-6 pt-[30px] sm:pb-[200px]"
        style={{ background: "linear-gradient(to bottom, #EAEFF4 0%, #EAEFF4 55%, #F9F8F6 100%)" }}
      >
        <div data-marquee="0.45" data-arc className="flex w-max items-center gap-[22px] py-10">
          {[...GALLERY, ...GALLERY].map((k, i) => (
            <div
              key={i}
              className="shrink-0 overflow-hidden rounded-[28px] shadow-[0_20px_40px_rgba(15,27,45,0.14)] will-change-transform"
              style={{ width: GW[i % 7], height: GH[i % 7] }}
            >
              <Photo tall k={k} sizes="400px" className="h-full w-full" />
            </div>
          ))}
        </div>
        <div
          data-float="3"
          className="absolute bottom-[70px] right-[max(3%,calc(50%-640px))] hidden w-[260px] flex-col gap-1.5 rounded-xl bg-gold-soft px-4 py-3 text-ink shadow-[0_12px_26px_rgba(15,27,45,0.2)] outline-dashed outline-2 outline-offset-[-7px] outline-ink/30 sm:flex"
          style={{ transform: "rotate(18deg)" }}
        >
          <span className="whitespace-nowrap text-sm font-extrabold">Carte d&apos;embarquement</span>
          <div className="grid items-end gap-x-2.5 gap-y-1 text-[10px] font-bold [grid-template-columns:1fr_1fr_28px]">
            <span>
              De
              <br />
              <span className="text-lg font-extrabold">CDG</span>
              <br />
              Paris
            </span>
            <span>
              Vers
              <br />
              <span className="text-lg font-extrabold">KEF</span>
              <br />
              Reykjavik
            </span>
            <Plane className="h-6 w-6" />
            <span>
              Embarquement
              <br />
              <span className="text-[13px] font-extrabold">10:30</span>
            </span>
            <span>
              Siège
              <br />
              <span className="text-[13px] font-extrabold">18A</span>
            </span>
          </div>
        </div>
      </section>

      {/* 10 — Final */}
      <section className="relative overflow-hidden px-6 pb-[90px] pt-[60px] text-center sm:pb-[140px] sm:pt-[120px]">
        <div aria-hidden className="hidden min-[1440px]:block">
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 1440 800"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M180 230 C 420 220, 560 260, 520 380 S 520 620, 760 610 S 980 360, 1000 470 S 1180 700, 1330 560"
              stroke="#C9C2B6"
              strokeWidth="2"
              strokeDasharray="7 8"
            />
          </svg>
          {/* Avion et repère posés exactement aux extrémités du pointillé : mêmes coordonnées
              que le tracé (viewBox 1440 × 800 étiré sur la section), exprimées en %. */}
          <span
            data-float="1"
            className="absolute flex h-[52px] w-[52px] items-center justify-center rounded-full border border-line bg-white text-ink shadow-[0_8px_20px_rgba(15,27,45,0.08)]"
            style={{
              left: `${(180 / 1440) * 100}%`,
              top: `${(230 / 800) * 100}%`,
              transform: "translate(calc(-100% - 6px), -50%)",
            }}
          >
            <Plane className="h-[22px] w-[22px]" style={{ transform: "rotate(45deg)" }} aria-hidden />
          </span>
          <div
            data-float="3"
            className="absolute bottom-[110px] left-[max(2%,calc(50%-640px))] h-[150px] w-[200px] bg-white p-2.5"
            style={{
              transform: "rotate(-24deg)",
              WebkitMask: "radial-gradient(circle 5px at 5px 5px, transparent 98%, #000) -5px -5px / 14px 14px",
              mask: "radial-gradient(circle 5px at 5px 5px, transparent 98%, #000) -5px -5px / 14px 14px",
              filter: "drop-shadow(0 8px 16px rgba(15,27,45,0.15))",
            }}
          >
            <Photo tall k="EZE" sizes="200px" className="h-full w-full" />
          </div>
          <div
            data-float="2"
            className="absolute right-[max(2%,calc(50%-800px))] top-[170px] aspect-[4/3] w-[clamp(240px,18vw,360px)]"
          >
            <div className="absolute inset-0 rounded-[22px] bg-gold-soft" style={{ transform: "rotate(4deg)" }} />
            <div className="absolute inset-0 rounded-[22px] bg-sky" style={{ transform: "rotate(-2deg)" }} />
            <div
              className="absolute inset-0 rounded-[22px] bg-white p-2.5 shadow-[0_20px_40px_rgba(15,27,45,0.15)]"
              style={{ transform: "rotate(-8deg)" }}
            >
              <Photo tall k="wall" sizes="380px" className="h-full w-full rounded-[14px]" />
            </div>
          </div>
          <span
            className="absolute flex flex-col items-center"
            style={{
              left: `${(1330 / 1440) * 100}%`,
              top: `${(560 / 800) * 100}%`,
              transform: "translate(-50%, calc(-100% + 4px))",
            }}
          >
            <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-ink text-gold shadow-[0_8px_20px_rgba(15,27,45,0.18)]">
              <MapPin className="h-5 w-5" aria-hidden />
            </span>
            <span className="h-2.5 w-0.5 bg-ink" />
            <span className="h-2 w-2 rounded-full bg-ink" />
          </span>
        </div>
        <div className="relative flex flex-col items-center">
          <h2
            data-reveal
            className="m-0 max-w-[1100px] text-[clamp(56px,9vw,160px)] font-extrabold leading-[0.92] tracking-[-0.055em]"
          >
            Le m
            <span className="mx-[0.02em] inline-block h-[0.72em] w-[0.72em] overflow-hidden rounded-full align-[-0.06em]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/globe.png" alt="o" className="h-full w-full scale-[1.12] object-cover" />
            </span>
            nde
            <br />
            entier
            <br />
            vous <em className="font-serif font-semibold italic tracking-[-0.02em]">attend</em>
          </h2>
          <button
            onClick={() => ask("")}
            className="relative -mt-1.5 flex items-center gap-7 rounded-full bg-gold-soft py-2.5 pl-9 pr-2.5 text-[clamp(18px,1.8vw,28px)] font-bold text-ink transition-colors hover:bg-[#E8D3A4]"
            style={{ transform: "rotate(3deg)" }}
          >
            Commencer à planifier
            <span className="flex h-[clamp(48px,4vw,64px)] w-[clamp(48px,4vw,64px)] items-center justify-center rounded-full bg-white">
              <ArrowUpRight className="h-[1em] w-[1em]" aria-hidden />
            </span>
          </button>
        </div>
      </section>

      {/* 11 — Journal */}
      <section className="px-6 pb-[60px]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col items-start gap-3">
              <span className="eyebrow">Journal</span>
              <h2 className="m-0 text-[clamp(30px,3.6vw,46px)] leading-[1.04]">
                Récits <em className="accent">de la route</em>
              </h2>
            </div>
            <ArrowPill href="/blog">Tout le journal</ArrowPill>
          </div>
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))]">
            {STORIES.map(s => (
              <Link
                key={s.slug}
                data-reveal
                href={`/blog/${s.slug}`}
                className={`plain-link group flex flex-col gap-3.5 ${s.wide ? "md:col-span-2" : ""}`}
              >
                <div className="relative h-[clamp(240px,26vw,340px)] overflow-hidden rounded-[22px]">
                  <Photo
                    tall
                    k={s.k}
                    sizes="(max-width: 700px) 100vw, 800px"
                    className="h-full w-full"
                    imgClassName="transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute left-3.5 top-3.5 flex gap-1.5">
                    <span className="rounded-full bg-white px-[11px] py-[5px] text-[11px] font-bold">{s.tag}</span>
                    <span className="rounded-full bg-white/75 px-[11px] py-[5px] text-[11px] font-bold">{s.place}</span>
                  </div>
                </div>
                <span className="px-1 text-[19px] font-bold tracking-[-0.02em]">{s.t}</span>
                <span className="px-1 text-[13px] text-muted">{s.meta}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {/* 12 — Questions fréquentes */}
      <section className="px-6 pb-24 pt-10">
        <div className="mx-auto grid max-w-[1240px] gap-10 [grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr))]">
          <div className="flex flex-col items-start gap-3">
            <span className="eyebrow">Questions fréquentes</span>
            <h2 className="m-0 text-[clamp(30px,3.6vw,46px)] leading-[1.04]">
              Avant de <em className="accent">partir</em>
            </h2>
            <p className="m-0 max-w-[360px] text-[15px] text-muted-2">
              Ce qu&apos;on nous demande le plus souvent sur AIVANA, les prix et les réservations.
            </p>
            <ArrowPill href="/aide" className="mt-2">
              Toutes les questions
            </ArrowPill>
          </div>
          <div className="flex flex-col border-t border-line">
            {FAQ.slice(0, 4).map(f => (
              <details key={f.q} className="group border-b border-line py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-bold tracking-[-0.02em] [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line-2 text-lg transition-transform group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <div className="pt-2.5 text-[15px] leading-relaxed text-muted-2">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
