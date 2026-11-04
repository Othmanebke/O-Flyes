import Link from "next/link";
import PageBanner from "@/components/layout/PageBanner";
import { FAQ } from "@/lib/faq";

export const metadata = { title: "Aide et questions fréquentes" };


export default function AidePage() {
  return (
    <div className="bg-paper">
      <PageBanner k="map" />
      <div className="mx-auto flex max-w-[820px] flex-col gap-8 px-6 pb-24 pt-12">
        <div className="flex flex-col gap-3">
          <h1 className="m-0 text-[clamp(36px,4.6vw,56px)] leading-[1.05]">Questions <em className="accent">fréquentes</em></h1>
          <p className="m-0 text-base text-muted-2">Tout ce qu&apos;il faut savoir avant de préparer votre voyage avec AIVANA.</p>
        </div>
        <div className="flex flex-col border-t border-line">
          {FAQ.map(f => (
            <details key={f.q} className="group border-b border-line py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold tracking-[-0.02em] [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line-2 text-lg transition-transform group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <div className="pt-3 text-[15px] leading-relaxed text-muted-2">{f.a}</div>
            </details>
          ))}
        </div>
        <p className="m-0 text-[15px] text-muted-2">Une autre question ? <Link href="/contact">Écrivez-nous</Link>.</p>
      </div>
    </div>
  );
}
