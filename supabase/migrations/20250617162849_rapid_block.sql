-- =====================================================
-- CRÉATION DE L'UTILISATEUR ADMINISTRATEUR INITIAL
-- =====================================================

-- Nettoyer complètement tous les utilisateurs admin existants
DO $$
DECLARE
    existing_user_record RECORD;
BEGIN
    -- Nettoyer par email dans auth.users
    FOR existing_user_record IN 
        SELECT id FROM auth.users WHERE email = 'admin@primerica.com'
    LOOP
        DELETE FROM user_permissions WHERE user_id = existing_user_record.id;
        DELETE FROM recent_activities WHERE user_id = existing_user_record.id;
        DELETE FROM admin_logs WHERE admin_user_id = existing_user_record.id;
        DELETE FROM users WHERE id = existing_user_record.id;
        DELETE FROM auth.users WHERE id = existing_user_record.id;
        RAISE NOTICE 'Nettoyé utilisateur auth par email: %', existing_user_record.id;
    END LOOP;
    
    -- Nettoyer par primerica_id dans users
    FOR existing_user_record IN 
        SELECT id FROM users WHERE primerica_id = '000001'
    LOOP
        DELETE FROM user_permissions WHERE user_id = existing_user_record.id;
        DELETE FROM recent_activities WHERE user_id = existing_user_record.id;
        DELETE FROM admin_logs WHERE admin_user_id = existing_user_record.id;
        DELETE FROM auth.users WHERE id = existing_user_record.id;
        DELETE FROM users WHERE id = existing_user_record.id;
        RAISE NOTICE 'Nettoyé utilisateur par primerica_id: %', existing_user_record.id;
    END LOOP;
    
    -- Nettoyer tous les supreme admins existants
    FOR existing_user_record IN 
        SELECT id FROM users WHERE is_supreme_admin = true
    LOOP
        DELETE FROM user_permissions WHERE user_id = existing_user_record.id;
        DELETE FROM recent_activities WHERE user_id = existing_user_record.id;
        DELETE FROM admin_logs WHERE admin_user_id = existing_user_record.id;
        DELETE FROM auth.users WHERE id = existing_user_record.id;
        DELETE FROM users WHERE id = existing_user_record.id;
        RAISE NOTICE 'Nettoyé supreme admin: %', existing_user_record.id;
    END LOOP;
    
    RAISE NOTICE 'Nettoyage terminé';
END $$;

-- Attendre pour s'assurer que les suppressions sont commitées
SELECT pg_sleep(1);

-- Créer l'utilisateur administrateur avec une approche UPSERT
DO $$
DECLARE
    admin_user_id uuid := '11111111-1111-1111-1111-111111111111'; -- ID fixe pour éviter les conflits
    admin_email text := 'admin@primerica.com';
    admin_password text := 'MotDePasseSecurise123!';
    admin_primerica_id text := '000001';
    auth_user_exists boolean := false;
    profile_user_exists boolean := false;
BEGIN
    -- Vérifier si l'utilisateur auth existe déjà
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = admin_user_id OR email = admin_email) 
    INTO auth_user_exists;
    
    -- Vérifier si le profil utilisateur existe déjà
    SELECT EXISTS(SELECT 1 FROM users WHERE id = admin_user_id OR primerica_id = admin_primerica_id OR email = admin_email) 
    INTO profile_user_exists;
    
    RAISE NOTICE 'État initial - Auth user exists: %, Profile user exists: %', auth_user_exists, profile_user_exists;
    
    -- Créer ou mettre à jour l'utilisateur dans auth.users
    IF NOT auth_user_exists THEN
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
        );
        RAISE NOTICE 'Utilisateur auth créé avec ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Utilisateur auth existe déjà';
    END IF;
    
    -- Créer ou mettre à jour le profil dans la table users
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
        initial_role = EXCLUDED.initial_role,
        current_xp = EXCLUDED.current_xp,
        current_level = EXCLUDED.current_level,
        gamified_role = EXCLUDED.gamified_role,
        is_admin = EXCLUDED.is_admin,
        is_supreme_admin = EXCLUDED.is_supreme_admin,
        is_active = EXCLUDED.is_active,
        updated_at = now();
    
    RAISE NOTICE 'Profil utilisateur créé/mis à jour avec ID: %', admin_user_id;
    
    -- Attribuer toutes les permissions (avec gestion des conflits)
    INSERT INTO user_permissions (user_id, permission_id, granted_by, granted_at)
    SELECT 
        admin_user_id,
        p.id,
        admin_user_id,
        now()
    FROM permissions p
    ON CONFLICT (user_id, permission_id) DO NOTHING;
    
    RAISE NOTICE 'Permissions attribuées';
    
    RAISE NOTICE 'SUCCESS: Utilisateur administrateur créé/mis à jour avec succès:';
    RAISE NOTICE '  ID: %', admin_user_id;
    RAISE NOTICE '  Email: %', admin_email;
    RAISE NOTICE '  Primerica ID: %', admin_primerica_id;
    RAISE NOTICE '  Mot de passe: %', admin_password;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erreur lors de la création de l''admin: % - %', SQLSTATE, SQLERRM;
END $$;

-- Créer les autres utilisateurs de démonstration
DO $$
DECLARE
    demo_users RECORD;
    user_id uuid;
BEGIN
    -- Définir les utilisateurs de démonstration
    FOR demo_users IN 
        SELECT * FROM (VALUES
            ('SUPREMEADMIN001', 'supreme.admin@certifi.quebec', 'Admin', 'Suprême', 'LES_DEUX', true, true, 5000, 8, 'Maître Administrateur'),
            ('REGULARADMIN001', 'admin@certifi.quebec', 'Admin', 'Régulier', 'LES_DEUX', true, false, 3500, 6, 'Conseiller Expert'),
            ('PQAPUSER001', 'pqap.user@certifi.quebec', 'Jean', 'Dupont', 'PQAP', false, false, 2750, 4, 'Conseiller Débutant'),
            ('FONDSUSER001', 'fonds.user@certifi.quebec', 'Marie', 'Tremblay', 'FONDS_MUTUELS', false, false, 4200, 7, 'Conseiller Expert'),
            ('BOTHUSER001', 'both.user@certifi.quebec', 'Pierre', 'Bouchard', 'LES_DEUX', false, false, 6800, 9, 'Conseiller Maître')
        ) AS t(primerica_id, email, first_name, last_name, initial_role, is_admin, is_supreme_admin, current_xp, current_level, gamified_role)
    LOOP
        -- Générer un ID unique pour chaque utilisateur
        user_id := gen_random_uuid();
        
        -- Vérifier si l'utilisateur existe déjà
        IF EXISTS (SELECT 1 FROM users WHERE primerica_id = demo_users.primerica_id) THEN
            RAISE NOTICE 'Utilisateur % existe déjà, ignoré', demo_users.primerica_id;
            CONTINUE;
        END IF;
        
        BEGIN
            -- Créer l'utilisateur dans auth.users
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
                user_id,
                '00000000-0000-0000-0000-000000000000',
                demo_users.email,
                crypt('password123', gen_salt('bf')),
                now(),
                jsonb_build_object(
                    'primerica_id', demo_users.primerica_id,
                    'first_name', demo_users.first_name,
                    'last_name', demo_users.last_name,
                    'initial_role', demo_users.initial_role,
                    'is_demo_user', true
                ),
                now(),
                now(),
                '',
                '',
                '',
                ''
            );
            
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
                is_active,
                last_activity_at,
                created_at,
                updated_at
            ) VALUES (
                user_id,
                demo_users.primerica_id,
                demo_users.email,
                demo_users.first_name,
                demo_users.last_name,
                demo_users.initial_role::user_role,
                demo_users.current_xp,
                demo_users.current_level,
                demo_users.gamified_role,
                demo_users.is_admin,
                demo_users.is_supreme_admin,
                true,
                now(),
                now(),
                now()
            );
            
            -- Attribuer les permissions selon le rôle
            INSERT INTO user_permissions (user_id, permission_id, granted_by, granted_at)
            SELECT 
                user_id,
                p.id,
                user_id,
                now()
            FROM permissions p
            WHERE (
                (demo_users.initial_role = 'PQAP' AND p.name = 'pqap') OR
                (demo_users.initial_role = 'FONDS_MUTUELS' AND p.name = 'fonds_mutuels') OR
                (demo_users.initial_role = 'LES_DEUX' AND p.name IN ('pqap', 'fonds_mutuels'))
            )
            ON CONFLICT (user_id, permission_id) DO NOTHING;
            
            RAISE NOTICE 'Utilisateur de démonstration créé: % (ID: %)', demo_users.primerica_id, user_id;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Erreur lors de la création de %: %', demo_users.primerica_id, SQLERRM;
        END;
    END LOOP;
END $$;

-- Vérification finale
DO $$
DECLARE
    user_count integer;
    admin_count integer;
    auth_count integer;
    demo_count integer;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO admin_count FROM users WHERE is_supreme_admin = true;
    SELECT COUNT(*) INTO auth_count FROM auth.users WHERE email LIKE '%@certifi.quebec' OR email = 'admin@primerica.com';
    SELECT COUNT(*) INTO demo_count FROM users WHERE primerica_id LIKE '%USER001' OR primerica_id LIKE '%ADMIN001';
    
    RAISE NOTICE 'Vérification finale:';
    RAISE NOTICE '  Total utilisateurs dans users: %', user_count;
    RAISE NOTICE '  Administrateurs suprêmes: %', admin_count;
    RAISE NOTICE '  Utilisateurs auth créés: %', auth_count;
    RAISE NOTICE '  Utilisateurs de démonstration: %', demo_count;
    
    -- Lister tous les utilisateurs créés
    FOR user_record IN 
        SELECT primerica_id, email, first_name, last_name, is_admin, is_supreme_admin 
        FROM users 
        ORDER BY is_supreme_admin DESC, is_admin DESC, primerica_id
    LOOP
        RAISE NOTICE '  - %: % % (%, %)', 
            user_record.primerica_id, 
            user_record.first_name, 
            user_record.last_name,
            user_record.email,
            CASE 
                WHEN user_record.is_supreme_admin THEN 'Supreme Admin'
                WHEN user_record.is_admin THEN 'Admin'
                ELSE 'User'
            END;
    END LOOP;
    
    IF admin_count = 0 THEN
        RAISE EXCEPTION 'ERREUR: Aucun administrateur suprême trouvé après création!';
    END IF;
    
    IF user_count = 0 THEN
        RAISE EXCEPTION 'ERREUR: Aucun utilisateur trouvé après création!';
    END IF;
    
    RAISE NOTICE 'SUCCESS: Tous les utilisateurs ont été créés avec succès!';
END $$;