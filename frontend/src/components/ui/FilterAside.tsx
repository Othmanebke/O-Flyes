"use client";
// Colonne de filtres des pages de recherche (vols, hôtels).
// Grand écran : colonne à gauche des résultats. Mobile et tablette portrait : les filtres
// se replient derrière un bouton « Filtres » pour que les résultats restent en haut.
import { useState, type ReactNode } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

export default function FilterAside({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <aside className="flex w-full flex-col gap-4 min-[860px]:w-auto min-[860px]:min-w-[200px] min-[860px]:flex-[0_1_220px]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex items-center justify-between rounded-full border border-line-2 bg-cream px-5 py-3 text-sm font-semibold text-ink min-[860px]:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filtres
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      <div className={`${open ? "flex" : "hidden"} flex-col gap-6 min-[860px]:flex`}>{children}</div>
    </aside>
  );
}
