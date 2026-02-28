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
import { FLIGHT_TEMPLATES } from "./data/flights_templates";
import { FLIGHTS_REAL_DATA } from "./data/flights_data";

// --- Activity Generator & Connector ---
// ... (previous functions remain the same)
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

// --- Flight Generator & Connector ---
function getFlightsForRoute(origin: string, destination: string) {
    const normOrg = origin.toLowerCase();
    const normDst = destination.toLowerCase();

    // 1. Try real curated Flight data
    const realFlight = FLIGHTS_REAL_DATA.find(f =>
        f.origin.toLowerCase().includes(normOrg) &&
        f.destination.toLowerCase().includes(normDst)
    );

    if (realFlight) {
        console.log(`[partner-service] Found real Flight data for ${origin} -> ${destination}`);
        return [realFlight];
    }

    // 2. Fallback to Generator
    console.log(`[partner-service] Generating flights for ${origin} -> ${destination}`);

    // Shuffled templates
    const shuffledTemplates = [...FLIGHT_TEMPLATES].sort(() => Math.random() - 0.5);

    return shuffledTemplates.map((tpl, index) => {
        const departureDate = new Date();
        departureDate.setDate(departureDate.getDate() + 14); // 2 weeks from now
        departureDate.setHours(8 + index * 2, 0, 0);

        const arrivalDate = new Date(departureDate);
        arrivalDate.setHours(arrivalDate.getHours() + 4); // 4 hour duration by default

        return {
            id: `gen-fl-comp-${index}`,
            airline: tpl.airline,
            origin: origin,
            originCode: origin.slice(0, 3).toUpperCase(),
            destination: destination,
            destinationCode: destination.slice(0, 3).toUpperCase(),
            departure: departureDate.toISOString(),
            arrival: arrivalDate.toISOString(),
            duration: "4h 00m",
            price: tpl.basePrice + Math.floor(Math.random() * 150),
            currency: "EUR",
            type: tpl.type,
            class: tpl.class,
            booking_url: `https://www.skyscanner.fr/transport/vols/${origin.slice(0, 3)}/${destination.slice(0, 3)}`
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
    // Replaced by getFlightsForRoute
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

    const org = origin ? (origin as string) : "Paris";
    const dst = destination ? (destination as string) : "New York";

    const results = getFlightsForRoute(org, dst);

    res.json(results);
});

if (process.env.IS_MONOLITH !== "true") {
    app.listen(PORT, () => console.log(`[partner-service] running on port ${PORT}`));
}

export default app;
