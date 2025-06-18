-- 000_purge_all.sql
BEGIN;

-- 1) Supprime le trigger et la fonction de création automatique de profil
DROP TRIGGER IF EXISTS auth_users_insert_profile ON auth.users;
DROP FUNCTION IF EXISTS public.create_profile_for_new_user() CASCADE;

-- 2) Supprime les policies RLS sur public.users (au cas où)
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- 3) Supprime toutes les tables métier
DROP TABLE IF EXISTS public.user_permissions CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.exams CASCADE;
DROP TABLE IF EXISTS public.minigames CASCADE;
DROP TABLE IF EXISTS public.podcast_content CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 4) Supprime les types ENUM
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.activity_type CASCADE;

COMMIT;
