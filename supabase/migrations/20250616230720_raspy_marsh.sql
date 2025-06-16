/*
  # Fonctions et Triggers pour CertiFi Québec

  1. Fonctions utilitaires
    - Calcul et attribution XP
    - Mise à jour niveau automatique
    - Enregistrement activités
    - Vérification permissions

  2. Triggers
    - Création profil automatique
    - Mise à jour timestamps
    - Gamification automatique
*/

-- Fonction pour calculer le niveau basé sur l'XP
CREATE OR REPLACE FUNCTION calculate_level_from_xp(xp_amount integer)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  calculated_level integer := 1;
BEGIN
  SELECT COALESCE(MAX(level_number), 1)
  INTO calculated_level
  FROM levels_xp_config
  WHERE xp_required <= xp_amount;
  
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
  SELECT grc.role_name
  INTO role_name
  FROM gamified_roles_config grc
  WHERE grc.min_level_required <= level_num
  ORDER BY grc.min_level_required DESC
  LIMIT 1;
  
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
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_level integer;
  new_level integer;
  new_xp integer;
  new_role text;
BEGIN
  -- Récupérer les données actuelles de l'utilisateur
  SELECT current_level, current_xp
  INTO old_level, new_xp
  FROM profiles
  WHERE id = user_uuid;
  
  -- Ajouter l'XP
  new_xp := new_xp + xp_amount;
  
  -- Calculer le nouveau niveau
  new_level := calculate_level_from_xp(new_xp);
  
  -- Obtenir le nouveau rôle gamifié
  new_role := get_gamified_role(new_level);
  
  -- Mettre à jour le profil
  UPDATE profiles
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
  IF new_level > old_level THEN
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
  
  -- Créer le profil
  INSERT INTO profiles (
    id,
    primerica_id,
    first_name,
    last_name,
    initial_role,
    current_xp,
    current_level,
    gamified_role
  ) VALUES (
    NEW.id,
    primerica_number,
    user_first_name,
    user_last_name,
    user_role,
    0,
    1,
    'Apprenti Conseiller'
  );
  
  -- Attribuer les permissions basées sur le rôle
  IF user_role = 'PQAP' THEN
    INSERT INTO user_permissions (user_id, permission_id)
    SELECT NEW.id, id FROM permissions WHERE name = 'PQAP';
  ELSIF user_role = 'FONDS_MUTUELS' THEN
    INSERT INTO user_permissions (user_id, permission_id)
    SELECT NEW.id, id FROM permissions WHERE name = 'FONDS_MUTUELS';
  ELSIF user_role = 'LES_DEUX' THEN
    INSERT INTO user_permissions (user_id, permission_id)
    SELECT NEW.id, id FROM permissions WHERE name IN ('PQAP', 'FONDS_MUTUELS');
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
  FROM profiles
  WHERE id = user_uuid;
  
  IF has_permission THEN
    RETURN true;
  END IF;
  
  -- Vérifier si l'utilisateur est admin et demande une permission admin
  IF permission_name IN ('ADMIN', 'SUPREME_ADMIN') THEN
    SELECT (is_admin OR is_supreme_admin) INTO has_permission
    FROM profiles
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
BEGIN
  SELECT jsonb_build_object(
    'total_exams', COUNT(DISTINCT uea.id),
    'passed_exams', COUNT(DISTINCT CASE WHEN uea.passed THEN uea.id END),
    'average_score', ROUND(AVG(uea.score_percentage), 2),
    'total_podcasts_listened', COUNT(DISTINCT CASE WHEN ra.activity_type = 'podcast_listened' THEN ra.id END),
    'total_minigames_played', COUNT(DISTINCT CASE WHEN ra.activity_type = 'minigame_played' THEN ra.id END),
    'current_streak', 0, -- À implémenter selon la logique de streak
    'rank_position', 0 -- À calculer selon le classement
  ) INTO stats
  FROM profiles p
  LEFT JOIN user_exam_attempts uea ON p.id = uea.user_id
  LEFT JOIN recent_activities ra ON p.id = ra.user_id
  WHERE p.id = user_uuid
  GROUP BY p.id;
  
  RETURN COALESCE(stats, '{}'::jsonb);
END;
$$;

-- Trigger pour créer automatiquement un profil
CREATE OR REPLACE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_new_user();

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Appliquer le trigger updated_at aux tables appropriées
CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
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