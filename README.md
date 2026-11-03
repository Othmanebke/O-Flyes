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

| Donnée | Source | Gratuit |
|---|---|---|
| Réponses du copilote | Groq (`openai/gpt-oss-20b`) | Oui, avec une clé |
| Météo du mois de voyage | Open-Meteo (relevés de l'année précédente) | Oui, sans clé |
| Taux de change du jour | open.er-api.com | Oui, sans clé |
| Lieux à voir (fiche et page Activités) | Wikipédia + Photon/OpenStreetMap | Oui, sans clé |
| Prix des vols, hôtels, activités | **Estimations** (catalogue + tarifs habituels) | — |

Il n'existe plus d'API gratuite de prix en direct : l'offre gratuite d'Amadeus a fermé en juillet 2026.
Les prix sont donc toujours affichés comme « estimés », et chaque vol ou hôtel renvoie vers Google Flights
ou Booking.com avec les dates du voyage pour voir le tarif du jour et réserver.

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
│   ├── auth/                  Connexion (lien par email, Google)
│   ├── onboarding/ pricing/ blog/ legal/
│   └── api/                   chat, partner/*, trips/*, destination-info, newsletter
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

Voir `frontend/.env.example` :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
```

### Supabase

1. **SQL Editor → New query** : coller `frontend/supabase/setup.sql`, **Run**.
2. **Authentication → URL Configuration** : ajouter `http://localhost:3000/**` aux Redirect URLs.
3. Connexion par email : active par défaut. Connexion Google (facultatif) : créer un client OAuth « Web » dans
   Google Cloud avec l'URI de redirection `https://<projet>.supabase.co/auth/v1/callback`, puis coller
   l'ID et le secret dans **Authentication → Sign In / Providers → Google**.

## Scripts

```bash
npm run dev     # serveur de développement
npm run build   # build de production
npm test        # tests unitaires (Jest)
```
