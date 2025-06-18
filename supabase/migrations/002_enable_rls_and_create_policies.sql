-- Active RLS sur public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Lecture pour l’anon (login lookup)
CREATE POLICY IF NOT EXISTS allow_anon_login_read
  ON public.users FOR SELECT TO anon
  USING (true);

-- Sélection/maj pour own profile
CREATE POLICY IF NOT EXISTS users_select_own
  ON public.users FOR SELECT TO authenticated
  USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS users_update_own
  ON public.users FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Accès complet pour les admins
CREATE POLICY IF NOT EXISTS admin_full_access
  ON public.users FOR ALL TO authenticated
  USING (
    EXISTS(
      SELECT 1 FROM public.user_permissions up
       JOIN public.permissions p ON up.permission_id = p.id
      WHERE up.user_id = auth.uid() AND p.name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS(
      SELECT 1 FROM public.user_permissions up
       JOIN public.permissions p ON up.permission_id = p.id
      WHERE up.user_id = auth.uid() AND p.name = 'admin'
    )
  );