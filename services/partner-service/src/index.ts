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

import { ACTIVITY_TEMPLATES } from "./data/activities_templates";

// --- Activity Generator ---
function generateActivitiesForCity(city: string, country: string) {
    return ACTIVITY_TEMPLATES.map((tpl, index) => ({
        id: `gen-${city.toLowerCase()}-${index}`,
        title: tpl.title.replace("{city}", city).replace("{country}", country),
        city: city,
        country: country,
        category: tpl.category,
        price: tpl.basePrice + Math.floor(Math.random() * 20), // Slight price variation
        currency: "EUR",
        rating: (4.5 + Math.random() * 0.5).toFixed(1),
        reviews: Math.floor(Math.random() * 500) + 50,
        image_url: tpl.imagePool[Math.floor(Math.random() * tpl.imagePool.length)],
        description: tpl.description.replace("{city}", city).replace("{country}", country),
        booking_url: "https://www.getyourguide.com"
    }));
}

const MOCK_ACTIVITIES_BASE = [
    // ... items would go here if we wanted hardcoded ones, 
    // but we'll use the generator for everything now to ensure 100% coverage
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
        return res.json(generateActivitiesForCity("Paris", "France"));
    }

    // Find country for the city from our locations data
    const locationInfo = MOCK_LOCATIONS.find(l => l.city.toLowerCase() === (city as string).toLowerCase());
    const country = locationInfo ? locationInfo.country : "le monde";

    const results = generateActivitiesForCity(city as string, country);

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
