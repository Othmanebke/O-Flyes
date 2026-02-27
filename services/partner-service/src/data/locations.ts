export interface Location {
    city: string;
    country: string;
    label: string;
}

export const COUNTRIES_DATA: Record<string, string[]> = {
    "France": ["Paris", "Lyon", "Marseille"],
    "Japon": ["Tokyo", "Osaka", "Kyoto"],
    "États-Unis": ["New York", "Los Angeles", "Chicago"],
    "Italie": ["Rome", "Milan", "Naples"],
    "Espagne": ["Madrid", "Barcelone", "Valence"],
    "Royaume-Uni": ["Londres", "Manchester", "Birmingham"],
    "Allemagne": ["Berlin", "Hambourg", "Munich"],
    "Canada": ["Toronto", "Montréal", "Vancouver"],
    "Australie": ["Sydney", "Melbourne", "Brisbane"],
    "Maroc": ["Casablanca", "Marrakech", "Tanger"],
    "Brésil": ["São Paulo", "Rio de Janeiro", "Brasília"],
    "Indonésie": ["Jakarta", "Surabaya", "Bandung"],
    "Thaïlande": ["Bangkok", "Chiang Mai", "Phuket"],
    "Grèce": ["Athènes", "Thessalonique", "Patras"],
    "Portugal": ["Lisbonne", "Porto", "Coimbra"],
    "Suisse": ["Zurich", "Genève", "Bâle"],
    "Belgique": ["Bruxelles", "Anvers", "Gand"],
    "Pays-Bas": ["Amsterdam", "Rotterdam", "La Haye"],
    "Turquie": ["Istanbul", "Ankara", "Izmir"],
    "Égypte": ["Le Caire", "Alexandrie", "Gizeh"],
    "Mexique": ["Mexico", "Guadalajara", "Monterrey"],
    "Argentine": ["Buenos Aires", "Córdoba", "Rosario"],
    "Chili": ["Santiago", "Valparaíso", "Concepción"],
    "Vietnam": ["Hô Chi Minh-Ville", "Hanoï", "Da Nang"],
    "Singapour": ["Singapour"],
    "Corée du Sud": ["Séoul", "Busan", "Incheon"],
    "Chine": ["Shanghai", "Pékin", "Guangzhou"],
    "Inde": ["Mumbai", "Delhi", "Bangalore"],
    "Afrique du Sud": ["Johannesburg", "Le Cap", "Durban"],
    "Norvège": ["Oslo", "Bergen", "Trondheim"],
    "Suède": ["Stockholm", "Göteborg", "Malmö"],
    "Danemark": ["Copenhague", "Aarhus", "Odense"],
    "Finlande": ["Helsinki", "Espoo", "Tampere"],
    "Irlande": ["Dublin", "Cork", "Limerick"],
    "Autriche": ["Vienne", "Graz", "Linz"],
    "Pologne": ["Varsovie", "Cracovie", "Łódź"],
    "République Tchèque": ["Prague", "Brno", "Ostrava"],
    "Hongrie": ["Budapest", "Debrecen", "Szeged"],
    "Islande": ["Reykjavík"],
    "Nouvelle-Zélande": ["Auckland", "Wellington", "Christchurch"],
    "Émirats Arabes Unis": ["Dubaï", "Abu Dhabi", "Charjah"],
    "Arabie Saoudite": ["Riyad", "Djeddah", "La Mecque"],
    "Colombie": ["Bogotá", "Medellín", "Cali"],
    "Pérou": ["Lima", "Arequipa", "Trujillo"],
    "Malaisie": ["Kuala Lumpur", "George Town", "Ipoh"],
    "Philippines": ["Manille", "Quezon City", "Davao"],
    "Croatie": ["Zagreb", "Split", "Rijeka"],
    "Malte": ["La Valette"],
    "Sénégal": ["Dakar"],
    "Côte d'Ivoire": ["Abidjan"],
    "Kenya": ["Nairobi"]
};

export const MOCK_LOCATIONS: Location[] = Object.entries(COUNTRIES_DATA).flatMap(([country, cities]) => [
    { city: "", country, label: country },
    ...cities.map(city => ({
        city,
        country,
        label: `${city}, ${country}`
    }))
]);
