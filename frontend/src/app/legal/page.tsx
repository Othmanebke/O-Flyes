export const metadata = { title: "Mentions légales et confidentialité – AIVANA" };

export default function LegalPage() {
  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-8 px-6 pb-24 pt-12 text-[16px] leading-[1.7]">
      <h1 className="m-0 text-[clamp(32px,4.4vw,48px)] leading-[1.08]">Mentions <em className="accent">légales</em></h1>
      <section className="flex flex-col gap-2">
        <h2 className="m-0 text-2xl">Le service</h2>
        <p className="m-0">AIVANA est un projet étudiant de planification de voyage. Il aide à comparer des destinations, des vols, des hôtels et des activités, mais ne vend aucune prestation : les réservations se font directement chez les partenaires (compagnies aériennes, Booking.com, GetYourGuide).</p>
        <p className="m-0">Les prix affichés sont indicatifs. Lorsqu&apos;ils sont marqués « estimé », ils proviennent de notre catalogue et non d&apos;un tarif en direct. Vérifiez toujours le prix final chez le partenaire.</p>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="m-0 text-2xl">Conditions d&apos;utilisation</h2>
        <p className="m-0">Le copilote est gratuit, dans la limite de 5 recherches par mois sans compte. Les propositions de l&apos;IA peuvent contenir des erreurs : elles servent de point de départ, pas de conseil garanti.</p>
      </section>
      <section id="confidentialite" className="flex scroll-mt-28 flex-col gap-2">
        <h2 className="m-0 text-2xl">Confidentialité</h2>
        <p className="m-0">Sans compte, votre voyage en cours et la conversation avec le copilote sont enregistrés uniquement dans votre navigateur (stockage local). Un cookie compte vos recherches gratuites du mois.</p>
        <p className="m-0">Avec un compte (connexion par email ou Google), nous conservons votre email, votre nom et vos voyages sauvegardés. Les messages envoyés au copilote sont transmis au fournisseur d&apos;IA (Groq) pour générer la réponse.</p>
        <p className="m-0">Vous pouvez supprimer vos voyages depuis le carnet. Pour supprimer votre compte, écrivez-nous depuis l&apos;adresse associée.</p>
      </section>
      <p className="m-0 text-sm text-muted">Photos : Unsplash.</p>
    </div>
  );
}
