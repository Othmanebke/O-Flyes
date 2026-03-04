export interface RecommendationInput {
    budget: number;
    duration: number;
    period: string;
    departure?: string;
    interests: string[];
}

export interface HotelRecommendation {
    name: string;
    pricePerNight: number;
    rating: number;
}

export interface Recommendation {
    id: string;
    destination: string;
    country: string;
    emoji: string;
    bestPeriod: string;
    description: string;
    budgetTotal: number;
    budgetBreakdown: {
        flight: number;
        hotelPerNight: number;
        extras: number;
    };
    hotels: HotelRecommendation[];
    partnerLinks: {
        hotelsUrl: string;
        flightsUrl: string;
    };
}

export function getMockRecommendations(input: RecommendationInput): Recommendation[] {
    // Simple logic to adapt the mock data based on budget
    const tier =
        input.budget < 500 ? "Essentiel" :
            input.budget < 1500 ? "Confort" :
                input.budget < 3000 ? "Premium" : "Prestige";

    // Base flight price based on departure presence (mock)
    const baseFlightPrice = input.departure ? 150 : 250;

    // Destination 1: The perfect match
    const dest1: Recommendation = {
        id: "dest-1",
        destination: input.interests.includes("Soleil") ? "Bali" : "Rome",
        country: input.interests.includes("Soleil") ? "Indonésie" : "Italie",
        emoji: input.interests.includes("Soleil") ? "🌴" : "🏛️",
        bestPeriod: input.period !== "Flexible" ? input.period : "Mai - Septembre",
        description: `La destination idéale pour vos envies de ${input.interests.join(", ").toLowerCase() || "découverte"}.`,
        budgetTotal: Math.floor(input.budget * 0.95), // 95% of budget
        budgetBreakdown: {
            flight: baseFlightPrice * (input.interests.includes("Soleil") ? 3 : 1),
            hotelPerNight: Math.floor((input.budget * 0.5) / input.duration),
            extras: Math.floor((input.budget * 0.2)),
        },
        hotels: [
            {
                name: `The ${tier} Resort & Spa`,
                pricePerNight: Math.floor((input.budget * 0.5) / input.duration) + 20,
                rating: 4.8,
            },
            {
                name: `Boutique Hotel Center`,
                pricePerNight: Math.floor((input.budget * 0.5) / input.duration) - 15,
                rating: 4.5,
            }
        ],
        partnerLinks: {
            hotelsUrl: "https://www.booking.com",
            flightsUrl: "https://www.google.com/travel/flights"
        }
    };

    // Destination 2: The alternative
    const dest2: Recommendation = {
        id: "dest-2",
        destination: input.interests.includes("Culture") ? "Kyoto" : "Barcelone",
        country: input.interests.includes("Culture") ? "Japon" : "Espagne",
        emoji: input.interests.includes("Culture") ? "🏯" : "🏖️",
        bestPeriod: input.period !== "Flexible" ? input.period : "Avril - Octobre",
        description: `Une alternative vibrante offrant un excellent rapport qualité/prix.`,
        budgetTotal: Math.floor(input.budget * 0.85), // 85% of budget
        budgetBreakdown: {
            flight: baseFlightPrice * (input.interests.includes("Culture") ? 4 : 1.2),
            hotelPerNight: Math.floor((input.budget * 0.4) / input.duration),
            extras: Math.floor((input.budget * 0.25)),
        },
        hotels: [
            {
                name: `Grand Palace ${input.interests.includes("Culture") ? "Kyoto" : "BCN"}`,
                pricePerNight: Math.floor((input.budget * 0.4) / input.duration) + 10,
                rating: 4.6,
            },
            {
                name: `Urban Suites`,
                pricePerNight: Math.floor((input.budget * 0.4) / input.duration) - 20,
                rating: 4.3,
            }
        ],
        partnerLinks: {
            hotelsUrl: "https://www.booking.com",
            flightsUrl: "https://www.google.com/travel/flights"
        }
    };

    // Destination 3: The wild card (slightly over budget or different style)
    const dest3: Recommendation = {
        id: "dest-3",
        destination: input.interests.includes("Nature") ? "Reykjavik" : "Dubaï",
        country: input.interests.includes("Nature") ? "Islande" : "Émirats Arabes Unis",
        emoji: input.interests.includes("Nature") ? "🌋" : "🏙️",
        bestPeriod: input.period !== "Flexible" ? input.period : "Novembre - Mars",
        description: `Pour une expérience inoubliable hors des sentiers battus.`,
        budgetTotal: Math.floor(input.budget * 1.05), // 105% of budget (slightly over)
        budgetBreakdown: {
            flight: baseFlightPrice * 1.5,
            hotelPerNight: Math.floor((input.budget * 0.6) / input.duration),
            extras: Math.floor((input.budget * 0.3)),
        },
        hotels: [
            {
                name: `Luxury Panorama Hotel`,
                pricePerNight: Math.floor((input.budget * 0.6) / input.duration) + 50,
                rating: 4.9,
            },
            {
                name: `Modern City Inn`,
                pricePerNight: Math.floor((input.budget * 0.6) / input.duration) - 10,
                rating: 4.4,
            }
        ],
        partnerLinks: {
            hotelsUrl: "https://www.booking.com",
            flightsUrl: "https://www.google.com/travel/flights"
        }
    };

    return [dest1, dest2, dest3];
}
