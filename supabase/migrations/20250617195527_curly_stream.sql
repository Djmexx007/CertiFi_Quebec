/*
  # Fonctions métier et triggers

  1. Fonctions utilitaires
    - `update_updated_at()` : Trigger pour mise à jour automatique
    - `create_profile_for_new_user()` : Trigger pour création de profil

  2. Fonctions métier
    - `create_user_with_permissions()` : Création complète d'utilisateur
    - `award_xp()` : Attribution d'XP avec gestion de niveau
    - `get_user_stats()` : Statistiques utilisateur
    - `calculate_exam_xp()` : Calcul XP d'examen
    - `log_admin_action()` : Logging des actions admin
    - `cleanup_old_activities()` : Nettoyage automatique

  3. Sécurité
    - Toutes les fonctions en SECURITY DEFINER
    - Validation des paramètres
    - Gestion d'erreur robuste
*/

-- =============================================
-- FONCTION UTILITAIRE : UPDATE TIMESTAMP
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- =============================================
-- FONCTION TRIGGER : CRÉATION PROFIL AUTO
-- =============================================

CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_metadata JSONB;
    primerica_id_val TEXT;
    first_name_val TEXT;
    last_name_val TEXT;
    initial_role_val user_role;
BEGIN
    -- Extraire les métadonnées
    user_metadata := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    
    primerica_id_val := user_metadata->>'primerica_id';
    first_name_val := user_metadata->>'first_name';
    last_name_val := user_metadata->>'last_name';
    initial_role_val := (user_metadata->>'initial_role')::user_role;
    
    -- Vérifier que les données essentielles sont présentes
    IF primerica_id_val IS NULL OR first_name_val IS NULL OR last_name_val IS NULL OR initial_role_val IS NULL THEN
        RAISE WARNING 'Métadonnées incomplètes pour l''utilisateur %', NEW.id;
        RETURN NEW;
    END IF;
    
    -- Créer le profil utilisateur
    INSERT INTO public.users (
        id, primerica_id, email, first_name, last_name, initial_role,
        current_xp, current_level, gamified_role, is_admin, is_supreme_admin, is_active
    ) VALUES (
        NEW.id, primerica_id_val, NEW.email, first_name_val, last_name_val, initial_role_val,
        0, 1, 'Apprenti Conseiller', false, false, true
    )
    ON CONFLICT (id) DO UPDATE SET
        primerica_id = EXCLUDED.primerica_id,
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        initial_role = EXCLUDED.initial_role,
        updated_at = now();
    
    -- Attribuer les permissions de base selon le rôle
    PERFORM public.create_user_with_permissions(
        NEW.id, primerica_id_val, NEW.email, first_name_val, last_name_val, initial_role_val
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Erreur lors de la création du profil pour %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- =============================================
-- FONCTION : CRÉATION UTILISATEUR AVEC PERMISSIONS
-- =============================================

CREATE OR REPLACE FUNCTION public.create_user_with_permissions(
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
    permission_ids INTEGER[];
    perm_id INTEGER;
    result JSONB;
BEGIN
    -- Upsert du profil utilisateur
    INSERT INTO public.users (
        id, primerica_id, email, first_name, last_name, initial_role,
        current_xp, current_level, gamified_role, is_admin, is_supreme_admin, is_active
    ) VALUES (
        user_id, primerica_id_param, email_param, first_name_param, last_name_param, initial_role_param,
        0, 1, 'Apprenti Conseiller', false, false, true
    )
    ON CONFLICT (id) DO UPDATE SET
        primerica_id = EXCLUDED.primerica_id,
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        initial_role = EXCLUDED.initial_role,
        updated_at = now();
    
    -- Déterminer les permissions selon le rôle
    CASE initial_role_param
        WHEN 'PQAP' THEN
            SELECT ARRAY_AGG(id) INTO permission_ids 
            FROM public.permissions 
            WHERE name IN ('pqap');
        WHEN 'FONDS_MUTUELS' THEN
            SELECT ARRAY_AGG(id) INTO permission_ids 
            FROM public.permissions 
            WHERE name IN ('fonds_mutuels');
        WHEN 'LES_DEUX' THEN
            SELECT ARRAY_AGG(id) INTO permission_ids 
            FROM public.permissions 
            WHERE name IN ('pqap', 'fonds_mutuels');
    END CASE;
    
    -- Supprimer les anciennes permissions
    DELETE FROM public.user_permissions WHERE user_id = user_id;
    
    -- Attribuer les nouvelles permissions
    IF permission_ids IS NOT NULL THEN
        FOREACH perm_id IN ARRAY permission_ids
        LOOP
            INSERT INTO public.user_permissions (user_id, permission_id, granted_by)
            VALUES (user_id, perm_id, user_id)
            ON CONFLICT (user_id, permission_id) DO NOTHING;
        END LOOP;
    END IF;
    
    -- Enregistrer l'activité
    INSERT INTO public.recent_activities (user_id, activity_type, activity_details_json, xp_gained)
    VALUES (user_id, 'profile_updated', jsonb_build_object(
        'action', 'profile_created',
        'role', initial_role_param
    ), 0);
    
    result := jsonb_build_object(
        'user_id', user_id,
        'primerica_id', primerica_id_param,
        'permissions_granted', COALESCE(array_length(permission_ids, 1), 0),
        'success', true
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- =============================================
-- FONCTION : ATTRIBUTION XP
-- =============================================

CREATE OR REPLACE FUNCTION public.award_xp(
    user_uuid UUID,
    xp_amount INTEGER,
    activity_type_param TEXT DEFAULT 'admin_award',
    activity_details JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    old_xp INTEGER;
    new_xp INTEGER;
    old_level INTEGER;
    new_level INTEGER;
    level_up_occurred BOOLEAN := false;
    new_gamified_role TEXT;
    result JSONB;
BEGIN
    -- Vérifier que l'utilisateur existe
    SELECT current_xp, current_level INTO old_xp, old_level
    FROM public.users 
    WHERE id = user_uuid AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Utilisateur non trouvé ou inactif');
    END IF;
    
    -- Calculer le nouveau XP
    new_xp := old_xp + xp_amount;
    
    -- Calculer le nouveau niveau (1000 XP par niveau)
    new_level := GREATEST(1, (new_xp / 1000) + 1);
    
    -- Déterminer le nouveau rôle gamifié
    CASE 
        WHEN new_level >= 10 THEN new_gamified_role := 'Maître Conseiller';
        WHEN new_level >= 7 THEN new_gamified_role := 'Conseiller Expert';
        WHEN new_level >= 5 THEN new_gamified_role := 'Conseiller Confirmé';
        WHEN new_level >= 3 THEN new_gamified_role := 'Conseiller Intermédiaire';
        ELSE new_gamified_role := 'Apprenti Conseiller';
    END CASE;
    
    -- Vérifier si montée de niveau
    IF new_level > old_level THEN
        level_up_occurred := true;
    END IF;
    
    -- Mettre à jour l'utilisateur
    UPDATE public.users 
    SET 
        current_xp = new_xp,
        current_level = new_level,
        gamified_role = new_gamified_role,
        last_activity_at = now(),
        updated_at = now()
    WHERE id = user_uuid;
    
    -- Enregistrer l'activité
    INSERT INTO public.recent_activities (user_id, activity_type, activity_details_json, xp_gained)
    VALUES (user_uuid, activity_type_param::activity_type, activity_details, xp_amount);
    
    -- Enregistrer la montée de niveau si applicable
    IF level_up_occurred THEN
        INSERT INTO public.recent_activities (user_id, activity_type, activity_details_json, xp_gained)
        VALUES (user_uuid, 'level_up', jsonb_build_object(
            'old_level', old_level,
            'new_level', new_level,
            'new_role', new_gamified_role
        ), 0);
    END IF;
    
    result := jsonb_build_object(
        'old_xp', old_xp,
        'new_xp', new_xp,
        'xp_gained', xp_amount,
        'old_level', old_level,
        'new_level', new_level,
        'level_up_occurred', level_up_occurred,
        'new_gamified_role', new_gamified_role
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- =============================================
-- FONCTION : STATISTIQUES UTILISATEUR
-- =============================================

CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
        ROUND(AVG(score_percentage), 1)
    INTO total_exams, passed_exams, failed_exams, avg_score
    FROM public.user_exam_attempts
    WHERE user_id = user_uuid;
    
    -- Statistiques de podcasts
    SELECT COUNT(*)
    INTO total_podcasts
    FROM public.recent_activities
    WHERE user_id = user_uuid AND activity_type = 'podcast_listened';
    
    -- Statistiques de mini-jeux
    SELECT COUNT(*)
    INTO total_minigames
    FROM public.user_minigame_scores
    WHERE user_id = user_uuid;
    
    -- Calcul du streak (activités consécutives)
    WITH daily_activities AS (
        SELECT DATE(occurred_at) as activity_date
        FROM public.recent_activities
        WHERE user_id = user_uuid
        GROUP BY DATE(occurred_at)
        ORDER BY DATE(occurred_at) DESC
    ),
    streak_calc AS (
        SELECT 
            activity_date,
            ROW_NUMBER() OVER (ORDER BY activity_date DESC) as rn,
            activity_date - INTERVAL '1 day' * (ROW_NUMBER() OVER (ORDER BY activity_date DESC) - 1) as expected_date
        FROM daily_activities
    )
    SELECT COUNT(*)
    INTO current_streak
    FROM streak_calc
    WHERE DATE(expected_date) = activity_date;
    
    -- Calcul du rang
    SELECT COUNT(*) + 1
    INTO rank_position
    FROM public.users u
    WHERE u.current_xp > (SELECT current_xp FROM public.users WHERE id = user_uuid)
    AND u.is_active = true;
    
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
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- =============================================
-- FONCTION : CALCUL XP EXAMEN
-- =============================================

CREATE OR REPLACE FUNCTION public.calculate_exam_xp(
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
    final_xp INTEGER;
    time_bonus INTEGER;
    score_multiplier NUMERIC;
BEGIN
    -- Multiplicateur basé sur le score
    CASE 
        WHEN score_percentage >= 95 THEN score_multiplier := 1.5;
        WHEN score_percentage >= 85 THEN score_multiplier := 1.3;
        WHEN score_percentage >= 75 THEN score_multiplier := 1.1;
        WHEN score_percentage >= 70 THEN score_multiplier := 1.0;
        ELSE score_multiplier := 0.5;
    END CASE;
    
    -- Bonus de temps (si terminé en moins de 80% du temps limite)
    time_bonus := 0;
    IF time_spent_seconds < (time_limit_seconds * 0.8) THEN
        time_bonus := ROUND(base_xp * 0.2);
    END IF;
    
    -- Calcul final
    final_xp := ROUND(base_xp * score_multiplier) + time_bonus;
    
    RETURN GREATEST(0, final_xp);
END;
$$;

-- =============================================
-- FONCTION : LOGGING ADMIN
-- =============================================

CREATE OR REPLACE FUNCTION public.log_admin_action(
    admin_id UUID,
    action_type_param TEXT,
    target_entity_param TEXT DEFAULT NULL,
    target_id_param TEXT DEFAULT NULL,
    details_param JSONB DEFAULT '{}',
    ip_address_param TEXT DEFAULT NULL,
    user_agent_param TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.admin_logs (
        admin_user_id, action_type, target_entity, target_id, 
        details_json, ip_address, user_agent
    ) VALUES (
        admin_id, action_type_param, target_entity_param, target_id_param,
        details_param, ip_address_param, user_agent_param
    );
EXCEPTION
    WHEN OTHERS THEN
        -- Ne pas faire échouer l'opération principale si le logging échoue
        RAISE WARNING 'Erreur lors du logging admin: %', SQLERRM;
END;
$$;

-- =============================================
-- FONCTION : NETTOYAGE ACTIVITÉS ANCIENNES
-- =============================================

CREATE OR REPLACE FUNCTION public.cleanup_old_activities()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Supprimer les activités de plus de 90 jours
    DELETE FROM public.recent_activities
    WHERE occurred_at < (now() - INTERVAL '90 days');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Supprimer les logs admin de plus de 1 an
    DELETE FROM public.admin_logs
    WHERE occurred_at < (now() - INTERVAL '1 year');
    
    RETURN deleted_count;
END;
$$;

-- =============================================
-- CRÉATION DES TRIGGERS
-- =============================================

-- Trigger pour mise à jour automatique des timestamps
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_podcast_content_updated_at
    BEFORE UPDATE ON public.podcast_content
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_exams_updated_at
    BEFORE UPDATE ON public.exams
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_minigames_updated_at
    BEFORE UPDATE ON public.minigames
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Trigger pour création automatique de profil
CREATE TRIGGER trg_create_profile_for_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_profile_for_new_user();

RAISE NOTICE 'Fonctions et triggers créés avec succès - Logique métier opérationnelle';