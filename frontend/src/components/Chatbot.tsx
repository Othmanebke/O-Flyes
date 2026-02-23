"use client";
import { useState, useRef, useEffect } from "react";
import {
  Send, Loader2, X, ArrowUpRight, Hotel, Plane,
  MapPin, Sparkles, ChevronDown, MessageSquare,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { DESTINATIONS } from "@/lib/destinations";

// ── Types ────────────────────────────────────────────────────────────────
interface Activity { name: string; price: number; emoji: string; }
interface EnrichedDestination {
  name: string; country: string; emoji: string;
  price_estimate: number; booking_url: string;
  flights_url: string; activities: Activity[];
}
interface Message {
  role: "user" | "assistant";
  content: string;
  enriched?: EnrichedDestination[];
}

const SUGGESTIONS = [
  "Soleil en juillet avec 1500€",
  "Destination froide, nature, décembre",
  "Ville culturelle Europe, budget serré",
  "Plage tropicale 2 semaines, 2 pers.",
];

// ── Destination card ─────────────────────────────────────────────────────
function DestinationCard({ dest }: { dest: EnrichedDestination }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const localDest = DESTINATIONS.find(d =>
    d.name.toLowerCase().includes(dest.name.toLowerCase().split(",")[0]) ||
    dest.name.toLowerCase().includes(d.name.toLowerCase().split(",")[0])
  );

  const handleSave = async () => {
    if (!localDest) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vous devez être connecté pour enregistrer un voyage.");
      return;
    }

    try {
      setSaving(true);
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.id;

      await axios.post("/api/db/trips", {
        user_id: userId,
        destination_id: localDest.id,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 days
        budget: dest.price_estimate
      });
      setSaved(true);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du voyage:", err);
      alert("Erreur lors de la sauvegarde du voyage.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-2 rounded-2xl overflow-hidden border border-[#C9A84C]/20 bg-[#faf8f4]">
      {/* Top */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#C9A84C]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center text-xl flex-shrink-0">
            {dest.emoji}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{dest.name}</p>
            <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-[#C9A84C]" />{dest.country}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400">Budget estimé</p>
          <p className="text-[#C9A84C] font-bold text-base">{dest.price_estimate.toLocaleString("fr-FR")} €</p>
          <p className="text-gray-300 text-[9px]">vol + hôtel / 2 pers.</p>
        </div>
      </div>

      {/* Activities */}
      {dest.activities?.length > 0 && (
        <div className="px-4 py-3">
          <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-2">Activités</p>
          <div className="space-y-1">
            {dest.activities.slice(0, 3).map((act, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <span>{act.emoji}</span>{act.name}
                </span>
                <span className="text-[#C9A84C] font-medium ml-2 whitespace-nowrap">~{act.price} €</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="px-4 pb-3 flex gap-2">
        {localDest && (
          <button onClick={handleSave} disabled={saving || saved}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-gray-900 text-white text-xs font-medium py-2 rounded-xl transition-colors">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : (saved ? "✓ Enregistré" : <><Sparkles className="w-3 h-3" /> Enregistrer</>)}
          </button>
        )}
        <a href={dest.booking_url} target="_blank" rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/20 text-xs font-medium py-2 rounded-xl transition-colors">
          <Hotel className="w-3 h-3" /> Hôtels
        </a>
        <a href={dest.flights_url} target="_blank" rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-2 rounded-xl transition-colors">
          <Plane className="w-3 h-3" /> Vols
        </a>
      </div>
    </div>
  );
}

// ── Widget ───────────────────────────────────────────────────────────────
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Bonjour ! ✈️ Je suis votre assistant voyage O-Flyes.\n\nDites-moi votre budget, vos envies et votre période — je trouve la destination parfaite pour vous.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [open]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const allMsgs = [...messages, userMsg];
      const firstUserIdx = allMsgs.findIndex(m => m.role === "user");
      const history = firstUserIdx >= 0
        ? allMsgs.slice(firstUserIdx).map(({ role, content }) => ({ role, content }))
        : [{ role: "user" as const, content: text }];

      let userId: string | undefined;
      const token = localStorage.getItem("token");
      if (token) {
        try { userId = JSON.parse(atob(token.split(".")[1])).id; } catch (e) { }
      }

      const res = await axios.post("/api/ai/chat", { messages: history, userId });
      setMessages(prev => [...prev, { role: "assistant", content: res.data.reply, enriched: res.data.enriched }]);
      if (!open) setUnread(n => n + 1);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Une erreur est survenue. Réessayez dans quelques instants." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Panel ──────────────────────────────────────────────────────── */}
      <div className={`fixed bottom-24 right-6 z-50 w-[380px] max-h-[82vh] flex flex-col rounded-3xl overflow-hidden
        shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-[#C9A84C]/20 bg-white
        transition-all duration-300 origin-bottom-right
        ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}>

        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0 bg-gray-900 border-b border-white/5">
          <div className="w-8 h-8 bg-[#C9A84C]/20 border border-[#C9A84C]/40 rounded-xl flex items-center justify-center flex-shrink-0">
            <Plane className="w-3.5 h-3.5 text-[#C9A84C] -rotate-45" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white leading-none tracking-tight">O-Flyes</p>
            <p className="text-[11px] text-white/40 mt-0.5 tracking-wide">Assistant voyage</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-white/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            En ligne
          </div>
          <button onClick={() => setOpen(false)} className="ml-2 text-white/30 hover:text-white/70 transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 min-h-0 bg-[#fdfcfa]">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 w-7 h-7 bg-gray-900 rounded-xl flex items-center justify-center mt-0.5">
                  <Plane className="w-3 h-3 text-[#C9A84C] -rotate-45" />
                </div>
              )}
              <div className="max-w-[85%] flex flex-col gap-2">
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "assistant"
                  ? "bg-white border border-gray-100 text-gray-800 shadow-sm"
                  : "bg-gray-900 text-white"
                  }`}>
                  {msg.content}
                </div>
                {msg.enriched?.map((dest, j) => <DestinationCard key={j} dest={dest} />)}
              </div>
            </div>
          ))}

          {/* Typing */}
          {loading && (
            <div className="flex gap-2.5">
              <div className="flex-shrink-0 w-7 h-7 bg-gray-900 rounded-xl flex items-center justify-center">
                <Plane className="w-3 h-3 text-[#C9A84C] -rotate-45" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/60 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap gap-1.5 flex-shrink-0 bg-white">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)}
                className="text-[11px] px-3 py-1.5 rounded-full border border-gray-200 text-gray-500
                  hover:border-[#C9A84C]/50 hover:text-[#C9A84C] hover:bg-[#C9A84C]/5
                  transition-all flex items-center gap-1">
                {s} <ArrowUpRight className="w-2.5 h-2.5" />
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-gray-100 bg-white flex-shrink-0">
          <form onSubmit={e => { e.preventDefault(); send(input); }} className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Décrivez votre voyage idéal…"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800
                placeholder-gray-400 focus:outline-none focus:border-[#C9A84C]/50 focus:bg-white transition-all"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="w-10 h-10 bg-gray-900 hover:bg-gray-700 disabled:opacity-30 rounded-2xl
                flex items-center justify-center transition-all flex-shrink-0">
              {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-[#C9A84C]" />}
            </button>
          </form>
        </div>
      </div>

      {/* ── FAB ────────────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? "Fermer" : "Assistant voyage IA"}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center
          transition-all duration-300 hover:scale-105 border
          ${open
            ? "bg-gray-900 border-white/10 text-white"
            : "bg-gray-900 border-[#C9A84C]/30 text-[#C9A84C] hover:border-[#C9A84C]/60"
          }`}
      >
        {open ? <ChevronDown className="w-5 h-5 text-white/70" /> : <MessageSquare className="w-5 h-5" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
        {!open && unread === 0 && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
        )}
      </button>
    </>
  );
}