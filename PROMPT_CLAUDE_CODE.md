# Prompt pour Claude Code — Refonte UI AIVANA (repo O-Flyes, frontend/src)

Copie tout ce qui suit dans Claude Code.

---

**Référence visuelle :** le dossier `/maquette` à la racine du repo contient la maquette complète (fichiers `.dc.html`, ouvrables dans un navigateur avec `npx serve maquette`). Ouvre-les et lis leur code : chaque section, espacement, taille de police, couleur et animation y est défini en styles inline. **Reproduis-les à l'identique** en composants React/Tailwind. Correspondance : Accueil → app/page.tsx, SiteNav → Navbar.tsx, SiteFooter → Footer.tsx, ChatDock → components/chat/ChatDock.tsx, AivanaVisual → composant d'image de carte, Destinations → app/explore, Destination → app/destination/[id], Vols → explore/flights, Hotels → explore/hotels, Activites → explore/activities, Dashboard, Connexion → auth/login, Onboarding, Tarifs → pricing, Journal → blog, Assistant → assistant. `data.js` contient les données de démo et la table des photos. Ne copie pas `support.js` ni `image-slot.js` (outils de maquette uniquement).

Tu travailles sur le front Next.js + Tailwind de `frontend/src`. Applique une refonte visuelle et UX complète du site AIVANA. **Ne casse aucune logique existante** (API Amadeus, OpenTripMap, auth, store, routes) : tu changes la présentation, la structure des sections et tu ajoutes un chatbot global. Travaille fichier par fichier, compile après chaque étape (`npm run build` / `tsc --noEmit`), et montre-moi le diff de chaque fichier important.

## 1. Fondations

### Polices (app/layout.tsx via `next/font/google`)
- `Manrope` (400, 500, 600, 700, 800) → variable `--font-sans`. Corps, UI, boutons, titres.
- `Newsreader` italic (500, 600, opsz) → `--font-serif`. Uniquement pour **un ou deux mots en italique dans les titres** (ex. « Voyagez au-delà de *l'ordinaire* »).
- `Kaushan Script` → `--font-logo`. Uniquement pour le logo « Aivana ».
- Supprime Tenor Sans, Outfit, Playfair, DM Serif, Instrument, Inter si présents.

### Tailwind (tailwind.config)
```js
fontFamily: { sans: ['var(--font-sans)','system-ui','sans-serif'], serif: ['var(--font-serif)','serif'], logo: ['var(--font-logo)','cursive'] },
colors: {
  ink: '#0F1B2D',        // bleu nuit : texte principal, boutons primaires
  'ink-2': '#1E2E47',    // hover des boutons primaires
  gold: '#C9A24B',       // accents, logo, flèches
  'gold-deep': '#9A7A34',// liens / texte accent sur fond clair
  'gold-soft': '#F1E3C2',// pastilles, fonds de flèches
  paper: '#F9F8F6',      // fond de page
  sand: '#E9E1D3',       // section saison
  mist: '#EAEFF4',       // section chiffres
  sky: '#DCE6EF',        // carte CTA
  line: '#E4DFD5', 'line-2': '#D3CCBF',
  muted: '#736E66', 'muted-2': '#4D4943',
}
```
`globals.css` : `body { @apply bg-paper text-ink font-sans antialiased }`, `h1..h6 { @apply font-sans font-bold tracking-[-0.035em] }`, `a { color:#9A7A34 } a:hover { color:#6E5323 }`.

### Règles de design (à respecter partout)
- Titres : Manrope 700/800, tracking serré (-0.035em à -0.055em), 1 mot clé en `font-serif italic font-medium`.
- Pas d'emojis, pas de labels en MAJUSCULES, pas de fausses stats ni de faux avis.
- Icônes : **lucide-react** uniquement (ArrowUpRight, ArrowRight, ArrowLeft, Search, Plane, X, Menu, Send, MapPin, MessageSquare, Globe). Taille via `size` ou `w-[1em] h-[1em]`.
- Boutons primaires : pilule `rounded-full bg-ink text-white font-semibold`, avec à droite un rond blanc (ou bleu nuit) contenant `ArrowUpRight`.
- Boutons secondaires : pilule à contour fin `border border-line-2`.
- Pastilles « eyebrow » au-dessus des titres : `rounded-full border-[1.5px] border-dashed border-[#D9CDB8] px-3.5 py-1.5 text-[13px] font-semibold text-muted-2 whitespace-nowrap`.
- Cartes : `rounded-[22px]` à `rounded-[28px]`, photo en `object-cover`, zoom doux au survol (`transition duration-700 hover:scale-105`).
- Tous les textes et boutons courts en `whitespace-nowrap` si ça peut casser (badges, prix, « 650 € »).
- Responsive obligatoire : grilles `repeat(auto-fit,minmax(min(100%,300px),1fr))`, décorations flottantes masquées sous 1100 px.
- Respecte `prefers-reduced-motion` : aucune animation si activé.

## 2. Photos (Unsplash, coller dans `lib/photos.ts`)
URL : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75` (ajoute `images.unsplash.com` dans `next.config` → `images.remotePatterns`). Clé = code aéroport de la destination.
```ts
export const PHOTOS = {
  RAK:'1539020140153-e479b8c22e70', LIS:'1555881400-74d7acaacd8b', DPS:'1537996194471-e657df975ab4', MDE:'1568632234157-ce7aecd03d0d', ZQN:'1464822759023-fed622ff2c3b',
  BUD:'1565426873118-a17ed65d74b9', TBS:'1565008576549-57569a49371d', CNX:'1528181304800-259b08848526', HAN:'1528127269322-539801943592', KRK:'1600623471616-8c1966c91ff6',
  ATH:'1570077188670-e3a8d69ac5ff', IST:'1524231757912-21f4fe3a7200', HKT:'1589394815804-964ed0be2eb5', EZE:'1612294037637-ec328d0e075e', NBO:'1516426122078-c23e76319801',
  NRT:'1493976040374-85c8e12f0c0e', KEF:'1531366936337-7c912a4589a7', JFK:'1496442226666-8d4d0e62e6e9', SYD:'1506973035872-a4ec16b8e8d9',
  MLE:'1514282401047-d79a71a590e8', PPT:'1589197331516-4d84b72ebde3', DXB:'1512453979798-5ea266f8880c',
  fog:'1448375240586-882707db888b', lake:'1501785888041-af3ef285b470', hike:'1551632811-561732d1e306', backpack:'1503220317375-aaad61436b1b',
  friends:'1539635278303-d4002c07eae3', balloons:'1530789253388-582c481c54b0', paddle:'1472745942893-4b9f730c7668', road:'1500530855697-b586d89ba3ee',
  clouds:'1500835556837-99ac94a94552', plane:'1436491865332-7a61a109cc05', map:'1488646953014-85cb44e25828', notebook:'1452421822248-d4c2b47f0c81',
  market:'1533900298318-6b8da08a523e', food:'1504674900247-0877df9cc836', rafting:'1530866495561-507c9faab2ed', wall:'1508804185872-d7badad00f7d', pyr:'1503177119275-0aa32b3a9368',
  hotel1:'1566073771259-6a8506099945', hotel2:'1582719478250-c89cae4dc85b', hotel3:'1542314831-068cd1dbfeeb', hotel4:'1571896349842-33c89424de2d',
} as const;
export const photo = (k: keyof typeof PHOTOS, w = 1200) => `https://images.unsplash.com/photo-${PHOTOS[k]}?auto=format&fit=crop&w=${w}&q=75`;
```
Remplace **toutes** les images de cartes (destinations, hôtels, activités, blog) par ces photos : destination → son code, hôtel → hotel1..4, activité → selon la catégorie (gastro → food/market, plage → paddle, nature → hike/lake, aventure → rafting, culture → market/balloons). Fournis un `onError` qui affiche un fond `#D9D2C4`. Le globe du titre final : `public/globe.png` (je te le fournis).

## 3. Navbar (`components/layout/Navbar.tsx`)
- Grille 3 colonnes : **gauche** bouton rond blanc 60px avec icône `Menu` + libellé « Menu » ; **centre** logo ; **droite** pilule à contour « Connexion » (→ /auth/login) + gros bouton blanc « Planifier un voyage » avec rond bleu nuit et `ArrowUpRight` doré (ouvre le chatbot).
- Logo : « Aivana » en `font-logo` 44px (36px sur pages internes, 30px mobile), petite icône `Plane` dorée en haut à droite tournée de -30°, trait doré de 2px sous le mot, légèrement incliné.
- Variante `overlay` (accueil, sur la photo) : transparente, texte blanc, contour Connexion blanc 55 %. Variante `solid` (pages internes) : sticky, fond `rgba(249,248,246,0.82)` + `backdrop-blur-[18px] saturate-150` + bordure basse fine.
- Sous 860px : on masque « Connexion » et le libellé de Planifier (reste la flèche ronde) ; « Connexion » passe dans le menu.
- Menu plein écran : fond paper, à gauche gros liens (Accueil, Destinations, Vols, Hôtels, Activités, Journal, Mes voyages, Tarifs, Connexion) en 28–48px bold avec petite note en italique serif à droite et séparateurs en pointillés, bouton « Demander au copilote » ; à droite (≥900px) photo `balloons` arrondie avec « Où partez-vous ensuite ? ».

## 4. Chatbot global (élément central du projet)
Crée `components/chat/ChatDock.tsx`, monté **une seule fois dans app/layout.tsx** (sauf sur la page /assistant qui est déjà un chat plein écran). Réutilise la logique existante de `Chatbot.tsx` / API IA.
- Bouton flottant fixe en bas à droite : pilule bleu nuit, pastille logo (carré arrondi bleu nuit, « A » doré en forme de sommet + arc d'horizon en SVG) avec point vert « en ligne », titre « Planifier avec l'IA » + sous-titre. Sous 1100px : seulement le rond.
- Panneau 400×620 (plein écran mobile), verre dépoli, coins 28px : en-tête (logo, « Copilote AIVANA », statut, bouton « Nouveau », fermer), bulles (utilisateur bleu nuit à droite, IA sable à gauche), suggestions au démarrage, résultats sous forme de mini-cartes destination (photo 64px, nom, pays · nuits · voyageurs, total estimé) cliquables vers la fiche, liens d'action en pilules, champ en bas avec bouton envoyer (icône `ArrowUp`).
- Conversation persistée (localStorage `aivana-chat`), donc elle suit l'utilisateur de page en page.
- Expose un événement global `window.dispatchEvent(new CustomEvent('aivana-ask', { detail: texte }))` (ou un store Zustand) : la recherche du hero, « Planifier un voyage », « Itinéraire IA » et les CTA ouvrent le panneau et envoient le texte.

## 5. Page d'accueil (`app/page.tsx`) — sections dans l'ordre
1. **Hero** plein écran : photo `fog` (forêt dans la brume) avec léger parallaxe, voile sombre en haut, **brume blanche floutée en bas** (plusieurs `radial-gradient` blancs + `blur(26px)`) qui se fond dans la page. Badge or pâle à bordure pointillée dorée « Votre copilote de voyage IA ». H1 « Voyagez au-delà de *l'ordinaire* » (52→112px, blanc). Sous-titre. Barre de recherche blanche 700px avec bouton rond bleu nuit `Search` → ouvre le chatbot.
2. **Par envie** : remonte de 120px sur la brume. Timbres photo flottants (cadre blanc + pointillés) à gauche et à droite. Carrousel de 3 ronds (Nature, Aventure, Plage, Culture, Gastronomie) : celui du centre 240px avec ombre, côtés 150px, rotation auto toutes les 4 s (stop au clic), texte descriptif, points de pagination, bouton « Voir les destinations ».
3. **Notre promesse** : grand texte centré (32→64px) « On ne vend pas des séjours, on construit des *voyages* qui tiennent dans *votre budget* », entouré de 4 grandes formes flottantes (≥1100px, sinon en ligne) : fleur ondulée or pâle « Prix réels, à jour » (MapPin), étoile à 12 pointes « Copilote IA 24 h/24 » (MessageSquare), croix arrondie « Itinéraires sur mesure » (Plane), losange arrondi bleu ciel « 22 destinations » (Globe). Icône dans un rond blanc 56px. Formes via `clip-path: polygon(...)`.
4. **Sélection** : titre à gauche « Des voyages *pensés* pour chaque voyageur » + texte + bouton « Tout voir » à droite ; 3 cartes (Kyoto & Tokyo, Marrakech, Maldives) : photo 5/4 arrondie, badge pays, nom, description, prix « dès … à deux », pilule durée. Puis **carte CTA** bleu ciel avec cadre intérieur pointillé blanc, 3 photos en éventail (2 floutées derrière), « Prêt à planifier votre *voyage* de rêve ? », bouton « Écrire au copilote », icône avion blanche flottante.
5. **Bandeau timbre** : bande bleu nuit inclinée de -4°, **bords dentelés** (mask `radial-gradient` répété en haut et en bas), noms de destinations géants (56→140px, blanc) séparés par des photos rondes, défilement infini (requestAnimationFrame). Fond moitié paper / moitié sand.
6. **Saison** (fond sand) : « Les destinations *de la saison* », badge « Idéal en {mois courant} » ; carte blanche avec photo à gauche et infos à droite (pays, nom, description, durée, prix, « Découvrir » + « Itinéraire IA »), flèches précédent/suivant, vignettes rondes cliquables. Filtre : destinations dont `months` contient le mois actuel. Timbres flottants.
7. **Méthode** (fond ink, 2 colonnes) : photo plein cadre à gauche qui change en fondu ; à droite « Comment on *planifie* votre voyage », 4 boutons ronds 01–04, vignette ronde, titre + texte de l'étape, barre de progression or. Avance automatique toutes les 5 s.
8. **Chiffres** (fond mist) : carte du monde en points (`radial-gradient` de points + mask elliptique), avatars ronds flottants (≥1180px seulement), énorme « 22 » (110→260px, 800) avec étiquette blanche inclinée « Destinations choisies » ; 3 stats honnêtes en serif italique (5 Continents, 12 Mois couverts, 650 € Budget minimum) avec étiquette pastel inclinée qui chevauche le bas du chiffre, trait pointillé, légende.
9. **Galerie en arc** : bande de grandes photos arrondies (300–400px de large, 400–500px de haut) qui défile en continu ; chaque carte reçoit en temps réel `perspective(1400px) rotateY(n*-24deg) rotateZ(n*-2.5deg) scale(1-|n|*0.2)` selon sa distance au centre de l'écran (effet carrousel courbé). Carte d'embarquement CDG → KEF faite en CSS, inclinée et flottante. Fond mist qui se fond vers paper.
10. **Final** : « Le m[globe]nde entier vous *attend* » (56→160px, 800) avec le globe `public/globe.png` dans le « o » ; tracé SVG pointillé décoratif, avion et drapeau Lucide, timbre dentelé, pile de 3 cartes photo (wall) inclinées ; bouton or pâle incliné de 3° « Commencer à planifier » qui ouvre le chatbot. Décos seulement ≥1180px.
11. **Journal** : « Récits *de la route* », 2 cartes (la première sur 2 colonnes), badges, bouton « Tout le journal ».

Animations : apparition des blocs au défilement (IntersectionObserver, opacity 0→1 + translateY 28px, décalage 80 ms), flottement doux des décorations (sin, ±9px), défilements infinis. Tout coupé si `prefers-reduced-motion`.

## 6. Footer (`components/layout/Footer.tsx`)
- Photo plein fond `clouds` (ciel au coucher du soleil vu d'avion) avec **brume blanche en haut** qui se fond avec la page, dégradé sombre vers le bas.
- Centre : « Des idées de voyage *livrées* chaque mois » + champ email blanc 700px avec bouton « S'inscrire » + mention « Une seule lettre par mois · Désinscription en un clic ». État « Merci… » après envoi.
- Bas : logo Aivana (blanc 48px), phrase, pastilles de destinations avec mini photo ronde (Japon, Maroc, Islande, Maldives, Bali, Kenya) + pastille blanche « Toutes les destinations » ; colonnes **Pages** et **Planifier** uniquement (titres en serif italique 30px, séparateur pointillé). Ligne finale © 2026 Aivana · Photos Unsplash · Mentions légales · Confidentialité.

## 7. Pages internes
Pour chaque page (explore, destination/[id], explore/flights, explore/hotels, explore/activities, dashboard, auth/login, onboarding, pricing, blog, assistant) :
- Navbar `solid` sticky, puis **bannière photo arrondie 28px** (160→280px de haut) : Destinations `lake`, Vols `clouds`, Hôtels `hotel4`, Activités `rafting`, Journal `notebook`, Tarifs `map`.
- H1 avec un mot en serif italique : « Où *partir* ensuite ? », « Trouver *votre vol* », « Où *dormir* », « Quoi *faire* sur place », « Le *journal* du voyageur », « Des tarifs *simples* », « Votre *assistant* voyage », « Bienvenue *à bord* », « Chaque voyage *commence ici.* ».
- Formulaires de recherche Vols/Hôtels : le bouton Rechercher occupe toute la largeur sous les champs (`col-span-full`). Tris en pilules qui ne passent pas à la ligne. Bouton « Ajouter au voyage » bleu nuit plein, puis contour une fois ajouté. Cases et radios en or (`accent-gold`).
- Toutes les cartes utilisent les vraies photos (section 2). Coins arrondis cohérents (18–24px), pilules `rounded-full`.
- Footer + ChatDock partout (sauf ChatDock sur /assistant).

## 8. Contrôles finaux
- Aucune couleur hors palette, aucun emoji, aucune police supprimée restante (`grep -r "Tenor\|Outfit\|Playfair\|#1A1A1A\|#000000"`).
- Tester à 375px, 768px, 910px, 1280px, 1920px : aucun texte coupé ni recouvert par une décoration ou par le bouton du chatbot.
- Lighthouse : images en `next/image` avec `sizes`, contrastes ≥ 4.5:1.
- Commit par étape : `feat(ui): fondations`, `feat(ui): navbar`, `feat(chat): ChatDock global`, `feat(home): sections`, `feat(ui): footer`, `feat(ui): pages internes`.
