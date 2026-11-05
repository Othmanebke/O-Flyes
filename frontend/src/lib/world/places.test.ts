import { DESTINATIONS, GEO, MONTHS_SHORT, findDestination, searchCity } from "@/lib/catalog";
import { PHOTOS, isPhotoKey } from "@/lib/photos";
import { ROUTES } from "@/lib/travel/airlines";
import { LODGING } from "@/lib/travel/lodging";
import { adviceFor } from "@/lib/travel/advice";
import { CITY_PHOTOS } from "@/lib/world/cityPhotos";
import { PLACES } from "@/lib/world/places";

describe("villes ajoutées", () => {
  it.each(PLACES.map(p => [p.name, p] as const))("%s est aussi complète qu'une destination d'origine", (_, p) => {
    const d = findDestination(p.name);
    expect(d?.id).toBe(p.id);
    expect(CITY_PHOTOS[p.code as keyof typeof CITY_PHOTOS]).toBeDefined();
    expect(isPhotoKey(p.code)).toBe(true);
    expect(ROUTES[p.code]?.length).toBeGreaterThan(0);
    expect(LODGING[p.id]?.length).toBeGreaterThanOrEqual(2);
    expect(GEO[p.id]).toBeDefined();
    expect(adviceFor(p.country).known).toBe(true);
    for (const m of p.months) expect(MONTHS_SHORT).toContain(m);
    for (const l of LODGING[p.id]) expect(isPhotoKey(l.photo)).toBe(true);
    expect(searchCity(d!)).toBe(p.searchCity || p.name);
  });

  it("n'a ni identifiant ni code aéroport en double", () => {
    const ids = DESTINATIONS.map(d => d.id),
      codes = DESTINATIONS.map(d => d.code);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(codes).size).toBe(codes.length);
    for (const c of Object.keys(CITY_PHOTOS)) expect(c in PHOTOS).toBe(false);
  });

  it("retrouve les villes par leurs autres noms", () => {
    expect(findDestination("Barcelona")?.name).toBe("Barcelone");
    expect(findDestination("Tulum")?.name).toBe("Cancún");
    expect(findDestination("Positano")?.name).toBe("Naples");
    expect(findDestination("Chefchaouen")?.name).toBe("Tanger");
    expect(findDestination("Canada")?.name).toBe("Montréal");
    expect(findDestination("Espagne")?.country).toBe("Espagne");
    expect(findDestination("Brésil")?.country).toBe("Brésil");
    expect(findDestination("Osaka")?.name).toBe("Osaka");
    expect(findDestination("Kyoto")?.id).toBe("c1");
  });
});
