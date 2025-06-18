/*
  # Données d'exemple pour CertiFi Québec

  1. Contenu pédagogique
    - Podcasts de formation
    - Questions d'examen
    - Examens configurés
    - Mini-jeux éducatifs

  2. Configuration
    - Données réalistes pour démonstration
    - Contenu adapté aux rôles PQAP et Fonds Mutuels
    - Niveaux de difficulté variés

  3. Objectif
    - Permettre les tests immédiats
    - Démonstration des fonctionnalités
    - Base pour développement futur
*/

-- =============================================
-- CONTENU PODCAST
-- =============================================

INSERT INTO public.podcast_content (
    title, description, audio_url, duration_seconds, theme, 
    required_permission, xp_awarded, source_document_ref, is_active
) VALUES
(
    'Introduction à la Déontologie PQAP',
    'Les principes fondamentaux de la déontologie pour les conseillers en assurance de personnes',
    'https://example.com/podcasts/deontologie-intro.mp3',
    1800,
    'Déontologie',
    'pqap',
    50,
    'F311-Ch1',
    true
),
(
    'Gestion des Conflits d''Intérêts',
    'Comment identifier et gérer les situations de conflits d''intérêts',
    'https://example.com/podcasts/conflits-interets.mp3',
    2100,
    'Déontologie',
    'pqap',
    60,
    'F311-Ch3',
    true
),
(
    'Stratégies de Diversification',
    'Les principes de base de la diversification de portefeuille',
    'https://example.com/podcasts/diversification.mp3',
    2400,
    'Investissement',
    'fonds_mutuels',
    75,
    'F312-Ch2',
    true
),
(
    'Analyse des Fonds Mutuels',
    'Comment analyser et comparer les fonds mutuels pour vos clients',
    'https://example.com/podcasts/analyse-fonds.mp3',
    2700,
    'Investissement',
    'fonds_mutuels',
    80,
    'F312-Ch4',
    true
),
(
    'Communication Client Efficace',
    'Techniques de communication pour mieux servir vos clients',
    'https://example.com/podcasts/communication-client.mp3',
    1950,
    'Relation Client',
    'pqap',
    55,
    'F311-Ch5',
    true
)
ON CONFLICT DO NOTHING;

-- =============================================
-- QUESTIONS D'EXAMEN PQAP
-- =============================================

INSERT INTO public.questions (
    question_text, question_type, options_json, correct_answer_key, 
    explanation, difficulty_level, required_permission, source_document_ref, 
    chapter_reference, is_active
) VALUES
(
    'Quelle est la définition de la déontologie en assurance de personnes?',
    'MCQ',
    '{"A": "Un ensemble de règles morales qui régissent la profession", "B": "Une technique de vente d''assurance", "C": "Un produit d''assurance spécialisé", "D": "Une méthode de calcul des primes"}',
    'A',
    'La déontologie représente l''ensemble des règles morales et éthiques qui régissent l''exercice d''une profession.',
    1,
    'pqap',
    'F311-Ch1',
    'Chapitre 1 - Concepts de base',
    true
),
(
    'Un conseiller doit-il divulguer tous ses conflits d''intérêts potentiels?',
    'TRUE_FALSE',
    '{"true": "Oui, tous les conflits doivent être divulgués", "false": "Non, seulement les conflits majeurs"}',
    'true',
    'La transparence totale est exigée concernant tous les conflits d''intérêts, même mineurs.',
    2,
    'pqap',
    'F311-Ch3',
    'Chapitre 3 - Conflits d''intérêts',
    true
),
(
    'Quelle est la durée minimale de conservation des dossiers clients?',
    'MCQ',
    '{"A": "1 an", "B": "3 ans", "C": "5 ans", "D": "7 ans"}',
    'D',
    'Les dossiers clients doivent être conservés pendant au moins 7 ans selon la réglementation.',
    2,
    'pqap',
    'F311-Ch4',
    'Chapitre 4 - Gestion documentaire',
    true
),
(
    'Le principe de ''Know Your Client'' (KYC) implique:',
    'MCQ',
    '{"A": "Connaître seulement le nom du client", "B": "Connaître la situation financière complète", "C": "Connaître uniquement les besoins d''assurance", "D": "Connaître les antécédents médicaux"}',
    'B',
    'Le KYC exige une connaissance approfondie de la situation financière, des objectifs et de la tolérance au risque du client.',
    3,
    'pqap',
    'F311-Ch2',
    'Chapitre 2 - Connaissance client',
    true
),
(
    'En cas de plainte d''un client, quelle est la première étape?',
    'MCQ',
    '{"A": "Ignorer la plainte", "B": "Transférer immédiatement à un superviseur", "C": "Écouter et documenter la plainte", "D": "Offrir une compensation financière"}',
    'C',
    'La première étape consiste toujours à écouter attentivement le client et à documenter sa plainte de manière détaillée.',
    2,
    'pqap',
    'F311-Ch6',
    'Chapitre 6 - Gestion des plaintes',
    true
)
ON CONFLICT DO NOTHING;

-- =============================================
-- QUESTIONS D'EXAMEN FONDS MUTUELS
-- =============================================

INSERT INTO public.questions (
    question_text, question_type, options_json, correct_answer_key, 
    explanation, difficulty_level, required_permission, source_document_ref, 
    chapter_reference, is_active
) VALUES
(
    'Qu''est-ce que le ratio de frais de gestion (MER)?',
    'MCQ',
    '{"A": "Le rendement annuel du fonds", "B": "Le pourcentage des frais annuels par rapport à l''actif", "C": "Le nombre d''unités dans le fonds", "D": "La valeur liquidative"}',
    'B',
    'Le MER (Management Expense Ratio) représente le pourcentage des frais de gestion annuels par rapport à l''actif total du fonds.',
    2,
    'fonds_mutuels',
    'F312-Ch1',
    'Chapitre 1 - Frais et coûts',
    true
),
(
    'La diversification permet de réduire:',
    'MCQ',
    '{"A": "Le risque systématique uniquement", "B": "Le risque non-systématique uniquement", "C": "Tous les types de risques", "D": "Aucun risque"}',
    'B',
    'La diversification permet de réduire le risque non-systématique (spécifique), mais ne peut éliminer le risque systématique (de marché).',
    3,
    'fonds_mutuels',
    'F312-Ch2',
    'Chapitre 2 - Gestion des risques',
    true
),
(
    'Un fonds équilibré contient typiquement:',
    'MCQ',
    '{"A": "Seulement des actions", "B": "Seulement des obligations", "C": "Un mélange d''actions et d''obligations", "D": "Seulement des liquidités"}',
    'C',
    'Un fonds équilibré maintient un portefeuille diversifié comprenant à la fois des actions et des obligations selon une allocation prédéterminée.',
    1,
    'fonds_mutuels',
    'F312-Ch3',
    'Chapitre 3 - Types de fonds',
    true
),
(
    'La valeur liquidative (VL) est calculée:',
    'MCQ',
    '{"A": "Une fois par semaine", "B": "Une fois par mois", "C": "Quotidiennement", "D": "En temps réel"}',
    'C',
    'La valeur liquidative est généralement calculée quotidiennement à la fermeture des marchés.',
    2,
    'fonds_mutuels',
    'F312-Ch1',
    'Chapitre 1 - Évaluation',
    true
),
(
    'Le risque de change affecte principalement:',
    'MCQ',
    '{"A": "Les fonds domestiques uniquement", "B": "Les fonds internationaux", "C": "Les fonds monétaires", "D": "Aucun type de fonds"}',
    'B',
    'Le risque de change affecte principalement les fonds qui investissent dans des titres libellés en devises étrangères.',
    3,
    'fonds_mutuels',
    'F312-Ch4',
    'Chapitre 4 - Risques spécialisés',
    true
)
ON CONFLICT DO NOTHING;

-- =============================================
-- CONFIGURATION DES EXAMENS
-- =============================================

INSERT INTO public.exams (
    exam_name, description, required_permission, num_questions_to_draw, 
    time_limit_minutes, passing_score_percentage, xp_base_reward, is_active
) VALUES
(
    'Examen PQAP - Déontologie',
    'Examen de certification en déontologie pour conseillers PQAP (35 questions)',
    'pqap',
    35,
    90,
    70.0,
    200,
    true
),
(
    'Examen Fonds Mutuels - Niveau 1',
    'Examen de base sur les fonds mutuels (50 questions)',
    'fonds_mutuels',
    50,
    120,
    75.0,
    250,
    true
),
(
    'Examen Fonds Mutuels - Niveau 2',
    'Examen avancé sur les fonds mutuels (100 questions)',
    'fonds_mutuels',
    100,
    180,
    80.0,
    400,
    true
),
(
    'Examen Mixte - PQAP et Fonds',
    'Examen combiné pour conseillers polyvalents (75 questions)',
    'pqap',
    75,
    150,
    75.0,
    350,
    true
)
ON CONFLICT DO NOTHING;

-- =============================================
-- MINI-JEUX ÉDUCATIFS
-- =============================================

INSERT INTO public.minigames (
    game_name, description, game_type, base_xp_gain, max_daily_xp, 
    required_permission, game_config_json, source_document_ref, is_active
) VALUES
(
    'Quiz Déontologie Express',
    'Quiz rapide de 10 questions sur la déontologie',
    'quiz',
    25,
    100,
    'pqap',
    '{"questions_count": 10, "time_limit": 300, "difficulty": "mixed"}',
    'F311-General',
    true
),
(
    'Mémoire des Fonds',
    'Jeu de mémoire pour apprendre les caractéristiques des fonds',
    'memory',
    20,
    80,
    'fonds_mutuels',
    '{"cards_count": 16, "time_limit": 180, "theme": "fund_types"}',
    'F312-General',
    true
),
(
    'Calculateur de Risque',
    'Simulation interactive de calcul de profil de risque',
    'simulation',
    30,
    120,
    'fonds_mutuels',
    '{"scenarios": 5, "complexity": "intermediate"}',
    'F312-Ch2',
    true
),
(
    'Éthique en Action',
    'Scénarios interactifs sur les dilemmes éthiques',
    'scenario',
    35,
    140,
    'pqap',
    '{"scenarios_count": 8, "branching": true, "feedback": "detailed"}',
    'F311-Ch3',
    true
)
ON CONFLICT DO NOTHING;

-- =============================================
-- VÉRIFICATION DES DONNÉES INSÉRÉES
-- =============================================

DO $$
DECLARE
    podcast_count INTEGER;
    question_count INTEGER;
    exam_count INTEGER;
    minigame_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO podcast_count FROM public.podcast_content WHERE is_active = true;
    SELECT COUNT(*) INTO question_count FROM public.questions WHERE is_active = true;
    SELECT COUNT(*) INTO exam_count FROM public.exams WHERE is_active = true;
    SELECT COUNT(*) INTO minigame_count FROM public.minigames WHERE is_active = true;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DONNÉES D''EXEMPLE INSÉRÉES';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Podcasts: % créés', podcast_count;
    RAISE NOTICE 'Questions: % créées', question_count;
    RAISE NOTICE 'Examens: % configurés', exam_count;
    RAISE NOTICE 'Mini-jeux: % disponibles', minigame_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Base de données prête pour les tests !';
    RAISE NOTICE '========================================';
END $$;