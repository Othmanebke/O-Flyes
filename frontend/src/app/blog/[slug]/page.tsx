import Link from "next/link";
import { notFound } from "next/navigation";
import Photo from "@/components/ui/Photo";
import ArrowPill from "@/components/ui/Pill";
import { ARTICLES, bySlug, formatDate } from "@/lib/articles";
import { byId, eur } from "@/lib/catalog";
import type { PhotoKey } from "@/lib/photos";

export function generateStaticParams() {
  return ARTICLES.map(a => ({ slug: a.slug }));
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const a = bySlug(params.slug);
  if (!a) notFound();
  const d = byId(a.destId);

  return (
    <article className="mx-auto flex max-w-[760px] flex-col gap-7 px-6 pb-24 pt-8">
      <nav aria-label="Fil d'Ariane" className="flex gap-2 text-[13px] text-muted">
        <Link href="/blog" className="plain-link !text-muted hover:!text-ink">Journal</Link><span>/</span><span className="text-muted-2">{a.place}</span>
      </nav>
      <Photo k={a.photo} alt="" priority sizes="760px" className="h-[clamp(220px,40vw,380px)] rounded-[24px]" />
      <div className="flex flex-col gap-3">
        <span className="text-[13px] text-muted">{a.tag} · {formatDate(a.date)} · {a.minutes} min de lecture</span>
        <h1 className="m-0 text-[clamp(32px,4.4vw,48px)] leading-[1.08]">{a.title}</h1>
        <p className="m-0 text-lg leading-relaxed text-muted-2">{a.excerpt}</p>
      </div>
      <div className="flex flex-col gap-5 text-[17px] leading-[1.7]">
        {a.body.map((b, i) => (
          <section key={i} className="flex flex-col gap-2">
            {b.h && <h2 className="m-0 text-2xl">{b.h}</h2>}
            <p className="m-0">{b.p}</p>
          </section>
        ))}
      </div>
      {d && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-5 rounded-[24px] border border-line bg-cream p-5">
          <div className="flex items-center gap-4">
            <Photo k={d.code as PhotoKey} sizes="72px" className="h-[72px] w-[72px] shrink-0 rounded-2xl" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] text-muted">Planifier ce voyage</span>
              <span className="text-lg font-bold tracking-[-0.02em]">{d.name}</span>
              <span className="text-[13px] text-muted-2">{d.duration} · dès {eur(d.budgetMin)} à deux</span>
            </div>
          </div>
          <ArrowPill href={`/destination/${d.id}`}>Voir et chiffrer</ArrowPill>
        </div>
      )}
    </article>
  );
}
