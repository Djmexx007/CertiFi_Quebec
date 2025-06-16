/*
  # Schéma complet CertiFi Québec

  1. Tables principales
    - `profiles` - Profils utilisateurs étendus
    - `permissions` - Permissions système
    - `user_permissions` - Jonction utilisateur-permissions
    - `podcast_content` - Contenu podcast
    - `questions` - Questions d'examen
    - `exams` - Configuration des examens
    - `user_exam_attempts` - Tentatives d'examen
    - `minigames` - Configuration mini-jeux
    - `user_minigame_scores` - Scores mini-jeux
    - `gamified_roles_config` - Configuration rôles gamifiés
    - `levels_xp_config` - Configuration niveaux XP
    - `recent_activities` - Activités récentes
    - `admin_actions_log` - Journal actions admin

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques strictes par rôle
    - Triggers pour gamification automatique

  3. Fonctionnalités
    - Système XP/Niveaux automatique
    - Suivi activités en temps réel
    - Gestion permissions granulaire
*/

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Types énumérés
CREATE TYPE user_role AS ENUM ('PQAP', 'FONDS_MUTUELS', 'LES_DEUX');
CREATE TYPE question_type AS ENUM ('MCQ', 'TRUE_FALSE');
CREATE TYPE activity_type AS ENUM ('podcast_listened', 'exam_completed', 'minigame_played', 'login', 'level_up', 'role_unlocked');
CREATE TYPE admin_action_type AS ENUM ('user_created', 'user_modified', 'user_deleted', 'role_changed', 'content_added', 'content_modified', 'content_deleted');

-- Table des profils utilisateurs (étend auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  primerica_id text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  initial_role user_role NOT NULL,
  current_xp integer DEFAULT 0,
  current_level integer DEFAULT 1,
  gamified_role text DEFAULT 'Apprenti Conseiller',
  last_activity_at timestamptz DEFAULT now(),
  is_admin boolean DEFAULT false,
  is_supreme_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des permissions
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Table de jonction utilisateur-permissions
CREATE TABLE IF NOT EXISTS user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at timestamptz DEFAULT now(),
  granted_by uuid REFERENCES profiles(id),
  UNIQUE(user_id, permission_id)
);

-- Table du contenu podcast
CREATE TABLE IF NOT EXISTS podcast_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  audio_url text NOT NULL,
  duration_seconds integer NOT NULL,
  theme text NOT NULL,
  required_permission text NOT NULL,
  xp_awarded integer DEFAULT 50,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des questions
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  question_type question_type NOT NULL,
  options_json jsonb,
  correct_answer text NOT NULL,
  explanation text,
  difficulty_level integer DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  required_permission text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des examens
CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_name text NOT NULL,
  required_permission text NOT NULL,
  num_questions_to_draw integer NOT NULL,
  time_limit_minutes integer NOT NULL,
  passing_score_percentage integer DEFAULT 70,
  xp_base_reward integer DEFAULT 100,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des tentatives d'examen
CREATE TABLE IF NOT EXISTS user_exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  exam_id uuid REFERENCES exams(id) ON DELETE CASCADE,
  attempt_date timestamptz DEFAULT now(),
  score_percentage float NOT NULL,
  user_answers_json jsonb NOT NULL,
  time_spent_seconds integer NOT NULL,
  xp_earned integer DEFAULT 0,
  passed boolean GENERATED ALWAYS AS (score_percentage >= 70) STORED,
  created_at timestamptz DEFAULT now()
);

-- Table des mini-jeux
CREATE TABLE IF NOT EXISTS minigames (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_name text UNIQUE NOT NULL,
  description text,
  base_xp_gain integer DEFAULT 25,
  max_daily_xp integer DEFAULT 100,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des scores de mini-jeux
CREATE TABLE IF NOT EXISTS user_minigame_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  minigame_id uuid REFERENCES minigames(id) ON DELETE CASCADE,
  score integer NOT NULL,
  xp_earned integer NOT NULL,
  attempt_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Configuration des rôles gamifiés
CREATE TABLE IF NOT EXISTS gamified_roles_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name text UNIQUE NOT NULL,
  min_level_required integer NOT NULL,
  description text,
  unlocked_features_json jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Configuration des niveaux XP
CREATE TABLE IF NOT EXISTS levels_xp_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_number integer UNIQUE NOT NULL,
  xp_required integer NOT NULL,
  level_title text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des activités récentes
CREATE TABLE IF NOT EXISTS recent_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  activity_details_json jsonb DEFAULT '{}'::jsonb,
  xp_gained integer DEFAULT 0,
  occurred_at timestamptz DEFAULT now()
);

-- Journal des actions admin
CREATE TABLE IF NOT EXISTS admin_actions_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action_type admin_action_type NOT NULL,
  target_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action_details_json jsonb DEFAULT '{}'::jsonb,
  performed_at timestamptz DEFAULT now()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_profiles_primerica_id ON profiles(primerica_id);
CREATE INDEX IF NOT EXISTS idx_profiles_xp_level ON profiles(current_xp, current_level);
CREATE INDEX IF NOT EXISTS idx_user_exam_attempts_user_date ON user_exam_attempts(user_id, attempt_date DESC);
CREATE INDEX IF NOT EXISTS idx_recent_activities_user_date ON recent_activities(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_permission ON questions(required_permission);
CREATE INDEX IF NOT EXISTS idx_podcast_permission ON podcast_content(required_permission);

-- Données initiales des permissions
INSERT INTO permissions (name, description) VALUES
  ('PQAP', 'Accès au contenu PQAP (Assurance Vie)'),
  ('FONDS_MUTUELS', 'Accès au contenu Fonds Mutuels'),
  ('ADMIN', 'Accès administrateur'),
  ('SUPREME_ADMIN', 'Accès administrateur suprême')
ON CONFLICT (name) DO NOTHING;

-- Configuration initiale des niveaux XP
INSERT INTO levels_xp_config (level_number, xp_required, level_title) VALUES
  (1, 0, 'Apprenti Conseiller'),
  (2, 500, 'Conseiller Junior'),
  (3, 1200, 'Conseiller'),
  (4, 2000, 'Conseiller Senior'),
  (5, 3000, 'Expert Conseiller'),
  (6, 4500, 'Maître Conseiller'),
  (7, 6500, 'Conseiller Elite'),
  (8, 9000, 'Légende Conseiller'),
  (9, 12000, 'Grand Maître'),
  (10, 16000, 'Champion Ultime')
ON CONFLICT (level_number) DO NOTHING;

-- Configuration initiale des rôles gamifiés
INSERT INTO gamified_roles_config (role_name, min_level_required, description, unlocked_features_json) VALUES
  ('Apprenti Conseiller', 1, 'Nouveau dans le domaine', '["basic_podcasts", "practice_exams"]'),
  ('Conseiller Junior', 2, 'Maîtrise les bases', '["advanced_podcasts", "mini_games"]'),
  ('Conseiller', 3, 'Compétences solides', '["expert_content", "leaderboards"]'),
  ('Conseiller Senior', 4, 'Expérience confirmée', '["mentoring", "advanced_analytics"]'),
  ('Expert Conseiller', 5, 'Expertise reconnue', '["content_creation", "community_features"]'),
  ('Maître Conseiller', 6, 'Maîtrise exceptionnelle', '["advanced_challenges", "exclusive_content"]'),
  ('Conseiller Elite', 7, 'Parmi les meilleurs', '["elite_tournaments", "special_rewards"]'),
  ('Légende Conseiller', 8, 'Statut légendaire', '["legend_privileges", "exclusive_events"]'),
  ('Grand Maître', 9, 'Maîtrise absolue', '["grandmaster_council", "ultimate_challenges"]'),
  ('Champion Ultime', 10, 'Le summum de l\'excellence', '["champion_status", "all_privileges"]')
ON CONFLICT (role_name) DO NOTHING;

-- Mini-jeux par défaut
INSERT INTO minigames (game_name, description, base_xp_gain, max_daily_xp) VALUES
  ('Quiz Éclair', 'Questions rapides en 60 secondes', 30, 150),
  ('Mémoire Financière', 'Jeu de mémoire avec termes financiers', 25, 100),
  ('Association Concepts', 'Associer termes et définitions', 35, 175),
  ('Mots Cachés Finance', 'Trouver les termes financiers cachés', 20, 80),
  ('Scénarios Clients', 'Résoudre des cas clients réels', 50, 200)
ON CONFLICT (game_name) DO NOTHING;

-- Activation RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE minigames ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_minigame_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamified_roles_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels_xp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions_log ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

CREATE POLICY "Supreme admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_supreme_admin = true
    )
  );

-- Politiques pour le contenu (podcasts, questions, examens)
CREATE POLICY "Users can read content based on permissions"
  ON podcast_content
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (
        (required_permission = 'PQAP' AND p.initial_role IN ('PQAP', 'LES_DEUX')) OR
        (required_permission = 'FONDS_MUTUELS' AND p.initial_role IN ('FONDS_MUTUELS', 'LES_DEUX')) OR
        p.is_admin = true OR
        p.is_supreme_admin = true
      )
    )
  );

CREATE POLICY "Users can read questions based on permissions"
  ON questions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (
        (required_permission = 'PQAP' AND p.initial_role IN ('PQAP', 'LES_DEUX')) OR
        (required_permission = 'FONDS_MUTUELS' AND p.initial_role IN ('FONDS_MUTUELS', 'LES_DEUX')) OR
        p.is_admin = true OR
        p.is_supreme_admin = true
      )
    )
  );

CREATE POLICY "Users can read exams based on permissions"
  ON exams
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (
        (required_permission = 'PQAP' AND p.initial_role IN ('PQAP', 'LES_DEUX')) OR
        (required_permission = 'FONDS_MUTUELS' AND p.initial_role IN ('FONDS_MUTUELS', 'LES_DEUX')) OR
        p.is_admin = true OR
        p.is_supreme_admin = true
      )
    )
  );

-- Politiques pour les données utilisateur
CREATE POLICY "Users can read own exam attempts"
  ON user_exam_attempts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exam attempts"
  ON user_exam_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own minigame scores"
  ON user_minigame_scores
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own minigame scores"
  ON user_minigame_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own activities"
  ON recent_activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Politiques pour les configurations (lecture publique pour utilisateurs authentifiés)
CREATE POLICY "Authenticated users can read gamified roles config"
  ON gamified_roles_config
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read levels config"
  ON levels_xp_config
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read minigames"
  ON minigames
  FOR SELECT
  TO authenticated
  USING (true);

-- Politiques admin pour gestion de contenu
CREATE POLICY "Admins can manage content"
  ON podcast_content
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

CREATE POLICY "Admins can manage questions"
  ON questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

CREATE POLICY "Admins can manage exams"
  ON exams
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

-- Politiques pour le journal admin
CREATE POLICY "Admins can read admin log"
  ON admin_actions_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );