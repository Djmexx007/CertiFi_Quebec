# Plan de Tests Complet - CertiFi Québec

## 🎯 Objectif
Valider la réinitialisation complète du système et s'assurer que tous les composants fonctionnent correctement après la purge des données de démo et la mise en place du nouveau schéma.

## 📋 Prérequis
1. Accès à la console Supabase
2. Application React/Vite déployée
3. Variables d'environnement configurées
4. Navigateur avec console de développement

---

## 🗄️ TESTS SQL - Base de Données

### Test 1: Exécution du Script de Réinitialisation
```sql
-- Exécuter le script complet dans l'éditeur SQL Supabase
-- Le script doit s'exécuter sans erreur et afficher les messages de confirmation
```

**Résultats attendus :**
- ✅ Aucune erreur SQL
- ✅ Messages NOTICE confirmant la création du Supreme Admin
- ✅ Toutes les tables créées avec RLS activé

### Test 2: Vérification du Schéma
```sql
-- Vérifier les types ENUM
SELECT typname, enumlabel 
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE typname IN ('user_role', 'activity_type')
ORDER BY typname, enumsortorder;

-- Vérifier les tables principales
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'user_permissions', 'exams', 'questions', 'podcast_content', 'minigames')
ORDER BY table_name;

-- Vérifier RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true
ORDER BY tablename;
```

**Résultats attendus :**
- ✅ Types ENUM créés avec toutes les valeurs
- ✅ Toutes les tables métier présentes
- ✅ RLS activé sur toutes les tables

### Test 3: Vérification des Policies
```sql
-- Lister toutes les policies
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test spécifique de la policy anon
SET ROLE anon;
SELECT primerica_id, email, is_active 
FROM public.users 
WHERE primerica_id = 'lul8p';
RESET ROLE;
```

**Résultats attendus :**
- ✅ Policies créées pour toutes les tables
- ✅ Accès anonyme autorisé pour le lookup de connexion
- ✅ Données du Supreme Admin visibles en mode anon

### Test 4: Vérification des Fonctions
```sql
-- Vérifier les fonctions métier
SELECT routine_name, routine_type, security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'create_user_with_permissions', 
    'award_xp', 
    'get_user_stats', 
    'calculate_exam_xp', 
    'log_admin_action'
  )
ORDER BY routine_name;

-- Test de la fonction get_user_stats
SELECT public.get_user_stats((SELECT id FROM public.users WHERE primerica_id = 'lul8p'));
```

**Résultats attendus :**
- ✅ Toutes les fonctions présentes avec SECURITY DEFINER
- ✅ Fonction get_user_stats retourne des statistiques valides

### Test 5: Vérification du Supreme Admin
```sql
-- Vérifier l'utilisateur dans auth.users
SELECT id, email, email_confirmed_at, raw_user_meta_data
FROM auth.users 
WHERE email = 'derthibeault@gmail.com';

-- Vérifier le profil dans public.users
SELECT primerica_id, email, first_name, last_name, 
       is_admin, is_supreme_admin, is_active, 
       current_level, current_xp, gamified_role
FROM public.users 
WHERE primerica_id = 'lul8p';

-- Vérifier les permissions
SELECT u.primerica_id, p.name as permission_name
FROM public.users u
JOIN public.user_permissions up ON u.id = up.user_id
JOIN public.permissions p ON up.permission_id = p.id
WHERE u.primerica_id = 'lul8p'
ORDER BY p.name;
```

**Résultats attendus :**
- ✅ Utilisateur présent dans auth.users avec métadonnées
- ✅ Profil complet dans public.users avec flags admin
- ✅ Toutes les permissions attribuées

---

## 🔌 TESTS API - Edge Functions

### Test 6: API Admin - Dashboard Stats
```bash
# Test avec curl (remplacer TOKEN par un vrai token)
curl -X GET 'https://odhfxiizydcvlmdfqwwt.supabase.co/functions/v1/admin-api/dashboard-stats' \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json'
```

**Résultats attendus :**
- ✅ Réponse 200 avec statistiques
- ✅ Structure JSON correcte
- ✅ Données cohérentes

### Test 7: API Admin - Création d'Utilisateur
```bash
# Test de création d'utilisateur réel
curl -X POST 'https://odhfxiizydcvlmdfqwwt.supabase.co/functions/v1/admin-api/create-user' \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123",
    "primerica_id": "TEST001",
    "first_name": "Test",
    "last_name": "User",
    "initial_role": "PQAP"
  }'
```

**Résultats attendus :**
- ✅ Réponse 200 avec confirmation
- ✅ Utilisateur créé dans auth.users et public.users
- ✅ Permissions attribuées selon le rôle

### Test 8: Vérification Suppression Endpoints Démo
```bash
# Ces endpoints doivent retourner 404
curl -X POST 'https://odhfxiizydcvlmdfqwwt.supabase.co/functions/v1/admin-api/create-demo-users'
curl -X POST 'https://odhfxiizydcvlmdfqwwt.supabase.co/functions/v1/admin-api/toggle-demo-users'
```

**Résultats attendus :**
- ✅ Réponse 404 "Endpoint non trouvé"
- ✅ Aucune trace de logique démo dans les logs

---

## 🖥️ TESTS FRONTEND - Application React

### Test 9: Configuration Supabase
Ouvrir la console du navigateur et vérifier :
```javascript
// Vérifier la configuration
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key présente:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

**Résultats attendus :**
- ✅ URL Supabase correcte
- ✅ Clé anonyme présente
- ✅ Aucune erreur de configuration

### Test 10: Flux de Connexion - Cas de Succès
1. Ouvrir l'application
2. Saisir les identifiants :
   - **Numéro :** `lul8p`
   - **Mot de passe :** `Urze0912`
3. Cliquer sur "Se connecter"

**Résultats attendus :**
- ✅ Connexion réussie sans erreur
- ✅ Redirection vers le tableau de bord admin
- ✅ Session Supabase créée
- ✅ Profil utilisateur chargé

### Test 11: Flux de Connexion - Cas d'Erreur

#### Test 11a: Numéro Inexistant
- **Numéro :** `INEXISTANT123`
- **Mot de passe :** `anything`
- **Résultat attendu :** ❌ "Numéro de représentant introuvable"

#### Test 11b: Mot de Passe Incorrect
- **Numéro :** `lul8p`
- **Mot de passe :** `mauvais_mdp`
- **Résultat attendu :** ❌ "Mot de passe incorrect"

#### Test 11c: Compte Inactif
```sql
-- Désactiver temporairement le compte
UPDATE public.users SET is_active = false WHERE primerica_id = 'lul8p';
```
- **Résultat attendu :** ❌ "Compte inactif. Contactez l'administrateur."
```sql
-- Réactiver après le test
UPDATE public.users SET is_active = true WHERE primerica_id = 'lul8p';
```

### Test 12: Vérification Session et Déconnexion
```javascript
// Dans la console après connexion
console.log('Session:', await supabase.auth.getSession());
console.log('User:', await supabase.auth.getUser());
```

1. Vérifier que la session est active
2. Cliquer sur "Déconnexion"
3. Vérifier la redirection vers la page de connexion

**Résultats attendus :**
- ✅ Session valide après connexion
- ✅ Déconnexion propre
- ✅ Session supprimée

### Test 13: Interface Admin
Après connexion en tant que Supreme Admin :

1. Vérifier l'accès au tableau de bord admin
2. Tester la navigation entre les sections
3. Vérifier l'affichage des statistiques
4. Tester la gestion des utilisateurs

**Résultats attendus :**
- ✅ Interface admin accessible
- ✅ Toutes les sections fonctionnelles
- ✅ Données affichées correctement
- ✅ Actions admin disponibles

---

## 🔍 TESTS D'INTÉGRATION

### Test 14: Création Complète d'Utilisateur
1. Via l'interface admin, créer un nouvel utilisateur
2. Vérifier la création dans la base de données
3. Tester la connexion avec ce nouvel utilisateur

### Test 15: Attribution d'XP
1. Utiliser la fonction d'attribution d'XP
2. Vérifier la mise à jour dans la base
3. Vérifier l'enregistrement de l'activité

### Test 16: Gestion des Permissions
1. Modifier les permissions d'un utilisateur
2. Vérifier l'impact sur l'accès aux fonctionnalités
3. Tester les restrictions selon les rôles

---

## 📊 CHECKLIST DE VALIDATION FINALE

### Base de Données
- [ ] Script SQL exécuté sans erreur
- [ ] Toutes les tables créées avec RLS
- [ ] Policies configurées correctement
- [ ] Fonctions métier opérationnelles
- [ ] Supreme Admin créé et configuré
- [ ] Aucune trace de données démo

### API
- [ ] Endpoints admin fonctionnels
- [ ] Endpoints démo supprimés
- [ ] Authentification et autorisation OK
- [ ] Logging des actions admin

### Frontend
- [ ] Configuration Supabase correcte
- [ ] Flux de connexion sécurisé fonctionnel
- [ ] Gestion d'erreurs appropriée
- [ ] Interface admin accessible
- [ ] Déconnexion propre

### Sécurité
- [ ] RLS activé sur toutes les tables
- [ ] Policies restrictives en place
- [ ] Fonctions en SECURITY DEFINER
- [ ] Pas d'accès non autorisé

### Performance
- [ ] Index créés pour les requêtes fréquentes
- [ ] Temps de réponse acceptables
- [ ] Pas de requêtes N+1
- [ ] Gestion des timeouts

---

## 🚨 Procédure en Cas d'Échec

### Si le script SQL échoue :
1. Vérifier les permissions sur la base
2. Exécuter les sections une par une
3. Vérifier les dépendances entre objets

### Si la connexion échoue :
1. Vérifier les policies RLS
2. Contrôler la création du Supreme Admin
3. Tester la connectivité réseau

### Si l'API ne répond pas :
1. Vérifier les logs Supabase
2. Contrôler les variables d'environnement
3. Tester les endpoints individuellement

---

## ✅ Critères de Réussite

Le système est considéré comme opérationnel si :

1. **Tous les tests SQL passent** sans erreur
2. **Le Supreme Admin peut se connecter** avec `lul8p / Urze0912`
3. **L'interface admin est accessible** et fonctionnelle
4. **Les cas d'erreur sont gér és correctement**
5. **Aucune trace de logique démo** n'est présente
6. **La sécurité RLS fonctionne** comme attendu

Une fois tous ces critères validés, le système est prêt pour la production ! 🎉