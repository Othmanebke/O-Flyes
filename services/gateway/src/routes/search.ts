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

// ── 4. Search Activities ──
router.get("/activities", (req, res) => {
    const { cityCode } = req.query;

    const mockActivities = [
        {
            id: `ACT-${cityCode}-1`,
            name: "Visite guidée historique",
            provider: "Viator",
            rating: 4.7,
            image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=800",
            price: 45.00,
            currency: "EUR",
            duration: "3h",
            bookingUrl: "https://www.viator.com"
        },
        {
            id: `ACT-${cityCode}-2`,
            name: "Excursion en bateau & Snorkeling",
            provider: "GetYourGuide",
            rating: 4.9,
            image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800",
            price: 85.00,
            currency: "EUR",
            duration: "Demi-journée",
            bookingUrl: "https://www.getyourguide.com"
        },
        {
            id: `ACT-${cityCode}-3`,
            name: "Dîner gastronomique local",
            provider: "TripAdvisor",
            rating: 4.6,
            image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800",
            price: 110.00,
            currency: "EUR",
            duration: "Soirée",
            bookingUrl: "https://www.tripadvisor.com"
        }
    ];

    setTimeout(() => res.json(mockActivities), 600);
});

export default router;
