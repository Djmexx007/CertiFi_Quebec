-- 002_enable_rls_and_create_policies.sql
--  Activation de RLS et création des policies de base

-- Activer RLS sur public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- Policy pour lookup connexion (anon)
DROP POLICY IF EXISTS "Allow anon login read" ON public.users;
CREATE POLICY "Allow anon login read"
  ON public.users FOR SELECT TO anon USING (true);

-- Policies pour authenticated users
DROP POLICY IF EXISTS "Users can manage own profile" ON public.users;
CREATE POLICY "Users can manage own profile"
  ON public.users FOR SELECT, UPDATE USING (auth.uid() = id);

-- Policy admin/full-access
DROP POLICY IF EXISTS "Admin full access" ON public.users;
CREATE POLICY "Admin full access"
  ON public.users FOR ALL TO authenticated WITH CHECK ((EXISTS(
    SELECT 1 FROM public.user_permissions up JOIN public.permissions p ON up.permission_id = p.id
    WHERE up.user_id = auth.uid() AND p.name = 'admin'
  )));

-- Active RLS sur autres tables et policies similaires...
