/*
  # CertiFi Québec - Politiques RLS Complètes
  
  Politiques de sécurité au niveau des lignes pour toutes les tables,
  avec gestion granulaire des permissions par rôle utilisateur.
*/

-- Politiques pour la table users
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = TRUE OR is_supreme_admin = TRUE)
    )
  );

CREATE POLICY "Users can update own profile (limited)"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND is_admin = OLD.is_admin 
    AND is_supreme_admin = OLD.is_supreme_admin
    AND current_xp = OLD.current_xp
    AND current_level = OLD.current_level
  );

CREATE POLICY "Supreme admins can update admin roles"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND is_supreme_admin = TRUE
    )
  );

CREATE POLICY "Supreme admins can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND is_supreme_admin = TRUE
    )
  );

-- Politiques pour user_permissions
CREATE POLICY "Users can view own permissions"
  ON user_permissions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all permissions"
  ON user_permissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = TRUE OR is_supreme_admin = TRUE)
    )
  );

CREATE POLICY "Supreme admins can manage permissions"
  ON user_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND is_supreme_admin = TRUE
    )
  );

-- Politiques pour permissions (lecture publique pour les utilisateurs authentifiés)
CREATE POLICY "Authenticated users can view permissions"
  ON permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Supreme admins can manage permissions table"
  ON permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND is_supreme_admin = TRUE
    )
  );

-- Politiques pour levels_xp_config et gamified_roles_config (lecture publique)
CREATE POLICY "Users can view XP levels config"
  ON levels_xp_config
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage XP levels config"
  ON levels_xp_config
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = TRUE OR is_supreme_admin = TRUE)
    )
  );

CREATE POLICY "Users can view gamified roles config"
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
      AND (is_admin = TRUE OR is_supreme_admin = TRUE)
    )
  );

-- Politiques pour podcast_content
CREATE POLICY "Users can view podcasts based on permissions"
  ON podcast_content
  FOR SELECT
  TO authenticated
  USING (
    is_active = TRUE
    AND (
      -- User has the required permission
      EXISTS (
        SELECT 1 FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = auth.uid() 
        AND p.name = required_permission
      )
      OR
      -- User is admin
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND (is_admin = TRUE OR is_supreme_admin = TRUE)
      )
    )
  );

CREATE POLICY "Admins can manage podcast content"
  ON podcast_content
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = TRUE OR is_supreme_admin = TRUE)
    )
  );

-- Politiques pour questions
CREATE POLICY "Users can view questions based on permissions"
  ON questions
  FOR SELECT
  TO authenticated
  USING (
    is_active = TRUE
    AND (
      EXISTS (
        SELECT 1 FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = auth.uid() 
        AND p.name = required_permission
      )
      OR
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND (is_admin = TRUE OR is_supreme_admin = TRUE)
      )
    )
  );

CREATE POLICY "Admins can manage questions"
  ON questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = TRUE OR is_supreme_admin = TRUE)
    )
  );

-- Politiques pour exams
CREATE POLICY "Users can view exams based on permissions"
  ON exams
  FOR SELECT
  TO authenticated
  USING (
    is_active = TRUE
    AND (
      EXISTS (
        SELECT 1 FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = auth.uid() 
        AND p.name = required_permission
      )
      OR
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND (is_admin = TRUE OR is_supreme_admin = TRUE)
      )
    )
  );

CREATE POLICY "Admins can manage exams"
  ON exams
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = TRUE OR is_supreme_admin = TRUE)
    )
  );

-- Politiques pour user_exam_attempts
CREATE POLICY "Users can view own exam attempts"
  ON user_exam_attempts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all exam attempts"
  ON user_exam_attempts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = TRUE OR is_supreme_admin = TRUE)
    )
  );

CREATE POLICY "Users can insert own exam attempts"
  ON user_exam_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own exam attempts"
  ON user_exam_attempts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all exam attempts"
  ON user_exam_attempts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = TRUE OR is_supreme_admin = TRUE)
    )
  );

-- Politiques pour minigames
CREATE POLICY "Users can view minigames based on permissions"
  ON minigames
  FOR SELECT
  TO authenticated
  USING (
    is_active = TRUE
    AND (
      EXISTS (
        SELECT 1 FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = auth.uid() 
        AND p.name = required_permission
      )
      OR
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND (is_admin = TRUE OR is_supreme_admin = TRUE)
      )
    )
  );

CREATE POLICY "Admins can manage minigames"
  ON minigames
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = TRUE OR is_supreme_admin = TRUE)
    )
  );

-- Politiques pour user_minigame_scores
CREATE POLICY "Users can view own minigame scores"
  ON user_minigame_scores
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all minigame scores"
  ON user_minigame_scores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = TRUE OR is_supreme_admin = TRUE)
    )
  );

CREATE POLICY "Users can insert own minigame scores"
  ON user_minigame_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all minigame scores"
  ON user_minigame_scores
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = TRUE OR is_supreme_admin = TRUE)
    )
  );

-- Politiques pour recent_activities
CREATE POLICY "Users can view own activities"
  ON recent_activities
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all activities"
  ON recent_activities
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = TRUE OR is_supreme_admin = TRUE)
    )
  );

CREATE POLICY "System can insert activities"
  ON recent_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Contrôlé par les fonctions

-- Politiques pour admin_logs
CREATE POLICY "Admins can view admin logs"
  ON admin_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = TRUE OR is_supreme_admin = TRUE)
    )
  );

CREATE POLICY "Admins can insert admin logs"
  ON admin_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_admin = TRUE OR is_supreme_admin = TRUE)
    )
  );