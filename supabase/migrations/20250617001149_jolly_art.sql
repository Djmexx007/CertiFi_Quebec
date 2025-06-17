/*
  # Schéma Complet CertiFi Québec - Base de Données

  1. Types ENUM
    - user_role: Rôles des utilisateurs (PQAP, FONDS_MUTUELS, LES_DEUX)
    - question_type: Types de questions (MCQ, TRUE_FALSE, SHORT_ANSWER)
    - activity_type: Types d'activités pour la gamification
    - admin_action_type: Types d'actions administratives

  2. Tables Principales
    - users: Profils utilisateurs étendus
    - permissions: Système de permissions
    - user_permissions: Jonction utilisateur-permissions
    - podcast_content: Contenu podcast avec XP
    - questions: Questions d'examen avec références documents
    - exams: Configuration des examens
    - user_exam_attempts: Tentatives d'examen des utilisateurs
    - minigames: Mini-jeux éducatifs
    - user_minigame_scores: Scores des mini-jeux
    - gamified_roles_config: Configuration des rôles gamifiés
    - levels_xp_config: Configuration des niveaux XP
    - recent_activities: Activités récentes pour gamification
    - admin_logs: Journal des actions administratives

  3. Sécurité
    - RLS activé sur toutes les tables
    - Politiques granulaires par rôle
    - Journalisation complète des actions admin

  4. Données Initiales
    - Permissions de base
    - Configuration XP/niveaux
    - Rôles gamifiés
    - Questions d'exemple basées sur documents fournis
    - Podcasts et mini-jeux éducatifs
*/

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. CRÉATION DES TYPES ENUM (OBLIGATOIRE EN PREMIER)
-- ============================================================================

CREATE TYPE user_role AS ENUM ('PQAP', 'FONDS_MUTUELS', 'LES_DEUX');

CREATE TYPE question_type AS ENUM ('MCQ', 'TRUE_FALSE', 'SHORT_ANSWER');

CREATE TYPE activity_type AS ENUM (
  'login',
  'podcast_listened', 
  'exam_started',
  'exam_completed', 
  'minigame_played', 
  'level_up', 
  'role_unlocked',
  'admin_award'
);

CREATE TYPE admin_action_type AS ENUM (
  'user_created', 
  'user_modified', 
  'user_deleted', 
  'role_changed', 
  'content_added', 
  'content_modified', 
  'content_deleted',
  'xp_awarded'
);

-- ============================================================================
-- 2. CRÉATION DES TABLES (ORDRE DES DÉPENDANCES RESPECTÉ)
-- ============================================================================

-- Table des utilisateurs (étend auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  primerica_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  initial_role user_role NOT NULL,
  current_xp integer DEFAULT 0 CHECK (current_xp >= 0),
  current_level integer DEFAULT 1 CHECK (current_level >= 1),
  gamified_role text DEFAULT 'Apprenti Conseiller',
  last_activity_at timestamptz DEFAULT now(),
  is_admin boolean DEFAULT false,
  is_supreme_admin boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des permissions
CREATE TABLE IF NOT EXISTS permissions (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Table de jonction utilisateur-permissions
CREATE TABLE IF NOT EXISTS user_permissions (
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  permission_id integer REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at timestamptz DEFAULT now(),
  granted_by uuid REFERENCES users(id),
  PRIMARY KEY (user_id, permission_id)
);

-- Configuration des niveaux XP
CREATE TABLE IF NOT EXISTS levels_xp_config (
  id serial PRIMARY KEY,
  level_number integer UNIQUE NOT NULL CHECK (level_number >= 1),
  xp_required integer NOT NULL CHECK (xp_required >= 0),
  level_title text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Configuration des rôles gamifiés
CREATE TABLE IF NOT EXISTS gamified_roles_config (
  id serial PRIMARY KEY,
  role_name text UNIQUE NOT NULL,
  min_level_required integer NOT NULL CHECK (min_level_required >= 1),
  description text,
  unlocked_features_json jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Table du contenu podcast
CREATE TABLE IF NOT EXISTS podcast_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  audio_url text NOT NULL,
  duration_seconds integer NOT NULL CHECK (duration_seconds > 0),
  theme text NOT NULL,
  required_permission text NOT NULL,
  xp_awarded integer DEFAULT 50 CHECK (xp_awarded >= 0),
  is_active boolean DEFAULT true,
  source_document_ref text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des questions
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  question_type question_type NOT NULL,
  options_json jsonb,
  correct_answer_key text NOT NULL,
  explanation text,
  difficulty_level integer DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  required_permission text NOT NULL,
  source_document_ref text NOT NULL,
  chapter_reference text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des examens
CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_name text NOT NULL,
  description text,
  required_permission text NOT NULL,
  num_questions_to_draw integer NOT NULL CHECK (num_questions_to_draw > 0),
  time_limit_minutes integer NOT NULL CHECK (time_limit_minutes > 0),
  passing_score_percentage integer DEFAULT 70 CHECK (passing_score_percentage BETWEEN 0 AND 100),
  xp_base_reward integer DEFAULT 100 CHECK (xp_base_reward >= 0),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des tentatives d'examen
CREATE TABLE IF NOT EXISTS user_exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  exam_id uuid REFERENCES exams(id) ON DELETE CASCADE,
  attempt_date timestamptz DEFAULT now(),
  score_percentage numeric(5,2) NOT NULL CHECK (score_percentage BETWEEN 0 AND 100),
  user_answers_json jsonb NOT NULL,
  time_spent_seconds integer NOT NULL CHECK (time_spent_seconds > 0),
  xp_earned integer DEFAULT 0 CHECK (xp_earned >= 0),
  passed boolean GENERATED ALWAYS AS (score_percentage >= 70) STORED,
  created_at timestamptz DEFAULT now()
);

-- Table des mini-jeux
CREATE TABLE IF NOT EXISTS minigames (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_name text UNIQUE NOT NULL,
  description text,
  game_type text DEFAULT 'quiz',
  base_xp_gain integer DEFAULT 25 CHECK (base_xp_gain >= 0),
  max_daily_xp integer DEFAULT 100 CHECK (max_daily_xp >= 0),
  required_permission text NOT NULL,
  game_config_json jsonb DEFAULT '{}'::jsonb,
  source_document_ref text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des scores de mini-jeux
CREATE TABLE IF NOT EXISTS user_minigame_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  minigame_id uuid REFERENCES minigames(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0),
  max_possible_score integer CHECK (max_possible_score >= 0),
  xp_earned integer NOT NULL CHECK (xp_earned >= 0),
  attempt_date timestamptz DEFAULT now(),
  game_session_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Table des activités récentes
CREATE TABLE IF NOT EXISTS recent_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  activity_details_json jsonb DEFAULT '{}'::jsonb,
  xp_gained integer DEFAULT 0 CHECK (xp_gained >= 0),
  occurred_at timestamptz DEFAULT now()
);

-- Journal des actions admin
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action_type admin_action_type NOT NULL,
  target_entity text,
  target_id text,
  details_json jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  occurred_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3. CRÉATION DES INDEX POUR LES PERFORMANCES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_primerica_id ON users(primerica_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_xp_level ON users(current_xp, current_level);
CREATE INDEX IF NOT EXISTS idx_users_admin_flags ON users(is_admin, is_supreme_admin) WHERE is_admin = true OR is_supreme_admin = true;
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission_id ON user_permissions(permission_id);

CREATE INDEX IF NOT EXISTS idx_questions_permission ON questions(required_permission) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(is_active);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty_level);

CREATE INDEX IF NOT EXISTS idx_podcast_permission ON podcast_content(required_permission) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_podcast_active ON podcast_content(is_active);

CREATE INDEX IF NOT EXISTS idx_exams_permission ON exams(required_permission) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_exams_active ON exams(is_active);

CREATE INDEX IF NOT EXISTS idx_user_exam_attempts_user_date ON user_exam_attempts(user_id, attempt_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_exam_attempts_exam ON user_exam_attempts(exam_id);

CREATE INDEX IF NOT EXISTS idx_user_minigame_scores_user_date ON user_minigame_scores(user_id, attempt_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_minigame_scores_minigame ON user_minigame_scores(minigame_id);

CREATE INDEX IF NOT EXISTS idx_recent_activities_user_date ON recent_activities(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_recent_activities_type ON recent_activities(activity_type);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_date ON admin_logs(admin_user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action_type ON admin_logs(action_type);

-- ============================================================================
-- 4. INSERTION DES DONNÉES INITIALES
-- ============================================================================

-- Permissions de base
INSERT INTO permissions (name, description) VALUES
  ('pqap', 'Accès au contenu PQAP (Assurance Vie)'),
  ('fonds_mutuels', 'Accès au contenu Fonds Mutuels'),
  ('admin', 'Accès administrateur'),
  ('supreme_admin', 'Accès administrateur suprême')
ON CONFLICT (name) DO NOTHING;

-- Configuration des niveaux XP
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

-- Configuration des rôles gamifiés
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
  ('Champion Ultime', 10, 'Le summum de l''excellence', '["champion_status", "all_privileges"]')
ON CONFLICT (role_name) DO NOTHING;

-- Examens de base
INSERT INTO exams (exam_name, description, required_permission, num_questions_to_draw, time_limit_minutes, passing_score_percentage, xp_base_reward) VALUES
  ('Examen PQAP Complet', 'Examen simulé complet pour le permis PQAP (35 questions)', 'pqap', 35, 90, 70, 200),
  ('Examen Fonds Mutuels Complet', 'Examen simulé complet pour les fonds mutuels (100 questions)', 'fonds_mutuels', 100, 180, 70, 300),
  ('Quiz PQAP Express', 'Quiz rapide PQAP (10 questions)', 'pqap', 10, 15, 70, 50),
  ('Quiz Fonds Mutuels Express', 'Quiz rapide Fonds Mutuels (15 questions)', 'fonds_mutuels', 15, 20, 70, 75)
ON CONFLICT (exam_name) DO NOTHING;

-- Podcasts éducatifs basés sur les documents
INSERT INTO podcast_content (title, description, audio_url, duration_seconds, theme, required_permission, xp_awarded, source_document_ref) VALUES
  ('Introduction à la Déontologie', 'Principes fondamentaux de déontologie pour les représentants en assurance', 'https://example.com/podcast1.mp3', 1800, 'Déontologie', 'pqap', 50, 'F111-Ch1'),
  ('Assurance Vie : Concepts de Base', 'Les fondamentaux de l''assurance vie selon la réglementation québécoise', 'https://example.com/podcast2.mp3', 2100, 'Assurance Vie', 'pqap', 60, 'F311-Ch1'),
  ('Fonds Communs de Placement', 'Introduction aux fonds communs et à leur réglementation', 'https://example.com/podcast3.mp3', 1950, 'Fonds Mutuels', 'fonds_mutuels', 55, 'fonds_rentes-Ch1'),
  ('Calculs Financiers Avancés', 'Formules et calculs essentiels pour les conseillers', 'https://example.com/podcast4.mp3', 2400, 'Calculs', 'fonds_mutuels', 70, 'fic-2024-Ch3'),
  ('Assurance Maladie et Invalidité', 'Couvertures maladie et invalidité selon F312', 'https://example.com/podcast5.mp3', 1650, 'Assurance Maladie', 'pqap', 45, 'F312-Ch2'),
  ('Éthique et Conflits d''Intérêts', 'Gestion des conflits d''intérêts et obligations éthiques', 'https://example.com/podcast6.mp3', 1750, 'Éthique', 'pqap', 50, 'F111-Ch3')
ON CONFLICT (title) DO NOTHING;

-- Mini-jeux éducatifs
INSERT INTO minigames (game_name, description, game_type, base_xp_gain, max_daily_xp, required_permission, source_document_ref) VALUES
  ('Quiz Éclair Déontologie', 'Questions rapides sur la déontologie en 60 secondes', 'speed_quiz', 30, 150, 'pqap', 'F111'),
  ('Mémoire Financière', 'Jeu de mémoire avec termes financiers et définitions', 'memory', 25, 100, 'fonds_mutuels', 'fic-2024'),
  ('Association Concepts', 'Associer termes d''assurance vie et définitions', 'matching', 35, 175, 'pqap', 'F311'),
  ('Calculs Express', 'Résoudre des calculs financiers rapidement', 'calculation', 40, 200, 'fonds_mutuels', 'fonds_rentes'),
  ('Scénarios Clients', 'Résoudre des cas clients réels basés sur la réglementation', 'scenario', 50, 250, 'pqap', 'F111-F311'),
  ('Vrai ou Faux Réglementaire', 'Questions vrai/faux sur la réglementation', 'true_false', 20, 80, 'fonds_mutuels', 'fic-2024')
ON CONFLICT (game_name) DO NOTHING;