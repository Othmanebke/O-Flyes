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
    booking_url: string;
    flights_url: string;
    activities: ChatActivity[];
}

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    enriched?: EnrichedDestination[];
}
