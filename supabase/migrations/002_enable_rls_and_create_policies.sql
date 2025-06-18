-- Active RLS sur public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy pour lookup anonyme (connexion)
DROP POLICY IF EXISTS anon_lookup_users ON public.users;
CREATE POLICY anon_lookup_users
  ON public.users FOR SELECT
  TO anon
  USING (true);

-- Policies pour utilisateurs authentifiés (accès à leur profil)
DROP POLICY IF EXISTS auth_select_own_profile ON public.users;
CREATE POLICY auth_select_own_profile
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS auth_update_own_profile ON public.users;
CREATE POLICY auth_update_own_profile
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policies admin / supreme_admin
DROP POLICY IF EXISTS admin_full_access ON public.users;
CREATE POLICY admin_full_access
  ON public.users FOR ALL
  TO authenticated
  USING ((EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND (u.is_admin OR u.is_supreme_admin))));