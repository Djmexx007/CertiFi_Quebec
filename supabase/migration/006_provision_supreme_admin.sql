-- 006_provision_supreme_admin.sql
DO $$
DECLARE
  admin_uuid uuid;
  auth_meta jsonb := jsonb_build_object(
    'primerica_id',   'lul8p',
    'first_name',     'Derek',
    'last_name',      'Thibeault',
    'initial_role',   'LES_DEUX'
  );
  raw_pwd text := 'Urze0912';
BEGIN
  -- Supprimer d'anciennes traces
  DELETE FROM public.user_permissions
    WHERE user_id IN (
      SELECT id FROM auth.users WHERE email = 'derthibeault@gmail.com'
    );
  DELETE FROM public.users WHERE email = 'derthibeault@gmail.com';
  DELETE FROM auth.users WHERE email = 'derthibeault@gmail.com';

  -- Upsert dans auth.users via ON CONFLICT(email)
  INSERT INTO auth.users (
    id, aud, role,
    email, encrypted_password,
    raw_user_meta_data,
    email_confirmed_at,
    confirmation_sent_at,
    instance_id,
    created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'authenticated','authenticated',
    'derthibeault@gmail.com',
    crypt(raw_pwd, gen_salt('bf')),
    auth_meta,
    now(), now(),
    gen_random_uuid(),
    now(), now()
  )
  ON CONFLICT (email) DO UPDATE
    SET
      encrypted_password   = EXCLUDED.encrypted_password,
      raw_user_meta_data   = EXCLUDED.raw_user_meta_data,
      email_confirmed_at   = now(),
      confirmation_sent_at = now(),
      instance_id          = gen_random_uuid(),
      updated_at           = now()
  RETURNING id INTO admin_uuid;

  -- Déclencher la création du profil public.users
  PERFORM public.create_profile_for_new_user();

  RAISE NOTICE 'Supreme Admin créé ou mis à jour: %', admin_uuid;
END;
$$;
