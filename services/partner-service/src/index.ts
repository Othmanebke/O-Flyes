import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.PARTNER_PORT || 3008;

app.get("/", (req, res) => res.send("AIVANA Partner Service is running."));

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok", service: "partner-service" }));

// ── Expanded Mock Data ─────────────────────────────────────────────────────

import { MOCK_LOCATIONS } from "./data/locations";

const MOCK_ACTIVITIES = [
    // --- MARRAKECH ---
    {
        id: "act-1", title: "Visite guidée du Jardin Majorelle", city: "Marrakech", country: "Maroc",
        price: 15, currency: "EUR", rating: 4.8, reviews: 1250,
        image_url: "https://images.unsplash.com/photo-1590001158193-7904d1efdf75?auto=format&fit=crop&w=800&q=80",
        description: "Découvrez l'oasis bleue d'Yves Saint Laurent au cœur de Marrakech.",
        booking_url: "https://www.getyourguide.fr/marrakech-l208/jardin-majorelle-balade-de-2-heures-t402633/"
    },
    {
        id: "act-2", title: "Balade à dos de chameau dans la Palmeraie", city: "Marrakech", country: "Maroc",
        price: 25, currency: "EUR", rating: 4.5, reviews: 850,
        image_url: "https://images.unsplash.com/photo-1542385151-efd9000782a6?auto=format&fit=crop&w=800&q=80",
        description: "Une expérience inoubliable au coucher du soleil dans les palmiers.",
        booking_url: "https://www.getyourguide.fr/marrakech-l208/marrakech-balade-a-dos-de-chameau-dans-la-palmeraie-t141753/"
    },
    {
        id: "act-3", title: "Canyon et Cascades d'Ouzoud", city: "Marrakech", country: "Maroc",
        price: 35, currency: "EUR", rating: 4.9, reviews: 2100,
        image_url: "https://images.unsplash.com/photo-1580637136009-548773950664?auto=format&fit=crop&w=800&q=80",
        description: "Admirez les plus hautes chutes d'eau d'Afrique du Nord.",
        booking_url: "https://www.getyourguide.fr/marrakech-l208/excursion-d-une-journee-aux-cascades-d-ouzoud-t32805/"
    },

    // --- PARIS ---
    {
        id: "act-par-1", title: "Billet coupe-file: Musée du Louvre", city: "Paris", country: "France",
        price: 22, currency: "EUR", rating: 4.6, reviews: 15300,
        image_url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
        description: "Accès prioritaire pour admirer la Joconde et des chefs-d'œuvre mondiaux.",
        booking_url: "https://www.getyourguide.fr/paris-l16/louvre-museum-skip-the-line-ticket-t51071/"
    },
    {
        id: "act-par-2", title: "Croisière en bateau sur la Seine", city: "Paris", country: "France",
        price: 18, currency: "EUR", rating: 4.7, reviews: 8900,
        image_url: "https://images.unsplash.com/photo-1502602898657-3e90760086eb?auto=format&fit=crop&w=800&q=80",
        description: "Découvrez les monuments illuminés de Paris depuis l'eau.",
        booking_url: "https://www.getyourguide.fr/paris-l16/seine-river-sightseeing-cruise-t966/"
    },
    {
        id: "act-par-3", title: "Sommet de la Tour Eiffel (Accès ascenseur)", city: "Paris", country: "France",
        price: 35, currency: "EUR", rating: 4.8, reviews: 22000,
        image_url: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80",
        description: "Vue panoramique à 360° depuis le point le plus haut de Paris.",
        booking_url: "https://www.getyourguide.fr/paris-l16/eiffel-tower-summit-access-t39414/"
    },

    // --- TOKYO ---
    {
        id: "act-tok-1", title: "teamLab Planets TOKYO : Billets", city: "Tokyo", country: "Japon",
        price: 28, currency: "EUR", rating: 4.9, reviews: 9200,
        image_url: "https://images.unsplash.com/photo-1552591605-64d1f27116b0?auto=format&fit=crop&w=800&q=80",
        description: "Un musée numérique immersif où l'on marche dans l'eau.",
        booking_url: "https://www.getyourguide.fr/tokyo-l193/teamlab-planets-tokyo-ticket-t227690/"
    },
    {
        id: "act-tok-2", title: "Visite guidée culinaire à Shinjuku", city: "Tokyo", country: "Japon",
        price: 95, currency: "EUR", rating: 4.8, reviews: 1450,
        image_url: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80",
        description: "Dégustez la vraie street-food japonaise dans les ruelles secrètes Omoide Yokocho.",
        booking_url: "https://www.getyourguide.fr/tokyo-l193/tokyo-shinjuku-food-tour-t172106/"
    },

    // --- NEW YORK ---
    {
        id: "act-ny-1", title: "Vol en Hélicoptère au-dessus de Manhattan", city: "New York", country: "États-Unis",
        price: 240, currency: "EUR", rating: 4.9, reviews: 3100,
        image_url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
        description: "Vue aérienne spectaculaire de la Statue de la Liberté et de Central Park.",
        booking_url: "https://www.getyourguide.fr/new-york-l59/new-york-helicopter-tour-t3794/"
    },
    {
        id: "act-ny-2", title: "Billet The Edge Observation Deck", city: "New York", country: "États-Unis",
        price: 42, currency: "EUR", rating: 4.7, reviews: 5400,
        image_url: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80",
        description: "Montez sur le plus haut pont d'observation extérieur de l'hémisphère ouest.",
        booking_url: "https://www.getyourguide.fr/new-york-l59/edge-observation-deck-t334645/"
    },

    // --- ROME ---
    {
        id: "act-rom-1", title: "Colisée, Forum Romain et Mont Palatin", city: "Rome", country: "Italie",
        price: 26, currency: "EUR", rating: 4.7, reviews: 18000,
        image_url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
        description: "Explorez le cœur antique de l'Empire romain sans faire la queue.",
        booking_url: "https://www.getyourguide.fr/rome-l33/colosseum-roman-forum-palatine-hill-priority-ticket-t121512/"
    },
    {
        id: "act-rom-2", title: "Cours de Pâtes et Tiramisu authentique", city: "Rome", country: "Italie",
        price: 65, currency: "EUR", rating: 4.9, reviews: 3200,
        image_url: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80",
        description: "Apprenez les secrets culinaires italiens avec un chef local.",
        booking_url: "https://www.getyourguide.fr/rome-l33/pasta-making-tiramisu-class-with-dinner-t164966/"
    },

    // --- BALI ---
    {
        id: "act-bal-1", title: "Mont Batur : Trekking au lever du soleil", city: "Bali", country: "Indonésie",
        price: 45, currency: "EUR", rating: 4.8, reviews: 6700,
        image_url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
        description: "Escaladez un volcan actif pour assister à un lever de soleil inoubliable.",
        booking_url: "https://www.getyourguide.fr/bali-l349/mount-batur-sunrise-trek-with-breakfast-t140958/"
    },
    {
        id: "act-bal-2", title: "Ubud : Forêt des Singes, Rizière, Temples", city: "Bali", country: "Indonésie",
        price: 55, currency: "EUR", rating: 4.9, reviews: 8900,
        image_url: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80",
        description: "Circuit privé complet des incontournables spirituels et naturels d'Ubud.",
        booking_url: "https://www.getyourguide.fr/bali-l349/ubud-monkey-forest-jungle-swing-waterfall-tour-t142502/"
    }
];

const MOCK_HOTELS = [
    {
        id: "hotel-1", name: "La Mamounia Marrakech", city: "Marrakech", country: "Maroc",
        price_per_night: 650, currency: "EUR", rating: 4.9, stars: 5,
        image_url: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80",
        description: "Un palace légendaire au cœur de la ville ocre, alliant luxe et tradition.",
        booking_url: "https://www.booking.com/hotel/ma/la-mamounia.fr.html"
    },
    {
        id: "hotel-par", name: "Ritz Paris", city: "Paris", country: "France",
        price_per_night: 1350, currency: "EUR", rating: 4.9, stars: 5,
        image_url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
        description: "L'iconique hôtel de luxe sur la Place Vendôme.",
        booking_url: "https://www.booking.com/hotel/fr/ritz-paris.html"
    },
    {
        id: "hotel-tok", name: "Aman Tokyo", city: "Tokyo", country: "Japon",
        price_per_night: 950, currency: "EUR", rating: 4.8, stars: 5,
        image_url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
        description: "Un sanctuaire au-dessus de la ville, un mariage de design moderne et de tradition.",
        booking_url: "https://www.booking.com/hotel/jp/aman-tokyo.html"
    }
];

const MOCK_FLIGHTS = [
    {
        id: "flt-1", airline: "Air France", origin: "Paris (CDG)", destination: "Marrakech (RAK)",
        departure: "2024-05-15T10:30:00", arrival: "2024-05-15T13:45:00", price: 185, currency: "EUR",
        type: "Direct", booking_url: "https://www.airfrance.fr/search-flights?from=CDG&to=RAK&date=2024-05-15"
    }
];

// ── Endpoints ────────────────────────────────────────────────────────────────

app.get("/locations/suggest", (req, res) => {
    const { q } = req.query;
    if (!q || typeof q !== "string" || q.length < 2) {
        return res.json([]);
    }

    const query = q.toLowerCase();
    const suggestions = MOCK_LOCATIONS.filter(loc =>
        loc.city.toLowerCase().includes(query) ||
        loc.country.toLowerCase().includes(query)
    );

    res.json(suggestions);
});

app.get("/activities/search", (req, res) => {
    const { city } = req.query;
    console.log(`[partner-service] Searching activities for city: ${city}`);

    if (!city) {
        return res.json(MOCK_ACTIVITIES);
    }

    const results = MOCK_ACTIVITIES.filter(a =>
        a.city.toLowerCase() === (city as string).toLowerCase()
    );

    res.json(results);
});

app.get("/hotels/search", (req, res) => {
    const { city } = req.query;
    console.log(`[partner-service] Searching hotels for city: ${city}`);

    if (!city) {
        return res.json(MOCK_HOTELS);
    }

    const results = MOCK_HOTELS.filter(h =>
        h.city.toLowerCase() === (city as string).toLowerCase()
    );

    res.json(results);
});

app.get("/flights/search", (req, res) => {
    const { origin, destination } = req.query;
    console.log(`[partner-service] Searching flights from ${origin} to ${destination}`);

    // For MVP, we'll return all mock flights if destination matches or all if no query
    if (!destination) {
        return res.json(MOCK_FLIGHTS);
    }

    const results = MOCK_FLIGHTS.filter(f =>
        f.destination.toLowerCase().includes((destination as string).toLowerCase())
    );

    res.json(results);
});

app.listen(PORT, () => console.log(`[partner-service] running on port ${PORT}`));
