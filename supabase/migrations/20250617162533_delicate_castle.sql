-- =====================================================
-- CRÉATION DE L'UTILISATEUR ADMINISTRATEUR INITIAL
-- =====================================================

-- Nettoyer les utilisateurs existants avec l'email admin (au cas où)
DO $$
DECLARE
    existing_user_id uuid;
BEGIN
    -- Trouver l'utilisateur existant avec cet email
    SELECT id INTO existing_user_id 
    FROM auth.users 
    WHERE email = 'admin@primerica.com';
    
    IF existing_user_id IS NOT NULL THEN
        -- Supprimer d'abord de la table users (profil)
        DELETE FROM users WHERE id = existing_user_id;
        
        -- Puis supprimer de auth.users
        DELETE FROM auth.users WHERE id = existing_user_id;
        
        RAISE NOTICE 'Utilisateur admin existant supprimé: %', existing_user_id;
    END IF;
END $$;

-- Créer l'utilisateur administrateur initial
DO $$
DECLARE
    admin_user_id uuid;
    admin_email text := 'admin@primerica.com';
    admin_password text := 'MotDePasseSecurise123!';
    admin_primerica_id text := '000001';
BEGIN
    -- Générer un nouvel ID
    admin_user_id := gen_random_uuid();
    
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
    
    -- Créer le profil dans la table users
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
    );
    
    -- Attribuer toutes les permissions
    INSERT INTO user_permissions (user_id, permission_id, granted_by, granted_at)
    SELECT 
        admin_user_id,
        p.id,
        admin_user_id,
        now()
    FROM permissions p;
    
    RAISE NOTICE 'Utilisateur administrateur créé avec succès:';
    RAISE NOTICE '  ID: %', admin_user_id;
    RAISE NOTICE '  Email: %', admin_email;
    RAISE NOTICE '  Primerica ID: %', admin_primerica_id;
    RAISE NOTICE '  Mot de passe: %', admin_password;
    
END $$;

-- Vérification
DO $$
DECLARE
    user_count integer;
    admin_count integer;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO admin_count FROM users WHERE is_supreme_admin = true;
    
    RAISE NOTICE 'Vérification:';
    RAISE NOTICE '  Total utilisateurs: %', user_count;
    RAISE NOTICE '  Administrateurs suprêmes: %', admin_count;
    
    IF admin_count = 0 THEN
        RAISE EXCEPTION 'ERREUR: Aucun administrateur suprême trouvé après création!';
    END IF;
END $$;