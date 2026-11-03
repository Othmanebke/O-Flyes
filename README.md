# AIVANA

Copilote de voyage. On décrit son budget, ses dates et ses envies ; AIVANA propose des destinations avec un coût total estimé, on compare vols, hôtels et activités, puis on range tout dans un carnet de voyage avec le budget à jour.

## Le parcours

```
Accueil ou copilote IA  →  fiche destination  →  « Créer ce voyage »
   →  Vols, Hôtels, Activités (préremplis pour ce voyage, bandeau en haut)
   →  chaque ajout apparaît dans le compteur de la navbar
   →  carnet (/dashboard)  →  création de compte au moment de sauvegarder
```

- **Voyage en cours** : stocké dans le navigateur (`src/lib/plan.ts`), on peut tout préparer sans compte. À la sauvegarde il devient un voyage Supabase.
- **Copilote** : une seule conversation (`src/lib/chat.ts`), affichée en bulle sur toutes les pages et en plein écran sur `/assistant`.
- **Offre gratuite** : 5 recherches par mois sans compte, illimité avec un compte gratuit (bêta). La formule Pro est annoncée « bientôt ».
- **Réservation** : AIVANA ne vend rien ; chaque élément renvoie vers la compagnie, Booking.com ou GetYourGuide.

## Ce qui est réel, ce qui est estimé

| Donnée | Source | Sans clé |
|---|---|---|
| Réponses du copilote | Groq (`openai/gpt-oss-20b`) | Estimation tirée du catalogue, signalée comme telle |
| Vols, hôtels | Amadeus (API de test) | Prix estimés, marqués « estimé » |
| Activités | OpenTripMap | Sélection par ville, prix indicatifs |
| Catalogue des 22 destinations | `src/lib/catalog.ts` | — |

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres, Auth, RLS) · Groq · Zod

## Structure

```
frontend/src/
├── app/
│   ├── page.tsx               Accueil
│   ├── explore/               Destinations, vols, hôtels, activités
│   ├── destination/[id]/      Fiche destination + estimation
│   ├── assistant/             Copilote en plein écran
│   ├── dashboard/             Carnet de voyage
│   ├── auth/                  Connexion (lien email, Google, Microsoft)
│   ├── onboarding/ pricing/ blog/ legal/
│   └── api/                   chat, partner/*, trips/*, newsletter
├── components/                layout, chat, trip, ui
└── lib/                       catalog, photos, plan, chat, session, articles, supabase, travel, ai
```

## Lancer en local

```bash
cd frontend
npm install
npm run dev
```

### Variables d'environnement (`frontend/.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=

# optionnels : sans eux, les prix sont affichés comme estimés
AMADEUS_CLIENT_ID=
AMADEUS_CLIENT_SECRET=
OPENTRIPMAP_API_KEY=
BREVO_API_KEY=          # SMS de confirmation
```

### Base de données

Sur un projet Supabase vide : **SQL Editor → New query**, coller `frontend/supabase/setup.sql`, **Run**.
Puis **Authentication → URL Configuration** : ajouter `http://localhost:3000/**` aux Redirect URLs.

## Scripts

```bash
npm run dev     # serveur de développement
npm run build   # build de production
npm test        # tests unitaires (Jest)
```
