# AIVANA 
## Présentation de Projet

---

## 1. CONTEXTE ET PROBLÉMATIQUE

### Problème identifié
Le voyage est une expérience riche mais souvent **désorganisée et chronophage** :
- Les confirmations de réservation sont éparpillées dans des dizaines d'emails
- Comparer vols, hôtels et activités demande des heures de recherche sur plusieurs sites
- Il n'existe pas d'assistant intelligent qui comprend vraiment les préférences du voyageur
- Les recommandations actuelles (blogs, comparateurs) sont génériques et non personnalisées

### Notre réponse
**AIVANA** est une plateforme SaaS de gestion de voyage intelligente qui centralise, automatise et personnalise l'expérience voyage grâce à l'IA.

---

## 2. PRÉSENTATION DU PROJET

### Qu'est-ce qu'AIVANA ?
AIVANA est un **assistant de voyage alimenté par l'IA** qui permet aux utilisateurs de :

1. **Découvrir des destinations** adaptées à leur budget, leurs goûts et leurs dates
2. **Gérer leurs voyages** depuis un tableau de bord centralisé
3. **Synchroniser automatiquement** leurs réservations depuis leurs emails (Gmail / Outlook)
4. **Discuter avec un chatbot IA** pour obtenir des conseils de voyage personnalisés en temps réel

### Nom & Marque
- **AIVANA** = "AI" + "Savana" → évoque l'aventure et l'intelligence artificielle
- **O-Flyes** = nom de la startup porteuse du projet
- Design luxe-minimaliste : palette or champagne + fond marine sombre

---

## 3. FONCTIONNALITÉS PRINCIPALES

### 3.1 Chatbot IA de Voyage
- Interface de chat en temps réel
- Propulsé par **Groq API** (modèle `llama-3.3-70b-versatile`)
- Répond en JSON structuré : texte + destinations enrichies avec prix et liens de réservation
- Preset de questions pour guider l'utilisateur (budget, dates, style de voyage)

**Exemple d'interaction :**
> "Je veux partir 10 jours en Asie avec un budget de 1500€, que me conseillez-vous ?"
> → AIVANA propose des destinations avec vols estimés, hôtels, activités et liens directs

### 3.2 Tableau de Bord (Dashboard)
- Création et gestion de voyages (destination, dates, budget)
- Organisation des réservations par type : ✈️ Vols, 🏨 Hôtels, 🎯 Activités, 🚗 Transport
- Analyse du voyage : suivi de budget, score de complétude, alertes de couverture
- Connexion et synchronisation d'emails (Gmail / Outlook)

### 3.3 Exploration de Destinations
- Catalogue de **50+ destinations** mondiales avec données riches
- Filtres avancés : budget, climat, style (aventure, détente, culturel...), durée, saison
- Intégration avec Skyscanner et Booking.com pour redirection vers réservation réelle

### 3.4 Galerie d'Inspiration
- Galerie photo curatée par thème de voyage
- Prévisualisation en modal avec description
- Source d'inspiration pour les voyageurs indécis

### 3.5 Synchronisation Email (Feature Avancée)
- Connexion OAuth à Gmail et Outlook
- Extraction automatique des confirmations de réservation depuis les emails
- Création automatique des items de voyage dans le dashboard
- *(En cours d'implémentation)*

---

## 4. ARCHITECTURE TECHNIQUE

### Stack Technologique

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Frontend | **Next.js 14** + React 18 | SSR, routing, composants UI |
| Langage | **TypeScript 5.3** | Typage statique, robustesse |
| Style | **Tailwind CSS** + Framer Motion | Design system + animations |
| Auth | **Supabase Auth** | OAuth Google & Microsoft |
| Base de données | **PostgreSQL** via Supabase | Données utilisateurs et voyages |
| IA | **Groq API** (LLaMA 3.3 70B) | Chatbot et recommandations |
| Validation | **Zod** | Validation des schemas de données |
| Déploiement | **Vercel** + Supabase Cloud | Hébergement production |

### Architecture Applicative

```
Utilisateur
    │
    ▼
[ Next.js Frontend ]  ──── [ Supabase Auth ]
    │                           │
    │                    [ PostgreSQL DB ]
    │                    (RLS activé)
    ▼
[ API Routes Next.js ]
    │
    ├──► [ Groq API ] ──► IA (LLaMA 3.3)
    ├──► [ Supabase ] ──► Base de données
    ├──► [ Skyscanner / Booking.com ] ──► Partenaires
    └──► [ Gmail / Outlook OAuth ] ──► Emails
```

### Sécurité
- **Row-Level Security (RLS)** : chaque utilisateur ne voit que ses propres données
- **OAuth uniquement** : aucun mot de passe stocké (Google + Microsoft)
- **Validation Zod** sur toutes les entrées API
- **Variables d'environnement** pour tous les secrets

---

## 5. MODÈLE ÉCONOMIQUE

### Offre Freemium

| | Plan Gratuit | Plan Pro (9,99€/mois) |
|---|---|---|
| Messages chatbot | 5 / mois | Illimité |
| Voyages sauvegardés | 2 | Illimité |
| Recommandations IA | Basiques | Personnalisées |
| Sync emails | ❌ | ✅ |
| Alertes SMS | ❌ | ✅ |
| Export PDF itinéraire | ❌ | ✅ |
| Support | Standard | 24/7 prioritaire |

### Cibles
- **B2C** : voyageurs individuels (25-45 ans, CSP+)
- **B2B** (perspective) : agences de voyage, entreprises pour voyages d'affaires

---

## 6. CHOIX TECHNIQUES JUSTIFIÉS

### Pourquoi Next.js 14 ?
- SSR natif pour le SEO (important pour une app voyage)
- API Routes intégrées → pas besoin d'un backend séparé
- Performances optimales avec le App Router

### Pourquoi Supabase ?
- PostgreSQL managé avec RLS puissant
- Auth OAuth out-of-the-box
- Gratuit pour les petits projets, scalable

### Pourquoi Groq + LLaMA ?
- **Vitesse** : 10x plus rapide qu'OpenAI GPT-4 pour l'inférence
- **Coût** : significativement moins cher
- **Qualité** : LLaMA 3.3 70B = niveau GPT-4 pour les tâches de conversation

### Pourquoi TypeScript ?
- Détection d'erreurs à la compilation
- Meilleure maintenabilité sur un projet multi-développeur
- IntelliSense et autocomplétion puissants

---

## 7. DÉFIS RENCONTRÉS

### Défis Techniques
1. **Réponses IA structurées** : forcer le LLM à retourner du JSON valide (solution : `response_format: json_object` + validation Zod)
2. **Authentification SSR** : gérer les sessions Supabase côté serveur vs client (solution : clients séparés browser/server)
3. **Migration architecture** : passage de microservices Express vers les API Routes Next.js
4. **Typage TypeScript strict** : nombreuses erreurs sur les composants complexes

### Défis Fonctionnels
1. **Extraction email** : parsing des confirmations très variables selon les plateformes → nécessite un fine-tuning du prompt IA
2. **Intégration partenaires** : APIs Skyscanner/Booking restrictives → simulation côté serveur en attendant l'accès

---

## 8. DÉMONSTRATION

### Parcours Utilisateur Type

```
1. Page d'accueil
   → Formulaire de recherche (destination, dates, budget)
   → Recommandations IA affichées

2. Page Explore
   → Parcourir le catalogue de destinations
   → Filtrer par budget / climat / style
   → Cliquer sur une destination → détail + liens réservation

3. Inscription / Connexion
   → OAuth Google ou Microsoft (1 clic)
   → Onboarding : connexion email Gmail/Outlook

4. Dashboard
   → Créer un nouveau voyage
   → Ajouter des réservations (vols, hôtels, activités)
   → Voir l'analyse du voyage

5. Chatbot IA
   → Ouvrir le chat
   → Poser une question de voyage
   → Recevoir des recommandations personnalisées avec prix
```

---

## 9. ÉTAT D'AVANCEMENT

### Fonctionnalités Complètes ✅
- [x] Interface complète (toutes les pages)
- [x] Authentification OAuth (Google + Microsoft)
- [x] Catalogue destinations avec filtres
- [x] Chatbot IA fonctionnel (Groq)
- [x] Dashboard de gestion de voyages
- [x] API de recommandations IA
- [x] Design system complet (dark/light mode)
- [x] Base de données sécurisée (RLS)

### En Cours 🔄
- [ ] Synchronisation email complète (OAuth connecté, extraction à finaliser)
- [ ] Intégration Stripe (paiement Pro)
- [ ] Vraies APIs partenaires (Skyscanner, Booking.com)

### Perspectives 🚀
- Application mobile (React Native)
- Alertes prix en temps réel
- Itinéraires exportables en PDF
- Partage de voyages entre amis

---

## 10. BILAN ET COMPÉTENCES MOBILISÉES

### Compétences Techniques
- Développement Full-Stack avec Next.js 14
- Intégration d'APIs IA (Groq / LLaMA)
- Conception de base de données PostgreSQL
- Authentification OAuth
- TypeScript avancé + Zod
- Design UI/UX avec Tailwind CSS + Framer Motion

### Compétences Transversales
- Gestion de projet (architecture, priorisation des features)
- Documentation technique
- Déploiement cloud (Vercel, Supabase)
- Conception produit orientée utilisateur

---

## CONCLUSION

**AIVANA** répond à un vrai besoin : **simplifier et personnaliser la planification de voyage** grâce à l'IA. Le projet démontre une maîtrise complète du développement web moderne, de l'intégration IA à la sécurisation des données, en passant par un design soigné orienté utilisateur.

Le choix de technologies actuelles (Next.js 14, Groq, Supabase) garantit une application performante, scalable et économiquement viable dès son lancement.

---
*Stack : Next.js 14 · TypeScript · Supabase · Groq API · Tailwind CSS*
