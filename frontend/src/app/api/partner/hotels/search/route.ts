import { NextResponse } from 'next/server';
import { bookingHotelUrl } from '@/lib/iata';

// ── Curated hotel data by city ─────────────────────────────────────────────
// Each entry: [name, stars, category, priceMin, priceMax, amenities[], unsplash_photo_id]
type HotelTemplate = [string, number, string, number, number, string[], string];

const HOTELS_BY_CITY: Record<string, HotelTemplate[]> = {
    "Paris": [
        ["Hôtel Le Marais Élégance", 4, "Boutique", 120, 250, ["WiFi", "Petit-déjeuner", "Bar"], "1566400048770-b3ad2543f0b3"],
        ["Résidence Montmartre", 3, "Économique", 75, 140, ["WiFi", "Kitchenette"], "1541963463532-d5083eb04663"],
        ["Grand Hôtel Saint-Germain", 5, "Luxe", 380, 900, ["Spa", "Piscine", "Restaurant", "WiFi"], "1578683006584-78b7b2f59e65"],
        ["Hôtel Bastille République", 3, "Confort", 90, 180, ["WiFi", "Salle de sport"], "1551882547-ff40c63fe5fa"],
        ["Suite Champs-Élysées Prestige", 5, "Premium", 600, 1800, ["Spa", "Piscine", "Concierge", "Bar"], "1566400048770-b3ad2543f0b3"],
        ["Chambre d'hôtes Belleville", 2, "Économique", 55, 95, ["WiFi", "Petit-déjeuner"], "1533105079780-92b9be482077"],
    ],
    "Londres": [
        ["Mayfair Court Hotel", 4, "Classique", 150, 350, ["WiFi", "Restaurant", "Bar"], "1551882547-ff40c63fe5fa"],
        ["City Budget Inn", 3, "Économique", 80, 150, ["WiFi", "Petit-déjeuner"], "1541963463532-d5083eb04663"],
        ["The Soho Boutique", 4, "Boutique", 200, 420, ["WiFi", "Bar", "Concierge"], "1578683006584-78b7b2f59e65"],
        ["Kensington Palace Hotel", 5, "Luxe", 450, 1200, ["Spa", "Piscine", "Restaurant", "WiFi"], "1566400048770-b3ad2543f0b3"],
        ["Shoreditch Loft Rooms", 3, "Tendance", 110, 200, ["WiFi", "Café"], "1533105079780-92b9be482077"],
        ["Hyde Park Suites", 4, "Confort", 180, 350, ["WiFi", "Parking", "Petit-déjeuner"], "1541963463532-d5083eb04663"],
    ],
    "Dubai": [
        ["Jumeirah Beach Resort", 5, "Luxe", 400, 1200, ["Plage privée", "Piscine", "Spa", "Restaurant"], "1578683006584-78b7b2f59e65"],
        ["Burj Al Arab Classic Suite", 7, "Ultra-luxe", 1500, 4000, ["Butler", "Héliport", "Piscine privée", "Spa"], "1566400048770-b3ad2543f0b3"],
        ["Al Barsha Business Hotel", 4, "Affaires", 120, 250, ["WiFi", "Salle de réunion", "Piscine"], "1551882547-ff40c63fe5fa"],
        ["Palm View Hotel", 4, "Premium", 250, 500, ["Vue sur mer", "Piscine", "Spa", "Restaurant"], "1533105079780-92b9be482077"],
        ["City Centre Inn", 3, "Économique", 60, 120, ["WiFi", "Piscine"], "1541963463532-d5083eb04663"],
        ["Desert Rose Retreat", 5, "Boutique", 350, 800, ["Désert", "Spa", "Restaurant gastronomique"], "1578683006584-78b7b2f59e65"],
    ],
    "New York": [
        ["Manhattan Midtown Hotel", 4, "Classique", 180, 400, ["WiFi", "Fitness", "Bar"], "1551882547-ff40c63fe5fa"],
        ["Brooklyn Boutique Inn", 3, "Tendance", 120, 240, ["WiFi", "Café", "Rooftop"], "1533105079780-92b9be482077"],
        ["The Plaza Suite", 5, "Luxe", 800, 2500, ["Spa", "Restaurant", "Concierge", "WiFi"], "1578683006584-78b7b2f59e65"],
        ["SoHo Loft Rooms", 4, "Boutique", 200, 380, ["WiFi", "Bar", "Gym"], "1541963463532-d5083eb04663"],
        ["Times Square Inn", 3, "Économique", 100, 200, ["WiFi", "Petit-déjeuner"], "1566400048770-b3ad2543f0b3"],
        ["Central Park West Hotel", 4, "Premium", 280, 600, ["Vue parc", "Spa", "Restaurant"], "1578683006584-78b7b2f59e65"],
    ],
    "Tokyo": [
        ["Shinjuku Prince Hotel", 4, "Classique", 100, 220, ["WiFi", "Restaurant", "Vue sur ville"], "1551882547-ff40c63fe5fa"],
        ["Asakusa Ryokan", 3, "Traditionnel", 80, 160, ["Onsen", "Petit-déjeuner japonais"], "1533105079780-92b9be482077"],
        ["The Peninsula Tokyo", 5, "Luxe", 600, 2000, ["Spa", "Piscine", "Restaurant", "Bar"], "1578683006584-78b7b2f59e65"],
        ["Ginza Boutique Suites", 4, "Boutique", 150, 300, ["WiFi", "Bar", "Concierge"], "1541963463532-d5083eb04663"],
        ["Capsule & Beyond", 2, "Économique", 30, 80, ["WiFi", "Casier personnel"], "1566400048770-b3ad2543f0b3"],
        ["Odaiba Bay Hotel", 4, "Vue sur mer", 200, 380, ["Piscine", "Spa", "Restaurant"], "1578683006584-78b7b2f59e65"],
    ],
    "Bangkok": [
        ["Sukhumvit Suite Hotel", 4, "Affaires", 60, 150, ["Piscine", "WiFi", "Restaurant"], "1551882547-ff40c63fe5fa"],
        ["Riverside Boutique", 4, "Boutique", 80, 200, ["Vue fleuve", "Spa", "Bar"], "1533105079780-92b9be482077"],
        ["The Mandarin Oriental Bangkok", 5, "Luxe", 400, 1200, ["Spa", "Piscine", "Restaurant", "Bar"], "1578683006584-78b7b2f59e65"],
        ["Khao San Guesthouse", 2, "Économique", 20, 50, ["WiFi", "Terrasse"], "1541963463532-d5083eb04663"],
        ["Silom Tower Hotel", 4, "Confort", 70, 150, ["Piscine", "Gym", "Restaurant"], "1566400048770-b3ad2543f0b3"],
        ["Chatuchak Garden Resort", 4, "Nature", 90, 200, ["Piscine", "Jardin", "Spa"], "1578683006584-78b7b2f59e65"],
    ],
    "Bali": [
        ["Ubud Jungle Villa", 4, "Nature", 80, 200, ["Piscine privée", "Spa", "Petit-déjeuner"], "1533105079780-92b9be482077"],
        ["Seminyak Beach Resort", 5, "Luxe", 250, 700, ["Piscine", "Plage", "Spa", "Restaurant"], "1578683006584-78b7b2f59e65"],
        ["Kuta Budget Hostel", 2, "Économique", 15, 40, ["WiFi", "Piscine"], "1541963463532-d5083eb04663"],
        ["Nusa Dua Grand Hotel", 5, "Premium", 300, 800, ["Plage privée", "Spa", "Piscine", "Restaurant"], "1566400048770-b3ad2543f0b3"],
        ["Canggu Surf Lodge", 3, "Tendance", 40, 100, ["WiFi", "Piscine", "Bar"], "1551882547-ff40c63fe5fa"],
        ["Tegallalang Rice Terrace Inn", 3, "Boutique", 60, 140, ["Vue rizières", "Petit-déjeuner"], "1533105079780-92b9be482077"],
    ],
    "Marrakech": [
        ["Riad La Sultana", 5, "Riad luxe", 200, 600, ["Hammam", "Piscine", "Restaurant", "Spa"], "1578683006584-78b7b2f59e65"],
        ["Riad Zitoun Médina", 3, "Riad", 60, 130, ["Patio", "Petit-déjeuner marocain"], "1533105079780-92b9be482077"],
        ["Palmeraie Golf Palace", 5, "Resort", 180, 500, ["Golf", "Piscine", "Spa", "Restaurant"], "1566400048770-b3ad2543f0b3"],
        ["Médina Inn", 2, "Économique", 25, 60, ["WiFi", "Terrasse"], "1541963463532-d5083eb04663"],
        ["Le Jardin Secret Riad", 4, "Boutique", 120, 280, ["Jardin", "Piscine", "Spa"], "1551882547-ff40c63fe5fa"],
        ["Atlas View Hotel", 4, "Confort", 90, 200, ["Vue Atlas", "Piscine", "Restaurant"], "1578683006584-78b7b2f59e65"],
    ],
    "Barcelone": [
        ["Hotel Arts Barcelona", 5, "Luxe", 350, 900, ["Plage", "Piscine", "Spa", "Restaurant"], "1578683006584-78b7b2f59e65"],
        ["Barri Gòtic Boutique", 3, "Boutique", 80, 160, ["WiFi", "Toiture terrasse"], "1533105079780-92b9be482077"],
        ["Eixample Suites", 4, "Confort", 120, 260, ["WiFi", "Piscine", "Bar"], "1566400048770-b3ad2543f0b3"],
        ["Hostel Barcelona Centre", 2, "Économique", 25, 60, ["WiFi", "Cuisine partagée"], "1541963463532-d5083eb04663"],
        ["W Barcelona", 5, "Design", 400, 1100, ["Plage", "Spa", "Bar", "Piscine"], "1551882547-ff40c63fe5fa"],
        ["Gracia Garden Inn", 3, "Charme", 90, 180, ["WiFi", "Terrasse"], "1578683006584-78b7b2f59e65"],
    ],
    "Rome": [
        ["Hotel Eden Roma", 5, "Luxe", 400, 1200, ["Spa", "Vue collines", "Restaurant", "Bar"], "1578683006584-78b7b2f59e65"],
        ["Trastevere B&B", 3, "Charme", 70, 150, ["WiFi", "Petit-déjeuner"], "1533105079780-92b9be482077"],
        ["Vatican View Hotel", 4, "Confort", 120, 250, ["WiFi", "Restaurant", "Vue Vatican"], "1566400048770-b3ad2543f0b3"],
        ["Colosseo Hostel", 2, "Économique", 30, 70, ["WiFi", "Cuisine partagée"], "1541963463532-d5083eb04663"],
        ["Villa Borghese Suites", 4, "Boutique", 180, 380, ["Jardin", "Spa", "Restaurant"], "1551882547-ff40c63fe5fa"],
        ["Pantheon Boutique", 4, "Design", 200, 420, ["WiFi", "Toiture terrasse", "Bar"], "1578683006584-78b7b2f59e65"],
    ],
    "Maldives": [
        ["Overwater Bungalow Resort", 5, "Ultra-luxe", 800, 3000, ["Plage privée", "Snorkeling", "Spa", "Restaurant"], "1533105079780-92b9be482077"],
        ["Lagoon Villa Retreat", 5, "Luxe", 500, 1800, ["Piscine privée", "Spa", "Bar"], "1578683006584-78b7b2f59e65"],
        ["Beach Bungalow Inn", 3, "Économique", 150, 400, ["Plage", "WiFi", "Petit-déjeuner"], "1566400048770-b3ad2543f0b3"],
        ["Coral Garden Resort", 5, "Premium", 600, 2200, ["Snorkeling", "Spa", "Piscine", "Restaurant"], "1551882547-ff40c63fe5fa"],
        ["Islander Eco Lodge", 3, "Nature", 100, 300, ["Plage", "Kayak", "WiFi"], "1533105079780-92b9be482077"],
        ["The Ritz-Carlton Maldives", 5, "Prestige", 2000, 5000, ["Villa privée", "Butler", "Spa", "Restaurant"], "1578683006584-78b7b2f59e65"],
    ],
};

// Fallback generic hotels for any city
function generateGenericHotels(city: string): HotelTemplate[] {
    return [
        [`Hôtel Central ${city}`, 3, "Confort", 70, 160, ["WiFi", "Petit-déjeuner", "Bar"], "1551882547-ff40c63fe5fa"],
        [`${city} Grand Hotel`, 4, "Classique", 130, 300, ["WiFi", "Restaurant", "Piscine"], "1578683006584-78b7b2f59e65"],
        [`Budget Inn ${city}`, 2, "Économique", 40, 85, ["WiFi"], "1541963463532-d5083eb04663"],
        [`${city} Boutique Suites`, 4, "Boutique", 150, 350, ["WiFi", "Bar", "Spa"], "1533105079780-92b9be482077"],
        [`Luxury Palace ${city}`, 5, "Luxe", 350, 1200, ["Spa", "Piscine", "Restaurant", "WiFi"], "1566400048770-b3ad2543f0b3"],
        [`${city} Résidence`, 3, "Appartement", 80, 180, ["WiFi", "Cuisine équipée"], "1578683006584-78b7b2f59e65"],
    ];
}

// ── Amadeus Hotel Search ────────────────────────────────────────────────────
async function fetchAmadeusHotels(city: string, checkin: string, checkout: string, adults: number) {
    const clientId = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;

    try {
        // Step 1: Get city code (keyword search)
        const tokenRes = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
        });
        if (!tokenRes.ok) return null;
        const { access_token } = await tokenRes.json();

        const cityRes = await fetch(
            `https://test.api.amadeus.com/v1/reference-data/locations?keyword=${encodeURIComponent(city)}&subType=CITY&max=1`,
            { headers: { Authorization: `Bearer ${access_token}` }, signal: AbortSignal.timeout(5000) }
        );
        if (!cityRes.ok) return null;
        const cityData = await cityRes.json();
        const cityCode = cityData.data?.[0]?.iataCode;
        if (!cityCode) return null;

        // Step 2: Get hotels by city
        const hotelsRes = await fetch(
            `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}`,
            { headers: { Authorization: `Bearer ${access_token}` }, signal: AbortSignal.timeout(5000) }
        );
        if (!hotelsRes.ok) return null;
        const hotelsData = await hotelsRes.json();
        const hotelIds = (hotelsData.data || []).slice(0, 8).map((h: any) => h.hotelId).join(',');
        if (!hotelIds) return null;

        // Step 3: Get hotel offers (pricing)
        const offersRes = await fetch(
            `https://test.api.amadeus.com/v3/shopping/hotel-offers?hotelIds=${hotelIds}&adults=${adults}&checkInDate=${checkin}&checkOutDate=${checkout}&currencyCode=EUR`,
            { headers: { Authorization: `Bearer ${access_token}` }, signal: AbortSignal.timeout(8000) }
        );
        if (!offersRes.ok) return null;
        const offersData = await offersRes.json();

        return (offersData.data || []).map((item: any) => {
            const hotel = item.hotel;
            const offer = item.offers?.[0];
            const price = parseFloat(offer?.price?.total || '0');
            return {
                id: hotel.hotelId,
                name: hotel.name,
                city,
                country: hotel.address?.countryCode || '',
                price_per_night: Math.round(price),
                currency: 'EUR',
                rating: hotel.rating ? parseFloat(hotel.rating) : 4.0,
                stars: hotel.rating ? parseInt(hotel.rating) : 4,
                category: 'Classique',
                image_url: `https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80`,
                description: hotel.description?.text || `Séjour à ${hotel.name}`,
                amenities: [],
                booking_url: bookingHotelUrl({ city, hotelName: hotel.name, checkin, checkout, adults }),
            };
        });
    } catch {
        return null;
    }
}

// ── Main route ─────────────────────────────────────────────────────────────
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const city = (searchParams.get('city') || 'Paris').trim();
    const checkin = searchParams.get('checkin') || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const checkout = searchParams.get('checkout') || new Date(Date.now() + 37 * 86400000).toISOString().split('T')[0];
    const adults = parseInt(searchParams.get('adults') || '2', 10);

    // Try Amadeus first
    const amadeusHotels = await fetchAmadeusHotels(city, checkin, checkout, adults);
    if (amadeusHotels && amadeusHotels.length > 0) {
        return NextResponse.json(amadeusHotels);
    }

    // Static curated fallback
    const cityKey = Object.keys(HOTELS_BY_CITY).find(k =>
        city.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(city.toLowerCase())
    );
    const templates: HotelTemplate[] = cityKey ? HOTELS_BY_CITY[cityKey] : generateGenericHotels(city);

    // Seed based on city name for deterministic "random"
    const seed = city.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

    const hotels = templates.map(([name, stars, category, priceMin, priceMax, amenities, photoId], i) => {
        // Slight price variation based on seed
        const variation = (seed * (i + 1) * 7) % (priceMax - priceMin);
        const price = priceMin + Math.floor(variation * 0.7);

        return {
            id: `hotel-${city}-${i}`,
            name,
            city,
            country: '',
            price_per_night: price,
            currency: "EUR",
            rating: (3.8 + (seed * (i + 1)) % 12 / 10).toFixed(1),
            stars,
            category,
            image_url: `https://images.unsplash.com/photo-${photoId}?w=600&q=80`,
            description: `Profitez d'un séjour exceptionnel au ${name}, idéalement situé à ${city}.`,
            amenities,
            booking_url: bookingHotelUrl({ city, hotelName: name, checkin, checkout, adults }),
        };
    });

    return NextResponse.json(hotels);
}
