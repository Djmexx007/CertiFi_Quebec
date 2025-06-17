# Guide de Configuration Supabase - CertiFi Québec

## 🎯 Objectif
Ce guide vous accompagne dans la création d'une nouvelle base de données Supabase complètement configurée pour CertiFi Québec.

## 📋 Étapes de Configuration

### 1. Création du Nouveau Projet Supabase

1. **Accéder à Supabase**
   - Aller sur [supabase.com](https://supabase.com)
   - Se connecter à votre compte

2. **Créer un nouveau projet**
   - Cliquer sur "New Project"
   - Nom du projet : `certifi-quebec-prod`
   - Base de données : Choisir un mot de passe fort
   - Région : `Canada Central (ca-central-1)` (recommandé pour le Québec)
   - Plan : Gratuit pour commencer

3. **Attendre l'initialisation**
   - Le projet prend 2-3 minutes à se configurer
   - Noter l'URL du projet et les clés API

### 2. Configuration des Variables d'Environnement

1. **Récupérer les informations de connexion**
   - Dans Supabase, aller dans `Settings > API`
   - Copier :
     - `Project URL`
     - `anon public` key
     - `service_role` key (pour les Edge Functions)

2. **Mettre à jour le fichier .env**
   ```env
   VITE_SUPABASE_URL=https://votre-nouveau-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre_nouvelle_cle_anon
   ```

### 3. Exécution des Migrations SQL

**IMPORTANT : Exécuter les scripts dans l'ordre exact suivant**

1. **Ouvrir l'éditeur SQL**
   - Dans Supabase, aller dans `SQL Editor`
   - Créer une nouvelle requête

2. **Script 1 : Schéma complet**
   - Copier le contenu de `supabase/migrations/01_create_complete_schema.sql`
   - Coller dans l'éditeur SQL
   - Cliquer sur "Run"
   - ✅ Vérifier : "Schema créé avec succès"

3. **Script 2 : Politiques RLS**
   - Copier le contenu de `supabase/migrations/02_create_rls_policies.sql`
   - Coller dans l'éditeur SQL
   - Cliquer sur "Run"
   - ✅ Vérifier : "Policies RLS créées avec succès"

4. **Script 3 : Fonctions métier**
   - Copier le contenu de `supabase/migrations/03_create_functions.sql`
   - Coller dans l'éditeur SQL
   - Cliquer sur "Run"
   - ✅ Vérifier : "Fonctions et triggers créés avec succès"

5. **Script 4 : Supreme Admin**
   - Copier le contenu de `supabase/migrations/04_create_supreme_admin.sql`
   - Coller dans l'éditeur SQL
   - Cliquer sur "Run"
   - ✅ Vérifier : "Supreme Admin créé avec succès !"

6. **Script 5 : Données d'exemple**
   - Copier le contenu de `supabase/migrations/05_insert_sample_data.sql`
   - Coller dans l'éditeur SQL
   - Cliquer sur "Run"
   - ✅ Vérifier : "Base de données prête pour les tests !"

### 4. Déploiement des Edge Functions

1. **Installer Supabase CLI** (si pas déjà fait)
   ```bash
   npm install -g supabase
   ```

2. **Se connecter à Supabase**
   ```bash
   supabase login
   ```

3. **Lier le projet**
   ```bash
   supabase link --project-ref VOTRE_PROJECT_REF
   ```

4. **Déployer les fonctions**
   ```bash
   # Fonction d'authentification (sans vérification JWT)
   supabase functions deploy auth-api --no-verify-jwt
   
   # Fonction utilisateur
   supabase functions deploy user-api
   
   # Fonction admin
   supabase functions deploy admin-api
   ```

### 5. Tests de Validation

#### Test 1 : Vérification du schéma
```sql
-- Vérifier les tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Vérifier RLS
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```

#### Test 2 : Vérification du Supreme Admin
```sql
-- Vérifier dans auth.users
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'derthibeault@gmail.com';

-- Vérifier dans public.users
SELECT primerica_id, email, first_name, last_name, 
       is_admin, is_supreme_admin, is_active
FROM public.users 
WHERE primerica_id = 'lul8p';
```

#### Test 3 : Test de connexion
1. Ouvrir l'application React
2. Utiliser les identifiants :
   - **Numéro :** `lul8p`
   - **Mot de passe :** `Urze0912`
3. ✅ La connexion doit réussir et afficher le tableau de bord admin

### 6. Configuration de Sécurité

1. **Vérifier les politiques RLS**
   ```sql
   -- Test en mode anonyme
   SET ROLE anon;
   SELECT primerica_id, email, is_active 
   FROM public.users 
   WHERE primerica_id = 'lul8p';
   RESET ROLE;
   ```

2. **Configurer les CORS** (si nécessaire)
   - Dans Supabase : `Settings > API`
   - Ajouter votre domaine dans "CORS origins"

### 7. Monitoring et Maintenance

1. **Activer les logs**
   - Dans Supabase : `Logs > Settings`
   - Activer tous les types de logs

2. **Configurer les alertes**
   - Surveiller l'utilisation de la base
   - Alertes sur les erreurs

3. **Sauvegardes automatiques**
   - Vérifier que les sauvegardes sont activées
   - Configurer la rétention selon vos besoins

## 🔧 Dépannage

### Erreur "Database error querying schema"
- Vérifier que tous les scripts SQL ont été exécutés
- Vérifier les variables d'environnement
- Redémarrer l'application React

### Erreur de connexion 401/403
- Vérifier les politiques RLS
- Vérifier que le Supreme Admin existe
- Tester avec les bons identifiants

### Edge Functions ne répondent pas
- Vérifier le déploiement avec `supabase functions list`
- Consulter les logs avec `supabase functions logs`
- Redéployer si nécessaire

## ✅ Checklist de Validation

- [ ] Nouveau projet Supabase créé
- [ ] Variables d'environnement mises à jour
- [ ] Script 1 (schéma) exécuté avec succès
- [ ] Script 2 (RLS) exécuté avec succès
- [ ] Script 3 (fonctions) exécuté avec succès
- [ ] Script 4 (Supreme Admin) exécuté avec succès
- [ ] Script 5 (données) exécuté avec succès
- [ ] Edge Functions déployées
- [ ] Test de connexion réussi avec `lul8p / Urze0912`
- [ ] Interface admin accessible
- [ ] Aucune erreur dans la console

## 🎉 Félicitations !

Votre nouvelle base de données Supabase est maintenant configurée et opérationnelle. Vous pouvez commencer à utiliser CertiFi Québec avec un système complètement propre et sécurisé.

## 📞 Support

En cas de problème, vérifiez :
1. Les logs Supabase dans le dashboard
2. La console du navigateur pour les erreurs frontend
3. Les logs des Edge Functions
4. La documentation Supabase officielle