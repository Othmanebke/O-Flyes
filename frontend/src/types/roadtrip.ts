// Types pour la proposition de roadtrip générée par l'agent IA (lib/agents/roadtripAgent.ts).

export interface RoadtripStep {
    dayRange: string;
    locationName: string;
    country: string;
    description: string;
    transportToNext?: string;
    estimatedCost?: string;
    activities: string[];
}

export interface RoadtripProposal {
    title: string;
    summary: string;
    totalDays: number;
    steps: RoadtripStep[];
    generatedAt?: string;
}
