/*
  # Activation RLS et Politiques de Sécurité CertiFi Québec

  1. Activation RLS
    - Activation sur toutes les tables utilisateur

  2. Politiques de Sécurité
    - Utilisateurs : accès à leurs propres données
    - Admins : accès étendu selon le niveau
    - Contenu : filtré par permissions
    - Journalisation : accès admin uniquement

  3. Sécurité Granulaire
    - Séparation stricte utilisateur/admin/suprême
    - Contrôle d'accès basé sur les rôles
    - Protection des données sensibles
*/

-- ============================================================================
-- ACTIVATION DE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE minigames ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_minigame_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamified_roles_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels_xp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUES POUR LA TABLE USERS
-- ============================================================================

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Les utilisateurs peuvent mettre à jour leur propre profil (champs limités)
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Empêcher la modification des champs sensibles
    (OLD.is_admin = NEW.is_admin) AND
    (OLD.is_supreme_admin = NEW.is_supreme_admin) AND
    (OLD.current_xp = NEW.current_xp) AND
    (OLD.current_level = NEW.current_level) AND
    (OLD.primerica_id = NEW.primerica_id)
  );

-- Les admins peuvent voir tous les profils
CREATE POLICY "Admins can read all profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

-- Les admins peuvent mettre à jour les profils (sauf flags admin)
CREATE POLICY "Admins can update profiles"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    ) AND
    -- Seuls les suprême admins peuvent modifier les flags admin
    (
      (OLD.is_admin = NEW.is_admin AND OLD.is_supreme_admin = NEW.is_supreme_admin) OR
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND is_supreme_admin = true
      )
    )
  );

-- Seuls les suprême admins peuvent supprimer des utilisateurs
CREATE POLICY "Supreme admins can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND is_supreme_admin = true
    )
  );

-- ============================================================================
-- POLITIQUES POUR LES PERMISSIONS
-- ============================================================================

-- Lecture publique des permissions pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can read permissions"
  ON permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Seuls les suprême admins peuvent gérer les permissions
CREATE POLICY "Supreme admins can manage permissions"
  ON permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND is_supreme_admin = true
    )
  );

-- ============================================================================
-- POLITIQUES POUR USER_PERMISSIONS
-- ============================================================================

-- Les utilisateurs peuvent voir leurs propres permissions
CREATE POLICY "Users can read own permissions"
  ON user_permissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Les admins peuvent voir toutes les permissions
CREATE POLICY "Admins can read all user permissions"
  ON user_permissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

-- Les admins peuvent gérer les permissions utilisateur
CREATE POLICY "Admins can manage user permissions"
  ON user_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

-- ============================================================================
-- POLITIQUES POUR LE CONTENU (PODCASTS, QUESTIONS, EXAMENS, MINIGAMES)
-- ============================================================================

-- Accès au contenu basé sur les permissions utilisateur
CREATE POLICY "Users can read content based on permissions"
  ON podcast_content
  FOR SELECT
  TO authenticated
  USING (
    is_active = true AND (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND (
          (required_permission = 'pqap' AND u.initial_role IN ('PQAP', 'LES_DEUX')) OR
          (required_permission = 'fonds_mutuels' AND u.initial_role IN ('FONDS_MUTUELS', 'LES_DEUX')) OR
          u.is_admin = true OR
          u.is_supreme_admin = true
        )
      )
    )
  );

CREATE POLICY "Users can read questions based on permissions"
  ON questions
  FOR SELECT
  TO authenticated
  USING (
    is_active = true AND (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND (
          (required_permission = 'pqap' AND u.initial_role IN ('PQAP', 'LES_DEUX')) OR
          (required_permission = 'fonds_mutuels' AND u.initial_role IN ('FONDS_MUTUELS', 'LES_DEUX')) OR
          u.is_admin = true OR
          u.is_supreme_admin = true
        )
      )
    )
  );

CREATE POLICY "Users can read exams based on permissions"
  ON exams
  FOR SELECT
  TO authenticated
  USING (
    is_active = true AND (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND (
          (required_permission = 'pqap' AND u.initial_role IN ('PQAP', 'LES_DEUX')) OR
          (required_permission = 'fonds_mutuels' AND u.initial_role IN ('FONDS_MUTUELS', 'LES_DEUX')) OR
          u.is_admin = true OR
          u.is_supreme_admin = true
        )
      )
    )
  );

CREATE POLICY "Users can read minigames based on permissions"
  ON minigames
  FOR SELECT
  TO authenticated
  USING (
    is_active = true AND (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND (
          (required_permission = 'pqap' AND u.initial_role IN ('PQAP', 'LES_DEUX')) OR
          (required_permission = 'fonds_mutuels' AND u.initial_role IN ('FONDS_MUTUELS', 'LES_DEUX')) OR
          u.is_admin = true OR
          u.is_supreme_admin = true
        )
      )
    )
  );

-- Les admins peuvent gérer tout le contenu
CREATE POLICY "Admins can manage all content"
  ON podcast_content
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

CREATE POLICY "Admins can manage all questions"
  ON questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

CREATE POLICY "Admins can manage all exams"
  ON exams
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

CREATE POLICY "Admins can manage all minigames"
  ON minigames
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

-- ============================================================================
-- POLITIQUES POUR LES DONNÉES UTILISATEUR
-- ============================================================================

-- Tentatives d'examen
CREATE POLICY "Users can read own exam attempts"
  ON user_exam_attempts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exam attempts"
  ON user_exam_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all exam attempts"
  ON user_exam_attempts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

-- Scores de mini-jeux
CREATE POLICY "Users can read own minigame scores"
  ON user_minigame_scores
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own minigame scores"
  ON user_minigame_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all minigame scores"
  ON user_minigame_scores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

-- Activités récentes
CREATE POLICY "Users can read own activities"
  ON recent_activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert activities"
  ON recent_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Permet l'insertion par les Edge Functions

CREATE POLICY "Admins can read all activities"
  ON recent_activities
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

-- ============================================================================
-- POLITIQUES POUR LES CONFIGURATIONS (LECTURE PUBLIQUE)
-- ============================================================================

-- Configuration des rôles gamifiés
CREATE POLICY "Authenticated users can read gamified roles config"
  ON gamified_roles_config
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage gamified roles config"
  ON gamified_roles_config
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

-- Configuration des niveaux XP
CREATE POLICY "Authenticated users can read levels config"
  ON levels_xp_config
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage levels config"
  ON levels_xp_config
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

-- ============================================================================
-- POLITIQUES POUR LES LOGS ADMIN
-- ============================================================================

-- Seuls les admins peuvent lire les logs
CREATE POLICY "Admins can read admin logs"
  ON admin_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );

-- Seuls les admins peuvent créer des logs
CREATE POLICY "Admins can insert admin logs"
  ON admin_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_supreme_admin = true)
    )
  );