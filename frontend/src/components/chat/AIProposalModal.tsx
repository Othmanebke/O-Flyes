"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X, Plane, Hotel, Compass, Calendar, Check, Loader2, Sparkles, MapPin, AlertCircle, ExternalLink } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DESTINATIONS } from "@/lib/destinations";
import type { EnrichedDestination } from "@/types/chat";
import { withAivanaFallback } from "@/lib/placeholder";

interface Props {
  dest: EnrichedDestination;
  onClose: () => void;
}

/* Un élément proposé par AIVANA que l'utilisateur peut garder ou retirer avant
   d'envoyer la sélection dans son dashboard. `amount` est toujours un montant réel
   (issu d'Amadeus / OpenTripMap) : un élément sans prix connu vaut null et compte 0. */
type ProposalItem = {
  key: string;
  type: "flight" | "hotel" | "activity";
  title: string;
  detail: string;
  amount: number | null;
  external_url?: string;
  metadata?: Record<string, any>;
};

export default function AIProposalModal({ dest, onClose }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const heroImg = DESTINATIONS.find(
    d => d.name.toLowerCase() === dest.name.toLowerCase()
  )?.img || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=80";

  const nights = dest.nights || 7;
  const adults = dest.adults || 2;
  // Les dates viennent du serveur en AAAA-MM-JJ ; on les affiche en français et on
  // reste tolérant si elles manquent (réponse plus ancienne encore en cache côté client).
  const fmtDate = (d?: string) => {
    if (!d) return null;
    const parsed = new Date(d + "T00:00:00");
    return isNaN(parsed.getTime()) ? null : parsed.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  };
  const departLabel = fmtDate(dest.depart_date);
  const returnLabel = fmtDate(dest.return_date);
  const hotelTotal = dest.hotel_price_per_night !== null ? dest.hotel_price_per_night * nights : null;

  // La proposition ne contient que ce dont on connaît la réalité : s'il n'y a pas de
  // prix réel pour le vol ou l'hôtel, l'élément n'est pas proposé du tout plutôt que
  // d'être ajouté au voyage avec un montant inventé.
  const items = useMemo<ProposalItem[]>(() => {
    const list: ProposalItem[] = [];

    if (dest.flight_price !== null) {
      list.push({
        key: "flight",
        type: "flight",
        title: `Vol aller-retour vers ${dest.name}`,
        detail: `${adults} personne${adults > 1 ? "s" : ""} · aller-retour`,
        amount: dest.flight_price,
        external_url: dest.flights_url,
        metadata: { depart: dest.depart_date, retour: dest.return_date, adults, source: "amadeus" },
      });
    }

    if (hotelTotal !== null) {
      list.push({
        key: "hotel",
        type: "hotel",
        title: `Hébergement à ${dest.name}`,
        detail: `${dest.hotel_price_per_night} € / nuit × ${nights} nuits · ${adults} pers.`,
        amount: hotelTotal,
        external_url: dest.booking_url,
        metadata: {
          check_in: dest.depart_date,
          check_out: dest.return_date,
          nights,
          price_per_night: dest.hotel_price_per_night,
          source: "amadeus",
        },
      });
    }

    dest.activities.slice(0, 4).forEach((act, i) => {
      list.push({
        key: `activity-${i}`,
        type: "activity",
        title: `${act.emoji} ${act.name}`,
        detail: act.price !== null ? "Activité sur place" : "Activité sur place · prix non communiqué",
        amount: act.price,
        metadata: { source: "opentripmap" },
      });
    });

    return list;
  }, [dest, hotelTotal, nights, adults]);

  // Sélection AIVANA par défaut : tout ce qui a pu être vérifié est pré-coché. On ne
  // mémorise que ce que l'utilisateur décoche, pour qu'un élément qui apparaît ensuite
  // (autre destination, activités différentes) reste coché par défaut lui aussi.
  const [deselected, setDeselected] = useState<Record<string, boolean>>({});
  const selected = (key: string) => !deselected[key];

  const toggle = (key: string) =>
    setDeselected(prev => ({ ...prev, [key]: !prev[key] }));

  const resetToAivana = () => setDeselected({});

  const selectedItems = items.filter(i => selected(i.key));
  const selectedTotal = selectedItems.reduce((sum, i) => sum + (i.amount || 0), 0);
  const isAivanaSelection = items.length > 0 && selectedItems.length === items.length;

  const handleSaveTrip = async () => {
    try {
      setSaving(true);
      const tripRes = await axios.post("/api/trips", {
        title: `Voyage : ${dest.name}`,
        destination_name: dest.name,
        country: dest.country,
        start_date: dest.depart_date,
        end_date: dest.return_date,
      });

      const tripId = tripRes.data.id;

      for (const item of selectedItems) {
        await axios.post(`/api/trips/${tripId}/items`, {
          type: item.type,
          title: item.title,
          price_estimate: item.amount ?? undefined,
          external_url: item.external_url,
          metadata: item.metadata,
        });
      }

      setSaved(true);
      setTimeout(() => {
        onClose();
        router.push(`/dashboard?trip=${tripId}`);
      }, 1500);

    } catch (err: any) {
      if (err?.response?.status === 401) {
        alert("Vous devez être connecté pour enregistrer ce voyage.");
      } else {
        alert("Erreur lors de la sauvegarde.");
      }
    } finally {
      setSaving(false);
    }
  };

  const SelectToggle = ({ item }: { item: ProposalItem }) => {
    const isOn = selected(item.key);
    return (
      <button
        type="button"
        onClick={() => toggle(item.key)}
        aria-pressed={isOn}
        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-2.5 rounded-xl border transition-colors shrink-0 ${isOn
          ? "bg-gold/15 border-gold/40 text-gold"
          : "bg-white/5 border-white/10 text-white/40 hover:text-white/70"
          }`}
      >
        <span className={`w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 ${isOn ? "bg-gold border-gold" : "border-white/25"
          }`}>
          {isOn && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
        </span>
        {isOn ? "Ajouté" : "Ajouter"}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#06080C]/90 backdrop-blur-xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-5xl max-h-[90vh] bg-[#0A0D14] rounded-[32px] sm:rounded-[40px] border border-gold/20 shadow-[0_0_100px_rgba(184,134,11,0.15)] flex flex-col overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-y-auto overflow-x-hidden scroolbar-hide relative">

          <div className="relative h-[25vh] min-h-[180px] w-full shrink-0">
            <img
              src={heroImg}
              alt={dest.name}
              onError={withAivanaFallback}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D14]/80 via-transparent to-transparent" />

            <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-3 backdrop-blur-md">
                <Sparkles className="w-3 h-3" /> Proposition IA AIVANA
              </div>
              <h1 className="text-3xl md:text-5xl font-serif text-white mb-2">
                {dest.name} <span className="text-2xl md:text-4xl">{dest.emoji}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/70 text-xs md:text-sm font-medium">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gold" /> {dest.country}</span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gold" /> {nights} nuits · {adults} pers.
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">

            {dest.dataSource !== "real" && (
              <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-white/[0.02] border border-white/10 text-white/50 text-xs">
                <AlertCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                Les prix réels n&apos;ont pas pu être récupérés à l&apos;instant pour cette destination — aucun chiffre n&apos;est inventé, donc le vol et l&apos;hébergement ne sont pas proposés à l&apos;ajout. Réessaie dans un instant, ou compare directement via les liens ci-dessous.
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">

              <div className="space-y-8">
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Plane className="w-5 h-5 text-blue-400 -rotate-45" />
                    </div>
                    <h3 className="text-2xl font-serif text-white">Vol aller-retour</h3>
                  </div>

                  <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                        {adults} personne{adults > 1 ? "s" : ""} · aller-retour
                        {departLabel && returnLabel && ` · ${departLabel} → ${returnLabel}`}
                      </p>
                      {dest.flight_price !== null ? (
                        <p className="text-blue-400 font-bold text-xl">{dest.flight_price.toLocaleString("fr-FR")} €</p>
                      ) : (
                        <p className="text-white/40 text-sm italic">Prix indisponible à l&apos;instant</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {dest.flight_price !== null && <SelectToggle item={items.find(i => i.key === "flight")!} />}
                      <a href={dest.flights_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-colors shrink-0">
                        Comparer <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                      <Hotel className="w-5 h-5 text-gold" />
                    </div>
                    <h3 className="text-2xl font-serif text-white">Hébergement</h3>
                  </div>

                  <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                        {nights} nuits · {adults} pers.
                        {departLabel && returnLabel && ` · ${departLabel} → ${returnLabel}`}
                      </p>
                      {hotelTotal !== null ? (
                        <>
                          <p className="text-gold font-bold text-xl">{hotelTotal.toLocaleString("fr-FR")} €</p>
                          <p className="text-[10px] text-white/30 mt-1">
                            {dest.hotel_price_per_night?.toLocaleString("fr-FR")} € / nuit × {nights} nuits
                          </p>
                        </>
                      ) : (
                        <p className="text-white/40 text-sm italic">Prix indisponible à l&apos;instant</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {hotelTotal !== null && <SelectToggle item={items.find(i => i.key === "hotel")!} />}
                      <a href={dest.booking_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-colors shrink-0">
                        Comparer <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/30 mt-2">
                    Prix les moins chers trouvés en direct pour ces dates — montants exacts à confirmer sur les sites de réservation.
                  </p>
                </section>
              </div>

              <div className="space-y-8">
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Compass className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-serif text-white">Expériences Incontournables</h3>
                  </div>

                  <div className="space-y-3">
                    {dest.activities.length > 0 ? items.filter(i => i.type === "activity").map((item) => (
                      <div key={item.key} className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-white text-sm font-medium truncate">{item.title}</h4>
                          <p className="text-[10px] text-white/30 mt-1">
                            {item.amount !== null ? `${item.amount} €` : "Prix non communiqué"} · Via OpenTripMap
                          </p>
                        </div>
                        <SelectToggle item={item} />
                      </div>
                    )) : (
                      <p className="text-white/40 text-sm italic">Aucune activité réelle disponible pour cette destination à l&apos;instant.</p>
                    )}
                  </div>
                </section>

                <div className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 rounded-3xl p-6 relative overflow-hidden mt-auto">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gold/10 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none" />

                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-gold/80 text-[10px] font-bold uppercase tracking-widest">
                      Total de votre sélection
                    </p>
                    {isAivanaSelection ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-gold/80 bg-gold/10 border border-gold/25 px-2 py-1 rounded-full shrink-0">
                        <Sparkles className="w-2.5 h-2.5" /> Sélection AIVANA
                      </span>
                    ) : (
                      <button onClick={resetToAivana}
                        className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-gold transition-colors shrink-0">
                        Rétablir la sélection AIVANA
                      </button>
                    )}
                  </div>

                  <div className="flex items-end gap-2 mb-2">
                    {items.length > 0 ? (
                      <>
                        <span className="text-4xl font-serif text-white leading-none">{selectedTotal.toLocaleString("fr-FR")}</span>
                        <span className="text-lg text-gold font-bold mb-1">€</span>
                        <span className="text-white/40 text-[10px] mb-1.5">/ {adults} pers.</span>
                      </>
                    ) : (
                      <span className="text-lg text-white/40 italic">Estimation indisponible à l&apos;instant</span>
                    )}
                  </div>

                  <p className="text-white/35 text-[10px] mb-6">
                    {selectedItems.length} élément{selectedItems.length > 1 ? "s" : ""} sélectionné{selectedItems.length > 1 ? "s" : ""} sur {items.length} proposé{items.length > 1 ? "s" : ""}
                    {selectedItems.some(i => i.amount === null) && " · certains sans prix communiqué"}
                  </p>

                  <button
                    onClick={handleSaveTrip}
                    disabled={saving || saved}
                    className="w-full bg-gold hover:bg-yellow-400 disabled:opacity-60 text-black py-3 rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> :
                      saved ? <><Check className="w-5 h-5" /> Voyage créé</> :
                        <><Sparkles className="w-5 h-5" /> {selectedItems.length > 0
                          ? `Ajouter la sélection (${selectedItems.length})`
                          : "Créer le voyage seul"}</>}
                  </button>
                  <p className="text-center text-white/30 text-[10px] mt-4 uppercase tracking-wider">
                    Modifiable à tout moment dans le dashboard
                  </p>
                </div>

              </div>

            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
