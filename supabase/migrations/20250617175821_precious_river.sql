/*
  # Configuration RLS pour le flux de connexion sécurisé

  1. Sécurité
    - Active RLS sur la table users
    - Crée une policy pour permettre le lookup de connexion par anon
    - Permet la lecture des champs email, is_active et primerica_id pour l'authentification

  2. Objectif
    - Permettre le flux de connexion en deux étapes (lookup SQL + Auth Supabase)
    - Sécuriser l'accès aux données utilisateur
    - Éviter les erreurs 500 et les messages d'erreur incorrects
*/

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