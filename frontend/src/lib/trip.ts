import type { Booking, TripAnalysis } from "@/types/trip";

// Budget total d'un voyage = somme des price_estimate de chaque réservation.
// Les réservations sans prix connu (price_estimate undefined/null) comptent pour 0,
// pas pour NaN — Amadeus renvoie parfois des prix manquants ou à 0.
export function calculateTripBudget(items: Booking[]): number {
    return items.reduce((sum, b) => sum + (b.price_estimate || 0), 0);
}

// Score de complétion utilisé par le panneau budget (TripBudgetPanel) : un voyage est
// "complet" quand il a un vol, un hôtel, une activité et au moins une réservation.
// Pondération volontairement simple (35/35/20/10) pour donner un pourcentage rond à l'utilisateur.
export function calculateTripCompletionScore(items: Booking[]): number {
    const hasFlight = items.some(b => b.type === "flight");
    const hasHotel = items.some(b => b.type === "hotel");
    const hasActivity = items.some(b => b.type === "activity");
    return (hasFlight ? 35 : 0) + (hasHotel ? 35 : 0) + (hasActivity ? 20 : 0) + (items.length > 0 ? 10 : 0);
}

// Analyse complète d'un voyage pour le dashboard : score de complétion (sur 100) + alertes
// textuelles sur ce qu'il manque. Un aller-retour = 2 vols, donc on distingue "aucun vol" de
// "il manque le retour" pour donner un message plus précis.
export function calculateTripAnalysis(items: Booking[]): TripAnalysis {
    const flights = items.filter(b => b.type === 'flight');
    const hotels = items.filter(b => b.type === 'hotel');
    const activities = items.filter(b => b.type === 'activity');
    const totalCost = calculateTripBudget(items);

    const hasOutbound = flights.length > 0;
    const hasReturn = flights.length >= 2;
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
