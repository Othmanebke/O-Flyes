"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Maximize2, X } from "lucide-react";
import { CopilotMark } from "@/components/ui/Logo";
import Photo from "@/components/ui/Photo";
import Markdown from "@/components/ui/Markdown";
import { SUGGESTIONS, optionHref, resetChat, send, setChatOpen, useChat, type ChatMsg, type ChatOption } from "@/lib/chat";
import { eur } from "@/lib/catalog";
import { isPhotoKey, photoFor } from "@/lib/photos";
import { useSession } from "@/lib/session";

export function OptionCard({ o, onPick }: { o: ChatOption; onPick?: () => void }) {
  return (
    <Link href={optionHref(o)} onClick={onPick} className="plain-link flex items-center gap-3 rounded-[18px] border border-line bg-white p-2 transition-colors hover:border-ink">
      <Photo k={isPhotoKey(o.code) ? o.code : photoFor(o.name)} sizes="64px" className="h-16 w-16 shrink-0 rounded-xl" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[15px] font-medium">{o.name}</span>
        <span className="text-xs text-muted">{o.country} · {o.nights} nuits · {o.pax} pers.</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="tabular whitespace-nowrap text-[15px] font-semibold">{o.total != null ? eur(o.total) : "—"}</span>
        <span className="whitespace-nowrap text-[11px] text-muted">{o.total == null ? "prix indisponible" : o.estimated ? "estimé" : "prix du jour"}</span>
      </span>
    </Link>
  );
}

export function MessageBubble({ m, compact = true }: { m: ChatMsg; compact?: boolean }) {
  const user = m.role === "user";
  return (
    <div className={user ? "flex flex-col items-end gap-2.5" : "flex flex-col items-start gap-2.5"}>
      <div
        className={user
          ? "max-w-[86%] whitespace-pre-wrap rounded-[20px_20px_6px_20px] bg-ink px-[15px] py-[11px] text-white"
          : "max-w-[86%] rounded-[20px_20px_20px_6px] bg-bubble px-[15px] py-[11px] text-ink"}
        style={{ fontSize: compact ? 14 : 15, lineHeight: 1.55 }}
      >
        {user ? m.text : <Markdown text={m.text} />}
      </div>
      {!!m.options?.length && compact && (
        <div className="flex w-full flex-col gap-2">{m.options.map((o, i) => <OptionCard key={i} o={o} />)}</div>
      )}
      {!!m.links?.length && (
        <div className="flex flex-wrap gap-1.5">
          {m.links.map(l => (
            <Link key={l.href} href={l.href} className="plain-link rounded-full bg-ink px-[13px] py-[7px] text-[13px] font-medium !text-white hover:bg-ink-2">{l.label}</Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function TypingDots() {
  return (
    <div className="flex gap-[5px] self-start rounded-[20px_20px_20px_6px] bg-bubble px-4 py-3.5" aria-label="Le copilote écrit">
      {[0.5, 0.75, 1].map((o, i) => <span key={i} className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted" style={{ opacity: o, animationDelay: `${i * 0.15}s` }} />)}
    </div>
  );
}


export default function ChatDock() {
  const router = useRouter();
  const { messages, loading, open } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, loading, open]);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 80); }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    void send(input);
    setInput("");
  };

  const expand = () => { setChatOpen(false); router.push("/assistant"); };

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-[200] flex flex-col items-end gap-3 font-sans text-ink sm:bottom-6 sm:right-6">
      {open && (
        <div
          role="dialog" aria-label="Copilote AIVANA"
          className="pointer-events-auto flex h-[calc(100dvh-24px)] w-[calc(100vw-24px)] animate-fade-up flex-col overflow-hidden rounded-[28px] border border-line-2/80 bg-cream/95 shadow-panel backdrop-blur-[24px] backdrop-saturate-[1.8] sm:h-[min(620px,calc(100dvh-120px))] sm:w-[400px]"
        >
          <div className="flex items-center gap-3 border-b border-[#EAE5DC] py-3.5 pl-[18px] pr-4">
            <CopilotMark size={40} />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-[17px] font-bold tracking-[-0.01em]">Copilote AIVANA</span>
              <span className="truncate text-xs text-muted">{loading ? "Écrit…" : "En ligne · répond en quelques secondes"}</span>
            </div>
            <button onClick={resetChat} title="Nouvelle conversation" className="h-[34px] rounded-full border border-line px-3 text-xs text-muted-2 hover:border-ink">Nouveau</button>
            <button onClick={expand} title="Agrandir en plein écran" aria-label="Agrandir" className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#EFEBE4] hover:bg-line"><Maximize2 className="h-3.5 w-3.5" aria-hidden /></button>
            <button onClick={() => setChatOpen(false)} aria-label="Fermer" className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#EFEBE4] hover:bg-line"><X className="h-4 w-4" aria-hidden /></button>
          </div>

          <div ref={scrollRef} className="flex flex-1 flex-col gap-3.5 overflow-y-auto p-[18px]">
            {messages.map((m, i) => <MessageBubble key={i} m={m} />)}
            {loading && <TypingDots />}
            {messages.length === 1 && !loading && (
              <div className="mt-1 flex flex-col gap-2">
                <span className="text-xs text-muted">Pour commencer</span>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)} className="rounded-2xl border border-line bg-white px-3.5 py-[11px] text-left text-sm hover:border-ink">{s}</button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={submit} className="mx-3 mb-3 flex items-center gap-2 rounded-full border border-line bg-white py-[5px] pl-4 pr-[5px]">
            <label htmlFor="dock-input" className="sr-only">Votre message</label>
            <input
              id="dock-input" ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              placeholder="Budget, dates, envies…" disabled={loading}
              className="h-10 min-w-0 flex-1 border-none bg-transparent text-[15px] text-ink outline-none"
            />
            <button type="submit" aria-label="Envoyer" disabled={loading || !input.trim()} className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white hover:bg-ink-2 disabled:opacity-40">
              <ArrowUp className="h-[17px] w-[17px]" aria-hidden />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setChatOpen(!open)}
        className={`group pointer-events-auto items-center gap-3 rounded-full bg-ink p-0 text-white shadow-[0_0_0_1px_rgba(201,162,75,0.28),0_12px_32px_-8px_rgba(15,27,45,0.45),0_2px_6px_rgba(15,27,45,0.18)] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-ink-2 active:translate-y-0 min-[1100px]:p-1 min-[1100px]:pr-5 ${open ? "hidden sm:flex" : "flex"}`}
        aria-label={open ? "Réduire le copilote" : "Planifier avec l'IA"}
      >
        <CopilotMark size={48} shape="circle" ring="#0F1B2D" />
        <span className="hidden flex-col items-start gap-px min-[1100px]:flex">
          <span className="text-[15px] font-semibold leading-tight tracking-[-0.01em]">{open ? "Réduire" : "Planifier avec l'IA"}</span>
          {!open && <span className="text-xs leading-tight text-white/65">Décrivez votre voyage, je m&apos;occupe du reste</span>}
        </span>
      </button>
    </div>
  );
}
