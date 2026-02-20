import { Check, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Gratuit",
    price: "0",
    period: "/mois",
    description: "Pour découvrir O-Flyes",
    features: [
      "5 conversations chatbot / mois",
      "Recherche de destinations",
      "Sauvegarde de 2 voyages",
      "Filtres budget & climat",
    ],
    cta: "Commencer gratuitement",
    href: "/auth/register",
    highlight: false,
  },
  {
    name: "Pro",
    price: "9,99",
    period: "/mois",
    description: "Pour les voyageurs passionnés",
    features: [
      "Chatbot IA illimité",
      "Recommandations IA avancées",
      "Sauvegarde illimitée",
      "Alertes & notifications SMS",
      "Itinéraires personnalisés PDF",
      "Support prioritaire 24h/24",
    ],
    cta: "Passer Pro",
    href: "/api/payment/payments/checkout",
    highlight: true,
  },
];

export default function PricingPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-8 py-16">

        {/* Header */}
        <div className="mb-16">
          <p className="section-label mb-3">Tarifs</p>
          <div className="flex items-end justify-between">
            <h1 className="font-serif text-5xl md:text-6xl text-dark leading-tight">
              Simple &<br />transparent
            </h1>
            <p className="hidden md:block text-dark-400 text-sm max-w-xs text-right">
              Commencez gratuitement,<br />passez Pro quand vous êtes prêt.
            </p>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-24">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 flex flex-col border card-hover ${
                plan.highlight
                  ? "bg-dark border-dark text-white"
                  : "bg-white border-dark-100"
              }`}
            >
              {plan.highlight && (
                <span className="text-[10px] font-semibold tracking-widest uppercase text-white/50 mb-6">
                  Le plus populaire
                </span>
              )}
              <h2 className={`text-lg font-semibold mb-4 ${plan.highlight ? "text-white" : "text-dark"}`}>
                {plan.name}
              </h2>
              <div className="flex items-baseline gap-1 mb-2">
                <span className={`text-5xl font-bold ${plan.highlight ? "text-white" : "text-dark"}`}>
                  {plan.price}€
                </span>
                <span className={`text-sm ${plan.highlight ? "text-white/50" : "text-dark-400"}`}>
                  {plan.period}
                </span>
              </div>
              <p className={`text-sm mb-8 ${plan.highlight ? "text-white/50" : "text-dark-400"}`}>
                {plan.description}
              </p>

              {/* Divider */}
              <div className={`h-px mb-8 ${plan.highlight ? "bg-white/10" : "bg-dark-100"}`} />

              <ul className="space-y-3 mb-10 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-center gap-3 text-sm ${plan.highlight ? "text-white/80" : "text-dark"}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlight ? "bg-white/10" : "bg-sand-100"}`}>
                      <Check className={`w-3 h-3 ${plan.highlight ? "text-white" : "text-sand-400"}`} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`rounded-full py-3.5 text-center text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:gap-3 ${
                  plan.highlight
                    ? "bg-white text-dark hover:bg-sand-100"
                    : "bg-dark text-white hover:bg-dark-600"
                }`}
              >
                {plan.cta}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Feature comparison */}
        <div className="mb-24">
          <h2 className="font-serif text-3xl text-dark mb-8 text-center">Comparez les formules</h2>
          <div className="border border-dark-100 rounded-3xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-100 bg-sand-50">
                  <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Fonctionnalité</th>
                  <th className="px-6 py-4 text-sm font-medium text-dark">Gratuit</th>
                  <th className="px-6 py-4 text-sm font-medium text-dark">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {[
                  { feature: "Conversations chatbot", free: "5/mois", pro: "Illimité" },
                  { feature: "Destinations suggérées", free: "✓", pro: "✓" },
                  { feature: "Filtres avancés", free: "—", pro: "✓" },
                  { feature: "Notifications SMS", free: "—", pro: "✓" },
                  { feature: "Itinéraires PDF", free: "—", pro: "✓" },
                  { feature: "Support", free: "Standard", pro: "Prioritaire 24h" },
                ].map((row) => (
                  <tr key={row.feature} className="hover:bg-sand-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-dark">{row.feature}</td>
                    <td className="px-6 py-4 text-sm text-dark-400 text-center">{row.free}</td>
                    <td className="px-6 py-4 text-sm text-dark text-center font-medium">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-sand-50 rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <span className="tag mb-4">Commencer maintenant</span>
            <h2 className="font-serif text-4xl text-dark leading-tight mb-3">
              Prêt pour votre<br />prochain voyage ?
            </h2>
            <p className="text-dark-400 text-sm mb-8 max-w-sm">
              Créez votre compte gratuit et commencez à explorer en 30 secondes.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/auth/register" className="btn-dark">Créer mon compte</Link>
              <Link href="/auth/register" className="w-10 h-10 rounded-full border border-dark flex items-center justify-center hover:bg-dark hover:text-white transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <img src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=260&q=80" alt="" className="rounded-2xl h-48 w-40 object-cover" />
            <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=260&q=80" alt="" className="rounded-2xl h-48 w-40 object-cover mt-6" />
          </div>
        </div>

      </div>
    </div>
  );
}
