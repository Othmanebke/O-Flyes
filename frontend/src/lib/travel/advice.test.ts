import { DESTINATIONS } from "@/lib/catalog";
import { adviceFor } from "@/lib/travel/advice";

describe("adviceFor", () => {
    it("a des conseils pour chaque pays du catalogue", () => {
        for (const d of DESTINATIONS) {
            const a = adviceFor(d.country);
            expect(a.known).toBe(true);
            expect(a.tips.length).toBeGreaterThan(1);
            expect(a.url).toMatch(/^https:\/\/www\.diplomatie\.gouv\.fr\//);
        }
    });

    it("retombe sur les conseils généraux pour un pays inconnu", () => {
        const a = adviceFor("Atlantide");
        expect(a.known).toBe(false);
        expect(a.tips).toHaveLength(0);
        expect(a.generic.length).toBeGreaterThan(0);
    });
});
