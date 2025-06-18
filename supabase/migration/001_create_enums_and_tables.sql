-- 001_create_enums_and_tables.sql
-- Création des types ENUM et des tables métier

-- 1) Supprimer et (re)créer le type user_role
DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM (
  'PQAP',
  'FONDS_MUTUELS',
  'LES_DEUX'
);

-- 2) Supprimer et (re)créer le type activity_type
DROP TYPE IF EXISTS public.activity_type CASCADE;
CREATE TYPE public.activity_type AS ENUM (
  'login',
  'podcast_listened',
  'exam_completed',
  'minigame_played',
  'profile_updated'
);

-- 3) Table users
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  primerica_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  initial_role user_role NOT NULL,
  current_xp integer NOT NULL DEFAULT 0,
  current_level integer NOT NULL DEFAULT 1,
  gamified_role text NOT NULL,
  last_activity_at timestamptz,
  is_admin boolean NOT NULL DEFAULT false,
  is_supreme_admin boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4) Table permissions
CREATE TABLE IF NOT EXISTS public.permissions (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  description text
);

-- 5) Jointure user_permissions
CREATE TABLE IF NOT EXISTS public.user_permissions (
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  permission_id integer REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted_by uuid,
  granted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, permission_id)
);

-- 6) Exemple d’autres tables (à compléter pour votre schéma complet) :
CREATE TABLE IF NOT EXISTS public.exams (
  id uuid PRIMARY KEY,
  exam_name text NOT NULL,
  description text,
  required_permission text,
  num_questions_to_draw integer NOT NULL,
  time_limit_minutes integer NOT NULL,
  passing_score_percentage integer NOT NULL,
  xp_base_reward integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- etc. (minigames, user_exam_attempts, user_minigame_scores, podcast_content, recent_activities, admin_logs, …)
