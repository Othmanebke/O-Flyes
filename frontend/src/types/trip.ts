export interface Trip {
    id: string;
    title: string;
    destination_name?: string;
    country?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
    img?: string;
}

export interface Booking {
    id: string;
    trip_id: string;
    type: 'flight' | 'hotel' | 'activity' | 'transport';
    title: string;
    provider?: string;
    confirmation_number?: string;
    start_datetime?: string;
    end_datetime?: string;
    price_estimate?: number;
    currency?: string;
    location?: string;
    status?: string;
    external_reference?: string;
    external_url?: string;
    booking_url?: string;
    raw_data?: Record<string, any>;
}

export interface TripAnalysis {
    budget: { total: number; used: number; percentage: number };
    coverage: {
        missingHotelNights: number;
        missingOutboundFlight: boolean;
        missingReturnFlight: boolean;
        emptyDays: string[];
        hasActivity: boolean;
    };
    warnings: string[];
    score: number;
}
