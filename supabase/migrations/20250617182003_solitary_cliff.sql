-- Activer RLS sur la table users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Supprimer l'ancienne policy si elle existe
DROP POLICY IF EXISTS "Allow anon login read" ON public.users;

-- Créer la policy pour permettre le lookup de connexion
CREATE POLICY "Allow anon login read"
  ON public.users FOR SELECT
  TO anon
  USING (true);

-- Vérifier que RLS est bien activé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- Optionnel : Créer un utilisateur de test si nécessaire
-- Décommentez les lignes suivantes si vous n'avez pas encore d'utilisateur de test

/*
-- Créer un utilisateur de test dans auth.users
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'test@example.com',
  crypt('Urze0912', gen_salt('bf')),
  now(),
  '{"primerica_id": "lul8p", "first_name": "Test", "last_name": "User"}',
  now(),
  now()
) RETURNING id;

-- Récupérer l'ID généré et créer le profil
-- Remplacez 'USER_ID_FROM_ABOVE' par l'ID retourné
INSERT INTO public.users (
  id,
  primerica_id,
  email,
  first_name,
  last_name,
  initial_role,
  is_active
) VALUES (
  'USER_ID_FROM_ABOVE',
  'lul8p',
  'test@example.com',
  'Test',
  'User',
  'LES_DEUX',
  true
);
*/