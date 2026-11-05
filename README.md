# AIVANA

Copilote de voyage. On décrit son budget, ses dates et ses envies ; AIVANA propose des destinations avec un coût total estimé, on compare vols, hôtels et activités, puis on range tout dans un carnet de voyage avec le budget à jour.

## Le parcours

```
Accueil ou copilote IA  →  fiche destination  →  « Créer ce voyage »
   →  Vols, Hôtels, Activités (préremplis pour ce voyage, bandeau en haut)
   →  chaque ajout est rangé dans le voyage (menu « Mes voyages »)
   →  carnet (/dashboard)  →  création de compte au moment de sauvegarder
```

- **Voyage en cours** : stocké dans le navigateur (`src/lib/plan.ts`), on peut tout préparer sans compte. À la sauvegarde il devient un voyage Supabase.
- **Copilote** : une seule conversation (`src/lib/chat.ts`), affichée en bulle sur toutes les pages et en plein écran sur `/assistant`.
- **Itinéraire IA** : pour un voyage sauvegardé, le copilote propose un programme jour par jour ; ses activités peuvent être ajoutées au voyage, en entier ou en restant dans le budget.
- **Projet pédagogique** (YNOV CAMPUS) : gratuit, sans offre payante ni publicité.
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

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Supabase (Postgres, Auth, RLS) · Groq · Zod

## Structure

```
frontend/src/
├── app/            Routes : une URL = un dossier (pages + API dans app/api)
├── components/     Interface, rangée par domaine (layout, dashboard, trip, chat, account, ui)
├── lib/            Logique sans interface, testée (budget, vols, IA, sécurité, Supabase)
├── types/          Types TypeScript partagés
└── middleware.ts   Rafraîchissement de la session
frontend/supabase/  setup.sql (installation complète) + migrations numérotées
```

## Documentation

| Document | Contenu |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Schémas, rôle de chaque dossier, routes API, base de données, flux d'authentification |
| [SECURITE.md](SECURITE.md) | Toutes les mesures de sécurité, où elles sont dans le code, démonstrations |
| [docs/PILOTAGE.md](docs/PILOTAGE.md) | Méthode, sprints, journal des décisions, risques, indicateurs |
| [docs/pilotage/backlog-notion.csv](docs/pilotage/backlog-notion.csv) | Backlog complet, importable dans Notion ou Jira |

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
# Captcha Cloudflare Turnstile (facultatif)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

### Supabase

1. **SQL Editor → New query** : coller `frontend/supabase/setup.sql`, **Run**.
2. **Authentication → URL Configuration** : ajouter `http://localhost:3000/**` aux Redirect URLs.
3. Connexion par email : active par défaut. Connexion Google (facultatif) : créer un client OAuth « Web » dans
   Google Cloud avec l'URI de redirection `https://<projet>.supabase.co/auth/v1/callback`, puis coller
   l'ID et le secret dans **Authentication → Sign In / Providers → Google**.
4. Connexion GitHub (facultatif) : GitHub → Settings → Developer settings → **OAuth Apps → New OAuth App**,
   *Authorization callback URL* = `https://<projet>.supabase.co/auth/v1/callback`, puis coller le Client ID
   et un Client secret dans **Authentication → Sign In / Providers → GitHub**.
5. Codes par email : **Authentication → Emails → SMTP Settings** : activer un SMTP (ex. Gmail : `smtp.gmail.com`,
   port 465, mot de passe d'application). Puis **Templates** → « Magic link or OTP » **et** « Confirm sign up » :
   afficher le code avec `{{ .Token }}` (modèle dans SECURITE.md). Conseillé : **Providers → Email → Email OTP Length = 6**.
6. Associer plusieurs méthodes à un compte : **Authentication → Sign In / Providers** → activer **Allow manual linking**.
7. Captcha (facultatif) : créer un widget sur dash.cloudflare.com → **Turnstile**, mettre les deux clés dans
   `.env.local`, et coller la clé secrète dans **Authentication → Attack Protection → Enable Captcha (Turnstile)**.

Les mesures de sécurité sont détaillées dans [SECURITE.md](SECURITE.md).

## Scripts (dans `frontend/`)

```bash
npm run dev          # serveur de développement
npm run build        # build de production
npm test             # tests unitaires (Jest)
npm run lint         # règles de code (ESLint)
npm run typecheck    # vérification des types (TypeScript)
npm run format       # formatage automatique (Prettier)
npm run check        # tout vérifier d'un coup (types, lint, formatage, tests)
```

Ces vérifications tournent aussi automatiquement sur GitHub à chaque push (`.github/workflows/ci.yml`).
