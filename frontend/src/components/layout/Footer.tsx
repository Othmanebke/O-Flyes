"use client";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import Logo from "@/components/ui/Logo";
import Photo from "@/components/ui/Photo";
import Turnstile, { captchaOn } from "@/components/ui/Turnstile";
import type { PhotoKey } from "@/lib/photos";

const CHIPS: [string, PhotoKey, string][] = [
  ["Japon", "NRT", "c1"],
  ["Maroc", "RAK", "t1"],
  ["Islande", "KEF", "c2"],
  ["Maldives", "MLE", "l1"],
  ["Bali", "DPS", "t3"],
  ["Kenya", "NBO", "m5"],
];

const COLS = [
  {
    t: "Pages",
    links: [
      ["Accueil", "/"],
      ["Destinations", "/explore"],
      ["Journal", "/blog"],
      ["Mes voyages", "/dashboard"],
    ],
  },
  {
    t: "Planifier",
    links: [
      ["Copilote IA", "/assistant"],
      ["Vols", "/explore/flights"],
      ["Hôtels", "/explore/hotels"],
      ["Activités", "/explore/activities"],
    ],
  },
  {
    t: "Aide",
    links: [
      ["Questions fréquentes", "/aide"],
      ["Contact", "/contact"],
      ["Mentions légales", "/legal"],
      ["Confidentialité", "/legal#confidentialite"],
      ["Crédits photo", "/credits"],
    ],
  },
];

// Brume blanche qui fond le haut du footer dans la page
const MIST =
  "radial-gradient(ellipse 24% 50% at 15% 40%, #F9F8F6 55%, transparent 72%), radial-gradient(ellipse 22% 45% at 50% 30%, #F9F8F6 55%, transparent 72%), radial-gradient(ellipse 26% 55% at 85% 40%, #F9F8F6 55%, transparent 72%), linear-gradient(to bottom, #F9F8F6 40%, transparent 85%)";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "captcha" | "limit">("idle");
  // Captcha anti-robot : chargé seulement quand le visiteur commence à saisir son email
  const [wantsCaptcha, setWantsCaptcha] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaOn() && !captcha) {
      setWantsCaptcha(true);
      setStatus("captcha");
      return;
    }
    setStatus("sending");
    try {
      await axios.post("/api/newsletter", { email, captchaToken: captcha });
      setStatus("sent");
    } catch (err) {
      setStatus(axios.isAxiosError(err) && err.response?.status === 429 ? "limit" : "error");
      setCaptchaReset(n => n + 1);
    }
  };

  return (
    <footer className="relative overflow-hidden font-sans text-white">
      {/* Fond sombre + photo dans un calque qui commence 2 px sous le haut du footer :
          si la jonction tombe sur un demi-pixel, aucune couleur sombre n'apparaît en trait. */}
      <div className="absolute inset-x-0 bottom-0 top-[2px] bg-[#0B1422]">
        <Photo
          k="clouds"
          sizes="(max-width: 640px) 400vw, (max-width: 1024px) 200vw, 110vw"
          className="absolute inset-0 opacity-75"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(8,14,26,0.15) 0%, rgba(8,14,26,0.35) 40%, rgba(8,14,26,0.82) 70%, rgba(8,14,26,0.94) 100%)",
          }}
        />
      </div>
      {/* Fondu continu depuis la couleur de la page : pas de trait à la jonction */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[300px]"
        style={{
          background:
            "linear-gradient(to bottom, #F9F8F6 0%, #F9F8F6 18%, rgba(249,248,246,0.75) 50%, rgba(249,248,246,0) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute -left-[160px] -right-[160px] -top-[90px] h-[300px] blur-[30px]"
        style={{ background: MIST }}
      />

      <div className="relative flex flex-col items-center gap-[26px] px-6 pb-[120px] pt-[220px] text-center">
        <h2 className="m-0 text-[clamp(38px,5vw,72px)] font-bold leading-[1.02] tracking-[-0.045em] [text-shadow:0_2px_24px_rgba(0,0,0,0.25)]">
          Des idées de voyage
          <br />
          <em className="font-serif font-semibold italic tracking-[-0.03em]">livrées</em> chaque mois
        </h2>
        {status === "sent" ? (
          <span className="rounded-full bg-white/20 px-[26px] py-4 text-base font-semibold backdrop-blur-[14px]">
            Merci, à très vite dans votre boîte mail.
          </span>
        ) : (
          <form
            id="newsletter"
            onSubmit={submit}
            className="flex w-full max-w-[700px] scroll-mt-40 gap-1.5 rounded-full bg-white p-1.5"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Votre adresse email
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setWantsCaptcha(true)}
              placeholder="Votre adresse email"
              className="h-[52px] min-w-0 flex-1 border-none bg-transparent px-4 text-[16px] text-ink outline-none sm:h-[58px] sm:px-[22px] sm:text-[17px]"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="whitespace-nowrap rounded-full bg-ink px-[18px] text-[15px] font-bold text-white transition-colors hover:bg-gold hover:text-ink disabled:opacity-60 sm:px-[26px] sm:text-base"
            >
              {status === "sending" ? "Envoi…" : "S'inscrire"}
            </button>
          </form>
        )}
        {wantsCaptcha && status !== "sent" && <Turnstile onToken={setCaptcha} theme="dark" resetKey={captchaReset} />}
        <span className="text-sm font-semibold text-white/90">
          {status === "error" ? (
            "L'inscription n'a pas pu être enregistrée. Réessayez plus tard."
          ) : status === "captcha" ? (
            "Cochez la vérification anti-robot ci-dessus, puis validez."
          ) : status === "limit" ? (
            "Trop de tentatives depuis votre connexion. Réessayez dans une heure."
          ) : (
            <>
              Une seule lettre par mois ·{" "}
              <Link href="/newsletter" className="plain-link underline underline-offset-2 hover:!text-white">
                Se désinscrire
              </Link>
            </>
          )}
        </span>
      </div>

      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-14 px-[clamp(24px,4vw,80px)] pb-14 pt-10">
        {/* Une seule ligne sur grand écran : logo, Pages, Planifier, Aide */}
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
          <div className="flex min-w-0 flex-col gap-[18px] sm:col-span-2 lg:col-span-1">
            <span className="self-start text-white">
              <Logo size={42} />
            </span>
            <p className="m-0 max-w-[420px] text-[15px] font-medium leading-normal text-white/85">
              Le copilote qui transforme une envie en itinéraire chiffré. Chaque voyage mérite d&apos;être raconté.
            </p>
            <div className="flex max-w-[420px] flex-wrap gap-2">
              {CHIPS.map(([name, k, id]) => (
                <Link
                  key={id}
                  href={`/destination/${id}`}
                  className="plain-link flex items-center gap-2 rounded-full border border-white/30 bg-white/[0.08] py-1 pl-1 pr-3.5 text-[13px] font-semibold !text-white transition-colors hover:bg-white/20"
                >
                  <Photo k={k} sizes="26px" className="h-[26px] w-[26px] rounded-full" />
                  {name}
                </Link>
              ))}
              <Link
                href="/explore"
                className="plain-link flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-4 text-[13px] font-semibold !text-ink transition-colors hover:bg-gold-soft"
              >
                <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-ink text-white">
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </span>
                Toutes les destinations
              </Link>
            </div>
          </div>
          {COLS.map(c => (
            <div key={c.t} className="flex flex-col gap-3">
              <span className="border-b-[1.5px] border-dashed border-white/30 pb-3 font-serif text-[24px] font-semibold italic">
                {c.t}
              </span>
              {c.links.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="plain-link text-[15px] font-medium !text-white/80 hover:!text-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Bandeau du bas */}
        <div className="flex flex-col gap-4 border-t border-white/15 pt-6 text-[13px] text-white/60 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} AIVANA · Projet étudiant, YNOV Campus</span>
          <span>Données : Open-Meteo, Wikipédia, OpenStreetMap, France Diplomatie</span>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-1.5 self-start font-semibold text-white/80 hover:text-white md:self-auto"
          >
            Retour en haut <ArrowUp className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </footer>
  );
}
