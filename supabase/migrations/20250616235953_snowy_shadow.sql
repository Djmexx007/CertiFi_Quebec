/*
  # CertiFi Québec - Données d'Exemple
  
  Insertion de contenu d'exemple basé sur les documents fournis :
  - Questions d'examen PQAP et Fonds Mutuels
  - Podcasts de formation
  - Mini-jeux éducatifs
  - Configuration d'examens
*/

-- Questions PQAP basées sur F111.pdf et F311.pdf
INSERT INTO questions (question_text, question_type, options_json, correct_answer_key, explanation, difficulty_level, required_permission, source_document_ref, chapter_reference) VALUES

-- Questions F111 (Déontologie et Pratiques)
('Selon le Code de déontologie, un représentant doit-il divulguer tout conflit d''intérêts potentiel à son client?', 'TrueFalse', '{"true": "Vrai", "false": "Faux"}', 'true', 'La divulgation des conflits d''intérêts est une obligation fondamentale pour maintenir la confiance et la transparence avec le client.', 2, 'pqap', 'F111-Ch2', 'Chapitre 2 - Obligations déontologiques'),

('Quelle est la période minimale de conservation des dossiers clients selon la réglementation?', 'MCQ', '{"A": "3 ans", "B": "5 ans", "C": "7 ans", "D": "10 ans"}', 'C', 'Les dossiers clients doivent être conservés pendant au moins 7 ans selon la réglementation de l''AMF.', 3, 'pqap', 'F111-Ch4', 'Chapitre 4 - Conservation des documents'),

('Un représentant peut-il accepter des cadeaux de valeur de la part d''un client?', 'TrueFalse', '{"true": "Vrai", "false": "Faux"}', 'false', 'L''acceptation de cadeaux de valeur peut créer un conflit d''intérêts et compromettre l''indépendance du représentant.', 2, 'pqap', 'F111-Ch3', 'Chapitre 3 - Conflits d''intérêts'),

('Quelle information doit obligatoirement figurer dans une proposition d''assurance?', 'MCQ', '{"A": "Le nom du bénéficiaire seulement", "B": "Le montant de la prime seulement", "C": "L''identification complète du proposant et les détails de la couverture", "D": "Seulement la date d''effet"}', 'C', 'Une proposition d''assurance doit contenir l''identification complète du proposant et tous les détails de la couverture demandée.', 3, 'pqap', 'F111-Ch5', 'Chapitre 5 - Documentation'),

-- Questions F311 (Assurance Vie)
('Quelle est la définition de la "prime" dans le contexte de l''assurance vie?', 'MCQ', '{"A": "Le montant payé en cas de décès", "B": "Le montant périodique payé pour maintenir la police en vigueur", "C": "La valeur de rachat de la police", "D": "Le montant des dividendes"}', 'B', 'La prime est le montant périodique que le preneur doit payer à l''assureur pour maintenir la police d''assurance en vigueur.', 1, 'pqap', 'F311-Ch1', 'Chapitre 1 - Définitions de base'),

('Quelle est la période de grâce standard pour le paiement des primes?', 'MCQ', '{"A": "15 jours", "B": "30 jours", "C": "31 jours", "D": "60 jours"}', 'C', 'La période de grâce standard est de 31 jours, pendant laquelle la police reste en vigueur même si la prime n''a pas été payée.', 2, 'pqap', 'F311-Ch3', 'Chapitre 3 - Paiement des primes'),

('Qu''est-ce que la "clause de remise en vigueur" permet?', 'MCQ', '{"A": "D''augmenter le capital assuré", "B": "De remettre en vigueur une police déchue", "C": "De changer de bénéficiaire", "D": "De réduire les primes"}', 'B', 'La clause de remise en vigueur permet de remettre en vigueur une police qui a été annulée pour non-paiement de prime, sous certaines conditions.', 3, 'pqap', 'F311-Ch4', 'Chapitre 4 - Clauses spéciales'),

('Dans une assurance vie temporaire, que se passe-t-il à l''échéance du terme?', 'MCQ', '{"A": "La police se renouvelle automatiquement", "B": "La couverture prend fin", "C": "Elle se transforme en assurance permanente", "D": "Les primes diminuent"}', 'B', 'Dans une assurance vie temporaire, la couverture prend fin à l''échéance du terme spécifié dans la police.', 2, 'pqap', 'F311-Ch2', 'Chapitre 2 - Types d''assurance'),

-- Questions Fonds Mutuels basées sur "fonds et rentes.pdf" et "fic-2024-sep.pdf"
('Quelle est la formule de base pour calculer la valeur future avec intérêt composé?', 'MCQ', '{"A": "VF = VA × (1 + i)", "B": "VF = VA × (1 + i)^n", "C": "VF = VA + (i × n)", "D": "VF = VA / (1 + i)^n"}', 'B', 'La formule de la valeur future avec intérêt composé est VF = VA × (1 + i)^n, où VA est la valeur actuelle, i le taux d''intérêt et n le nombre de périodes.', 2, 'fonds_mutuels', 'fonds_rentes-Ch1', 'Chapitre 1 - Calculs financiers'),

('Qu''est-ce qu''un fonds équilibré?', 'MCQ', '{"A": "Un fonds qui investit uniquement en obligations", "B": "Un fonds qui investit uniquement en actions", "C": "Un fonds qui combine actions et obligations", "D": "Un fonds qui investit uniquement dans l''immobilier"}', 'C', 'Un fonds équilibré combine des investissements en actions et en obligations pour offrir un équilibre entre croissance et stabilité.', 1, 'fonds_mutuels', 'fonds_rentes-Ch3', 'Chapitre 3 - Types de fonds'),

('Quelle est la différence principale entre un REER et un CELI?', 'MCQ', '{"A": "Le REER n''a pas de limite de cotisation", "B": "Les cotisations au REER sont déductibles d''impôt, pas celles au CELI", "C": "Le CELI a des pénalités de retrait", "D": "Il n''y a aucune différence"}', 'B', 'Les cotisations au REER sont déductibles d''impôt alors que celles au CELI ne le sont pas, mais les retraits du CELI sont libres d''impôt.', 2, 'fonds_mutuels', 'fic-2024-Ch4', 'Chapitre 4 - Régimes enregistrés'),

('Qu''est-ce que le ratio de frais de gestion (RFG)?', 'MCQ', '{"A": "Le rendement annuel du fonds", "B": "Le pourcentage des frais annuels par rapport à l''actif du fonds", "C": "Le nombre d''unités dans le fonds", "D": "La valeur liquidative du fonds"}', 'B', 'Le ratio de frais de gestion représente le pourcentage des frais annuels par rapport à l''actif total du fonds.', 3, 'fonds_mutuels', 'fonds_rentes-Ch5', 'Chapitre 5 - Frais et rendements'),

('Dans quel délai peut-on exercer le droit de résolution pour un fonds mutuel?', 'MCQ', '{"A": "24 heures", "B": "48 heures", "C": "7 jours", "D": "30 jours"}', 'B', 'Le droit de résolution pour un fonds mutuel peut être exercé dans les 48 heures suivant la réception de l''avis de confirmation.', 2, 'fonds_mutuels', 'fic-2024-Ch2', 'Chapitre 2 - Droits des investisseurs'),

-- Questions avancées pour les deux domaines
('Un client souhaite investir 10 000$ avec un rendement de 6% composé annuellement. Quelle sera la valeur après 5 ans?', 'MCQ', '{"A": "13 000$", "B": "13 382$", "C": "13 500$", "D": "14 000$"}', 'B', 'Calcul: 10 000 × (1,06)^5 = 13 382,26$', 4, 'fonds_mutuels', 'fonds_rentes-Ch1', 'Chapitre 1 - Calculs financiers'),

('Quelle est la conséquence principale du non-respect des obligations de "Know Your Client" (KYC)?', 'MCQ', '{"A": "Une amende de 100$", "B": "Une suspension temporaire", "C": "Des sanctions disciplinaires pouvant aller jusqu''à la révocation du certificat", "D": "Un simple avertissement"}', 'C', 'Le non-respect des obligations KYC peut entraîner des sanctions disciplinaires sévères, incluant la révocation du certificat de représentant.', 4, 'pqap', 'F111-Ch1', 'Chapitre 1 - Obligations fondamentales'),

-- Questions transversales (pour LES_DEUX)
('Lors de la vente d''une assurance vie avec fonds distincts, quelles réglementations s''appliquent?', 'MCQ', '{"A": "Seulement celles de l''assurance", "B": "Seulement celles des valeurs mobilières", "C": "Les deux réglementations s''appliquent", "D": "Aucune réglementation spécifique"}', 'C', 'Les produits d''assurance vie avec fonds distincts sont soumis aux deux réglementations : assurance et valeurs mobilières.', 4, 'pqap', 'F311-Ch6', 'Chapitre 6 - Produits hybrides'),

('Quelle est la principale différence entre une rente viagère et une rente certaine?', 'MCQ', '{"A": "Le montant des paiements", "B": "La durée des paiements", "C": "Le taux d''intérêt", "D": "Les frais de gestion"}', 'B', 'Une rente viagère verse des paiements jusqu''au décès du rentier, tandis qu''une rente certaine verse des paiements pour une période déterminée.', 3, 'fonds_mutuels', 'fonds_rentes-Ch7', 'Chapitre 7 - Types de rentes');

-- Configuration des examens
INSERT INTO exams (exam_name, description, required_permission, num_questions_to_draw, time_limit_minutes, passing_score_percentage, xp_base_reward) VALUES
('Examen PQAP - Assurance de Personnes', 'Examen simulé pour le certificat PQAP de l''AMF', 'pqap', 35, 90, 70.00, 200),
('Examen Fonds Mutuels', 'Examen simulé pour le certificat Fonds Communs de Placement', 'fonds_mutuels', 100, 180, 70.00, 300),
('Examen Complet - Les Deux Permis', 'Examen combiné PQAP et Fonds Mutuels', 'fonds_mutuels', 75, 150, 70.00, 400);

-- Contenu podcast d'exemple
INSERT INTO podcast_content (title, description, audio_url, duration_seconds, theme, required_permission, xp_awarded, source_document_ref) VALUES
('Introduction à la Déontologie en Assurance', 'Comprendre les principes fondamentaux de la déontologie pour les représentants en assurance de personnes', 'https://example.com/podcast1.mp3', 1800, 'Déontologie', 'pqap', 50, 'F111-Ch1'),
('Les Obligations du Représentant', 'Détail des obligations légales et réglementaires du représentant certifié', 'https://example.com/podcast2.mp3', 2100, 'Obligations', 'pqap', 60, 'F111-Ch2'),
('Types d''Assurance Vie', 'Exploration des différents types d''assurance vie disponibles au Québec', 'https://example.com/podcast3.mp3', 1950, 'Produits', 'pqap', 55, 'F311-Ch2'),
('Calculs Financiers de Base', 'Maîtriser les calculs essentiels pour les placements et l''assurance', 'https://example.com/podcast4.mp3', 2400, 'Calculs', 'fonds_mutuels', 70, 'fonds_rentes-Ch1'),
('Introduction aux Fonds Mutuels', 'Comprendre le fonctionnement et les avantages des fonds communs de placement', 'https://example.com/podcast5.mp3', 2200, 'Fonds', 'fonds_mutuels', 65, 'fonds_rentes-Ch3'),
('Régimes Enregistrés d''Épargne', 'REER, CELI, REEE : comprendre les différences et optimiser les stratégies', 'https://example.com/podcast6.mp3', 2700, 'Régimes', 'fonds_mutuels', 75, 'fic-2024-Ch4');

-- Mini-jeux éducatifs
INSERT INTO minigames (game_name, description, game_type, base_xp_gain, max_daily_xp, required_permission, game_config_json, source_document_ref) VALUES
('Dilemme Déontologique', 'Résolvez des situations éthiques complexes en choisissant la meilleure action selon le code de déontologie', 'scenario', 30, 150, 'pqap', '{"scenarios_count": 10, "time_limit_seconds": 45, "difficulty_levels": [1,2,3]}', 'F111-Ch2'),
('Flash Cards Assurance Vie', 'Mémorisez les termes et définitions clés de l''assurance vie', 'flash_cards', 25, 125, 'pqap', '{"cards_per_session": 20, "review_mode": true, "categories": ["definitions", "formulas", "regulations"]}', 'F311-Ch1'),
('Vrai/Faux Réglementaire', 'Testez vos connaissances sur la réglementation avec des affirmations vraies ou fausses', 'true_false', 20, 100, 'pqap', '{"questions_per_round": 15, "time_per_question": 30, "immediate_feedback": true}', 'F111-Ch4'),
('Calculatrice Financière', 'Résolvez des problèmes de calculs financiers avec différents niveaux de difficulté', 'calculation', 35, 175, 'fonds_mutuels', '{"problem_types": ["compound_interest", "present_value", "annuities"], "difficulty_range": [1,5]}', 'fonds_rentes-Ch1'),
('Memory des Fonds', 'Jeu de mémoire pour associer les types de fonds à leurs caractéristiques', 'memory', 25, 125, 'fonds_mutuels', '{"pairs_count": 12, "time_limit": 180, "themes": ["fund_types", "risk_levels", "objectives"]}', 'fonds_rentes-Ch3'),
('Quiz Express Régimes', 'Questions rapides sur les régimes enregistrés d''épargne et de retraite', 'quick_quiz', 30, 150, 'fonds_mutuels', '{"questions_per_session": 10, "time_per_question": 20, "topics": ["RRSP", "TFSA", "RESP"]}', 'fic-2024-Ch4');

-- Ajout de plus de questions pour avoir un pool suffisant
INSERT INTO questions (question_text, question_type, options_json, correct_answer_key, explanation, difficulty_level, required_permission, source_document_ref, chapter_reference) VALUES
-- Questions supplémentaires PQAP
('Quelle est la durée maximale d''une police d''assurance vie temporaire renouvelable?', 'MCQ', '{"A": "10 ans", "B": "20 ans", "C": "Jusqu''à 65 ans", "D": "Jusqu''à 100 ans"}', 'D', 'Une police d''assurance vie temporaire renouvelable peut généralement être renouvelée jusqu''à l''âge de 100 ans.', 2, 'pqap', 'F311-Ch2', 'Chapitre 2 - Assurance temporaire'),
('Qu''est-ce que la "valeur de rachat garantie"?', 'MCQ', '{"A": "Le montant minimum que l''assureur doit payer en cas de rachat", "B": "La prime annuelle", "C": "Le capital décès", "D": "Les dividendes accumulés"}', 'A', 'La valeur de rachat garantie est le montant minimum que l''assureur s''engage à verser si le preneur décide de racheter sa police.', 3, 'pqap', 'F311-Ch5', 'Chapitre 5 - Valeurs de rachat'),
('Un représentant doit-il obtenir un mandat écrit pour représenter un client?', 'TrueFalse', '{"true": "Vrai", "false": "Faux"}', 'true', 'Un mandat écrit est requis pour établir clairement la relation représentant-client et les services à fournir.', 2, 'pqap', 'F111-Ch3', 'Chapitre 3 - Mandats'),

-- Questions supplémentaires Fonds Mutuels
('Qu''est-ce que la "valeur liquidative" d''un fonds mutuel?', 'MCQ', '{"A": "Le prix d''achat des parts", "B": "La valeur des actifs du fonds divisée par le nombre de parts", "C": "Les frais de gestion", "D": "Le rendement annuel"}', 'B', 'La valeur liquidative est calculée en divisant la valeur totale des actifs du fonds par le nombre de parts en circulation.', 1, 'fonds_mutuels', 'fonds_rentes-Ch2', 'Chapitre 2 - Évaluation des fonds'),
('Quelle est la limite de cotisation REER pour 2024?', 'MCQ', '{"A": "27 230$", "B": "29 210$", "C": "30 780$", "D": "31 560$"}', 'C', 'La limite de cotisation REER pour 2024 est de 30 780$ ou 18% du revenu gagné de l''année précédente, selon le moindre des deux.', 2, 'fonds_mutuels', 'fic-2024-Ch4', 'Chapitre 4 - Limites REER 2024'),
('Qu''est-ce qu''un fonds indiciel?', 'MCQ', '{"A": "Un fonds qui suit la performance d''un indice de référence", "B": "Un fonds qui investit uniquement en obligations", "C": "Un fonds à capital fixe", "D": "Un fonds fermé"}', 'A', 'Un fonds indiciel vise à reproduire la performance d''un indice de référence comme le S&P/TSX.', 2, 'fonds_mutuels', 'fonds_rentes-Ch3', 'Chapitre 3 - Stratégies de gestion');