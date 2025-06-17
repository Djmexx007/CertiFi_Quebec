/*
  # Fonctions PostgreSQL pour CertiFi Québec

  1. Fonctions de Gamification
    - award_xp: Attribution d'XP et mise à jour automatique du niveau
    - calculate_exam_xp: Calcul intelligent de l'XP d'examen
    - get_user_stats: Statistiques complètes utilisateur
    - cleanup_old_activities: Nettoyage automatique des anciennes activités

  2. Fonctions d'Administration
    - log_admin_action: Journalisation des actions administratives
    - create_user_with_permissions: Création d'utilisateur avec permissions

  3. Triggers
    - Mise à jour automatique des timestamps
    - Validation des données
*/

-- ============================================================================
-- FONCTION D'ATTRIBUTION D'XP ET MISE À JOUR DU NIVEAU
-- ============================================================================

CREATE OR REPLACE FUNCTION award_xp(
  user_uuid UUID,
  xp_amount INTEGER,
  activity_type_param activity_type,
  activity_details JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB AS $$
DECLARE
  current_user_record users%ROWTYPE;
  new_xp INTEGER;
  new_level INTEGER;
  new_role TEXT;
  old_level INTEGER;
  level_up_occurred BOOLEAN := false;
  result JSONB;
BEGIN
  -- Récupérer les données actuelles de l'utilisateur
  SELECT * INTO current_user_record
  FROM users
  WHERE id = user_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utilisateur non trouvé: %', user_uuid;
  END IF;
  
  -- Calculer le nouvel XP
  new_xp := current_user_record.current_xp + xp_amount;
  old_level := current_user_record.current_level;
  
  -- Déterminer le nouveau niveau basé sur l'XP
  SELECT level_number, level_title INTO new_level, new_role
  FROM levels_xp_config
  WHERE xp_required <= new_xp
  ORDER BY level_number DESC
  LIMIT 1;
  
  -- Si aucun niveau trouvé, garder le niveau 1
  IF new_level IS NULL THEN
    new_level := 1;
    SELECT level_title INTO new_role
    FROM levels_xp_config
    WHERE level_number = 1;
  END IF;
  
  -- Vérifier si un level up a eu lieu
  IF new_level > old_level THEN
    level_up_occurred := true;
  END IF;
  
  -- Mettre à jour l'utilisateur
  UPDATE users
  SET 
    current_xp = new_xp,
    current_level = new_level,
    gamified_role = new_role,
    last_activity_at = NOW(),
    updated_at = NOW()
  WHERE id = user_uuid;
  
  -- Enregistrer l'activité
  INSERT INTO recent_activities (user_id, activity_type, activity_details_json, xp_gained)
  VALUES (user_uuid, activity_type_param, activity_details, xp_amount);
  
  -- Si level up, enregistrer une activité supplémentaire
  IF level_up_occurred THEN
    INSERT INTO recent_activities (user_id, activity_type, activity_details_json, xp_gained)
    VALUES (user_uuid, 'level_up', jsonb_build_object(
      'old_level', old_level,
      'new_level', new_level,
      'new_role', new_role
    ), 0);
  END IF;
  
  -- Construire le résultat
  result := jsonb_build_object(
    'old_xp', current_user_record.current_xp,
    'new_xp', new_xp,
    'old_level', old_level,
    'new_level', new_level,
    'new_role', new_role,
    'level_up_occurred', level_up_occurred,
    'xp_gained', xp_amount
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FONCTION DE CALCUL D'XP POUR LES EXAMENS
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_exam_xp(
  base_xp INTEGER,
  score_percentage NUMERIC,
  time_spent_seconds INTEGER,
  time_limit_seconds INTEGER
) RETURNS INTEGER AS $$
DECLARE
  final_xp INTEGER;
  score_multiplier NUMERIC;
  time_bonus NUMERIC;
BEGIN
  -- Multiplicateur basé sur le score (0.5x à 1.5x)
  score_multiplier := GREATEST(0.5, LEAST(1.5, score_percentage / 100.0 * 1.5));
  
  -- Bonus de temps (jusqu'à 20% de bonus si terminé rapidement)
  IF time_spent_seconds < time_limit_seconds * 0.75 THEN
    time_bonus := 1.2;
  ELSIF time_spent_seconds < time_limit_seconds * 0.9 THEN
    time_bonus := 1.1;
  ELSE
    time_bonus := 1.0;
  END IF;
  
  -- Calcul final
  final_xp := ROUND(base_xp * score_multiplier * time_bonus);
  
  -- Minimum 10 XP pour toute tentative
  RETURN GREATEST(10, final_xp);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- FONCTION DE STATISTIQUES UTILISATEUR
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSONB AS $$
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
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE passed = true),
    COUNT(*) FILTER (WHERE passed = false),
    ROUND(AVG(score_percentage), 2)
  INTO total_exams, passed_exams, failed_exams, avg_score
  FROM user_exam_attempts
  WHERE user_id = user_uuid;
  
  -- Nombre de podcasts écoutés
  SELECT COUNT(*)
  INTO total_podcasts
  FROM recent_activities
  WHERE user_id = user_uuid AND activity_type = 'podcast_listened';
  
  -- Nombre de mini-jeux joués
  SELECT COUNT(*)
  INTO total_minigames
  FROM user_minigame_scores
  WHERE user_id = user_uuid;
  
  -- Calcul du streak (jours consécutifs d'activité)
  WITH daily_activities AS (
    SELECT DISTINCT DATE(occurred_at) as activity_date
    FROM recent_activities
    WHERE user_id = user_uuid
    AND occurred_at >= CURRENT_DATE - INTERVAL '30 days'
    ORDER BY activity_date DESC
  ),
  streak_calc AS (
    SELECT 
      activity_date,
      ROW_NUMBER() OVER (ORDER BY activity_date DESC) as rn,
      activity_date + INTERVAL '1 day' * ROW_NUMBER() OVER (ORDER BY activity_date DESC) as expected_date
    FROM daily_activities
  )
  SELECT COUNT(*)
  INTO current_streak
  FROM streak_calc
  WHERE expected_date = CURRENT_DATE + INTERVAL '1 day' * rn;
  
  -- Position dans le classement
  SELECT COUNT(*) + 1
  INTO rank_position
  FROM users
  WHERE current_xp > (SELECT current_xp FROM users WHERE id = user_uuid)
  AND is_active = true;
  
  -- Construction du JSON de statistiques
  stats := jsonb_build_object(
    'total_exams', COALESCE(total_exams, 0),
    'passed_exams', COALESCE(passed_exams, 0),
    'failed_exams', COALESCE(failed_exams, 0),
    'average_score', COALESCE(avg_score, 0),
    'total_podcasts_listened', COALESCE(total_podcasts, 0),
    'total_minigames_played', COALESCE(total_minigames, 0),
    'current_streak', COALESCE(current_streak, 0),
    'rank_position', COALESCE(rank_position, 1)
  );
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FONCTION DE JOURNALISATION ADMIN
-- ============================================================================

CREATE OR REPLACE FUNCTION log_admin_action(
  admin_id UUID,
  action_type_param admin_action_type,
  target_entity_param TEXT DEFAULT NULL,
  target_id_param TEXT DEFAULT NULL,
  details_param JSONB DEFAULT '{}'::jsonb,
  ip_address_param TEXT DEFAULT NULL,
  user_agent_param TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO admin_logs (
    admin_user_id,
    action_type,
    target_entity,
    target_id,
    details_json,
    ip_address,
    user_agent
  ) VALUES (
    admin_id,
    action_type_param,
    target_entity_param,
    target_id_param,
    details_param,
    ip_address_param,
    user_agent_param
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FONCTION DE CRÉATION D'UTILISATEUR AVEC PERMISSIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION create_user_with_permissions(
  user_id UUID,
  primerica_id_param TEXT,
  email_param TEXT,
  first_name_param TEXT,
  last_name_param TEXT,
  initial_role_param user_role
) RETURNS JSONB AS $$
DECLARE
  permission_ids INTEGER[];
  result JSONB;
BEGIN
  -- Insérer l'utilisateur
  INSERT INTO users (
    id,
    primerica_id,
    email,
    first_name,
    last_name,
    initial_role
  ) VALUES (
    user_id,
    primerica_id_param,
    email_param,
    first_name_param,
    last_name_param,
    initial_role_param
  );
  
  -- Déterminer les permissions basées sur le rôle initial
  CASE initial_role_param
    WHEN 'PQAP' THEN
      SELECT ARRAY[id] INTO permission_ids
      FROM permissions WHERE name = 'pqap';
    WHEN 'FONDS_MUTUELS' THEN
      SELECT ARRAY[id] INTO permission_ids
      FROM permissions WHERE name = 'fonds_mutuels';
    WHEN 'LES_DEUX' THEN
      SELECT ARRAY_AGG(id) INTO permission_ids
      FROM permissions WHERE name IN ('pqap', 'fonds_mutuels');
  END CASE;
  
  -- Attribuer les permissions
  IF permission_ids IS NOT NULL THEN
    INSERT INTO user_permissions (user_id, permission_id)
    SELECT user_id, unnest(permission_ids);
  END IF;
  
  -- Enregistrer l'activité de création
  INSERT INTO recent_activities (user_id, activity_type, activity_details_json)
  VALUES (user_id, 'login', jsonb_build_object(
    'first_login', true,
    'role', initial_role_param
  ));
  
  result := jsonb_build_object(
    'user_id', user_id,
    'permissions_assigned', permission_ids,
    'success', true
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FONCTION DE NETTOYAGE DES ANCIENNES ACTIVITÉS
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_activities()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Supprimer les activités de plus de 90 jours
  DELETE FROM recent_activities
  WHERE occurred_at < CURRENT_DATE - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS POUR MISE À JOUR AUTOMATIQUE DES TIMESTAMPS
-- ============================================================================

-- Fonction générique pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour les tables avec updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_podcast_content_updated_at
  BEFORE UPDATE ON podcast_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON exams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_minigames_updated_at
  BEFORE UPDATE ON minigames
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();