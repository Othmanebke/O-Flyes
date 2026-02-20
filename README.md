# ✈️ O-Flyes – Votre assistant voyage intelligent

> Plateforme de conseils de voyage propulsée par l'IA. Trouvez votre destination idéale selon votre budget, vos envies (chaud/froid, plage/montagne/ville…) et votre période de voyage.

---

## Architecture microservices

```text
O-Flyes/
├── frontend/                  # Next.js 14 + TypeScript + Tailwind
│   └── src/
│       ├── app/               # Pages (/, /explore, /chat, /pricing, /auth/…)
│       └── components/        # Navbar, Chatbot, SearchForm, DestinationCard
│
├── services/
│   ├── auth/          :3001   # OAuth2 (Google) + JWT + login/register local
│   ├── database/      :3002   # CRUD PostgreSQL (users, destinations, trips, chat)
│   ├── ai/            :3003   # Chatbot + recommandations (OpenAI GPT-4o-mini)
│   ├── notifications/ :3004   # Email (Nodemailer) + SMS (Twilio)
│   ├── payments/      :3005   # Abonnements Stripe (plan Pro)
│   └── metrics/       :3006   # Prometheus metrics + événements
│
├── monitoring/
│   └── prometheus.yml         # Config Prometheus
│
├── docker-compose.yml         # Orchestration complète
└── .env.example               # Variables d'environnement (à copier en .env)
```

## Stack technique

| Couche          | Technologie                          |
|-----------------|--------------------------------------|
| Frontend        | Next.js 14, TypeScript, Tailwind CSS |
| Auth            | Passport.js, OAuth2/Google, JWT      |
| Base de données | PostgreSQL 16, Drizzle ORM           |
| IA / Chatbot    | OpenAI GPT-4o-mini                   |
| Notifications   | Nodemailer (SMTP), Twilio (SMS)      |
| Paiements       | Stripe (abonnements)                 |
| Métriques       | Prometheus + Grafana                 |
| Conteneurs      | Docker, Docker Compose               |

## Démarrage rapide

### 1. Variables d'environnement

```bash
cp .env.example .env
# Remplissez : OPENAI_API_KEY, OAUTH_GOOGLE_*, STRIPE_*, SMTP_*, etc.
```

### 2. Lancer avec Docker

```bash
docker-compose up --build
```

| Service       | URL                              |
|---------------|----------------------------------|
| Frontend      | `http://localhost:3000`          |
| Auth          | `http://localhost:3001/health`   |
| Database      | `http://localhost:3002/health`   |
| AI            | `http://localhost:3003/health`   |
| Notifications | `http://localhost:3004/health`   |
| Payments      | `http://localhost:3005/health`   |
| Metrics       | `http://localhost:3006/metrics`  |
| Grafana       | `http://localhost:3007`          |
| Prometheus    | `http://localhost:9090`          |

### 3. Initialiser la base de données

```bash
# Après docker-compose up, exécutez le schéma SQL
docker exec -i o-flyes-postgres-1 psql -U oflyes -d oflyes_db < services/database/src/schema.sql
```

### 4. Développement local (sans Docker)

```bash
npm install          # installe les dépendances racine (workspaces)
npm run dev          # lance tous les services en parallèle
```

## Fonctionnalités

- **Page d'accueil** – Hero animé avec CTA vers Explore et Chat
- **Explore** – Recherche filtrée par climat, budget/jour et période avec grille de destinations
- **Chatbot IA** – Conversation naturelle, suggestions rapides, historique de session
- **Auth** – Inscription / connexion locale + OAuth Google
- **Pricing** – Plans Gratuit et Pro avec checkout Stripe
- **Métriques** – Dashboard Grafana + compteurs Prometheus custom

## Prochaines étapes

- [ ] Page détail destination + carte interactive (Mapbox)
- [ ] Profil utilisateur & voyages sauvegardés
- [ ] Recommandation IA structurée (endpoint `/recommend`)
- [ ] Push notifications (FCM)
- [ ] Tests unitaires & e2e (Vitest + Playwright)
