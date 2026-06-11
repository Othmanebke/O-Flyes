// Types partagés entre le chatbot, l'API /api/chat et la modale de proposition IA.

// Idée de destination brute proposée par le LLM, avant enrichissement par les vraies données partenaires.
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

// Destination "groundée" : prix et activités viennent d'Amadeus / OpenTripMap, jamais inventés par le LLM.
export interface EnrichedDestination {
    name: string;
    country: string;
    emoji: string;
    dataSource: 'real' | 'unavailable';
    price_estimate: number | null;
    booking_url: string;
    flights_url: string;
    activities: ChatActivity[];
}

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    enriched?: EnrichedDestination[];
}
