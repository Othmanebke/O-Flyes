# AIVANA

Plateforme de voyage assistée par IA : recherche de destinations, vols et hôtels (données réelles via Amadeus), activités (OpenTripMap), chatbot de planification et génération de roadtrips.

## Stack technique

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **Supabase** (PostgreSQL, authentification, Row Level Security)
- **Groq API** (`llama-3.3-70b-versatile`) pour le chatbot et les agents IA
- **Amadeus** (vols/hôtels) et **OpenTripMap** (activités) pour les données réelles
- **Framer Motion** pour les animations

## Structure du projet

```text
frontend/
├── src/app/                # Pages (App Router)
│   ├── api/                 # Route Handlers (backend)
│   │   ├── chat/             # Chatbot IA (grounding sur prix réels)
│   │   ├── trips/             # CRUD voyages + items + proposition de roadtrip
│   │   ├── partner/           # Recherche vols/hôtels/activités/lieux
│   │   ├── recommendations/   # Recommandations IA
│   │   ├── email/             # Connexion boîtes mail (Google/Outlook) + sync
│   │   └── ...
│   ├── dashboard/, explore/, destination/[id]/, onboarding/, auth/, ...
├── src/components/
│   ├── layout/               # Navbar, Footer, ClientShell, ThemeProvider, ...
│   ├── chat/                  # Chatbot, AIProposalModal
│   ├── trip/                  # AddToTripModal, TripBudgetPanel, TripProposal, ...
│   └── ui/                    # Composants génériques (GlobalLoader, ...)
├── src/lib/
│   ├── ai/                    # Client Groq
│   ├── agents/                # Agents IA (roadtripAgent, ...)
│   ├── travel/                # Clients Amadeus, OpenTripMap
│   ├── supabase/              # Clients Supabase (browser/server)
│   ├── validation/             # Schémas Zod
│   ├── trip.ts                 # Calculs purs (budget, score de complétion)
│   ├── destinations.ts         # Catalogue de destinations
│   └── iata.ts                  # Résolution des codes IATA
├── src/types/                # Types TypeScript partagés (trip, chat, destination, roadtrip)
└── supabase/migrations/       # Schéma SQL + policies RLS
```

## Installation

### Prérequis

- Node.js 18+
- Un projet Supabase (URL + clés)

### Variables d'environnement

Copier `frontend/.env.example` vers `frontend/.env.local` et renseigner :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# IA (Groq)
GROQ_API_KEY=

# Vols & hôtels (Amadeus, environnement test)
AMADEUS_CLIENT_ID=
AMADEUS_CLIENT_SECRET=

# Activités (OpenTripMap) — optionnel, fallback sur données statiques si absent
OPENTRIPMAP_API_KEY=

# SMS de confirmation (Brevo) — optionnel
BREVO_API_KEY=
```

### Lancer le projet

```bash
cd frontend
npm install
npm run dev
```

L'application est accessible sur `http://localhost:3000`.

### Base de données

Le schéma (tables + policies RLS) se trouve dans `frontend/supabase/migrations/`. À appliquer sur le projet Supabase via le SQL Editor ou la CLI Supabase.

## Scripts disponibles

Depuis `frontend/` :

| Commande        | Description                          |
|-----------------|---------------------------------------|
| `npm run dev`   | Serveur de développement (hot reload) |
| `npm run build` | Build de production                   |
| `npm run start` | Démarre le build de production        |
| `npm run lint`  | Linter ESLint                         |
| `npm test`      | Tests unitaires (Jest)                |

## Déploiement

Le projet est conçu pour être déployé sur **Vercel** (root directory : `frontend/`). Penser à renseigner les variables d'environnement ci-dessus dans les paramètres du projet Vercel.
