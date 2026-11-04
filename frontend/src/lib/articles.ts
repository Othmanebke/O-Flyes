import type { PhotoKey } from "@/lib/photos";

export interface Article {
    slug: string;
    title: string;
    excerpt: string;
    tag: "Guide" | "Conseil" | "Inspiration" | "Culture";
    date: string;
    minutes: number;
    photo: PhotoKey;
    place: string;
    country: string;
    destId: string; // destination du catalogue pour « Planifier ce voyage »
    body: { h?: string; p: string }[];
}

export const ARTICLES: Article[] = [
    {
        slug: "bali-meilleure-periode",
        title: "Meilleure période pour visiter Bali",
        excerpt: "Saison sèche, saison des pluies, affluence : comment choisir ses dates pour profiter de l'île sans la pluie ni les foules.",
        tag: "Guide", date: "2026-02-20", minutes: 6, photo: "DPS", place: "Bali", country: "Indonésie", destId: "t3",
        body: [
            { p: "Bali vit au rythme de deux saisons. La saison sèche va d'avril à octobre : ciel dégagé, mer calme, journées autour de 30 °C. La saison des pluies, de novembre à mars, apporte des averses fortes mais souvent courtes, en fin de journée." },
            { h: "Le meilleur compromis : avril-mai et septembre-octobre", p: "Ces mois cumulent le beau temps de la saison sèche et une fréquentation plus raisonnable qu'en juillet-août, période des vacances européennes et australiennes. Les prix des villas restent aussi plus doux." },
            { h: "Où loger selon ce que vous cherchez", p: "Ubud pour les rizières, les temples et le yoga ; la péninsule de Bukit (Uluwatu) pour le surf et les falaises ; Sanur pour une côte plus calme en famille. Beaucoup de voyageurs combinent deux bases sur dix à quinze jours." },
            { h: "Budget", p: "Le vol depuis Paris représente l'essentiel du coût. Sur place, l'hébergement et la nourriture restent abordables : c'est ce qui permet un séjour de deux semaines pour un budget comparable à une semaine dans une capitale européenne." },
        ],
    },
    {
        slug: "valise-desert",
        title: "Quoi mettre dans sa valise pour le désert",
        excerpt: "Les essentiels pour un séjour en milieu aride, du chèche à la lampe frontale.",
        tag: "Conseil", date: "2026-02-18", minutes: 4, photo: "RAK", place: "Désert", country: "Maroc", destId: "t1",
        body: [
            { p: "Dans le désert, l'écart de température entre le jour et la nuit surprend toujours : on peut passer de la chaleur au froid en quelques heures. La valise doit donc couvrir les deux." },
            { h: "Se protéger du soleil", p: "Un chèche ou un grand foulard en coton (tête, nuque, visage en cas de vent), des lunettes de soleil couvrantes, une crème solaire haute protection et des vêtements amples à manches longues, plus frais que des débardeurs." },
            { h: "Pour la nuit", p: "Une polaire ou une doudoune légère, un pantalon long et des chaussettes chaudes. Une lampe frontale est indispensable dans un bivouac." },
            { h: "Le reste", p: "Une gourde d'au moins un litre, des chaussures fermées (le sable brûle et s'infiltre partout), des lingettes et un petit sac étanche pour protéger téléphone et appareil photo de la poussière." },
        ],
    },
    {
        slug: "couchers-de-soleil-japon",
        title: "Les plus beaux couchers de soleil au Japon",
        excerpt: "Des points de vue à ne pas manquer entre Kyoto et Tokyo.",
        tag: "Inspiration", date: "2026-02-15", minutes: 5, photo: "NRT", place: "Kyoto", country: "Japon", destId: "c1",
        body: [
            { p: "Entre les temples de Kyoto et les gratte-ciel de Tokyo, le Japon offre des fins de journée très différentes. Quelques idées pour organiser vos soirées." },
            { h: "Kyoto", p: "Le quartier de Higashiyama, en montant vers le Kiyomizu-dera, offre une vue sur la ville qui s'allume. Plus au nord, les berges de la rivière Kamo sont un lieu de promenade très local au crépuscule." },
            { h: "Tokyo", p: "Les observatoires des tours permettent de voir le soleil se coucher derrière la silhouette du mont Fuji par temps clair, surtout en hiver. Le parc d'Odaiba, face à la baie, est une alternative gratuite." },
            { h: "Quand partir", p: "Le printemps (mars-avril) et l'automne (octobre-novembre) sont les saisons les plus agréables, avec un ciel souvent dégagé à l'automne." },
        ],
    },
    {
        slug: "voyager-comme-un-local-maroc",
        title: "Voyager comme un local au Maroc",
        excerpt: "Habitudes et bons réflexes pour une expérience plus authentique, de la médina à l'Atlas.",
        tag: "Culture", date: "2026-02-10", minutes: 5, photo: "RAK", place: "Marrakech", country: "Maroc", destId: "t1",
        body: [
            { p: "Marrakech se découvre mieux à pied et sans se presser. Quelques habitudes aident à sortir des circuits les plus fréquentés." },
            { h: "Dans la médina", p: "Logez dans un riad plutôt qu'un grand hôtel : vous serez au cœur de la vieille ville, et l'équipe vous orientera. Dans les souks, prenez le temps de comparer avant d'acheter ; la négociation fait partie de l'échange, toujours avec le sourire." },
            { h: "Manger", p: "Les petites gargotes servent des tajines et des brochettes bien moins chers que les terrasses de la place Jemaa el-Fna. Le vendredi, beaucoup de familles mangent un couscous : certains restaurants le proposent ce jour-là." },
            { h: "Sortir de la ville", p: "Deux nuits dans la vallée de l'Ourika ou dans l'Atlas coupent agréablement un séjour de dix jours et changent complètement d'ambiance." },
        ],
    },
    {
        slug: "lisbonne-en-une-semaine",
        title: "Une semaine à Lisbonne, quartier par quartier",
        excerpt: "Alfama, Belém, Sintra : comment organiser sept jours sans passer sa vie dans les trams.",
        tag: "Guide", date: "2026-03-04", minutes: 6, photo: "LIS", place: "Lisbonne", country: "Portugal", destId: "t2",
        body: [
            { p: "Lisbonne se visite à pied, mais ses sept collines fatiguent vite. Le plus simple est de consacrer chaque journée à un secteur, et de garder les transports pour les excursions." },
            { h: "Jours 1 et 2 : Baixa, Chiado et Alfama", p: "La Baixa et le Chiado forment le centre : places, cafés historiques et librairies. L'Alfama, le plus vieux quartier, se découvre en montant vers le château Saint-Georges et ses belvédères. Le soir, c'est le quartier du fado." },
            { h: "Jour 3 : Belém", p: "À l'ouest, le monastère des Hiéronymites et la tour de Belém se visitent dans la même matinée. On y goûte les pastéis de Belém, la version d'origine du pastel de nata." },
            { h: "Jours 4 et 5 : Sintra et la côte", p: "Sintra, à 40 minutes en train, mérite une journée entière : palais de la Pena, Quinta da Regaleira, forêts. Le lendemain, Cascais et la plage de Guincho changent d'ambiance." },
            { h: "Jours 6 et 7 : au rythme local", p: "LX Factory pour les boutiques et les brunchs, le marché de Campo de Ourique, et un coucher de soleil depuis le Miradouro da Senhora do Monte avant de repartir." },
            { h: "Se déplacer", p: "La carte rechargeable des transports couvre métro, trams, bus et trains de banlieue (Sintra, Cascais). Le tram 28 est pittoresque mais souvent bondé : mieux vaut le prendre tôt le matin." },
        ],
    },
    {
        slug: "islande-en-hiver",
        title: "L'Islande en hiver : aurores boréales et route du Sud",
        excerpt: "Quand partir, comment conduire sur la route circulaire et où guetter les aurores.",
        tag: "Conseil", date: "2026-03-01", minutes: 5, photo: "KEF", place: "Islande", country: "Islande", destId: "c2",
        body: [
            { p: "De décembre à février, les nuits sont longues : c'est la meilleure période pour les aurores boréales, avec quatre à cinq heures de jour seulement. Il faut donc organiser ses journées autour de la lumière." },
            { h: "Les aurores boréales", p: "Elles demandent un ciel dégagé et une activité solaire suffisante. Les prévisions de l'office météorologique islandais indiquent la couverture nuageuse heure par heure. Éloignez-vous des villes et soyez patient : rien n'est garanti." },
            { h: "La côte sud en voiture", p: "Le Cercle d'or (Þingvellir, Geysir, Gullfoss) puis la côte sud jusqu'à la lagune glaciaire de Jökulsárlón forment l'itinéraire le plus courant en hiver. Louez un véhicule adapté à la neige et consultez l'état des routes chaque matin." },
            { h: "Le budget", p: "L'Islande est chère : hébergement, location de voiture et restaurants pèsent lourd. Les supermarchés et les guesthouses avec cuisine permettent de contenir les dépenses." },
            { h: "Dans la valise", p: "Des couches chaudes plutôt qu'un seul gros manteau, une veste imperméable, des chaussures antidérapantes, et un maillot de bain pour les sources chaudes." },
        ],
    },
];

export const bySlug = (slug: string) => ARTICLES.find(a => a.slug === slug);

export const formatDate = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
