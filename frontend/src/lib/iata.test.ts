import { getIATA } from "./iata";

describe("getIATA", () => {
    it("retourne le code IATA d'une ville connue", () => {
        expect(getIATA("Paris")).toBe("CDG");
    });

    it("ignore la casse pour une ville connue", () => {
        expect(getIATA("paris")).toBe("CDG");
    });

    it("fait un match partiel quand la ville contient un nom connu", () => {
        // "New York City" contient "New York" dans la table IATA
        expect(getIATA("New York City")).toBe("JFK");
    });

    it("retourne XXX pour une chaîne vide", () => {
        expect(getIATA("")).toBe("XXX");
    });

    it("retourne un code de secours sur 3 lettres pour une ville inconnue", () => {
        expect(getIATA("Villefranche")).toBe("VIL");
    });
});
