"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Plane, Hotel, Compass, Calendar, Check, Loader2, Sparkles, MapPin, AlertCircle, ExternalLink } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DESTINATIONS } from "@/lib/destinations";

// Reprise de l'interface du Chatbot
interface Activity { name: string; price: number | null; emoji: string; }
interface EnrichedDestination {
  name: string; country: string; emoji: string;
  dataSource: "real" | "unavailable";
  price_estimate: number | null; booking_url: string;
  flights_url: string; activities: Activity[];
}

interface Props {
  dest: EnrichedDestination;
  onClose: () => void;
}

export default function AIProposalModal({ dest, onClose }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Image réelle : on réutilise la photo du catalogue destinations si elle existe (jamais d'image générée/inventée)
  const heroImg = DESTINATIONS.find(
    d => d.name.toLowerCase() === dest.name.toLowerCase()
  )?.img || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=80";

  // Répartition indicative de l'estimation réelle (vol + hôtel / 2 pers., 7 nuits) — jamais de prix inventés :
  // si aucune donnée réelle n'est disponible, on l'affiche clairement plutôt que d'afficher un chiffre fictif.
  const hasRealEstimate = dest.dataSource === "real" && dest.price_estimate !== null;
  const flightShare = hasRealEstimate ? Math.round(dest.price_estimate! * 0.4) : null;
  const hotelShare = hasRealEstimate ? Math.round(dest.price_estimate! * 0.6) : null;
  const activitiesTotal = dest.activities.reduce((s, a) => s + (a.price || 0), 0);
  const totalPrice = hasRealEstimate ? dest.price_estimate! + activitiesTotal : null;

  const handleSaveTrip = async () => {
    try {
      setSaving(true);
      // 1. Créer le voyage
      const tripRes = await axios.post("/api/trips", {
        title: `Voyage : ${dest.name}`,
        destination_name: dest.name,
        country: dest.country,
        start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });

      const tripId = tripRes.data.id;

      // 2. Ajouter vol + hôtel à partir des VRAIES données groundées (prix réels Amadeus, ou rien si indisponible)
      await axios.post(`/api/trips/${tripId}/items`, {
        type: 'flight',
        title: `Vol aller-retour vers ${dest.name}`,
        price_estimate: flightShare ?? undefined,
        external_url: dest.flights_url,
      });

      await axios.post(`/api/trips/${tripId}/items`, {
        type: 'hotel',
        title: `Hébergement à ${dest.name}`,
        price_estimate: hotelShare ?? undefined,
        external_url: dest.booking_url,
      });

      // 3. Ajouter les activités réelles (OpenTripMap) — on garde le prix `null` tel quel quand il est inconnu
      for (const act of dest.activities.slice(0, 3)) {
        await axios.post(`/api/trips/${tripId}/items`, {
          type: 'activity',
          title: `${act.emoji} ${act.name}`,
          price_estimate: act.price ?? undefined,
        });
      }

      setSaved(true);
      setTimeout(() => {
        onClose();
        router.push("/dashboard");
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
          
          {/* HERO HEADER */}
          <div className="relative h-[25vh] min-h-[180px] w-full shrink-0">
            <img
              src={heroImg}
              alt={dest.name}
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
              <div className="flex items-center gap-4 text-white/70 text-xs md:text-sm font-medium">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gold" /> {dest.country}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gold" /> 7 jours suggérés</span>
              </div>
            </div>
          </div>

          {/* CONTENU PROPOSITION */}
          <div className="p-6 md:p-8 space-y-8">

            {!hasRealEstimate && (
              <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/[0.02] border border-white/10 text-white/50 text-xs">
                <AlertCircle className="w-4 h-4 text-gold shrink-0" />
                Les prix réels n'ont pas pu être récupérés à l'instant pour cette destination — pas de chiffre inventé. Réessaie dans un instant pour une estimation chiffrée.
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">

              {/* COLONNE GAUCHE : Vol & Hôtel (données réelles groundées) */}
              <div className="space-y-8">
                {/* Vol */}
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Plane className="w-5 h-5 text-blue-400 -rotate-45" />
                    </div>
                    <h3 className="text-2xl font-serif text-white">Vol aller-retour</h3>
                  </div>

                  <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">2 personnes · aller-retour</p>
                      {flightShare !== null ? (
                        <p className="text-blue-400 font-bold text-xl">~{flightShare.toLocaleString("fr-FR")} €</p>
                      ) : (
                        <p className="text-white/40 text-sm italic">Prix indisponible à l'instant</p>
                      )}
                    </div>
                    <a href={dest.flights_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-colors shrink-0">
                      Comparer <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </section>

                {/* Hôtel */}
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                      <Hotel className="w-5 h-5 text-gold" />
                    </div>
                    <h3 className="text-2xl font-serif text-white">Hébergement</h3>
                  </div>

                  <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">7 nuits · 2 personnes</p>
                      {hotelShare !== null ? (
                        <p className="text-gold font-bold text-xl">~{hotelShare.toLocaleString("fr-FR")} €</p>
                      ) : (
                        <p className="text-white/40 text-sm italic">Prix indisponible à l'instant</p>
                      )}
                    </div>
                    <a href={dest.booking_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-colors shrink-0">
                      Comparer <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[10px] text-white/30 mt-2">
                    Répartition indicative de l'estimation réelle vol + hôtel ({dest.price_estimate?.toLocaleString("fr-FR")} € au total) — montants exacts à confirmer sur les sites de réservation.
                  </p>
                </section>
              </div>

              {/* COLONNE DROITE : Activités & Résumé */}
              <div className="space-y-8">
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Compass className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-serif text-white">Expériences Incontournables</h3>
                  </div>

                  <div className="space-y-3">
                    {dest.activities.length > 0 ? dest.activities.slice(0,4).map((act, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{act.emoji}</div>
                          <div>
                            <h4 className="text-white text-sm font-medium">{act.name}</h4>
                            <p className="text-[10px] text-white/30 mt-1">Lieu réel (OpenTripMap)</p>
                          </div>
                        </div>
                        <div className="text-emerald-400 font-medium text-sm whitespace-nowrap">
                          {act.price !== null ? `${act.price} €` : 'Prix non communiqué'}
                        </div>
                      </div>
                    )) : (
                      <p className="text-white/40 text-sm italic">Aucune activité réelle disponible pour cette destination à l'instant.</p>
                    )}
                  </div>
                </section>

                {/* Bloc Total */}
                <div className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 rounded-3xl p-6 relative overflow-hidden mt-auto">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gold/10 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none" />
                  <p className="text-gold/80 text-[10px] font-bold uppercase tracking-widest mb-2">Estimation réelle (vol + hôtel + activités)</p>
                  <div className="flex items-end gap-2 mb-6">
                    {totalPrice !== null ? (
                      <>
                        <span className="text-4xl font-serif text-white leading-none">{totalPrice.toLocaleString("fr-FR")}</span>
                        <span className="text-lg text-gold font-bold mb-1">€</span>
                        <span className="text-white/40 text-[10px] mb-1.5">/ 2 pers.</span>
                      </>
                    ) : (
                      <span className="text-lg text-white/40 italic">Estimation indisponible à l'instant</span>
                    )}
                  </div>

                  <button
                    onClick={handleSaveTrip}
                    disabled={saving || saved}
                    className="w-full bg-gold hover:bg-yellow-400 text-black py-3 rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> :
                     saved ? <><Check className="w-5 h-5" /> Voyage créé</> :
                     <><Sparkles className="w-5 h-5" /> Ajouter ce voyage à mon dashboard</>}
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
