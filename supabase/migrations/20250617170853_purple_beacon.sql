-- =====================================================
-- SUPPRESSION COMPLÈTE DES COMPTES DE DÉMONSTRATION
-- =====================================================

-- 1. Supprimer tous les utilisateurs de démonstration de auth.users
DELETE FROM auth.users 
WHERE raw_user_meta_data->>'is_demo_user' = 'true'
   OR email IN (
     'supreme.admin@certifi.quebec',
     'admin@certifi.quebec', 
     'pqap.user@certifi.quebec',
     'fonds.user@certifi.quebec',
     'both.user@certifi.quebec'
   );

-- 2. Supprimer tous les utilisateurs de démonstration de public.users
DELETE FROM users 
WHERE primerica_id IN (
  'SUPREMEADMIN001',
  'REGULARADMIN001', 
  'PQAPUSER001',
  'FONDSUSER001',
  'BOTHUSER001'
);

-- 3. Supprimer la colonne is_demo_user si elle existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'is_demo_user'
    ) THEN
        ALTER TABLE users DROP COLUMN is_demo_user;
        RAISE NOTICE 'Colonne is_demo_user supprimée de la table users';
    ELSE
        RAISE NOTICE 'Colonne is_demo_user n''existe pas dans la table users';
    END IF;
END $$;

-- 4. Supprimer les fonctions RPC liées aux utilisateurs de démonstration
DROP FUNCTION IF EXISTS toggle_demo_users(boolean);
DROP FUNCTION IF EXISTS create_demo_users();
DROP FUNCTION IF EXISTS manage_demo_users(text, boolean);

-- 5. Nettoyer les activités et logs liés aux comptes de démonstration
DELETE FROM recent_activities 
WHERE activity_details_json->>'is_demo_user' = 'true'
   OR activity_details_json->>'demo_user' = 'true';

DELETE FROM admin_logs 
WHERE action_type IN ('create_demo_users', 'toggle_demo_users', 'create_demo_user')
   OR details_json->>'is_demo_user' = 'true';

-- 6. Mettre à jour le trigger create_profile_for_new_user pour supprimer les références is_demo_user
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  pid text; fn text; ln text; ir user_role;
BEGIN
  -- Extraire les métadonnées utilisateur
  pid := NEW.raw_user_meta_data->>'primerica_id';
  fn  := NEW.raw_user_meta_data->>'first_name';
  ln  := NEW.raw_user_meta_data->>'last_name';
  ir  := (NEW.raw_user_meta_data->>'initial_role')::user_role;
  
  -- Vérifier que toutes les données requises sont présentes
  IF pid IS NULL OR fn IS NULL OR ln IS NULL OR ir IS NULL THEN
    RAISE NOTICE 'Métadonnées utilisateur incomplètes pour %', NEW.email;
    RETURN NEW;
  END IF;
  
  -- Créer le profil utilisateur avec les permissions appropriées
  PERFORM create_user_with_permissions(NEW.id, pid, NEW.email, fn, ln, ir);
  
  RETURN NEW;
END;
$$;

-- 7. Nettoyer les données de test/seed qui pourraient contenir des références aux comptes démo
-- (Cette section peut être étendue selon les besoins spécifiques)

-- 8. Vérification finale - s'assurer qu'aucun compte de démonstration ne reste
DO $$
DECLARE
    demo_count_auth integer;
    demo_count_users integer;
    demo_activities integer;
    demo_logs integer;
BEGIN
    -- Compter les utilisateurs de démonstration restants
    SELECT COUNT(*) INTO demo_count_auth 
    FROM auth.users 
    WHERE raw_user_meta_data->>'is_demo_user' = 'true';
    
    SELECT COUNT(*) INTO demo_count_users 
    FROM users 
    WHERE primerica_id IN ('SUPREMEADMIN001', 'REGULARADMIN001', 'PQAPUSER001', 'FONDSUSER001', 'BOTHUSER001');
    
    SELECT COUNT(*) INTO demo_activities 
    FROM recent_activities 
    WHERE activity_details_json->>'is_demo_user' = 'true';
    
    SELECT COUNT(*) INTO demo_logs 
    FROM admin_logs 
    WHERE action_type IN ('create_demo_users', 'toggle_demo_users');
    
    RAISE NOTICE 'Vérification finale de suppression:';
    RAISE NOTICE '  Utilisateurs démo dans auth.users: %', demo_count_auth;
    RAISE NOTICE '  Utilisateurs démo dans users: %', demo_count_users;
    RAISE NOTICE '  Activités démo restantes: %', demo_activities;
    RAISE NOTICE '  Logs démo restants: %', demo_logs;
    
    IF demo_count_auth > 0 OR demo_count_users > 0 THEN
        RAISE WARNING 'Des comptes de démonstration sont encore présents dans la base de données!';
    ELSE
        RAISE NOTICE 'SUCCESS: Tous les comptes de démonstration ont été supprimés avec succès';
    END IF;
END $$;

-- Commentaire final
COMMENT ON SCHEMA public IS 'CertiFi Québec – Schéma sans comptes de démonstration, utilisateurs réels uniquement';