"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import Photo from "@/components/ui/Photo";
import { Chip } from "@/components/ui/Pill";
import { ARTICLES, formatDate } from "@/lib/articles";

const TAGS = ["Tous", "Guide", "Conseil", "Inspiration", "Culture"];

export default function BlogPage() {
  const [tag, setTag] = useState("Tous");
  const [featured, ...rest] = ARTICLES;
  const posts = rest.filter(p => tag === "Tous" || p.tag === tag);

  return (
    <div className="bg-paper">
      <PageBanner k="notebook" />
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6 pb-24 pt-12">
        <div className="flex flex-col gap-3">
          <h1 className="m-0 text-[clamp(36px,4.6vw,56px)] leading-[1.05]">Le <em className="accent">journal</em> du voyageur</h1>
          <p className="m-0 text-base text-muted-2">Guides et conseils pratiques. Chaque article se termine par la destination à planifier.</p>
        </div>

        <Link href={`/blog/${featured.slug}`} className="plain-link group grid items-center gap-8 border-b border-line pb-10 [grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr))]">
          <Photo k={featured.photo} alt="" sizes="(max-width: 800px) 100vw, 580px" className="aspect-[16/10] rounded-[22px] border border-line" imgClassName="transition-transform duration-700 group-hover:scale-105" />
          <div className="flex flex-col gap-3.5">
            <span className="text-[13px] text-muted">{featured.tag} · {formatDate(featured.date)} · {featured.minutes} min</span>
            <h2 className="m-0 text-[clamp(28px,3.4vw,40px)] leading-[1.1]">{featured.title}</h2>
            <p className="m-0 text-base leading-relaxed text-muted-2">{featured.excerpt}</p>
            <span className="text-sm font-semibold text-gold-deep">Lire l&apos;article <ArrowRight className="inline h-[1em] w-[1em]" aria-hidden /></span>
          </div>
        </Link>

        <div className="flex flex-wrap gap-2">{TAGS.map(t => <Chip key={t} active={tag === t} onClick={() => setTag(t)}>{t}</Chip>)}</div>

        <div className="grid gap-x-6 gap-y-8 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
          {posts.map(p => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="plain-link group flex flex-col gap-3.5">
              <Photo k={p.photo} alt="" sizes="(max-width: 700px) 100vw, 380px" className="aspect-[3/2] rounded-[20px] border border-line" imgClassName="transition-transform duration-700 group-hover:scale-105" />
              <span className="text-[13px] text-muted">{p.tag} · {formatDate(p.date)}</span>
              <span className="text-lg font-semibold leading-[1.35]">{p.title}</span>
              <span className="text-sm leading-[1.55] text-muted-2">{p.excerpt}</span>
            </Link>
          ))}
          {posts.length === 0 && <p className="text-sm text-muted">Aucun autre article dans cette catégorie pour l&apos;instant.</p>}
        </div>
      </div>
    </div>
  );
}
