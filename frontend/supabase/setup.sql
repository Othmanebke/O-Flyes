-- AIVANA : installation complète sur un projet Supabase vide.
-- SQL Editor > New query > coller ce fichier > Run.
-- Uniquement les tables utilisées par le site : trips, trip_items, destinations,
-- newsletter_subscribers. (Les comptes sont gérés par Supabase Auth.)

-- Destinations (référencées par trips.destination_id, lecture publique)
CREATE TABLE IF NOT EXISTS public.destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  description text,
  best_period text,
  estimated_budget numeric,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Voyages sauvegardés depuis le carnet
CREATE TABLE IF NOT EXISTS public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  destination_id uuid REFERENCES public.destinations(id) ON DELETE SET NULL,
  title text,
  start_date date,
  end_date date,
  proposal_json jsonb,
  proposal_generated_at timestamptz,
  name text,
  share_id uuid UNIQUE,
  travelers int,
  budget numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vols, hôtels et activités ajoutés à un voyage
CREATE TABLE IF NOT EXISTS public.trip_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  type text CHECK (type IN ('flight','hotel','activity','transport','restaurant','note')),
  title text NOT NULL,
  price_estimate numeric,
  provider text,
  external_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inscriptions à la lettre mensuelle (formulaire du footer)
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_trips_updated_at ON public.trips;
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trip_items_updated_at ON public.trip_items;
CREATE TRIGGER update_trip_items_updated_at BEFORE UPDATE ON public.trip_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sécurité : chacun ne voit et ne modifie que ses propres voyages
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Destinations are publicly viewable" ON public.destinations;
CREATE POLICY "Destinations are publicly viewable" ON public.destinations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own trips" ON public.trips;
CREATE POLICY "Users can view own trips" ON public.trips FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own trips" ON public.trips;
CREATE POLICY "Users can insert own trips" ON public.trips FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own trips" ON public.trips;
CREATE POLICY "Users can update own trips" ON public.trips FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own trips" ON public.trips;
CREATE POLICY "Users can delete own trips" ON public.trips FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own trip items" ON public.trip_items;
CREATE POLICY "Users can view own trip items" ON public.trip_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_items.trip_id AND trips.user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can insert own trip items" ON public.trip_items;
CREATE POLICY "Users can insert own trip items" ON public.trip_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_id AND trips.user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can update own trip items" ON public.trip_items;
CREATE POLICY "Users can update own trip items" ON public.trip_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_items.trip_id AND trips.user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can delete own trip items" ON public.trip_items;
CREATE POLICY "Users can delete own trip items" ON public.trip_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_items.trip_id AND trips.user_id = auth.uid()));

-- Tout le monde peut s'inscrire ; personne ne peut lire la liste depuis le site
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated WITH CHECK (true);


-- ════════════════════════════════════════════════════════════════════
-- Durcissement de la sécurité (identique à migrations/0007_security_hardening.sql)
-- ════════════════════════════════════════════════════════════════════

-- ─── 1. Index ────────────────────────────────────────────────────────────────
-- Les policies RLS filtrent sur ces colonnes à chaque requête : sans index,
-- Postgres parcourt toute la table.
CREATE INDEX IF NOT EXISTS trips_user_id_idx ON public.trips (user_id);
CREATE INDEX IF NOT EXISTS trip_items_trip_id_idx ON public.trip_items (trip_id);

-- ─── 2. Contraintes de taille et de format ───────────────────────────────────
-- Dernière ligne de défense si une validation applicative est oubliée.
-- NOT VALID : s'applique aux nouvelles écritures sans bloquer sur d'anciennes lignes.
ALTER TABLE public.trips DROP CONSTRAINT IF EXISTS trips_title_len;
ALTER TABLE public.trips ADD CONSTRAINT trips_title_len CHECK (char_length(title) <= 200) NOT VALID;
ALTER TABLE public.trips DROP CONSTRAINT IF EXISTS trips_name_len;
ALTER TABLE public.trips ADD CONSTRAINT trips_name_len CHECK (char_length(name) <= 80) NOT VALID;
ALTER TABLE public.trips DROP CONSTRAINT IF EXISTS trips_travelers_range;
ALTER TABLE public.trips ADD CONSTRAINT trips_travelers_range CHECK (travelers BETWEEN 1 AND 20) NOT VALID;
ALTER TABLE public.trips DROP CONSTRAINT IF EXISTS trips_budget_range;
ALTER TABLE public.trips ADD CONSTRAINT trips_budget_range CHECK (budget BETWEEN 0 AND 1000000) NOT VALID;
ALTER TABLE public.trips DROP CONSTRAINT IF EXISTS trips_dates_order;
ALTER TABLE public.trips ADD CONSTRAINT trips_dates_order CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date) NOT VALID;

ALTER TABLE public.trip_items DROP CONSTRAINT IF EXISTS trip_items_title_len;
ALTER TABLE public.trip_items ADD CONSTRAINT trip_items_title_len CHECK (char_length(title) <= 300) NOT VALID;
ALTER TABLE public.trip_items DROP CONSTRAINT IF EXISTS trip_items_provider_len;
ALTER TABLE public.trip_items ADD CONSTRAINT trip_items_provider_len CHECK (char_length(provider) <= 100) NOT VALID;
-- uniquement des liens web : bloque les « javascript:… » (XSS)
ALTER TABLE public.trip_items DROP CONSTRAINT IF EXISTS trip_items_url_http;
ALTER TABLE public.trip_items ADD CONSTRAINT trip_items_url_http CHECK (external_url IS NULL OR (external_url ~* '^https?://' AND char_length(external_url) <= 2000)) NOT VALID;
ALTER TABLE public.trip_items DROP CONSTRAINT IF EXISTS trip_items_metadata_size;
ALTER TABLE public.trip_items ADD CONSTRAINT trip_items_metadata_size CHECK (pg_column_size(metadata) <= 8192) NOT VALID;
ALTER TABLE public.trip_items DROP CONSTRAINT IF EXISTS trip_items_price_range;
ALTER TABLE public.trip_items ADD CONSTRAINT trip_items_price_range CHECK (price_estimate IS NULL OR price_estimate BETWEEN 0 AND 1000000) NOT VALID;

ALTER TABLE public.newsletter_subscribers DROP CONSTRAINT IF EXISTS newsletter_email_len;
ALTER TABLE public.newsletter_subscribers ADD CONSTRAINT newsletter_email_len CHECK (char_length(email) <= 200) NOT VALID;

-- ─── 3. Désinscription de la newsletter par jeton secret ─────────────────────
-- Avant : connaître l'adresse suffisait pour désinscrire quelqu'un.
-- Maintenant : il faut le jeton unique présent dans le lien de chaque lettre
-- (ou être connecté avec cette adresse).
ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_unsubscribe_token_idx ON public.newsletter_subscribers (unsubscribe_token);

-- ─── 4. Limitation du nombre de requêtes ─────────────────────────────────────
-- Compteur par clé (ex. « chat:ip:1.2.3.4 ») sur une fenêtre de temps.
-- Aucune policy : seule la clé serveur (service_role) y accède.
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key text PRIMARY KEY,
  count int NOT NULL,
  window_start timestamptz NOT NULL
);
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.rate_limit_hit(p_key text, p_max int, p_window_seconds int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c int;
BEGIN
  INSERT INTO public.rate_limits AS r (key, count, window_start)
  VALUES (p_key, 1, now())
  ON CONFLICT (key) DO UPDATE SET
    count = CASE WHEN r.window_start < now() - make_interval(secs => p_window_seconds) THEN 1 ELSE r.count + 1 END,
    window_start = CASE WHEN r.window_start < now() - make_interval(secs => p_window_seconds) THEN now() ELSE r.window_start END
  RETURNING count INTO c;

  -- ménage occasionnel des compteurs expirés
  IF random() < 0.01 THEN
    DELETE FROM public.rate_limits WHERE window_start < now() - interval '1 day';
  END IF;

  RETURN c <= p_max;
END;
$$;

REVOKE ALL ON FUNCTION public.rate_limit_hit(text, int, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rate_limit_hit(text, int, int) TO service_role;

-- ─── 5. Double authentification imposée par la base ──────────────────────────
-- Policy RESTRICTIVE (combinée en ET avec les policies existantes) : si l'utilisateur
-- a un facteur TOTP vérifié, son jeton doit être de niveau aal2 pour lire ou modifier
-- ses voyages. Même un client qui contourne l'interface ne peut pas passer outre.
DROP POLICY IF EXISTS "Require aal2 when MFA enrolled" ON public.trips;
CREATE POLICY "Require aal2 when MFA enrolled" ON public.trips
  AS RESTRICTIVE TO authenticated
  USING (
    array[(SELECT auth.jwt()->>'aal')] <@ (
      SELECT CASE WHEN count(id) > 0 THEN array['aal2'] ELSE array['aal1', 'aal2'] END
      FROM auth.mfa_factors
      WHERE user_id = (SELECT auth.uid()) AND status = 'verified'
    )
  );

DROP POLICY IF EXISTS "Require aal2 when MFA enrolled" ON public.trip_items;
CREATE POLICY "Require aal2 when MFA enrolled" ON public.trip_items
  AS RESTRICTIVE TO authenticated
  USING (
    array[(SELECT auth.jwt()->>'aal')] <@ (
      SELECT CASE WHEN count(id) > 0 THEN array['aal2'] ELSE array['aal1', 'aal2'] END
      FROM auth.mfa_factors
      WHERE user_id = (SELECT auth.uid()) AND status = 'verified'
    )
  );

-- ─── 6. Policies trips / trip_items : WITH CHECK explicite sur UPDATE ────────
-- (Postgres réutilise USING par défaut, mais on l'écrit pour que ce soit lisible :
-- impossible de « donner » un voyage à un autre compte ou de déplacer un élément
-- vers le voyage de quelqu'un d'autre.)
DROP POLICY IF EXISTS "Users can update own trips" ON public.trips;
CREATE POLICY "Users can update own trips" ON public.trips FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own trip items" ON public.trip_items;
CREATE POLICY "Users can update own trip items" ON public.trip_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_items.trip_id AND trips.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_items.trip_id AND trips.user_id = auth.uid()));
