# Guide de Création du Supreme Admin

## 🎯 Objectif

Ce guide explique comment créer l'utilisateur Supreme Admin initial pour CertiFi Québec.

## 📋 Prérequis

- Accès au projet Supabase : `https://odhfxiizydcvlmdfqwwt.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` configurée
- Edge Functions déployées

## 🚀 Méthodes de Création

### Méthode 1 : Via Edge Function (Recommandée)

```bash
# Déployer la fonction
supabase functions deploy create-supreme-admin

# Appeler la fonction
curl -X POST 'https://odhfxiizydcvlmdfqwwt.supabase.co/functions/v1/create-supreme-admin' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'
```

### Méthode 2 : Via Script Node.js

```bash
# Installer les dépendances
npm install @supabase/supabase-js

# Configurer la variable d'environnement
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Exécuter le script
npx tsx scripts/create-supreme-admin.ts
```

### Méthode 3 : Via Interface Web

Vous pouvez également créer un bouton dans l'interface admin pour appeler l'Edge Function.

## 📊 Détails de l'Utilisateur Créé

| Champ | Valeur |
|-------|--------|
| **Email** | `supreme.admin@certifi.quebec` |
| **Primerica ID** | `SUPREMEADMIN001` |
| **Mot de passe** | `ChangeMe123!` |
| **Nom** | `Admin Suprême` |
| **Rôle** | `LES_DEUX` |
| **XP** | `5000` |
| **Niveau** | `8` |
| **is_admin** | `true` |
| **is_supreme_admin** | `true` |

## 🔧 Fonctionnalités du Script

### ✅ Idempotence
- Le script peut être exécuté plusieurs fois sans problème
- Si l'utilisateur existe déjà, il met à jour les permissions
- Gestion intelligente des conflits

### 🛡️ Sécurité
- Utilise la Service Role Key pour les opérations admin
- Validation complète des données
- Gestion d'erreurs robuste

### 📝 Logging
- Toutes les actions sont loggées dans `admin_logs`
- Détails complets de l'opération
- Traçabilité complète

## 🔍 Vérification

Après création, vérifiez que l'utilisateur a été créé correctement :

```sql
-- Vérifier dans la table users
SELECT 
  id, primerica_id, email, first_name, last_name,
  is_admin, is_supreme_admin, is_active
FROM users 
WHERE primerica_id = 'SUPREMEADMIN001';

-- Vérifier dans auth.users
SELECT id, email, email_confirmed_at, created_at
FROM auth.users 
WHERE email = 'supreme.admin@certifi.quebec';

-- Vérifier les permissions
SELECT p.name 
FROM user_permissions up
JOIN permissions p ON up.permission_id = p.id
JOIN users u ON up.user_id = u.id
WHERE u.primerica_id = 'SUPREMEADMIN001';
```

## 🚨 Dépannage

### Erreur : "User already exists"
- Normal si l'utilisateur existe déjà
- Le script mettra à jour les permissions automatiquement

### Erreur : "Permission denied"
- Vérifiez que vous utilisez la bonne `SUPABASE_SERVICE_ROLE_KEY`
- Assurez-vous que la clé a les droits admin

### Erreur : "Function not found"
- Déployez d'abord l'Edge Function :
  ```bash
  supabase functions deploy create-supreme-admin
  ```

## 🔐 Sécurité Post-Création

1. **Changez immédiatement le mot de passe** après la première connexion
2. **Activez l'authentification 2FA** si disponible
3. **Limitez l'accès** à ce compte aux administrateurs autorisés
4. **Surveillez les logs** d'activité de ce compte

## 📞 Support

En cas de problème :
1. Vérifiez les logs de l'Edge Function
2. Consultez les logs dans `admin_logs`
3. Vérifiez la configuration Supabase
4. Contactez l'équipe technique

---

**⚠️ IMPORTANT** : Ce compte a tous les droits sur le système. Utilisez-le avec précaution !