import { safeNext } from "./safeNext";
import { isUuid } from "./api/guard";
import { limitPublic } from "./api/rateLimit";
import { emailVerified, cleanCode, maskEmail } from "./emailCode";

// guard.ts importe le client Supabase serveur (next/headers) : on le neutralise
jest.mock("@/lib/supabase/server", () => ({ createClient: jest.fn() }));

describe("safeNext (anti redirection ouverte)", () => {
  it("garde les chemins internes", () => {
    expect(safeNext("/dashboard?trip=1")).toBe("/dashboard?trip=1");
    expect(safeNext("/newsletter")).toBe("/newsletter");
  });
  it("refuse les URL externes et les variantes piégées", () => {
    expect(safeNext("https://evil.com")).toBe("/dashboard");
    expect(safeNext("//evil.com")).toBe("/dashboard");
    expect(safeNext("/\\evil.com")).toBe("/dashboard");
    expect(safeNext("javascript:alert(1)")).toBe("/dashboard");
    expect(safeNext(null)).toBe("/dashboard");
  });
});

describe("isUuid", () => {
  it("accepte un UUID et refuse le reste", () => {
    expect(isUuid("3f2b8c1e-9a4d-4e6f-8b2a-1c3d5e7f9a0b")).toBe(true);
    expect(isUuid("1' OR '1'='1")).toBe(false);
    expect(isUuid("")).toBe(false);
  });
});

describe("limitPublic (limitation par IP)", () => {
  const req = (ip: string) => new Request("http://localhost/api/x", { headers: { "x-forwarded-for": ip } });
  it("bloque au-delà du maximum, IP par IP", () => {
    for (let i = 0; i < 3; i++) expect(limitPublic(req("9.9.9.9"), "test", 3, 60)).toBeNull();
    expect(limitPublic(req("9.9.9.9"), "test", 3, 60)?.status).toBe(429);
    // une autre IP n'est pas concernée
    expect(limitPublic(req("8.8.8.8"), "test", 3, 60)).toBeNull();
  });
});

describe("emailVerified (double authentification par code email)", () => {
  const jwt = (payload: object) => `x.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.y`;
  it("accepte une session validée par code email", () => {
    expect(emailVerified(jwt({ amr: [{ method: "otp", timestamp: 1 }] }))).toBe(true);
  });
  it("refuse une session Google/GitHub seule", () => {
    expect(emailVerified(jwt({ amr: [{ method: "oauth", timestamp: 1 }] }))).toBe(false);
  });
  it("refuse un jeton absent ou illisible", () => {
    expect(emailVerified(null)).toBe(false);
    expect(emailVerified("pas-un-jwt")).toBe(false);
    expect(emailVerified(jwt({}))).toBe(false);
  });
  it("nettoie le code saisi et masque l’email", () => {
    expect(cleanCode("12 34-56ab78901234")).toBe("1234567890");
    expect(maskEmail("othmane@gmail.com")).toBe("oth•••@gmail.com");
  });
});
