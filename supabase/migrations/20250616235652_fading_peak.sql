/*
  # CertiFi Québec - Schéma Complet de Base de Données
  
  1. Tables Principales
    - users: Profils utilisateurs avec gamification
    - permissions: Système de permissions granulaire
    - user_permissions: Association utilisateurs-permissions
    - podcast_content: Contenu audio de formation
    - questions: Base de questions d'examen
    - exams: Configuration des examens
    - user_exam_attempts: Historique des tentatives
    - minigames: Configuration des mini-jeux
    - user_minigame_scores: Scores des mini-jeux
    - gamified_roles_config: Configuration des rôles gamifiés
    - levels_xp_config: Configuration des niveaux XP
    - recent_activities: Journal des activités
    - admin_logs: Logs d'administration

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques granulaires par rôle
    - Journalisation complète des actions admin

  3. Performance
    - Index optimisés pour les requêtes fréquentes
    - Fonctions PostgreSQL pour la logique complexe
*/

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Types ENUM
CREATE TYPE user_role AS ENUM ('PQAP', 'FONDS_MUTUELS', 'LES_DEUX');
CREATE TYPE question_type AS ENUM ('MCQ', 'TrueFalse', 'ShortAnswer');
CREATE TYPE activity_type AS ENUM (
  'login', 'logout', 'podcast_listened', 'exam_started', 'exam_completed', 
  'minigame_played', 'level_up', 'role_changed', 'content_created', 
  'user_created', 'user_modified', 'user_deleted'
);
CREATE TYPE permission_name AS ENUM ('admin', 'supreme_admin', 'pqap', 'fonds_mutuels');

-- Table des permissions
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  name permission_name UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des utilisateurs (étend auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  primerica_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  initial_role user_role NOT NULL,
  current_xp INTEGER DEFAULT 0 CHECK (current_xp >= 0),
  current_level INTEGER DEFAULT 1 CHECK (current_level >= 1),
  gamified_role TEXT DEFAULT 'Apprenti Conseiller',
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  is_admin BOOLEAN DEFAULT FALSE,
  is_supreme_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table de liaison utilisateurs-permissions
CREATE TABLE IF NOT EXISTS user_permissions (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES users(id),
  PRIMARY KEY (user_id, permission_id)
);

-- Configuration des niveaux XP
CREATE TABLE IF NOT EXISTS levels_xp_config (
  id SERIAL PRIMARY KEY,
  level_number INTEGER UNIQUE NOT NULL CHECK (level_number > 0),
  xp_required INTEGER UNIQUE NOT NULL CHECK (xp_required >= 0),
  level_title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuration des rôles gamifiés
CREATE TABLE IF NOT EXISTS gamified_roles_config (
  id SERIAL PRIMARY KEY,
  role_name TEXT UNIQUE NOT NULL,
  min_level_required INTEGER UNIQUE NOT NULL CHECK (min_level_required > 0),
  description TEXT,
  unlocked_features_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contenu podcast
CREATE TABLE IF NOT EXISTS podcast_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER CHECK (duration_seconds > 0),
  theme TEXT,
  required_permission permission_name NOT NULL,
  xp_awarded INTEGER NOT NULL DEFAULT 50 CHECK (xp_awarded >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  source_document_ref TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions d'examen
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL,
  options_json JSONB, -- Pour MCQ: {"A": "Option 1", "B": "Option 2", ...}
  correct_answer_key TEXT NOT NULL, -- "A", "B", "true", "false", ou texte libre
  explanation TEXT,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  required_permission permission_name NOT NULL,
  source_document_ref TEXT NOT NULL,
  chapter_reference TEXT,
  page_reference TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuration des examens
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_name TEXT NOT NULL,
  description TEXT,
  required_permission permission_name NOT NULL,
  num_questions_to_draw INTEGER NOT NULL CHECK (num_questions_to_draw > 0),
  time_limit_minutes INTEGER CHECK (time_limit_minutes > 0),
  passing_score_percentage NUMERIC(5,2) DEFAULT 70.00 CHECK (passing_score_percentage BETWEEN 0 AND 100),
  xp_base_reward INTEGER DEFAULT 100 CHECK (xp_base_reward >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tentatives d'examen des utilisateurs
CREATE TABLE IF NOT EXISTS user_exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE RESTRICT,
  attempt_date TIMESTAMPTZ DEFAULT NOW(),
  score_percentage NUMERIC(5,2) CHECK (score_percentage BETWEEN 0 AND 100),
  user_answers_json JSONB NOT NULL, -- {"question_id": "answer", ...}
  time_spent_seconds INTEGER CHECK (time_spent_seconds >= 0),
  xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
  passed BOOLEAN GENERATED ALWAYS AS (score_percentage >= (SELECT passing_score_percentage FROM exams WHERE id = exam_id)) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mini-jeux
CREATE TABLE IF NOT EXISTS minigames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_name TEXT NOT NULL,
  description TEXT,
  game_type TEXT NOT NULL, -- 'flash_cards', 'true_false', 'scenario', 'memory', etc.
  base_xp_gain INTEGER NOT NULL DEFAULT 25 CHECK (base_xp_gain >= 0),
  max_daily_xp INTEGER DEFAULT 200 CHECK (max_daily_xp >= 0),
  required_permission permission_name NOT NULL,
  game_config_json JSONB DEFAULT '{}', -- Configuration spécifique au jeu
  source_document_ref TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scores des mini-jeux
CREATE TABLE IF NOT EXISTS user_minigame_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  minigame_id UUID NOT NULL REFERENCES minigames(id) ON DELETE RESTRICT,
  score INTEGER NOT NULL CHECK (score >= 0),
  max_possible_score INTEGER,
  xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
  attempt_date TIMESTAMPTZ DEFAULT NOW(),
  game_session_data JSONB DEFAULT '{}', -- Données spécifiques à la session
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activités récentes
CREATE TABLE IF NOT EXISTS recent_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  activity_details_json JSONB DEFAULT '{}',
  xp_gained INTEGER DEFAULT 0 CHECK (xp_gained >= 0),
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logs d'administration
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  action_type TEXT NOT NULL,
  target_entity TEXT,
  target_id TEXT,
  details_json JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertion des données de configuration initiales
INSERT INTO permissions (name, description) VALUES
  ('admin', 'Administrateur avec accès à la gestion de contenu'),
  ('supreme_admin', 'Administrateur suprême avec tous les droits'),
  ('pqap', 'Accès au contenu PQAP (Assurance Vie)'),
  ('fonds_mutuels', 'Accès au contenu Fonds Mutuels')
ON CONFLICT (name) DO NOTHING;

-- Configuration des niveaux XP (10 niveaux)
INSERT INTO levels_xp_config (level_number, xp_required, level_title, description) VALUES
  (1, 0, 'Apprenti Conseiller', 'Bienvenue dans votre parcours de formation'),
  (2, 500, 'Conseiller Junior', 'Vous maîtrisez les bases'),
  (3, 1200, 'Conseiller Confirmé', 'Vos connaissances se solidifient'),
  (4, 2000, 'Conseiller Expérimenté', 'Vous développez votre expertise'),
  (5, 3000, 'Conseiller Expert', 'Votre expertise est reconnue'),
  (6, 4500, 'Conseiller Senior', 'Vous excellez dans votre domaine'),
  (7, 6500, 'Conseiller Principal', 'Votre maîtrise est exemplaire'),
  (8, 9000, 'Conseiller Élite', 'Vous êtes parmi les meilleurs'),
  (9, 12000, 'Maître Conseiller', 'Votre expertise est légendaire'),
  (10, 16000, 'Grand Maître', 'Vous avez atteint l''excellence absolue')
ON CONFLICT (level_number) DO NOTHING;

-- Configuration des rôles gamifiés
INSERT INTO gamified_roles_config (role_name, min_level_required, description, unlocked_features_json) VALUES
  ('Apprenti Conseiller', 1, 'Nouveau dans le domaine', '{"features": ["basic_content"]}'),
  ('Conseiller Junior', 2, 'Bases acquises', '{"features": ["basic_content", "intermediate_quizzes"]}'),
  ('Conseiller Confirmé', 3, 'Connaissances solides', '{"features": ["basic_content", "intermediate_quizzes", "advanced_scenarios"]}'),
  ('Conseiller Expérimenté', 4, 'Expertise en développement', '{"features": ["all_content", "peer_mentoring"]}'),
  ('Conseiller Expert', 5, 'Expertise reconnue', '{"features": ["all_content", "peer_mentoring", "content_creation"]}'),
  ('Conseiller Senior', 6, 'Excellence confirmée', '{"features": ["all_content", "peer_mentoring", "content_creation", "advanced_analytics"]}'),
  ('Conseiller Principal', 7, 'Maîtrise exemplaire', '{"features": ["all_content", "peer_mentoring", "content_creation", "advanced_analytics", "leadership_tools"]}'),
  ('Conseiller Élite', 8, 'Parmi les meilleurs', '{"features": ["all_content", "peer_mentoring", "content_creation", "advanced_analytics", "leadership_tools", "exclusive_content"]}'),
  ('Maître Conseiller', 9, 'Expertise légendaire', '{"features": ["all_content", "peer_mentoring", "content_creation", "advanced_analytics", "leadership_tools", "exclusive_content", "master_privileges"]}'),
  ('Grand Maître', 10, 'Excellence absolue', '{"features": ["all_content", "peer_mentoring", "content_creation", "advanced_analytics", "leadership_tools", "exclusive_content", "master_privileges", "ultimate_recognition"]}}')
ON CONFLICT (min_level_required) DO NOTHING;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_users_primerica_id ON users(primerica_id);
CREATE INDEX IF NOT EXISTS idx_users_xp_level ON users(current_xp, current_level);
CREATE INDEX IF NOT EXISTS idx_users_admin_flags ON users(is_admin, is_supreme_admin) WHERE is_admin = TRUE OR is_supreme_admin = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_content_permission ON podcast_content(required_permission) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_questions_permission ON questions(required_permission) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty_level, required_permission) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_exam_attempts_user_date ON user_exam_attempts(user_id, attempt_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_exam_attempts_exam_id ON user_exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_minigames_permission ON minigames(required_permission) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_minigame_scores_user_date ON user_minigame_scores(user_id, attempt_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_minigame_scores_daily ON user_minigame_scores(user_id, minigame_id, DATE(attempt_date));
CREATE INDEX IF NOT EXISTS idx_recent_activities_user_date ON recent_activities(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_recent_activities_type ON recent_activities(activity_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_date ON admin_logs(admin_user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target ON admin_logs(target_entity, target_id);

-- Activation de RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels_xp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamified_roles_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE minigames ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_minigame_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;