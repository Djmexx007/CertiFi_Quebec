/*
  # Validation et Optimisations Finales CertiFi Québec

  1. Validation des Contraintes
    - Vérification de l'intégrité des données
    - Validation des relations entre tables
    - Contrôle des valeurs par défaut

  2. Optimisations de Performance
    - Index composites pour requêtes complexes
    - Statistiques pour l'optimiseur de requêtes
    - Contraintes de performance

  3. Fonctions de Maintenance
    - Nettoyage automatique
    - Archivage des données anciennes
    - Monitoring des performances
*/

-- ============================================================================
-- VALIDATION DES CONTRAINTES ET INTÉGRITÉ DES DONNÉES
-- ============================================================================

-- Vérifier que tous les utilisateurs ont au moins une permission
DO $$
DECLARE
  user_without_permission RECORD;
BEGIN
  FOR user_without_permission IN
    SELECT u.id, u.primerica_id, u.first_name, u.last_name
    FROM users u
    LEFT JOIN user_permissions up ON u.id = up.user_id
    WHERE up.user_id IS NULL
    AND NOT u.is_admin
    AND NOT u.is_supreme_admin
  LOOP
    RAISE NOTICE 'Utilisateur sans permission détecté: % % (ID: %)', 
      user_without_permission.first_name, 
      user_without_permission.last_name,
      user_without_permission.primerica_id;
  END LOOP;
END $$;

-- Contrainte pour s'assurer qu'un utilisateur non-admin a au moins une permission
CREATE OR REPLACE FUNCTION validate_user_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Si l'utilisateur n'est pas admin et n'a pas de permissions, lever une erreur
  IF NOT NEW.is_admin AND NOT NEW.is_supreme_admin THEN
    IF NOT EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = NEW.id
    ) THEN
      RAISE EXCEPTION 'Un utilisateur non-administrateur doit avoir au moins une permission';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour valider les permissions utilisateur
CREATE TRIGGER validate_user_permissions_trigger
  AFTER INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_user_permissions();

-- ============================================================================
-- INDEX COMPOSITES POUR OPTIMISATION DES REQUÊTES
-- ============================================================================

-- Index pour les requêtes de classement par rôle
CREATE INDEX IF NOT EXISTS idx_users_leaderboard_pqap 
ON users(current_xp DESC, current_level DESC) 
WHERE initial_role IN ('PQAP', 'LES_DEUX') AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_users_leaderboard_fonds 
ON users(current_xp DESC, current_level DESC) 
WHERE initial_role IN ('FONDS_MUTUELS', 'LES_DEUX') AND is_active = true;

-- Index pour les requêtes d'activités récentes par type
CREATE INDEX IF NOT EXISTS idx_activities_user_type_date 
ON recent_activities(user_id, activity_type, occurred_at DESC);

-- Index pour les requêtes d'examens par permission et statut
CREATE INDEX IF NOT EXISTS idx_questions_permission_active_difficulty 
ON questions(required_permission, is_active, difficulty_level) 
WHERE is_active = true;

-- Index pour les statistiques d'examens
CREATE INDEX IF NOT EXISTS idx_exam_attempts_stats 
ON user_exam_attempts(user_id, passed, attempt_date DESC);

-- Index pour les scores de mini-jeux par date
CREATE INDEX IF NOT EXISTS idx_minigame_scores_daily 
ON user_minigame_scores(user_id, minigame_id, DATE(attempt_date));

-- ============================================================================
-- FONCTIONS D'OPTIMISATION ET DE MAINTENANCE
-- ============================================================================

-- Fonction pour recalculer les statistiques utilisateur
CREATE OR REPLACE FUNCTION recalculate_user_stats(target_user_id UUID DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  user_record RECORD;
  updated_count INTEGER := 0;
BEGIN
  FOR user_record IN
    SELECT id FROM users 
    WHERE (target_user_id IS NULL OR id = target_user_id)
    AND is_active = true
  LOOP
    -- Recalculer le niveau basé sur l'XP actuel
    UPDATE users u
    SET 
      current_level = (
        SELECT level_number 
        FROM levels_xp_config 
        WHERE xp_required <= u.current_xp 
        ORDER BY level_number DESC 
        LIMIT 1
      ),
      gamified_role = (
        SELECT level_title 
        FROM levels_xp_config 
        WHERE xp_required <= u.current_xp 
        ORDER BY level_number DESC 
        LIMIT 1
      ),
      updated_at = NOW()
    WHERE id = user_record.id;
    
    updated_count := updated_count + 1;
  END LOOP;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour archiver les anciennes données
CREATE OR REPLACE FUNCTION archive_old_data()
RETURNS JSONB AS $$
DECLARE
  archived_activities INTEGER;
  archived_attempts INTEGER;
  archived_scores INTEGER;
  result JSONB;
BEGIN
  -- Archiver les activités de plus de 6 mois (garder seulement les level_up)
  DELETE FROM recent_activities
  WHERE occurred_at < CURRENT_DATE - INTERVAL '6 months'
  AND activity_type != 'level_up';
  
  GET DIAGNOSTICS archived_activities = ROW_COUNT;
  
  -- Archiver les tentatives d'examen de plus de 1 an (garder les meilleures)
  WITH ranked_attempts AS (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY user_id, exam_id 
             ORDER BY score_percentage DESC, attempt_date DESC
           ) as rn
    FROM user_exam_attempts
    WHERE attempt_date < CURRENT_DATE - INTERVAL '1 year'
  )
  DELETE FROM user_exam_attempts
  WHERE id IN (
    SELECT id FROM ranked_attempts WHERE rn > 3
  );
  
  GET DIAGNOSTICS archived_attempts = ROW_COUNT;
  
  -- Archiver les scores de mini-jeux de plus de 6 mois (garder les meilleurs)
  WITH ranked_scores AS (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY user_id, minigame_id 
             ORDER BY score DESC, attempt_date DESC
           ) as rn
    FROM user_minigame_scores
    WHERE attempt_date < CURRENT_DATE - INTERVAL '6 months'
  )
  DELETE FROM user_minigame_scores
  WHERE id IN (
    SELECT id FROM ranked_scores WHERE rn > 5
  );
  
  GET DIAGNOSTICS archived_scores = ROW_COUNT;
  
  result := jsonb_build_object(
    'archived_activities', archived_activities,
    'archived_exam_attempts', archived_attempts,
    'archived_minigame_scores', archived_scores,
    'archived_at', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VUES POUR SIMPLIFIER LES REQUÊTES COMPLEXES
-- ============================================================================

-- Vue pour le classement global
CREATE OR REPLACE VIEW leaderboard_global AS
SELECT 
  u.id,
  u.primerica_id,
  u.first_name,
  u.last_name,
  u.current_xp,
  u.current_level,
  u.gamified_role,
  u.initial_role,
  ROW_NUMBER() OVER (ORDER BY u.current_xp DESC, u.current_level DESC) as rank_position
FROM users u
WHERE u.is_active = true
ORDER BY u.current_xp DESC, u.current_level DESC;

-- Vue pour les statistiques d'examens par utilisateur
CREATE OR REPLACE VIEW user_exam_statistics AS
SELECT 
  u.id as user_id,
  u.primerica_id,
  u.first_name,
  u.last_name,
  COUNT(uea.id) as total_attempts,
  COUNT(uea.id) FILTER (WHERE uea.passed = true) as passed_attempts,
  COUNT(uea.id) FILTER (WHERE uea.passed = false) as failed_attempts,
  ROUND(AVG(uea.score_percentage), 2) as average_score,
  MAX(uea.score_percentage) as best_score,
  SUM(uea.xp_earned) as total_xp_from_exams
FROM users u
LEFT JOIN user_exam_attempts uea ON u.id = uea.user_id
WHERE u.is_active = true
GROUP BY u.id, u.primerica_id, u.first_name, u.last_name;

-- Vue pour l'activité récente globale (pour admins)
CREATE OR REPLACE VIEW global_recent_activities AS
SELECT 
  ra.id,
  ra.user_id,
  u.primerica_id,
  u.first_name,
  u.last_name,
  ra.activity_type,
  ra.activity_details_json,
  ra.xp_gained,
  ra.occurred_at
FROM recent_activities ra
JOIN users u ON ra.user_id = u.id
WHERE u.is_active = true
ORDER BY ra.occurred_at DESC;

-- ============================================================================
-- CONTRAINTES DE VALIDATION SUPPLÉMENTAIRES
-- ============================================================================

-- Contrainte pour s'assurer que l'XP est cohérent avec le niveau
ALTER TABLE users ADD CONSTRAINT check_xp_level_consistency 
CHECK (
  current_xp >= (
    SELECT COALESCE(xp_required, 0) 
    FROM levels_xp_config 
    WHERE level_number = current_level
  )
);

-- Contrainte pour s'assurer que les scores d'examen sont valides
ALTER TABLE user_exam_attempts ADD CONSTRAINT check_valid_score 
CHECK (score_percentage >= 0 AND score_percentage <= 100);

-- Contrainte pour s'assurer que les temps d'examen sont raisonnables
ALTER TABLE user_exam_attempts ADD CONSTRAINT check_reasonable_time 
CHECK (time_spent_seconds > 0 AND time_spent_seconds <= 86400); -- Max 24 heures

-- ============================================================================
-- ANALYSE DES STATISTIQUES POUR L'OPTIMISEUR
-- ============================================================================

-- Mettre à jour les statistiques pour l'optimiseur de requêtes
ANALYZE users;
ANALYZE user_permissions;
ANALYZE questions;
ANALYZE user_exam_attempts;
ANALYZE recent_activities;
ANALYZE user_minigame_scores;

-- ============================================================================
-- VALIDATION FINALE
-- ============================================================================

-- Fonction de validation complète du système
CREATE OR REPLACE FUNCTION validate_system_integrity()
RETURNS JSONB AS $$
DECLARE
  validation_results JSONB := '{}'::jsonb;
  user_count INTEGER;
  question_count INTEGER;
  exam_count INTEGER;
  permission_count INTEGER;
BEGIN
  -- Compter les éléments principaux
  SELECT COUNT(*) INTO user_count FROM users WHERE is_active = true;
  SELECT COUNT(*) INTO question_count FROM questions WHERE is_active = true;
  SELECT COUNT(*) INTO exam_count FROM exams WHERE is_active = true;
  SELECT COUNT(*) INTO permission_count FROM permissions;
  
  validation_results := jsonb_build_object(
    'validation_timestamp', NOW(),
    'active_users', user_count,
    'active_questions', question_count,
    'active_exams', exam_count,
    'total_permissions', permission_count,
    'system_status', 'healthy'
  );
  
  -- Vérifications d'intégrité
  IF user_count = 0 THEN
    validation_results := jsonb_set(validation_results, '{system_status}', '"warning: no active users"');
  END IF;
  
  IF question_count < 10 THEN
    validation_results := jsonb_set(validation_results, '{system_status}', '"warning: insufficient questions"');
  END IF;
  
  RETURN validation_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exécuter la validation finale
SELECT validate_system_integrity();