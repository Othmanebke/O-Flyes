"use client";
// Carnet vide : invite à créer un premier voyage
import Link from "next/link";
import { Plane } from "lucide-react";
import { ask } from "@/lib/chat";

export default function Empty({ loggedIn }: { loggedIn: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[24px] border-[1.5px] border-dashed border-line-2 px-6 py-14 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft">
        <Plane className="h-7 w-7 -rotate-45" aria-hidden />
      </span>
      <span className="text-xl font-extrabold tracking-[-0.02em]">Aucun voyage en cours</span>
      <p className="m-0 max-w-[460px] text-[15px] text-muted-2">
        Décrivez votre voyage au copilote ou choisissez une destination : vols, hôtels et activités apparaîtront ici
        avec le budget.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => ask("")}
          className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-paper hover:bg-ink-2"
        >
          Planifier avec le copilote
        </button>
        <Link
          href="/explore"
          className="plain-link rounded-full border border-line-2 px-5 py-3 text-sm font-bold hover:border-ink"
        >
          Explorer les destinations
        </Link>
      </div>
      {!loggedIn && (
        <span className="text-[13px] text-muted">
          Déjà un compte ? <Link href="/auth/login?next=/dashboard">Connectez-vous</Link> pour retrouver vos voyages.
        </span>
      )}
    </div>
  );
}

/* Ce qui se passe une fois le voyage planifié. AIVANA ne réserve pas : l'utilisateur
   réserve chez chaque partenaire puis le coche ici. Trois états :
   1. planifié, réservations en cours · 2. tout est réservé · 3. voyage terminé. */
