import Link from "next/link";
import ArrowPill from "@/components/ui/Pill";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[640px] flex-col items-center justify-center gap-5 px-6 py-24 text-center">
      <span className="eyebrow">Erreur 404</span>
      <h1 className="m-0 text-[clamp(36px,5vw,60px)] leading-[1.05]">Cette page a pris <em className="accent">un autre vol</em></h1>
      <p className="m-0 text-base text-muted-2">Le lien est peut-être ancien, ou la page n&apos;existe plus.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <ArrowPill href="/">Retour à l&apos;accueil</ArrowPill>
        <Link href="/explore" className="plain-link rounded-full border border-line-2 px-4 py-2.5 text-[13px] font-semibold hover:border-ink">Voir les destinations</Link>
      </div>
    </div>
  );
}
