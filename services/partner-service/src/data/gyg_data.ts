export interface GYGActivity {
    id: string;
    title: string;
    city: string;
    country: string;
    category: "Gastronomie" | "Culture" | "Aventure" | "Détente";
    price: number;
    currency: string;
    rating: string;
    reviews: number;
    image_url: string;
    description: string;
    booking_url: string;
}

export const GYG_REAL_DATA: Record<string, GYGActivity[]> = {
    "Paris": [
        {
            id: "gyg-par-1",
            title: "Billet coupe-file : Musée du Louvre",
            city: "Paris",
            country: "France",
            category: "Culture",
            price: 22,
            currency: "EUR",
            rating: "4.8",
            reviews: 15300,
            image_url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
            description: "Accès prioritaire pour admirer la Joconde et des chefs-d'œuvre mondiaux.",
            booking_url: "https://www.getyourguide.com/paris-l16/louvre-museum-skip-the-line-ticket-t51071/"
        },
        {
            id: "gyg-par-2",
            title: "Sommet de la Tour Eiffel avec accès direct",
            city: "Paris",
            country: "France",
            category: "Culture",
            price: 35,
            currency: "EUR",
            rating: "4.7",
            reviews: 22000,
            image_url: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80",
            description: "Vue panoramique à 360° depuis le point le plus haut de Paris.",
            booking_url: "https://www.getyourguide.com/paris-l16/eiffel-tower-summit-access-t39414/"
        },
        {
            id: "gyg-par-3",
            title: "Croisière promenade sur la Seine",
            city: "Paris",
            country: "France",
            category: "Détente",
            price: 18,
            currency: "EUR",
            rating: "4.6",
            reviews: 8900,
            image_url: "https://images.unsplash.com/photo-1502602898657-3e90760086eb?auto=format&fit=crop&w=800&q=80",
            description: "Découvrez les monuments illuminés de Paris depuis l'eau.",
            booking_url: "https://www.getyourguide.com/paris-l16/seine-river-sightseeing-cruise-t966/"
        },
        {
            id: "gyg-par-4",
            title: "Dîner-croisière gastronomique sur la Seine",
            city: "Paris",
            country: "France",
            category: "Gastronomie",
            price: 95,
            currency: "EUR",
            rating: "4.9",
            reviews: 4500,
            image_url: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800&q=80",
            description: "Un repas raffiné sur l'eau face à la Tour Eiffel illuminée.",
            booking_url: "https://www.getyourguide.com/paris-l16/paris-seine-river-dinner-cruise-t66190/"
        }
    ],
    "Marrakech": [
        {
            id: "gyg-mar-1",
            title: "Dîner dans le désert d'Agafay et balade à dos de chameau",
            city: "Marrakech",
            country: "Maroc",
            category: "Gastronomie",
            price: 45,
            currency: "EUR",
            rating: "4.6",
            reviews: 1200,
            image_url: "https://images.unsplash.com/photo-1542385151-efd9000782a6?auto=format&fit=crop&w=800&q=80",
            description: "Une soirée magique sous les étoiles avec un repas traditionnel marocain.",
            booking_url: "https://www.getyourguide.com/marrakech-l208/marrakech-agafay-desert-dinner-camel-ride-t449080/"
        },
        {
            id: "gyg-mar-2",
            title: "Excursion d'une journée aux cascades d'Ouzoud",
            city: "Marrakech",
            country: "Maroc",
            category: "Aventure",
            price: 35,
            currency: "EUR",
            rating: "4.8",
            reviews: 3500,
            image_url: "https://images.unsplash.com/photo-1580637136009-548773950664?auto=format&fit=crop&w=800&q=80",
            description: "Admirez les plus hautes chutes d'eau d'Afrique du Nord.",
            booking_url: "https://www.getyourguide.com/marrakech-l208/marrakech-day-trip-to-ouzoud-waterfalls-t32805/"
        },
        {
            id: "gyg-mar-3",
            title: "Vol en montgolfière au-dessus de Marrakech",
            city: "Marrakech",
            country: "Maroc",
            category: "Aventure",
            price: 155,
            currency: "EUR",
            rating: "4.9",
            reviews: 800,
            image_url: "https://images.unsplash.com/photo-1510443224959-5c423be804bc?auto=format&fit=crop&w=800&q=80",
            description: "Une vue imprenable sur l'Atlas et la palmeraie au lever du soleil.",
            booking_url: "https://www.getyourguide.com/marrakech-l208/marrakech-hot-air-balloon-flight-t42805/"
        }
    ],
    "Tokyo": [
        {
            id: "gyg-tok-1",
            title: "teamLab Planets TOKYO : Billets d'entrée",
            city: "Tokyo",
            country: "Japon",
            category: "Culture",
            price: 28,
            currency: "EUR",
            rating: "4.9",
            reviews: 12000,
            image_url: "https://images.unsplash.com/photo-1552591605-64d1f27116b0?auto=format&fit=crop&w=800&q=80",
            description: "Un musée numérique immersif unique au monde.",
            booking_url: "https://www.getyourguide.com/tokyo-l193/teamlab-planets-tokyo-ticket-t227690/"
        },
        {
            id: "gyg-tok-2",
            title: "Tokyo: Visite culinaire nocturne à Shinjuku",
            city: "Tokyo",
            country: "Japon",
            category: "Gastronomie",
            price: 95,
            currency: "EUR",
            rating: "4.8",
            reviews: 1400,
            image_url: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80",
            description: "Dégustez la meilleure street-food japonaise dans les ruelles secrètes.",
            booking_url: "https://www.getyourguide.com/tokyo-l193/tokyo-japanese-street-food-tour-in-shinjuku-t172106/"
        }
    ],
    "Londres": [
        {
            id: "gyg-lon-1",
            title: "The London Eye : Billet d'entrée standard ou coupe-file",
            city: "Londres",
            country: "Royaume-Uni",
            category: "Culture",
            price: 38,
            currency: "EUR",
            rating: "4.5",
            reviews: 25000,
            image_url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
            description: "Admirez Londres à 360° depuis la roue d'observation la plus célèbre au monde.",
            booking_url: "https://www.getyourguide.com/london-l57/the-london-eye-ticket-t200350/"
        },
        {
            id: "gyg-lon-2",
            title: "Visite des studios Warner Bros. - Le tour de Harry Potter",
            city: "Londres",
            country: "Royaume-Uni",
            category: "Culture",
            price: 115,
            currency: "EUR",
            rating: "4.9",
            reviews: 18000,
            image_url: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?auto=format&fit=crop&w=800&q=80",
            description: "Entrez dans les coulisses des films Harry Potter et découvrez les décors originaux.",
            booking_url: "https://www.getyourguide.com/london-l57/warner-bros-studio-tour-london-the-making-of-harry-potter-t164024/"
        }
    ],
    "Dubaï": [
        {
            id: "gyg-dub-1",
            title: "Burj Khalifa : Niveaux 124 et 125",
            city: "Dubaï",
            country: "Émirats Arabes Unis",
            category: "Culture",
            price: 45,
            currency: "EUR",
            rating: "4.7",
            reviews: 45000,
            image_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
            description: "Montez au sommet de la plus haute tour du monde pour une vue imprenable.",
            booking_url: "https://www.getyourguide.com/dubai-l173/burj-khalifa-observation-deck-entrance-ticket-t49019/"
        },
        {
            id: "gyg-dub-2",
            title: "Safari dans le désert, barbecue, chameau et surf sur sable",
            city: "Dubaï",
            country: "Émirats Arabes Unis",
            category: "Aventure",
            price: 55,
            currency: "EUR",
            rating: "4.9",
            reviews: 12000,
            image_url: "https://images.unsplash.com/photo-1512632578888-159af038d156?auto=format&fit=crop&w=800&q=80",
            description: "Une aventure complète dans les dunes rouges du désert de Dubaï.",
            booking_url: "https://www.getyourguide.com/dubai-l173/dubai-morning-desert-safari-with-sandboarding-camel-ride-t449080/"
        }
    ],
    "New York": [
        {
            id: "gyg-nyc-1",
            title: "Statue de la Liberté et Ellis Island : Visite guidée",
            city: "New York",
            country: "États-Unis",
            category: "Culture",
            price: 42,
            currency: "EUR",
            rating: "4.8",
            reviews: 12000,
            image_url: "https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&w=800&q=80",
            description: "Un voyage historique vers les symboles emblématiques de l'Amérique.",
            booking_url: "https://www.getyourguide.com/new-york-city-l59/statue-of-liberty-ellis-island-ferry-ticket-t121512/"
        },
        {
            id: "gyg-nyc-2",
            title: "The Edge : Billet d'entrée pour le pont d'observation",
            city: "New York",
            country: "États-Unis",
            category: "Culture",
            price: 44,
            currency: "EUR",
            rating: "4.7",
            reviews: 8000,
            image_url: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80",
            description: "Le plus haut pont d'observation extérieur de l'hémisphère ouest.",
            booking_url: "https://www.getyourguide.com/new-york-city-l59/edge-observation-deck-ticket-t334645/"
        }
    ],
    "Rome": [
        {
            id: "gyg-rom-1",
            title: "Musées du Vatican et Chapelle Sixtine : Billet coupe-file",
            city: "Rome",
            country: "Italie",
            category: "Culture",
            price: 32,
            currency: "EUR",
            rating: "4.6",
            reviews: 35000,
            image_url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
            description: "Évitez l'attente pour découvrir les chefs-d'œuvre de Michel-Ange.",
            booking_url: "https://www.getyourguide.com/rome-l33/vatican-museums-sistine-chapel-skip-the-line-ticket-t62214/"
        }
    ],
    "Barcelone": [
        {
            id: "gyg-bcn-1",
            title: "Sagrada Família : Billet coupe-file avec accès à la tour",
            city: "Barcelone",
            country: "Espagne",
            category: "Culture",
            price: 46,
            currency: "EUR",
            rating: "4.8",
            reviews: 28000,
            image_url: "https://images.unsplash.com/photo-1583879862211-d41951ca848d?auto=format&fit=crop&w=800&q=80",
            description: "Visitez le monument le plus emblématique de Gaudi et profitez de la vue.",
            booking_url: "https://www.getyourguide.com/barcelona-l45/sagrada-familia-entrance-ticket-with-guided-tour-t66190/"
        }
    ],
    "Bangkok": [
        {
            id: "gyg-bgk-1",
            title: "Croisière avec dîner buffet sur le fleuve Chao Phraya",
            city: "Bangkok",
            country: "Thaïlande",
            category: "Gastronomie",
            price: 25,
            currency: "EUR",
            rating: "4.5",
            reviews: 6000,
            image_url: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&w=800&q=80",
            description: "Une croisière festive avec vue sur les temples illuminés de Bangkok.",
            booking_url: "https://www.getyourguide.com/bangkok-l169/chao-phraya-princess-dinner-cruise-t66190/"
        }
    ]
};
