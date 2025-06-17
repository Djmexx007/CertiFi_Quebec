# Instructions de Test - Flux de Connexion Sécurisé

## 🔧 Configuration Préalable

### 1. Exécuter la migration SQL
Connectez-vous à votre console Supabase et exécutez le script SQL suivant :

```sql
-- Activer RLS sur la table users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Supprimer l'ancienne policy si elle existe
DROP POLICY IF EXISTS "Allow anon login read" ON public.users;

-- Créer la policy pour permettre le lookup de connexion
CREATE POLICY "Allow anon login read"
  ON public.users FOR SELECT
  TO anon
  USING (true);

-- Vérifier que RLS est bien activé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';
```

### 2. Vérifier la structure de la base de données
Assurez-vous que votre table `public.users` contient bien :

```sql
-- Vérifier la structure de la table users
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;
```

Les colonnes essentielles doivent être présentes :
- `primerica_id` (text, unique)
- `email` (text, unique)
- `is_active` (boolean, default true)

### 3. Créer un utilisateur de test
Si vous n'avez pas encore d'utilisateur, créez-en un via SQL :

```sql
-- Créer un utilisateur de test dans auth.users
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'test@example.com',
  crypt('Urze0912', gen_salt('bf')),
  now(),
  '{"primerica_id": "lul8p", "first_name": "Test", "last_name": "User"}',
  now(),
  now()
) RETURNING id;

-- Récupérer l'ID généré et l'utiliser pour créer le profil
-- Remplacez 'USER_ID_FROM_ABOVE' par l'ID retourné
INSERT INTO public.users (
  id,
  primerica_id,
  email,
  first_name,
  last_name,
  initial_role,
  is_active
) VALUES (
  'USER_ID_FROM_ABOVE',
  'lul8p',
  'test@example.com',
  'Test',
  'User',
  'LES_DEUX',
  true
);
```

## 🧪 Tests à Effectuer

### Test 1 : Vérification de la Policy RLS
```sql
-- Test en tant qu'utilisateur anonyme
SET ROLE anon;
SELECT primerica_id, email, is_active 
FROM public.users 
WHERE primerica_id = 'lul8p';
-- Doit retourner les données

-- Revenir au rôle normal
RESET ROLE;
```

### Test 2 : Test de Connexion Frontend
1. Ouvrez l'application dans votre navigateur
2. Utilisez les identifiants :
   - **Numéro de représentant** : `lul8p`
   - **Mot de passe** : `Urze0912`
3. Vérifiez que la connexion s'effectue sans erreur

### Test 3 : Vérification des Logs
Ouvrez la console du navigateur et vérifiez :
- ✅ Aucune erreur 500
- ✅ Aucun message "Mot de passe incorrect" erroné
- ✅ Message de succès de connexion
- ✅ Session Supabase créée correctement

### Test 4 : Test des Cas d'Erreur
Testez les scénarios d'erreur :

1. **Numéro inexistant** :
   - Numéro : `inexistant123`
   - Mot de passe : `anything`
   - Résultat attendu : "Numéro de représentant introuvable"

2. **Mot de passe incorrect** :
   - Numéro : `lul8p`
   - Mot de passe : `mauvais_mdp`
   - Résultat attendu : "Mot de passe incorrect"

3. **Compte inactif** :
   ```sql
   -- Désactiver temporairement le compte
   UPDATE public.users SET is_active = false WHERE primerica_id = 'lul8p';
   ```
   - Résultat attendu : "Compte inactif"
   ```sql
   -- Réactiver le compte après le test
   UPDATE public.users SET is_active = true WHERE primerica_id = 'lul8p';
   ```

## 🔍 Vérifications Post-Test

### 1. Vérifier la Session
Après une connexion réussie, vérifiez dans la console :
```javascript
// Dans la console du navigateur
console.log('Session:', await supabase.auth.getSession())
```

### 2. Vérifier le Profil Utilisateur
```javascript
// Dans la console du navigateur
console.log('User:', await supabase.auth.getUser())
```

### 3. Test de Déconnexion
Cliquez sur le bouton de déconnexion et vérifiez que :
- L'utilisateur est redirigé vers la page de connexion
- La session est bien supprimée
- Aucune erreur dans la console

## 📋 Checklist de Validation

- [ ] RLS activé sur `public.users`
- [ ] Policy "Allow anon login read" créée
- [ ] Utilisateur de test créé avec `primerica_id = 'lul8p'`
- [ ] Connexion réussie avec les bons identifiants
- [ ] Gestion correcte des erreurs (numéro inexistant, mot de passe incorrect, compte inactif)
- [ ] Aucune erreur 500 dans les logs
- [ ] Session Supabase créée correctement
- [ ] Déconnexion fonctionnelle
- [ ] Interface utilisateur responsive et intuitive

## 🚨 Dépannage

### Erreur "Numéro de représentant introuvable" avec un utilisateur existant
- Vérifiez que la policy RLS permet bien la lecture anonyme
- Vérifiez que `primerica_id` correspond exactement (sensible à la casse)

### Erreur 500 persistante
- Vérifiez les logs Supabase dans le dashboard
- Assurez-vous que la table `users` existe et a la bonne structure
- Vérifiez que l'utilisateur existe dans `auth.users` ET `public.users`

### "Mot de passe incorrect" avec le bon mot de passe
- Vérifiez que l'email dans `public.users` correspond à celui dans `auth.users`
- Vérifiez que le mot de passe a été correctement hashé dans `auth.users`

Si tous les tests passent, le flux de connexion sécurisé est correctement implémenté ! 🎉