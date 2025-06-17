/*
  # Comptes de Test CertiFi Québec

  1. Comptes Administrateurs
    - Suprême Admin: supreme.admin@primerica.com (SUPREMEADMIN001)
    - Admin Régulier: regular.admin@primerica.com (REGULARADMIN001)

  2. Comptes Utilisateurs
    - Utilisateur PQAP: user.pqap@primerica.com (PQAPUSER001)
    - Utilisateur Fonds Mutuels: user.fonds@primerica.com (FONDSUSER001)
    - Utilisateur Les Deux: user.both@primerica.com (BOTHUSER001)

  3. Données de Test
    - Activités d'exemple
    - Tentatives d'examen
    - Scores de mini-jeux
*/

-- ============================================================================
-- CRÉATION DES COMPTES DE TEST
-- ============================================================================

-- Insérer les utilisateurs de test dans auth.users (simulation)
-- Note: En production, ces utilisateurs seraient créés via l'API d'authentification

-- Utilisateur Suprême Admin
INSERT INTO users (
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
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'SUPREMEADMIN001',
  'supreme.admin@primerica.com',
  'Admin',
  'Suprême',
  'LES_DEUX',
  5000,
  5,
  'Expert Conseiller',
  true,
  true,
  true
) ON CONFLICT (primerica_id) DO NOTHING;

-- Utilisateur Admin Régulier
INSERT INTO users (
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
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'REGULARADMIN001',
  'regular.admin@primerica.com',
  'Admin',
  'Régulier',
  'LES_DEUX',
  3000,
  4,
  'Conseiller Senior',
  true,
  false,
  true
) ON CONFLICT (primerica_id) DO NOTHING;

-- Utilisateur PQAP
INSERT INTO users (
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
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  'PQAPUSER001',
  'user.pqap@primerica.com',
  'Jean',
  'Dupont',
  'PQAP',
  1250,
  3,
  'Conseiller',
  false,
  false,
  true
) ON CONFLICT (primerica_id) DO NOTHING;

-- Utilisateur Fonds Mutuels
INSERT INTO users (
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
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000004',
  'FONDSUSER001',
  'user.fonds@primerica.com',
  'Marie',
  'Tremblay',
  'FONDS_MUTUELS',
  2100,
  4,
  'Conseiller Senior',
  false,
  false,
  true
) ON CONFLICT (primerica_id) DO NOTHING;

-- Utilisateur Les Deux
INSERT INTO users (
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
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000005',
  'BOTHUSER001',
  'user.both@primerica.com',
  'Pierre',
  'Bouchard',
  'LES_DEUX',
  4200,
  5,
  'Expert Conseiller',
  false,
  false,
  true
) ON CONFLICT (primerica_id) DO NOTHING;

-- ============================================================================
-- ATTRIBUTION DES PERMISSIONS AUX UTILISATEURS DE TEST
-- ============================================================================

-- Permissions pour Suprême Admin (toutes)
INSERT INTO user_permissions (user_id, permission_id) 
SELECT '00000000-0000-0000-0000-000000000001', id 
FROM permissions
ON CONFLICT (user_id, permission_id) DO NOTHING;

-- Permissions pour Admin Régulier (admin + contenu)
INSERT INTO user_permissions (user_id, permission_id) 
SELECT '00000000-0000-0000-0000-000000000002', id 
FROM permissions 
WHERE name IN ('admin', 'pqap', 'fonds_mutuels')
ON CONFLICT (user_id, permission_id) DO NOTHING;

-- Permissions pour utilisateur PQAP
INSERT INTO user_permissions (user_id, permission_id) 
SELECT '00000000-0000-0000-0000-000000000003', id 
FROM permissions 
WHERE name = 'pqap'
ON CONFLICT (user_id, permission_id) DO NOTHING;

-- Permissions pour utilisateur Fonds Mutuels
INSERT INTO user_permissions (user_id, permission_id) 
SELECT '00000000-0000-0000-0000-000000000004', id 
FROM permissions 
WHERE name = 'fonds_mutuels'
ON CONFLICT (user_id, permission_id) DO NOTHING;

-- Permissions pour utilisateur Les Deux
INSERT INTO user_permissions (user_id, permission_id) 
SELECT '00000000-0000-0000-0000-000000000005', id 
FROM permissions 
WHERE name IN ('pqap', 'fonds_mutuels')
ON CONFLICT (user_id, permission_id) DO NOTHING;

-- ============================================================================
-- DONNÉES D'EXEMPLE POUR LES TESTS
-- ============================================================================

-- Activités récentes d'exemple
INSERT INTO recent_activities (user_id, activity_type, activity_details_json, xp_gained, occurred_at) VALUES
-- Activités Jean Dupont (PQAP)
('00000000-0000-0000-0000-000000000003', 'podcast_listened', '{"podcast_title": "Introduction à la Déontologie", "theme": "Déontologie"}', 50, NOW() - INTERVAL '2 hours'),
('00000000-0000-0000-0000-000000000003', 'exam_completed', '{"exam_name": "Quiz PQAP Express", "score": 85, "passed": true}', 75, NOW() - INTERVAL '1 day'),
('00000000-0000-0000-0000-000000000003', 'minigame_played', '{"game_name": "Quiz Éclair Déontologie", "score": 850}', 30, NOW() - INTERVAL '3 days'),
('00000000-0000-0000-0000-000000000003', 'level_up', '{"old_level": 2, "new_level": 3, "new_role": "Conseiller"}', 0, NOW() - INTERVAL '5 days'),

-- Activités Marie Tremblay (Fonds Mutuels)
('00000000-0000-0000-0000-000000000004', 'podcast_listened', '{"podcast_title": "Fonds Communs de Placement", "theme": "Fonds Mutuels"}', 55, NOW() - INTERVAL '1 hour'),
('00000000-0000-0000-0000-000000000004', 'exam_completed', '{"exam_name": "Quiz Fonds Mutuels Express", "score": 92, "passed": true}', 85, NOW() - INTERVAL '2 days'),
('00000000-0000-0000-0000-000000000004', 'minigame_played', '{"game_name": "Calculs Express", "score": 950}', 40, NOW() - INTERVAL '4 days'),

-- Activités Pierre Bouchard (Les Deux)
('00000000-0000-0000-0000-000000000005', 'podcast_listened', '{"podcast_title": "Calculs Financiers Avancés", "theme": "Calculs"}', 70, NOW() - INTERVAL '30 minutes'),
('00000000-0000-0000-0000-000000000005', 'exam_completed', '{"exam_name": "Examen PQAP Complet", "score": 88, "passed": true}', 220, NOW() - INTERVAL '1 day'),
('00000000-0000-0000-0000-000000000005', 'exam_completed', '{"exam_name": "Examen Fonds Mutuels Complet", "score": 91, "passed": true}', 280, NOW() - INTERVAL '3 days'),
('00000000-0000-0000-0000-000000000005', 'level_up', '{"old_level": 4, "new_level": 5, "new_role": "Expert Conseiller"}', 0, NOW() - INTERVAL '6 days');

-- Tentatives d'examen d'exemple
INSERT INTO user_exam_attempts (user_id, exam_id, score_percentage, user_answers_json, time_spent_seconds, xp_earned) VALUES
-- Jean Dupont - Quiz PQAP Express
('00000000-0000-0000-0000-000000000003', 
 (SELECT id FROM exams WHERE exam_name = 'Quiz PQAP Express' LIMIT 1),
 85.0,
 '{"answers": [{"question_id": "q1", "user_answer": "B", "correct": true}, {"question_id": "q2", "user_answer": "A", "correct": false}]}',
 720,
 75),

-- Marie Tremblay - Quiz Fonds Mutuels Express  
('00000000-0000-0000-0000-000000000004',
 (SELECT id FROM exams WHERE exam_name = 'Quiz Fonds Mutuels Express' LIMIT 1),
 92.0,
 '{"answers": [{"question_id": "q1", "user_answer": "A", "correct": true}, {"question_id": "q2", "user_answer": "B", "correct": true}]}',
 850,
 85),

-- Pierre Bouchard - Examens complets
('00000000-0000-0000-0000-000000000005',
 (SELECT id FROM exams WHERE exam_name = 'Examen PQAP Complet' LIMIT 1),
 88.0,
 '{"answers": [{"question_id": "q1", "user_answer": "B", "correct": true}]}',
 4200,
 220),

('00000000-0000-0000-0000-000000000005',
 (SELECT id FROM exams WHERE exam_name = 'Examen Fonds Mutuels Complet' LIMIT 1),
 91.0,
 '{"answers": [{"question_id": "q1", "user_answer": "A", "correct": true}]}',
 7800,
 280);

-- Scores de mini-jeux d'exemple
INSERT INTO user_minigame_scores (user_id, minigame_id, score, max_possible_score, xp_earned, game_session_data) VALUES
-- Jean Dupont
('00000000-0000-0000-0000-000000000003',
 (SELECT id FROM minigames WHERE game_name = 'Quiz Éclair Déontologie' LIMIT 1),
 850, 1000, 30,
 '{"time_taken": 45, "correct_answers": 17, "total_questions": 20}'),

-- Marie Tremblay
('00000000-0000-0000-0000-000000000004',
 (SELECT id FROM minigames WHERE game_name = 'Calculs Express' LIMIT 1),
 950, 1000, 40,
 '{"time_taken": 120, "correct_calculations": 19, "total_calculations": 20}'),

-- Pierre Bouchard
('00000000-0000-0000-0000-000000000005',
 (SELECT id FROM minigames WHERE game_name = 'Scénarios Clients' LIMIT 1),
 1200, 1500, 50,
 '{"scenarios_completed": 8, "perfect_scores": 6, "time_taken": 180}'),

('00000000-0000-0000-0000-000000000005',
 (SELECT id FROM minigames WHERE game_name = 'Association Concepts' LIMIT 1),
 780, 1000, 35,
 '{"pairs_matched": 15, "time_taken": 90, "mistakes": 3}');

-- ============================================================================
-- LOGS D'ADMINISTRATION D'EXEMPLE
-- ============================================================================

INSERT INTO admin_logs (admin_user_id, action_type, target_entity, target_id, details_json) VALUES
-- Actions du Suprême Admin
('00000000-0000-0000-0000-000000000001', 'user_created', 'users', '00000000-0000-0000-0000-000000000003', 
 '{"created_user": "Jean Dupont", "primerica_id": "PQAPUSER001", "role": "PQAP"}'),

('00000000-0000-0000-0000-000000000001', 'role_changed', 'users', '00000000-0000-0000-0000-000000000002',
 '{"target_user": "Admin Régulier", "change": "granted admin privileges"}'),

-- Actions de l'Admin Régulier
('00000000-0000-0000-0000-000000000002', 'content_added', 'questions', 'new-question-id',
 '{"question_type": "MCQ", "topic": "Déontologie", "difficulty": 2}'),

('00000000-0000-0000-0000-000000000002', 'content_modified', 'podcast_content', 'podcast-id',
 '{"field_changed": "description", "old_value": "...", "new_value": "..."}'
);