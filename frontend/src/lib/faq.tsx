import Link from "next/link";

// Questions fréquentes : page /aide et bas de l'accueil
export const FAQ: { q: string; a: React.ReactNode }[] = [
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
