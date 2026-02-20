import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Gratuit",
    price: "0€",
    period: "/mois",
    description: "Pour découvrir O-Flyes",
    features: [
      "5 conversations chatbot / mois",
      "Recherche de destinations",
      "Sauvegarde de 2 voyages",
    ],
    cta: "Commencer gratuitement",
    href: "/auth/register",
    highlight: false,
  },
  {
    name: "Pro",
    price: "9,99€",
    period: "/mois",
    description: "Pour les voyageurs passionnés",
    features: [
      "Chatbot illimité",
      "Recommandations IA avancées",
      "Sauvegarde de voyages illimitée",
      "Alertes & notifications",
      "Support prioritaire",
    ],
    cta: "Passer Pro",
    href: "/api/payment/payments/checkout",
    highlight: true,
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Tarifs simples et transparents</h1>
        <p className="text-gray-400 text-lg">Commencez gratuitement, passez Pro quand vous êtes prêt.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`glass rounded-2xl p-8 flex flex-col ${
              plan.highlight ? "border-brand-500/50 shadow-[0_0_40px_rgba(14,165,233,0.15)]" : ""
            }`}
          >
            {plan.highlight && (
              <span className="text-xs font-semibold text-brand-300 bg-brand-500/20 px-3 py-1 rounded-full self-start mb-4">
                POPULAIRE
              </span>
            )}
            <h2 className="text-2xl font-bold mb-1">{plan.name}</h2>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-brand-300">{plan.price}</span>
              <span className="text-gray-400">{plan.period}</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={plan.href}
              className={`block text-center py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] ${
                plan.highlight
                  ? "bg-brand-500 hover:bg-brand-600 text-white"
                  : "border border-gray-600 hover:border-gray-400 text-gray-300"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
