export interface DraftDestination {
    name: string;
    country: string;
    emoji: string;
    nights?: number;
}

export interface ChatActivity {
    name: string;
    price: number | null;
    emoji: string;
}

export interface EnrichedDestination {
    name: string;
    country: string;
    emoji: string;
    dataSource: 'real' | 'unavailable';
    price_estimate: number | null;
    // Composantes réelles de l'estimation, renvoyées séparément pour que l'interface
    // affiche le vrai prix du vol et de l'hôtel au lieu d'inventer une répartition.
    flight_price: number | null;          // total aller-retour réel, pour `adults` personnes
    hotel_price_per_night: number | null; // prix réel par nuit
    nights: number;
    depart_date: string;                  // AAAA-MM-JJ
    return_date: string;                  // AAAA-MM-JJ
    adults: number;
    booking_url: string;
    flights_url: string;
    activities: ChatActivity[];
}

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    enriched?: EnrichedDestination[];
}
