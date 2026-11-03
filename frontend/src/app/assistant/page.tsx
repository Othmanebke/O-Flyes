"use client";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Photo from "@/components/ui/Photo";
import { MessageBubble, QuotaLine, TypingDots } from "@/components/chat/ChatDock";
import { SUGGESTIONS, optionHref, resetChat, selectOption, send, setChatOpen, useChat, type ChatOption } from "@/lib/chat";
import { byId, eur } from "@/lib/catalog";
import { isPhotoKey, photoFor } from "@/lib/photos";
import { startPlan, toast } from "@/lib/plan";

function OptionRow({ o, active }: { o: ChatOption; active: boolean }) {
  return (
    <button
      onClick={() => selectOption(o)}
      aria-pressed={active}
      className={`grid w-full grid-cols-[52px_1fr_auto] items-center gap-3.5 border-b border-line p-3.5 text-left text-ink last:border-b-0 hover:bg-[#F3F0EA] ${active ? "bg-[#F3F0EA]" : ""}`}
    >
      <span className="tabular whitespace-nowrap rounded-full border border-gold-deep/35 py-[3px] text-center text-xs font-semibold text-gold-deep">{o.code || "—"}</span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[15px] font-semibold">{o.name}</span>
        <span className="text-[13px] text-muted">{o.country} · {o.nights} nuits · {o.pax} voyageur{o.pax > 1 ? "s" : ""}</span>
      </span>
      <span className="flex flex-col items-end">
        <span className="tabular whitespace-nowrap text-sm font-semibold">{o.total != null ? eur(o.total) : "—"}</span>
        <span className="text-[11px] text-muted">{o.total == null ? "indisponible" : o.estimated ? "estimé" : "prix du jour"}</span>
      </span>
    </button>
  );
}

function AssistantContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { messages, loading, selected } = useChat();
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const asked = useRef(false);

  // La bulle se ferme ici : c'est la même conversation, en grand
  useEffect(() => { setChatOpen(false); }, []);
  useEffect(() => {
    const q = params.get("q");
    if (q && !asked.current) { asked.current = true; void send(q); router.replace("/assistant"); }
  }, [params, router]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages.length, loading]);

  const create = (o: ChatOption) => {
    startPlan({ destination: o.name, destId: o.destId, country: o.country, depart: o.depart, ret: o.ret, travelers: o.pax, budget: o.total });
    toast(`Voyage « ${o.name} » créé. Choisissez maintenant votre vol.`);
    router.push("/explore/flights");
  };

  const pick = selected;
  const desc = pick?.destId ? byId(pick.destId)?.desc : undefined;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-wrap items-start gap-10 px-6">
      <div className="flex min-h-[calc(100vh-76px)] min-w-0 flex-[1_1_520px] flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-5 pt-7">
          <div className="flex flex-col gap-1">
            <h1 className="m-0 text-[28px]">Votre <em className="accent">assistant</em> voyage</h1>
            <span className="text-[13px] text-muted">Même conversation que la bulle, en plein écran</span>
          </div>
          <button onClick={resetChat} className="rounded-full border border-line-2 px-3 py-2 text-[13px] text-muted-2 hover:border-muted hover:text-ink">Nouvelle discussion</button>
        </div>

        <div className="flex flex-1 flex-col gap-6 py-7">
          {messages.map((m, i) => (
            <div key={i} className="flex flex-col gap-3">
              <MessageBubble m={m} compact={false} />
              {!!m.options?.length && (
                <div className="w-full max-w-[600px] overflow-hidden rounded-[20px] border border-line">
                  {m.options.map((o, j) => <OptionRow key={j} o={o} active={pick?.name === o.name && pick?.total === o.total} />)}
                </div>
              )}
            </div>
          ))}
          {loading && <><TypingDots /><span className="text-sm text-muted">AIVANA compare les vols et les hôtels…</span></>}
          <div ref={endRef} />
        </div>

        <div className="sticky bottom-0 flex flex-col gap-2.5 bg-paper pb-6 pt-3">
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)} className="whitespace-nowrap rounded-full border border-line-2 px-3 py-[7px] text-[13px] text-muted-2 hover:border-gold-deep hover:text-ink">{s}</button>
              ))}
            </div>
          )}
          <form onSubmit={e => { e.preventDefault(); void send(input); setInput(""); }} className="flex gap-2 rounded-[22px] border border-line-2 bg-cream p-1.5">
            <label htmlFor="assistant-input" className="sr-only">Votre message</label>
            <input id="assistant-input" value={input} onChange={e => setInput(e.target.value)} disabled={loading} placeholder="Décrivez votre voyage idéal : budget, dates, envies…" className="h-11 min-w-0 flex-1 border-none bg-transparent px-2.5 text-[15px] text-ink outline-none" />
            <button type="submit" disabled={loading || !input.trim()} className="rounded-full bg-ink px-[18px] text-sm font-semibold text-paper hover:bg-ink-2 disabled:opacity-40">Envoyer</button>
          </form>
          <QuotaLine />
        </div>
      </div>

      <aside className="sticky top-20 my-7 max-w-full flex-[1_1_340px]">
        {pick ? (
          <div className="overflow-hidden rounded-3xl border border-line bg-cream">
            <div className="relative h-[170px]">
              <Photo k={isPhotoKey(pick.code) ? pick.code : photoFor(pick.name)} sizes="400px" className="h-full w-full" />
              <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(18,16,12,0.72) 0%, rgba(18,16,12,0) 70%)" }} />
              <div className="absolute bottom-3.5 left-4 flex flex-col text-white">
                <span className="text-[28px] font-bold leading-none tracking-[-0.03em]">{pick.name}</span>
                <span className="text-[13px] text-white/90">{pick.country}</span>
              </div>
            </div>
            <div className="flex flex-col gap-[18px] p-5">
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] text-muted">{pick.nights} nuits · {pick.pax} voyageur{pick.pax > 1 ? "s" : ""}</span>
                {desc && <p className="m-0 text-sm leading-[1.55] text-muted-2">{desc}</p>}
              </div>
              <div className="flex flex-col border-t border-line">
                {[
                  [`Vols A/R × ${pick.pax}`, pick.flight],
                  [`Hôtel × ${pick.nights} nuits`, pick.hotel],
                  ["Activités (estimation)", pick.activities],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between gap-3 border-b border-line py-[11px] text-sm">
                    <span className="text-muted-2">{k}</span>
                    <span className="tabular whitespace-nowrap font-semibold">{v != null ? eur(v as number) : "—"}</span>
                  </div>
                ))}
                <div className="flex justify-between gap-3 pt-3.5 text-base font-semibold">
                  <span>Total {pick.estimated ? "estimé" : "du jour"}</span>
                  <span className="tabular whitespace-nowrap text-gold-deep">{pick.total != null ? eur(pick.total) : "—"}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => create(pick)} className="rounded-full bg-ink px-4 py-3 text-sm font-semibold text-paper hover:bg-ink-2">Créer ce voyage</button>
                <Link href={optionHref(pick)} className="plain-link rounded-full border border-line-2 px-4 py-[11px] text-center text-sm font-medium hover:border-muted">Voir la fiche détaillée</Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 rounded-3xl border border-dashed border-line-2 p-7">
            <span className="text-[15px] font-semibold">Votre proposition</span>
            <p className="m-0 text-sm leading-[1.55] text-muted">Décrivez votre voyage : le détail du budget (vols, hébergement, activités) s&apos;affiche ici, avec le bouton pour créer le voyage.</p>
          </div>
        )}
      </aside>
    </div>
  );
}

export default function AssistantPage() {
  return <Suspense><AssistantContent /></Suspense>;
}
