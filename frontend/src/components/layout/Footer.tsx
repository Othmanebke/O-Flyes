"use client";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { ArrowUpRight } from "lucide-react";
import Logo from "@/components/ui/Logo";
import Photo from "@/components/ui/Photo";
import type { PhotoKey } from "@/lib/photos";

const CHIPS: [string, PhotoKey, string][] = [
  ["Japon", "NRT", "c1"], ["Maroc", "RAK", "t1"], ["Islande", "KEF", "c2"],
  ["Maldives", "MLE", "l1"], ["Bali", "DPS", "t3"], ["Kenya", "NBO", "m5"],
];

const COLS = [
  { t: "Pages", links: [["Accueil", "/"], ["Destinations", "/explore"], ["Journal", "/blog"], ["Tarifs", "/pricing"], ["Mes voyages", "/dashboard"]] },
  { t: "Planifier", links: [["Copilote IA", "/assistant"], ["Vols", "/explore/flights"], ["Hôtels", "/explore/hotels"], ["Activités", "/explore/activities"]] },
  { t: "Aide", links: [["Questions fréquentes", "/aide"], ["Contact", "/contact"], ["Mentions légales", "/legal"], ["Confidentialité", "/legal#confidentialite"]] },
];

// Brume blanche qui fond le haut du footer dans la page
const MIST = "radial-gradient(ellipse 24% 50% at 15% 40%, #F9F8F6 55%, transparent 72%), radial-gradient(ellipse 22% 45% at 50% 30%, #F9F8F6 55%, transparent 72%), radial-gradient(ellipse 26% 55% at 85% 40%, #F9F8F6 55%, transparent 72%), linear-gradient(to bottom, #F9F8F6 40%, transparent 85%)";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await axios.post("/api/newsletter", { email });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer className="relative overflow-hidden bg-[#0B1422] font-sans text-white">
      <Photo k="clouds" sizes="100vw" className="absolute inset-0 opacity-75" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,14,26,0.15) 0%, rgba(8,14,26,0.35) 40%, rgba(8,14,26,0.82) 70%, rgba(8,14,26,0.94) 100%)" }} />
      <div className="pointer-events-none absolute -left-[10%] -right-[10%] -top-[90px] h-[300px] blur-[30px]" style={{ background: MIST }} />

      <div className="relative flex flex-col items-center gap-[26px] px-6 pb-[120px] pt-[220px] text-center">
        <h2 className="m-0 text-[clamp(38px,5vw,72px)] font-bold leading-[1.02] tracking-[-0.045em] [text-shadow:0_2px_24px_rgba(0,0,0,0.25)]">
          Des idées de voyage<br /><em className="font-serif font-semibold italic tracking-[-0.03em]">livrées</em> chaque mois
        </h2>
        {status === "sent" ? (
          <span className="rounded-full bg-white/20 px-[26px] py-4 text-base font-semibold backdrop-blur-[14px]">Merci, à très vite dans votre boîte mail.</span>
        ) : (
          <form id="newsletter" onSubmit={submit} className="flex w-full max-w-[700px] scroll-mt-40 gap-1.5 rounded-full bg-white p-1.5">
            <label htmlFor="newsletter-email" className="sr-only">Votre adresse email</label>
            <input
              id="newsletter-email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Votre adresse email"
              className="h-[58px] min-w-0 flex-1 border-none bg-transparent px-[22px] text-[17px] text-ink outline-none"
            />
            <button type="submit" disabled={status === "sending"} className="whitespace-nowrap rounded-full bg-[#5A5450] px-[26px] text-base font-bold text-white transition-colors hover:bg-ink disabled:opacity-60">
              {status === "sending" ? "Envoi…" : "S'inscrire"}
            </button>
          </form>
        )}
        <span className="text-sm font-semibold text-white/90">
          {status === "error"
            ? "L'inscription n'a pas pu être enregistrée. Réessayez plus tard."
            : <>Une seule lettre par mois · <Link href="/newsletter" className="plain-link underline underline-offset-2 hover:!text-white">Se désinscrire</Link></>}
        </span>
      </div>

      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-14 px-[clamp(24px,4vw,80px)] pb-14 pt-10">
        <div className="grid gap-12 [grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))]">
          <div className="flex min-w-[min(100%,280px)] flex-col gap-[22px] md:col-span-2">
            <span className="self-start text-white"><Logo size={48} /></span>
            <p className="m-0 max-w-[460px] text-[17px] font-medium leading-normal text-white/85">
              Le copilote qui transforme une envie en itinéraire chiffré. Chaque voyage mérite d&apos;être raconté.
            </p>
            <div className="flex max-w-[420px] flex-wrap gap-2.5">
              {CHIPS.map(([name, k, id]) => (
                <Link key={id} href={`/destination/${id}`} className="plain-link flex items-center gap-2 rounded-full border border-white/30 bg-white/[0.08] py-1 pl-1 pr-3.5 text-[15px] font-semibold !text-white transition-colors hover:bg-white/20">
                  <Photo k={k} sizes="26px" className="h-[26px] w-[26px] rounded-full" />{name}
                </Link>
              ))}
              <Link href="/explore" className="plain-link flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-4 text-[15px] font-semibold !text-ink transition-colors hover:bg-gold-soft">
                <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-ink text-white"><ArrowUpRight className="h-3.5 w-3.5" aria-hidden /></span>
                Toutes les destinations
              </Link>
            </div>
          </div>
          {COLS.map(c => (
            <div key={c.t} className="flex flex-col gap-4">
              <span className="border-b-[1.5px] border-dashed border-white/30 pb-[18px] font-serif text-[30px] font-semibold italic">{c.t}</span>
              {c.links.map(([label, href]) => (
                <Link key={href} href={href} className="plain-link text-[17px] font-medium !text-white/80 hover:!text-white">{label}</Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
