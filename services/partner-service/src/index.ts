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

// ── Mock Activities Data ─────────────────────────────────────────────────────
const MOCK_ACTIVITIES = [
    {
        id: "act-1",
        title: "Visite guidée du Jardin Majorelle",
        city: "Marrakech",
        country: "Maroc",
        price: 15,
        currency: "EUR",
        rating: 4.8,
        reviews: 1250,
        image_url: "https://images.unsplash.com/photo-1590001158193-7904d1efdf75?auto=format&fit=crop&w=800&q=80",
        description: "Découvrez l'oasis bleue d'Yves Saint Laurent au cœur de Marrakech.",
        booking_url: "https://www.getyourguide.fr/marrakech-l208/jardin-majorelle-balade-de-2-heures-t402633/"
    },
    {
        id: "act-2",
        title: "Balade à dos de chameau dans la Palmeraie",
        city: "Marrakech",
        country: "Maroc",
        price: 25,
        currency: "EUR",
        rating: 4.5,
        reviews: 850,
        image_url: "https://images.unsplash.com/photo-1542385151-efd9000782a6?auto=format&fit=crop&w=800&q=80",
        description: "Une expérience inoubliable au coucher du soleil dans les palmiers.",
        booking_url: "https://www.getyourguide.fr/marrakech-l208/marrakech-balade-a-dos-de-chameau-dans-la-palmeraie-t141753/"
    },
    {
        id: "act-3",
        title: "Excursion d'une journée aux Cascades d'Ouzoud",
        city: "Marrakech",
        country: "Maroc",
        price: 35,
        currency: "EUR",
        rating: 4.9,
        reviews: 2100,
        image_url: "https://images.unsplash.com/photo-1580637136009-548773950664?auto=format&fit=crop&w=800&q=80",
        description: "Admirez les plus hautes chutes d'eau d'Afrique du Nord.",
        booking_url: "https://www.getyourguide.fr/marrakech-l208/excursion-d-une-journee-aux-cascades-d-ouzoud-t32805/"
    },
    {
        id: "act-4",
        title: "Cours de cuisine marocaine traditionnelle",
        city: "Marrakech",
        country: "Maroc",
        price: 45,
        currency: "EUR",
        rating: 4.7,
        reviews: 420,
        image_url: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
        description: "Apprenez à cuisiner un vrai tajine dans un riad authentique.",
        booking_url: "https://www.getyourguide.fr/marrakech-l208/cours-de-cuisine-marocaine-a-marrakech-t44485/"
    }
];

const MOCK_HOTELS = [
    {
        id: "hotel-1",
        name: "La Mamounia Marrakech",
        city: "Marrakech",
        country: "Maroc",
        price_per_night: 650,
        currency: "EUR",
        rating: 4.9,
        stars: 5,
        image_url: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80",
        description: "Un palace légendaire au cœur de la ville ocre, alliant luxe et tradition.",
        booking_url: "https://www.booking.com/hotel/ma/la-mamounia.fr.html"
    },
    {
        id: "hotel-2",
        name: "Royal Mansour Marrakech",
        city: "Marrakech",
        country: "Maroc",
        price_per_night: 1200,
        currency: "EUR",
        rating: 5.0,
        stars: 5,
        image_url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
        description: "Une expérience royale unique dans des riads privés d'exception.",
        booking_url: "https://www.booking.com/hotel/ma/royal-mansour-marrakech.fr.html"
    },
    {
        id: "hotel-3",
        name: "Riad Kniza",
        city: "Marrakech",
        country: "Maroc",
        price_per_night: 220,
        currency: "EUR",
        rating: 4.8,
        stars: 4,
        image_url: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80",
        description: "Un riad de charme restauré avec passion, offrant une hospitalité marocaine authentique.",
        booking_url: "https://www.booking.com/hotel/ma/kniza.fr.html"
    }
];

const MOCK_FLIGHTS = [
    {
        id: "flt-1",
        airline: "Air France",
        origin: "Paris (CDG)",
        destination: "Marrakech (RAK)",
        departure: "2024-05-15T10:30:00",
        arrival: "2024-05-15T13:45:00",
        price: 185,
        currency: "EUR",
        type: "Direct",
        booking_url: "https://www.airfrance.fr/search-flights?from=CDG&to=RAK&date=2024-05-15"
    },
    {
        id: "flt-2",
        airline: "Royal Air Maroc",
        origin: "Paris (ORY)",
        destination: "Marrakech (RAK)",
        departure: "2024-05-15T14:20:00",
        arrival: "2024-05-15T17:35:00",
        price: 210,
        currency: "EUR",
        type: "Direct",
        booking_url: "https://www.royalairmaroc.com/fr-fr/reserver/vols#from=ORY&to=RAK&date=2024-05-15"
    },
    {
        id: "flt-3",
        airline: "EasyJet",
        origin: "Paris (CDG)",
        destination: "Marrakech (RAK)",
        departure: "2024-05-15T06:15:00",
        arrival: "2024-05-15T09:30:00",
        price: 89,
        currency: "EUR",
        type: "Direct",
        booking_url: "https://www.easyjet.com/en/cheap-flights/paris-charles-de-gaulle/marrakech"
    }
];

// ── Endpoints ────────────────────────────────────────────────────────────────

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
