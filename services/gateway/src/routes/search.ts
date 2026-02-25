import { Router } from "express";

const router = Router();

// ── 1. Autocomplete Locations (City/Airport) ──
router.get("/locations", (req, res) => {
    const { keyword } = req.query;
    if (!keyword || typeof keyword !== "string" || keyword.length < 3) {
        return res.json([]);
    }

    const kw = keyword.toLowerCase();

    // Mock database of locations
    const mockLocations = [
        { id: "PAR", name: "Paris", type: "city", country: "France", airportName: "All Airports" },
        { id: "CDG", name: "Paris", type: "airport", country: "France", airportName: "Charles de Gaulle" },
        { id: "ORY", name: "Paris", type: "airport", country: "France", airportName: "Orly" },
        { id: "JFK", name: "New York", type: "airport", country: "USA", airportName: "John F. Kennedy Intl" },
        { id: "NYC", name: "New York", type: "city", country: "USA", airportName: "All Airports" },
        { id: "DXB", name: "Dubai", type: "airport", country: "UAE", airportName: "Dubai Intl" },
        { id: "LHR", name: "London", type: "airport", country: "UK", airportName: "Heathrow" },
        { id: "NRT", name: "Tokyo", type: "airport", country: "Japan", airportName: "Narita" },
        { id: "DPS", name: "Bali", type: "airport", country: "Indonesia", airportName: "Ngurah Rai Intl" },
        { id: "RAK", name: "Marrakech", type: "airport", country: "Maroc", airportName: "Menara" },
    ];

    const results = mockLocations.filter(loc =>
        loc.name.toLowerCase().includes(kw) ||
        loc.id.toLowerCase().includes(kw) ||
        (loc.airportName && loc.airportName.toLowerCase().includes(kw))
    );

    res.json(results);
});

// ── 2. Search Flights ──
router.get("/flights", (req, res) => {
    const { origin, destination, date } = req.query;

    if (!origin || !destination || !date) {
        return res.status(400).json({ error: "origin, destination, and date are required" });
    }

    // Generate ultra-realistic mock flights based on the date
    const reqDate = new Date(date as string);
    const dateStr = reqDate.toISOString().split('T')[0];

    // Helper to add hours
    const addHours = (d: Date, hours: number) => new Date(d.getTime() + hours * 60 * 60 * 1000);

    const mockFlights = [
        {
            id: `FL-${origin}-${destination}-1`,
            airline: "Air France",
            airlineLogo: "https://images.skyscnr.com/images/airlines/favicon/AF.png",
            flightNumber: "AF123",
            departure: {
                iata: origin as string,
                time: `${dateStr}T08:30:00Z`
            },
            arrival: {
                iata: destination as string,
                time: addHours(reqDate, 7).toISOString().replace('.000', '') // generic 7h flight
            },
            duration: "7h 00m",
            price: 345.50,
            currency: "EUR",
            bookingUrl: "https://www.airfrance.com"
        },
        {
            id: `FL-${origin}-${destination}-2`,
            airline: "Emirates",
            airlineLogo: "https://images.skyscnr.com/images/airlines/favicon/EK.png",
            flightNumber: "EK456",
            departure: {
                iata: origin as string,
                time: `${dateStr}T14:15:00Z`
            },
            arrival: {
                iata: destination as string,
                time: addHours(reqDate, 8.5).toISOString().replace('.000', '')
            },
            duration: "8h 30m",
            price: 480.00,
            currency: "EUR",
            bookingUrl: "https://www.emirates.com"
        },
        {
            id: `FL-${origin}-${destination}-3`,
            airline: "EasyJet",
            airlineLogo: "https://images.skyscnr.com/images/airlines/favicon/U2.png",
            flightNumber: "U2789",
            departure: {
                iata: origin as string,
                time: `${dateStr}T18:45:00Z`
            },
            arrival: {
                iata: destination as string,
                time: addHours(reqDate, 2.5).toISOString().replace('.000', '')
            },
            duration: "2h 30m",
            price: 89.99,
            currency: "EUR",
            bookingUrl: "https://www.easyjet.com"
        }
    ];

    setTimeout(() => res.json(mockFlights), 800); // simulate network delay
});

// ── 3. Search Hotels ──
router.get("/hotels", (req, res) => {
    const { cityCode, checkIn, checkOut } = req.query;

    if (!cityCode || !checkIn || !checkOut) {
        return res.status(400).json({ error: "cityCode, checkIn, and checkOut are required" });
    }

    const mockHotels = [
        {
            id: `HTL-${cityCode}-1`,
            name: `Grand Palace ${cityCode}`,
            provider: "Booking.com",
            rating: 4.8,
            reviewsCount: 1245,
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
            pricePerNight: 185.00,
            currency: "EUR",
            amenities: ["Pool", "Spa", "Free WiFi"],
            location: "City Center",
            bookingUrl: "https://www.booking.com"
        },
        {
            id: `HTL-${cityCode}-2`,
            name: `Boutique Stay ${cityCode}`,
            provider: "Expedia",
            rating: 4.5,
            reviewsCount: 890,
            image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800",
            pricePerNight: 120.50,
            currency: "EUR",
            amenities: ["Gym", "Restaurant", "Airport Shuttle"],
            location: "Downtown",
            bookingUrl: "https://www.expedia.com"
        },
        {
            id: `HTL-${cityCode}-3`,
            name: `Luxury Resort & Spa`,
            provider: "Hotels.com",
            rating: 4.9,
            reviewsCount: 3200,
            image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
            pricePerNight: 350.00,
            currency: "EUR",
            amenities: ["Private Beach", "All-Inclusive", "Couples Massage"],
            location: "Beachfront",
            bookingUrl: "https://www.hotels.com"
        }
    ];

    setTimeout(() => res.json(mockHotels), 1100);
});

import axios from "axios";

// ── 4. Search Activities (Real API via Wikipedia) ──
router.get("/activities", async (req, res) => {
    const { cityCode } = req.query;
    if (!cityCode) return res.status(400).json({ error: "cityCode is required" });

    try {
        // 1. Fetch real tourist places via Wikipedia API for the city
        const wikiUrl = `https://fr.wikipedia.org/w/api.php?action=query&list=search&srsearch=monument historique tourisme ${cityCode}&utf8=&format=json&srlimit=5`;
        const response = await axios.get(wikiUrl);
        const searchResults = response.data?.query?.search || [];

        // 2. Map Wikipedia results to our Activity standard format
        const realActivities = searchResults.map((item: any, index: number) => {
            // Strip HTML tags from the snippet
            const cleanSnippet = item.snippet.replace(/<\/?[^>]+(>|$)/g, "");

            return {
                id: `WIKI-${item.pageid}`,
                name: item.title,
                provider: "Wikipedia API",
                rating: (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1), // Random rating between 4.0 and 5.0
                image: `https://source.unsplash.com/800x600/?monument,${encodeURIComponent(item.title)}`, // Fallback image logic
                price: Math.floor(Math.random() * 50) + 10, // Simulated price for MVP
                currency: "EUR",
                duration: "2h - 4h",
                bookingUrl: `https://fr.wikipedia.org/?curid=${item.pageid}`,
                description: cleanSnippet
            };
        });

        // Add a fallback if Wikipedia returns nothing
        if (realActivities.length === 0) {
            realActivities.push({
                id: `ACT-FALLBACK-1`,
                name: `Visite guidée - ${cityCode}`,
                provider: "Local Guide",
                rating: "4.8",
                image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=800",
                price: 45.00,
                currency: "EUR",
                duration: "3h",
                bookingUrl: "https://www.viator.com"
            });
        }

        res.json(realActivities);
    } catch (err: any) {
        console.error("[Search Router] Wikipedia API Error:", err.message);
        res.status(500).json({ error: "Erreur lors de la récupération des activités externes." });
    }
});

export default router;
