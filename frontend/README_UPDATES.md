# Mise à jour de la Page d'Accueil - AIVANA

## Ce qui a été changé

L'objectif était de faire de l'IA le cœur du parcours utilisateur sur la page d'accueil. Auparavant, l'IA était cachée derrière un bouton de chatbot en bas de page. Maintenant, elle est au centre de l'expérience dès le premier regard.

1. **HERO Interactif (`frontend/src/app/page.tsx`)**
   - Le texte d'introduction a été modifié pour promettre "Trouvez un voyage optimisé selon votre budget".
   - Un formulaire interactif a été ajouté directement dans la bannière HERO. 
   - L'utilisateur peut y définir son budget (slider), durée, période, ville de départ et ses envies via des "chips" cliquables.

2. **Cartes de Recommandations (`frontend/src/components/assistant/RecommendationCards.tsx`)**
   - Création d'un nouveau composant réutilisable pour afficher les propositions de l'IA de manière esthétique (dark + gold).
   - Affiche le budget détaillé (Vol estimé, Hôtel par nuit, Budget sur place), des hôtels recommandés et un badge de "gamme" (Essentiel, Confort, Premium, Prestige).
   - Intègre les boutons "Réserver sur Booking" (lien externe) et "Ajouter au dashboard".
   - "Ajouter au dashboard" vérifie si l'utilisateur est connecté. Si oui, un appel API POST est fait vers `/api/db/trips` pour y enregistrer la recommandation. Sinon, l'utilisateur est renvoyé vers `/auth/login`.

3. **Intégration du Chatbot piloté par événements (`frontend/src/components/Chatbot.tsx`)**
   - Le chatbot écoute désormais un nouvel événement personnalisé `chatbot-preset`.
   - Cet événement permet à n'importe quel élément de la page d'accueil d'ouvrir le chat, de pré-remplir la zone de texte, et de l'envoyer automatiquement au LLM backend.
   - Utilisé par les boutons "Parler à notre IA" pour amorcer la discussion avec le contexte défini.

4. **Navigation et Copie (`frontend/src/components/Navbar.tsx`)**
   - Le bouton "Accès Membre" sur le menu mobile a été changé en "Dashboard".
   - Le lien redirige dynamiquement vers `/dashboard` (si connecté) ou `/auth/login` (si déconnecté).
   - Les FAQ ont été mises à jour pour clarifier que l'on réserve sur des sites partenaires via AIVANA.

5. **Données Simulées Mocks (`frontend/src/lib/mockRecommendations.ts`)**
   - Afin de visualiser l'interface immédiatement sans bloquer le développement frontend avec des intégrations API lourdes, une fonction de mock a été écrite pour générer des recommandations cohérentes avec les données saisies par l'utilisateur.

## Comment tester

1. Lancez votre serveur de développement habituel :
   ```bash
   cd frontend
   npm run dev
   ```

2. **Tester le formulaire Hero :**
   - Modifiez le budget, sélectionnez quelques envies (ex: "Soleil", "Culture").
   - Cliquez sur **"Voir un exemple"**, le formulaire se remplira tout seul et génèrera un résultat après un loader simulé de 1.5s, puis la page défilera automatiquement vers les recommandations.

3. **Tester l'ajout au Dashboard :**
   - Dans les recommandations, cliquez sur "Ajouter au dashboard".
   - Si vous n'êtes pas connecté, vous serez renvoyé vers le login. Connectez-vous et réessayez. La carte affichera "✓ Sauvegardé" une fois l'ajout réussi. Un voyage de 7 jours (programmé dans 1 mois) sera créé en base de données avec ce budget.

4. **Tester les événements Chatbot :**
   - Descendez dans la page jusqu'au bloc "Vidéo/Feature" ou "Notre approche".
   - Cliquez sur le bouton CTA "Parler à notre IA" / "Poser une question".
   - Le widget du chatbot s'ouvrira, entrera un message pré-rempli avec vos paramètres (ou des valeurs par défaut) et l'enverra pour démarrer la discussion, le tout de manière fluide.

## Évolutions futures (TODO)

Pour brancher une **vraie** API IA derrière le bouton "Générer la recommandation" :

1. Dans `page.tsx`, au lieu d'appeler la fonction synchrone `getMockRecommendations()`, modifiez la fonction `handleGenerate` pour appeler une endpoint API (ex: `/api/ai/recommendations`).
2. Passez-lui le payload json `{ budget, duration, period, departure, interests }`.
3. Assurez-vous que l'endpoint API backend (votre service `/services/ai/`) est capable de structurer la réponse LLM avec des "Function Calling" (Structured Outputs avec Groq) afin qu'elle corresponde exactement à l'interface `Recommendation[]` définie.
4. Intégration de partenaires (Amadeus, Skyscanner AI, Booking API) côté backend pour récupérer de vrais prix en temps réel au lieu des prix calculés du mock.
