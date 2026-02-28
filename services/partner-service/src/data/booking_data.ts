export interface BookingHotel {
    id: string;
    name: string;
    city: string;
    country: string;
    price_per_night: number;
    currency: string;
    rating: number;
    stars: number;
    category: "Palace" | "Boutique-Hôtel" | "Resort de Luxe" | "Hôtel Historique";
    image_url: string;
    description: string;
    booking_url: string;
}

export const BOOKING_REAL_DATA: Record<string, BookingHotel[]> = {
    "Paris": [
        {
            id: "book-par-1",
            name: "Ritz Paris",
            city: "Paris",
            country: "France",
            price_per_night: 1350,
            currency: "EUR",
            rating: 4.9,
            stars: 5,
            category: "Palace",
            image_url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
            description: "Une icône de l'élégance française sur la mythique Place Vendôme.",
            booking_url: "https://www.booking.com/hotel/fr/ritz-paris.html"
        },
        {
            id: "book-par-2",
            name: "Hôtel Plaza Athénée",
            city: "Paris",
            country: "France",
            price_per_night: 1100,
            currency: "EUR",
            rating: 4.8,
            stars: 5,
            category: "Palace",
            image_url: "https://images.unsplash.com/photo-1551882547-ff43c61f1c9d?auto=format&fit=crop&w=800&q=80",
            description: "Sur l'avenue Montaigne, le palace de la haute couture à Paris.",
            booking_url: "https://www.booking.com/hotel/fr/plaza-athenee-paris.fr.html"
        }
    ],
    "Marrakech": [
        {
            id: "book-mar-1",
            name: "La Mamounia",
            city: "Marrakech",
            country: "Maroc",
            price_per_night: 650,
            currency: "EUR",
            rating: 4.9,
            stars: 5,
            category: "Palace",
            image_url: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80",
            description: "Un palace légendaire au cœur de la ville ocre, entre jardins luxuriants et artisanat royal.",
            booking_url: "https://www.booking.com/hotel/ma/la-mamounia.fr.html"
        },
        {
            id: "book-mar-2",
            name: "Royal Mansour Marrakech",
            city: "Marrakech",
            country: "Maroc",
            price_per_night: 1200,
            currency: "EUR",
            rating: 4.9,
            stars: 5,
            category: "Palace",
            image_url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
            description: "Une merveille d'architecture conçue pour être le plus bel hôtel du monde.",
            booking_url: "https://www.booking.com/hotel/ma/royal-mansour-marrakech.fr.html"
        }
    ],
    "Dubaï": [
        {
            id: "book-dub-1",
            name: "Burj Al Arab Jumeirah",
            city: "Dubaï",
            country: "Émirats Arabes Unis",
            price_per_night: 1400,
            currency: "EUR",
            rating: 4.9,
            stars: 5,
            category: "Palace",
            image_url: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80",
            description: "Le seul hôtel sept étoiles au monde, symbole du luxe absolu sur une île privée.",
            booking_url: "https://www.booking.com/hotel/ae/burj-al-arab-jumeirah.fr.html"
        },
        {
            id: "book-dub-2",
            name: "Atlantis, The Palm",
            city: "Dubaï",
            country: "Émirats Arabes Unis",
            price_per_night: 450,
            currency: "EUR",
            rating: 4.7,
            stars: 5,
            category: "Resort de Luxe",
            image_url: "https://images.unsplash.com/photo-1544161515-4af6b1d4640d?auto=format&fit=crop&w=800&q=80",
            description: "Une destination de divertissement extraordinaire sur l'iconique Palm Jumeirah.",
            booking_url: "https://www.booking.com/hotel/ae/atlantis-the-palm.fr.html"
        }
    ],
    "Tokyo": [
        {
            id: "book-tok-1",
            name: "Aman Tokyo",
            city: "Tokyo",
            country: "Japon",
            price_per_night: 950,
            currency: "EUR",
            rating: 4.8,
            stars: 5,
            category: "Palace",
            image_url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
            description: "Un sanctuaire urbain alliant modernité minimaliste et traditions japonaises.",
            booking_url: "https://www.booking.com/hotel/jp/aman-tokyo.html"
        },
        {
            id: "book-tok-2",
            name: "Park Hyatt Tokyo",
            city: "Tokyo",
            country: "Japon",
            price_per_night: 600,
            currency: "EUR",
            rating: 4.7,
            stars: 5,
            category: "Hôtel Historique",
            image_url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
            description: "Célèbre pour ses vues panoramiques, une institution du luxe à Shinjuku.",
            booking_url: "https://www.booking.com/hotel/jp/park-hyatt-tokyo.html"
        }
    ],
    "Londres": [
        {
            id: "book-lon-1",
            name: "The Savoy",
            city: "Londres",
            country: "Royaume-Uni",
            price_per_night: 750,
            currency: "EUR",
            rating: 4.8,
            stars: 5,
            category: "Hôtel Historique",
            image_url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
            description: "L'hôtel le plus emblématique de Londres, sur les rives de la Tamise.",
            booking_url: "https://www.booking.com/hotel/gb/the-savoy.fr.html"
        }
    ],
    "New York": [
        {
            id: "book-nyc-1",
            name: "The Plaza Hotel",
            city: "New York",
            country: "États-Unis",
            price_per_night: 850,
            currency: "EUR",
            rating: 4.7,
            stars: 5,
            category: "Hôtel Historique",
            image_url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
            description: "Le summum de l'élégance à New York, face à Central Park.",
            booking_url: "https://www.booking.com/hotel/us/the-plaza.fr.html"
        }
    ]
};
