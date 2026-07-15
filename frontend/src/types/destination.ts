export interface Flight {
    airline: string;
    type: string;
    duration: string;
    stops: string;
    price: number;
    logo: string;
}

export interface HotelOption {
    name: string;
    stars: number;
    rating: number;
    pricePerNight: number;
    badge: string;
    amenities: string[];
    img: string;
}

export interface Activity {
    name: string;
    description: string;
    price: string;
    duration: string;
    emoji: string;
    category: string;
}

export interface CarRental {
    category: string;
    model: string;
    pricePerDay: number;
    features: string[];
    emoji: string;
}

export interface Destination {
    id: string;
    name: string;
    country: string;
    continent: string;
    climate: string;
    style: string[];
    budgetTier: "petit" | "moyen" | "confort" | "luxe";
    tripBudget: { min: number; max: number };
    flightFrom: number;
    hotelPerNight: number;
    bestMonths: string[];
    duration: string;
    description: string;
    highlight: string;
    img: string;
    topDest?: boolean;
    continentRank?: string;
    rating: number;
    flights?: Flight[];
    hotels?: HotelOption[];
    activities?: Activity[];
    carRentals?: CarRental[];
}
