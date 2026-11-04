-- Nom personnalisé d'un voyage (« Lisbonne en amoureux ») et lien de partage public
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS share_id uuid UNIQUE;
-- Voyageurs et budget, pour les afficher sur la page partagée
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS travelers int;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS budget numeric;
