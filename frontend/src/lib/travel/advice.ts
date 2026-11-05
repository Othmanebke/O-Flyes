/* « Bon à savoir avant de partir » : formalités, transports, sécurité et usages,
   pour un voyageur de nationalité française. Ce sont des repères, pas une source
   officielle : les règles changent, chaque fiche renvoie donc vers les conseils
   aux voyageurs du ministère des Affaires étrangères (France Diplomatie). */

export type AdviceKind = "Formalités" | "Transports" | "Sécurité" | "Santé" | "Usages";

export interface Advice {
  kind: AdviceKind;
  text: string;
}

interface CountryAdvice {
  slug: string; // page France Diplomatie
  tips: Advice[];
}

const A = (kind: AdviceKind, text: string): Advice => ({ kind, text });

const COUNTRIES: Record<string, CountryAdvice> = {
  Maroc: {
    slug: "maroc",
    tips: [
      A(
        "Formalités",
        "Pas de visa pour un séjour touristique de moins de 3 mois : passeport valide pour toute la durée du séjour.",
      ),
      A(
        "Transports",
        "En ville, prenez les petits taxis et demandez que le compteur soit allumé (sinon, fixez le prix avant de monter). Entre deux villes, ce sont les grands taxis, prix convenu à l'avance.",
      ),
      A(
        "Transports",
        "Les applications de VTC comme inDrive ne sont pas autorisées : chauffeurs et passagers peuvent être contrôlés. Préférez les taxis officiels ou un transfert organisé par votre riad.",
      ),
      A(
        "Sécurité",
        "Dans la médina, déclinez poliment les « guides » qui vous abordent ou affirment qu'une rue est fermée. Sur la place Jemaa el-Fna, méfiez-vous du henné et des photos imposés puis facturés.",
      ),
      A("Santé", "Buvez de l'eau en bouteille et évitez les glaçons et crudités dans les endroits peu fréquentés."),
      A(
        "Usages",
        "Tenue couvrant épaules et genoux appréciée hors des quartiers touristiques. Pendant le ramadan, évitez de manger et boire en public la journée.",
      ),
    ],
  },
  Portugal: {
    slug: "portugal",
    tips: [
      A("Formalités", "Carte d'identité ou passeport en cours de validité."),
      A(
        "Sécurité",
        "Pickpockets fréquents dans le tram 28 et les quartiers très touristiques de Lisbonne : gardez sac et téléphone devant vous.",
      ),
      A("Transports", "Les pavés (calçada) sont très glissants par temps de pluie : chaussures adaptées."),
      A("Santé", "Emportez votre carte européenne d'assurance maladie (CEAM)."),
    ],
  },
  Indonésie: {
    slug: "indonesie",
    tips: [
      A(
        "Formalités",
        "Visa à l'arrivée payant (ou e-VOA en ligne avant le départ), passeport valide au moins 6 mois. Bali prélève en plus une taxe touristique à régler en ligne ou à l'arrivée.",
      ),
      A(
        "Transports",
        "Pour conduire un scooter, il faut un permis international avec la catégorie moto et un casque : les contrôles sont fréquents et l'assurance ne couvre pas sans permis valable.",
      ),
      A(
        "Sécurité",
        "Courants forts sur certaines plages : baignez-vous entre les drapeaux. Sur les volcans, partez avec un guide agréé.",
      ),
      A("Santé", "Eau en bouteille uniquement. Protection contre les moustiques (dengue)."),
      A("Usages", "Dans les temples, épaules et jambes couvertes (sarong souvent prêté à l'entrée)."),
    ],
  },
  Colombie: {
    slug: "colombie",
    tips: [
      A(
        "Formalités",
        "Pas de visa pour un séjour touristique de moins de 90 jours. Formulaire d'entrée Check-MIG à remplir en ligne avant le vol.",
      ),
      A(
        "Transports",
        "Évitez de héler un taxi dans la rue, surtout le soir : faites-le commander par l'hôtel ou par une application.",
      ),
      A(
        "Sécurité",
        "N'exhibez pas votre téléphone ni vos bijoux dans la rue. N'acceptez ni boisson ni cigarette d'inconnus (risque de drogue type scopolamine).",
      ),
      A("Santé", "Vaccin contre la fièvre jaune recommandé selon les régions visitées."),
    ],
  },
  "Nouvelle-Zélande": {
    slug: "nouvelle-zelande",
    tips: [
      A(
        "Formalités",
        "Autorisation électronique NZeTA obligatoire avant le départ, avec une taxe touristique (IVL) à payer en même temps.",
      ),
      A(
        "Transports",
        "Conduite à gauche. Permis international ou traduction officielle de votre permis requis pour louer une voiture.",
      ),
      A(
        "Usages",
        "Contrôles biosécurité très stricts : déclarez tout aliment, plante ou matériel de randonnée sale à l'arrivée, sous peine d'amende.",
      ),
      A(
        "Sécurité",
        "En montagne, la météo change vite : laissez votre itinéraire à quelqu'un et vérifiez les conditions avant chaque randonnée.",
      ),
    ],
  },
  Hongrie: {
    slug: "hongrie",
    tips: [
      A("Formalités", "Carte d'identité ou passeport en cours de validité."),
      A(
        "Transports",
        "Prenez uniquement des taxis officiels jaunes ou une application (Bolt) : les autres pratiquent des prix abusifs.",
      ),
      A(
        "Sécurité",
        "Évitez les bureaux de change de rue et les invitations dans des bars par des inconnus : addition très salée.",
      ),
      A("Santé", "Emportez votre carte européenne d'assurance maladie (CEAM)."),
    ],
  },
  Géorgie: {
    slug: "georgie",
    tips: [
      A(
        "Formalités",
        "Pas de visa pour un séjour touristique : passeport ou carte d'identité selon les conditions en vigueur, à vérifier avant le départ.",
      ),
      A(
        "Transports",
        "Utilisez une application (Bolt) plutôt que les taxis sans compteur. La conduite locale est rapide et imprévisible.",
      ),
      A("Sécurité", "Les régions d'Abkhazie et d'Ossétie du Sud sont formellement déconseillées."),
      A("Usages", "Dans les églises, épaules couvertes et, pour les femmes, un foulard est souvent demandé."),
    ],
  },
  Thaïlande: {
    slug: "thailande",
    tips: [
      A(
        "Formalités",
        "Pas de visa pour un séjour touristique court (durée de l'exemption à vérifier, elle évolue). Carte d'arrivée en ligne (TDAC) à remplir dans les jours qui précèdent l'arrivée. Passeport valide au moins 6 mois.",
      ),
      A(
        "Transports",
        "Pour louer un scooter, il faut un permis international avec la catégorie moto, en plus de votre permis. Sans lui : amende, et l'assurance ne couvre pas en cas d'accident.",
      ),
      A(
        "Sécurité",
        "Méfiez-vous des tuk-tuk qui annoncent qu'un temple est « fermé aujourd'hui » pour vous emmener dans une boutique. À Phuket, photographiez le jet-ski avant location pour éviter les dégâts facturés.",
      ),
      A("Sécurité", "Les peines pour usage ou possession de drogue sont très lourdes."),
      A("Usages", "La critique de la famille royale est un délit. Tenue couvrante dans les temples."),
    ],
  },
  Vietnam: {
    slug: "vietnam",
    tips: [
      A(
        "Formalités",
        "Exemption de visa pour un séjour touristique court (durée à vérifier), sinon e-visa en ligne sur le site officiel. Passeport valide au moins 6 mois.",
      ),
      A(
        "Transports",
        "Conduire un scooter demande un permis reconnu au Vietnam : sans, l'assurance ne couvre pas. Les applications (Grab) évitent les négociations de prix.",
      ),
      A("Sécurité", "Vols à l'arraché à scooter dans les grandes villes : téléphone côté trottoir à éviter."),
      A("Santé", "Eau en bouteille. Protection contre les moustiques."),
    ],
  },
  Pologne: {
    slug: "pologne",
    tips: [
      A("Formalités", "Carte d'identité ou passeport en cours de validité."),
      A("Transports", "Taxis commandés par téléphone ou application plutôt que pris à la sortie des gares."),
      A("Santé", "Emportez votre carte européenne d'assurance maladie (CEAM)."),
    ],
  },
  Grèce: {
    slug: "grece",
    tips: [
      A("Formalités", "Carte d'identité ou passeport en cours de validité."),
      A(
        "Transports",
        "Pour louer un quad ou un scooter (Santorin), il faut le permis correspondant et un casque. Les accidents de quad sont fréquents.",
      ),
      A("Santé", "Fortes chaleurs en été : évitez les visites en plein soleil entre 12 h et 16 h. CEAM à emporter."),
    ],
  },
  Turquie: {
    slug: "turquie",
    tips: [
      A(
        "Formalités",
        "Pas de visa pour un séjour touristique de moins de 90 jours : passeport valide au moins 150 jours après l'arrivée.",
      ),
      A("Transports", "Exigez le taximètre, ou commandez par application (BiTaksi)."),
      A(
        "Sécurité",
        "Méfiez-vous des inconnus très sympathiques qui proposent un verre dans un bar : addition exorbitante. Évitez les manifestations.",
      ),
      A("Usages", "Dans les mosquées, épaules et jambes couvertes, foulard pour les femmes, chaussures retirées."),
    ],
  },
  Argentine: {
    slug: "argentine",
    tips: [
      A("Formalités", "Pas de visa pour un séjour touristique de moins de 90 jours."),
      A(
        "Sécurité",
        "Arnaque classique à Buenos Aires : on vous signale une tache sur vos vêtements pendant qu'un complice vous vole. Gardez vos affaires en main.",
      ),
      A("Transports", "Taxis commandés (radio-taxi ou application) plutôt que hélés dans la rue la nuit."),
      A(
        "Usages",
        "Le change et les moyens de paiement évoluent souvent : renseignez-vous juste avant de partir sur le meilleur moyen de payer.",
      ),
    ],
  },
  Kenya: {
    slug: "kenya",
    tips: [
      A(
        "Formalités",
        "Autorisation électronique de voyage (eTA) obligatoire, à demander en ligne avant le départ, sur le site officiel uniquement.",
      ),
      A("Santé", "Vaccin contre la fièvre jaune recommandé, traitement antipaludique à voir avec votre médecin."),
      A(
        "Sécurité",
        "À Nairobi, évitez de marcher la nuit et utilisez des taxis commandés. Plusieurs zones frontalières sont formellement déconseillées.",
      ),
      A("Usages", "En safari, ne descendez jamais du véhicule sans l'accord du guide."),
    ],
  },
  Japon: {
    slug: "japon",
    tips: [
      A("Formalités", "Pas de visa pour un séjour touristique de moins de 90 jours : passeport valide."),
      A("Transports", "Pour conduire, permis international ou traduction officielle de votre permis obligatoire."),
      A(
        "Usages",
        "Pas de pourboire, calme dans les transports (pas d'appels), on retire ses chaussures dans les maisons, ryokan et certains temples.",
      ),
      A(
        "Santé",
        "Certains médicaments courants en France (contenant de la codéine ou de la pseudoéphédrine) sont interdits : vérifiez avant de les emporter.",
      ),
    ],
  },
  Islande: {
    slug: "islande",
    tips: [
      A("Formalités", "Carte d'identité ou passeport en cours de validité."),
      A(
        "Transports",
        "Les pistes « F » sont interdites aux véhicules non 4x4 et fermées une grande partie de l'année. Consultez l'état des routes (road.is) chaque matin. Ne vous arrêtez jamais sur la route pour une photo.",
      ),
      A(
        "Sécurité",
        "Météo très changeante : enregistrez votre itinéraire sur safetravel.is. Sur les plages de sable noir (Reynisfjara), restez loin de l'eau : vagues imprévisibles.",
      ),
      A("Usages", "La conduite hors piste est interdite et lourdement sanctionnée."),
    ],
  },
  "États-Unis": {
    slug: "etats-unis",
    tips: [
      A(
        "Formalités",
        "Autorisation ESTA payante obligatoire, à demander sur le site officiel du gouvernement américain uniquement (des sites intermédiaires la facturent bien plus cher). Passeport électronique.",
      ),
      A("Santé", "Les soins sont très chers : une assurance voyage couvrant les frais médicaux est indispensable."),
      A(
        "Usages",
        "Le pourboire est attendu au restaurant (environ 18 à 20 %), et les prix affichés s'entendent souvent hors taxes.",
      ),
    ],
  },
  Australie: {
    slug: "australie",
    tips: [
      A("Formalités", "Visa électronique eVisitor gratuit, à demander en ligne avant le départ."),
      A(
        "Transports",
        "Conduite à gauche, longues distances : prévoyez des pauses et faites attention aux animaux à l'aube et au crépuscule.",
      ),
      A(
        "Sécurité",
        "Baignez-vous entre les drapeaux rouges et jaunes, surveillés par les sauveteurs. Soleil très fort : protection indispensable.",
      ),
      A("Usages", "Contrôles biosécurité stricts : déclarez tout aliment à l'arrivée."),
    ],
  },
  Maldives: {
    slug: "maldives",
    tips: [
      A(
        "Formalités",
        "Visa gratuit délivré à l'arrivée pour un séjour touristique. Déclaration en ligne (IMUGA) à remplir avant le vol. Réservation d'hébergement et billet retour exigés.",
      ),
      A(
        "Usages",
        "Alcool interdit en dehors des resorts. Sur les îles habitées, tenue couvrante et pas de bikini hors des plages réservées aux touristes.",
      ),
      A("Santé", "Protégez-vous du soleil et utilisez une crème respectueuse des coraux."),
    ],
  },
  "Émirats arabes unis": {
    slug: "emirats-arabes-unis",
    tips: [
      A("Formalités", "Pas de visa pour un séjour touristique court : passeport valide au moins 6 mois."),
      A(
        "Santé",
        "Certains médicaments (codéine, certains somnifères ou anxiolytiques) sont interdits ou demandent une autorisation : vérifiez avant de les emporter, avec l'ordonnance.",
      ),
      A(
        "Usages",
        "Lois strictes : pas d'alcool ni de gestes affectueux en public, tenue correcte hors des plages. Pendant le ramadan, ne mangez pas et ne buvez pas en public la journée.",
      ),
    ],
  },
  France: {
    slug: "",
    tips: [
      A(
        "Formalités",
        "Territoire français (La Réunion, Antilles, Polynésie) : carte d'identité ou passeport valide, pas de formalité.",
      ),
      A(
        "Sécurité",
        "À La Réunion, ne vous baignez que dans le lagon et les zones surveillées : la baignade est interdite ailleurs à cause du risque de requins.",
      ),
      A(
        "Sécurité",
        "Aux Antilles, la saison cyclonique va de juin à novembre. Des algues sargasses s'échouent certains mois sur quelques plages : renseignez-vous sur place.",
      ),
      A(
        "Santé",
        "Protection contre les moustiques (dengue) et le soleil. Crème respectueuse des coraux pour les lagons.",
      ),
    ],
  },
  Espagne: {
    slug: "espagne",
    tips: [
      A("Formalités", "Carte d'identité ou passeport en cours de validité."),
      A(
        "Sécurité",
        "Pickpockets très actifs à Barcelone (Rambla, métro, plage) et à Madrid : sac fermé devant vous, téléphone jamais posé sur la table d'une terrasse.",
      ),
      A(
        "Usages",
        "On déjeune vers 14 h et on dîne rarement avant 21 h. Une taxe de séjour s'ajoute à l'hôtel dans plusieurs régions (Catalogne, Baléares).",
      ),
      A(
        "Santé",
        "Emportez votre carte européenne d'assurance maladie (CEAM). En été, l'Andalousie dépasse souvent 40 °C.",
      ),
    ],
  },
  Italie: {
    slug: "italie",
    tips: [
      A("Formalités", "Carte d'identité ou passeport en cours de validité."),
      A(
        "Transports",
        "En voiture, n'entrez pas dans les zones à trafic limité (ZTL) des centres historiques : les caméras envoient l'amende des mois plus tard. Compostez les billets de train régionaux et de bus.",
      ),
      A(
        "Usages",
        "Venise fait payer une taxe d'accès aux visiteurs à la journée certains jours de forte affluence (ceux qui y dorment paient la taxe de séjour à la place).",
      ),
      A("Sécurité", "Pickpockets dans le métro de Rome et autour des grands monuments."),
    ],
  },
  Croatie: {
    slug: "croatie",
    tips: [
      A("Formalités", "Carte d'identité ou passeport en cours de validité. La monnaie est l'euro."),
      A(
        "Usages",
        "À Split, Dubrovnik ou Hvar, se promener en maillot de bain dans la vieille ville peut être sanctionné d'une amende.",
      ),
      A(
        "Santé",
        "Beaucoup de plages sont en galets avec des oursins : des chaussures d'eau sont utiles. CEAM à emporter.",
      ),
    ],
  },
  "Royaume-Uni": {
    slug: "royaume-uni",
    tips: [
      A(
        "Formalités",
        "Passeport obligatoire (la carte d'identité n'est plus acceptée). Autorisation électronique de voyage (ETA) payante à demander en ligne avant le départ, sur le site officiel du gouvernement britannique.",
      ),
      A(
        "Transports",
        "Conduite à gauche. L'Eurostar relie Paris à Londres en 2 h 20, souvent plus simple que l'avion.",
      ),
      A(
        "Usages",
        "Prises électriques de type G : prévoyez un adaptateur. Le paiement sans contact est accepté presque partout, y compris dans les bus.",
      ),
    ],
  },
  Irlande: {
    slug: "irlande",
    tips: [
      A("Formalités", "Carte d'identité ou passeport en cours de validité."),
      A("Transports", "Conduite à gauche et routes de campagne étroites. Prises électriques de type G."),
      A("Usages", "La météo change plusieurs fois par jour : une veste imperméable est indispensable, même en été."),
    ],
  },
  "Pays-Bas": {
    slug: "pays-bas",
    tips: [
      A("Formalités", "Carte d'identité ou passeport en cours de validité."),
      A(
        "Transports",
        "Ne marchez jamais sur les pistes cyclables (souvent rouges) : les vélos arrivent vite. Le train depuis Paris met environ 3 h 20.",
      ),
      A(
        "Usages",
        "Certaines boutiques n'acceptent que la carte, d'autres seulement les cartes de débit : gardez un peu d'espèces.",
      ),
    ],
  },
  Allemagne: {
    slug: "allemagne",
    tips: [
      A("Formalités", "Carte d'identité ou passeport en cours de validité."),
      A(
        "Transports",
        "Validez votre ticket avant de monter dans les transports à Berlin : les contrôles sont fréquents et l'amende immédiate.",
      ),
      A(
        "Usages",
        "Beaucoup de bars et petits restaurants n'acceptent que les espèces. Les magasins sont fermés le dimanche.",
      ),
    ],
  },
  Tunisie: {
    slug: "tunisie",
    tips: [
      A(
        "Formalités",
        "Pas de visa pour un séjour de moins de 3 mois : passeport valide (la carte d'identité n'est acceptée que pour les voyages organisés par une agence).",
      ),
      A("Transports", "Taxis jaunes : demandez que le compteur soit allumé."),
      A(
        "Sécurité",
        "Certaines zones frontalières (Libye, Algérie) sont formellement déconseillées. Les zones touristiques du littoral sont fréquentées sans difficulté.",
      ),
      A(
        "Usages",
        "Pendant le ramadan, évitez de manger et boire en public la journée. Tenue couvrante dans les médinas et les mosquées.",
      ),
    ],
  },
  Égypte: {
    slug: "egypte",
    tips: [
      A(
        "Formalités",
        "Visa obligatoire : e-visa sur le site officiel du gouvernement égyptien ou visa à l'arrivée. Passeport valide au moins 6 mois.",
      ),
      A(
        "Sécurité",
        "Aux pyramides et dans les sites, les sollicitations sont insistantes : fixez le prix d'une balade à dos de chameau avant de monter. Le nord du Sinaï et les zones frontalières sont formellement déconseillés.",
      ),
      A("Santé", "Eau en bouteille uniquement, évitez les crudités. Très fortes chaleurs de mai à septembre."),
      A("Usages", "Le pourboire (bakchich) est attendu pour la plupart des petits services."),
    ],
  },
  Canada: {
    slug: "canada",
    tips: [
      A(
        "Formalités",
        "Autorisation de voyage électronique (AVE) obligatoire en avion, à demander en ligne uniquement sur le site officiel du gouvernement canadien (des sites intermédiaires la facturent bien plus cher).",
      ),
      A("Usages", "Les taxes s'ajoutent au prix affiché à la caisse, et le pourboire est attendu (15 à 20 %)."),
      A("Sécurité", "Dans les parcs, suivez les consignes face aux ours (nourriture rangée, randonnée en groupe)."),
    ],
  },
  Mexique: {
    slug: "mexique",
    tips: [
      A("Formalités", "Pas de visa pour un séjour touristique : passeport valide pour toute la durée du séjour."),
      A(
        "Sécurité",
        "Plusieurs États sont formellement déconseillés : consultez la carte de France Diplomatie. Dans les grandes villes, préférez les taxis de station (sitio) ou une application.",
      ),
      A("Santé", "Eau en bouteille uniquement. Sur la côte caraïbe, des sargasses s'échouent souvent l'été."),
    ],
  },
  Brésil: {
    slug: "bresil",
    tips: [
      A("Formalités", "Pas de visa pour un séjour touristique de moins de 90 jours : passeport valide."),
      A(
        "Sécurité",
        "À Rio et São Paulo, ne sortez pas votre téléphone dans la rue ni sur la plage, et prenez un taxi par application le soir. N'entrez dans une favela qu'avec un guide local reconnu.",
      ),
      A(
        "Santé",
        "Protection contre les moustiques (dengue). Vaccin contre la fièvre jaune recommandé selon les régions visitées.",
      ),
    ],
  },
  Maurice: {
    slug: "maurice",
    tips: [
      A(
        "Formalités",
        "Pas de visa pour un séjour touristique : passeport valide, billet retour et adresse d'hébergement demandés à l'arrivée.",
      ),
      A("Sécurité", "Saison des cyclones de janvier à mars. Méfiez-vous des courants hors du lagon."),
      A("Santé", "Soleil très fort, oursins et poissons-pierres dans le lagon : chaussures d'eau conseillées."),
    ],
  },
  Sénégal: {
    slug: "senegal",
    tips: [
      A("Formalités", "Pas de visa pour un séjour de moins de 90 jours : passeport valide au moins 6 mois."),
      A(
        "Santé",
        "Traitement antipaludique à voir avec votre médecin ; vaccin contre la fièvre jaune recommandé (obligatoire si vous arrivez d'un pays où elle est présente).",
      ),
      A("Transports", "Taxis sans compteur : fixez le prix avant de monter."),
      A(
        "Sécurité",
        "La région de Casamance et certaines zones frontalières demandent des précautions : vérifiez la carte de France Diplomatie.",
      ),
    ],
  },
  "République dominicaine": {
    slug: "republique-dominicaine",
    tips: [
      A(
        "Formalités",
        "Pas de visa pour un séjour touristique : passeport valide. Formulaire électronique d'entrée et de sortie (e-ticket) à remplir en ligne avant le vol.",
      ),
      A("Santé", "Eau en bouteille uniquement. Protection contre les moustiques (dengue)."),
      A(
        "Sécurité",
        "Courants forts sur certaines plages : respectez les drapeaux. Hors des resorts, évitez de montrer objets de valeur et téléphone.",
      ),
    ],
  },
};

// Conseils valables partout
const GENERIC: Advice[] = [
  A("Formalités", "Inscrivez-vous sur Ariane (France Diplomatie) : vous serez prévenu en cas de crise sur place."),
  A(
    "Santé",
    "Une assurance voyage (frais médicaux, rapatriement) est fortement conseillée, même si votre carte bancaire en inclut une : vérifiez les plafonds.",
  ),
  A("Sécurité", "Gardez une copie numérique de votre passeport et de vos réservations, accessible hors ligne."),
];

export const diplomatieUrl = (slug: string) =>
  slug
    ? `https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/${slug}/`
    : "https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/";

/* Conseils pour un pays (nom en français, tel que dans le catalogue). */
export function adviceFor(country?: string | null): { tips: Advice[]; generic: Advice[]; url: string; known: boolean } {
  const c = country ? COUNTRIES[country] : undefined;
  return { tips: c?.tips || [], generic: GENERIC, url: diplomatieUrl(c?.slug || ""), known: !!c };
}
