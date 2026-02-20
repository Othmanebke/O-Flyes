"use client";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

export interface SearchFilters {
  climate?: string;
  minBudget?: number;
  maxBudget?: number;
  period?: string;
  interests?: string[];
}

interface Props {
  onSearch: (filters: SearchFilters) => void;
}

const CLIMATES = [
  { value: "", label: "Tous" },
  { value: "tropical", label: "🌴 Tropical" },
  { value: "arid", label: "🌵 Aride" },
  { value: "temperate", label: "🌿 Tempéré" },
  { value: "cold", label: "❄️ Froid" },
];

const PERIODS = [
  { value: "", label: "Toute période" },
  { value: "january", label: "Janvier" },
  { value: "february", label: "Février" },
  { value: "march", label: "Mars" },
  { value: "april", label: "Avril" },
  { value: "may", label: "Mai" },
  { value: "june", label: "Juin" },
  { value: "july", label: "Juillet" },
  { value: "august", label: "Août" },
  { value: "september", label: "Septembre" },
  { value: "october", label: "Octobre" },
  { value: "november", label: "Novembre" },
  { value: "december", label: "Décembre" },
];

export default function SearchForm({ onSearch }: Props) {
  const [climate, setClimate] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [period, setPeriod] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      climate: climate || undefined,
      minBudget: minBudget ? Number(minBudget) : undefined,
      maxBudget: maxBudget ? Number(maxBudget) : undefined,
      period: period || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5 text-brand-400">
        <SlidersHorizontal className="w-5 h-5" />
        <span className="font-semibold">Filtrer les destinations</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {/* Climate */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Climat</label>
          <select
            value={climate}
            onChange={(e) => setClimate(e.target.value)}
            className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
          >
            {CLIMATES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Min budget */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Budget min/jour (€)</label>
          <input
            type="number"
            value={minBudget}
            onChange={(e) => setMinBudget(e.target.value)}
            placeholder="0"
            className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Max budget */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Budget max/jour (€)</label>
          <input
            type="number"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            placeholder="500"
            className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Period */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Période</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium transition-all hover:scale-[1.02]"
      >
        <Search className="w-4 h-4" />
        Rechercher
      </button>
    </form>
  );
}
