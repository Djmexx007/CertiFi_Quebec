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