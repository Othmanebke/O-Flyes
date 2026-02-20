import { MapPin, Banknote, Tag } from "lucide-react";
import type { Destination } from "@/app/explore/page";

const CLIMATE_EMOJIS: Record<string, string> = {
  tropical: "🌴",
  arid: "🌵",
  temperate: "🌿",
  cold: "❄️",
  polar: "🧊",
};

const PLACEHOLDER_IMAGES: Record<string, string> = {
  tropical: "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=600&q=80",
  arid: "https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=600&q=80",
  temperate: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&q=80",
  cold: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=600&q=80",
};

export default function DestinationCard({ destination: d }: { destination: Destination }) {
  const img = d.image_url || PLACEHOLDER_IMAGES[d.climate] || PLACEHOLDER_IMAGES.temperate;

  return (
    <div className="glass rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={img}
          alt={d.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-brand-300 flex-shrink-0" />
          <span className="text-white text-sm font-medium">{d.name}, {d.country}</span>
        </div>
        <span className="absolute top-3 right-3 text-xl">
          {CLIMATE_EMOJIS[d.climate] ?? "🌍"}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{d.description}</p>

        <div className="flex items-center gap-1.5 text-brand-300 text-sm mb-3">
          <Banknote className="w-4 h-4" />
          <span>~{d.avg_daily_budget}€/jour/personne</span>
        </div>

        {/* Tags */}
        {d.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {d.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-brand-500/10 border border-brand-500/20 text-brand-300 rounded-full"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
