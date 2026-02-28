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
import { GYG_REAL_DATA } from "./data/gyg_data";
import { HOTEL_TEMPLATES } from "./data/hotels_templates";
import { BOOKING_REAL_DATA } from "./data/booking_data";

// --- Activity Generator & Connector ---
function getActivitiesForCity(city: string, country: string) {
    const normalizedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    // 1. Try real curated GYG data first (Connector approach)
    // Basic variations check
    const cityKeys = [normalizedCity, normalizedCity.normalize("NFD").replace(/[\u0300-\u036f]/g, "")];
    for (const key of cityKeys) {
        if (GYG_REAL_DATA[key]) {
            console.log(`[partner-service] Found real GYG data for ${key}`);
            return GYG_REAL_DATA[key];
        }
    }

    // 2. Fallback to Generator for 100% coverage
    console.log(`[partner-service] Generating activities for ${normalizedCity} (${country})`);

    // Shuffle templates to ensure variety
    const shuffledTemplates = [...ACTIVITY_TEMPLATES].sort(() => Math.random() - 0.5);

    return shuffledTemplates.slice(0, 8).map((tpl, index) => ({
        id: `gen-${normalizedCity.toLowerCase()}-${index}`,
        title: tpl.title.replace("{city}", normalizedCity).replace("{country}", country),
        city: normalizedCity,
        country: country,
        category: tpl.category,
        price: tpl.basePrice + Math.floor(Math.random() * 20),
        currency: "EUR",
        rating: (4.5 + Math.random() * 0.5).toFixed(1),
        reviews: Math.floor(Math.random() * 800) + 100,
        image_url: tpl.imagePool[Math.floor(Math.random() * tpl.imagePool.length)],
        description: tpl.description.replace("{city}", normalizedCity).replace("{country}", country),
        booking_url: `https://www.getyourguide.com/s/?q=${normalizedCity}`
    }));
}

// --- Hotel Generator & Connector ---
function getHotelsForCity(city: string, country: string) {
    const normalizedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    // 1. Try real curated Booking data first
    const cityKeys = [normalizedCity, normalizedCity.normalize("NFD").replace(/[\u0300-\u036f]/g, "")];
    for (const key of cityKeys) {
        if (BOOKING_REAL_DATA[key]) {
            console.log(`[partner-service] Found real Booking data for ${key}`);
            return BOOKING_REAL_DATA[key];
        }
    }

    // 2. Fallback to Generator
    console.log(`[partner-service] Generating hotels for ${normalizedCity} (${country})`);

    // Shuffle templates
    const shuffledTemplates = [...HOTEL_TEMPLATES].sort(() => Math.random() - 0.5);

    return shuffledTemplates.map((tpl, index) => {
        const name = tpl.titleTemplate[Math.floor(Math.random() * tpl.titleTemplate.length)].replace("{city}", normalizedCity);
        return {
            id: `gen-hotel-${normalizedCity.toLowerCase()}-${index}`,
            name: name,
            city: normalizedCity,
            country: country,
            category: tpl.category,
            price_per_night: tpl.basePrice + Math.floor(Math.random() * 100),
            currency: "EUR",
            rating: (4.0 + Math.random() * 1.0).toFixed(1),
            stars: tpl.stars,
            image_url: tpl.imagePool[Math.floor(Math.random() * tpl.imagePool.length)],
            description: tpl.descriptionTemplate.replace("{city}", normalizedCity).replace("{country}", country),
            booking_url: `https://www.booking.com/searchresults.fr.html?ss=${normalizedCity}`
        };
    });
}

const MOCK_ACTIVITIES_BASE = [
    // ... items would go here if we wanted hardcoded ones, 
    // but we'll use the generator for everything now to ensure 100% coverage
];

const MOCK_HOTELS = [
    // Replaced by getHotelsForCity
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
        return res.json(getActivitiesForCity("Paris", "France"));
    }

    // Find country for the city from our locations data
    const locationInfo = MOCK_LOCATIONS.find(l => l.city.toLowerCase() === (city as string).toLowerCase());
    const country = locationInfo ? locationInfo.country : "le monde";

    const results = getActivitiesForCity(city as string, country);

    res.json(results);
});

app.get("/hotels/search", (req, res) => {
    const { city } = req.query;
    console.log(`[partner-service] Searching hotels for city: ${city}`);

    if (!city) {
        return res.json(getHotelsForCity("Paris", "France"));
    }

    // Find country for the city
    const locationInfo = MOCK_LOCATIONS.find(l => l.city.toLowerCase() === (city as string).toLowerCase());
    const country = locationInfo ? locationInfo.country : "le monde";

    const results = getHotelsForCity(city as string, country);

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
