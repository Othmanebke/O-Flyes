"use client";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ExternalLink, Loader2 } from "lucide-react";
import SearchHero from "@/components/layout/SearchHero";
import TripBar from "@/components/trip/TripBar";
import Photo from "@/components/ui/Photo";
import { Chip } from "@/components/ui/Pill";
import { planInputFrom, useTripContext, type SearchContext } from "@/components/trip/useTripContext";
import { eur, findDestination } from "@/lib/catalog";
import { addItem, removeItem, toast, usePlan } from "@/lib/plan";
import { isPhotoKey, photoFor } from "@/lib/photos";

interface Activity {
  id: string;
  title: string;
  city: string;
  category: string;
  price: number | null; // estimé, 0 = gratuit en général
  duration: string | null;
  description: string;
  booking_url: string;
  image: string | null; // vraie photo du lieu (Wikipédia)
  photo: string | null; // sinon : photo de la ville (code du catalogue)
  source?: string;
}

function ActivitiesContent() {
  const { ctx, setCtx, ready } = useTripContext();
  const plan = usePlan();
  const [items, setItems] = useState<Activity[]>([]);
  const [searched, setSearched] = useState<SearchContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cat, setCat] = useState("Toutes");

  const search = useCallback(async (c: SearchContext) => {
    if (!c.dest.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<Activity[]>("/api/partner/activities/search", { params: { city: c.dest } });
      setItems(res.data || []);
      setSearched(c);
      setCat("Toutes");
    } catch {
      setError("La recherche d'activités n'a pas abouti. Réessayez dans un instant.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (ready) void search(ctx); }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const cats = useMemo(() => ["Toutes", ...Array.from(new Set(items.map(i => i.category)))], [items]);
  const rows = items.filter(i => cat === "Toutes" || i.category === cat);
  const pax = searched?.pax || 2;
  const tripName = plan?.destination || findDestination(searched?.dest)?.name || searched?.dest || ctx.dest;

  const toggle = async (a: Activity) => {
    if (!searched) return;
    const key = `activity:${a.id}`;
    if (plan?.items.some(i => i.key === key)) { await removeItem(key); return; }
    const p = await addItem({
      key, type: "activity",
      title: a.title,
      subtitle: [a.category, a.duration, `${pax} pers.`].filter(Boolean).join(" · "),
      price: a.price != null ? a.price * pax : null, estimated: true,
      provider: a.source === "wikipedia" ? "Wikipédia" : "GetYourGuide", url: a.booking_url,
    }, planInputFrom(searched));
    toast(`Activité ajoutée au voyage ${p.destination}`, { label: "Voir le carnet", href: "/dashboard" });
  };

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-7 px-6 pb-24 pt-0">
      <form onSubmit={e => { e.preventDefault(); void search(ctx); }} className="relative z-10 -mt-[72px] mb-6 flex max-w-[720px] gap-2 rounded-[22px] border border-line-2 bg-cream p-1.5 shadow-[0_24px_60px_rgba(15,27,45,0.18)]">
        <label htmlFor="q" className="sr-only">Ville</label>
        <input id="q" value={ctx.dest} onChange={e => setCtx(c => ({ ...c, dest: e.target.value }))} placeholder="Une ville…" className="h-11 min-w-0 flex-1 border-none bg-transparent px-2.5 text-[15px] text-ink outline-none" />
        <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-full bg-ink px-[18px] text-sm font-semibold text-paper hover:bg-ink-2 disabled:opacity-70">
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Rechercher
        </button>
      </form>

      <TripBar />

      {cats.length > 1 && (
        <div className="flex flex-wrap gap-2">{cats.map(c => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}</div>
      )}

      <div className="flex flex-wrap justify-between gap-3 border-b border-line pb-3.5 text-sm text-muted-2">
        <span>{searched ? `${rows.length} activité${rows.length > 1 ? "s" : ""} à ${searched.dest}` : "Recherche en cours…"}</span>
        <span className="text-muted">« À voir » : lieux réels et leur photo (Wikipédia) · prix estimés selon le pays</span>
      </div>

      {error && <p className="rounded-2xl border border-danger/40 bg-danger/[0.08] px-4 py-3 text-sm text-danger">{error}</p>}

      <div className="grid gap-x-6 gap-y-7 [grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))]">
        {rows.map(a => {
          const added = !!plan?.items.some(i => i.key === `activity:${a.id}`);
          return (
            <div key={a.id} className="flex flex-col gap-3">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] border border-line">
                {a.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.image} alt="" loading="lazy" className="h-full w-full bg-placeholder object-cover" />
                ) : (
                  <Photo k={isPhotoKey(a.photo) ? a.photo : photoFor(`${a.category} ${a.title}`, "activity")} alt="" sizes="(max-width: 700px) 100vw, 380px" className="h-full w-full" />
                )}
                <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(18,16,12,0.72) 0%, rgba(18,16,12,0.2) 45%, rgba(18,16,12,0) 70%)" }} />
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-4 py-3.5">
                  <span className="self-start rounded-full bg-cream/90 px-2.5 py-1 text-xs font-semibold text-ink">{a.category}</span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-balance text-xl font-bold leading-tight tracking-[-0.03em] text-white">{a.title}</span>
                    <span className="text-[13px] text-white/90">{a.city}</span>
                  </span>
                </div>
              </div>
              <p className="m-0 line-clamp-2 text-[13px] leading-normal text-muted-2">{a.description}</p>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-[13px] text-muted">{a.duration || "Lieu réel · Wikipédia"}</span>
                  <span className="tabular whitespace-nowrap text-sm font-semibold">{a.price === 0 ? "Gratuit en général" : a.price != null ? `${eur(a.price)} / pers. · estimé` : "Prix à vérifier sur place"}</span>
                </div>
                <span className="flex items-center gap-3">
                  <a href={a.booking_url} target="_blank" rel="noopener noreferrer" title={a.source === "wikipedia" ? "Voir sur Wikipédia" : "Voir chez le partenaire"} aria-label={a.source === "wikipedia" ? `Voir ${a.title} sur Wikipédia` : `Voir ${a.title} chez le partenaire`} className="text-muted hover:text-ink"><ExternalLink className="h-4 w-4" aria-hidden /></a>
                  <button onClick={() => toggle(a)} className={`whitespace-nowrap rounded-full border px-3 py-2 text-[13px] font-semibold ${added ? "border-gold-deep text-gold-deep" : "border-line-2 text-ink hover:border-gold-deep"}`}>
                    {added ? "Ajouté ✓" : `Ajouter à ${tripName}`}
                  </button>
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {!loading && searched && rows.length === 0 && <p className="text-sm text-muted-2">Aucune activité trouvée pour cette ville.</p>}
    </div>
  );
}

export default function ActivitiesPage() {
  return (
    <div className="bg-paper">
      <SearchHero
        photo="balloons"
        eyebrow="Expériences sur place"
        title={<>Quoi <em className="font-serif font-medium italic tracking-[-0.02em]">faire</em> sur place</>}
        text="Les lieux à voir autour de vous et des idées de sorties, avec la durée et un prix moyen pour préparer chaque journée."
        points={["Lieux réels et leur photo", "Prix moyen estimé", "Ajout direct au carnet"]}
      />
      <Suspense><ActivitiesContent /></Suspense>
    </div>
  );
}
