"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Loader2, X, ArrowUpRight } from "lucide-react";
import axios from "axios";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Je veux du soleil en juillet avec 1500€",
  "Destination froide et nature, 2 semaines en décembre",
  "Ville culturelle en Europe, budget serré, printemps",
  "Plage tropicale, mois d'août, 2000€ pour 2 personnes",
];

/* Plane SVG inline for bubbles */
const PlaneSVG = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
  </svg>
);

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Bonjour ! Je suis votre assistant de voyage O-Flyes.\n\nDites-moi ce que vous recherchez : votre budget, vos envies (plage, montagne, ville…), le climat souhaité et quand vous voulez partir. Je vous trouve la destination parfaite !",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const history = [...messages, userMsg].map(({ role, content }) => ({ role, content }));
      const res = await axios.post("/api/ai/chat", { messages: history });
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }]);
    } catch (err: any) {
      const isQuota = err?.response?.status === 429;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: isQuota
            ? "⚠️ Le service IA est temporairement indisponible (quota OpenAI dépassé).\n\nPour réactiver le chatbot, ajoutez des crédits sur platform.openai.com/account/billing"
            : "Désolé, une erreur s'est produite. Le service IA est peut-être hors ligne.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Chat panel ───────────────────────────────────────────────── */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[75vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-dark-100 bg-white animate-fade-up">
          {/* Header */}
          <div className="bg-dark px-5 py-3.5 flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <PlaneSVG className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">O-Flyes IA</p>
              <p className="text-[10px] text-white/50">Assistant voyage · En ligne</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-green-400 ml-auto" />
            <button
              onClick={() => setOpen(false)}
              className="ml-2 text-white/50 hover:text-white transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-sand-50 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {/* Avatar with plane */}
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 w-7 h-7 bg-dark rounded-full flex items-center justify-center mt-0.5">
                    <PlaneSVG className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "assistant"
                      ? "bg-dark text-white shadow-sm"
                      : "bg-white text-dark border border-dark-100 shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 bg-dark rounded-full flex items-center justify-center mt-0.5">
                  <PlaneSVG className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-dark rounded-2xl px-4 py-3 shadow-sm">
                  <Loader2 className="w-4 h-4 text-white/70 animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions (first msg only) */}
          {messages.length === 1 && (
            <div className="px-4 py-3 border-t border-dark-100 bg-white flex flex-wrap gap-2 flex-shrink-0">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-dark-100 text-dark-400 hover:border-dark hover:text-dark transition-colors flex items-center gap-1"
                >
                  {s}
                  <ArrowUpRight className="w-2.5 h-2.5" />
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-dark-100 bg-white flex-shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Décrivez votre voyage idéal…"
                className="flex-1 bg-sand-50 border border-dark-100 rounded-full px-4 py-2.5 text-sm text-dark placeholder-dark-300 focus:outline-none focus:border-dark transition-colors"
                disabled={loading}
              />
              <button
                type="submit"
                aria-label="Envoyer"
                disabled={loading || !input.trim()}
                className="w-10 h-10 bg-dark rounded-full flex items-center justify-center disabled:opacity-40 hover:bg-dark-700 transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── FAB button ───────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer le chatbot" : "Ouvrir le chatbot IA"}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-dark rounded-full shadow-2xl flex items-center justify-center hover:bg-dark-700 transition-all hover:scale-110 group"
      >
        {open ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <PlaneSVG className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
        )}
        {!open && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
        )}
      </button>
    </>
  );
}
