import { notFound } from "next/navigation";
import type { Destination } from "../explore/page";

// Exemple de données enrichies (à remplacer par une vraie source ou API)
const DESTINATION_DETAILS: Record<string, any> = {
  "t1": {
    flight: { price: 80, company: "Air France", duration: "3h15" },
    hotel: { price: 35, name: "Riad Marrakech", rating: 4.5 },
    activities: ["Visite des souks", "Jardin Majorelle", "Balade à dos de chameau"],
    carRental: { price: 25, company: "Hertz" },
    city: "Marrakech",
    country: "Maroc",
    description: "Marrakech, cité impériale aux mille couleurs et épices. Vol depuis Paris à moins de 100€, riads abordables, souks envoûtants.",
    img: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=900&q=85"
  },
  "t2": {
    flight: { price: 60, company: "TAP Portugal", duration: "2h30" },
    hotel: { price: 90, name: "Lisbon Marriott", rating: 4.6 },
    activities: ["Tram 28", "Tour de Belém", "Dégustation de pastéis de nata"],
    carRental: { price: 30, company: "Europcar" },
    city: "Lisbonne",
    country: "Portugal",
    description: "Capitale des azulejos, du vin et du fado. Vols à partir de 60€, pastéis de nata inclus.",
    img: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=900&q=85"
  },
  "t3": {
    flight: { price: 400, company: "Garuda Indonesia", duration: "16h" },
    hotel: { price: 40, name: "Bali Villa", rating: 4.7 },
    activities: ["Surf à Kuta", "Temple Tanah Lot", "Rizières de Tegallalang"],
    carRental: { price: 20, company: "Bluebird" },
    city: "Bali",
    country: "Indonésie",
    description: "Île des dieux entre rizières, temples et surf. Vols ~400€, villas avec piscine pour 40€/nuit.",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&q=85"
  },
  // Ajoute d'autres destinations ici...
};

export default function DestinationDetail({ params }: { params: { id: string } }) {
  const d = DESTINATION_DETAILS[params.id];
  if (!d) return notFound();

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-8">
      <img src={d.img} alt={d.city} className="w-full h-64 object-cover rounded-xl mb-4" />
      <h1 className="text-2xl font-bold mb-2">{d.city}, {d.country}</h1>
      <p className="mb-4 text-dark-400">{d.description}</p>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-1">Vol</h2>
        <p>Prix : <span className="font-bold">{d.flight.price}€</span> — Compagnie : {d.flight.company} — Durée : {d.flight.duration}</p>
      </div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-1">Hôtel</h2>
        <p>Prix : <span className="font-bold">{d.hotel.price}€/nuit</span> — {d.hotel.name} — Note : {d.hotel.rating}⭐</p>
      </div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-1">Activités à faire</h2>
        <ul className="list-disc ml-6">
          {d.activities.map((a: string, i: number) => <li key={i}>{a}</li>)}
        </ul>
      </div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-1">Location de voiture</h2>
        <p>Prix : <span className="font-bold">{d.carRental.price}€/jour</span> — {d.carRental.company}</p>
      </div>
    </div>
  );
}
