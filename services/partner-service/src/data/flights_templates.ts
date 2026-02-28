export interface FlightTemplate {
    airline: string;
    basePrice: number;
    class: "Économie" | "Affaires" | "Première";
    type: "Direct" | "1 Escale";
}

export const FLIGHT_TEMPLATES: FlightTemplate[] = [
    { airline: "Air France", basePrice: 450, class: "Affaires", type: "Direct" },
    { airline: "Lufthansa", basePrice: 380, class: "Économie", type: "1 Escale" },
    { airline: "Emirates", basePrice: 890, class: "Première", type: "Direct" },
    { airline: "Qatar Airways", basePrice: 750, class: "Affaires", type: "Direct" },
    { airline: "British Airways", basePrice: 320, class: "Économie", type: "Direct" },
    { airline: "Turkish Airlines", basePrice: 410, class: "Affaires", type: "1 Escale" },
    { airline: "Singapore Airlines", basePrice: 950, class: "Première", type: "Direct" }
];
