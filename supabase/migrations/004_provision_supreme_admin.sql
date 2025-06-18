-- Provisionnement idempotent du Supreme Admin
DO $$
DECLARE admin_uuid uuid;
BEGIN
  -- Purge les anciens
  DELETE FROM public.user_permissions
   WHERE user_id IN (
     SELECT id FROM auth.users WHERE email = 'derthibeault@gmail.com'
   );
  DELETE FROM public.users WHERE email = 'derthibeault@gmail.com';
  DELETE FROM auth.users   WHERE email = 'derthibeault@gmail.com';

  -- Insertion dans auth.users
  INSERT INTO auth.users (
    id, aud, role, email,
    encrypted_password, raw_user_meta_data,
    email_confirmed_at, confirmation_sent_at,
    instance_id, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), 'authenticated','authenticated', 'derthibeault@gmail.com',
    crypt('Urze0912', gen_salt('bf')),
    jsonb_build_object(
      'primerica_id','lul8p', 'first_name','Derek',
      'last_name','Thibeault', 'initial_role','LES_DEUX'
    ),
    now(), now(), gen_random_uuid(), now(), now()
  );

  -- Le trigger sur auth.users va créer le profil dans public.users
  RAISE NOTICE 'Supreme Admin créé avec succès';
END;
$$;