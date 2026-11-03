// Types d'hébergement typiques de chaque destination (riad au Maroc, ryokan au Japon…),
// avec le quartier où on les trouve et un prix par nuit estimé à partir du prix « dès »
// du catalogue. On ne présente pas de faux noms d'hôtels : le lien Booking cherche ce
// type d'hébergement dans la ville, avec les dates du voyage.
import type { PhotoKey } from '@/lib/photos';

export interface Lodging {
    label: string; // ce que l'on réserve
    area: string; // où / pourquoi
    stars: number; // niveau de confort (étoiles ou équivalent)
    factor: number; // × prix « dès » par nuit du catalogue
    amenities: string[];
    photo: PhotoKey;
    query: string; // recherche Booking
}

const l = (label: string, area: string, stars: number, factor: number, amenities: string[], photo: PhotoKey, query = label): Lodging =>
    ({ label, area, stars, factor, amenities, photo, query });

// Clé = id de la destination dans le catalogue
export const LODGING: Record<string, Lodging[]> = {
    t1: [
        l('Riad dans la médina', 'Médina · patio et terrasse sur les toits', 3, 1.4, ['Petit-déjeuner marocain', 'Terrasse', 'Patio'], 'RAK', 'riad'),
        l("Dar, maison d'hôtes", 'Médina · quelques chambres, accueil familial', 2, 1, ['Petit-déjeuner', 'Terrasse'], 'market', 'dar'),
        l('Hôtel avec piscine', 'Guéliz ou Hivernage · ville nouvelle', 4, 2.4, ['Piscine', 'Restaurant', 'Climatisation'], 'hotel4', 'hôtel'),
        l('Villa avec piscine privée', 'Palmeraie · à 20 minutes de la médina', 5, 5, ['Piscine privée', 'Jardin', 'Personnel'], 'paddle', 'villa'),
        l("Lodge dans l'Atlas", "Vallée de l'Ourika ou Imlil · une ou deux nuits", 3, 1.8, ['Vue montagne', 'Demi-pension'], 'hike', 'lodge'),
    ],
    t2: [
        l('Appartement dans l\'Alfama', 'Alfama · vieux quartier, ruelles et belvédères', 3, 1, ['Cuisine équipée', 'WiFi'], 'LIS', 'appartement Alfama'),
        l('Hôtel boutique au Chiado', 'Chiado · central, à pied partout', 4, 1.8, ['Petit-déjeuner', 'Bar'], 'hotel2', 'hôtel Chiado'),
        l("Maison d'hôtes au Bairro Alto", 'Bairro Alto · animé le soir', 3, 1.1, ['Petit-déjeuner', 'WiFi'], 'alley', 'guesthouse Bairro Alto'),
        l('Hôtel avec vue sur le Tage', 'Baixa ou Príncipe Real · rooftop', 5, 3, ['Rooftop', 'Spa', 'Restaurant'], 'hotel1', 'hôtel vue Tage'),
    ],
    t3: [
        l('Villa avec piscine privée', 'Ubud · rizières et temples', 4, 2.5, ['Piscine privée', 'Petit-déjeuner flottant'], 'DPS', 'villa Ubud'),
        l('Guesthouse balinaise', 'Ubud · chambre chez l\'habitant', 2, 0.8, ['Petit-déjeuner', 'Jardin'], 'meadow', 'guesthouse Ubud'),
        l('Resort en bord de mer', 'Uluwatu ou Sanur · plage', 5, 4, ['Plage', 'Spa', 'Piscine'], 'paddle', 'resort Uluwatu'),
        l('Bungalow au milieu des rizières', 'Sidemen ou Munduk · au calme', 3, 1.3, ['Vue rizières', 'Petit-déjeuner'], 'lake', 'bungalow Sidemen'),
    ],
    t4: [
        l('Hôtel boutique à El Poblado', 'El Poblado · restaurants et sorties', 4, 2, ['Rooftop', 'Petit-déjeuner'], 'MDE', 'hôtel El Poblado'),
        l('Auberge à Laureles', 'Laureles · quartier résidentiel calme', 2, 0.8, ['WiFi', 'Cuisine commune'], 'alley', 'auberge Laureles'),
        l('Appartement avec vue', 'El Poblado · vue sur la vallée', 3, 1.4, ['Cuisine équipée', 'Balcon'], 'hotel3', 'appartement Medellín'),
    ],
    t5: [
        l('Lodge au bord du lac', 'Lac Wakatipu · vue montagnes', 4, 1.8, ['Vue lac', 'Cheminée'], 'ZQN', 'lodge Queenstown'),
        l('Motel', 'Centre-ville · pratique en voiture', 3, 1, ['Parking', 'Kitchenette'], 'road', 'motel Queenstown'),
        l('Chalet de montagne', 'Arrowtown · à 20 minutes', 3, 1.5, ['Cuisine', 'Terrasse'], 'hike', 'chalet Arrowtown'),
    ],
    b1: [
        l('Appartement dans le 7e arrondissement', 'Quartier juif · ruin bars à pied', 3, 1.1, ['Cuisine équipée', 'WiFi'], 'BUD', 'appartement Budapest'),
        l('Hôtel thermal', 'Bords du Danube · accès aux bains', 4, 2.5, ['Bains thermaux', 'Spa'], 'hotel1', 'hôtel thermal Budapest'),
        l('Hôtel boutique côté Pest', 'Centre · près du Parlement', 4, 1.8, ['Petit-déjeuner', 'Bar'], 'hotel2', 'hôtel boutique Budapest'),
    ],
    b2: [
        l("Maison d'hôtes dans la vieille ville", 'Abanotubani · près des bains au soufre', 2, 1, ['Petit-déjeuner', 'Terrasse'], 'TBS', 'guesthouse Tbilissi'),
        l('Hôtel boutique à Sololaki', 'Sololaki · maisons à balcons', 4, 2.2, ['Petit-déjeuner', 'Bar à vin'], 'hotel2', 'hôtel Sololaki'),
        l('Appartement dans un immeuble ancien', 'Centre historique', 3, 1.3, ['Cuisine équipée', 'Balcon'], 'alley', 'appartement Tbilissi'),
    ],
    b3: [
        l('Guesthouse dans la vieille ville', 'Old City · temples à pied', 2, 1, ['Petit-déjeuner', 'Jardin'], 'CNX', 'guesthouse Chiang Mai'),
        l('Hôtel boutique avec piscine', 'Nimman · cafés et galeries', 4, 2.5, ['Piscine', 'Petit-déjeuner'], 'hotel4', 'hôtel Nimman'),
        l('Bungalow dans la jungle', 'Mae Rim · au calme', 3, 2, ['Vue nature', 'Piscine'], 'meadow', 'bungalow Mae Rim'),
    ],
    b4: [
        l('Hôtel boutique dans le vieux quartier', 'Vieux quartier · lac Hoan Kiem', 3, 1.5, ['Petit-déjeuner', 'Climatisation'], 'HAN', 'hôtel vieux quartier Hanoï'),
        l("Chambre chez l'habitant", 'Quartier français · familles hanoïennes', 2, 1, ['Petit-déjeuner', 'WiFi'], 'alley', 'homestay Hanoï'),
        l("Nuit sur une jonque", "Baie d'Halong · croisière avec dîner", 4, 6, ['Pension complète', 'Kayak'], 'boat', "croisière baie d'Halong"),
    ],
    b5: [
        l('Appartement près de la Grand-Place', 'Vieille ville · tout à pied', 3, 1.1, ['Cuisine équipée', 'WiFi'], 'KRK', 'appartement Cracovie vieille ville'),
        l('Hôtel à Kazimierz', 'Kazimierz · ancien quartier juif, cafés', 4, 1.8, ['Petit-déjeuner', 'Bar'], 'hotel2', 'hôtel Kazimierz'),
        l('Auberge', 'Vieille ville · petit budget', 2, 0.6, ['Cuisine commune', 'WiFi'], 'backpack', 'auberge Cracovie'),
    ],
    m1: [
        l('Hôtel à Plaka', "Plaka · au pied de l'Acropole", 3, 1.2, ['Petit-déjeuner', 'Rooftop'], 'ATH', 'hôtel Plaka'),
        l('Chambre troglodyte à Oia', 'Santorin · vue sur la caldeira', 4, 3.5, ['Vue caldeira', 'Jacuzzi'], 'boat', 'cave hotel Oia'),
        l('Studio à Fira', 'Santorin · plus abordable qu\'Oia', 3, 1.6, ['Kitchenette', 'Terrasse'], 'hotel3', 'studio Fira'),
    ],
    m2: [
        l('Hôtel boutique à Sultanahmet', 'Sultanahmet · Sainte-Sophie à pied', 3, 1.2, ['Petit-déjeuner', 'Terrasse'], 'IST', 'hôtel Sultanahmet'),
        l('Appartement à Beyoğlu', 'Galata · animé, côté européen', 3, 1.1, ['Cuisine équipée', 'WiFi'], 'alley', 'appartement Beyoğlu'),
        l('Hôtel avec vue sur le Bosphore', 'Beşiktaş ou Karaköy', 5, 3, ['Vue Bosphore', 'Spa', 'Restaurant'], 'hotel1', 'hôtel vue Bosphore'),
    ],
    m3: [
        l('Bungalow en bord de plage', 'Ko Phi Phi · plage de Long Beach', 3, 1.5, ['Plage', 'Climatisation'], 'HKT', 'bungalow Phi Phi'),
        l('Resort avec piscine', 'Kata ou Karon · Phuket', 4, 2.5, ['Piscine', 'Spa', 'Restaurant'], 'hotel4', 'resort Kata'),
        l('Guesthouse', 'Old Phuket Town · petit budget', 2, 0.8, ['Petit-déjeuner', 'WiFi'], 'alley', 'guesthouse Phuket Town'),
    ],
    m4: [
        l('Hôtel boutique à Palermo', 'Palermo Soho · restaurants et parcs', 4, 2, ['Petit-déjeuner', 'Piscine'], 'EZE', 'hôtel Palermo Soho'),
        l('Appartement à San Telmo', 'San Telmo · tango et marché du dimanche', 3, 1.1, ['Cuisine équipée', 'WiFi'], 'alley', 'appartement San Telmo'),
        l('Hôtel à Recoleta', 'Recoleta · élégant et central', 4, 2.2, ['Petit-déjeuner', 'Salle de sport'], 'hotel1', 'hôtel Recoleta'),
    ],
    m5: [
        l('Hôtel à Nairobi', 'Westlands · avant et après le safari', 3, 1, ['Petit-déjeuner', 'Piscine'], 'hotel3', 'hôtel Westlands Nairobi'),
        l('Lodge de safari', 'Masai Mara · pension complète', 4, 3.5, ['Pension complète', 'Safaris'], 'NBO', 'lodge Masai Mara'),
        l('Camp sous tente', 'Masai Mara · au plus près de la savane', 3, 2.5, ['Pension complète', 'Feu de camp'], 'hike', 'tented camp Masai Mara'),
    ],
    c1: [
        l('Ryokan traditionnel', 'Kyoto · tatamis, onsen et dîner kaiseki', 4, 2.5, ['Bain onsen', 'Demi-pension'], 'NRT', 'ryokan Kyoto'),
        l('Hôtel business', 'Tokyo · près d\'une gare JR', 3, 1, ['WiFi', 'Laverie'], 'hotel3', 'hôtel Shinjuku'),
        l('Machiya', 'Kyoto · maison de ville en bois', 3, 1.8, ['Cuisine', 'Jardin intérieur'], 'alley', 'machiya Kyoto'),
        l('Hôtel capsule', 'Tokyo · pour une nuit, petit budget', 1, 0.4, ['Bains communs', 'Casier'], 'backpack', 'capsule hotel Tokyo'),
    ],
    c2: [
        l('Guesthouse à Reykjavik', 'Centre · bars et port à pied', 2, 0.8, ['Cuisine commune', 'WiFi'], 'KEF', 'guesthouse Reykjavik'),
        l('Chalet sur la route circulaire', 'Sud de l\'île · aurores boréales', 3, 1.3, ['Jacuzzi', 'Cuisine'], 'lake', 'cabin Islande'),
        l('Hôtel de campagne', 'Cercle d\'or · près des geysers', 4, 1.8, ['Restaurant', 'Bain chaud'], 'hotel1', 'hôtel Golden Circle'),
    ],
    c3: [
        l('Hôtel à Midtown', 'Midtown · Times Square et musées', 3, 1, ['WiFi', 'Salle de sport'], 'JFK', 'hôtel Midtown Manhattan'),
        l('Hôtel boutique à Brooklyn', 'Williamsburg · vue sur Manhattan', 4, 1.3, ['Rooftop', 'Bar'], 'hotel2', 'hôtel Williamsburg'),
        l('Auberge', 'Upper West Side · près de Central Park', 2, 0.4, ['Cuisine commune', 'WiFi'], 'backpack', 'auberge New York'),
    ],
    c4: [
        l('Hôtel à Circular Quay', "Centre · vue sur l'Opéra", 4, 1.6, ['Vue port', 'Restaurant'], 'SYD', 'hôtel Circular Quay'),
        l('Appartement à Bondi', 'Bondi Beach · surf et promenade côtière', 3, 1.2, ['Cuisine équipée', 'Balcon'], 'paddle', 'appartement Bondi'),
        l('Auberge', 'Surry Hills · petit budget', 2, 0.4, ['Cuisine commune', 'WiFi'], 'backpack', 'auberge Sydney'),
    ],
    l1: [
        l('Guesthouse sur une île locale', 'Maafushi ou Thulusdhoo · budget doux', 3, 0.3, ['Petit-déjeuner', 'Excursions'], 'paddle', 'guesthouse Maafushi'),
        l('Villa sur pilotis', 'Resort sur île privée · accès lagon', 5, 1.6, ['Accès lagon', 'Pension complète'], 'MLE', 'water villa Maldives'),
        l('Villa plage en resort', 'Resort sur île privée · pieds dans le sable', 5, 1.2, ['Plage privée', 'Demi-pension'], 'dive', 'beach villa Maldives'),
    ],
    l2: [
        l('Pension de famille', 'Moorea ou Huahine · accueil polynésien', 2, 0.4, ['Petit-déjeuner', 'Kayak'], 'paddle', 'pension Moorea'),
        l('Bungalow sur pilotis', 'Bora Bora · lagon turquoise', 5, 2, ['Accès lagon', 'Petit-déjeuner'], 'PPT', 'bungalow pilotis Bora Bora'),
        l('Hôtel à Papeete', 'Tahiti · avant les îles', 3, 0.6, ['Piscine', 'Restaurant'], 'hotel3', 'hôtel Papeete'),
    ],
    l3: [
        l('Hôtel à Deira', 'Vieux Dubaï · souks et creek', 3, 0.4, ['Petit-déjeuner', 'Piscine'], 'market', 'hôtel Deira'),
        l('Hôtel à Downtown', 'Burj Khalifa et Dubai Mall à pied', 5, 1.2, ['Piscine', 'Spa', 'Vue Burj'], 'DXB', 'hôtel Downtown Dubai'),
        l('Resort sur Palm Jumeirah', 'Plage privée', 5, 1.8, ['Plage privée', 'Piscines'], 'hotel4', 'resort Palm Jumeirah'),
        l('Camp dans le désert', 'Désert · une nuit sous les étoiles', 4, 1.5, ['Dîner', 'Balade à dos de chameau'], 'pyr', 'desert camp Dubai'),
    ],
};

// Hors catalogue : types génériques, sans prétendre connaître la ville
export const GENERIC: Lodging[] = [
    l('Hôtel 3 étoiles en centre-ville', 'Centre · pratique pour tout faire à pied', 3, 1, ['WiFi', 'Petit-déjeuner'], 'hotel3', 'hôtel 3 étoiles'),
    l('Hôtel 4 étoiles', 'Quartier central', 4, 1.8, ['Restaurant', 'Salle de sport'], 'hotel1', 'hôtel 4 étoiles'),
    l('Appartement', 'Pour cuisiner et vivre comme sur place', 3, 1.1, ['Cuisine équipée', 'WiFi'], 'hotel2', 'appartement'),
    l('Auberge ou guesthouse', 'Petit budget', 2, 0.5, ['Cuisine commune', 'WiFi'], 'backpack', 'auberge'),
];
