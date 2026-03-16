"use client";
import { useState, useRef, useEffect } from "react";
import {
  Send, Loader2, X, ArrowUpRight, Hotel, Plane,
  MapPin, Sparkles, ChevronDown, MessageSquare, RefreshCcw
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
    try {
      setSaving(true);
      await axios.post("/api/trips", {
        title: "Voyage : " + dest.name,
        destination_id: localDest.id,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      setSaved(true);
      window.dispatchEvent(new Event("trip-saved"));
    } catch (err: any) {
      if (err?.response?.status === 401) {
        alert("Vous devez être connecté pour enregistrer un voyage.");
      } else {
        console.error("Erreur lors de la sauvegarde du voyage:", err);
        alert("Erreur lors de la sauvegarde du voyage.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-2 rounded-2xl overflow-hidden border border-white/10 bg-[#141822]">
      {/* Top */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-xl flex-shrink-0">
            {dest.emoji}
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{dest.name}</p>
            <p className="text-white/50 text-xs flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-gold" />{dest.country}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/30">Budget estimé</p>
          <p className="text-gold font-bold text-base">{dest.price_estimate.toLocaleString("fr-FR")} €</p>
          <p className="text-white/30 text-[9px]">vol + hôtel / 2 pers.</p>
        </div>
      </div>

      {/* Activities */}
      {dest.activities?.length > 0 && (
        <div className="px-4 py-3">
          <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2">Activités</p>
          <div className="space-y-1">
            {dest.activities.slice(0, 3).map((act, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-white/70 flex items-center gap-1.5">
                  <span>{act.emoji}</span>{act.name}
                </span>
                <span className="text-gold font-medium ml-2 whitespace-nowrap">~{act.price} €</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="px-4 pb-3 flex gap-2">
        {localDest && (
          <button onClick={handleSave} disabled={saving || saved}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gold hover:bg-gold-600 disabled:opacity-50 text-dark-900 text-[10px] font-black uppercase tracking-widest py-2 rounded-xl transition-colors">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : (saved ? "✓ Enregistré" : <><Sparkles className="w-3 h-3" /> Enregistrer</>)}
          </button>
        )}
        <a href={dest.booking_url} target="_blank" rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 text-[10px] font-black uppercase tracking-widest py-2 rounded-xl transition-colors">
          <Hotel className="w-3 h-3" /> Hôtels
        </a>
        <a href={dest.flights_url} target="_blank" rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 text-[10px] font-black uppercase tracking-widest py-2 rounded-xl transition-colors">
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
      content: "Bonjour ! ✈️ Je suis votre assistant voyage AIVANA.\n\nDites-moi votre budget, vos envies et votre période — je trouve la destination parfaite pour vous.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content: "Bonjour ! ✈️ Je suis votre assistant voyage AIVANA.\n\nDites-moi votre budget, vos envies et votre période — je trouve la destination parfaite pour vous.",
      },
    ]);
    setInput("");
    setUnread(0);
  };

  useEffect(() => {
    // Show popup after 5 seconds if not opened
    const timer = setTimeout(() => {
      if (!open) setShowPopup(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    const handleOpen = () => setOpen(true);

    // Listen for preset event
    const handlePreset = (e: any) => {
      if (e.detail?.open) setOpen(true);
      if (e.detail?.text) setInput(e.detail.text);
      if (e.detail?.autoSend && e.detail?.text) {
        setTimeout(() => send(e.detail.text), 150);
      }
    };

    window.addEventListener("open-chatbot", handleOpen);
    window.addEventListener("chatbot-preset", handlePreset);

    return () => {
      window.removeEventListener("open-chatbot", handleOpen);
      window.removeEventListener("chatbot-preset", handlePreset);
    };
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      const pathParts = window.location.pathname.split("/");
      const tripIdx = pathParts.indexOf("trips");
      if (tripIdx !== -1 && pathParts[tripIdx + 1]) {
        const tId = pathParts[tripIdx + 1];
        // Chat history not persisted in current architecture
      }
    };

    if (open) {
      setUnread(0);
      setShowPopup(false);
      setTimeout(() => inputRef.current?.focus(), 100);
      loadHistory();
    }
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

      const res = await axios.post("/api/chat", { messages: history });
      setMessages(prev => [...prev, { role: "assistant", content: res.data.content, enriched: res.data.enriched }]);
      if (!open) setUnread(n => n + 1);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Vous devez être connecté pour utiliser l'assistant voyage. [Se connecter](/auth/login)"
        }]);
      } else {
        const msg = err?.response?.data?.error || "Une erreur est survenue. Veuillez réessayer.";
        setMessages(prev => [...prev, { role: "assistant", content: msg }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Panel ──────────────────────────────────────────────────────── */}
      <div className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100%-2rem)] sm:w-[380px] max-h-[70vh] sm:max-h-[82vh] flex flex-col rounded-3xl overflow-hidden
        shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white/10 bg-dark-900
        transition-all duration-300 origin-bottom-right
        ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}>

        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0 bg-dark-900 border-b border-white/10">
          <div className="w-8 h-8 bg-[#C9A84C]/20 border border-[#C9A84C]/40 rounded-xl flex items-center justify-center flex-shrink-0">
            <Plane className="w-3.5 h-3.5 text-[#C9A84C] -rotate-45" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white leading-none tracking-tight">AIVANA</p>
            <p className="text-[11px] text-white/40 mt-0.5 tracking-wide">Assistant voyage</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-white/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            En ligne
          </div>
          <button onClick={handleReset} title="Nouvelle discussion" className="ml-auto text-white/30 hover:text-white/70 transition-colors p-1">
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button onClick={() => setOpen(false)} title="Fermer" className="ml-1 text-white/30 hover:text-white/70 transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 min-h-0 bg-dark-900">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 w-7 h-7 bg-dark-800 border border-white/10 rounded-xl flex items-center justify-center mt-0.5">
                  <Plane className="w-3 h-3 text-[#C9A84C] -rotate-45" />
                </div>
              )}
              <div className="max-w-[85%] flex flex-col gap-2">
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "assistant"
                  ? "bg-dark-800 border border-white/5 text-gray-200 shadow-sm"
                  : "bg-[#C9A84C] text-dark-900 font-medium"
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
              <div className="flex-shrink-0 w-7 h-7 bg-dark-800 border border-white/10 rounded-xl flex items-center justify-center">
                <Plane className="w-3 h-3 text-[#C9A84C] -rotate-45" />
              </div>
              <div className="bg-dark-800 border border-white/5 rounded-2xl px-4 py-3 shadow-sm">
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
          <div className="px-4 py-3 border-t border-white/10 flex flex-wrap gap-1.5 flex-shrink-0 bg-dark-900">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)}
                className="text-[11px] px-3 py-1.5 rounded-full border border-white/10 text-gray-400
                  hover:border-[#C9A84C]/50 hover:text-[#C9A84C] hover:bg-[#C9A84C]/10
                  transition-all flex items-center gap-1">
                {s} <ArrowUpRight className="w-2.5 h-2.5" />
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-white/10 bg-dark-900 flex-shrink-0">
          <form onSubmit={e => { e.preventDefault(); send(input); }} className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Décrivez votre voyage idéal…"
              className="flex-1 bg-dark-800 border border-transparent rounded-2xl px-4 py-2.5 text-sm text-gray-200
                placeholder-gray-400 focus:outline-none focus:border-[#C9A84C]/50 transition-all"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="w-10 h-10 bg-[#C9A84C] hover:bg-[#b09340] disabled:opacity-30 rounded-2xl
                flex items-center justify-center transition-all flex-shrink-0">
              {loading ? <Loader2 className="w-4 h-4 text-dark-900 animate-spin" /> : <Send className="w-4 h-4 text-dark-900" />}
            </button>
          </form>
        </div>
      </div>

      {/* ── Pop-up Notification ────────────────────────────────────────── */}
      <div className={`fixed bottom-[90px] right-4 sm:right-6 z-40 transition-all duration-500 origin-bottom-right max-w-[calc(100%-2rem)]
        ${showPopup && !open ? "opacity-100 scale-100 translate-y-0 translate-x-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"}`}>
        <div className="bg-dark-900/80 backdrop-blur-lg rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 p-4 pr-10 relative
          after:content-[''] after:absolute after:-bottom-2 after:right-6 after:w-4 after:h-4 
          after:bg-dark-900/90 after:border-r after:border-b after:border-white/10 after:rotate-45">
          <button onClick={() => setShowPopup(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors p-1">
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/30 flex items-center justify-center flex-shrink-0 animate-bounce">
              <span className="text-sm">👋</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Besoin d'inspiration ?</p>
              <p className="text-xs text-gray-300 mt-0.5 leading-snug">
                Je suis là pour vous aider à planifier<br />votre prochain voyage de rêve !
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── FAB ────────────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? "Fermer" : "Assistant voyage IA"}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center
          transition-all duration-300 hover:scale-105 border
          ${open
            ? "bg-dark-800 border-white/10 text-white"
            : "bg-dark-900 border-[#C9A84C]/30 text-[#C9A84C] hover:border-[#C9A84C]/60"
          }`}
      >
        {open ? <ChevronDown className="w-5 h-5 text-white/70" /> : <Plane className="w-6 h-6 -rotate-45" />}
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