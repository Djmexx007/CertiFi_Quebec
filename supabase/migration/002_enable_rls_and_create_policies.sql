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

-- 003_create_trigger_functions.sql
--  Fonctions et triggers pour créer le profil à l'inscription

-- 1) Supprimez l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS public.create_profile_for_new_user() CASCADE;

-- 2) (Re)Créez la fonction corrigée
CREATE FUNCTION public.create_profile_for_new_user()
  RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  metadata jsonb := NEW.raw_user_meta_data;
BEGIN
  INSERT INTO public.users (
    id, primerica_id, email, first_name, last_name,
    initial_role, is_active, created_at, updated_at
  ) VALUES (
    NEW.id,
    metadata->> 'primerica_id',
    NEW.email,
    metadata->> 'first_name',
    metadata->> 'last_name',
    (metadata->> 'initial_role')::public.user_role,
    TRUE, now(), now()
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;