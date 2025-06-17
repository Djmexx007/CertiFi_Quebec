/*
  # CertiFi Québec - Fonctions PostgreSQL
  
  Fonctions pour la logique métier complexe :
  - Calcul et attribution XP
  - Mise à jour automatique des niveaux
  - Gestion de la gamification
  - Utilitaires de validation
*/

-- Fonction pour calculer le niveau basé sur l'XP
CREATE OR REPLACE FUNCTION calculate_level_from_xp(xp_amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  calculated_level INTEGER := 1;
BEGIN
  SELECT COALESCE(MAX(level_number), 1)
  INTO calculated_level
  FROM levels_xp_config
  WHERE xp_required <= xp_amount;
  
  RETURN calculated_level;
END;
$$;

-- Fonction pour obtenir le rôle gamifié basé sur le niveau
CREATE OR REPLACE FUNCTION get_gamified_role(level_num INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  role_name TEXT := 'Apprenti Conseiller';
BEGIN
  SELECT grc.role_name
  INTO role_name
  FROM gamified_roles_config grc
  WHERE grc.min_level_required <= level_num
  ORDER BY grc.min_level_required DESC
  LIMIT 1;
  
  RETURN role_name;
END;
$$;

-- Fonction principale pour attribuer de l'XP et mettre à jour le niveau
CREATE OR REPLACE FUNCTION award_xp(
  user_uuid UUID,
  xp_amount INTEGER,
  activity_type_param activity_type,
  activity_details JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_level INTEGER;
  new_level INTEGER;
  new_xp INTEGER;
  new_role TEXT;
  level_up_occurred BOOLEAN := FALSE;
  result JSONB;
BEGIN
  -- Vérifier que l'utilisateur existe
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = user_uuid) THEN
    RAISE EXCEPTION 'Utilisateur introuvable: %', user_uuid;
  END IF;
  
  -- Récupérer les données actuelles de l'utilisateur
  SELECT current_level, current_xp
  INTO old_level, new_xp
  FROM users
  WHERE id = user_uuid;
  
  -- Ajouter l'XP (ne peut pas être négatif)
  new_xp := GREATEST(new_xp + xp_amount, 0);
  
  -- Calculer le nouveau niveau
  new_level := calculate_level_from_xp(new_xp);
  
  -- Obtenir le nouveau rôle gamifié
  new_role := get_gamified_role(new_level);
  
  -- Vérifier si il y a eu montée de niveau
  level_up_occurred := new_level > old_level;
  
  -- Mettre à jour le profil utilisateur
  UPDATE users
  SET 
    current_xp = new_xp,
    current_level = new_level,
    gamified_role = new_role,
    last_activity_at = NOW(),
    updated_at = NOW()
  WHERE id = user_uuid;
  
  -- Enregistrer l'activité principale
  INSERT INTO recent_activities (user_id, activity_type, activity_details_json, xp_gained)
  VALUES (user_uuid, activity_type_param, activity_details, xp_amount);
  
  -- Si niveau augmenté, enregistrer l'événement de montée de niveau
  IF level_up_occurred THEN
    INSERT INTO recent_activities (user_id, activity_type, activity_details_json, xp_gained)
    VALUES (
      user_uuid, 
      'level_up'::activity_type, 
      jsonb_build_object(
        'old_level', old_level,
        'new_level', new_level,
        'old_role', (SELECT gamified_role FROM users WHERE id = user_uuid),
        'new_role', new_role
      ), 
      0
    );
  END IF;
  
  -- Construire le résultat
  result := jsonb_build_object(
    'success', true,
    'old_xp', new_xp - xp_amount,
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

-- Fonction pour calculer l'XP d'un examen basé sur la performance
CREATE OR REPLACE FUNCTION calculate_exam_xp(
  base_xp INTEGER,
  score_percentage NUMERIC,
  time_spent_seconds INTEGER,
  time_limit_seconds INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  calculated_xp INTEGER;
  score_multiplier NUMERIC := 1.0;
  time_bonus NUMERIC := 0.0;
  final_multiplier NUMERIC;
BEGIN
  -- Multiplicateur basé sur le score
  IF score_percentage >= 95 THEN
    score_multiplier := 1.5;  -- Excellent
  ELSIF score_percentage >= 85 THEN
    score_multiplier := 1.3;  -- Très bien
  ELSIF score_percentage >= 75 THEN
    score_multiplier := 1.1;  -- Bien
  ELSIF score_percentage >= 70 THEN
    score_multiplier := 1.0;  -- Passable
  ELSE
    score_multiplier := 0.5;  -- Échec (XP réduit mais pas zéro)
  END IF;
  
  -- Bonus de temps (si terminé rapidement)
  IF time_limit_seconds > 0 AND time_spent_seconds > 0 THEN
    IF time_spent_seconds < (time_limit_seconds * 0.75) THEN
      time_bonus := 0.25;  -- Bonus 25% pour finir en moins de 75% du temps
    ELSIF time_spent_seconds < (time_limit_seconds * 0.9) THEN
      time_bonus := 0.1;   -- Bonus 10% pour finir en moins de 90% du temps
    END IF;
  END IF;
  
  final_multiplier := score_multiplier + time_bonus;
  calculated_xp := ROUND(base_xp * final_multiplier);
  
  RETURN GREATEST(calculated_xp, 0);
END;
$$;

-- Fonction pour vérifier les permissions utilisateur
CREATE OR REPLACE FUNCTION user_has_permission(user_uuid UUID, permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_permission BOOLEAN := FALSE;
  user_is_admin BOOLEAN := FALSE;
  user_is_supreme BOOLEAN := FALSE;
BEGIN
  -- Récupérer les statuts admin de l'utilisateur
  SELECT is_admin, is_supreme_admin
  INTO user_is_admin, user_is_supreme
  FROM users
  WHERE id = user_uuid;
  
  -- Si utilisateur suprême, accès à tout
  IF user_is_supreme THEN
    RETURN TRUE;
  END IF;
  
  -- Si demande permission admin et utilisateur est admin
  IF permission_name IN ('admin', 'supreme_admin') THEN
    RETURN user_is_admin OR user_is_supreme;
  END IF;
  
  -- Vérifier les permissions spécifiques
  SELECT EXISTS(
    SELECT 1
    FROM user_permissions up
    JOIN permissions p ON up.permission_id = p.id
    WHERE up.user_id = user_uuid 
    AND p.name::TEXT = permission_name
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$;

-- Fonction pour obtenir les statistiques utilisateur
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats JSONB;
  total_exams INTEGER := 0;
  passed_exams INTEGER := 0;
  avg_score NUMERIC := 0;
  total_podcasts INTEGER := 0;
  total_minigames INTEGER := 0;
  current_streak INTEGER := 0;
  rank_position INTEGER := 0;
BEGIN
  -- Statistiques des examens
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE passed = TRUE),
    COALESCE(AVG(score_percentage), 0)
  INTO total_exams, passed_exams, avg_score
  FROM user_exam_attempts
  WHERE user_id = user_uuid;
  
  -- Compter les podcasts écoutés
  SELECT COUNT(*)
  INTO total_podcasts
  FROM recent_activities
  WHERE user_id = user_uuid 
  AND activity_type = 'podcast_listened';
  
  -- Compter les mini-jeux joués
  SELECT COUNT(*)
  INTO total_minigames
  FROM user_minigame_scores
  WHERE user_id = user_uuid;
  
  -- Calculer le rang (position dans le classement global)
  SELECT COUNT(*) + 1
  INTO rank_position
  FROM users
  WHERE current_xp > (SELECT current_xp FROM users WHERE id = user_uuid)
  AND is_active = TRUE;
  
  -- TODO: Implémenter le calcul de streak (jours consécutifs d'activité)
  current_streak := 0;
  
  stats := jsonb_build_object(
    'total_exams', total_exams,
    'passed_exams', passed_exams,
    'failed_exams', total_exams - passed_exams,
    'average_score', ROUND(avg_score, 2),
    'total_podcasts_listened', total_podcasts,
    'total_minigames_played', total_minigames,
    'current_streak', current_streak,
    'rank_position', rank_position
  );
  
  RETURN stats;
END;
$$;

-- Fonction pour nettoyer les anciennes activités (maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_activities()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Garder seulement les 100 dernières activités par utilisateur
  WITH ranked_activities AS (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY occurred_at DESC) as rn
    FROM recent_activities
  )
  DELETE FROM recent_activities
  WHERE id IN (
    SELECT id FROM ranked_activities WHERE rn > 100
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Fonction pour créer un utilisateur avec permissions initiales
CREATE OR REPLACE FUNCTION create_user_with_permissions(
  user_id UUID,
  primerica_id_param TEXT,
  email_param TEXT,
  first_name_param TEXT,
  last_name_param TEXT,
  initial_role_param user_role
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  permission_ids INTEGER[];
BEGIN
  -- Insérer l'utilisateur
  INSERT INTO users (
    id, primerica_id, email, first_name, last_name, initial_role
  ) VALUES (
    user_id, primerica_id_param, email_param, first_name_param, last_name_param, initial_role_param
  );
  
  -- Déterminer les permissions à attribuer
  CASE initial_role_param
    WHEN 'PQAP' THEN
      SELECT ARRAY[id] INTO permission_ids FROM permissions WHERE name = 'pqap';
    WHEN 'FONDS_MUTUELS' THEN
      SELECT ARRAY[id] INTO permission_ids FROM permissions WHERE name = 'fonds_mutuels';
    WHEN 'LES_DEUX' THEN
      SELECT ARRAY_AGG(id) INTO permission_ids FROM permissions WHERE name IN ('pqap', 'fonds_mutuels');
  END CASE;
  
  -- Attribuer les permissions
  INSERT INTO user_permissions (user_id, permission_id, granted_by)
  SELECT user_id, unnest(permission_ids), user_id;
  
  -- Enregistrer l'activité de création
  INSERT INTO recent_activities (user_id, activity_type, activity_details_json)
  VALUES (user_id, 'user_created', jsonb_build_object(
    'initial_role', initial_role_param,
    'permissions_granted', permission_ids
  ));
  
  result := jsonb_build_object(
    'success', true,
    'user_id', user_id,
    'permissions_granted', permission_ids
  );
  
  RETURN result;
END;
$$;

-- Fonction pour enregistrer les logs d'administration
CREATE OR REPLACE FUNCTION log_admin_action(
  admin_id UUID,
  action_type_param TEXT,
  target_entity_param TEXT DEFAULT NULL,
  target_id_param TEXT DEFAULT NULL,
  details_param JSONB DEFAULT '{}'::jsonb,
  ip_address_param INET DEFAULT NULL,
  user_agent_param TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO admin_logs (
    admin_user_id, action_type, target_entity, target_id, 
    details_json, ip_address, user_agent
  ) VALUES (
    admin_id, action_type_param, target_entity_param, target_id_param,
    details_param, ip_address_param, user_agent_param
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Appliquer les triggers updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_podcast_content_updated_at ON podcast_content;
CREATE TRIGGER update_podcast_content_updated_at
  BEFORE UPDATE ON podcast_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_exams_updated_at ON exams;
CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON exams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_minigames_updated_at ON minigames;
CREATE TRIGGER update_minigames_updated_at
  BEFORE UPDATE ON minigames
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();