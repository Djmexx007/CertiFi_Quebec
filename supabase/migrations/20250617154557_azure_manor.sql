/*
# Migration Baseline Complète - CertiFi Québec (corrigée)

Cette migration repart de zéro, dans l’ordre :
1. Nettoyage de l’existant
2. Types ENUM
3. Tables principales
4. Politiques RLS
5. Fonctions PostgreSQL
6. Données d’exemple
7. Triggers
8. Index
*/

-- =====================================================
-- 1. NETTOYAGE DE L'EXISTANT
-- =====================================================

-- Supprimer le trigger sur auth.users (toujours présent)
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;

-- Supprimer toutes les tables publiques (cascade détruit aussi les policies et triggers liés)
DROP TABLE IF EXISTS
  admin_logs,
  recent_activities,
  user_minigame_scores,
  user_exam_attempts,
  user_permissions,
  minigames,
  exams,
  questions,
  podcast_content,
  permissions,
  gamified_roles_config,
  levels_xp_config,
  users
CASCADE;

-- Supprimer les types ENUM
DROP TYPE IF EXISTS activity_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Supprimer les fonctions personnalisées
DROP FUNCTION IF EXISTS log_admin_action(uuid, text, text, text, jsonb, text, text);
DROP FUNCTION IF EXISTS cleanup_old_activities();
DROP FUNCTION IF EXISTS user_has_permission(uuid, text);
DROP FUNCTION IF EXISTS calculate_exam_xp(integer, float, integer, integer);
DROP FUNCTION IF EXISTS get_user_stats(uuid);
DROP FUNCTION IF EXISTS create_user_with_permissions(uuid, text, text, text, text, user_role);
DROP FUNCTION IF EXISTS award_xp(uuid, integer, activity_type, jsonb);
DROP FUNCTION IF EXISTS get_gamified_role(integer);
DROP FUNCTION IF EXISTS calculate_level_from_xp(integer);
DROP FUNCTION IF EXISTS create_profile_for_new_user();
DROP FUNCTION IF EXISTS update_updated_at();

-- =====================================================
-- 2. CRÉATION DES TYPES ENUM
-- =====================================================

CREATE TYPE user_role AS ENUM (
  'PQAP',
  'FONDS_MUTUELS',
  'LES_DEUX'
);

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

CREATE TABLE levels_xp_config (
  level_number   integer PRIMARY KEY,
  xp_required    integer NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE gamified_roles_config (
  id                serial PRIMARY KEY,
  role_name         text    NOT NULL,
  min_level_required integer NOT NULL,
  description       text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE permissions (
  id          serial PRIMARY KEY,
  name        text   UNIQUE NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id               uuid    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  primerica_id     text    UNIQUE NOT NULL,
  email            text    UNIQUE NOT NULL,
  first_name       text    NOT NULL,
  last_name        text    NOT NULL,
  initial_role     user_role NOT NULL,
  current_xp       integer DEFAULT 0 CHECK (current_xp >= 0),
  current_level    integer DEFAULT 1 CHECK (current_level >= 1),
  gamified_role    text    DEFAULT 'Apprenti Conseiller',
  is_admin         boolean DEFAULT false,
  is_supreme_admin boolean DEFAULT false,
  is_active        boolean DEFAULT true,
  avatar_url       text,
  last_activity_at timestamptz DEFAULT now(),
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE TABLE user_permissions (
  id            serial PRIMARY KEY,
  user_id       uuid   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_id integer NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted_by    uuid   REFERENCES users(id),
  granted_at    timestamptz DEFAULT now(),
  UNIQUE(user_id, permission_id)
);

CREATE TABLE podcast_content (
  id                   uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  title                text    NOT NULL,
  description          text,
  audio_url            text,
  duration_seconds     integer CHECK (duration_seconds > 0),
  theme                text,
  required_permission  text    NOT NULL,
  xp_awarded           integer DEFAULT 0 CHECK (xp_awarded >= 0),
  source_document_ref  text,
  is_active            boolean DEFAULT true,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

CREATE TABLE questions (
  id                   uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text        text    NOT NULL,
  question_type        text    NOT NULL DEFAULT 'MCQ' CHECK (question_type IN ('MCQ','TRUE_FALSE','SHORT_ANSWER')),
  options_json         jsonb,
  correct_answer_key   text    NOT NULL,
  explanation          text,
  difficulty_level     integer DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  required_permission  text    NOT NULL,
  source_document_ref  text    NOT NULL,
  chapter_reference    text,
  is_active            boolean DEFAULT true,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

CREATE TABLE exams (
  id                       uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_name                text    NOT NULL,
  description              text,
  required_permission      text    NOT NULL,
  num_questions_to_draw    integer NOT NULL CHECK (num_questions_to_draw > 0),
  time_limit_minutes       integer NOT NULL CHECK (time_limit_minutes > 0),
  passing_score_percentage float   NOT NULL CHECK (passing_score_percentage BETWEEN 0 AND 100),
  xp_base_reward           integer DEFAULT 0 CHECK (xp_base_reward >= 0),
  is_active                boolean DEFAULT true,
  created_at               timestamptz DEFAULT now(),
  updated_at               timestamptz DEFAULT now()
);

CREATE TABLE user_exam_attempts (
  id                uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_id           uuid    NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  attempt_date      timestamptz DEFAULT now(),
  score_percentage  float   NOT NULL CHECK (score_percentage BETWEEN 0 AND 100),
  user_answers_json jsonb,
  time_spent_seconds integer NOT NULL CHECK (time_spent_seconds > 0),
  xp_earned         integer DEFAULT 0 CHECK (xp_earned >= 0),
  passed            boolean GENERATED ALWAYS AS (score_percentage >= 70) STORED
);

CREATE TABLE minigames (
  id                uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  game_name         text    NOT NULL,
  description       text,
  game_type         text    NOT NULL,
  base_xp_gain      integer DEFAULT 0 CHECK (base_xp_gain >= 0),
  max_daily_xp      integer DEFAULT 100 CHECK (max_daily_xp >= 0),
  required_permission text NOT NULL,
  game_config_json  jsonb   DEFAULT '{}'::jsonb,
  source_document_ref text,
  is_active         boolean DEFAULT true,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE TABLE user_minigame_scores (
  id               uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  minigame_id      uuid    NOT NULL REFERENCES minigames(id) ON DELETE CASCADE,
  score            integer NOT NULL CHECK (score >= 0),
  max_possible_score integer,
  xp_earned        integer DEFAULT 0 CHECK (xp_earned >= 0),
  attempt_date     timestamptz DEFAULT now(),
  game_session_data jsonb   DEFAULT '{}'::jsonb
);

CREATE TABLE recent_activities (
  id                   uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type        activity_type NOT NULL,
  activity_details_json jsonb DEFAULT '{}'::jsonb,
  xp_gained            integer DEFAULT 0 CHECK (xp_gained >= 0),
  occurred_at          timestamptz DEFAULT now()
);

CREATE TABLE admin_logs (
  id               uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id    uuid    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type      text    NOT NULL,
  target_entity    text,
  target_id        text,
  details_json     jsonb   DEFAULT '{}'::jsonb,
  ip_address       text,
  user_agent       text,
  occurred_at      timestamptz DEFAULT now()
);

-- =====================================================
-- 4. ACTIVATION DE RLS ET POLITIQUES
-- =====================================================

-- Activer RLS
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_content    ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams              ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE minigames          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_minigame_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_activities  ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs         ENABLE ROW LEVEL SECURITY;

-- Policies users
CREATE POLICY "Users can read own data"
  ON users FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
        AND (u2.is_admin OR u2.is_supreme_admin)
    )
  );

CREATE POLICY "Supreme admins can manage users"
  ON users FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
        AND u2.is_supreme_admin
    )
  );

-- Policies user_permissions
CREATE POLICY "Users can read own permissions"
  ON user_permissions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage permissions"
  ON user_permissions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
        AND (u2.is_admin OR u2.is_supreme_admin)
    )
  );

-- Policies podcast_content
CREATE POLICY "Users can read active podcasts"
  ON podcast_content FOR SELECT TO authenticated
  USING (is_active);

CREATE POLICY "Admins can manage podcasts"
  ON podcast_content FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
        AND (u2.is_admin OR u2.is_supreme_admin)
    )
  );

-- Policies questions
CREATE POLICY "Users can read active questions"
  ON questions FOR SELECT TO authenticated
  USING (is_active);

CREATE POLICY "Admins can manage questions"
  ON questions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
        AND (u2.is_admin OR u2.is_supreme_admin)
    )
  );

-- Policies exams
CREATE POLICY "Users can read active exams"
  ON exams FOR SELECT TO authenticated
  USING (is_active);

CREATE POLICY "Admins can manage exams"
  ON exams FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
        AND (u2.is_admin OR u2.is_supreme_admin)
    )
  );

-- Policies user_exam_attempts
CREATE POLICY "Users can read own exam attempts"
  ON user_exam_attempts FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create exam attempts"
  ON user_exam_attempts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all exam attempts"
  ON user_exam_attempts FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
        AND (u2.is_admin OR u2.is_supreme_admin)
    )
  );

-- Policies minigames
CREATE POLICY "Users can read active minigames"
  ON minigames FOR SELECT TO authenticated
  USING (is_active);

CREATE POLICY "Admins can manage minigames"
  ON minigames FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
        AND (u2.is_admin OR u2.is_supreme_admin)
    )
  );

-- Policies user_minigame_scores
CREATE POLICY "Users can read own minigame scores"
  ON user_minigame_scores FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create minigame scores"
  ON user_minigame_scores FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all minigame scores"
  ON user_minigame_scores FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
        AND (u2.is_admin OR u2.is_supreme_admin)
    )
  );

-- Policies recent_activities
CREATE POLICY "Users can read own activities"
  ON recent_activities FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all activities"
  ON recent_activities FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
        AND (u2.is_admin OR u2.is_supreme_admin)
    )
  );

CREATE POLICY "System can create activities"
  ON recent_activities FOR INSERT TO authenticated
  WITH CHECK (true);

-- Policies admin_logs
CREATE POLICY "Admins can read admin logs"
  ON admin_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
        AND (u2.is_admin OR u2.is_supreme_admin)
    )
  );

CREATE POLICY "System can create admin logs"
  ON admin_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- =====================================================
-- 5. CRÉATION DES FONCTIONS POSTGRESQL
-- =====================================================

-- calculate_level_from_xp
CREATE OR REPLACE FUNCTION calculate_level_from_xp(xp_amount integer)
RETURNS integer LANGUAGE plpgsql AS $$
BEGIN
  RETURN GREATEST(1, (xp_amount / 1000) + 1);
END;
$$;

-- get_gamified_role
CREATE OR REPLACE FUNCTION get_gamified_role(level_num integer)
RETURNS text LANGUAGE plpgsql AS $$
BEGIN
  RETURN CASE
    WHEN level_num >= 10 THEN 'Maître Conseiller'
    WHEN level_num >= 8  THEN 'Conseiller Expert'
    WHEN level_num >= 6  THEN 'Conseiller Confirmé'
    WHEN level_num >= 4  THEN 'Conseiller Intermédiaire'
    WHEN level_num >= 2  THEN 'Conseiller Débutant'
    ELSE 'Apprenti Conseiller'
  END CASE;
END;
$$;

-- award_xp
CREATE OR REPLACE FUNCTION award_xp(
  user_uuid uuid,
  xp_amount integer,
  activity_type_param activity_type,
  activity_details jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  old_level integer; old_xp integer;
  new_xp integer; new_level integer; new_role text;
  level_up boolean := false; result jsonb;
BEGIN
  SELECT current_level, current_xp INTO old_level, old_xp FROM users WHERE id = user_uuid;
  IF NOT FOUND THEN RAISE EXCEPTION 'Utilisateur non trouvé: %', user_uuid; END IF;

  new_xp := old_xp + xp_amount;
  new_level := calculate_level_from_xp(new_xp);
  IF new_level > old_level THEN level_up := true; END IF;
  new_role := get_gamified_role(new_level);

  UPDATE users
    SET current_xp = new_xp,
        current_level = new_level,
        gamified_role = new_role,
        last_activity_at = now(),
        updated_at = now()
    WHERE id = user_uuid;

  INSERT INTO recent_activities(user_id, activity_type, activity_details_json, xp_gained, occurred_at)
    VALUES(user_uuid, activity_type_param, activity_details, xp_amount, now());
  IF level_up THEN
    INSERT INTO recent_activities(user_id, activity_type, activity_details_json, xp_gained, occurred_at)
      VALUES(user_uuid, 'level_up'::activity_type,
             jsonb_build_object('old_level', old_level, 'new_level', new_level, 'new_role', new_role), 0, now());
  END IF;

  result := jsonb_build_object(
    'old_xp', old_xp, 'new_xp', new_xp, 'xp_gained', xp_amount,
    'old_level', old_level, 'new_level', new_level,
    'level_up_occurred', level_up, 'new_role', new_role
  );
  RETURN result;
END;
$$;

-- create_user_with_permissions
CREATE OR REPLACE FUNCTION create_user_with_permissions(
  user_id uuid, primerica_id_param text, email_param text,
  first_name_param text, last_name_param text, initial_role_param user_role
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result jsonb;
BEGIN
  INSERT INTO users(id, primerica_id, email, first_name, last_name, initial_role, current_xp, current_level, gamified_role)
    VALUES(user_id, primerica_id_param, email_param, first_name_param, last_name_param, initial_role_param, 0, 1, 'Apprenti Conseiller');

  IF initial_role_param IN ('PQAP','FONDS_MUTUELS','LES_DEUX') THEN
    INSERT INTO user_permissions(user_id, permission_id)
      SELECT user_id, id FROM permissions
      WHERE name = CASE
        WHEN initial_role_param = 'PQAP'          THEN 'pqap'
        WHEN initial_role_param = 'FONDS_MUTUELS' THEN 'fonds_mutuels'
        ELSE NULL
      END
      OR (initial_role_param = 'LES_DEUX' AND name IN ('pqap','fonds_mutuels'));
  END IF;

  result := jsonb_build_object(
    'user_id', user_id, 'primerica_id', primerica_id_param,
    'role', initial_role_param, 'message', 'Utilisateur créé'
  );
  RETURN result;
END;
$$;

-- get_user_stats
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_exams',      COALESCE(COUNT(DISTINCT uea.id),0),
    'passed_exams',     COALESCE(COUNT(DISTINCT CASE WHEN uea.passed THEN uea.id END),0),
    'failed_exams',     COALESCE(COUNT(DISTINCT CASE WHEN NOT uea.passed THEN uea.id END),0),
    'average_score',    COALESCE(ROUND(AVG(uea.score_percentage),2),0),
    'podcasts_listened',COALESCE(COUNT(DISTINCT CASE WHEN ra.activity_type='podcast_listened' THEN ra.id END),0),
    'minigames_played', COALESCE(COUNT(DISTINCT CASE WHEN ra.activity_type='minigame_played' THEN ra.id END),0),
    'current_streak',   0,
    'rank_position',    1
  ) INTO stats
  FROM users u
  LEFT JOIN user_exam_attempts uea ON u.id = uea.user_id
  LEFT JOIN recent_activities ra     ON u.id = ra.user_id
  WHERE u.id = user_uuid
  GROUP BY u.id;

  RETURN COALESCE(stats, jsonb_build_object(
    'total_exams',0,'passed_exams',0,'failed_exams',0,'average_score',0,
    'podcasts_listened',0,'minigames_played',0,'current_streak',0,'rank_position',1
  ));
END;
$$;

-- calculate_exam_xp
CREATE OR REPLACE FUNCTION calculate_exam_xp(
  base_xp integer, score_percentage float,
  time_spent_seconds integer, time_limit_seconds integer
) RETURNS integer LANGUAGE plpgsql AS $$
DECLARE
  score_multiplier float := 1;
  time_bonus      float := 0;
BEGIN
  IF score_percentage >= 95 THEN score_multiplier := 1.5;
  ELSIF score_percentage >= 85 THEN score_multiplier := 1.3;
  ELSIF score_percentage >= 75 THEN score_multiplier := 1.1;
  ELSIF score_percentage < 70  THEN score_multiplier := 0.5;
  END IF;

  IF time_spent_seconds < time_limit_seconds * 0.75 THEN time_bonus := 0.2;
  ELSIF time_spent_seconds < time_limit_seconds * 0.9  THEN time_bonus := 0.1;
  END IF;

  RETURN GREATEST(ROUND(base_xp * score_multiplier * (1 + time_bonus)), 0);
END;
$$;

-- user_has_permission
CREATE OR REPLACE FUNCTION user_has_permission(user_uuid uuid, permission_name text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE has_perm boolean;
BEGIN
  SELECT (is_supreme_admin OR (permission_name IN ('admin','supreme_admin') AND is_admin))
    INTO has_perm FROM users WHERE id = user_uuid;
  IF has_perm THEN RETURN true; END IF;

  RETURN EXISTS(
    SELECT 1 FROM user_permissions up
    JOIN permissions p ON up.permission_id = p.id
    WHERE up.user_id = user_uuid AND p.name = permission_name
  );
END;
$$;

-- cleanup_old_activities
CREATE OR REPLACE FUNCTION cleanup_old_activities()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM recent_activities
  WHERE id NOT IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY occurred_at DESC) rn
      FROM recent_activities
    ) t WHERE rn <= 50
  );
END;
$$;

-- log_admin_action
CREATE OR REPLACE FUNCTION log_admin_action(
  admin_id uuid, action_type_param text,
  target_entity_param text, target_id_param text,
  details_param jsonb, ip_address_param text, user_agent_param text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO admin_logs(
    admin_user_id, action_type, target_entity,
    target_id, details_json, ip_address, user_agent, occurred_at
  ) VALUES(
    admin_id, action_type_param, target_entity_param,
    target_id_param, details_param, ip_address_param, user_agent_param, now()
  );
END;
$$;

-- create_profile_for_new_user
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  pid text; fn text; ln text; ir user_role;
BEGIN
  pid := NEW.raw_user_meta_data->>'primerica_id';
  fn  := NEW.raw_user_meta_data->>'first_name';
  ln  := NEW.raw_user_meta_data->>'last_name';
  ir  := (NEW.raw_user_meta_data->>'initial_role')::user_role;
  IF pid IS NULL OR fn IS NULL OR ln IS NULL OR ir IS NULL THEN
    RETURN NEW;
  END IF;
  PERFORM create_user_with_permissions(NEW.id, pid, NEW.email, fn, ln, ir);
  RETURN NEW;
END;
$$;

-- update_updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================
-- 6. DONNÉES D'EXEMPLE
-- =====================================================

INSERT INTO levels_xp_config(level_number, xp_required) VALUES
 (1,0),(2,1000),(3,2000),(4,3000),(5,4000),
 (6,5000),(7,6000),(8,7000),(9,8000),(10,9000)
ON CONFLICT DO NOTHING;

INSERT INTO gamified_roles_config(role_name, min_level_required, description) VALUES
 ('Apprenti Conseiller',1,'Nouveau'),('Conseiller Débutant',2,'Début'),
 ('Conseiller Intermédiaire',4,'Intermédiaire'),('Conseiller Confirmé',6,'Confirmé'),
 ('Conseiller Expert',8,'Expert'),('Maître Conseiller',10,'Maître')
ON CONFLICT DO NOTHING;

INSERT INTO permissions(name, description) VALUES
 ('pqap','Accès PQAP'),('fonds_mutuels','Accès Fonds Mutuels'),
 ('admin','Admin'),('supreme_admin','Super-admin')
ON CONFLICT DO NOTHING;

INSERT INTO podcast_content(title, description, duration_seconds, theme, required_permission, xp_awarded, source_document_ref) VALUES
 ('Introduction à la Déontologie PQAP','…',1800,'Déontologie','pqap',50,'F311-Ch1'),
 ('Gestion des Fonds Mutuels','…',2400,'Investissement','fonds_mutuels',75,'F312-Ch3'),
 ('Éthique et Responsabilité','…',2100,'Éthique','pqap',60,'F311-Ch2')
ON CONFLICT DO NOTHING;

INSERT INTO questions(question_text, question_type, options_json, correct_answer_key, explanation, difficulty_level, required_permission, source_document_ref, chapter_reference) VALUES
 ('Définition de la déontologie?','MCQ',
  '{"A":"Règles morales","B":"Technique de vente","C":"Produit","D":"Méthode"}','A',
  'Ensemble de règles morales.',2,'pqap','F311-Ch1','Chapitre 1'),
 ('Conseiller toujours dans l’intérêt client?','TRUE_FALSE',
  '{"true":"Vrai","false":"Faux"}','true',
  'Obligation fiduciaire.',1,'pqap','F311-Ch1','Chapitre 1'),
 ('Ratio max frais équilibré?','MCQ',
  '{"A":"1.5%","B":"2.0%","C":"2.5%","D":"3.0%"}','C',
  '2.5%.',3,'fonds_mutuels','F312-Ch2','Chapitre 2')
ON CONFLICT DO NOTHING;

INSERT INTO exams(exam_name, description, required_permission, num_questions_to_draw, time_limit_minutes, passing_score_percentage, xp_base_reward) VALUES
 ('Examen PQAP Simulé','…', 'pqap',35,90,70,200),
 ('Examen Fonds Mutuels','…','fonds_mutuels',100,120,75,300),
 ('Quiz Déontologie','…','pqap',10,15,80,50)
ON CONFLICT DO NOTHING;

INSERT INTO minigames(game_name, description, game_type, base_xp_gain, max_daily_xp, required_permission, source_document_ref) VALUES
 ('Quiz Interactif','…','quiz',25,100,'pqap','F311'),
 ('Jeu de Mémoire','…','memory',20,80,'pqap','F311'),
 ('Simulation Portefeuille','…','simulation',30,120,'fonds_mutuels','F312')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. TRIGGERS
-- =====================================================

CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_new_user();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_podcast_content_updated_at
  BEFORE UPDATE ON podcast_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON exams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_minigames_updated_at
  BEFORE UPDATE ON minigames
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- 8. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_primerica_id    ON users(primerica_id);
CREATE INDEX IF NOT EXISTS idx_users_email           ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active          ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_admin           ON users(is_admin, is_supreme_admin);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exam_attempts_user_id ON user_exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_activities_user_id ON recent_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_activities_occurred_at ON recent_activities(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_user_id ON admin_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_occurred_at ON admin_logs(occurred_at DESC);

-- Commentaire final
COMMENT ON SCHEMA public IS 'CertiFi Québec – schéma complet, corrigé et idempotent';
