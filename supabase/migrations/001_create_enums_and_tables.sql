-- 1) (Re)création des enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM('PQAP','FONDS_MUTUELS','LES_DEUX');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
    CREATE TYPE public.activity_type AS ENUM(
      'login','podcast_listened','exam_completed','minigame_played','profile_updated'
    );
  END IF;
END
$$;

-- 2) Création des tables
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  primerica_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  initial_role public.user_role NOT NULL,
  current_xp integer NOT NULL DEFAULT 0,
  current_level integer NOT NULL DEFAULT 1,
  gamified_role text NOT NULL DEFAULT '',
  last_activity_at timestamptz,
  is_admin boolean NOT NULL DEFAULT false,
  is_supreme_admin boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  description text
);

CREATE TABLE IF NOT EXISTS public.user_permissions (
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  permission_id integer REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted_by uuid,
  granted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, permission_id)
);

-- (… autres tables métier …)