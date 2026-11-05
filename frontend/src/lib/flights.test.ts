import { flightCoverage, type Plan, type PlanItem } from "./plan";
import { sightPrice } from "./travel/wikipedia";

const plan = (items: Partial<PlanItem>[]): Plan => ({
  destination: "Lisbonne",
  origin: "Paris",
  depart: "2026-12-10",
  ret: "2026-12-17",
  travelers: 2,
  createdAt: 0,
  items: items.map((i, n) => ({ key: `k${n}`, type: "flight", title: "Vol", price: 100, ...i })) as PlanItem[],
});

describe("flightCoverage", () => {
  it("un aller-retour couvre l'aller et le retour", () => {
    expect(flightCoverage(plan([{ leg: "roundtrip" }]))).toEqual({ outbound: true, return: true });
  });

  it("un aller seul laisse le retour à choisir", () => {
    expect(flightCoverage(plan([{ leg: "outbound" }]))).toEqual({ outbound: true, return: false });
  });

  it("aller puis retour séparés couvrent le voyage", () => {
    expect(flightCoverage(plan([{ leg: "outbound" }, { leg: "return" }]))).toEqual({ outbound: true, return: true });
  });

  it("sans vol, rien n'est couvert", () => {
    expect(flightCoverage(plan([]))).toEqual({ outbound: false, return: false });
  });
});

describe("sightPrice", () => {
  it("les lieux publics sont gratuits", () => {
    expect(sightPrice("Place Jemaa el-Fna")).toBe(0);
    expect(sightPrice("Bairro Alto")).toBe(0);
  });

  it("les musées et palais ont une entrée payante estimée", () => {
    expect(sightPrice("Musée de Marrakech")).toBe(12);
    expect(sightPrice("Palais de Bemposta")).toBe(12);
  });
});

import { tripDays } from "./plan";

describe("tripDays", () => {
  it("liste chaque jour du séjour, arrivée et départ compris", () => {
    const days = tripDays(plan([]));
    expect(days).toHaveLength(8);
    expect(days[0].date).toBe("2026-12-10");
    expect(days[7].date).toBe("2026-12-17");
    expect(days[0].label).toMatch(/^Jour 1 · /);
  });
});
