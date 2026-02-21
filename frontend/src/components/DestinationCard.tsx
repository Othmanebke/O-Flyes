import { MapPin, Star, Plane, Hotel } from "lucide-react";
import type { Destination } from "@/app/explore/page";

const BUDGET_BADGE: Record<string, string> = {
  petit:   "bg-emerald-100 text-emerald-700",
  moyen:   "bg-blue-100 text-blue-700",
  confort: "bg-purple-100 text-purple-700",
  luxe:    "bg-yellow-100 text-yellow-700",
};

export default function DestinationCard({ destination: d }: { destination: Destination }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden card-hover group border border-sand-100">
      <div className="relative h-44 overflow-hidden">
        <img src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${BUDGET_BADGE[d.budgetTier]}`}>
          {d.budgetTier.charAt(0).toUpperCase() + d.budgetTier.slice(1)}
        </span>
        <div className="absolute bottom-3 left-3 flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-white text-xs font-semibold">{d.rating}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-serif text-lg text-dark leading-tight mb-0.5">{d.name}</h3>
        <p className="text-dark-400 text-xs flex items-center gap-1 mb-3"><MapPin className="w-3 h-3" />{d.country}</p>
        <p className="text-dark-400 text-xs mb-3 line-clamp-2">{d.description}</p>
        <div className="bg-sand-50 rounded-lg p-2.5">
          <p className="text-[10px] text-dark-300 mb-1">Budget 2 pers / 2 semaines</p>
          <p className="text-dark font-bold text-sm">{d.tripBudget.min.toLocaleString()}€ <span className="text-dark-300 font-normal">— {d.tripBudget.max.toLocaleString()}€</span></p>
          <div className="flex gap-3 mt-1">
            <span className="text-dark-400 text-[10px] flex items-center gap-1"><Plane className="w-2.5 h-2.5" /> ~{d.flightFrom}€/pers</span>
            <span className="text-dark-400 text-[10px] flex items-center gap-1"><Hotel className="w-2.5 h-2.5" /> ~{d.hotelPerNight}€/nuit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
