import { calculateTripBudget, calculateTripCompletionScore, calculateTripAnalysis } from "./trip";
import type { Booking } from "@/types/trip";

// Petit helper pour ne pas avoir à retaper tous les champs de Booking dans chaque test
function booking(partial: Partial<Booking>): Booking {
    return {
        id: "1",
        trip_id: "trip-1",
        type: "flight",
        title: "Item",
        ...partial,
    };
}

describe("calculateTripBudget", () => {
    it("calcule le budget total d'un voyage avec plusieurs réservations", () => {
        const items = [
            booking({ type: "flight", price_estimate: 250 }),
            booking({ type: "hotel", price_estimate: 600 }),
            booking({ type: "activity", price_estimate: 50 }),
        ];
        expect(calculateTripBudget(items)).toBe(900);
    });

    it("retourne 0 pour un voyage sans réservation", () => {
        expect(calculateTripBudget([])).toBe(0);
    });

    it("ignore les réservations sans prix connu (null/undefined) ou à 0", () => {
        const items = [
            booking({ type: "flight", price_estimate: 300 }),
            booking({ type: "hotel", price_estimate: undefined }),
            booking({ type: "activity", price_estimate: 0 }),
        ];
        // Amadeus renvoie parfois des prix manquants ou à 0 — ils ne doivent pas casser le total
        expect(calculateTripBudget(items)).toBe(300);
    });
});

describe("calculateTripCompletionScore", () => {
    it("retourne 0 pour un voyage vide", () => {
        expect(calculateTripCompletionScore([])).toBe(0);
    });

    it("compte 35 pour un vol + 10 pour avoir au moins une réservation", () => {
        const items = [booking({ type: "flight" })];
        expect(calculateTripCompletionScore(items)).toBe(45);
    });

    it("retourne 100 pour un voyage avec vol, hôtel et activité", () => {
        const items = [
            booking({ type: "flight" }),
            booking({ type: "hotel" }),
            booking({ type: "activity" }),
        ];
        expect(calculateTripCompletionScore(items)).toBe(100);
    });
});

describe("calculateTripAnalysis", () => {
    it("signale tout ce qui manque pour un voyage vide", () => {
        const analysis = calculateTripAnalysis([]);
        expect(analysis.score).toBe(0);
        expect(analysis.warnings).toContain("Aucun vol aller réservé");
        expect(analysis.warnings).toContain("Hébergement non réservé");
        expect(analysis.warnings).toContain("Aucune activité planifiée");
    });

    it("ne renvoie aucun avertissement pour un aller-retour complet avec hôtel et activité", () => {
        const items = [
            booking({ type: "flight", price_estimate: 200 }),
            booking({ type: "flight", price_estimate: 220 }),
            booking({ type: "hotel", price_estimate: 500 }),
            booking({ type: "activity", price_estimate: 40 }),
        ];
        const analysis = calculateTripAnalysis(items);
        expect(analysis.score).toBe(100);
        expect(analysis.warnings).toEqual([]);
        expect(analysis.budget.used).toBe(960);
    });

    it("distingue 'vol retour manquant' d'une absence totale de vol", () => {
        // Un seul vol = l'aller, le retour n'est pas réservé
        const items = [booking({ type: "flight", price_estimate: 200 })];
        const analysis = calculateTripAnalysis(items);
        expect(analysis.warnings).toContain("Vol retour manquant");
        expect(analysis.warnings).not.toContain("Aucun vol aller réservé");
    });
});
