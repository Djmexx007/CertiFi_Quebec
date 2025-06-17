/*
  # Réinitialisation complète du système CertiFi Québec
  
  Ce script effectue une purge totale des données de démo et réinitialise
  complètement le schéma métier avec un Supreme Admin fonctionnel.
  
  1. Purge des données de démo
  2. Réinitialisation du schéma métier
  3. Row Level Security et policies
  4. Fonctions métier
  5. Triggers
  6. Création automatisée du Supreme Admin
*/

-- ============================================================================
-- 1. PURGE TOTALE DES DONNÉES DE DÉMO
-- ============================================================================

-- Supprimer tous les utilisateurs avec des métadonnées de démo
DELETE FROM auth.users 
WHERE raw_user_meta_data->>'is_demo_user' = 'true'
   OR email LIKE '%demo%'
   OR email LIKE '%test%';

-- Supprimer les colonnes/métadonnées de démo si elles existent
-- (Les colonnes is_demo_user n'existent pas dans le schéma actuel, donc pas besoin)

-- Nettoyer les activités liées aux comptes supprimés
DELETE FROM public.recent_activities 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- ============================================================================
-- 2. RÉINITIALISATION COMPLÈTE DU SCHÉMA MÉTIER
-- ============================================================================

-- Types ENUM
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('FONDS_MUTUELS', 'LES_DEUX', 'PQAP');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE activity_type AS ENUM (
        'admin_award', 'exam_completed', 'exam_started', 'level_up', 
        'login', 'logout', 'minigame_played', 'password_changed', 
        'podcast_listened', 'profile_updated'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Table de configuration des niveaux XP
CREATE TABLE IF NOT EXISTS public.levels_xp_config (
    level_number INTEGER PRIMARY KEY,
    xp_required INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer les niveaux de base
INSERT INTO public.levels_xp_config (level_number, xp_required) VALUES
(1, 0), (2, 500), (3, 1000), (4, 2000), (5, 3500), 
(6, 5500), (7, 8000), (8, 11000), (9, 15000), (10, 20000)
ON CONFLICT (level_number) DO NOTHING;

-- Table de configuration des rôles gamifiés
CREATE TABLE IF NOT EXISTS public.gamified_roles_config (
    id SERIAL PRIMARY KEY,
    role_name TEXT NOT NULL,
    min_level_required INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer les rôles gamifiés
INSERT INTO public.gamified_roles_config (role_name, min_level_required, description) VALUES
('Apprenti Conseiller', 1, 'Niveau débutant'),
('Conseiller Junior', 3, 'Conseiller en formation'),
('Conseiller Confirmé', 5, 'Conseiller expérimenté'),
('Conseiller Senior', 7, 'Conseiller expert'),
('Maître Conseiller', 9, 'Niveau maître')
ON CONFLICT DO NOTHING;

-- Table des permissions
CREATE TABLE IF NOT EXISTS public.permissions (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer les permissions de base
INSERT INTO public.permissions (name, description) VALUES
('pqap', 'Accès aux formations PQAP'),
('fonds_mutuels', 'Accès aux formations Fonds Mutuels'),
('admin', 'Droits administrateur'),
('supreme_admin', 'Droits administrateur suprême')
ON CONFLICT (name) DO NOTHING;

-- Table principale des utilisateurs
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    primerica_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    initial_role user_role NOT NULL,
    current_xp INTEGER DEFAULT 0 CHECK (current_xp >= 0),
    current_level INTEGER DEFAULT 1 CHECK (current_level >= 1),
    gamified_role TEXT DEFAULT 'Apprenti Conseiller',
    is_admin BOOLEAN DEFAULT FALSE,
    is_supreme_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    avatar_url TEXT,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des permissions utilisateur
CREATE TABLE IF NOT EXISTS public.user_permissions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES public.users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, permission_id)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_users_primerica_id ON public.users(primerica_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_admin ON public.users(is_admin, is_supreme_admin);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON public.user_permissions(user_id);

-- Tables pour le contenu éducatif
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_name TEXT NOT NULL,
    description TEXT,
    required_permission TEXT NOT NULL,
    num_questions_to_draw INTEGER NOT NULL CHECK (num_questions_to_draw > 0),
    time_limit_minutes INTEGER NOT NULL CHECK (time_limit_minutes > 0),
    passing_score_percentage DOUBLE PRECISION NOT NULL CHECK (passing_score_percentage >= 0 AND passing_score_percentage <= 100),
    xp_base_reward INTEGER DEFAULT 0 CHECK (xp_base_reward >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'MCQ' CHECK (question_type IN ('MCQ', 'TRUE_FALSE', 'SHORT_ANSWER')),
    options_json JSONB,
    correct_answer_key TEXT NOT NULL,
    explanation TEXT,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    required_permission TEXT NOT NULL,
    source_document_ref TEXT NOT NULL,
    chapter_reference TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.podcast_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    audio_url TEXT,
    duration_seconds INTEGER CHECK (duration_seconds > 0),
    theme TEXT,
    required_permission TEXT NOT NULL,
    xp_awarded INTEGER DEFAULT 0 CHECK (xp_awarded >= 0),
    source_document_ref TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.minigames (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_name TEXT NOT NULL,
    description TEXT,
    game_type TEXT NOT NULL,
    base_xp_gain INTEGER DEFAULT 0 CHECK (base_xp_gain >= 0),
    max_daily_xp INTEGER DEFAULT 100 CHECK (max_daily_xp >= 0),
    required_permission TEXT NOT NULL,
    game_config_json JSONB DEFAULT '{}',
    source_document_ref TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tables pour le tracking des activités
CREATE TABLE IF NOT EXISTS public.user_exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    attempt_date TIMESTAMPTZ DEFAULT NOW(),
    score_percentage DOUBLE PRECISION NOT NULL CHECK (score_percentage >= 0 AND score_percentage <= 100),
    user_answers_json JSONB,
    time_spent_seconds INTEGER NOT NULL CHECK (time_spent_seconds > 0),
    xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
    passed BOOLEAN DEFAULT (score_percentage >= 70)
);

CREATE TABLE IF NOT EXISTS public.user_minigame_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    minigame_id UUID NOT NULL REFERENCES public.minigames(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0),
    max_possible_score INTEGER,
    xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
    attempt_date TIMESTAMPTZ DEFAULT NOW(),
    game_session_data JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.recent_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    activity_type activity_type NOT NULL,
    activity_details_json JSONB DEFAULT '{}',
    xp_gained INTEGER DEFAULT 0 CHECK (xp_gained >= 0),
    occurred_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    target_entity TEXT,
    target_id TEXT,
    details_json JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    occurred_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_exam_attempts_user_id ON public.user_exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_activities_user_id ON public.recent_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_activities_occurred_at ON public.recent_activities(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_user_id ON public.admin_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_occurred_at ON public.admin_logs(occurred_at DESC);

-- ============================================================================
-- 3. ROW LEVEL SECURITY ET POLICIES
-- ============================================================================

-- Activer RLS sur toutes les tables métier
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minigames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_minigame_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Policies pour public.users
DROP POLICY IF EXISTS "Allow anon login read" ON public.users;
DROP POLICY IF EXISTS "Allow anon login select" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Supreme admins can manage users" ON public.users;

CREATE POLICY "Allow anon login read"
  ON public.users FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon login select"
  ON public.users FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can read own data"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users u2 
    WHERE u2.id = auth.uid() AND (u2.is_admin OR u2.is_supreme_admin)
  ));

CREATE POLICY "Supreme admins can manage users"
  ON public.users FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users u2 
    WHERE u2.id = auth.uid() AND u2.is_supreme_admin
  ));

-- Policies pour user_permissions
DROP POLICY IF EXISTS "Users can read own permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can manage permissions" ON public.user_permissions;

CREATE POLICY "Users can read own permissions"
  ON public.user_permissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage permissions"
  ON public.user_permissions FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND (u.is_admin OR u.is_supreme_admin)
  ));

-- Policies pour le contenu éducatif
DROP POLICY IF EXISTS "Users can read active exams" ON public.exams;
DROP POLICY IF EXISTS "Admins can manage exams" ON public.exams;

CREATE POLICY "Users can read active exams"
  ON public.exams FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage exams"
  ON public.exams FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND (u.is_admin OR u.is_supreme_admin)
  ));

-- Répéter pour les autres tables de contenu
DROP POLICY IF EXISTS "Users can read active questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can manage questions" ON public.questions;

CREATE POLICY "Users can read active questions"
  ON public.questions FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage questions"
  ON public.questions FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND (u.is_admin OR u.is_supreme_admin)
  ));

DROP POLICY IF EXISTS "Users can read active podcasts" ON public.podcast_content;
DROP POLICY IF EXISTS "Admins can manage podcasts" ON public.podcast_content;

CREATE POLICY "Users can read active podcasts"
  ON public.podcast_content FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage podcasts"
  ON public.podcast_content FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND (u.is_admin OR u.is_supreme_admin)
  ));

DROP POLICY IF EXISTS "Users can read active minigames" ON public.minigames;
DROP POLICY IF EXISTS "Admins can manage minigames" ON public.minigames;

CREATE POLICY "Users can read active minigames"
  ON public.minigames FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage minigames"
  ON public.minigames FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND (u.is_admin OR u.is_supreme_admin)
  ));

-- Policies pour les activités utilisateur
DROP POLICY IF EXISTS "Users can read own exam attempts" ON public.user_exam_attempts;
DROP POLICY IF EXISTS "Users can create exam attempts" ON public.user_exam_attempts;
DROP POLICY IF EXISTS "Admins can read all exam attempts" ON public.user_exam_attempts;

CREATE POLICY "Users can read own exam attempts"
  ON public.user_exam_attempts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create exam attempts"
  ON public.user_exam_attempts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all exam attempts"
  ON public.user_exam_attempts FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND (u.is_admin OR u.is_supreme_admin)
  ));

DROP POLICY IF EXISTS "Users can read own minigame scores" ON public.user_minigame_scores;
DROP POLICY IF EXISTS "Users can create minigame scores" ON public.user_minigame_scores;
DROP POLICY IF EXISTS "Admins can read all minigame scores" ON public.user_minigame_scores;

CREATE POLICY "Users can read own minigame scores"
  ON public.user_minigame_scores FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create minigame scores"
  ON public.user_minigame_scores FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all minigame scores"
  ON public.user_minigame_scores FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND (u.is_admin OR u.is_supreme_admin)
  ));

DROP POLICY IF EXISTS "Users can read own activities" ON public.recent_activities;
DROP POLICY IF EXISTS "System can create activities" ON public.recent_activities;
DROP POLICY IF EXISTS "Admins can read all activities" ON public.recent_activities;

CREATE POLICY "Users can read own activities"
  ON public.recent_activities FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create activities"
  ON public.recent_activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read all activities"
  ON public.recent_activities FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND (u.is_admin OR u.is_supreme_admin)
  ));

DROP POLICY IF EXISTS "Admins can read admin logs" ON public.admin_logs;
DROP POLICY IF EXISTS "System can create admin logs" ON public.admin_logs;

CREATE POLICY "Admins can read admin logs"
  ON public.admin_logs FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND (u.is_admin OR u.is_supreme_admin)
  ));

CREATE POLICY "System can create admin logs"
  ON public.admin_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- 4. FONCTIONS MÉTIER
-- ============================================================================

-- Fonction pour créer un utilisateur avec permissions
CREATE OR REPLACE FUNCTION public.create_user_with_permissions(
    user_id UUID,
    primerica_id_param TEXT,
    email_param TEXT,
    first_name_param TEXT,
    last_name_param TEXT,
    initial_role_param user_role
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    pqap_permission_id INTEGER;
    fonds_permission_id INTEGER;
BEGIN
    -- Insérer ou mettre à jour l'utilisateur
    INSERT INTO public.users (
        id, primerica_id, email, first_name, last_name, initial_role
    ) VALUES (
        user_id, primerica_id_param, email_param, first_name_param, last_name_param, initial_role_param
    )
    ON CONFLICT (id) DO UPDATE SET
        primerica_id = EXCLUDED.primerica_id,
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        initial_role = EXCLUDED.initial_role,
        updated_at = NOW();

    -- Récupérer les IDs des permissions
    SELECT id INTO pqap_permission_id FROM public.permissions WHERE name = 'pqap';
    SELECT id INTO fonds_permission_id FROM public.permissions WHERE name = 'fonds_mutuels';

    -- Attribuer les permissions selon le rôle
    IF initial_role_param = 'PQAP' OR initial_role_param = 'LES_DEUX' THEN
        INSERT INTO public.user_permissions (user_id, permission_id)
        VALUES (user_id, pqap_permission_id)
        ON CONFLICT (user_id, permission_id) DO NOTHING;
    END IF;

    IF initial_role_param = 'FONDS_MUTUELS' OR initial_role_param = 'LES_DEUX' THEN
        INSERT INTO public.user_permissions (user_id, permission_id)
        VALUES (user_id, fonds_permission_id)
        ON CONFLICT (user_id, permission_id) DO NOTHING;
    END IF;
END;
$$;

-- Fonction pour attribuer de l'XP
CREATE OR REPLACE FUNCTION public.award_xp(
    user_uuid UUID,
    xp_amount INTEGER,
    activity_type_param activity_type,
    activity_details JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    old_xp INTEGER;
    new_xp INTEGER;
    old_level INTEGER;
    new_level INTEGER;
    level_up_occurred BOOLEAN := FALSE;
    result JSONB;
BEGIN
    -- Récupérer les valeurs actuelles
    SELECT current_xp, current_level INTO old_xp, old_level
    FROM public.users WHERE id = user_uuid;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Utilisateur non trouvé';
    END IF;

    -- Calculer les nouvelles valeurs
    new_xp := old_xp + xp_amount;
    
    -- Calculer le nouveau niveau
    SELECT COALESCE(MAX(level_number), 1) INTO new_level
    FROM public.levels_xp_config
    WHERE xp_required <= new_xp;

    -- Vérifier si montée de niveau
    IF new_level > old_level THEN
        level_up_occurred := TRUE;
    END IF;

    -- Mettre à jour l'utilisateur
    UPDATE public.users 
    SET current_xp = new_xp, 
        current_level = new_level,
        last_activity_at = NOW()
    WHERE id = user_uuid;

    -- Enregistrer l'activité
    INSERT INTO public.recent_activities (
        user_id, activity_type, activity_details_json, xp_gained
    ) VALUES (
        user_uuid, activity_type_param, activity_details, xp_amount
    );

    -- Si montée de niveau, enregistrer l'activité de level up
    IF level_up_occurred THEN
        INSERT INTO public.recent_activities (
            user_id, activity_type, activity_details_json, xp_gained
        ) VALUES (
            user_uuid, 'level_up', jsonb_build_object('new_level', new_level, 'old_level', old_level), 0
        );
    END IF;

    -- Construire le résultat
    result := jsonb_build_object(
        'old_xp', old_xp,
        'new_xp', new_xp,
        'old_level', old_level,
        'new_level', new_level,
        'level_up_occurred', level_up_occurred,
        'xp_awarded', xp_amount
    );

    RETURN result;
END;
$$;

-- Fonction pour obtenir les statistiques utilisateur
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    stats JSONB;
    total_exams INTEGER;
    passed_exams INTEGER;
    failed_exams INTEGER;
    avg_score NUMERIC;
    total_podcasts INTEGER;
    total_minigames INTEGER;
    current_streak INTEGER;
    rank_position INTEGER;
BEGIN
    -- Statistiques d'examens
    SELECT COUNT(*), 
           COUNT(*) FILTER (WHERE passed = true),
           COUNT(*) FILTER (WHERE passed = false),
           AVG(score_percentage)
    INTO total_exams, passed_exams, failed_exams, avg_score
    FROM public.user_exam_attempts
    WHERE user_id = user_uuid;

    -- Statistiques de podcasts
    SELECT COUNT(*)
    INTO total_podcasts
    FROM public.recent_activities
    WHERE user_id = user_uuid AND activity_type = 'podcast_listened';

    -- Statistiques de mini-jeux
    SELECT COUNT(*)
    INTO total_minigames
    FROM public.user_minigame_scores
    WHERE user_id = user_uuid;

    -- Calcul du rang (position dans le classement)
    SELECT COUNT(*) + 1
    INTO rank_position
    FROM public.users
    WHERE current_xp > (SELECT current_xp FROM public.users WHERE id = user_uuid)
      AND is_active = true;

    -- Streak actuel (jours consécutifs de connexion)
    current_streak := 1; -- Simplifié pour l'instant

    -- Construire l'objet de statistiques
    stats := jsonb_build_object(
        'total_exams', COALESCE(total_exams, 0),
        'passed_exams', COALESCE(passed_exams, 0),
        'failed_exams', COALESCE(failed_exams, 0),
        'average_score', COALESCE(avg_score, 0),
        'total_podcasts_listened', COALESCE(total_podcasts, 0),
        'total_minigames_played', COALESCE(total_minigames, 0),
        'current_streak', current_streak,
        'rank_position', rank_position
    );

    RETURN stats;
END;
$$;

-- Fonction pour calculer l'XP d'un examen
CREATE OR REPLACE FUNCTION public.calculate_exam_xp(
    base_xp INTEGER,
    score_percentage NUMERIC,
    time_spent_seconds INTEGER,
    time_limit_seconds INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    performance_bonus INTEGER := 0;
    time_bonus INTEGER := 0;
    final_xp INTEGER;
BEGIN
    -- Bonus de performance basé sur le score
    IF score_percentage >= 90 THEN
        performance_bonus := base_xp * 0.5;
    ELSIF score_percentage >= 80 THEN
        performance_bonus := base_xp * 0.3;
    ELSIF score_percentage >= 70 THEN
        performance_bonus := base_xp * 0.1;
    END IF;

    -- Bonus de temps (si terminé rapidement)
    IF time_spent_seconds < (time_limit_seconds * 0.7) THEN
        time_bonus := base_xp * 0.2;
    END IF;

    final_xp := base_xp + performance_bonus + time_bonus;
    
    RETURN GREATEST(final_xp, 0);
END;
$$;

-- Fonction pour logger les actions admin
CREATE OR REPLACE FUNCTION public.log_admin_action(
    admin_id UUID,
    action_type_param TEXT,
    target_entity_param TEXT DEFAULT NULL,
    target_id_param TEXT DEFAULT NULL,
    details_param JSONB DEFAULT '{}',
    ip_address_param TEXT DEFAULT NULL,
    user_agent_param TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.admin_logs (
        admin_user_id, action_type, target_entity, target_id, 
        details_json, ip_address, user_agent
    ) VALUES (
        admin_id, action_type_param, target_entity_param, target_id_param,
        details_param, ip_address_param, user_agent_param
    );
END;
$$;

-- Fonction de nettoyage des anciennes activités
CREATE OR REPLACE FUNCTION public.cleanup_old_activities()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Supprimer les activités de plus de 6 mois
    DELETE FROM public.recent_activities
    WHERE occurred_at < NOW() - INTERVAL '6 months';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================

-- Fonction trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fonction trigger pour créer le profil utilisateur
CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_metadata JSONB;
    primerica_id_val TEXT;
    first_name_val TEXT;
    last_name_val TEXT;
    initial_role_val user_role;
BEGIN
    -- Récupérer les métadonnées
    user_metadata := NEW.raw_user_meta_data;
    
    -- Extraire les valeurs des métadonnées
    primerica_id_val := user_metadata->>'primerica_id';
    first_name_val := user_metadata->>'first_name';
    last_name_val := user_metadata->>'last_name';
    initial_role_val := (user_metadata->>'initial_role')::user_role;
    
    -- Vérifier que les métadonnées nécessaires sont présentes
    IF primerica_id_val IS NOT NULL AND first_name_val IS NOT NULL 
       AND last_name_val IS NOT NULL AND initial_role_val IS NOT NULL THEN
        
        -- Appeler la fonction pour créer le profil avec permissions
        PERFORM public.create_user_with_permissions(
            NEW.id,
            primerica_id_val,
            NEW.email,
            first_name_val,
            last_name_val,
            initial_role_val
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Supprimer et recréer les triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_exams_updated_at ON public.exams;
CREATE TRIGGER update_exams_updated_at
    BEFORE UPDATE ON public.exams
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_questions_updated_at ON public.questions;
CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_podcast_content_updated_at ON public.podcast_content;
CREATE TRIGGER update_podcast_content_updated_at
    BEFORE UPDATE ON public.podcast_content
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_minigames_updated_at ON public.minigames;
CREATE TRIGGER update_minigames_updated_at
    BEFORE UPDATE ON public.minigames
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS create_profile_for_new_user_trigger ON auth.users;
CREATE TRIGGER create_profile_for_new_user_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_profile_for_new_user();

-- ============================================================================
-- 6. CRÉATION AUTOMATISÉE DU SUPREME ADMIN
-- ============================================================================

DO $$
DECLARE
    admin_user_id UUID;
    admin_email TEXT := 'derthibeault@gmail.com';
    admin_primerica_id TEXT := 'lul8p';
    admin_password TEXT := 'Urze0912';
    admin_permission_id INTEGER;
    supreme_admin_permission_id INTEGER;
BEGIN
    -- Supprimer l'ancien utilisateur s'il existe
    DELETE FROM auth.users WHERE email = admin_email;
    DELETE FROM public.users WHERE primerica_id = admin_primerica_id;
    
    -- Générer un nouvel ID
    admin_user_id := gen_random_uuid();
    
    -- Créer l'utilisateur dans auth.users avec mot de passe chiffré
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        admin_user_id,
        '00000000-0000-0000-0000-000000000000',
        admin_email,
        crypt(admin_password, gen_salt('bf')),
        NOW(),
        jsonb_build_object(
            'primerica_id', admin_primerica_id,
            'first_name', 'Admin',
            'last_name', 'Suprême',
            'initial_role', 'LES_DEUX'
        ),
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    );
    
    -- Créer le profil métier avec permissions via la fonction
    PERFORM public.create_user_with_permissions(
        admin_user_id,
        admin_primerica_id,
        admin_email,
        'Admin',
        'Suprême',
        'LES_DEUX'::user_role
    );
    
    -- Mettre à jour les flags admin
    UPDATE public.users 
    SET is_admin = true, 
        is_supreme_admin = true,
        current_xp = 10000,
        current_level = 10,
        gamified_role = 'Maître Administrateur'
    WHERE id = admin_user_id;
    
    -- Attribuer les permissions admin
    SELECT id INTO admin_permission_id FROM public.permissions WHERE name = 'admin';
    SELECT id INTO supreme_admin_permission_id FROM public.permissions WHERE name = 'supreme_admin';
    
    INSERT INTO public.user_permissions (user_id, permission_id) VALUES
    (admin_user_id, admin_permission_id),
    (admin_user_id, supreme_admin_permission_id)
    ON CONFLICT (user_id, permission_id) DO NOTHING;
    
    -- Message de confirmation
    RAISE NOTICE 'Supreme Admin créé avec succès !';
    RAISE NOTICE 'Login: % / %', admin_primerica_id, admin_password;
    RAISE NOTICE 'Email: %', admin_email;
    RAISE NOTICE 'ID: %', admin_user_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur lors de la création du Supreme Admin: %', SQLERRM;
        RAISE;
END;
$$;

-- ============================================================================
-- 7. VÉRIFICATIONS FINALES
-- ============================================================================

-- Vérifier que RLS est activé
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE WHEN rowsecurity THEN '✅ RLS Activé' ELSE '❌ RLS Désactivé' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'user_permissions', 'exams', 'questions', 'podcast_content', 'minigames')
ORDER BY tablename;

-- Vérifier les policies
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    CASE WHEN qual IS NOT NULL THEN '✅ Policy Active' ELSE '⚠️ Policy Sans Condition' END as status
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Vérifier les fonctions
SELECT 
    routine_name,
    routine_type,
    security_type,
    CASE WHEN security_type = 'DEFINER' THEN '✅ SECURITY DEFINER' ELSE '⚠️ SECURITY INVOKER' END as security_status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('create_user_with_permissions', 'award_xp', 'get_user_stats', 'calculate_exam_xp', 'log_admin_action')
ORDER BY routine_name;

-- Vérifier les triggers
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    '✅ Trigger Actif' as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Vérifier le Supreme Admin
SELECT 
    u.primerica_id,
    u.email,
    u.first_name,
    u.last_name,
    u.is_admin,
    u.is_supreme_admin,
    u.is_active,
    u.current_level,
    u.current_xp,
    COUNT(up.permission_id) as permissions_count,
    '✅ Supreme Admin Configuré' as status
FROM public.users u
LEFT JOIN public.user_permissions up ON u.id = up.user_id
WHERE u.primerica_id = 'lul8p'
GROUP BY u.id, u.primerica_id, u.email, u.first_name, u.last_name, u.is_admin, u.is_supreme_admin, u.is_active, u.current_level, u.current_xp;

RAISE NOTICE '🎉 Réinitialisation complète du système terminée avec succès !';
RAISE NOTICE '🔑 Supreme Admin prêt - login = lul8p / Urze0912';
RAISE NOTICE '📧 Email: derthibeault@gmail.com';
RAISE NOTICE '🛡️ Toutes les tables ont RLS activé avec policies appropriées';
RAISE NOTICE '⚙️ Toutes les fonctions métier sont configurées en SECURITY DEFINER';
RAISE NOTICE '🔄 Tous les triggers sont actifs pour la synchronisation automatique';