-- 004_provision_supreme_admin.sql
--  Création idempotente du Supreme Admin
DO $$
DECLARE
  admin_uuid uuid;
BEGIN
  -- Supprimez ancien si présent
  DELETE FROM public.user_permissions WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'derthibeault@gmail.com'
  );
  DELETE FROM public.users WHERE email = 'derthibeault@gmail.com';
  DELETE FROM auth.users WHERE email = 'derthibeault@gmail.com';

  -- Créez dans auth.users
  INSERT INTO auth.users (
    id, email, encrypted_password, raw_user_meta_data,
    email_confirmed_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'derthibeault@gmail.com',
    crypt('Urze0912', gen_salt('bf')),
    jsonb_build_object(
      'primerica_id', 'lul8p',
      'first_name', 'Derek',
      'last_name', 'Thibeault',
      'initial_role', 'LES_DEUX'
    ),
    now(), now(), now()
  ) ON CONFLICT (email) DO UPDATE
    SET encrypted_password = EXCLUDED.encrypted_password,
        raw_user_meta_data = EXCLUDED.raw_user_meta_data,
        updated_at = now()
  RETURNING id INTO admin_uuid;

  -- Appel de la fonction de trigger (créera l'entrée dans public.users)
  PERFORM public.create_profile_for_new_user();

  RAISE NOTICE 'Supreme Admin créé ou mis à jour: %', admin_uuid;
END;
$$;
