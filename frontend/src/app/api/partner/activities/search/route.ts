import { NextResponse } from 'next/server';
import { gygActivityUrl, viatorActivityUrl } from '@/lib/iata';

// [title, category, price, duration, rating, reviews, description, unsplash_id]
type ActivityTemplate = [string, string, number, string, number, number, string, string];

const ACTIVITIES_BY_CITY: Record<string, ActivityTemplate[]> = {
    "Paris": [
        ["Visite guidée du Louvre", "Culture", 25, "3h", 4.8, 12400, "Explorez les chefs-d'œuvre du plus grand musée du monde avec un guide expert.", "1499678783-d2352b98df87"],
        ["Croisière sur la Seine en soirée", "Romantique", 35, "1h30", 4.7, 8200, "Admirer Paris illuminé depuis la Seine, avec champagne inclus.", "1499678783-d2352b98df87"],
        ["Tour Eiffel : accès sommet + coupe-file", "Monuments", 45, "2h", 4.9, 22100, "Accès prioritaire au sommet avec vue à 360° sur tout Paris.", "1499678783-d2352b98df87"],
        ["Atelier de cuisine française", "Gastronomie", 89, "3h", 4.9, 3100, "Apprenez à cuisiner coq au vin et tarte Tatin avec un chef étoilé.", "1533105079780-92b9be482077"],
        ["Dégustation de vins en cave", "Œnologie", 65, "2h", 4.7, 2800, "Tour de 10 vins de toutes les régions de France dans une cave historique.", "1533105079780-92b9be482077"],
        ["Montmartre : balade secrète", "Art & Histoire", 18, "2h30", 4.6, 5400, "Découvrez les ruelles cachées de Montmartre et l'atelier de Picasso.", "1499678783-d2352b98df87"],
        ["Versailles : visite royale complète", "Patrimoine", 55, "4h", 4.8, 9700, "Château, galerie des Glaces, jardins et Trianons sans file d'attente.", "1533105079780-92b9be482077"],
        ["Vélo vintage Paris Est", "Sport", 40, "3h", 4.6, 1900, "Exploration à vélo des quartiers tendance du 10e au 20e arrondissement.", "1499678783-d2352b98df87"],
    ],
    "Bali": [
        ["Temple de Tanah Lot au coucher du soleil", "Spirituel", 25, "3h", 4.9, 6800, "Visite du temple sacré sur l'eau avec cérémonie balinaise traditionnelle.", "1533105079780-92b9be482077"],
        ["Plongée dans le triangle de corail", "Plongée", 75, "4h", 4.8, 3200, "Explorez les fonds marins autour de Nusa Penida avec instructeur certifié.", "1499678783-d2352b98df87"],
        ["Trekking rizières Tegallalang", "Nature", 30, "3h", 4.7, 4100, "Randonnée à l'aube dans les terrasses de riz classées à l'UNESCO.", "1533105079780-92b9be482077"],
        ["Cours de cuisine balinaise", "Gastronomie", 45, "4h", 4.9, 2900, "Marché local, cueillette d'herbes, cuisine des 5 plats traditionnels.", "1499678783-d2352b98df87"],
        ["Soin spa bali traditionnel", "Bien-être", 60, "2h", 4.8, 7200, "Massage Balinais, lulur, bain de fleurs dans un spa de Ubud.", "1533105079780-92b9be482077"],
        ["Surf pour débutants Kuta", "Sport", 35, "2h", 4.6, 5800, "Leçon de surf avec instructeur certifié sur la plage de Kuta.", "1499678783-d2352b98df87"],
        ["Safari Bali ATV et rafting", "Aventure", 85, "5h", 4.7, 3600, "Quad dans les forêts et rafting sur la rivière Ayung.", "1533105079780-92b9be482077"],
        ["Cérémonie Kecak au coucher du soleil", "Culture", 20, "2h", 4.9, 4700, "Spectacle de danse Kecak traditionnel dans les ruines d'Uluwatu.", "1499678783-d2352b98df87"],
    ],
    "Tokyo": [
        ["Tour gastronomique Tsukiji", "Gastronomie", 80, "3h", 4.9, 3800, "Marché de Tsukiji, sushi du matin, dégustation de spécialités japonaises.", "1533105079780-92b9be482077"],
        ["Cérémonie du thé à Kyoto", "Culture", 55, "2h", 4.8, 2200, "Cérémonie du thé authentique dans une maison de thé de 200 ans.", "1499678783-d2352b98df87"],
        ["Ascension du mont Fuji", "Aventure", 120, "10h", 4.7, 4100, "Randonnée guidée jusqu'au sommet du Mont Fuji (3776m) avec pause au lever du soleil.", "1533105079780-92b9be482077"],
        ["Tokyo by night : Shibuya & Harajuku", "Vie nocturne", 45, "3h", 4.7, 5200, "Le croisement de Shibuya, Harajuku, cocktails au sommet d'une tour.", "1499678783-d2352b98df87"],
        ["Atelier calligraphie & origami", "Art", 40, "2h30", 4.8, 1900, "Maître calligraphe, initiation à l'origami traditionnel, certificat.", "1533105079780-92b9be482077"],
        ["Journée sumo à Ryogoku", "Sport", 70, "4h", 4.6, 2700, "Entraînement matinal dans un stable de sumo, rencontre avec les sumotori.", "1499678783-d2352b98df87"],
    ],
    "Dubai": [
        ["Safari en quad dans le désert", "Aventure", 85, "5h", 4.8, 8900, "Dunes de sable, coucher de soleil, dîner bédouin avec spectacle.", "1533105079780-92b9be482077"],
        ["Burj Khalifa : Sommet At The Top", "Monuments", 50, "2h", 4.7, 14200, "Accès au 148e étage, vue à 360° sur Dubai et le Golfe.", "1499678783-d2352b98df87"],
        ["Croisière Dhow en soirée", "Romantique", 65, "3h", 4.7, 6100, "Dîner buffet sur un bateau traditionnel avec spectacle de danse.", "1533105079780-92b9be482077"],
        ["Ski Dubai : neige dans le désert", "Sport", 80, "3h", 4.6, 3800, "Ski, snowboard et luge dans la plus grande piste de ski indoor d'Arabie.", "1499678783-d2352b98df87"],
        ["Vieux Dubaï : Deira & Abra", "Culture", 35, "3h", 4.8, 4700, "Souks de l'or et des épices, traversée en Abra, quartier historique.", "1533105079780-92b9be482077"],
        ["Skydive Dubai", "Aventure extrême", 599, "2h", 4.9, 2100, "Saut en parachute au-dessus de la Palm Jumeirah avec instructeur.", "1499678783-d2352b98df87"],
    ],
    "Marrakech": [
        ["Excursion Désert Sahara 2 jours", "Aventure", 180, "2j", 4.9, 3200, "Dunes de Merzouga, nuit dans un camp, lever de soleil à dos de chameau.", "1533105079780-92b9be482077"],
        ["Hammam traditionnel & massage", "Bien-être", 45, "2h", 4.8, 5100, "Hammam marocain authentique dans la Médina, gommage et massage argan.", "1499678783-d2352b98df87"],
        ["Cours de cuisine marocaine", "Gastronomie", 60, "4h", 4.9, 2800, "Marché des épices, tajine, couscous royal, thé à la menthe.", "1533105079780-92b9be482077"],
        ["Visite guidée Médina & Mellah", "Culture", 25, "3h", 4.7, 4400, "Souks, Medersa Ben Youssef, Mellah juif, Mouassine.", "1499678783-d2352b98df87"],
        ["Quad & buggy dans le Palmeraie", "Sport", 70, "2h", 4.6, 3700, "Ballade en buggy dans la palmeraie, paysages lunaires.", "1533105079780-92b9be482077"],
        ["Montgolfière sur les Atlas", "Expérience unique", 190, "3h", 4.9, 1800, "Vol en ballon au lever du soleil, vue sur les Atlas enneigés.", "1499678783-d2352b98df87"],
    ],
    "Barcelone": [
        ["Sagrada Família : visite coupe-file", "Architecture", 32, "2h", 4.9, 18700, "Visite guidée de la cathédrale de Gaudí avec accès aux tours.", "1533105079780-92b9be482077"],
        ["Tapas tour Bar Hopping Barcelone", "Gastronomie", 65, "3h", 4.8, 4200, "5 bars emblématiques, 15 tapas, sangria, dans le quartier Gracia.", "1499678783-d2352b98df87"],
        ["Kayak & Snorkeling Cap de Creus", "Plein air", 75, "4h", 4.7, 2800, "Kayak dans les criques, snorkeling dans les eaux cristallines.", "1533105079780-92b9be482077"],
        ["Camp Nou : Tour VIP FC Barcelone", "Sport", 42, "2h", 4.7, 7600, "Vestiaires, pelouse, musée du club et visite des loges VIP.", "1499678783-d2352b98df87"],
        ["Parc Güell & Montjuïc", "Art & Nature", 28, "4h", 4.8, 5300, "Mosaïques de Gaudí, château de Montjuïc, vue panoramique.", "1533105079780-92b9be482077"],
        ["Flamenco authentique à El Raval", "Spectacle", 38, "2h", 4.6, 3900, "Spectacle de flamenco dans une bodega authentique avec tapas.", "1499678783-d2352b98df87"],
    ],
    "New York": [
        ["Central Park Helicopter Tour", "Aérien", 220, "15min", 4.9, 3800, "Vue aérienne de Manhattan, Central Park et la Statue de la Liberté.", "1533105079780-92b9be482077"],
        ["Brooklyn Food Tour", "Gastronomie", 90, "4h", 4.8, 2700, "Bagels, pizza, cheesecake, Brooklyn Brewery, marché de Smorgasburg.", "1499678783-d2352b98df87"],
        ["Statue of Liberty & Ellis Island", "Histoire", 45, "4h", 4.7, 9200, "Traversée en ferry, accès au piédestal, musée de l'immigration.", "1533105079780-92b9be482077"],
        ["Metropolitan Museum of Art", "Culture", 25, "3h", 4.8, 12400, "Visite guidée du Met : Égypte, Impressionnistes, Art moderne.", "1499678783-d2352b98df87"],
        ["Kayak Hudson River", "Sport", 55, "2h", 4.6, 1900, "Kayak sur l'Hudson avec vue sur les gratte-ciels de Manhattan.", "1533105079780-92b9be482077"],
        ["Broadway Backstage Tour", "Spectacle", 120, "3h", 4.9, 2400, "Accès coulisses d'une comédie musicale de Broadway, rencontre avec les acteurs.", "1499678783-d2352b98df87"],
    ],
    "Londres": [
        ["Tour Tower of London & Crown Jewels", "Histoire", 38, "3h", 4.8, 9800, "Joyaux de la Couronne, Beefeaters, Tour Blanche et récits royaux.", "1533105079780-92b9be482077"],
        ["Afternoon Tea au Ritz", "Gastronomie", 75, "2h", 4.9, 3100, "Thé avec sandwiches, scones, pâtisseries dans le grand salon du Ritz.", "1499678783-d2352b98df87"],
        ["Harry Potter Studio Tour", "Cinéma", 55, "4h", 4.9, 14200, "Décors originaux, costumes, effets spéciaux des films Harry Potter.", "1533105079780-92b9be482077"],
        ["Jack the Ripper Walking Tour", "Mystère", 18, "2h", 4.7, 6800, "Whitechapel by night, lieux des crimes, histoires de l'East End victorien.", "1499678783-d2352b98df87"],
        ["Day Trip à Stonehenge & Bath", "Patrimoine", 85, "9h", 4.7, 5100, "Mégalithes de Stonehenge, thermes romains de Bath, Bath Abbey.", "1533105079780-92b9be482077"],
        ["Thames River & Greenwich", "Nature", 35, "4h", 4.6, 3700, "Croisière, Cutty Sark, Observatoire de Greenwich, méridien zéro.", "1499678783-d2352b98df87"],
    ],
};

function generateGenericActivities(city: string): ActivityTemplate[] {
    return [
        [`Visite guidée du centre historique de ${city}`, "Culture", 25, "3h", 4.6, 2100, `Découvrez l'histoire et les secrets de ${city} avec un guide local passionné.`, "1533105079780-92b9be482077"],
        [`Tour gastronomique à ${city}`, "Gastronomie", 65, "4h", 4.7, 1800, `Goûtez les spécialités culinaires locales et visitez les marchés de ${city}.`, "1499678783-d2352b98df87"],
        [`Excursion nature autour de ${city}`, "Nature", 45, "5h", 4.6, 1400, `Randonnée dans les environs naturels de ${city}, vues panoramiques.`, "1533105079780-92b9be482077"],
        [`Cours de cuisine locale à ${city}`, "Gastronomie", 80, "3h30", 4.8, 900, `Chef local, ingrédients du marché, recettes traditionnelles de ${city}.`, "1499678783-d2352b98df87"],
        [`Tour photo de ${city}`, "Art", 40, "3h", 4.7, 1200, `Capturez les plus beaux spots photos de ${city} avec un photographe pro.`, "1533105079780-92b9be482077"],
        [`Aventure nocturne à ${city}`, "Vie nocturne", 55, "4h", 4.6, 1600, `Bars locaux, spécialités nocturnes et spots incontournables de ${city}.`, "1499678783-d2352b98df87"],
    ];
}

async function fetchOpenTripMap(city: string): Promise<any[] | null> {
    const apiKey = process.env.OPENTRIPMAP_API_KEY;
    if (!apiKey) return null;

    try {
        const geoRes = await fetch(
            `https://api.opentripmap.com/0.1/fr/places/geoname?name=${encodeURIComponent(city)}&apikey=${apiKey}`,
            { signal: AbortSignal.timeout(5000) }
        );
        if (!geoRes.ok) return null;
        const geo = await geoRes.json();
        const { lon, lat } = geo;

        const placesRes = await fetch(
            `https://api.opentripmap.com/0.1/fr/places/radius?radius=5000&lon=${lon}&lat=${lat}&kinds=interesting_places,tourist_facilities,cultural,natural&format=json&limit=12&apikey=${apiKey}`,
            { signal: AbortSignal.timeout(5000) }
        );
        if (!placesRes.ok) return null;
        const places = await placesRes.json();

        return places
            .filter((p: any) => p.name && p.rate > 2)
            .slice(0, 8)
            .map((p: any, i: number) => ({
                id: `otm-${p.xid}`,
                title: p.name,
                city,
                category: p.kinds?.split(',')[0] || 'Attraction',
                price: [20, 30, 45, 60, 75, 90][i % 6],
                duration: ['2h', '3h', '4h', '2h30', '5h', '3h30'][i % 6],
                currency: 'EUR',
                rating: (4.2 + Math.random() * 0.7).toFixed(1),
                reviews: Math.floor(800 + Math.random() * 5000),
                image_url: `https://images.unsplash.com/photo-${['1533105079780-92b9be482077', '1499678783-d2352b98df87'][i % 2]}?w=600&q=80`,
                description: `Visitez ${p.name}, une attraction incontournable de ${city}.`,
                booking_url: gygActivityUrl(city),
                viator_url: viatorActivityUrl(city),
            }));
    } catch {
        return null;
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const city = (searchParams.get('city') || 'Paris').trim();

    // Try OpenTripMap first
    const otmActivities = await fetchOpenTripMap(city);
    if (otmActivities && otmActivities.length > 0) {
        return NextResponse.json(otmActivities);
    }

    // Curated static fallback
    const cityKey = Object.keys(ACTIVITIES_BY_CITY).find(k =>
        city.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(city.toLowerCase())
    );
    const templates: ActivityTemplate[] = cityKey ? ACTIVITIES_BY_CITY[cityKey] : generateGenericActivities(city);

    const seed = city.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

    const activities = templates.map(([title, category, price, duration, rating, reviews, description, photoId], i) => ({
        id: `activity-${city}-${i}`,
        title,
        city,
        country: '',
        category,
        price,
        duration,
        currency: "EUR",
        rating,
        reviews: reviews + ((seed * (i + 1)) % 500),
        image_url: `https://images.unsplash.com/photo-${photoId}?w=600&q=80`,
        description,
        booking_url: gygActivityUrl(city),
        viator_url: viatorActivityUrl(city),
    }));

    return NextResponse.json(activities);
}
