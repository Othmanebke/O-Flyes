import type { Booking, TripAnalysis } from "@/types/trip";

// Amadeus peut renvoyer des prix à null sur certaines offres, on les ignore
export function calculateTripBudget(items: Booking[]): number {
    return items.reduce((sum, b) => sum + (b.price_estimate || 0), 0);
}

// pondération 35/35/20/10, empirique mais ça donne des % lisibles
export function calculateTripCompletionScore(items: Booking[]): number {
    const hasFlight = items.some(b => b.type === "flight");
    const hasHotel = items.some(b => b.type === "hotel");
    const hasActivity = items.some(b => b.type === "activity");
    return (hasFlight ? 35 : 0) + (hasHotel ? 35 : 0) + (hasActivity ? 20 : 0) + (items.length > 0 ? 10 : 0);
}

export function calculateTripAnalysis(items: Booking[]): TripAnalysis {
    const flights = items.filter(b => b.type === 'flight');
    const hotels = items.filter(b => b.type === 'hotel');
    const activities = items.filter(b => b.type === 'activity');
    const totalCost = calculateTripBudget(items);

    let hasOutbound = false;
    let hasReturn = false;
    for (const f of flights) {
        const title = f.title.toLowerCase();
        if (title.includes('aller-retour') || title.includes('aller retour') || title.includes('roundtrip')) {
            hasOutbound = true;
            hasReturn = true;
        } else if (title.includes('retour')) {
            hasReturn = true;
        } else {
            hasOutbound = true;
        }
    }
    const hasHotel = hotels.length > 0;
    const hasActivity = activities.length > 0;

    let score = 0;
    if (hasOutbound) score += 30;
    if (hasReturn) score += 20;
    if (hasHotel) score += 30;
    if (hasActivity) score += 20;

    const warnings: string[] = [];
    if (!hasOutbound) warnings.push("Aucun vol aller réservé");
    else if (!hasReturn) warnings.push("Vol retour manquant");
    if (!hasHotel) warnings.push("Hébergement non réservé");
    if (!hasActivity) warnings.push("Aucune activité planifiée");

    return {
        budget: { total: 0, used: totalCost, percentage: totalCost > 0 ? 100 : 0 },
        coverage: {
            missingHotelNights: hasHotel ? 0 : 1,
            missingOutboundFlight: !hasOutbound,
            missingReturnFlight: !hasReturn,
            emptyDays: [],
            hasActivity,
        },
        warnings,
        score,
    };
}
