import { Plane } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="bg-sand-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-8 py-14 text-center">
        <p className="section-label mb-4">IA Voyage</p>
        <h1 className="font-serif text-5xl md:text-6xl text-dark leading-tight mb-6">
          Votre Assistant<br />de Voyage IA
        </h1>
        <p className="text-dark-400 text-sm max-w-md mx-auto mb-12">
          Décrivez vos envies, votre budget et votre période —
          l&apos;IA trouve la destination parfaite pour vous.
        </p>

        {/* Prompt visual */}
        <div className="bg-sand-50 rounded-3xl p-10 max-w-lg mx-auto flex flex-col items-center gap-5">
          <div className="w-16 h-16 bg-dark rounded-full flex items-center justify-center shadow-lg">
            <Plane className="w-7 h-7 text-white" />
          </div>
          <p className="text-dark font-semibold text-lg">O-Flyes IA est prête !</p>
          <p className="text-dark-400 text-sm text-center">
            Cliquez sur le bouton <span className="font-semibold text-dark">✈</span> en bas à droite
            pour démarrer une conversation.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              "Soleil en juillet, 1500€",
              "Froid + nature, décembre",
              "Europe culturelle, budget serré",
              "Plage tropicale, 2 semaines",
            ].map((s) => (
              <span key={s} className="tag">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
