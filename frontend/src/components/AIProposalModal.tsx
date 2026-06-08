"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plane, Hotel, Compass, Calendar, Check, ArrowRight, Loader2, Sparkles, MapPin, Star } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

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
  
  // États de sélection (pour choisir parmi les "plusieurs choix")
  const [selectedFlight, setSelectedFlight] = useState(0);
  const [selectedHotel, setSelectedHotel] = useState(0);

  // Génération d'options simulées pour donner du choix à l'utilisateur
  const basePrice = dest.price_estimate || 800;
  
  const flightOptions = [
    { id: 0, type: "Vol Direct", airline: "Air France", price: Math.round(basePrice * 0.4), duration: "2h 15m", time: "10:30 - 12:45" },
    { id: 1, type: "Économique (1 escale)", airline: "Lufthansa", price: Math.round(basePrice * 0.25), duration: "4h 30m", time: "06:15 - 10:45" },
  ];

  const hotelOptions = [
    { id: 0, name: `Palace ${dest.name}`, type: "Luxe 5★", pricePerNight: Math.round(basePrice * 0.6 / 7), image: "https://images.unsplash.com/photo-1542314831-c6a4d14d8373?w=800&q=80" },
    { id: 1, name: "Boutique Hôtel Central", type: "Charme 4★", pricePerNight: Math.round(basePrice * 0.35 / 7), image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80" },
  ];

  const handleSaveTrip = async () => {
    try {
      setSaving(true);
      // 1. Créer le voyage
      const tripRes = await axios.post("/api/trips", {
        title: `Aventure à ${dest.name}`,
        destination_name: dest.name,
        country: dest.country,
        start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      
      const tripId = tripRes.data.id;

      // 2. Ajouter les items sélectionnés
      const flight = flightOptions[selectedFlight];
      await axios.post(`/api/trips/${tripId}/items`, {
        type: 'flight', title: `Vol ${flight.airline} (${flight.type})`, price_estimate: flight.price, external_url: dest.flights_url
      });

      const hotel = hotelOptions[selectedHotel];
      await axios.post(`/api/trips/${tripId}/items`, {
        type: 'hotel', title: hotel.name, price_estimate: hotel.pricePerNight * 7, external_url: dest.booking_url
      });

      // Ajouter quelques activités
      for (const act of dest.activities.slice(0, 3)) {
        await axios.post(`/api/trips/${tripId}/items`, {
          type: 'activity', title: `${act.emoji} ${act.name}`, price_estimate: act.price || 0
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

  const totalPrice = flightOptions[selectedFlight].price + (hotelOptions[selectedHotel].pricePerNight * 7) + dest.activities.slice(0,3).reduce((s,a) => s + (a.price || 0), 0);

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
        className="relative w-full max-w-6xl max-h-full bg-[#0A0D14] rounded-[32px] sm:rounded-[40px] border border-gold/20 shadow-[0_0_100px_rgba(184,134,11,0.15)] flex flex-col overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-6 right-6 z-50 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-y-auto overflow-x-hidden scroolbar-hide relative">
          
          {/* HERO HEADER */}
          <div className="relative h-[35vh] min-h-[300px] w-full shrink-0">
            {/* L'image est générée via Unsplash Source en utilisant le nom de la destination */}
            <img 
              src={`https://source.unsplash.com/1600x900/?${encodeURIComponent(dest.name + " " + dest.country + " travel")}`} 
              alt={dest.name} 
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=80" }} // fallback
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D14]/80 via-transparent to-transparent" />
            
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-bold uppercase tracking-[0.2em] mb-4 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" /> IA AIVANA Proposal
              </div>
              <h1 className="text-5xl md:text-7xl font-serif text-white mb-2">
                {dest.name} <span className="text-3xl md:text-5xl">{dest.emoji}</span>
              </h1>
              <div className="flex items-center gap-4 text-white/70 text-sm md:text-base font-medium">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gold" /> {dest.country}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gold" /> 7 jours suggérés</span>
              </div>
            </div>
          </div>

          {/* CONTENU PROPOSITION */}
          <div className="p-8 md:p-12 space-y-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* COLONNE GAUCHE : Vols & Hôtels */}
              <div className="space-y-10">
                {/* Section Vols */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Plane className="w-5 h-5 text-blue-400 -rotate-45" />
                    </div>
                    <h3 className="text-2xl font-serif text-white">Options de Vols</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {flightOptions.map(opt => (
                      <div 
                        key={opt.id} 
                        onClick={() => setSelectedFlight(opt.id)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all ${selectedFlight === opt.id ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/[0.02] border-white/10 hover:border-white/30'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">{opt.airline}</span>
                            <h4 className="text-white font-medium text-lg">{opt.type}</h4>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedFlight === opt.id ? 'bg-blue-500 border-blue-500' : 'border-white/30'}`}>
                            {selectedFlight === opt.id && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 text-sm">
                          <span className="text-white/60">{opt.time} • {opt.duration}</span>
                          <span className="text-blue-400 font-bold">{opt.price} €</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Section Hôtels */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                      <Hotel className="w-5 h-5 text-gold" />
                    </div>
                    <h3 className="text-2xl font-serif text-white">Hébergements suggérés</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {hotelOptions.map(opt => (
                      <div 
                        key={opt.id} 
                        onClick={() => setSelectedHotel(opt.id)}
                        className={`relative rounded-2xl border cursor-pointer transition-all overflow-hidden h-48 ${selectedHotel === opt.id ? 'border-gold ring-2 ring-gold/30' : 'border-white/10 hover:border-white/30'}`}
                      >
                        <img src={opt.image} className="absolute inset-0 w-full h-full object-cover" alt={opt.name} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        
                        <div className="absolute top-3 right-3">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedHotel === opt.id ? 'bg-gold border-gold' : 'border-white/50 bg-black/20'}`}>
                            {selectedHotel === opt.id && <Check className="w-3 h-3 text-black" />}
                          </div>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4">
                          <span className="text-[9px] bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-white/80 uppercase tracking-wider border border-white/10 mb-2 inline-block">
                            {opt.type}
                          </span>
                          <h4 className="text-white font-serif text-lg leading-tight mb-1">{opt.name}</h4>
                          <span className="text-gold font-bold text-sm">{opt.pricePerNight} € <span className="text-white/40 text-xs font-normal">/nuit</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* COLONNE DROITE : Activités & Résumé */}
              <div className="space-y-10">
                <section>
                  <div className="flex items-center gap-3 mb-6">
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
                            <div className="flex text-gold/60 mt-1">
                              <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
                            </div>
                          </div>
                        </div>
                        <div className="text-emerald-400 font-medium text-sm whitespace-nowrap">
                          {act.price ? `${act.price} €` : 'Inclus'}
                        </div>
                      </div>
                    )) : (
                      <p className="text-white/40 text-sm italic">L'IA prépare actuellement une liste d'activités secrètes pour vous.</p>
                    )}
                  </div>
                </section>

                {/* Bloc Total */}
                <div className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 rounded-3xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none" />
                  <p className="text-gold/80 text-xs font-bold uppercase tracking-widest mb-2">Estimation sur mesure</p>
                  <div className="flex items-end gap-3 mb-8">
                    <span className="text-5xl font-serif text-white leading-none">{totalPrice.toLocaleString("fr-FR")}</span>
                    <span className="text-xl text-gold font-bold mb-1">€</span>
                    <span className="text-white/40 text-xs mb-2">/pers.</span>
                  </div>

                  <button 
                    onClick={handleSaveTrip}
                    disabled={saving || saved}
                    className="w-full bg-gold hover:bg-yellow-400 text-black py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                     saved ? <><Check className="w-5 h-5" /> Voyage généré</> : 
                     <><Sparkles className="w-5 h-5" /> Transformer en Dashboard</>}
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
