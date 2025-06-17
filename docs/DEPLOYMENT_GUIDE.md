# Guide de Déploiement - CertiFi Québec

## 📋 Prérequis

- Compte Supabase (gratuit)
- Node.js 18+ et npm
- Git

## 🚀 Déploiement Étape par Étape

### 1. Configuration Supabase

#### Créer un nouveau projet Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL du projet et la clé API anonyme

#### Exécuter les migrations SQL
1. Dans le tableau de bord Supabase, aller dans "SQL Editor"
2. Exécuter les fichiers dans l'ordre :
   ```sql
   -- 1. Exécuter create_complete_schema.sql
   -- 2. Exécuter create_rls_policies.sql  
   -- 3. Exécuter create_functions.sql
   -- 4. Exécuter insert_sample_data.sql
   ```

#### Déployer les Edge Functions
1. Installer Supabase CLI :
   ```bash
   npm install -g supabase
   ```

2. Se connecter à Supabase :
   ```bash
   supabase login
   ```

3. Lier le projet :
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. Déployer les fonctions :
   ```bash
   supabase functions deploy auth-api
   supabase functions deploy user-api  
   supabase functions deploy admin-api
   ```

### 2. Configuration de l'Application

#### Variables d'environnement
1. Copier `.env.example` vers `.env`
2. Remplir les variables :
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

#### Installation et build
```bash
npm install
npm run build
```

### 3. Création du Premier Administrateur Suprême

#### Via SQL (Recommandé)
```sql
-- 1. Créer l'utilisateur auth
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, 
  raw_user_meta_data, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'admin@primerica.com',
  crypt('MotDePasseSecurise123!', gen_salt('bf')),
  now(),
  '{"primerica_id": "000001", "first_name": "Admin", "last_name": "Suprême", "initial_role": "LES_DEUX"}',
  now(),
  now()
);

-- 2. Créer le profil utilisateur
INSERT INTO users (
  id, primerica_id, email, first_name, last_name, 
  initial_role, is_supreme_admin, is_admin
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@primerica.com'),
  '000001',
  'admin@primerica.com', 
  'Admin',
  'Suprême',
  'LES_DEUX',
  true,
  true
);

-- 3. Attribuer toutes les permissions
INSERT INTO user_permissions (user_id, permission_id)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'admin@primerica.com'),
  id 
FROM permissions;
```

#### Via l'API (Alternative)
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/auth-api/register' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@primerica.com",
    "password": "MotDePasseSecurise123!",
    "primerica_id": "000001",
    "first_name": "Admin",
    "last_name": "Suprême", 
    "initial_role": "LES_DEUX"
  }'
```

Puis mettre à jour manuellement les flags admin dans la base de données.

### 4. Tests de Validation

#### Test d'authentification
```bash
# Test de connexion admin
curl -X POST 'https://your-project.supabase.co/functions/v1/auth-api/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "primerica_id": "000001",
    "password": "MotDePasseSecurise123!"
  }'
```

#### Test des permissions
```bash
# Test API utilisateur (avec token d'auth)
curl -X GET 'https://your-project.supabase.co/functions/v1/user-api/profile' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'

# Test API admin
curl -X GET 'https://your-project.supabase.co/functions/v1/admin-api/dashboard-stats' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

### 5. Configuration de Production

#### Sécurité
- [ ] Changer le mot de passe admin par défaut
- [ ] Configurer les politiques RLS
- [ ] Vérifier les CORS
- [ ] Activer l'audit des logs

#### Performance
- [ ] Configurer les index de base de données
- [ ] Optimiser les requêtes fréquentes
- [ ] Mettre en place la mise en cache

#### Monitoring
- [ ] Configurer les alertes Supabase
- [ ] Surveiller l'utilisation des ressources
- [ ] Mettre en place les sauvegardes

## 🔧 Maintenance

### Nettoyage automatique
Programmer l'exécution de la fonction de nettoyage :
```sql
-- Nettoyer les anciennes activités (à exécuter hebdomadairement)
SELECT cleanup_old_activities();
```

### Sauvegarde
- Sauvegardes automatiques Supabase activées
- Export manuel des données critiques recommandé

### Mises à jour
1. Tester en environnement de développement
2. Sauvegarder la base de données
3. Déployer les nouvelles fonctions
4. Exécuter les migrations si nécessaire
5. Valider le fonctionnement

## 🆘 Dépannage

### Problèmes courants

#### Edge Functions ne répondent pas
```bash
# Vérifier les logs
supabase functions logs auth-api
supabase functions logs user-api
supabase functions logs admin-api
```

#### Erreurs RLS
- Vérifier que les politiques sont correctement appliquées
- Tester avec un utilisateur de test
- Consulter les logs Supabase

#### Problèmes de performance
- Analyser les requêtes lentes dans le dashboard Supabase
- Vérifier l'utilisation des index
- Optimiser les requêtes complexes

### Support
- Documentation Supabase : [docs.supabase.com](https://docs.supabase.com)
- Logs d'erreur dans le dashboard Supabase
- Monitoring des performances intégré