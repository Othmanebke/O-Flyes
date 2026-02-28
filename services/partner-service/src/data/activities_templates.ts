export interface ActivityTemplate {
    title: string;
    description: string;
    category: "Gastronomie" | "Culture" | "Aventure" | "Détente" | "Vie nocturne" | "Shopping" | "Luxe";
    basePrice: number;
    imagePool: string[];
}

export const ACTIVITY_TEMPLATES: ActivityTemplate[] = [
    {
        title: "Cours de cuisine locale & Marché à {city}",
        description: "Apprenez à cuisiner les plats traditionnels avec un chef local après avoir exploré les marchés colorés de {city}.",
        category: "Gastronomie",
        basePrice: 45,
        imagePool: [
            "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        title: "Dégustation privée de spécialités de {country}",
        description: "Une immersion sensorielle unique pour découvrir les saveurs authentiques et les secrets culinaires de {country}.",
        category: "Gastronomie",
        basePrice: 35,
        imagePool: [
            "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        title: "Tour gastronomique 'Street Food' à {city}",
        description: "Explorez les ruelles de {city} à la recherche des meilleurs stands et goûtez aux pépites locales méconnues.",
        category: "Gastronomie",
        basePrice: 25,
        imagePool: [
            "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        title: "Expérience Shopping VIP & Personal Shopper",
        description: "Découvrez les boutiques les plus exclusives de {city} avec un expert de la mode locale.",
        category: "Shopping",
        basePrice: 150,
        imagePool: [
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        title: "Nuit magique : Bar secret & Cocktails à {city}",
        description: "Plongez dans la vie nocturne de {city} avec une sélection des meilleurs speakeasies et bars clandestins.",
        category: "Vie nocturne",
        basePrice: 65,
        imagePool: [
            "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        title: "Dîner secret sur un rooftop à {city}",
        description: "Un repas gastronomique d'exception avec une vue panoramique imprenable sur les lumières de {city}.",
        category: "Luxe",
        basePrice: 185,
        imagePool: [
            "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        title: "Visite privée des monuments phares de {city}",
        description: "L'histoire et l'architecture de {city} racontées par un expert local passionné.",
        category: "Culture",
        basePrice: 55,
        imagePool: [
            "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        title: "Expédition nature & paysages sauvages ({country})",
        description: "Quittez le tumulte de {city} pour une journée d'aventure au cœur des paysages naturels de {country}.",
        category: "Aventure",
        basePrice: 110,
        imagePool: [
            "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        title: "Atelier artisanal traditionnel à {city}",
        description: "Rencontrez des artisans locaux et apprenez les techniques ancestrales propres à {city}.",
        category: "Culture",
        basePrice: 40,
        imagePool: [
            "https://images.unsplash.com/photo-1544967082-d9d2fa1aa158?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        title: "Session de Yoga & Détente au lever du soleil",
        description: "Un moment de sérénité absolue dans un cadre paisible à {city} pour recharger vos énergies.",
        category: "Détente",
        basePrice: 30,
        imagePool: [
            "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        title: "Tour des marchés d'art et antiquités de {city}",
        description: "Dénichez des trésors cachés et découvrez l'histoire de {city} à travers ses marchés aux puces célèbres.",
        category: "Shopping",
        basePrice: 20,
        imagePool: [
            "https://images.unsplash.com/photo-1533107862482-0e6974b06ec4?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=800&q=80"
        ]
    }
];
