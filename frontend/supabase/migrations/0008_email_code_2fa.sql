-- 0008 : double authentification par code envoyé par email
-- SQL Editor > New query > coller ce fichier > Run. Ré-exécutable sans risque.

-- 1. Retrait des policies TOTP de la migration 0007 (abandonnées). Elles lisaient la
--    table auth.mfa_factors, interdite au rôle « authenticated » : la lecture des
--    voyages échouait avec « permission denied for table mfa_factors ».
DROP POLICY IF EXISTS "Require aal2 when MFA enrolled" ON public.trips;
DROP POLICY IF EXISTS "Require aal2 when MFA enrolled" ON public.trip_items;

-- 2. La session a-t-elle été validée par un code reçu par email ?
--    Supabase écrit dans le jeton (JWT) la méthode de connexion, champ « amr » :
--    [{"method":"oauth"}] pour Google/GitHub, [{"method":"otp"}] après un code email.
CREATE OR REPLACE FUNCTION public.session_email_verified()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(
      CASE WHEN jsonb_typeof(auth.jwt() -> 'amr') = 'array' THEN auth.jwt() -> 'amr' ELSE '[]'::jsonb END
    ) AS e
    WHERE e ->> 'method' IN ('otp', 'magiclink')
  );
$$;

-- 3. Policy RESTRICTIVE (combinée en ET avec les policies existantes) : une session
--    Google/GitHub non validée par le code email ne peut ni lire ni écrire de voyages,
--    même en appelant l'API Supabase directement.
DROP POLICY IF EXISTS "Require email code" ON public.trips;
CREATE POLICY "Require email code" ON public.trips
  AS RESTRICTIVE FOR ALL TO authenticated
  USING ((SELECT public.session_email_verified()))
  WITH CHECK ((SELECT public.session_email_verified()));

DROP POLICY IF EXISTS "Require email code" ON public.trip_items;
CREATE POLICY "Require email code" ON public.trip_items
  AS RESTRICTIVE FOR ALL TO authenticated
  USING ((SELECT public.session_email_verified()))
  WITH CHECK ((SELECT public.session_email_verified()));
