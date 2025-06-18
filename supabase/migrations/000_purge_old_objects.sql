-- Supprime tout ce qui pourrait exister du schéma précédent
-- Triggers et fonctions
DROP TRIGGER IF EXISTS auth_users_insert_profile ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_for_new_user() CASCADE;

-- Tables métier
DROP TABLE IF EXISTS public.user_permissions CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.exams CASCADE;
DROP TABLE IF EXISTS public.minigames CASCADE;
DROP TABLE IF EXISTS public.podcast_content CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;

-- Types ENUM
DROP TYPE IF EXISTS public.activity_type CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;