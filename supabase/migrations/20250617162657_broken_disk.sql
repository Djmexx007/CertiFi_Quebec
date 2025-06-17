-- =====================================================
-- CRÉATION DE L'UTILISATEUR ADMINISTRATEUR INITIAL
-- =====================================================

-- Fonction utilitaire pour nettoyer complètement un utilisateur
CREATE OR REPLACE FUNCTION cleanup_admin_user(target_email text, target_primerica_id text)
RETURNS void AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Nettoyer par email dans auth.users
    FOR user_record IN 
        SELECT id FROM auth.users WHERE email = target_email
    LOOP
        DELETE FROM user_permissions WHERE user_id = user_record.id;
        DELETE FROM users WHERE id = user_record.id;
        DELETE FROM auth.users WHERE id = user_record.id;
        RAISE NOTICE 'Nettoyé utilisateur auth par email: %', user_record.id;
    END LOOP;
    
    -- Nettoyer par primerica_id dans users
    FOR user_record IN 
        SELECT id FROM users WHERE primerica_id = target_primerica_id
    LOOP
        DELETE FROM user_permissions WHERE user_id = user_record.id;
        DELETE FROM auth.users WHERE id = user_record.id;
        DELETE FROM users WHERE id = user_record.id;
        RAISE NOTICE 'Nettoyé utilisateur par primerica_id: %', user_record.id;
    END LOOP;
    
    -- Nettoyer par email dans users
    FOR user_record IN 
        SELECT id FROM users WHERE email = target_email
    LOOP
        DELETE FROM user_permissions WHERE user_id = user_record.id;
        DELETE FROM auth.users WHERE id = user_record.id;
        DELETE FROM users WHERE id = user_record.id;
        RAISE NOTICE 'Nettoyé utilisateur par email dans users: %', user_record.id;
    END LOOP;
    
    -- Nettoyer tous les supreme admins
    FOR user_record IN 
        SELECT id FROM users WHERE is_supreme_admin = true
    LOOP
        DELETE FROM user_permissions WHERE user_id = user_record.id;
        DELETE FROM auth.users WHERE id = user_record.id;
        DELETE FROM users WHERE id = user_record.id;
        RAISE NOTICE 'Nettoyé supreme admin: %', user_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Nettoyer tous les utilisateurs admin existants
SELECT cleanup_admin_user('admin@primerica.com', '000001');

-- Supprimer la fonction utilitaire
DROP FUNCTION cleanup_admin_user(text, text);

-- Attendre pour s'assurer que les suppressions sont commitées
SELECT pg_sleep(2);

-- Créer l'utilisateur administrateur avec gestion des conflits
DO $$
DECLARE
    admin_user_id uuid;
    admin_email text := 'admin@primerica.com';
    admin_password text := 'MotDePasseSecurise123!';
    admin_primerica_id text := '000001';
    conflict_count integer;
    max_attempts integer := 5;
    attempt_count integer := 0;
BEGIN
    WHILE attempt_count < max_attempts LOOP
        attempt_count := attempt_count + 1;
        
        -- Générer un nouvel ID unique à chaque tentative
        admin_user_id := gen_random_uuid();
        
        -- Vérifier les conflits potentiels
        SELECT COUNT(*) INTO conflict_count 
        FROM (
            SELECT id FROM auth.users WHERE email = admin_email OR id = admin_user_id
            UNION
            SELECT id FROM users WHERE primerica_id = admin_primerica_id OR email = admin_email OR id = admin_user_id
        ) conflicts;
        
        IF conflict_count > 0 THEN
            RAISE NOTICE 'Tentative %: Conflits détectés (%), nettoyage supplémentaire...', attempt_count, conflict_count;
            
            -- Nettoyage supplémentaire
            DELETE FROM user_permissions WHERE user_id IN (
                SELECT id FROM users WHERE primerica_id = admin_primerica_id OR email = admin_email
            );
            DELETE FROM users WHERE primerica_id = admin_primerica_id OR email = admin_email;
            DELETE FROM auth.users WHERE email = admin_email;
            
            -- Attendre un peu
            PERFORM pg_sleep(1);
            CONTINUE;
        END IF;
        
        BEGIN
            -- Créer l'utilisateur dans auth.users avec ON CONFLICT
            INSERT INTO auth.users (
                id,
                instance_id,
                email,
                encrypted_password,
                email_confirmed_at,
                raw_user_meta_data,
                created_at,
                updated_at,
                confirmation_token,
                email_change,
                email_change_token_new,
                recovery_token
            ) VALUES (
                admin_user_id,
                '00000000-0000-0000-0000-000000000000',
                admin_email,
                crypt(admin_password, gen_salt('bf')),
                now(),
                jsonb_build_object(
                    'primerica_id', admin_primerica_id,
                    'first_name', 'Admin',
                    'last_name', 'Suprême',
                    'initial_role', 'LES_DEUX'
                ),
                now(),
                now(),
                '',
                '',
                '',
                ''
            )
            ON CONFLICT (id) DO NOTHING;
            
            -- Vérifier que l'insertion a réussi
            IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = admin_user_id) THEN
                RAISE NOTICE 'Tentative %: Échec insertion auth.users, retry...', attempt_count;
                CONTINUE;
            END IF;
            
            RAISE NOTICE 'Tentative %: Utilisateur auth créé avec ID: %', attempt_count, admin_user_id;
            
            -- Créer le profil dans la table users avec ON CONFLICT
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
                is_active,
                last_activity_at,
                created_at,
                updated_at
            ) VALUES (
                admin_user_id,
                admin_primerica_id,
                admin_email,
                'Admin',
                'Suprême',
                'LES_DEUX',
                5000,
                8,
                'Maître Administrateur',
                true,
                true,
                true,
                now(),
                now(),
                now()
            )
            ON CONFLICT (id) DO UPDATE SET
                primerica_id = EXCLUDED.primerica_id,
                email = EXCLUDED.email,
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                is_admin = EXCLUDED.is_admin,
                is_supreme_admin = EXCLUDED.is_supreme_admin,
                updated_at = now();
            
            RAISE NOTICE 'Tentative %: Profil utilisateur créé/mis à jour avec ID: %', attempt_count, admin_user_id;
            
            -- Attribuer toutes les permissions (avec gestion des conflits)
            INSERT INTO user_permissions (user_id, permission_id, granted_by, granted_at)
            SELECT 
                admin_user_id,
                p.id,
                admin_user_id,
                now()
            FROM permissions p
            WHERE EXISTS (SELECT 1 FROM permissions LIMIT 1)
            ON CONFLICT (user_id, permission_id) DO NOTHING;
            
            RAISE NOTICE 'SUCCESS: Utilisateur administrateur créé avec succès:';
            RAISE NOTICE '  ID: %', admin_user_id;
            RAISE NOTICE '  Email: %', admin_email;
            RAISE NOTICE '  Primerica ID: %', admin_primerica_id;
            RAISE NOTICE '  Mot de passe: %', admin_password;
            RAISE NOTICE '  Tentatives nécessaires: %', attempt_count;
            
            -- Sortir de la boucle en cas de succès
            EXIT;
            
        EXCEPTION
            WHEN unique_violation THEN
                RAISE NOTICE 'Tentative %: Violation de contrainte unique, retry... Erreur: %', attempt_count, SQLERRM;
                
                -- Nettoyage en cas d'erreur
                DELETE FROM user_permissions WHERE user_id = admin_user_id;
                DELETE FROM users WHERE id = admin_user_id;
                DELETE FROM auth.users WHERE id = admin_user_id;
                
                IF attempt_count >= max_attempts THEN
                    RAISE EXCEPTION 'Échec après % tentatives. Dernière erreur: %', max_attempts, SQLERRM;
                END IF;
                
                PERFORM pg_sleep(1);
                CONTINUE;
        END;
    END LOOP;
    
    -- Vérifier que la création a réussi
    IF NOT EXISTS (SELECT 1 FROM users WHERE is_supreme_admin = true AND primerica_id = admin_primerica_id) THEN
        RAISE EXCEPTION 'ERREUR: Échec de la création de l''administrateur après % tentatives', max_attempts;
    END IF;
    
END $$;

-- Vérification finale
DO $$
DECLARE
    user_count integer;
    admin_count integer;
    auth_count integer;
    admin_user_record RECORD;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO admin_count FROM users WHERE is_supreme_admin = true;
    SELECT COUNT(*) INTO auth_count FROM auth.users WHERE email = 'admin@primerica.com';
    
    RAISE NOTICE 'Vérification finale:';
    RAISE NOTICE '  Total utilisateurs dans users: %', user_count;
    RAISE NOTICE '  Administrateurs suprêmes: %', admin_count;
    RAISE NOTICE '  Utilisateurs auth avec email admin: %', auth_count;
    
    -- Afficher les détails de l'admin créé
    SELECT * INTO admin_user_record 
    FROM users 
    WHERE is_supreme_admin = true AND primerica_id = '000001' 
    LIMIT 1;
    
    IF FOUND THEN
        RAISE NOTICE '  Admin créé - ID: %, Email: %, Primerica ID: %', 
            admin_user_record.id, admin_user_record.email, admin_user_record.primerica_id;
    END IF;
    
    IF admin_count = 0 THEN
        RAISE EXCEPTION 'ERREUR: Aucun administrateur suprême trouvé après création!';
    END IF;
    
    IF auth_count = 0 THEN
        RAISE EXCEPTION 'ERREUR: Aucun utilisateur auth trouvé après création!';
    END IF;
    
    RAISE NOTICE 'SUCCESS: Administrateur initial créé avec succès!';
END $$;