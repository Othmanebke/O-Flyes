import Chatbot from "@/components/Chatbot";
import { Plane } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-8 py-14">
        {/* Header */}
        <div className="mb-10">
          <p className="section-label mb-3">IA Voyage</p>
          <div className="flex items-start justify-between gap-8">
            <h1 className="font-serif text-5xl md:text-6xl text-dark leading-tight">
              Votre Assistant<br />de Voyage IA
            </h1>
            <p className="hidden md:block text-dark-400 text-sm max-w-xs text-right mt-2">
              Décrivez vos envies, votre budget et votre période —
              l&apos;IA trouve la destination parfaite pour vous.
            </p>
          </div>
        </div>

        {/* Quick suggestions banner */}
        <div className="bg-sand-50 rounded-2xl p-4 mb-6 flex flex-wrap gap-2 items-center">
          <Plane className="w-4 h-4 text-sand-400 flex-shrink-0" />
          <span className="text-xs text-dark-400 mr-2">Essayez :</span>
          {[
            "Soleil en juillet, 1500€",
            "Froid + nature, décembre",
            "Europe culturelle, budget serré",
            "Plage tropicale, 2 semaines",
          ].map((s) => (
            <span key={s} className="tag cursor-pointer hover:bg-sand-100 transition-colors">{s}</span>
          ))}
        </div>

        <Chatbot />
      </div>
    </div>
  );
}
