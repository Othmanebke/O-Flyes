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
    ]
};
