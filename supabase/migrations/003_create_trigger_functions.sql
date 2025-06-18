-- Supprime l’ancienne fonction si existante
DROP FUNCTION IF EXISTS public.create_profile_for_new_user() CASCADE;

-- Recréation de la fonction de trigger
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

-- Recréation du trigger
DROP TRIGGER IF EXISTS auth_users_insert_profile ON auth.users;
CREATE TRIGGER auth_users_insert_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_new_user();