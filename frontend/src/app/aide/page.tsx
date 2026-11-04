import Link from "next/link";
import PageBanner from "@/components/layout/PageBanner";

export const metadata = { title: "Aide et questions fréquentes" };

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: "Qu'est-ce qu'AIVANA ?",
    a: "Un copilote de voyage. Vous décrivez votre budget, vos dates et vos envies ; il propose des destinations avec un coût total estimé. Vous ajoutez ensuite vols, hébergement et activités, et tout se range dans votre carnet avec le budget à jour.",
  },
  {
    q: "Est-ce qu'AIVANA réserve à ma place ?",
    a: "Non. AIVANA vous aide à préparer et à budgéter le voyage. Chaque vol, hébergement ou activité renvoie vers le partenaire (Google Flights, Booking.com, GetYourGuide) avec vos dates : c'est là que vous réservez et payez.",
  },
  {
    q: "D'où viennent les prix ?",
    a: "Ce sont des estimations, signalées comme telles sur tout le site. Elles partent des tarifs habituels de chaque ligne aérienne et des prix moyens d'hébergement de chaque destination. Il n'existe plus d'API gratuite de prix en direct : pour le tarif exact du jour, suivez le lien vers le partenaire.",
  },
  {
    q: "Les compagnies et hébergements affichés sont-ils réels ?",
    a: "Oui pour les 22 destinations du catalogue : ce sont les compagnies qui desservent habituellement la ligne depuis Paris, et les types de logement typiques du pays (riad à Marrakech, ryokan au Japon…). Les horaires sont indicatifs, le programme des compagnies variant selon la saison.",
  },
  {
    q: "Faut-il un compte ?",
    a: <>Non pour découvrir et composer un voyage : il est gardé dans votre navigateur. Un compte (lien par email ou Google) sert à le sauvegarder, à le retrouver sur tous vos appareils et à recevoir un itinéraire jour par jour. <Link href="/auth/login">Créer un compte</Link></>,
  },
  {
    q: "D'où viennent la météo, le change et les lieux à voir ?",
    a: "De sources ouvertes et gratuites : Open-Meteo (températures et pluie relevées l'année précédente pour le mois de votre voyage), un service public de taux de change mis à jour chaque jour, et Wikipédia pour les lieux et leurs photos.",
  },
  {
    q: "Que deviennent mes données ?",
    a: <>Sans compte, rien ne quitte votre navigateur, sauf les messages envoyés au copilote. Avec un compte, nous gardons votre email, votre nom et vos voyages, que vous pouvez supprimer depuis le carnet. <Link href="/legal#confidentialite">Politique de confidentialité</Link></>,
  },
];

export default function AidePage() {
  return (
    <div className="bg-paper">
      <PageBanner k="map" />
      <div className="mx-auto flex max-w-[820px] flex-col gap-8 px-6 pb-24 pt-12">
        <div className="flex flex-col gap-3">
          <h1 className="m-0 text-[clamp(36px,4.6vw,56px)] leading-[1.05]">Questions <em className="accent">fréquentes</em></h1>
          <p className="m-0 text-base text-muted-2">Tout ce qu&apos;il faut savoir avant de préparer votre voyage avec AIVANA.</p>
        </div>
        <div className="flex flex-col border-t border-line">
          {FAQ.map(f => (
            <details key={f.q} className="group border-b border-line py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold tracking-[-0.02em] [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line-2 text-lg transition-transform group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <div className="pt-3 text-[15px] leading-relaxed text-muted-2">{f.a}</div>
            </details>
          ))}
        </div>
        <p className="m-0 text-[15px] text-muted-2">Une autre question ? <Link href="/contact">Écrivez-nous</Link>.</p>
      </div>
    </div>
  );
}
