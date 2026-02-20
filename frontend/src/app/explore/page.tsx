"use client";
import { useState } from "react";
import SearchForm, { SearchFilters } from "@/components/SearchForm";
import DestinationCard from "@/components/DestinationCard";
import axios from "axios";

export interface Destination {
  id: string;
  name: string;
  country: string;
  continent: string;
  climate: string;
  avg_daily_budget: number;
  best_periods: string[];
  tags: string[];
  description: string;
  image_url?: string;
}

export default function ExplorePage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (filters: SearchFilters) => {
    setLoading(true);
    setSearched(true);
    try {
      const params: Record<string, string> = {};
      if (filters.climate) params.climate = filters.climate;
      if (filters.minBudget) params.min_budget = String(filters.minBudget);
      if (filters.maxBudget) params.max_budget = String(filters.maxBudget);
      if (filters.period) params.period = filters.period;

      const res = await axios.get("/api/db/destinations", { params });
      setDestinations(res.data);
    } catch {
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3">Explorer les destinations</h1>
        <p className="text-gray-400">Filtrez par budget, climat et période pour trouver votre prochaine aventure.</p>
      </div>

      <SearchForm onSearch={handleSearch} />

      <div className="mt-12">
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && searched && destinations.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-xl mb-2">Aucune destination trouvée</p>
            <p className="text-sm">Essayez d'élargir vos critères de recherche</p>
          </div>
        )}

        {!loading && destinations.length > 0 && (
          <>
            <p className="text-gray-400 mb-6">{destinations.length} destination{destinations.length > 1 ? "s" : ""} trouvée{destinations.length > 1 ? "s" : ""}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map((d) => (
                <DestinationCard key={d.id} destination={d} />
              ))}
            </div>
          </>
        )}

        {!loading && !searched && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">Utilisez les filtres ci-dessus pour découvrir des destinations</p>
          </div>
        )}
      </div>
    </div>
  );
}
