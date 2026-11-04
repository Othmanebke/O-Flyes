import Link from "next/link";
import PageBanner from "@/components/layout/PageBanner";
import { CONTACT_EMAIL, EDITOR, SCHOOL } from "@/lib/site";

export const metadata = { title: "Mentions légales et confidentialité" };

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="flex scroll-mt-28 flex-col gap-2">
      <h2 className="m-0 text-2xl">{title}</h2>
      {children}
    </section>
  );
}

export default function LegalPage() {
  return (
    <>
      <PageBanner k="notebook" />
      <div className="mx-auto flex max-w-[760px] flex-col gap-8 px-6 pb-24 pt-12 text-[16px] leading-[1.7]">
        <h1 className="m-0 text-[clamp(32px,4.4vw,48px)] leading-[1.08]">Mentions <em className="accent">légales</em></h1>

        <Section title="Éditeur du site">
          <p className="m-0">
            AIVANA est un projet étudiant réalisé dans le cadre d&apos;un cursus à {SCHOOL}, sans activité commerciale.<br />
            Responsable de la publication : {EDITOR}.<br />
            Contact : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> · <Link href="/contact">formulaire de contact</Link>
          </p>
        </Section>

        <Section title="Hébergement">
          <p className="m-0">
            Site : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis, lors de sa mise en ligne.<br />
            Base de données et comptes : Supabase Inc.
          </p>
        </Section>

        <Section title="Le service">
          <p className="m-0">AIVANA aide à comparer des destinations, des vols, des hébergements et des activités, mais ne vend aucune prestation : les réservations se font directement chez les partenaires (compagnies aériennes, Booking.com, GetYourGuide).</p>
          <p className="m-0">Les prix affichés sont des estimations, signalées comme telles. Vérifiez toujours le prix final chez le partenaire avant de réserver.</p>
        </Section>

        <Section title="Conditions d'utilisation">
          <p className="m-0">Le site est un projet pédagogique, gratuit et sans publicité. Les propositions de l&apos;IA peuvent contenir des erreurs : elles servent de point de départ, pas de conseil garanti.</p>
        </Section>

        <Section id="confidentialite" title="Confidentialité">
          <p className="m-0">Sans compte, votre voyage en cours et la conversation avec le copilote restent dans votre navigateur (stockage local).</p>
          <p className="m-0">Avec un compte (connexion par email, Google ou GitHub), nous conservons votre email, votre nom, vos préférences de voyage et vos voyages sauvegardés. Les messages envoyés au copilote sont transmis au fournisseur d&apos;IA (Groq) pour générer la réponse.</p>
          <p className="m-0">Inscription à la lettre mensuelle : seule l&apos;adresse email est conservée ; vous pouvez <Link href="/newsletter">vous désinscrire</Link> à tout moment.</p>
          <p className="m-0">Vos droits (accès, portabilité, rectification, effacement) s&apos;exercent directement dans <Link href="/dashboard?settings=1">Paramètres du compte</Link> : téléchargement de toutes vos données au format JSON et suppression définitive du compte et de vos voyages. Vous pouvez aussi écrire à <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Les connexions sont protégées par HTTPS, et la double authentification peut être activée dans les paramètres.</p>
        </Section>

        <Section title="Crédits">
          <p className="m-0">Photos : Unsplash et Wikipédia (photos des lieux, sous licences libres). Météo : Open-Meteo. Taux de change : ExchangeRate-API. Géolocalisation : OpenStreetMap (Photon).</p>
        </Section>
      </div>
    </>
  );
}
