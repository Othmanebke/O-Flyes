"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowLeft, Download } from "lucide-react";
import Logo from "@/components/ui/Logo";
import TravelAdvice from "@/components/trip/TravelAdvice";
import { eur, findDestination } from "@/lib/catalog";
import { addDays, formatRange, nightsBetween, planTotal, tripName, usePlan } from "@/lib/plan";
import { KIND, fmtDay, shortTitle } from "@/lib/trip-format";

/* Carnet de voyage imprimable : une mise en page A4 sobre du voyage en cours.
   Le bouton ouvre la boîte d'impression du navigateur, où l'on choisit
   « Enregistrer au format PDF » : le fichier garde les polices et les accents du site. */
export default function CarnetPage() {
  const plan = usePlan();
  const printed = useRef(false);

  // Nom du fichier PDF proposé par le navigateur = titre de la page
  useEffect(() => {
    if (!plan) return;
    document.title = `Carnet AIVANA - ${tripName(plan)}`;
    if (printed.current) return;
    printed.current = true;
    // Ouverture automatique de la boîte « Enregistrer en PDF » une fois les polices prêtes
    document.fonts?.ready.then(() => setTimeout(() => window.print(), 400));
  }, [plan]);

  if (!plan) {
    return (
      <div className="mx-auto flex max-w-[640px] flex-col items-center gap-4 px-6 py-24 text-center">
        <Logo size={40} />
        <p className="m-0 text-muted-2">Aucun voyage en cours sur cet appareil. Ouvrez un voyage depuis votre carnet pour le télécharger en PDF.</p>
        <Link href="/dashboard" className="plain-link rounded-full bg-ink px-5 py-3 text-sm font-bold !text-white">Mon carnet</Link>
      </div>
    );
  }

  const cat = findDestination(plan.destination);
  const country = plan.country || cat?.country;
  const nights = nightsBetween(plan.depart, plan.ret);
  const total = planTotal(plan);
  const items = [...plan.items].sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
  const days = Array.from({ length: Math.min(nights, 30) + 1 }, (_, n) => {
    const date = addDays(plan.depart, n);
    return { date, items: plan.items.filter(i => i.date === date) };
  });
  const unplaced = plan.items.filter(i => !i.date || !days.some(d => d.date === i.date));
  const booked = plan.items.filter(i => i.booked).length;

  return (
    <>
      <style>{`@page { size: A4; margin: 14mm; } @media print { html, body { background: #fff !important; } }`}</style>

      {/* Barre d'outils : invisible sur le PDF */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper/95 px-6 py-3 backdrop-blur print:hidden">
        <Link href="/dashboard" className="plain-link flex items-center gap-2 text-sm font-semibold !text-ink"><ArrowLeft className="h-4 w-4" aria-hidden /> Retour au carnet</Link>
        <span className="hidden text-[13px] text-muted md:inline">Dans la fenêtre qui s&apos;ouvre, choisissez « Enregistrer au format PDF ».</span>
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white hover:bg-ink-2">
          <Download className="h-4 w-4" aria-hidden /> Télécharger le PDF
        </button>
      </div>

      <article className="mx-auto my-8 flex max-w-[800px] flex-col gap-8 bg-white px-10 py-10 text-ink shadow-[0_10px_40px_rgba(15,27,45,0.08)] [print-color-adjust:exact] print:m-0 print:max-w-none print:p-0 print:shadow-none">
        {/* En-tête */}
        <header className="flex items-start justify-between gap-6 border-b-2 border-ink pb-5">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-gold-deep">Carnet de voyage</span>
            <h1 className="m-0 text-[34px] font-extrabold leading-tight tracking-[-0.03em]">{tripName(plan)}</h1>
            <span className="text-sm text-muted-2">
              {plan.name ? `${plan.destination} · ` : ""}{country ? `${country} · ` : ""}{formatRange(plan.depart, plan.ret)} · {nights} nuit{nights > 1 ? "s" : ""} · {plan.travelers} voyageur{plan.travelers > 1 ? "s" : ""} · depuis {plan.origin}
            </span>
          </div>
          <Logo size={34} />
        </header>

        {/* Chiffres clés */}
        <section className="grid grid-cols-3 gap-3">
          {[
            { l: "Total estimé", v: eur(total), s: `${eur(total / Math.max(1, plan.travelers))} par personne` },
            { l: "Budget", v: plan.budget ? eur(plan.budget) : "—", s: plan.budget ? (total > plan.budget ? `${eur(total - plan.budget)} au-dessus` : `${eur(plan.budget - total)} de marge`) : "Non fixé" },
            { l: "Réservations", v: `${booked} / ${plan.items.length}`, s: booked === plan.items.length && plan.items.length ? "Tout est réservé" : "réservées" },
          ].map(k => (
            <div key={k.l} className="flex flex-col gap-1 rounded-[14px] border border-line p-3.5">
              <span className="text-xs font-semibold text-muted">{k.l}</span>
              <span className="tabular text-xl font-extrabold">{k.v}</span>
              <span className="text-xs text-muted-2">{k.s}</span>
            </div>
          ))}
        </section>

        {/* Réservations */}
        <section className="flex flex-col gap-3 [break-inside:avoid]">
          <h2 className="m-0 text-lg font-extrabold">Réservations</h2>
          {items.length === 0 ? <p className="m-0 text-sm text-muted">Aucun élément pour l&apos;instant.</p> : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="py-2 pr-3 font-semibold">Type</th>
                  <th className="py-2 pr-3 font-semibold">Élément</th>
                  <th className="py-2 pr-3 font-semibold">Date</th>
                  <th className="py-2 pr-3 text-right font-semibold">Prix estimé</th>
                  <th className="py-2 text-right font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.key} className="border-b border-line align-top [break-inside:avoid]">
                    <td className="py-2.5 pr-3 font-semibold">{KIND[i.type]}</td>
                    <td className="py-2.5 pr-3">
                      <span className="font-semibold">{shortTitle(i)}</span>
                      {(i.subtitle || i.provider) && <span className="block text-xs text-muted">{[i.provider, i.subtitle].filter(Boolean).join(" · ")}</span>}
                      {i.url && !i.booked && <span className="block break-all text-[11px] text-muted">{i.url}</span>}
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-3">{i.date ? fmtDay(i.date) : "—"}</td>
                    <td className="tabular whitespace-nowrap py-2.5 pr-3 text-right font-semibold">{i.price === 0 ? "Gratuit" : i.price != null ? eur(i.price) : "—"}</td>
                    <td className={`whitespace-nowrap py-2.5 text-right text-xs font-bold ${i.booked ? "text-ok" : "text-gold-deep"}`}>{i.booked ? "Réservé" : "À réserver"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Itinéraire */}
        <section className="flex flex-col gap-3">
          <h2 className="m-0 text-lg font-extrabold">Itinéraire jour par jour</h2>
          <ol className="m-0 flex list-none flex-col p-0">
            {days.map((d, n) => {
              const lines = [
                ...(n === 0 ? [`Départ de ${plan.origin}`] : []),
                ...d.items.map(i => `${KIND[i.type]} · ${shortTitle(i)}`),
                ...(n === days.length - 1 && n > 0 ? [`Retour vers ${plan.origin}`] : []),
              ];
              return (
                <li key={d.date} className="grid grid-cols-[170px_minmax(0,1fr)] gap-4 border-b border-dashed border-line py-2 text-sm [break-inside:avoid]">
                  <span className="whitespace-nowrap font-bold">Jour {n + 1} <span className="font-normal text-muted">· {fmtDay(d.date)}</span></span>
                  <span className="flex flex-col gap-0.5 text-muted-2">{lines.length ? lines.map((l, j) => <span key={j}>{l}</span>) : <span className="text-muted">Journée libre</span>}</span>
                </li>
              );
            })}
          </ol>
          {unplaced.length > 0 && (
            <p className="m-0 text-sm text-muted-2"><span className="font-bold text-ink">À placer dans le séjour : </span>{unplaced.map(i => shortTitle(i)).join(", ")}</p>
          )}
        </section>

        {/* Conseils */}
        <section className="flex flex-col gap-3 [break-inside:avoid]">
          <h2 className="m-0 text-lg font-extrabold">Bon à savoir avant de partir</h2>
          <TravelAdvice country={country} />
        </section>

        <footer className="border-t border-line pt-4 text-[11px] leading-relaxed text-muted">
          Prix estimés au moment de la planification : le tarif réel est celui affiché par chaque partenaire lors de la réservation.
          Carnet généré par AIVANA le {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.
        </footer>
      </article>
    </>
  );
}
