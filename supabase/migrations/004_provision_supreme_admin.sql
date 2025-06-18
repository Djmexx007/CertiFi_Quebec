DO $$
DECLARE
  _id uuid;
BEGIN
  -- Supprime l’ancien admin suprême s’il existe
  DELETE FROM public.users          WHERE primerica_id = 'lul8p';
  DELETE FROM auth.users           WHERE email = 'derthibeault@gmail.com';

  -- Crée-le dans auth.users
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    raw_user_meta_data,
    email_confirmed_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    'derthibeault@gmail.com',
    crypt('Urze0912', gen_salt('bf')),
    '{"primerica_id":"lul8p","first_name":"Derek","last_name":"Thibeault","initial_role":"LES_DEUX"}',
    now(),
    now(),
    now()
  ) RETURNING id INTO _id;

  -- Profil public
  INSERT INTO public.users (
    id,
    primerica_id,
    email,
    first_name,
    last_name,
    initial_role,
    is_admin,
    is_supreme_admin,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    _id,
    'lul8p',
    'derthibeault@gmail.com',
    'Derek',
    'Thibeault',
    'LES_DEUX',
    TRUE,
    TRUE,
    TRUE,
    now(),
    now()
  );
END$$;