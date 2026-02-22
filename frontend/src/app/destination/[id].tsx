"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Plane, Hotel, Coins, Smartphone, Car, CheckCircle2 } from "lucide-react";

export default function DestinationDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3002/api/destinations/${id}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <div className="flex justify-center p-20 text-dark">Chargement de votre voyage...</div>;
  if (!data) return <div className="text-center p-20">Annonce introuvable.</div>;

  return (
    <div className="min-h-screen bg-sand-50 text-dark font-sans">
      {/* HERO SECTION - Style identique aux cartes */}
      <div className="relative h-[40vh] w-full overflow-hidden">
        <img src={data.img || data.image} alt={data.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-sand-50 to-transparent" />
        <div className="absolute bottom-8 left-8">
          <p className="text-emerald-700 font-bold uppercase tracking-widest text-sm mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> {data.country}
          </p>
          <h1 className="font-serif text-5xl text-dark leading-tight">{data.name}</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE : LE BUDGET (Design "Card" doré) */}
        <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-[#FFD700]">
          <h2 className="font-serif text-xl mb-6 flex items-center gap-2 border-b border-sand-100 pb-2">
             Estimation Budget
          </h2>
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-dark-400 flex items-center gap-2 text-sm"><Plane className="w-4 h-4" /> Vol / pers</span>
              <span className="font-bold">{data.flightFrom || '250'}€</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-dark-400 flex items-center gap-2 text-sm"><Hotel className="w-4 h-4" /> Hôtel / nuit</span>
              <span className="font-bold">{data.hotelPerNight || '85'}€</span>
            </div>
            <div className="bg-sand-50 p-4 rounded-xl mt-4">
              <p className="text-[10px] text-dark-300 uppercase font-bold mb-1 text-center">Budget Total Estimé</p>
              <p className="text-2xl font-bold text-center text-dark">
                {data.tripBudget?.min.toLocaleString() || data.budget_total}€ — {data.tripBudget?.max.toLocaleString()}€
              </p>
            </div>
          </div>
        </div>

        {/* COLONNE CENTRALE : LOGISTIQUE & IA */}
        <div className="lg:col-span-2 space-y-8">
          {/* INFOS PRATIQUES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-sand-100">
              <Coins className="text-yellow-600 w-5 h-5 mb-2" />
              <p className="text-[10px] text-dark-300 uppercase font-bold">Monnaie</p>
              <p className="font-semibold text-sm">{data.currency_info || '1 EUR = 1.08 USD'}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-sand-100">
              <Smartphone className="text-blue-600 w-5 h-5 mb-2" />
              <p className="text-[10px] text-dark-300 uppercase font-bold">Forfait Mobile</p>
              <p className="font-semibold text-sm">{data.mobile_plan || 'eSIM locale (15€)'}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-sand-100">
              <Car className="text-emerald-600 w-5 h-5 mb-2" />
              <p className="text-[10px] text-dark-300 uppercase font-bold">Location</p>
              <p className="font-semibold text-sm">{data.car_rental || 'Dès 35€/jour'}</p>
            </div>
          </div>

          {/* ACTIVITÉS DÉTAILLÉES */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-sand-100">
            <h2 className="font-serif text-2xl mb-6 italic">Les indispensables à {data.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data.highlights || ["Musées", "Plages", "Restaurants"]).map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-sand-50 rounded-lg text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-dark-300 text-xs italic">
            Données générées et vérifiées par le moteur O-Flyes AI
          </p>
        </div>
      </div>
    </div>
  );
}