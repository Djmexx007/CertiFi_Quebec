-- =====================================================
-- CRÉATION DE L'UTILISATEUR ADMINISTRATEUR INITIAL
-- =====================================================

-- Nettoyer complètement tous les utilisateurs admin existants
DO $$
DECLARE
    existing_user_id uuid;
    existing_primerica_id text := '000001';
    existing_email text := 'admin@primerica.com';
BEGIN
    -- Méthode 1: Nettoyer par email
    FOR existing_user_id IN 
        SELECT id FROM auth.users WHERE email = existing_email
    LOOP
        -- Supprimer les permissions d'abord
        DELETE FROM user_permissions WHERE user_id = existing_user_id;
        
        -- Supprimer le profil
        DELETE FROM users WHERE id = existing_user_id;
        
        -- Supprimer de auth.users
        DELETE FROM auth.users WHERE id = existing_user_id;
        
        RAISE NOTICE 'Utilisateur admin supprimé par email: %', existing_user_id;
    END LOOP;
    
    -- Méthode 2: Nettoyer par primerica_id
    FOR existing_user_id IN 
        SELECT id FROM users WHERE primerica_id = existing_primerica_id
    LOOP
        -- Supprimer les permissions d'abord
        DELETE FROM user_permissions WHERE user_id = existing_user_id;
        
        -- Supprimer de auth.users si existe
        DELETE FROM auth.users WHERE id = existing_user_id;
        
        -- Supprimer le profil
        DELETE FROM users WHERE id = existing_user_id;
        
        RAISE NOTICE 'Utilisateur admin supprimé par primerica_id: %', existing_user_id;
    END LOOP;
    
    -- Méthode 3: Nettoyer tous les supreme_admin
    FOR existing_user_id IN 
        SELECT id FROM users WHERE is_supreme_admin = true
    LOOP
        -- Supprimer les permissions d'abord
        DELETE FROM user_permissions WHERE user_id = existing_user_id;
        
        -- Supprimer de auth.users si existe
        DELETE FROM auth.users WHERE id = existing_user_id;
        
        -- Supprimer le profil
        DELETE FROM users WHERE id = existing_user_id;
        
        RAISE NOTICE 'Supreme admin supprimé: %', existing_user_id;
    END LOOP;
    
END $$;

-- Attendre un moment pour s'assurer que les suppressions sont commitées
SELECT pg_sleep(1);

-- Créer l'utilisateur administrateur initial
DO $$
DECLARE
    admin_user_id uuid;
    admin_email text := 'admin@primerica.com';
    admin_password text := 'MotDePasseSecurise123!';
    admin_primerica_id text := '000001';
    existing_check integer;
BEGIN
    -- Générer un nouvel ID unique
    admin_user_id := gen_random_uuid();
    
    -- Vérification finale qu'aucun conflit n'existe
    SELECT COUNT(*) INTO existing_check 
    FROM users 
    WHERE id = admin_user_id 
       OR primerica_id = admin_primerica_id 
       OR email = admin_email;
    
    IF existing_check > 0 THEN
        RAISE EXCEPTION 'Conflit détecté: des données admin existent encore. Veuillez nettoyer manuellement.';
    END IF;
    
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
    
    RAISE NOTICE 'Utilisateur auth créé avec ID: %', admin_user_id;
    
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
    
    RAISE NOTICE 'Profil utilisateur créé avec ID: %', admin_user_id;
    
    -- Attribuer toutes les permissions (seulement si des permissions existent)
    INSERT INTO user_permissions (user_id, permission_id, granted_by, granted_at)
    SELECT 
        admin_user_id,
        p.id,
        admin_user_id,
        now()
    FROM permissions p
    WHERE EXISTS (SELECT 1 FROM permissions LIMIT 1);
    
    RAISE NOTICE 'Utilisateur administrateur créé avec succès:';
    RAISE NOTICE '  ID: %', admin_user_id;
    RAISE NOTICE '  Email: %', admin_email;
    RAISE NOTICE '  Primerica ID: %', admin_primerica_id;
    RAISE NOTICE '  Mot de passe: %', admin_password;
    
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Erreur de contrainte unique lors de la création de l''admin. Détails: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erreur inattendue lors de la création de l''admin: %', SQLERRM;
END $$;

-- Vérification finale
DO $$
DECLARE
    user_count integer;
    admin_count integer;
    auth_count integer;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO admin_count FROM users WHERE is_supreme_admin = true;
    SELECT COUNT(*) INTO auth_count FROM auth.users WHERE email = 'admin@primerica.com';
    
    RAISE NOTICE 'Vérification finale:';
    RAISE NOTICE '  Total utilisateurs dans users: %', user_count;
    RAISE NOTICE '  Administrateurs suprêmes: %', admin_count;
    RAISE NOTICE '  Utilisateurs auth avec email admin: %', auth_count;
    
    IF admin_count = 0 THEN
        RAISE EXCEPTION 'ERREUR: Aucun administrateur suprême trouvé après création!';
    END IF;
    
    IF auth_count = 0 THEN
        RAISE EXCEPTION 'ERREUR: Aucun utilisateur auth trouvé après création!';
    END IF;
    
    RAISE NOTICE 'SUCCESS: Administrateur initial créé avec succès!';
END $$;