/*
# Migration Baseline Complète - CertiFi Québec

Cette migration crée la structure complète de la base de données depuis zéro.

## Contenu :
1. Nettoyage de l'existant
2. Types ENUM
3. Tables principales
4. Politiques RLS
5. Fonctions PostgreSQL
6. Données d'exemple
7. Triggers

## Ordre d'exécution :
- Types → Tables → Policies → Functions → Data → Triggers
*/

-- =====================================================
-- 1. NETTOYAGE DE L'EXISTANT
-- =====================================================

-- Supprimer les triggers
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_podcast_content_updated_at ON podcast_content;
DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
DROP TRIGGER IF EXISTS update_exams_updated_at ON exams;
DROP TRIGGER IF EXISTS update_minigames_updated_at ON minigames;

-- Supprimer les politiques RLS
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Supreme admins can manage users" ON users;
DROP POLICY IF EXISTS "Users can read own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can manage permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can read active podcasts" ON podcast_content;
DROP POLICY IF EXISTS "Admins can manage podcasts" ON podcast_content;
DROP POLICY IF EXISTS "Users can read active questions" ON questions;
DROP POLICY IF EXISTS "Admins can manage questions" ON questions;
DROP POLICY IF EXISTS "Users can read active exams" ON exams;
DROP POLICY IF EXISTS "Admins can manage exams" ON exams;
DROP POLICY IF EXISTS "Users can read own exam attempts" ON user_exam_attempts;
DROP POLICY IF EXISTS "Users can create exam attempts" ON user_exam_attempts;
DROP POLICY IF EXISTS "Admins can read all exam attempts" ON user_exam_attempts;
DROP POLICY IF EXISTS "Users can read active minigames" ON minigames;
DROP POLICY IF EXISTS "Admins can manage minigames" ON minigames;
DROP POLICY IF EXISTS "Users can read own minigame scores" ON user_minigame_scores;
DROP POLICY IF EXISTS "Users can create minigame scores" ON user_minigame_scores;
DROP POLICY IF EXISTS "Admins can read all minigame scores" ON user_minigame_scores;
DROP POLICY IF EXISTS "Users can read own activities" ON recent_activities;
DROP POLICY IF EXISTS "Admins can read all activities" ON recent_activities;
DROP POLICY IF EXISTS "System can create activities" ON recent_activities;
DROP POLICY IF EXISTS "Admins can read admin logs" ON admin_logs;
DROP POLICY IF EXISTS "System can create admin logs" ON admin_logs;

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS create_user_with_permissions(uuid, text, text, text, text, user_role);
DROP FUNCTION IF EXISTS toggle_demo_users(boolean);
DROP FUNCTION IF EXISTS award_xp(uuid, integer, activity_type, jsonb);
DROP FUNCTION IF EXISTS calculate_level_from_xp(integer);
DROP FUNCTION IF EXISTS get_gamified_role(integer);
DROP FUNCTION IF EXISTS get_user_stats(uuid);
DROP FUNCTION IF EXISTS calculate_exam_xp(integer, float, integer, integer);
DROP FUNCTION IF EXISTS user_has_permission(uuid, text);
DROP FUNCTION IF EXISTS cleanup_old_activities();
DROP FUNCTION IF EXISTS log_admin_action(uuid, text, text, text, jsonb, text, text);
DROP FUNCTION IF EXISTS create_profile_for_new_user();
DROP FUNCTION IF EXISTS update_updated_at();

-- Supprimer les tables (ordre inverse des dépendances)
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS recent_activities CASCADE;
DROP TABLE IF EXISTS user_minigame_scores CASCADE;
DROP TABLE IF EXISTS user_exam_attempts CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS minigames CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS podcast_content CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS gamified_roles_config CASCADE;
DROP TABLE IF EXISTS levels_xp_config CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Supprimer les types ENUM
DROP TYPE IF EXISTS activity_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- =====================================================
-- 2. CRÉATION DES TYPES ENUM
-- =====================================================

-- Type pour les rôles utilisateur
CREATE TYPE user_role AS ENUM (
  'PQAP',
  'FONDS_MUTUELS', 
  'LES_DEUX'
);

-- Type pour les activités
CREATE TYPE activity_type AS ENUM (
  'login',
  'logout',
  'podcast_listened',
  'exam_started',
  'exam_completed',
  'minigame_played',
  'level_up',
  'admin_award',
  'profile_updated',
  'password_changed'
);

-- =====================================================
-- 3. CRÉATION DES TABLES PRINCIPALES
-- =====================================================

-- Table de configuration des niveaux XP
CREATE TABLE IF NOT EXISTS levels_xp_config (
  level_number integer PRIMARY KEY,
  xp_required integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table de configuration des rôles gamifiés
CREATE TABLE IF NOT EXISTS gamified_roles_config (
  id serial PRIMARY KEY,
  role_name text NOT NULL,
  min_level_required integer NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Table des permissions
CREATE TABLE IF NOT EXISTS permissions (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Table principale des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  primerica_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  initial_role user_role NOT NULL,
  current_xp integer DEFAULT 0,
  current_level integer DEFAULT 1,
  gamified_role text DEFAULT 'Apprenti Conseiller',
  is_admin boolean DEFAULT false,
  is_supreme_admin boolean DEFAULT false,
  is_active boolean DEFAULT true,
  avatar_url text,
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT positive_xp CHECK (current_xp >= 0),
  CONSTRAINT positive_level CHECK (current_level >= 1)
);

-- Table des permissions utilisateur
CREATE TABLE IF NOT EXISTS user_permissions (
  id serial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_id integer NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES users(id),
  granted_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, permission_id)
);

-- Table du contenu podcast
CREATE TABLE IF NOT EXISTS podcast_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  audio_url text,
  duration_seconds integer,
  theme text,
  required_permission text NOT NULL,
  xp_awarded integer DEFAULT 0,
  source_document_ref text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT positive_duration CHECK (duration_seconds > 0),
  CONSTRAINT positive_xp CHECK (xp_awarded >= 0)
);

-- Table des questions
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'MCQ',
  options_json jsonb,
  correct_answer_key text NOT NULL,
  explanation text,
  difficulty_level integer DEFAULT 1,
  required_permission text NOT NULL,
  source_document_ref text NOT NULL,
  chapter_reference text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_difficulty CHECK (difficulty_level BETWEEN 1 AND 5),
  CONSTRAINT valid_question_type CHECK (question_type IN ('MCQ', 'TRUE_FALSE', 'SHORT_ANSWER'))
);

-- Table des examens
CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_name text NOT NULL,
  description text,
  required_permission text NOT NULL,
  num_questions_to_draw integer NOT NULL,
  time_limit_minutes integer NOT NULL,
  passing_score_percentage float NOT NULL,
  xp_base_reward integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT positive_questions CHECK (num_questions_to_draw > 0),
  CONSTRAINT positive_time_limit CHECK (time_limit_minutes > 0),
  CONSTRAINT valid_passing_score CHECK (passing_score_percentage BETWEEN 0 AND 100),
  CONSTRAINT positive_xp_reward CHECK (xp_base_reward >= 0)
);

-- Table des tentatives d'examen
CREATE TABLE IF NOT EXISTS user_exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  attempt_date timestamptz DEFAULT now(),
  score_percentage float NOT NULL,
  user_answers_json jsonb,
  time_spent_seconds integer NOT NULL,
  xp_earned integer DEFAULT 0,
  passed boolean GENERATED ALWAYS AS (score_percentage >= 70) STORED,
  
  CONSTRAINT valid_score CHECK (score_percentage BETWEEN 0 AND 100),
  CONSTRAINT positive_time_spent CHECK (time_spent_seconds > 0),
  CONSTRAINT positive_xp_earned CHECK (xp_earned >= 0)
);

-- Table des mini-jeux
CREATE TABLE IF NOT EXISTS minigames (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_name text NOT NULL,
  description text,
  game_type text NOT NULL,
  base_xp_gain integer DEFAULT 0,
  max_daily_xp integer DEFAULT 100,
  required_permission text NOT NULL,
  game_config_json jsonb DEFAULT '{}',
  source_document_ref text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT positive_base_xp CHECK (base_xp_gain >= 0),
  CONSTRAINT positive_max_daily_xp CHECK (max_daily_xp >= 0)
);

-- Table des scores de mini-jeux
CREATE TABLE IF NOT EXISTS user_minigame_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  minigame_id uuid NOT NULL REFERENCES minigames(id) ON DELETE CASCADE,
  score integer NOT NULL,
  max_possible_score integer,
  xp_earned integer DEFAULT 0,
  attempt_date timestamptz DEFAULT now(),
  game_session_data jsonb DEFAULT '{}',
  
  CONSTRAINT positive_score CHECK (score >= 0),
  CONSTRAINT positive_xp_earned CHECK (xp_earned >= 0)
);

-- Table des activités récentes
CREATE TABLE IF NOT EXISTS recent_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  activity_details_json jsonb DEFAULT '{}',
  xp_gained integer DEFAULT 0,
  occurred_at timestamptz DEFAULT now(),
  
  CONSTRAINT positive_xp_gained CHECK (xp_gained >= 0)
);

-- Table des logs administrateur
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  target_entity text,
  target_id text,
  details_json jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  occurred_at timestamptz DEFAULT now()
);

-- =====================================================
-- 4. ACTIVATION DE RLS ET CRÉATION DES POLITIQUES
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE minigames ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_minigame_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table users
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

CREATE POLICY "Supreme admins can manage users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND is_supreme_admin = true
    )
  );

-- Politiques pour user_permissions
CREATE POLICY "Users can read own permissions"
  ON user_permissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage permissions"
  ON user_permissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

-- Politiques pour podcast_content
CREATE POLICY "Users can read active podcasts"
  ON podcast_content FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage podcasts"
  ON podcast_content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

-- Politiques pour questions
CREATE POLICY "Users can read active questions"
  ON questions FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage questions"
  ON questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

-- Politiques pour exams
CREATE POLICY "Users can read active exams"
  ON exams FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage exams"
  ON exams FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

-- Politiques pour user_exam_attempts
CREATE POLICY "Users can read own exam attempts"
  ON user_exam_attempts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create exam attempts"
  ON user_exam_attempts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all exam attempts"
  ON user_exam_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

-- Politiques pour minigames
CREATE POLICY "Users can read active minigames"
  ON minigames FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage minigames"
  ON minigames FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

-- Politiques pour user_minigame_scores
CREATE POLICY "Users can read own minigame scores"
  ON user_minigame_scores FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create minigame scores"
  ON user_minigame_scores FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all minigame scores"
  ON user_minigame_scores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

-- Politiques pour recent_activities
CREATE POLICY "Users can read own activities"
  ON recent_activities FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all activities"
  ON recent_activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

CREATE POLICY "System can create activities"
  ON recent_activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Politiques pour admin_logs
CREATE POLICY "Admins can read admin logs"
  ON admin_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

CREATE POLICY "System can create admin logs"
  ON admin_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- 5. CRÉATION DES FONCTIONS POSTGRESQL
-- =====================================================

-- Fonction pour calculer le niveau basé sur l'XP
CREATE OR REPLACE FUNCTION calculate_level_from_xp(xp_amount integer)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  calculated_level integer := 1;
BEGIN
  -- Formule simple : 1000 XP par niveau
  calculated_level := GREATEST(1, (xp_amount / 1000) + 1);
  
  RETURN calculated_level;
END;
$$;

-- Fonction pour obtenir le rôle gamifié basé sur le niveau
CREATE OR REPLACE FUNCTION get_gamified_role(level_num integer)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  CASE 
    WHEN level_num >= 10 THEN RETURN 'Maître Conseiller';
    WHEN level_num >= 8 THEN RETURN 'Conseiller Expert';
    WHEN level_num >= 6 THEN RETURN 'Conseiller Confirmé';
    WHEN level_num >= 4 THEN RETURN 'Conseiller Intermédiaire';
    WHEN level_num >= 2 THEN RETURN 'Conseiller Débutant';
    ELSE RETURN 'Apprenti Conseiller';
  END CASE;
END;
$$;

-- Fonction pour attribuer de l'XP et mettre à jour le niveau
CREATE OR REPLACE FUNCTION award_xp(
  user_uuid uuid,
  xp_amount integer,
  activity_type_param activity_type,
  activity_details jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_level integer;
  new_level integer;
  old_xp integer;
  new_xp integer;
  new_role text;
  level_up_occurred boolean := false;
  result jsonb;
BEGIN
  -- Vérifier que l'utilisateur existe
  SELECT current_level, current_xp
  INTO old_level, old_xp
  FROM users
  WHERE id = user_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utilisateur non trouvé: %', user_uuid;
  END IF;
  
  -- Calculer le nouveau XP
  new_xp := old_xp + xp_amount;
  
  -- Calculer le nouveau niveau
  new_level := calculate_level_from_xp(new_xp);
  
  -- Vérifier si montée de niveau
  IF new_level > old_level THEN
    level_up_occurred := true;
  END IF;
  
  -- Obtenir le nouveau rôle gamifié
  new_role := get_gamified_role(new_level);
  
  -- Mettre à jour le profil
  UPDATE users
  SET 
    current_xp = new_xp,
    current_level = new_level,
    gamified_role = new_role,
    last_activity_at = now(),
    updated_at = now()
  WHERE id = user_uuid;
  
  -- Enregistrer l'activité
  INSERT INTO recent_activities (user_id, activity_type, activity_details_json, xp_gained, occurred_at)
  VALUES (user_uuid, activity_type_param, activity_details, xp_amount, now());
  
  -- Si niveau augmenté, enregistrer l'activité de montée de niveau
  IF level_up_occurred THEN
    INSERT INTO recent_activities (user_id, activity_type, activity_details_json, xp_gained, occurred_at)
    VALUES (
      user_uuid, 
      'level_up'::activity_type, 
      jsonb_build_object(
        'old_level', old_level,
        'new_level', new_level,
        'new_role', new_role
      ), 
      0, 
      now()
    );
  END IF;
  
  -- Construire le résultat
  result := jsonb_build_object(
    'old_xp', old_xp,
    'new_xp', new_xp,
    'xp_gained', xp_amount,
    'old_level', old_level,
    'new_level', new_level,
    'level_up_occurred', level_up_occurred,
    'new_role', new_role
  );
  
  RETURN result;
END;
$$;

-- Fonction pour créer un utilisateur avec permissions
CREATE OR REPLACE FUNCTION create_user_with_permissions(
  user_id uuid,
  primerica_id_param text,
  email_param text,
  first_name_param text,
  last_name_param text,
  initial_role_param user_role
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Créer le profil utilisateur
  INSERT INTO users (
    id,
    primerica_id,
    email,
    first_name,
    last_name,
    initial_role,
    current_xp,
    current_level,
    gamified_role
  ) VALUES (
    user_id,
    primerica_id_param,
    email_param,
    first_name_param,
    last_name_param,
    initial_role_param,
    0,
    1,
    'Apprenti Conseiller'
  );
  
  -- Attribuer les permissions basées sur le rôle
  IF initial_role_param = 'PQAP' THEN
    INSERT INTO user_permissions (user_id, permission_id)
    SELECT user_id, id FROM permissions WHERE name = 'pqap';
  ELSIF initial_role_param = 'FONDS_MUTUELS' THEN
    INSERT INTO user_permissions (user_id, permission_id)
    SELECT user_id, id FROM permissions WHERE name = 'fonds_mutuels';
  ELSIF initial_role_param = 'LES_DEUX' THEN
    INSERT INTO user_permissions (user_id, permission_id)
    SELECT user_id, id FROM permissions WHERE name IN ('pqap', 'fonds_mutuels');
  END IF;
  
  result := jsonb_build_object(
    'user_id', user_id,
    'primerica_id', primerica_id_param,
    'role', initial_role_param,
    'message', 'Utilisateur créé avec succès'
  );
  
  RETURN result;
END;
$$;

-- Fonction pour obtenir les statistiques utilisateur
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_exams', COALESCE(COUNT(DISTINCT uea.id), 0),
    'passed_exams', COALESCE(COUNT(DISTINCT CASE WHEN uea.passed THEN uea.id END), 0),
    'failed_exams', COALESCE(COUNT(DISTINCT CASE WHEN NOT uea.passed THEN uea.id END), 0),
    'average_score', COALESCE(ROUND(AVG(uea.score_percentage), 2), 0),
    'total_podcasts_listened', COALESCE(COUNT(DISTINCT CASE WHEN ra.activity_type = 'podcast_listened' THEN ra.id END), 0),
    'total_minigames_played', COALESCE(COUNT(DISTINCT CASE WHEN ra.activity_type = 'minigame_played' THEN ra.id END), 0),
    'current_streak', 0,
    'rank_position', 1
  ) INTO stats
  FROM users u
  LEFT JOIN user_exam_attempts uea ON u.id = uea.user_id
  LEFT JOIN recent_activities ra ON u.id = ra.user_id
  WHERE u.id = user_uuid
  GROUP BY u.id;
  
  RETURN COALESCE(stats, jsonb_build_object(
    'total_exams', 0,
    'passed_exams', 0,
    'failed_exams', 0,
    'average_score', 0,
    'total_podcasts_listened', 0,
    'total_minigames_played', 0,
    'current_streak', 0,
    'rank_position', 1
  ));
END;
$$;

-- Fonction pour calculer l'XP d'un examen basé sur la performance
CREATE OR REPLACE FUNCTION calculate_exam_xp(
  base_xp integer,
  score_percentage float,
  time_spent_seconds integer,
  time_limit_seconds integer
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  calculated_xp integer;
  time_bonus float := 0;
  score_multiplier float := 1;
BEGIN
  -- Bonus basé sur le score
  IF score_percentage >= 95 THEN
    score_multiplier := 1.5;
  ELSIF score_percentage >= 85 THEN
    score_multiplier := 1.3;
  ELSIF score_percentage >= 75 THEN
    score_multiplier := 1.1;
  ELSIF score_percentage < 70 THEN
    score_multiplier := 0.5;
  END IF;
  
  -- Bonus de temps (si terminé rapidement)
  IF time_spent_seconds < (time_limit_seconds * 0.75) THEN
    time_bonus := 0.2;
  ELSIF time_spent_seconds < (time_limit_seconds * 0.9) THEN
    time_bonus := 0.1;
  END IF;
  
  calculated_xp := ROUND(base_xp * score_multiplier * (1 + time_bonus));
  
  RETURN GREATEST(calculated_xp, 0);
END;
$$;

-- Fonction pour vérifier les permissions utilisateur
CREATE OR REPLACE FUNCTION user_has_permission(user_uuid uuid, permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_permission boolean := false;
BEGIN
  -- Vérifier si l'utilisateur est admin suprême
  SELECT is_supreme_admin INTO has_permission
  FROM users
  WHERE id = user_uuid;
  
  IF has_permission THEN
    RETURN true;
  END IF;
  
  -- Vérifier si l'utilisateur est admin et demande une permission admin
  IF permission_name IN ('admin', 'supreme_admin') THEN
    SELECT (is_admin OR is_supreme_admin) INTO has_permission
    FROM users
    WHERE id = user_uuid;
    
    RETURN has_permission;
  END IF;
  
  -- Vérifier les permissions spécifiques
  SELECT EXISTS(
    SELECT 1
    FROM user_permissions up
    JOIN permissions p ON up.permission_id = p.id
    WHERE up.user_id = user_uuid AND p.name = permission_name
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$;

-- Fonction pour nettoyer les anciennes activités
CREATE OR REPLACE FUNCTION cleanup_old_activities()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Garder seulement les 50 dernières activités par utilisateur
  DELETE FROM recent_activities
  WHERE id NOT IN (
    SELECT id
    FROM (
      SELECT id,
             ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY occurred_at DESC) as rn
      FROM recent_activities
    ) ranked
    WHERE rn <= 50
  );
END;
$$;

-- Fonction pour logger les actions admin
CREATE OR REPLACE FUNCTION log_admin_action(
  admin_id uuid,
  action_type_param text,
  target_entity_param text DEFAULT NULL,
  target_id_param text DEFAULT NULL,
  details_param jsonb DEFAULT '{}'::jsonb,
  ip_address_param text DEFAULT NULL,
  user_agent_param text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO admin_logs (
    admin_user_id,
    action_type,
    target_entity,
    target_id,
    details_json,
    ip_address,
    user_agent,
    occurred_at
  ) VALUES (
    admin_id,
    action_type_param,
    target_entity_param,
    target_id_param,
    details_param,
    ip_address_param,
    user_agent_param,
    now()
  );
END;
$$;

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  primerica_number text;
  user_first_name text;
  user_last_name text;
  user_role user_role;
BEGIN
  -- Extraire les données du metadata
  primerica_number := NEW.raw_user_meta_data->>'primerica_id';
  user_first_name := NEW.raw_user_meta_data->>'first_name';
  user_last_name := NEW.raw_user_meta_data->>'last_name';
  user_role := (NEW.raw_user_meta_data->>'initial_role')::user_role;
  
  -- Vérifier que les données requises sont présentes
  IF primerica_number IS NULL OR user_first_name IS NULL OR user_last_name IS NULL OR user_role IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Créer le profil via la fonction dédiée
  PERFORM create_user_with_permissions(
    NEW.id,
    primerica_number,
    NEW.email,
    user_first_name,
    user_last_name,
    user_role
  );
  
  RETURN NEW;
END;
$$;

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================
-- 6. INSERTION DES DONNÉES D'EXEMPLE
-- =====================================================

-- Configuration des niveaux XP
INSERT INTO levels_xp_config (level_number, xp_required) VALUES
(1, 0),
(2, 1000),
(3, 2000),
(4, 3000),
(5, 4000),
(6, 5000),
(7, 6000),
(8, 7000),
(9, 8000),
(10, 9000)
ON CONFLICT (level_number) DO NOTHING;

-- Configuration des rôles gamifiés
INSERT INTO gamified_roles_config (role_name, min_level_required, description) VALUES
('Apprenti Conseiller', 1, 'Nouveau dans le domaine'),
('Conseiller Débutant', 2, 'Premières expériences'),
('Conseiller Intermédiaire', 4, 'Expérience solide'),
('Conseiller Confirmé', 6, 'Expertise reconnue'),
('Conseiller Expert', 8, 'Maîtrise avancée'),
('Maître Conseiller', 10, 'Excellence professionnelle')
ON CONFLICT DO NOTHING;

-- Permissions de base
INSERT INTO permissions (name, description) VALUES
('pqap', 'Accès aux contenus PQAP'),
('fonds_mutuels', 'Accès aux contenus Fonds Mutuels'),
('admin', 'Droits administrateur'),
('supreme_admin', 'Droits administrateur suprême')
ON CONFLICT (name) DO NOTHING;

-- Contenu podcast d'exemple
INSERT INTO podcast_content (title, description, duration_seconds, theme, required_permission, xp_awarded, source_document_ref) VALUES
('Introduction à la Déontologie PQAP', 'Les bases de la déontologie pour les conseillers PQAP', 1800, 'Déontologie', 'pqap', 50, 'F311-Ch1'),
('Gestion des Fonds Mutuels', 'Stratégies avancées de gestion de portefeuille', 2400, 'Investissement', 'fonds_mutuels', 75, 'F312-Ch3'),
('Éthique et Responsabilité', 'Principes éthiques dans le conseil financier', 2100, 'Éthique', 'pqap', 60, 'F311-Ch2')
ON CONFLICT DO NOTHING;

-- Questions d'exemple
INSERT INTO questions (question_text, question_type, options_json, correct_answer_key, explanation, difficulty_level, required_permission, source_document_ref, chapter_reference) VALUES
('Quelle est la définition de la déontologie en assurance?', 'MCQ', 
 '{"A": "Un ensemble de règles morales", "B": "Une technique de vente", "C": "Un produit d''assurance", "D": "Une méthode de calcul"}', 
 'A', 'La déontologie représente l''ensemble des règles morales qui régissent une profession.', 2, 'pqap', 'F311-Ch1', 'Chapitre 1 - Concepts de base'),
('Un conseiller doit-il toujours agir dans l''intérêt de son client?', 'TRUE_FALSE', 
 '{"true": "Vrai", "false": "Faux"}', 
 'true', 'Le conseiller a l''obligation fiduciaire d''agir dans l''intérêt supérieur de son client.', 1, 'pqap', 'F311-Ch1', 'Chapitre 1 - Obligations'),
('Quel est le ratio de frais de gestion maximum pour un fonds équilibré?', 'MCQ', 
 '{"A": "1.5%", "B": "2.0%", "C": "2.5%", "D": "3.0%"}', 
 'C', 'Le ratio de frais de gestion maximum pour un fonds équilibré est de 2.5%.', 3, 'fonds_mutuels', 'F312-Ch2', 'Chapitre 2 - Frais de gestion')
ON CONFLICT DO NOTHING;

-- Examens d'exemple
INSERT INTO exams (exam_name, description, required_permission, num_questions_to_draw, time_limit_minutes, passing_score_percentage, xp_base_reward) VALUES
('Examen PQAP Simulé', 'Examen de certification PQAP avec 35 questions', 'pqap', 35, 90, 70, 200),
('Examen Fonds Mutuels', 'Examen de certification Fonds Mutuels avec 100 questions', 'fonds_mutuels', 100, 120, 75, 300),
('Quiz Déontologie', 'Quiz rapide sur les principes de déontologie', 'pqap', 10, 15, 80, 50)
ON CONFLICT DO NOTHING;

-- Mini-jeux d'exemple
INSERT INTO minigames (game_name, description, game_type, base_xp_gain, max_daily_xp, required_permission, source_document_ref) VALUES
('Quiz Interactif', 'Testez vos connaissances en déontologie', 'quiz', 25, 100, 'pqap', 'F311-General'),
('Jeu de Mémoire', 'Entraînez votre mémoire avec les concepts clés', 'memory', 20, 80, 'pqap', 'F311-General'),
('Simulation Portefeuille', 'Gérez un portefeuille virtuel', 'simulation', 30, 120, 'fonds_mutuels', 'F312-General')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. CRÉATION DES TRIGGERS
-- =====================================================

-- Trigger pour créer automatiquement un profil
CREATE OR REPLACE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_new_user();

-- Triggers pour mettre à jour updated_at automatiquement
CREATE OR REPLACE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_podcast_content_updated_at
  BEFORE UPDATE ON podcast_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON exams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_minigames_updated_at
  BEFORE UPDATE ON minigames
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- 8. CRÉATION D'INDEX POUR LES PERFORMANCES
-- =====================================================

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_users_primerica_id ON users(primerica_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_admin ON users(is_admin, is_supreme_admin);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exam_attempts_user_id ON user_exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exam_attempts_exam_id ON user_exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_recent_activities_user_id ON recent_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_activities_occurred_at ON recent_activities(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_user_id ON admin_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_occurred_at ON admin_logs(occurred_at DESC);

-- =====================================================
-- FIN DE LA MIGRATION BASELINE
-- =====================================================

-- Commentaire final
COMMENT ON SCHEMA public IS 'CertiFi Québec - Schema complet avec toutes les tables, fonctions et politiques RLS';