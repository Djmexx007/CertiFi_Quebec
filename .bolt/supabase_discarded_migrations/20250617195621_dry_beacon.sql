/*
  # Création du Supreme Admin

  1. Suppression de l'ancien compte
    - Nettoyage complet dans auth.users et public.users
    - Suppression des dépendances

  2. Création du nouveau compte
    - Utilisateur auth avec mot de passe crypté
    - Profil métier avec tous les droits
    - Attribution de toutes les permissions

  3. Vérification
    - Confirmation de la création
    - Test des accès
    - Message de succès
*/

DO $$
DECLARE
    supreme_admin_id UUID;
    password_hash TEXT;
    user_metadata JSONB;
    permission_count INTEGER;
BEGIN
    RAISE NOTICE 'Début de la création du Supreme Admin...';
    
    -- =============================================
    -- 1. NETTOYAGE DE L'ANCIEN COMPTE
    -- =============================================
    
    -- Supprimer l'ancien profil métier s'il existe
    DELETE FROM public.users 
    WHERE email = 'derthibeault@gmail.com' OR primerica_id = 'lul8p';
    
    -- Supprimer l'ancien utilisateur auth s'il existe
    DELETE FROM auth.users 
    WHERE email = 'derthibeault@gmail.com';
    
    RAISE NOTICE 'Ancien compte supprimé';
    
    -- =============================================
    -- 2. GÉNÉRATION DU NOUVEL ID ET MÉTADONNÉES
    -- =============================================
    
    supreme_admin_id := gen_random_uuid();
    
    -- Métadonnées utilisateur
    user_metadata := jsonb_build_object(
        'primerica_id', 'lul8p',
        'first_name', 'Derek',
        'last_name', 'Thibeault',
        'initial_role', 'LES_DEUX'
    );
    
    -- Hash du mot de passe 'Urze0912' avec bcrypt
    password_hash := crypt('Urze0912', gen_salt('bf'));
    
    -- =============================================
    -- 3. CRÉATION DE L'UTILISATEUR AUTH
    -- =============================================
    
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
        supreme_admin_id,
        '00000000-0000-0000-0000-000000000000',
        'derthibeault@gmail.com',
        password_hash,
        now(),
        user_metadata,
        now(),
        now(),
        '',
        '',
        '',
        ''
    );
    
    RAISE NOTICE 'Utilisateur auth créé avec ID: %', supreme_admin_id;
    
    -- =============================================
    -- 4. CRÉATION DU PROFIL MÉTIER
    -- =============================================
    
    INSERT INTO public.users (
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
        supreme_admin_id,
        'lul8p',
        'derthibeault@gmail.com',
        'Derek',
        'Thibeault',
        'LES_DEUX',
        5000,
        6,
        'Maître Administrateur',
        true,
        true,
        true,
        now(),
        now(),
        now()
    );
    
    RAISE NOTICE 'Profil métier créé';
    
    -- =============================================
    -- 5. ATTRIBUTION DE TOUTES LES PERMISSIONS
    -- =============================================
    
    -- Attribuer toutes les permissions existantes
    INSERT INTO public.user_permissions (user_id, permission_id, granted_by, granted_at)
    SELECT 
        supreme_admin_id,
        p.id,
        supreme_admin_id,
        now()
    FROM public.permissions p
    ON CONFLICT (user_id, permission_id) DO NOTHING;
    
    -- Compter les permissions attribuées
    SELECT COUNT(*) INTO permission_count
    FROM public.user_permissions
    WHERE user_id = supreme_admin_id;
    
    RAISE NOTICE 'Permissions attribuées: %', permission_count;
    
    -- =============================================
    -- 6. ENREGISTREMENT DE L'ACTIVITÉ INITIALE
    -- =============================================
    
    INSERT INTO public.recent_activities (
        user_id,
        activity_type,
        activity_details_json,
        xp_gained,
        occurred_at
    ) VALUES (
        supreme_admin_id,
        'profile_updated',
        jsonb_build_object(
            'action', 'supreme_admin_created',
            'created_by', 'system',
            'initial_setup', true
        ),
        0,
        now()
    );
    
    -- =============================================
    -- 7. VÉRIFICATIONS FINALES
    -- =============================================
    
    -- Vérifier que l'utilisateur existe dans auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = supreme_admin_id) THEN
        RAISE EXCEPTION 'Échec de la création dans auth.users';
    END IF;
    
    -- Vérifier que le profil existe dans public.users
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = supreme_admin_id AND is_supreme_admin = true) THEN
        RAISE EXCEPTION 'Échec de la création du profil supreme admin';
    END IF;
    
    -- Vérifier les permissions
    IF permission_count = 0 THEN
        RAISE WARNING 'Aucune permission attribuée - vérifier la table permissions';
    END IF;
    
    -- =============================================
    -- 8. MESSAGE DE SUCCÈS
    -- =============================================
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Supreme Admin créé avec succès !';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Email: derthibeault@gmail.com';
    RAISE NOTICE 'Numéro: lul8p';
    RAISE NOTICE 'Mot de passe: Urze0912';
    RAISE NOTICE 'ID: %', supreme_admin_id;
    RAISE NOTICE 'Permissions: % attribuées', permission_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Vous pouvez maintenant vous connecter !';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erreur lors de la création du Supreme Admin: %', SQLERRM;
END $$;

-- =============================================
-- VÉRIFICATION POST-CRÉATION
-- =============================================

-- Vérifier la création dans auth.users
DO $$
DECLARE
    auth_user_exists BOOLEAN;
    public_user_exists BOOLEAN;
    permission_count INTEGER;
BEGIN
    -- Vérifier auth.users
    SELECT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = 'derthibeault@gmail.com'
    ) INTO auth_user_exists;
    
    -- Vérifier public.users
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE primerica_id = 'lul8p' AND is_supreme_admin = true
    ) INTO public_user_exists;
    
    -- Compter les permissions
    SELECT COUNT(*) INTO permission_count
    FROM public.user_permissions up
    JOIN public.users u ON up.user_id = u.id
    WHERE u.primerica_id = 'lul8p';
    
    -- Rapport de vérification
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RAPPORT DE VÉRIFICATION';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Auth user exists: %', auth_user_exists;
    RAISE NOTICE 'Public user exists: %', public_user_exists;
    RAISE NOTICE 'Permissions count: %', permission_count;
    
    IF auth_user_exists AND public_user_exists AND permission_count > 0 THEN
        RAISE NOTICE 'STATUS: ✅ SUCCÈS - Supreme Admin opérationnel';
    ELSE
        RAISE NOTICE 'STATUS: ❌ ÉCHEC - Vérifier la configuration';
    END IF;
    RAISE NOTICE '========================================';
END $$;