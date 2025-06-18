-- 003_fix_create_profile_trigger.sql

-- 1) Supprimez l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS public.create_profile_for_new_user();

-- 2) (Re)créez la fonction en castant initial_role en user_role
CREATE FUNCTION public.create_profile_for_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
AS $$
DECLARE
  metadata jsonb := NEW.raw_user_meta_data;
BEGIN
  INSERT INTO public.users (
    id,
    primerica_id,
    email,
    first_name,
    last_name,
    initial_role,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    metadata->> 'primerica_id',
    NEW.email,
    metadata->> 'first_name',
    metadata->> 'last_name',
    -- Ici on cast le texte en enum user_role
    (metadata->> 'initial_role')::public.user_role,
    TRUE,
    now(),
    now()
  );
  RETURN NEW;
END;
$$;

-- 3) Recréez le trigger (si vous l'aviez déjà défini auparavant)
DROP TRIGGER IF EXISTS on_auth_user_insert ON auth.users;
CREATE TRIGGER on_auth_user_insert
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_profile_for_new_user();
