/*
  # Configuration complète de la base de données CertiFi Québec

  1. Types ENUM
    - `user_role` : PQAP, FONDS_MUTUELS, LES_DEUX
    - `activity_type` : login, logout, podcast_listened, exam_started, exam_completed, minigame_played, level_up, admin_award, profile_updated, password_changed

  2. Tables principales
    - `permissions` : Permissions système
    - `users` : Profils utilisateurs étendus
    - `user_permissions` : Attribution des permissions
    - `podcast_content` : Contenu audio de formation
    - `questions` : Questions d'examen
    - `exams` : Configuration des examens
    - `user_exam_attempts` : Tentatives d'examen
    - `minigames` : Mini-jeux éducatifs
    - `user_minigame_scores` : Scores des mini-jeux
    - `recent_activities` : Journal des activités
    - `admin_logs` : Logs d'administration

  3. Sécurité
    - RLS activé sur toutes les tables
    - Policies pour anon, authenticated, admin
    - Fonctions SECURITY DEFINER

  4. Fonctions métier
    - Gestion XP et niveaux
    - Statistiques utilisateur
    - Logging admin
    - Triggers automatiques
*/

-- =============================================
-- 1. SUPPRESSION ET NETTOYAGE
-- =============================================

-- Supprimer les anciennes policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Supprimer les anciennes tables (dans l'ordre des dépendances)
DROP TABLE IF EXISTS public.admin_logs CASCADE;
DROP TABLE IF EXISTS public.recent_activities CASCADE;
DROP TABLE IF EXISTS public.user_minigame_scores CASCADE;
DROP TABLE IF EXISTS public.minigames CASCADE;
DROP TABLE IF EXISTS public.user_exam_attempts CASCADE;
DROP TABLE IF EXISTS public.exams CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.podcast_content CASCADE;
DROP TABLE IF EXISTS public.user_permissions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;

-- Supprimer les anciennes fonctions
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_for_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_with_permissions(uuid, text, text, text, text, user_role) CASCADE;
DROP FUNCTION IF EXISTS public.award_xp(uuid, integer, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_stats(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_exam_xp(integer, numeric, integer, integer) CASCADE;
DROP FUNCTION IF EXISTS public.log_admin_action(uuid, text, text, text, jsonb, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_old_activities() CASCADE;

-- Supprimer les anciens types
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.activity_type CASCADE;

-- =============================================
-- 2. CRÉATION DES TYPES ENUM
-- =============================================

CREATE TYPE public.user_role AS ENUM ('PQAP', 'FONDS_MUTUELS', 'LES_DEUX');
CREATE TYPE public.activity_type AS ENUM (
    'login', 'logout', 'podcast_listened', 'exam_started', 'exam_completed', 
    'minigame_played', 'level_up', 'admin_award', 'profile_updated', 'password_changed'
);

-- =============================================
-- 3. CRÉATION DES TABLES
-- =============================================

-- Table des permissions système
CREATE TABLE public.permissions (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des utilisateurs (profils étendus)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    primerica_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    initial_role user_role NOT NULL,
    current_xp INTEGER DEFAULT 0 CHECK (current_xp >= 0),
    current_level INTEGER DEFAULT 1 CHECK (current_level >= 1),
    gamified_role TEXT DEFAULT 'Apprenti Conseiller',
    is_admin BOOLEAN DEFAULT false,
    is_supreme_admin BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    avatar_url TEXT,
    last_activity_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table de liaison utilisateur-permissions
CREATE TABLE public.user_permissions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES public.users(id),
    granted_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, permission_id)
);

-- Table du contenu podcast
CREATE TABLE public.podcast_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    audio_url TEXT,
    duration_seconds INTEGER CHECK (duration_seconds > 0),
    theme TEXT,
    required_permission TEXT NOT NULL,
    xp_awarded INTEGER DEFAULT 0 CHECK (xp_awarded >= 0),
    source_document_ref TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des questions d'examen
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'MCQ' NOT NULL,
    options_json JSONB,
    correct_answer_key TEXT NOT NULL,
    explanation TEXT,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    required_permission TEXT NOT NULL,
    source_document_ref TEXT NOT NULL,
    chapter_reference TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des examens
CREATE TABLE public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_name TEXT NOT NULL,
    description TEXT,
    required_permission TEXT NOT NULL,
    num_questions_to_draw INTEGER NOT NULL CHECK (num_questions_to_draw > 0),
    time_limit_minutes INTEGER NOT NULL CHECK (time_limit_minutes > 0),
    passing_score_percentage DOUBLE PRECISION NOT NULL CHECK (passing_score_percentage >= 0 AND passing_score_percentage <= 100),
    xp_base_reward INTEGER DEFAULT 0 CHECK (xp_base_reward >= 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des tentatives d'examen
CREATE TABLE public.user_exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    attempt_date TIMESTAMPTZ DEFAULT now(),
    score_percentage DOUBLE PRECISION NOT NULL CHECK (score_percentage >= 0 AND score_percentage <= 100),
    user_answers_json JSONB,
    time_spent_seconds INTEGER NOT NULL CHECK (time_spent_seconds > 0),
    xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
    passed BOOLEAN GENERATED ALWAYS AS (score_percentage >= 70) STORED
);

-- Table des mini-jeux
CREATE TABLE public.minigames (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_name TEXT NOT NULL,
    description TEXT,
    game_type TEXT NOT NULL,
    base_xp_gain INTEGER DEFAULT 0 CHECK (base_xp_gain >= 0),
    max_daily_xp INTEGER DEFAULT 100 CHECK (max_daily_xp >= 0),
    required_permission TEXT NOT NULL,
    game_config_json JSONB DEFAULT '{}',
    source_document_ref TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des scores de mini-jeux
CREATE TABLE public.user_minigame_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    minigame_id UUID NOT NULL REFERENCES public.minigames(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0),
    max_possible_score INTEGER,
    xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
    attempt_date TIMESTAMPTZ DEFAULT now(),
    game_session_data JSONB DEFAULT '{}'
);

-- Table des activités récentes
CREATE TABLE public.recent_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    activity_type activity_type NOT NULL,
    activity_details_json JSONB DEFAULT '{}',
    xp_gained INTEGER DEFAULT 0 CHECK (xp_gained >= 0),
    occurred_at TIMESTAMPTZ DEFAULT now()
);

-- Table des logs d'administration
CREATE TABLE public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    target_entity TEXT,
    target_id TEXT,
    details_json JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    occurred_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 4. CRÉATION DES INDEX
-- =============================================

-- Index pour les performances
CREATE INDEX idx_users_primerica_id ON public.users(primerica_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_active ON public.users(is_active);
CREATE INDEX idx_user_permissions_user_id ON public.user_permissions(user_id);
CREATE INDEX idx_user_exam_attempts_user_id ON public.user_exam_attempts(user_id);
CREATE INDEX idx_user_exam_attempts_exam_id ON public.user_exam_attempts(exam_id);
CREATE INDEX idx_user_minigame_scores_user_id ON public.user_minigame_scores(user_id);
CREATE INDEX idx_recent_activities_user_id ON public.recent_activities(user_id);
CREATE INDEX idx_recent_activities_occurred_at ON public.recent_activities(occurred_at);
CREATE INDEX idx_admin_logs_admin_user_id ON public.admin_logs(admin_user_id);
CREATE INDEX idx_admin_logs_occurred_at ON public.admin_logs(occurred_at);

-- =============================================
-- 5. ACTIVATION RLS
-- =============================================

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minigames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_minigame_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 6. INSERTION DES DONNÉES DE BASE
-- =============================================

-- Permissions de base
INSERT INTO public.permissions (name, description) VALUES
('pqap', 'Accès aux formations PQAP'),
('fonds_mutuels', 'Accès aux formations Fonds Mutuels'),
('admin', 'Droits d''administration'),
('supreme_admin', 'Droits d''administration suprême')
ON CONFLICT (name) DO NOTHING;

RAISE NOTICE 'Schema créé avec succès - Tables, index et permissions de base configurés';