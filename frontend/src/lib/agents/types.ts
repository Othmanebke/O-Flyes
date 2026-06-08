// Shared types for the multi-agent trip proposal pipeline.
// Each agent receives a narrow slice of context and returns a structured,
// independently-renderable section. Numeric fields are always grounded in
// real search results (Amadeus/OpenTripMap) — agents only narrate around them,
// they never invent prices, names or figures.

export interface TripContext {
    tripId: string;
    title: string;
    destinationName: string | null;
    country: string | null;
    originCity: string;
    startDate: string | null;  // ISO date, may be null if undecided
    endDate: string | null;
    travelers: number;
    budgetEur: number | null;
    preferences: string;       // free-text wishes gathered from the trip/chat context
}

export interface DestinationBrief {
    tripType: string;
    priorities: string[];
    destinationName: string;
    country: string;
    ambiance: string;
    nights: number;
    summary: string;
}

export interface FlightOption {
    airline: string;
    price: number;
    currency: string;
    duration: string;
    stops: number;
    departure: string;
    arrival: string;
    bookingUrl: string;
}

export interface TransportPlan {
    dataAvailable: boolean;
    recommendation: string;
    options: FlightOption[];
}

export interface ActivityPlanItem {
    name: string;
    category: string;
    period: 'Matin' | 'Après-midi' | 'Soir';
}

export interface ActivityPlanDay {
    day: number;
    theme: string;
    items: ActivityPlanItem[];
}

export interface ActivitiesPlan {
    dataAvailable: boolean;
    rhythm: string;
    days: ActivityPlanDay[];
}

export interface BudgetBreakdown {
    dataAvailable: boolean;
    flightTotal: number | null;
    lodgingTotal: number | null;
    activitiesEstimate: number | null;
    grandTotal: number | null;
    statedBudget: number | null;
    verdict: 'within' | 'over' | 'unknown';
    recommendation: string;
}

export interface SafetyBriefing {
    visa: string;
    health: string;
    climate: string;
    advisories: string;
    disclaimer: string;
}

export interface TripProposal {
    generatedAt: string;
    originCity: string;
    destination: DestinationBrief;
    transport: TransportPlan;
    activities: ActivitiesPlan;
    budget: BudgetBreakdown;
    safety: SafetyBriefing;
    summary: string;
}
