# Rapport technique — Bloc 2 (AIVANA)

Ce rapport décrit l'état réel du code du frontend AIVANA (`frontend/`) après la phase de restructuration et de mise en place des tests unitaires. Toutes les informations ci-dessous (arborescence, versions, extraits, sorties de tests) sont issues directement du dépôt et de l'exécution des commandes.

## 1. Architecture

### Arborescence (`frontend/src/`)

```text
src/
├── middleware.ts
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── not-found.tsx
│   ├── api/
│   │   ├── ai/extract/route.ts
│   │   ├── chat/route.ts
│   │   ├── email/
│   │   │   ├── connect/google/route.ts
│   │   │   ├── connect/outlook/route.ts
│   │   │   └── sync/route.ts
│   │   ├── me/route.ts
│   │   ├── metrics/event/route.ts
│   │   ├── partner/
│   │   │   ├── activities/search/route.ts
│   │   │   ├── flights/search/route.ts
│   │   │   ├── hotels/search/route.ts
│   │   │   └── locations/suggest/route.ts
│   │   ├── recommendations/route.ts
│   │   └── trips/
│   │       ├── route.ts
│   │       └── [tripId]/
│   │           ├── route.ts
│   │           ├── items/route.ts
│   │           ├── items/[itemId]/route.ts
│   │           └── proposal/route.ts
│   ├── auth/
│   │   ├── callback/route.ts
│   │   ├── forgot-password/page.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── success/page.tsx
│   │   └── verify-email/page.tsx
│   ├── blog/page.tsx
│   ├── dashboard/page.tsx
│   ├── destination/[id]/page.tsx
│   ├── explore/
│   │   ├── page.tsx
│   │   ├── activities/page.tsx
│   │   ├── flights/page.tsx
│   │   └── hotels/page.tsx
│   ├── gallery/page.tsx
│   ├── onboarding/page.tsx
│   └── pricing/page.tsx
├── components/
│   ├── chat/
│   │   ├── AIProposalModal.tsx
│   │   └── Chatbot.tsx
│   ├── layout/
│   │   ├── ClientShell.tsx
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   ├── PageTransition.tsx
│   │   ├── PlaneBackground.tsx
│   │   ├── PremiumCursor.tsx
│   │   └── ThemeProvider.tsx
│   ├── trip/
│   │   ├── AddToTripModal.tsx
│   │   ├── TripBudgetPanel.tsx
│   │   ├── TripContextBanner.tsx
│   │   └── TripProposal.tsx
│   └── ui/
│       └── GlobalLoader.tsx
├── lib/
│   ├── agents/
│   │   ├── roadtripAgent.ts
│   │   └── types.ts
│   ├── ai/
│   │   ├── groq.ts
│   │   └── recommendations.ts
│   ├── supabase/
│   │   ├── browser.ts
│   │   └── server.ts
│   ├── travel/
│   │   ├── amadeus.ts
│   │   └── opentripmap.ts
│   ├── validation/
│   │   └── recommendations.ts
│   ├── destinations.ts
│   ├── iata.ts
│   ├── iata.test.ts
│   ├── jwt.ts
│   ├── sms.ts
│   ├── trip.ts
│   └── trip.test.ts
└── types/
    ├── chat.ts
    ├── destination.ts
    ├── roadtrip.ts
    └── trip.ts
```

### Pages (`app/**/page.tsx`)

| Page | Rôle |
|---|---|
| `app/page.tsx` | Page d'accueil (hero, présentation du produit, slides) |
| `app/explore/page.tsx` | Catalogue de destinations avec filtres (continent, budget, style) et carrousel Top 5 alimenté par des estimations vol+hôtel réelles |
| `app/explore/flights/page.tsx` | Recherche de vols pour une destination |
| `app/explore/hotels/page.tsx` | Recherche d'hôtels pour une destination |
| `app/explore/activities/page.tsx` | Recherche d'activités pour une destination |
| `app/destination/[id]/page.tsx` | Page détail d'une destination (vols, hôtels, activités réels + ajout au voyage) |
| `app/dashboard/page.tsx` | Tableau de bord utilisateur : voyages, budget, score de complétion, proposition de roadtrip IA |
| `app/onboarding/page.tsx` | Parcours d'onboarding après inscription (préférences, connexion email) |
| `app/gallery/page.tsx` | Galerie photo d'inspiration voyage |
| `app/blog/page.tsx` | Articles de blog |
| `app/pricing/page.tsx` | Page des offres / tarifs |
| `app/auth/login/page.tsx` | Connexion |
| `app/auth/register/page.tsx` | Inscription |
| `app/auth/forgot-password/page.tsx` | Demande de réinitialisation de mot de passe |
| `app/auth/reset-password/page.tsx` | Saisie du nouveau mot de passe |
| `app/auth/verify-email/page.tsx` | Écran d'attente de vérification d'email |
| `app/auth/success/page.tsx` | Écran de confirmation après une action (inscription, etc.) |

### API Routes (`app/api/**/route.ts`)

| Route | Rôle |
|---|---|
| `api/chat/route.ts` | POST — chatbot IA (Groq), grounding sur des prix réels Amadeus / activités OpenTripMap |
| `api/trips/route.ts` | GET liste des voyages de l'utilisateur, POST création d'un voyage (+ SMS de confirmation via Brevo) |
| `api/trips/[tripId]/route.ts` | GET détail, PATCH mise à jour, DELETE suppression d'un voyage |
| `api/trips/[tripId]/items/route.ts` | GET items (réservations) d'un voyage, POST ajout d'un item |
| `api/trips/[tripId]/items/[itemId]/route.ts` | DELETE suppression d'un item de voyage |
| `api/trips/[tripId]/proposal/route.ts` | GET stub (proposal null), POST génère une proposition de roadtrip via l'agent IA |
| `api/recommendations/route.ts` | GET recommandations IA sauvegardées, POST génère et valide une nouvelle recommandation (Groq + Zod) |
| `api/partner/flights/search/route.ts` | GET recherche de vols (Amadeus, fallback statique réaliste) |
| `api/partner/hotels/search/route.ts` | GET recherche d'hôtels (Amadeus, fallback statique réaliste) |
| `api/partner/activities/search/route.ts` | GET recherche d'activités (OpenTripMap, fallback curé par ville) |
| `api/partner/locations/suggest/route.ts` | GET autocomplétion de villes/pays (API Photon/OSM, fallback statique) |
| `api/me/route.ts` | GET informations de l'utilisateur connecté |
| `api/metrics/event/route.ts` | POST réception d'événements analytics (no-op) |
| `api/ai/extract/route.ts` | POST extraction simplifiée d'une réservation depuis un texte d'email (mock) |
| `api/email/sync/route.ts` | POST synchronisation des boîtes mail — non implémenté (501) |
| `api/email/connect/google/route.ts` | POST connexion Gmail — non implémenté (501) |
| `api/email/connect/outlook/route.ts` | POST connexion Outlook — non implémenté (501) |

À part, `app/auth/callback/route.ts` (GET) gère le callback OAuth Supabase (échange du code contre une session).

### Composants principaux

| Composant | Rôle |
|---|---|
| `components/chat/Chatbot.tsx` | Widget de chat IA flottant (suggestions, historique, cartes destinations enrichies) |
| `components/chat/AIProposalModal.tsx` | Modale détaillant une destination proposée par le chatbot, avec ajout au voyage |
| `components/layout/Navbar.tsx` | Barre de navigation responsive (liens, menu mobile, switch thème, auth) |
| `components/layout/Footer.tsx` | Pied de page (liens, réseaux, mentions légales) |
| `components/layout/ClientShell.tsx` | Layout client global : Navbar/Footer/Chatbot conditionnels selon la route, écran d'intro |
| `components/layout/ThemeProvider.tsx` | Contexte React pour le thème clair/sombre (hook `useTheme`) |
| `components/layout/PremiumCursor.tsx` | Curseur personnalisé doré (desktop uniquement) |
| `components/layout/PlaneBackground.tsx` | Animation de fond (avions traversant l'écran) |
| `components/layout/PageTransition.tsx` | Transitions de page, scroll-reveal et particules dorées en fond |
| `components/trip/AddToTripModal.tsx` | Modale pour ajouter un élément (vol/hôtel/activité) à un voyage existant ou nouveau |
| `components/trip/TripBudgetPanel.tsx` | Panneau de suivi du budget et du score de complétion d'un voyage |
| `components/trip/TripContextBanner.tsx` | Bandeau affiché sur les pages explore quand l'utilisateur planifie un voyage précis |
| `components/trip/TripProposal.tsx` | Affichage de la proposition de roadtrip générée par l'IA |
| `components/ui/GlobalLoader.tsx` | Écran de chargement / intro animé (logo AIVANA) |

## 2. Stack technique

Versions exactes issues de `frontend/package.json` :

| Dépendance | Version | Rôle |
|---|---|---|
| `next` | 14.1.0 | Framework (App Router, Route Handlers, SSR) |
| `react` / `react-dom` | ^18.2.0 | Librairie UI |
| `typescript` | ^5.3.3 | Typage statique |
| `@supabase/ssr` | ^0.9.0 | Client Supabase adapté au SSR (cookies) |
| `@supabase/supabase-js` | ^2.98.0 | Client Supabase (auth, base de données) |
| `axios` | ^1.6.2 | Client HTTP côté front pour appeler les API routes |
| `zod` | ^4.3.6 | Validation de schémas (requêtes API, réponses IA) |
| `framer-motion` | ^12.34.3 | Animations (transitions, modales, carrousels) |
| `lucide-react` | ^0.303.0 | Icônes |
| `clsx` | ^2.0.0 | Composition conditionnelle de classes CSS |
| `tailwind-merge` | ^2.2.0 | Fusion de classes Tailwind |
| `@stripe/stripe-js` | ^2.3.0 | SDK Stripe — présent en dépendance mais non utilisé dans le code actuel (réservé pour une future intégration paiement, cf. page Tarifs) |
| `tailwindcss` | ^3.4.1 | Framework CSS utility-first |
| `jest` / `@types/jest` | ^30.4.2 / ^30.0.0 | Tests unitaires |
| `eslint` / `eslint-config-next` | 9.39.3 / 16.1.6 | Linting |
| `postcss` / `autoprefixer` | ^8.4.33 / ^10.4.16 | Traitement CSS |

**Services externes** : Supabase (PostgreSQL + Auth + RLS), Groq (`llama-3.3-70b-versatile` pour le chatbot et les agents IA), Amadeus (environnement test, vols/hôtels), OpenTripMap (activités), Brevo (SMS de confirmation).

## 3. Patterns et paradigmes utilisés

- **Server Components par défaut** : `app/layout.tsx` (pas de `"use client"`) est un composant serveur qui pose la structure HTML et englobe les providers.
- **Client Components explicites** : la grande majorité des pages et composants interactifs déclarent `"use client"` (ex. `app/dashboard/page.tsx`, `app/explore/page.tsx`, `components/chat/Chatbot.tsx`) car ils utilisent des hooks React, `useRouter`, `localStorage`, etc.
- **Route Handlers (App Router)** : chaque `route.ts` sous `app/api/` exporte des fonctions `GET`/`POST`/`PATCH`/`DELETE` (ex. `app/api/trips/[tripId]/route.ts`).
- **Context + hook personnalisé** : `components/layout/ThemeProvider.tsx` expose un `ThemeContext` et le hook `useTheme()`, consommé par `components/layout/Navbar.tsx`.
- **Middleware Next.js** : `src/middleware.ts` rafraîchit la session Supabase sur chaque requête et redirige les codes OAuth atterrissant sur `/` vers `/auth/callback`.
- **Pattern « grounding »** : dans `app/api/chat/route.ts`, la fonction `groundDestination()` part des idées de destinations proposées par le LLM et les enrichit avec de vrais prix Amadeus / activités OpenTripMap, sans jamais laisser le modèle inventer un prix.
- **Pattern « batching »** : `app/explore/page.tsx` regroupe les appels `axios` vers `/api/partner/flights/search` et `/api/partner/hotels/search` par lots de 5 (`Promise.allSettled`) pour ne pas saturer l'API Amadeus.
- **Agents IA dédiés** : `lib/agents/roadtripAgent.ts` encapsule un appel Groq spécifique à la génération de roadtrip, avec son propre prompt et son propre type de retour (`types/roadtrip.ts`).

## 4. Sécurité

### Variables d'environnement

Toutes les clés sensibles sont lues côté serveur via `process.env` et ne sont jamais exposées au client (seules `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont publiques par construction, l'anon key étant protégée par les policies RLS). Le fichier `frontend/.env.example` documente les variables attendues : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`, `AMADEUS_CLIENT_ID`, `AMADEUS_CLIENT_SECRET`, `OPENTRIPMAP_API_KEY` (optionnel), `BREVO_API_KEY` (optionnel). Le fichier réel `.env.local` n'est pas versionné (`.gitignore`).

### Protection des clés dans les API Routes

- `GROQ_API_KEY` : lue uniquement dans `lib/ai/groq.ts:15`, jamais transmise au client.
- `AMADEUS_CLIENT_ID` / `AMADEUS_CLIENT_SECRET` : lues dans `lib/travel/amadeus.ts`, `app/api/partner/flights/search/route.ts` et `app/api/partner/hotels/search/route.ts`, utilisées pour obtenir un token OAuth côté serveur.
- `OPENTRIPMAP_API_KEY` : lue dans `lib/travel/opentripmap.ts` et `app/api/partner/activities/search/route.ts`.
- `BREVO_API_KEY` : lue dans `lib/sms.ts`, utilisée uniquement côté serveur après création d'un voyage (`app/api/trips/route.ts`).

### Validation des entrées (Zod)

Chaque route qui accepte un body JSON le valide avec un schéma Zod avant tout accès à la base :

- `chatRequestSchema` (`app/api/chat/route.ts`) — valide la structure des messages envoyés au chatbot.
- `createTripSchema` (`app/api/trips/route.ts`) et `updateTripSchema` (`app/api/trips/[tripId]/route.ts`) — création/mise à jour d'un voyage.
- `createTripItemSchema` (`app/api/trips/[tripId]/items/route.ts`) — ajout d'une réservation à un voyage.
- `generateProposalSchema` (`app/api/trips/[tripId]/proposal/route.ts`) — paramètres de génération de roadtrip.
- `generateRecommendationRequestSchema` et `recommendationResultSchema` (`lib/validation/recommendations.ts`) — valident respectivement la requête utilisateur et la réponse JSON renvoyée par le LLM avant insertion en base.

### Authentification et Row Level Security (Supabase)

- `lib/supabase/server.ts` et `lib/supabase/browser.ts` créent deux clients Supabase distincts (cookies côté serveur, `localStorage` côté navigateur).
- Chaque API route appelle `supabase.auth.getUser()` et renvoie `401 Unauthorized` si l'utilisateur n'est pas authentifié (ex. `app/api/trips/route.ts`, `app/api/me/route.ts`).
- Les policies RLS sont définies dans `frontend/supabase/migrations/0001_init.sql` : `trips` n'est lisible/modifiable que si `auth.uid() = user_id`, et `trip_items` n'est accessible que si son `trip_id` appartient à un voyage de l'utilisateur connecté (sous-requête `EXISTS`). Cela permet à certaines routes de ne pas re-filtrer explicitement par `user_id` (ex. `app/api/trips/[tripId]/items/route.ts`) tout en restant isolées par utilisateur — documenté en commentaire dans le code.
- `src/middleware.ts` rafraîchit la session sur chaque requête (hors assets statiques) via `supabase.auth.getUser()`.

## 5. Tests unitaires

### Fonctions testées

- `calculateTripBudget`, `calculateTripCompletionScore`, `calculateTripAnalysis` (`src/lib/trip.ts`)
- `getIATA` (`src/lib/iata.ts`)

### Configuration

Jest est configuré via `next/jest` (`frontend/jest.config.js`), en environnement `node` (fonctions pures, pas besoin de DOM), avec le même alias `@/*` que le projet. Le script `npm test` lance `jest`.

### Résultat

14 tests répartis sur 2 suites, sortie complète de `npx jest` :

```text
Test Suites: 2 passed, 2 total
Tests:       14 passed, 14 total
Snapshots:   0 total
Time:        0.186 s, estimated 1 s
Ran all test suites.
```

## 6. Extraits de code

### Route API sécurisée — `src/app/api/trips/[tripId]/items/route.ts`

```ts
export async function POST(request: Request, { params }: { params: { tripId: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validatedData = createTripItemSchema.parse(body);

        // Idem côté insert : la policy "Users can insert own trip items" rejette l'insertion
        // si trip_id ne correspond pas à un voyage de l'utilisateur connecté.
        const { data: newItem, error } = await supabase
            .from('trip_items')
            .insert({ trip_id: params.tripId, ...validatedData })
            .select()
            .single();
```

### System prompt du chatbot — `src/app/api/chat/route.ts` (extrait, lignes 107-126)

```ts
        // Inject a system prompt to guide the AI and force a JSON structure.
        // IMPORTANT: the LLM only proposes destination *ideas* here — it must NOT invent
        // prices or activities. Real prices/activities are fetched server-side afterwards
        // from Amadeus/OpenTripMap and merged in, so users never see fabricated numbers.
        const today = new Date().toISOString().split('T')[0];
        const systemPrompt = {
            role: 'system' as const,
            content: `Tu es AIVANA, un assistant de voyage expert, luxueux et intelligent.
Nous sommes le ${today}.
Ton objectif est de planifier des voyages parfaits selon le budget et les envies de l'utilisateur.
Tu dois TOUJOURS répondre au format JSON valide.
La structure JSON doit être EXACTEMENT :
{
  "content": "Ta réponse textuelle amicale, formatée en Markdown, ...",
  "originCity": "Nom de la ville de départ mentionnée par l'utilisateur, ou null",
  "budgetEur": 1500, // Nombre entier = budget TOTAL en euros, ou null
  "travelDateEstimate": "2026-09-15", // Date déduite du contexte, ou null
  "enriched": [ /* idées de destinations, voir règles ci-dessous */ ]
}
[...]`
        };
```

### Logique de batching — `src/app/explore/page.tsx` (extrait, lignes 317-349)

```tsx
    // Batch requests in groups of 5 to avoid overwhelming Amadeus test-tier rate limits
    const BATCH = 5;
    const processResult = (res: PromiseSettledResult<PromiseSettledResult<any>[]>, d: typeof DESTINATIONS[0]) => {
      if (res.status !== "fulfilled") return { flightFrom: null, hotelFrom: null, estimatedTotal: null };
      const [flightsRes, hotelsRes] = res.value;
      const flights = flightsRes.status === "fulfilled" ? (flightsRes.value.data as Array<{ price: number }>) : [];
      const hotels = hotelsRes.status === "fulfilled" ? (hotelsRes.value.data as Array<{ price_per_night: number }>) : [];
      const flightFrom = flights.length ? Math.min(...flights.map(f => f.price)) : null;
      const hotelFrom = hotels.length ? Math.min(...hotels.map(h => h.price_per_night)) : null;
      const estimatedTotal = (flightFrom !== null && hotelFrom !== null) ? flightFrom + (hotelFrom * NIGHTS) : null;
      return { flightFrom, hotelFrom, estimatedTotal };
    };

    (async () => {
      const next: Record<string, LiveEstimate> = {};
      for (let i = 0; i < DESTINATIONS.length; i += BATCH) {
        if (cancelled) return;
        const batch = DESTINATIONS.slice(i, i + BATCH);
        const batchResults = await Promise.allSettled(
          batch.map(d => Promise.allSettled([
            axios.get("/api/partner/flights/search", { params: { origin: "Paris", destination: d.name, adults: 2 } }),
            axios.get("/api/partner/hotels/search", { params: { city: d.name, adults: 2 } }),
          ]))
        );
```

### Fonction testée — `src/lib/trip.ts`

```ts
// Budget total d'un voyage = somme des price_estimate de chaque réservation.
// Les réservations sans prix connu (price_estimate undefined/null) comptent pour 0,
// pas pour NaN — Amadeus renvoie parfois des prix manquants ou à 0.
export function calculateTripBudget(items: Booking[]): number {
    return items.reduce((sum, b) => sum + (b.price_estimate || 0), 0);
}
```

## 7. Déploiement

### Configuration Next.js (`frontend/next.config.js`)

```js
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};
```

### Scripts npm (`frontend/package.json`)

| Script | Commande | Usage |
|---|---|---|
| `npm run dev` | `next dev` | Serveur de développement |
| `npm run build` | `next build` | Build de production |
| `npm run start` | `next start` | Démarre le build de production |
| `npm run lint` | `next lint` | Linting ESLint |
| `npm test` | `jest` | Lance les tests unitaires |

### Déploiement Vercel

Le projet est conçu pour être déployé sur Vercel avec le **répertoire racine `frontend/`** (le dépôt contient aussi des fichiers hors du frontend, non utilisés par l'app). Les variables d'environnement listées dans `frontend/.env.example` doivent être renseignées dans les paramètres du projet Vercel (Production + Preview). Aucune configuration serveur supplémentaire n'est nécessaire : les Route Handlers Next.js sont déployés en tant que fonctions serverless.

## 8. Métriques

| Métrique | Valeur |
|---|---|
| Fichiers TypeScript / TSX (hors tests) | 73 |
| Fichiers de test | 2 (`lib/trip.test.ts`, `lib/iata.test.ts`) |
| Tests unitaires | 14 |
| Lignes de code (TS/TSX, hors tests) | ~11 552 |
| Composants React | 14 |
| Pages (`app/**/page.tsx`) | 17 |
| API Routes (`app/api/**/route.ts`) | 17 |

## 9. Modifications apportées (Mission 1)

- **Suppression de code mort** : `src/components/page.tsx`, `src/components/DestinationCard.tsx`, `src/components/SearchForm.tsx`, `src/app/explore/activities/page.tsx.bak`.
- **Centralisation des types TypeScript** dans `src/types/` : nouveaux fichiers `trip.ts`, `chat.ts`, `destination.ts`, `roadtrip.ts`, regroupant les interfaces auparavant dupliquées dans les composants/pages.
- **Extraction de fonctions pures** dans `src/lib/trip.ts` (nouveau fichier) : `calculateTripBudget`, `calculateTripCompletionScore`, `calculateTripAnalysis` — déplacées depuis `TripBudgetPanel` et `dashboard/page.tsx`, les deux formules de score étant conservées telles quelles.
- **Réorganisation des composants** en dossiers métier via `git mv` (historique conservé) :
  - `components/chat/` : `Chatbot.tsx`, `AIProposalModal.tsx`
  - `components/layout/` : `ClientShell.tsx`, `Navbar.tsx`, `Footer.tsx`, `PageTransition.tsx`, `PlaneBackground.tsx`, `PremiumCursor.tsx`, `ThemeProvider.tsx`
  - `components/trip/` : `AddToTripModal.tsx`, `TripBudgetPanel.tsx`, `TripContextBanner.tsx`, `TripProposal.tsx`
  - `components/ui/` : `GlobalLoader.tsx`
- **Mise à jour de tous les chemins d'import** impactés par cette réorganisation (`layout.tsx`, `dashboard/page.tsx`, `destination/[id]/page.tsx`, pages `explore/*`, `ClientShell.tsx`), avec vérification `next build` après chaque lot de changements.
- **Commentaires français ajoutés** sur les parties les plus subtiles du code : grounding du chatbot et politique anti-invention de prix (`api/chat/route.ts`), agent roadtrip (`lib/agents/roadtripAgent.ts`), et autorisations basées sur les policies RLS (`api/trips/route.ts`, `api/trips/[tripId]/items/route.ts`, `api/trips/[tripId]/proposal/route.ts`).
- **Nettoyage de code mort** : import `Compass` inutilisé (`destination/[id]/page.tsx`), prop `tripTitle` non lue (`TripBudgetPanel.tsx` / `dashboard/page.tsx`), state `creating` inutilisé (`AddToTripModal.tsx`), import `framer-motion` inutilisé (`TripProposal.tsx`), variable `destFromUrl` redondante (`explore/hotels/page.tsx`, `explore/flights/page.tsx`).
- **README.md** réécrit en français : description du projet, stack, structure, variables d'environnement, scripts, déploiement.
- **Mise en place de Jest** : `frontend/jest.config.js`, ajout du script `test` dans `package.json`, dépendances `jest` et `@types/jest`.
- **14 tests unitaires** ajoutés (`src/lib/trip.test.ts`, `src/lib/iata.test.ts`), tous verts.
- **Ajout de ce rapport** (`RAPPORT-BLOC2.md`).
