export interface HotelTemplate {
    category: "Palace" | "Boutique-Hôtel" | "Resort de Luxe" | "Hôtel Historique";
    stars: number;
    basePrice: number;
    titleTemplate: string[];
    descriptionTemplate: string;
    imagePool: string[];
}

export const HOTEL_TEMPLATES: HotelTemplate[] = [
    {
        category: "Palace",
        stars: 5,
        basePrice: 500,
        titleTemplate: ["Le Grand Palace {city}", "Royal {city} Palace", "The Majestic {city}"],
        descriptionTemplate: "Une expérience royale inégalée où le luxe rencontre l'histoire au cœur de {city}.",
        imagePool: [
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        category: "Boutique-Hôtel",
        stars: 4,
        basePrice: 220,
        titleTemplate: ["{city} Secret Garden", "The Artisan {city}", "Maison {city} Boutique"],
        descriptionTemplate: "Un refuge intime au design soigné, offrant une immersion authentique dans l'âme de {city}.",
        imagePool: [
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        category: "Resort de Luxe",
        stars: 5,
        basePrice: 380,
        titleTemplate: ["{city} Blue Lagoon Resort", "The Palm {city} Retreat", "Ocean View {city} Resort"],
        descriptionTemplate: "Évadez-vous dans un paradis exclusif avec des installations de classe mondiale face aux splendeurs de {country}.",
        imagePool: [
            "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        category: "Hôtel Historique",
        stars: 4,
        basePrice: 180,
        titleTemplate: ["Hôtel de la Paix {city}", "The Heritage {city}", "Hôtel des Arts {city}"],
        descriptionTemplate: "Dormez au cœur de l'histoire de {city} dans cet établissement de caractère restauré avec élégance.",
        imagePool: [
            "https://images.unsplash.com/photo-1551882547-ff43c61f1c9d?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1495365200479-c4ed1d392721?auto=format&fit=crop&w=800&q=80"
        ]
    }
];
