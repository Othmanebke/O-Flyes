import { Check } from "lucide-react";
import type { ReactNode } from "react";
import Photo from "@/components/ui/Photo";
import type { PhotoKey } from "@/lib/photos";

/* Hero photo des pages Vols, Hôtels et Activités. Le formulaire de recherche qui suit
   remonte sur son bas (-mt-[72px]), d'où les 120px de marge basse du contenu. */
export default function SearchHero({
  photo,
  eyebrow,
  title,
  text,
  points,
}: {
  photo: PhotoKey;
  eyebrow: string;
  title: ReactNode;
  text: string;
  points: string[];
}) {
  return (
    <section className="mx-auto mt-3 max-w-[1400px] px-4">
      <div className="relative flex min-h-[clamp(420px,52vh,560px)] flex-col justify-end overflow-hidden rounded-[32px] bg-ink-2">
        <Photo k={photo} priority sizes="(max-width: 1400px) 100vw, 1400px" className="absolute inset-0" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(8,14,26,.82) 0%, rgba(8,14,26,.45) 45%, rgba(8,14,26,.1) 80%)",
          }}
        />
        <div className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-[18px] px-[clamp(24px,4vw,40px)] pb-[120px] pt-[clamp(32px,5vw,56px)] text-white">
          <span className="self-start whitespace-nowrap rounded-full border-[1.5px] border-dashed border-gold bg-gold-soft px-3.5 py-1.5 text-[13px] font-semibold text-ink">
            {eyebrow}
          </span>
          <h1 className="m-0 max-w-[820px] text-balance text-[clamp(44px,6.4vw,92px)] font-extrabold leading-[0.98] tracking-[-0.045em] text-white">
            {title}
          </h1>
          <p className="m-0 max-w-[560px] text-pretty text-[clamp(15px,1.3vw,19px)] font-medium leading-normal text-white/90">
            {text}
          </p>
          <div className="flex flex-wrap gap-2">
            {points.map(p => (
              <span
                key={p}
                className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/30 bg-white/15 py-[7px] pl-2.5 pr-3.5 text-[13px] font-semibold backdrop-blur-[10px]"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gold text-ink">
                  <Check className="h-[11px] w-[11px]" strokeWidth={3} aria-hidden />
                </span>
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
