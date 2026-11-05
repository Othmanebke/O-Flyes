import { airportCode, routeOptions, ROUTES } from "./airlines";
import { DESTINATIONS } from "../catalog";
import { GENERIC, LODGING } from "./lodging";

describe("airportCode", () => {
  it("donne le vrai code des destinations du catalogue", () => {
    expect(airportCode("Medellín")).toBe("MDE");
    expect(airportCode("Reykjavik")).toBe("KEF");
    expect(airportCode("Dubaï")).toBe("DXB");
    expect(airportCode("Malé")).toBe("MLE");
  });

  it("n'invente pas de code pour une ville inconnue", () => {
    expect(airportCode("Ljubljana")).toBeNull();
  });
});

describe("routeOptions", () => {
  it("Paris → Marrakech : compagnies de la ligne, dont Transavia depuis Orly", () => {
    const { options, known, reverse } = routeOptions("Paris", "Marrakech");
    expect(known).toBe(true);
    expect(reverse).toBe(false);
    expect(options).toContainEqual(expect.objectContaining({ airline: "Transavia", paris: "ORY" }));
    expect(options.map(o => o.airline)).toContain("Royal Air Maroc");
  });

  it("le vol retour Marrakech → Paris reprend les mêmes compagnies", () => {
    const { options, reverse } = routeOptions("Marrakech", "Paris");
    expect(reverse).toBe(true);
    expect(options.map(o => o.airline)).toContain("Transavia");
  });

  it("chaque destination du catalogue a ses compagnies", () => {
    for (const d of DESTINATIONS) expect(ROUTES[d.code]?.length).toBeGreaterThan(0);
  });
});

describe("hébergements", () => {
  it("chaque destination du catalogue a ses types de logement", () => {
    for (const d of DESTINATIONS) expect(LODGING[d.id]?.length).toBeGreaterThanOrEqual(3);
  });

  it("le Maroc propose des riads", () => {
    expect(LODGING.t1.map(l => l.label).join(" ")).toMatch(/Riad/);
  });

  it("les villes hors catalogue ont des types génériques", () => {
    expect(GENERIC.length).toBeGreaterThan(0);
  });
});
