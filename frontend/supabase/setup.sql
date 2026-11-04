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
