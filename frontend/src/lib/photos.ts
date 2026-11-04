// Photos Unsplash. Clé = code aéroport de la destination, ou un thème.
export const PHOTOS = {
    RAK: "1539020140153-e479b8c22e70", LIS: "1555881400-74d7acaacd8b", DPS: "1537996194471-e657df975ab4", MDE: "1568632234157-ce7aecd03d0d", ZQN: "1464822759023-fed622ff2c3b",
    BUD: "1565426873118-a17ed65d74b9", TBS: "1565008576549-57569a49371d", CNX: "1528181304800-259b08848526", HAN: "1528127269322-539801943592", KRK: "1600623471616-8c1966c91ff6",
    ATH: "1570077188670-e3a8d69ac5ff", IST: "1524231757912-21f4fe3a7200", HKT: "1589394815804-964ed0be2eb5", EZE: "1612294037637-ec328d0e075e", NBO: "1516426122078-c23e76319801",
    NRT: "1493976040374-85c8e12f0c0e", KEF: "1531366936337-7c912a4589a7", JFK: "1496442226666-8d4d0e62e6e9", SYD: "1506973035872-a4ec16b8e8d9",
    MLE: "1514282401047-d79a71a590e8", PPT: "1589197331516-4d84b72ebde3", DXB: "1512453979798-5ea266f8880c",
    hero: "1506905925346-21bda4d32df4", fog: "1448375240586-882707db888b", lake: "1501785888041-af3ef285b470", hike: "1551632811-561732d1e306", backpack: "1503220317375-aaad61436b1b",
    friends: "1539635278303-d4002c07eae3", balloons: "1530789253388-582c481c54b0", paddle: "1472745942893-4b9f730c7668", road: "1500530855697-b586d89ba3ee",
    clouds: "1500835556837-99ac94a94552", plane: "1436491865332-7a61a109cc05", map: "1488646953014-85cb44e25828", notebook: "1452421822248-d4c2b47f0c81",
    notes: "1517842645767-c639042777db", laptop: "1522199755839-a2bacb67c546", tarmac: "1542296332-2e4473faf563", gate: "1530521954074-e64f6810b32d",
    market: "1533900298318-6b8da08a523e", food: "1504674900247-0877df9cc836", rafting: "1530866495561-507c9faab2ed", wall: "1508804185872-d7badad00f7d", pyr: "1503177119275-0aa32b3a9368",
    hotel1: "1566073771259-6a8506099945", hotel2: "1582719478250-c89cae4dc85b", hotel3: "1542314831-068cd1dbfeeb", hotel4: "1571896349842-33c89424de2d",
    dive: "1544551763-46a013bb70d5", boat: "1476514525535-07fb3b4ae5f1", meadow: "1501555088652-021faa106b9b", alley: "1527631746610-bca00a040d60",
} as const;

export type PhotoKey = keyof typeof PHOTOS;

export const isPhotoKey = (k: string | null | undefined): k is PhotoKey => !!k && k in PHOTOS;

export const photoBase = (k: PhotoKey) => `https://images.unsplash.com/photo-${PHOTOS[k]}?auto=format&fit=crop&q=75`;

export const photo = (k: PhotoKey, w = 1200) => `${photoBase(k)}&w=${w}`;

// Choisit une photo cohérente pour une carte (hôtel, activité, ville hors catalogue)
// à partir de son libellé, de façon stable (même texte → même photo).
export function photoFor(text: string, hint?: "hotel" | "activity"): PhotoKey {
    const txt = text.toLowerCase();
    const h = [...txt].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    const pick = (keys: PhotoKey[]) => keys[h % keys.length];
    if (hint === "hotel" || /★|étoile|hôtel|hotel|riad|auberge|resort|suite|lodge/.test(txt)) return pick(["hotel1", "hotel2", "hotel3", "hotel4"]);
    if (/gastro|food|cuisine|dégust|marché|vin|culinaire|restaurant/.test(txt)) return pick(["food", "market"]);
    if (/plage|mer|surf|kayak|plongée|snorkel|bateau|croisière|eau|lagon/.test(txt)) return pick(["paddle", "dive", "boat"]);
    if (/nature|rando|montagne|parc|trek|volcan|cascade|jardin/.test(txt)) return pick(["hike", "meadow", "lake"]);
    if (/aventure|sport|raft|parapente|quad|safari|4x4/.test(txt)) return pick(["rafting", "backpack"]);
    if (/culture|musée|visite|histoire|quartier|monument|temple|château|cathédrale/.test(txt)) return pick(["alley", "market", "balloons"]);
    return pick(["road", "lake", "backpack", "boat", "meadow"]);
}
