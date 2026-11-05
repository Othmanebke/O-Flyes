"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/ui/Logo";
import Photo from "@/components/ui/Photo";
import { TIERS } from "@/lib/catalog";
import { getPlan, getPrefs, setPrefs } from "@/lib/plan";
import { createClient } from "@/lib/supabase/browser";
import { supabaseConfigured } from "@/lib/session";

const STYLES = ["Culture", "Plage", "Nature", "Gastronomie", "Aventure", "Bien-être", "Histoire", "Fête"];

async function finish(prefs: { city: string; budget: string; styles: string[] }) {
  setPrefs(prefs);
  localStorage.setItem("aivana-onboarded", "1");
  if (supabaseConfigured()) {
    try {
      await createClient().auth.updateUser({ data: { onboarded: true, prefs } });
    } catch {
      /* préférences gardées localement */
    }
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [city, setCity] = useState("Paris");
  const [budget, setBudget] = useState("Confort");
  const [styles, setStyles] = useState<string[]>(["Culture", "Gastronomie"]);

  useEffect(() => {
    const p = getPrefs();
    if (p.city) setCity(p.city);
    if (p.budget) setBudget(p.budget);
    if (p.styles?.length) setStyles(p.styles);
  }, []);

  const prefs = { city: city.trim() || "Paris", budget, styles };
  const range = TIERS.find(t => t.label === budget)?.range || "";

  const next = async () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    await finish(prefs);
    router.push(getPlan() ? "/dashboard" : "/assistant");
  };
  const skip = async () => {
    await finish(prefs);
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="flex h-16 items-center justify-between border-b border-line px-6">
        <Link href="/" className="plain-link text-ink" aria-label="Accueil">
          <Logo size={28} />
        </Link>
        <button onClick={skip} className="text-sm text-muted hover:text-ink">
          Passer
        </button>
      </div>
      <div className="flex flex-1">
        <div className="flex flex-1 justify-center px-6 py-14">
          <div className="flex w-full max-w-[560px] flex-col gap-8">
            <div className="flex flex-col gap-2.5">
              <span className="text-[13px] text-muted">Étape {step} sur 3</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 3].map(n => (
                  <div key={n} className={`h-[3px] rounded-sm ${n <= step ? "bg-gold-deep" : "bg-line"}`} />
                ))}
              </div>
            </div>

            {step === 1 && (
              <div className="flex flex-col gap-7">
                <div className="flex flex-col gap-2">
                  <h1 className="m-0 text-[clamp(30px,4vw,40px)] leading-[1.1]">
                    Bienvenue <em className="accent">à bord</em>
                  </h1>
                  <p className="m-0 text-base text-muted-2">
                    Trois réponses pour que le copilote vise juste dès la première recherche.
                  </p>
                </div>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold">Vous partez généralement de</span>
                  <input
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="h-[46px] rounded-full border border-line-2 bg-cream px-3.5 text-[15px] text-ink outline-none focus:border-gold-deep"
                  />
                </label>
                <div className="flex flex-col gap-2.5">
                  <span className="text-sm font-semibold">Budget habituel par voyage, pour deux</span>
                  <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))]">
                    {TIERS.map(t => (
                      <button
                        key={t.label}
                        onClick={() => setBudget(t.label)}
                        aria-pressed={budget === t.label}
                        className={`flex flex-col gap-0.5 rounded-full border px-4 py-3 text-left ${budget === t.label ? "border-gold-deep bg-gold-deep/[0.08]" : "border-line-2 bg-cream"}`}
                      >
                        <span className="text-sm font-semibold">{t.label}</span>
                        <span className="text-xs text-muted">{t.range}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2.5">
                  <span className="text-sm font-semibold">
                    Ce que vous aimez <span className="font-normal text-muted">· plusieurs choix</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {STYLES.map(s => {
                      const on = styles.includes(s);
                      return (
                        <button
                          key={s}
                          onClick={() => setStyles(on ? styles.filter(x => x !== s) : [...styles, s])}
                          aria-pressed={on}
                          className={`rounded-full border px-[13px] py-2 text-sm ${on ? "border-ink bg-ink text-paper" : "border-line-2 text-muted-2"}`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <h1 className="m-0 text-[clamp(30px,4vw,40px)] leading-[1.1]">Comment ça marche</h1>
                  <p className="m-0 text-base text-muted-2">
                    AIVANA prépare le voyage avec vous ; vous réservez ensuite chez les partenaires.
                  </p>
                </div>
                <div className="flex flex-col gap-2.5">
                  {[
                    [
                      "Composer votre voyage",
                      "Le copilote propose des destinations chiffrées. Vous ajoutez vols, hôtel et activités : tout se range dans le carnet avec le budget.",
                      "Disponible",
                      "text-ok",
                    ],
                    [
                      "Réserver chez les partenaires",
                      "Chaque élément du carnet renvoie vers la compagnie, Booking.com ou GetYourGuide pour réserver.",
                      "Disponible",
                      "text-ok",
                    ],
                    [
                      "Importer vos réservations depuis Gmail ou Outlook",
                      "AIVANA lira vos confirmations et remplira le carnet pour vous.",
                      "Bientôt",
                      "text-gold-deep",
                    ],
                  ].map(([t, d, tag, c]) => (
                    <div
                      key={t}
                      className="flex items-start justify-between gap-4 rounded-[20px] border border-line-2 bg-cream p-4"
                    >
                      <span className="flex flex-col gap-1">
                        <span className="text-[15px] font-semibold">{t}</span>
                        <span className="text-sm leading-normal text-muted-2">{d}</span>
                      </span>
                      <span className={`whitespace-nowrap text-xs ${c}`}>{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-5">
                <h1 className="m-0 text-[clamp(30px,4vw,40px)] leading-[1.1]">C&apos;est prêt</h1>
                <div className="flex flex-col border-t border-line">
                  {[
                    ["Départ", prefs.city],
                    ["Budget", `${budget} · ${range}`],
                    ["Envies", styles.length ? styles.join(", ") : "Non précisé"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 border-b border-line py-[13px] text-sm">
                      <span className="text-muted-2">{k}</span>
                      <span className="text-right">{v}</span>
                    </div>
                  ))}
                </div>
                <p className="m-0 text-[15px] text-muted-2">Modifiable à tout moment dans les paramètres du carnet.</p>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                className={`py-2.5 text-sm ${step > 1 ? "text-muted-2" : "invisible"}`}
              >
                Retour
              </button>
              <button
                onClick={next}
                className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper hover:bg-ink-2"
              >
                {step === 3 ? "Planifier mon premier voyage" : "Continuer"}
              </button>
            </div>
          </div>
        </div>
        <div className="relative m-4 hidden w-[40%] max-w-[620px] overflow-hidden rounded-[28px] lg:block">
          <Photo
            k={step === 1 ? "backpack" : step === 2 ? "map" : "balloons"}
            sizes="40vw"
            className="absolute inset-0"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(8,14,26,0.6) 0%, rgba(8,14,26,0) 55%)" }}
          />
          <span className="absolute bottom-6 left-6 right-6 font-serif text-[26px] italic text-white">
            {step === 1
              ? "Dites-nous comment vous voyagez."
              : step === 2
                ? "Vous préparez, vous réservez."
                : "Prêt pour le départ."}
          </span>
        </div>
      </div>
    </div>
  );
}
