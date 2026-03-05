-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create tables
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  budget_range jsonb,
  interests text[],
  travel_style text,
  preferred_seasons text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  description text,
  best_period text,
  estimated_budget numeric,
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  destination_id uuid REFERENCES public.destinations(id) ON DELETE SET NULL,
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.trip_items (
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

CREATE TABLE public.ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  context_json jsonb,
  result_json jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.email_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider text CHECK (provider IN ('gmail','outlook')),
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 2. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Apply updated_at triggers
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at
BEFORE UPDATE ON public.trips
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trip_items_updated_at
BEFORE UPDATE ON public.trip_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_connections ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- PROFILES: user can select/insert/update own row where id = auth.uid()
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- USER_PREFERENCES: user can CRUD where user_id = auth.uid()
CREATE POLICY "Users can view own preferences" 
ON public.user_preferences FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" 
ON public.user_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" 
ON public.user_preferences FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" 
ON public.user_preferences FOR DELETE 
USING (auth.uid() = user_id);

-- TRIPS: user can CRUD where user_id = auth.uid()
CREATE POLICY "Users can view own trips" 
ON public.trips FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips" 
ON public.trips FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips" 
ON public.trips FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips" 
ON public.trips FOR DELETE 
USING (auth.uid() = user_id);

-- TRIP_ITEMS: user can CRUD only if trip_id belongs to a trip where trips.user_id = auth.uid()
CREATE POLICY "Users can view own trip items" 
ON public.trip_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.id = trip_items.trip_id AND trips.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own trip items" 
ON public.trip_items FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.id = trip_id AND trips.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own trip items" 
ON public.trip_items FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.id = trip_items.trip_id AND trips.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own trip items" 
ON public.trip_items FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.id = trip_items.trip_id AND trips.user_id = auth.uid()
  )
);

-- AI_RECOMMENDATIONS: user can select/insert own rows where user_id = auth.uid()
CREATE POLICY "Users can view own AI recommendations" 
ON public.ai_recommendations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI recommendations" 
ON public.ai_recommendations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- EMAIL_CONNECTIONS: user can CRUD where user_id = auth.uid()
CREATE POLICY "Users can view own email connections" 
ON public.email_connections FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email connections" 
ON public.email_connections FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email connections" 
ON public.email_connections FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own email connections" 
ON public.email_connections FOR DELETE 
USING (auth.uid() = user_id);

-- Note: No RLS on destinations table as it should be publicly readable across users. We can add a simple read-all policy if needed.
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Destinations are publicly viewable" 
ON public.destinations FOR SELECT 
USING (true);
