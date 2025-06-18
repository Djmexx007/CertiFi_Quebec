-- 1. Crée les types ENUM
CREATE TYPE IF NOT EXISTS public.user_role AS ENUM('PQAP','FONDS_MUTUELS','LES_DEUX');
CREATE TYPE IF NOT EXISTS public.activity_type AS ENUM('login','podcast_listened','exam_completed','minigame_played','level_up');

-- 2. Crée les tables principales
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  primerica_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  initial_role public.user_role NOT NULL,
  current_xp integer DEFAULT 0,
  current_level integer DEFAULT 1,
  gamified_role text,
  is_admin boolean DEFAULT FALSE,
  is_supreme_admin boolean DEFAULT FALSE,
  is_active boolean DEFAULT TRUE,
  last_activity_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
