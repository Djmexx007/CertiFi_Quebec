-- Create the activity_type enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE activity_type AS ENUM (
        'login',
        'logout',
        'podcast_listened',
        'exam_started',
        'exam_completed',
        'minigame_played',
        'level_up',
        'admin_award',
        'profile_updated'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the user_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'PQAP',
        'FONDS_MUTUELS',
        'LES_DEUX'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Fonction pour calculer le niveau basé sur l'XP
CREATE OR REPLACE FUNCTION calculate_level_from_xp(xp_amount integer)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  calculated_level integer := 1;
BEGIN
  -- Calcul simple: 1000 XP par niveau
  calculated_level := GREATEST(1, (xp_amount / 1000) + 1);
  
  RETURN calculated_level;
END;
$$;

-- Fonction pour obtenir le rôle gamifié basé sur le niveau
CREATE OR REPLACE FUNCTION get_gamified_role(level_num integer)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  role_name text := 'Apprenti Conseiller';
BEGIN
  -- Rôles gamifiés basés sur le niveau
  IF level_num >= 10 THEN
    role_name := 'Maître Conseiller';
  ELSIF level_num >= 8 THEN
    role_name := 'Conseiller Expert';
  ELSIF level_num >= 6 THEN
    role_name := 'Conseiller Avancé';
  ELSIF level_num >= 4 THEN
    role_name := 'Conseiller Confirmé';
  ELSIF level_num >= 2 THEN
    role_name := 'Conseiller Débutant';
  ELSE
    role_name := 'Apprenti Conseiller';
  END IF;
  
  RETURN role_name;
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
  -- Récupérer les données actuelles de l'utilisateur
  SELECT current_level, current_xp
  INTO old_level, old_xp
  FROM users
  WHERE id = user_uuid;
  
  -- Si l'utilisateur n'existe pas, retourner une erreur
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'User not found');
  END IF;
  
  -- Ajouter l'XP
  new_xp := old_xp + xp_amount;
  
  -- Calculer le nouveau niveau
  new_level := calculate_level_from_xp(new_xp);
  
  -- Vérifier si le niveau a augmenté
  level_up_occurred := new_level > old_level;
  
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
    'old_level', old_level,
    'new_level', new_level,
    'new_role', new_role,
    'level_up_occurred', level_up_occurred,
    'xp_gained', xp_amount
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
    gamified_role,
    is_admin,
    is_supreme_admin,
    is_active
  ) VALUES (
    user_id,
    primerica_id_param,
    email_param,
    first_name_param,
    last_name_param,
    initial_role_param,
    0,
    1,
    'Apprenti Conseiller',
    false,
    false,
    true
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
    'success', true
  );
  
  RETURN result;
END;
$$;

-- Fonction pour créer un profil automatiquement lors de l'inscription
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
  
  -- Créer le profil seulement si les données sont présentes
  IF primerica_number IS NOT NULL AND user_first_name IS NOT NULL THEN
    INSERT INTO users (
      id,
      primerica_id,
      email,
      first_name,
      last_name,
      initial_role,
      current_xp,
      current_level,
      gamified_role,
      is_admin,
      is_supreme_admin,
      is_active
    ) VALUES (
      NEW.id,
      primerica_number,
      NEW.email,
      user_first_name,
      user_last_name,
      COALESCE(user_role, 'PQAP'),
      0,
      1,
      'Apprenti Conseiller',
      false,
      false,
      true
    );
    
    -- Attribuer les permissions basées sur le rôle
    IF COALESCE(user_role, 'PQAP') = 'PQAP' THEN
      INSERT INTO user_permissions (user_id, permission_id)
      SELECT NEW.id, id FROM permissions WHERE name = 'pqap';
    ELSIF user_role = 'FONDS_MUTUELS' THEN
      INSERT INTO user_permissions (user_id, permission_id)
      SELECT NEW.id, id FROM permissions WHERE name = 'fonds_mutuels';
    ELSIF user_role = 'LES_DEUX' THEN
      INSERT INTO user_permissions (user_id, permission_id)
      SELECT NEW.id, id FROM permissions WHERE name IN ('pqap', 'fonds_mutuels');
    END IF;
  END IF;
  
  RETURN NEW;
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

-- Fonction pour obtenir les statistiques utilisateur
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats jsonb;
  total_exams integer := 0;
  passed_exams integer := 0;
  avg_score numeric := 0;
  total_podcasts integer := 0;
  total_minigames integer := 0;
BEGIN
  -- Compter les examens
  SELECT 
    COUNT(*),
    COUNT(CASE WHEN passed THEN 1 END),
    COALESCE(AVG(score_percentage), 0)
  INTO total_exams, passed_exams, avg_score
  FROM user_exam_attempts
  WHERE user_id = user_uuid;
  
  -- Compter les podcasts écoutés
  SELECT COUNT(*)
  INTO total_podcasts
  FROM recent_activities
  WHERE user_id = user_uuid AND activity_type = 'podcast_listened';
  
  -- Compter les mini-jeux joués
  SELECT COUNT(*)
  INTO total_minigames
  FROM recent_activities
  WHERE user_id = user_uuid AND activity_type = 'minigame_played';
  
  stats := jsonb_build_object(
    'total_exams', total_exams,
    'passed_exams', passed_exams,
    'failed_exams', total_exams - passed_exams,
    'average_score', ROUND(avg_score, 2),
    'total_podcasts_listened', total_podcasts,
    'total_minigames_played', total_minigames,
    'current_streak', 0,
    'rank_position', 0
  );
  
  RETURN stats;
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
    score_multiplier := 0.5; -- Pénalité pour échec
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

-- Supprimer les anciens triggers s'ils existent
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_podcast_content_updated_at ON podcast_content;
DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
DROP TRIGGER IF EXISTS update_exams_updated_at ON exams;
DROP TRIGGER IF EXISTS update_minigames_updated_at ON minigames;

-- Créer les triggers
CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_new_user();

-- Appliquer le trigger updated_at aux tables appropriées
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Vérifier si les tables existent avant de créer les triggers
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'podcast_content') THEN
    CREATE TRIGGER update_podcast_content_updated_at
      BEFORE UPDATE ON podcast_content
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'questions') THEN
    CREATE TRIGGER update_questions_updated_at
      BEFORE UPDATE ON questions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exams') THEN
    CREATE TRIGGER update_exams_updated_at
      BEFORE UPDATE ON exams
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'minigames') THEN
    CREATE TRIGGER update_minigames_updated_at
      BEFORE UPDATE ON minigames
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;