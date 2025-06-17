# Plan de Tests SQL - CertiFi Québec

## 🎯 Objectif
Valider que la nouvelle base de données Supabase est correctement configurée et que tous les composants fonctionnent comme prévu.

## 📋 Tests à Exécuter

### Test 1 : Vérification du Schéma de Base

```sql
-- Vérifier les types ENUM
SELECT typname, enumlabel 
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE typname IN ('user_role', 'activity_type')
ORDER BY typname, enumsortorder;
```

**Résultat attendu :**
```
user_role     | PQAP
user_role     | FONDS_MUTUELS  
user_role     | LES_DEUX
activity_type | login
activity_type | logout
activity_type | podcast_listened
... (autres valeurs)
```

### Test 2 : Vérification des Tables

```sql
-- Lister toutes les tables créées
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'permissions', 'users', 'user_permissions', 'podcast_content',
    'questions', 'exams', 'user_exam_attempts', 'minigames',
    'user_minigame_scores', 'recent_activities', 'admin_logs'
  )
ORDER BY table_name;
```

**Résultat attendu :** 11 tables listées

### Test 3 : Vérification RLS (Row Level Security)

```sql
-- Vérifier que RLS est activé sur toutes les tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true
ORDER BY tablename;
```

**Résultat attendu :** Toutes les tables métier avec `rowsecurity = true`

### Test 4 : Vérification des Politiques

```sql
-- Lister toutes les policies créées
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Résultat attendu :** Plusieurs policies par table (anon, authenticated, admin)

### Test 5 : Vérification des Fonctions

```sql
-- Vérifier les fonctions métier
SELECT routine_name, routine_type, security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'update_updated_at', 'create_profile_for_new_user',
    'create_user_with_permissions', 'award_xp', 'get_user_stats',
    'calculate_exam_xp', 'log_admin_action', 'cleanup_old_activities'
  )
ORDER BY routine_name;
```

**Résultat attendu :** 8 fonctions avec `security_type = DEFINER`

### Test 6 : Vérification des Triggers

```sql
-- Vérifier les triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

**Résultat attendu :** Triggers sur auth.users et tables avec updated_at

### Test 7 : Vérification des Permissions de Base

```sql
-- Vérifier les permissions système
SELECT id, name, description 
FROM public.permissions 
ORDER BY name;
```

**Résultat attendu :**
```
1 | admin         | Droits d'administration
2 | fonds_mutuels | Accès aux formations Fonds Mutuels
3 | pqap          | Accès aux formations PQAP
4 | supreme_admin | Droits d'administration suprême
```

### Test 8 : Vérification du Supreme Admin

```sql
-- Vérifier l'utilisateur dans auth.users
SELECT id, email, email_confirmed_at, 
       raw_user_meta_data->>'primerica_id' as primerica_id
FROM auth.users 
WHERE email = 'derthibeault@gmail.com';
```

```sql
-- Vérifier le profil dans public.users
SELECT primerica_id, email, first_name, last_name, 
       initial_role, current_level, current_xp, gamified_role,
       is_admin, is_supreme_admin, is_active
FROM public.users 
WHERE primerica_id = 'lul8p';
```

**Résultat attendu :**
- Utilisateur présent dans auth.users avec métadonnées
- Profil complet dans public.users avec `is_supreme_admin = true`

### Test 9 : Vérification des Permissions du Supreme Admin

```sql
-- Vérifier les permissions attribuées
SELECT u.primerica_id, u.first_name, u.last_name,
       p.name as permission_name, p.description
FROM public.users u
JOIN public.user_permissions up ON u.id = up.user_id
JOIN public.permissions p ON up.permission_id = p.id
WHERE u.primerica_id = 'lul8p'
ORDER BY p.name;
```

**Résultat attendu :** Toutes les permissions attribuées au Supreme Admin

### Test 10 : Test des Politiques RLS

```sql
-- Test en mode anonyme (pour le lookup de connexion)
SET ROLE anon;
SELECT primerica_id, email, is_active 
FROM public.users 
WHERE primerica_id = 'lul8p';
RESET ROLE;
```

**Résultat attendu :** Données visibles en mode anonyme

```sql
-- Test d'accès restreint en mode anonyme
SET ROLE anon;
SELECT first_name, last_name, current_xp 
FROM public.users 
WHERE primerica_id = 'lul8p';
RESET ROLE;
```

**Résultat attendu :** Données visibles (policy permet tout en SELECT pour anon)

### Test 11 : Test des Fonctions Métier

```sql
-- Test de la fonction get_user_stats
SELECT public.get_user_stats(
  (SELECT id FROM public.users WHERE primerica_id = 'lul8p')
);
```

**Résultat attendu :** JSON avec statistiques utilisateur

```sql
-- Test de la fonction award_xp
SELECT public.award_xp(
  (SELECT id FROM public.users WHERE primerica_id = 'lul8p'),
  100,
  'admin_award',
  '{"reason": "Test XP attribution"}'::jsonb
);
```

**Résultat attendu :** JSON avec ancien/nouveau XP

### Test 12 : Vérification des Données d'Exemple

```sql
-- Compter le contenu inséré
SELECT 
  (SELECT COUNT(*) FROM public.podcast_content WHERE is_active = true) as podcasts,
  (SELECT COUNT(*) FROM public.questions WHERE is_active = true) as questions,
  (SELECT COUNT(*) FROM public.exams WHERE is_active = true) as exams,
  (SELECT COUNT(*) FROM public.minigames WHERE is_active = true) as minigames;
```

**Résultat attendu :** Nombres > 0 pour chaque type de contenu

### Test 13 : Test de Création d'Utilisateur

```sql
-- Test de la fonction create_user_with_permissions
SELECT public.create_user_with_permissions(
  gen_random_uuid(),
  'TEST001',
  'test@example.com',
  'Test',
  'User',
  'PQAP'::user_role
);
```

**Résultat attendu :** JSON avec `"success": true`

### Test 14 : Test de Nettoyage

```sql
-- Nettoyer l'utilisateur de test
DELETE FROM public.users WHERE primerica_id = 'TEST001';
```

## 🔍 Validation des Résultats

### Critères de Succès

1. **Schéma :** ✅ Tous les types, tables, fonctions créés
2. **Sécurité :** ✅ RLS activé, policies configurées
3. **Supreme Admin :** ✅ Créé avec tous les droits
4. **Fonctions :** ✅ Toutes opérationnelles
5. **Données :** ✅ Contenu d'exemple présent
6. **Permissions :** ✅ Attribution correcte selon les rôles

### En Cas d'Échec

1. **Vérifier les messages d'erreur** dans les NOTICE
2. **Réexécuter les scripts** dans l'ordre
3. **Vérifier les dépendances** entre objets
4. **Consulter les logs** Supabase

## 📊 Rapport de Test

Après exécution de tous les tests, créer un rapport :

```sql
-- Rapport final de validation
DO $$
DECLARE
    table_count INTEGER;
    function_count INTEGER;
    policy_count INTEGER;
    admin_exists BOOLEAN;
    permission_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
    
    SELECT COUNT(*) INTO function_count 
    FROM information_schema.routines 
    WHERE routine_schema = 'public';
    
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    SELECT EXISTS(
        SELECT 1 FROM public.users 
        WHERE primerica_id = 'lul8p' AND is_supreme_admin = true
    ) INTO admin_exists;
    
    SELECT COUNT(*) INTO permission_count 
    FROM public.user_permissions up
    JOIN public.users u ON up.user_id = u.id
    WHERE u.primerica_id = 'lul8p';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RAPPORT DE VALIDATION FINAL';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables créées: %', table_count;
    RAISE NOTICE 'Fonctions créées: %', function_count;
    RAISE NOTICE 'Policies créées: %', policy_count;
    RAISE NOTICE 'Supreme Admin existe: %', admin_exists;
    RAISE NOTICE 'Permissions attribuées: %', permission_count;
    RAISE NOTICE '========================================';
    
    IF table_count >= 11 AND function_count >= 8 AND policy_count >= 20 
       AND admin_exists AND permission_count >= 4 THEN
        RAISE NOTICE 'STATUS: ✅ TOUS LES TESTS RÉUSSIS';
        RAISE NOTICE 'Base de données prête pour production !';
    ELSE
        RAISE NOTICE 'STATUS: ❌ CERTAINS TESTS ONT ÉCHOUÉ';
        RAISE NOTICE 'Vérifier la configuration avant utilisation';
    END IF;
    
    RAISE NOTICE '========================================';
END $$;
```

## 🎯 Prochaines Étapes

Une fois tous les tests SQL validés :

1. **Tester l'application React** avec les nouveaux identifiants
2. **Vérifier les Edge Functions** 
3. **Effectuer des tests d'intégration** complets
4. **Documenter** toute configuration spécifique
5. **Mettre en production** si tous les tests passent

---

**Note :** Exécuter ces tests dans l'ordre et valider chaque étape avant de passer à la suivante. En cas d'erreur, consulter les logs et la documentation Supabase.