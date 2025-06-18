-- 002_enable_rls_and_create_policies.sql
-- Activation de RLS et création des policies de base

-- 1) Activer RLS sur public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2) Policy pour lookup connexion (anon)
DROP POLICY IF EXISTS allow_anon_login_read ON public.users;
CREATE POLICY allow_anon_login_read
  ON public.users
  FOR SELECT
  TO anon
  USING (true);

-- 3) Policy pour que chaque utilisateur puisse lire SON propre profil
DROP POLICY IF EXISTS users_select_own ON public.users;
CREATE POLICY users_select_own
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 4) Policy pour que chaque utilisateur puisse mettre à jour SON propre profil
DROP POLICY IF EXISTS users_update_own ON public.users;
CREATE POLICY users_update_own
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5) Policy « Admin full access » pour les admins
DROP POLICY IF EXISTS admin_full_access ON public.users;
CREATE POLICY admin_full_access
  ON public.users
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT up.user_id
      FROM public.user_permissions up
      JOIN public.permissions p ON up.permission_id = p.id
      WHERE p.name = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT up.user_id
      FROM public.user_permissions up
      JOIN public.permissions p ON up.permission_id = p.id
      WHERE p.name = 'admin'
    )
  );

-- 6) Activez le RLS et créez des policies similaires sur les autres tables :
--    public.permissions, public.user_permissions, public.exams, etc.
