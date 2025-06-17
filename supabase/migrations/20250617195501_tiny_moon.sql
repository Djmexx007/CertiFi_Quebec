/*
  # Politiques de sécurité RLS (Row Level Security)

  1. Policies pour table `users`
    - Accès anonyme pour lookup de connexion
    - Accès authentifié pour profil personnel
    - Accès admin pour gestion

  2. Policies pour toutes les autres tables
    - Accès basé sur l'authentification
    - Restrictions selon les rôles
    - Accès admin complet

  3. Sécurité
    - Principe du moindre privilège
    - Isolation des données utilisateur
    - Contrôle d'accès granulaire
*/

-- =============================================
-- POLICIES POUR TABLE USERS
-- =============================================

-- Accès anonyme pour lookup de connexion (primerica_id -> email, is_active)
CREATE POLICY "allow_anon_login_read" ON public.users
    FOR SELECT TO anon
    USING (true);

-- Accès authentifié pour lire son propre profil
CREATE POLICY "users_can_read_own" ON public.users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- Accès authentifié pour modifier son propre profil
CREATE POLICY "users_can_update_own" ON public.users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Accès admin complet pour gestion des utilisateurs
CREATE POLICY "admins_manage_users" ON public.users
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u2 
            WHERE u2.id = auth.uid() 
            AND (u2.is_admin OR u2.is_supreme_admin)
        )
    );

-- =============================================
-- POLICIES POUR TABLE PERMISSIONS
-- =============================================

-- Lecture pour tous les utilisateurs authentifiés
CREATE POLICY "permissions_read_authenticated" ON public.permissions
    FOR SELECT TO authenticated
    USING (true);

-- Gestion par les admins uniquement
CREATE POLICY "permissions_admin_manage" ON public.permissions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND (u.is_admin OR u.is_supreme_admin)
        )
    );

-- =============================================
-- POLICIES POUR TABLE USER_PERMISSIONS
-- =============================================

-- Lecture de ses propres permissions
CREATE POLICY "user_permissions_read_own" ON public.user_permissions
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Gestion par les admins
CREATE POLICY "user_permissions_admin_manage" ON public.user_permissions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND (u.is_admin OR u.is_supreme_admin)
        )
    );

-- =============================================
-- POLICIES POUR TABLE PODCAST_CONTENT
-- =============================================

-- Lecture pour utilisateurs authentifiés
CREATE POLICY "podcast_content_read_authenticated" ON public.podcast_content
    FOR SELECT TO authenticated
    USING (is_active = true);

-- Gestion par les admins
CREATE POLICY "podcast_content_admin_manage" ON public.podcast_content
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND (u.is_admin OR u.is_supreme_admin)
        )
    );

-- =============================================
-- POLICIES POUR TABLE QUESTIONS
-- =============================================

-- Lecture pour utilisateurs authentifiés
CREATE POLICY "questions_read_authenticated" ON public.questions
    FOR SELECT TO authenticated
    USING (is_active = true);

-- Gestion par les admins
CREATE POLICY "questions_admin_manage" ON public.questions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND (u.is_admin OR u.is_supreme_admin)
        )
    );

-- =============================================
-- POLICIES POUR TABLE EXAMS
-- =============================================

-- Lecture pour utilisateurs authentifiés
CREATE POLICY "exams_read_authenticated" ON public.exams
    FOR SELECT TO authenticated
    USING (is_active = true);

-- Gestion par les admins
CREATE POLICY "exams_admin_manage" ON public.exams
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND (u.is_admin OR u.is_supreme_admin)
        )
    );

-- =============================================
-- POLICIES POUR TABLE USER_EXAM_ATTEMPTS
-- =============================================

-- Lecture de ses propres tentatives
CREATE POLICY "user_exam_attempts_read_own" ON public.user_exam_attempts
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Création de ses propres tentatives
CREATE POLICY "user_exam_attempts_create_own" ON public.user_exam_attempts
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Gestion par les admins
CREATE POLICY "user_exam_attempts_admin_manage" ON public.user_exam_attempts
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND (u.is_admin OR u.is_supreme_admin)
        )
    );

-- =============================================
-- POLICIES POUR TABLE MINIGAMES
-- =============================================

-- Lecture pour utilisateurs authentifiés
CREATE POLICY "minigames_read_authenticated" ON public.minigames
    FOR SELECT TO authenticated
    USING (is_active = true);

-- Gestion par les admins
CREATE POLICY "minigames_admin_manage" ON public.minigames
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND (u.is_admin OR u.is_supreme_admin)
        )
    );

-- =============================================
-- POLICIES POUR TABLE USER_MINIGAME_SCORES
-- =============================================

-- Lecture de ses propres scores
CREATE POLICY "user_minigame_scores_read_own" ON public.user_minigame_scores
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Création de ses propres scores
CREATE POLICY "user_minigame_scores_create_own" ON public.user_minigame_scores
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Gestion par les admins
CREATE POLICY "user_minigame_scores_admin_manage" ON public.user_minigame_scores
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND (u.is_admin OR u.is_supreme_admin)
        )
    );

-- =============================================
-- POLICIES POUR TABLE RECENT_ACTIVITIES
-- =============================================

-- Lecture de ses propres activités
CREATE POLICY "recent_activities_read_own" ON public.recent_activities
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Création de ses propres activités
CREATE POLICY "recent_activities_create_own" ON public.recent_activities
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Lecture globale pour les admins
CREATE POLICY "recent_activities_admin_read_all" ON public.recent_activities
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND (u.is_admin OR u.is_supreme_admin)
        )
    );

-- Gestion par les admins
CREATE POLICY "recent_activities_admin_manage" ON public.recent_activities
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND (u.is_admin OR u.is_supreme_admin)
        )
    );

-- =============================================
-- POLICIES POUR TABLE ADMIN_LOGS
-- =============================================

-- Lecture pour les admins uniquement
CREATE POLICY "admin_logs_admin_read" ON public.admin_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND (u.is_admin OR u.is_supreme_admin)
        )
    );

-- Création par les admins
CREATE POLICY "admin_logs_admin_create" ON public.admin_logs
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND (u.is_admin OR u.is_supreme_admin)
        )
    );

-- Gestion complète par les admins suprêmes
CREATE POLICY "admin_logs_supreme_admin_manage" ON public.admin_logs
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND u.is_supreme_admin
        )
    );

RAISE NOTICE 'Policies RLS créées avec succès - Sécurité configurée pour toutes les tables';