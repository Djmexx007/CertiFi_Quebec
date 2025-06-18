-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer un profil public après insertion en auth.users
CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER AS $$
DECLARE
  metadata jsonb;
BEGIN
  metadata := NEW.raw_user_meta_data;
  INSERT INTO public.users (id, primerica_id, email, first_name, last_name, initial_role, is_active, created_at, updated_at)
    VALUES (
      NEW.id,
      metadata->> 'primerica_id',
      NEW.email,
      metadata->> 'first_name',
      metadata->> 'last_name',
      metadata->> 'initial_role',
      TRUE,
      now(),
      now()
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS auth_users_insert_profile ON auth.users;
CREATE TRIGGER auth_users_insert_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_profile_for_new_user();