# AIVANA

Application de planification de voyages avec assistant IA. L'utilisateur décrit son budget et sa période, le chatbot propose des destinations avec des prix de vols et d'hôtels récupérés en direct depuis Amadeus.

## Fonctionnalités

- Chatbot voyage (Groq/LLaMA) avec prix réels Amadeus
- Générateur de roadtrip IA
- Catalogue de destinations filtrable
- Dashboard : gestion des voyages et suivi du budget
- Recommandations personnalisées
- Auth complète (Supabase) + SMS de confirmation (Brevo)

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (PostgreSQL + Auth + RLS)
- Groq API 
- Amadeus (vols & hôtels) + OpenTripMap (activités)
- Framer Motion + Zod

## Structure

```
frontend/src/
├── app/
│   ├── api/
│   │   ├── chat/             # Chatbot IA
│   │   ├── trips/            # CRUD voyages + roadtrip
│   │   ├── partner/          # Vols / hôtels / activités
│   │   ├── recommendations/
│   │   └── email/            # Connexion Gmail / Outlook (à venir)
│   ├── dashboard/
│   ├── explore/
│   ├── destination/[id]/
│   └── auth/
├── components/
│   ├── chat/
│   ├── layout/
│   └── trip/
└── lib/
    ├── ai/        # Client Groq
    ├── agents/    # Agent roadtrip
    ├── travel/    # Clients Amadeus, OpenTripMap
    ├── supabase/
    └── iata.ts    # Codes IATA + deep links partenaires
```

## Installation

```bash
cd frontend
npm install
npm run dev
```

### Variables d'environnement

Créer `frontend/.env.local` :

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GROQ_API_KEY=

AMADEUS_CLIENT_ID=
AMADEUS_CLIENT_SECRET=

# optionnels — fallback statique si absents
OPENTRIPMAP_API_KEY=
BREVO_API_KEY=
```

### Base de données

Migrations dans `frontend/supabase/migrations/`, à appliquer via le SQL Editor Supabase ou `supabase db push`.

## Scripts

| Commande        | Description             |
|-----------------|-------------------------|
| `npm run dev`   | Dev (hot reload)        |
| `npm run build` | Build prod              |
| `npm run lint`  | ESLint                  |
| `npm test`      | Tests unitaires (Jest)  |

## Déploiement

Vercel : https://aivanaflyes.vercel.app/
