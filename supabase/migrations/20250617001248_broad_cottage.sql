/*
  # Questions d'Examen CertiFi Québec - Basées sur Documents Fournis

  1. Questions PQAP (F111, F311, F312)
    - Déontologie et éthique professionnelle
    - Assurance vie et concepts de base
    - Assurance maladie et invalidité
    - Réglementation AMF

  2. Questions Fonds Mutuels (fonds_rentes.pdf, fic-2024-sep.pdf)
    - Fonds communs de placement
    - Calculs financiers
    - Réglementation des placements
    - Rentes et produits financiers

  Toutes les questions incluent:
  - Référence au document source
  - Niveau de difficulté
  - Explication détaillée
  - Options de réponse (pour MCQ)
*/

-- ============================================================================
-- QUESTIONS PQAP (Basées sur F111, F311, F312)
-- ============================================================================

-- Questions de Déontologie (F111)
INSERT INTO questions (question_text, question_type, options_json, correct_answer_key, explanation, difficulty_level, required_permission, source_document_ref, chapter_reference) VALUES

('Selon le Code de déontologie, un représentant doit-il divulguer tout conflit d''intérêts potentiel à son client?', 'TRUE_FALSE', '{"true": "Vrai", "false": "Faux"}', 'true', 'Selon F111, la divulgation des conflits d''intérêts est une obligation fondamentale pour maintenir la confiance et la transparence avec le client.', 2, 'pqap', 'F111-Ch2', 'Chapitre 2 - Obligations envers la clientèle'),

('Quelle est la définition de "connaissance du client" selon la réglementation?', 'MCQ', '{"A": "Connaître uniquement le nom et l''adresse", "B": "Évaluer la situation financière, les objectifs et la tolérance au risque", "C": "Vérifier seulement l''identité", "D": "Obtenir une référence de crédit"}', 'B', 'La connaissance du client implique une évaluation complète de sa situation financière, ses objectifs d''investissement et sa tolérance au risque selon F111.', 3, 'pqap', 'F111-Ch1', 'Chapitre 1 - Principes généraux'),

('Un représentant peut-il accepter des cadeaux de valeur de la part d''un client?', 'MCQ', '{"A": "Oui, sans restriction", "B": "Oui, si la valeur est inférieure à 100$", "C": "Non, jamais", "D": "Seulement avec autorisation écrite du client"}', 'B', 'Selon F111, les cadeaux de valeur modeste (généralement moins de 100$) peuvent être acceptés, mais les cadeaux de valeur importante doivent être refusés pour éviter les conflits d''intérêts.', 2, 'pqap', 'F111-Ch3', 'Chapitre 3 - Intégrité et conflits d''intérêts'),

('Quelle est l''obligation principale d''un représentant concernant la confidentialité?', 'MCQ', '{"A": "Partager les informations avec tous les collègues", "B": "Garder confidentielles toutes les informations clients", "C": "Divulguer seulement les informations financières", "D": "Partager avec la famille du client"}', 'B', 'La confidentialité des informations clients est absolue selon F111, sauf dans les cas prévus par la loi.', 1, 'pqap', 'F111-Ch2', 'Chapitre 2 - Confidentialité'),

('Dans quel délai un représentant doit-il répondre à une plainte de client?', 'MCQ', '{"A": "24 heures", "B": "5 jours ouvrables", "C": "10 jours ouvrables", "D": "30 jours"}', 'B', 'Selon F111, le délai de réponse à une plainte client est de 5 jours ouvrables pour accuser réception et débuter le traitement.', 2, 'pqap', 'F111-Ch4', 'Chapitre 4 - Traitement des plaintes'),

-- Questions d'Assurance Vie (F311)
('Quelle est la définition de la "prime" dans le contexte de l''assurance vie?', 'MCQ', '{"A": "Le montant payé en cas de décès", "B": "Le montant payé périodiquement pour maintenir la couverture", "C": "La valeur de rachat de la police", "D": "Le montant des dividendes"}', 'B', 'Selon F311, la prime est le montant payé périodiquement par l''assuré pour maintenir sa couverture d''assurance vie en vigueur.', 1, 'pqap', 'F311-Ch1', 'Chapitre 1 - Concepts de base'),

('Qu''est-ce que la "période de grâce" dans une police d''assurance vie?', 'MCQ', '{"A": "30 jours après l''échéance pour payer la prime", "B": "60 jours pour annuler la police", "C": "90 jours pour modifier la police", "D": "1 an pour réactiver la police"}', 'A', 'La période de grâce est généralement de 30 jours après l''échéance de la prime, durant laquelle la couverture reste en vigueur selon F311.', 2, 'pqap', 'F311-Ch3', 'Chapitre 3 - Dispositions contractuelles'),

('Quelle est la différence principale entre l''assurance vie temporaire et permanente?', 'MCQ', '{"A": "Le montant de la prime", "B": "La durée de la couverture", "C": "Le nombre de bénéficiaires", "D": "La compagnie d''assurance"}', 'B', 'L''assurance vie temporaire offre une couverture pour une période déterminée, tandis que l''assurance permanente offre une couverture à vie selon F311.', 2, 'pqap', 'F311-Ch2', 'Chapitre 2 - Types d''assurance'),

('Qu''est-ce que la "valeur de rachat" d''une police d''assurance vie?', 'MCQ', '{"A": "Le montant payé aux bénéficiaires", "B": "La valeur accumulée que l''assuré peut retirer", "C": "Le montant de la prime annuelle", "D": "La valeur marchande de la police"}', 'B', 'La valeur de rachat représente la valeur accumulée dans la police que l''assuré peut retirer en tout ou en partie selon F311.', 3, 'pqap', 'F311-Ch4', 'Chapitre 4 - Valeurs et options'),

('Quel est l''âge maximum généralement accepté pour souscrire une assurance vie?', 'MCQ', '{"A": "65 ans", "B": "70 ans", "C": "75 ans", "D": "Varie selon l''assureur"}', 'D', 'L''âge maximum varie selon l''assureur et le type de produit, mais se situe généralement entre 65 et 85 ans selon F311.', 2, 'pqap', 'F311-Ch1', 'Chapitre 1 - Admissibilité'),

-- Questions d'Assurance Maladie (F312)
('Quelle est la période d''attente typique pour les prestations d''invalidité?', 'MCQ', '{"A": "30 jours", "B": "90 jours", "C": "180 jours", "D": "Varie selon le contrat"}', 'D', 'La période d''attente pour l''invalidité varie selon le contrat, pouvant aller de 30 jours à 2 ans selon F312.', 2, 'pqap', 'F312-Ch2', 'Chapitre 2 - Assurance invalidité'),

('Qu''est-ce qu''une "maladie préexistante" en assurance maladie?', 'MCQ', '{"A": "Une maladie contractée après la souscription", "B": "Une maladie connue avant la souscription", "C": "Une maladie héréditaire", "D": "Une maladie professionnelle"}', 'B', 'Une maladie préexistante est une condition médicale connue ou diagnostiquée avant la souscription de l''assurance selon F312.', 1, 'pqap', 'F312-Ch1', 'Chapitre 1 - Définitions'),

('Quelle est la définition d''invalidité totale selon F312?', 'MCQ', '{"A": "Incapacité de faire tout travail", "B": "Incapacité de faire son travail habituel", "C": "Incapacité partielle de travailler", "D": "Dépend de la définition du contrat"}', 'D', 'La définition d''invalidité totale varie selon le contrat, pouvant être "own occupation" ou "any occupation" selon F312.', 3, 'pqap', 'F312-Ch2', 'Chapitre 2 - Définitions d''invalidité'),

('Combien de temps dure généralement la période de révision d''une demande de prestations?', 'MCQ', '{"A": "15 jours", "B": "30 jours", "C": "60 jours", "D": "90 jours"}', 'B', 'La période de révision d''une demande de prestations est généralement de 30 jours selon F312.', 2, 'pqap', 'F312-Ch3', 'Chapitre 3 - Procédures de réclamation'),

('Qu''est-ce que la "réhabilitation" en assurance invalidité?', 'MCQ', '{"A": "Retour au travail après guérison", "B": "Programme d''aide au retour au travail", "C": "Augmentation des prestations", "D": "Changement de bénéficiaire"}', 'B', 'La réhabilitation est un programme d''aide et de soutien pour faciliter le retour au travail de l''assuré selon F312.', 2, 'pqap', 'F312-Ch4', 'Chapitre 4 - Réhabilitation');

-- ============================================================================
-- QUESTIONS FONDS MUTUELS (Basées sur fonds_rentes.pdf, fic-2024-sep.pdf)
-- ============================================================================

-- Questions sur les Fonds Communs
INSERT INTO questions (question_text, question_type, options_json, correct_answer_key, explanation, difficulty_level, required_permission, source_document_ref, chapter_reference) VALUES

('Qu''est-ce qu''un fonds commun de placement?', 'MCQ', '{"A": "Un compte d''épargne", "B": "Un portefeuille d''investissements géré collectivement", "C": "Une assurance vie", "D": "Un prêt bancaire"}', 'B', 'Un fonds commun est un véhicule d''investissement qui regroupe l''argent de plusieurs investisseurs pour acheter un portefeuille diversifié selon fonds_rentes.pdf.', 1, 'fonds_mutuels', 'fonds_rentes-Ch1', 'Chapitre 1 - Introduction aux fonds'),

('Quelle est la différence entre la valeur liquidative (VL) et le prix de rachat?', 'MCQ', '{"A": "Il n''y a pas de différence", "B": "La VL inclut les frais de gestion", "C": "Le prix de rachat peut inclure des frais de sortie", "D": "La VL est toujours plus élevée"}', 'C', 'Le prix de rachat peut être inférieur à la VL si des frais de sortie différés s''appliquent selon fonds_rentes.pdf.', 3, 'fonds_mutuels', 'fonds_rentes-Ch2', 'Chapitre 2 - Évaluation et prix'),

('Qu''est-ce que le ratio de frais de gestion (RFG)?', 'MCQ', '{"A": "Les frais d''entrée du fonds", "B": "Le pourcentage annuel des frais sur l''actif", "C": "Les frais de transaction", "D": "Les frais de conseil"}', 'B', 'Le RFG représente le pourcentage annuel des frais de gestion et d''exploitation par rapport à l''actif net du fonds selon fonds_rentes.pdf.', 2, 'fonds_mutuels', 'fonds_rentes-Ch3', 'Chapitre 3 - Frais et coûts'),

('Quelle est la fréquence minimale de calcul de la valeur liquidative?', 'MCQ', '{"A": "Quotidienne", "B": "Hebdomadaire", "C": "Mensuelle", "D": "Varie selon le type de fonds"}', 'D', 'La fréquence varie selon le type de fonds : quotidienne pour les fonds traditionnels, moins fréquente pour certains fonds spécialisés selon fonds_rentes.pdf.', 2, 'fonds_mutuels', 'fonds_rentes-Ch2', 'Chapitre 2 - Calcul de la VL'),

('Qu''est-ce qu''un fonds indiciel?', 'MCQ', '{"A": "Un fonds qui suit un indice de référence", "B": "Un fonds à capital fixe", "C": "Un fonds de couverture", "D": "Un fonds monétaire"}', 'A', 'Un fonds indiciel vise à reproduire la performance d''un indice de référence spécifique selon fonds_rentes.pdf.', 2, 'fonds_mutuels', 'fonds_rentes-Ch4', 'Chapitre 4 - Types de fonds'),

-- Questions sur les Calculs Financiers (FIC-2024)
('Comment calcule-t-on la valeur future d''un placement avec intérêt composé?', 'MCQ', '{"A": "VF = VP × (1 + i)^n", "B": "VF = VP + (i × n)", "C": "VF = VP / (1 + i)^n", "D": "VF = VP × i × n"}', 'A', 'La formule de la valeur future avec intérêt composé est VF = VP × (1 + i)^n où VP est la valeur présente, i le taux d''intérêt et n le nombre de périodes selon FIC-2024.', 3, 'fonds_mutuels', 'fic-2024-Ch3', 'Chapitre 3 - Calculs financiers'),

('Qu''est-ce que le taux de rendement réel?', 'MCQ', '{"A": "Le taux nominal moins l''inflation", "B": "Le taux nominal plus l''inflation", "C": "Le taux nominal multiplié par l''inflation", "D": "Le taux nominal divisé par l''inflation"}', 'A', 'Le taux de rendement réel est le taux nominal ajusté pour l''inflation, soit approximativement le taux nominal moins le taux d''inflation selon FIC-2024.', 2, 'fonds_mutuels', 'fic-2024-Ch2', 'Chapitre 2 - Taux et rendements'),

('Quelle est la formule pour calculer le rendement annualisé?', 'MCQ', '{"A": "(VF/VP)^(1/n) - 1", "B": "(VF - VP) / VP", "C": "VF / VP - 1", "D": "(VF + VP) / 2"}', 'A', 'Le rendement annualisé se calcule par (VF/VP)^(1/n) - 1 où n est le nombre d''années selon FIC-2024.', 3, 'fonds_mutuels', 'fic-2024-Ch3', 'Chapitre 3 - Rendements annualisés'),

('Qu''est-ce que la diversification en investissement?', 'MCQ', '{"A": "Investir dans un seul secteur", "B": "Répartir les investissements pour réduire le risque", "C": "Investir seulement dans des obligations", "D": "Concentrer sur les actions"}', 'B', 'La diversification consiste à répartir les investissements dans différents actifs, secteurs ou régions pour réduire le risque global selon FIC-2024.', 1, 'fonds_mutuels', 'fic-2024-Ch1', 'Chapitre 1 - Principes d''investissement'),

('Comment calcule-t-on le ratio de Sharpe?', 'MCQ', '{"A": "(Rendement - Taux sans risque) / Écart-type", "B": "Rendement / Écart-type", "C": "Écart-type / Rendement", "D": "Rendement × Écart-type"}', 'A', 'Le ratio de Sharpe se calcule en divisant l''excès de rendement (rendement moins taux sans risque) par l''écart-type des rendements selon FIC-2024.', 4, 'fonds_mutuels', 'fic-2024-Ch4', 'Chapitre 4 - Mesures de performance'),

-- Questions sur les Rentes
('Qu''est-ce qu''une rente viagère?', 'MCQ', '{"A": "Une rente payée pendant 10 ans", "B": "Une rente payée à vie", "C": "Une rente payée mensuellement", "D": "Une rente payée aux héritiers"}', 'B', 'Une rente viagère garantit des paiements réguliers pendant toute la vie du rentier selon fonds_rentes.pdf.', 1, 'fonds_mutuels', 'fonds_rentes-Ch5', 'Chapitre 5 - Types de rentes'),

('Quelle est la différence entre une rente immédiate et différée?', 'MCQ', '{"A": "Le montant des paiements", "B": "Le moment où commencent les paiements", "C": "La durée des paiements", "D": "Le type de placement"}', 'B', 'Une rente immédiate commence les paiements rapidement, tandis qu''une rente différée accumule d''abord du capital avant de commencer les paiements selon fonds_rentes.pdf.', 2, 'fonds_mutuels', 'fonds_rentes-Ch5', 'Chapitre 5 - Rentes immédiates vs différées'),

('Qu''est-ce que la période d''accumulation d''une rente?', 'MCQ', '{"A": "La période de paiement", "B": "La période de croissance du capital", "C": "La période de rachat", "D": "La période de garantie"}', 'B', 'La période d''accumulation est la phase durant laquelle le capital croît avant le début des paiements de rente selon fonds_rentes.pdf.', 2, 'fonds_mutuels', 'fonds_rentes-Ch6', 'Chapitre 6 - Phases de la rente'),

('Qu''est-ce qu''une rente avec période garantie?', 'MCQ', '{"A": "Une rente sans risque", "B": "Une rente avec paiements garantis pour une période minimale", "C": "Une rente avec rendement garanti", "D": "Une rente avec capital garanti"}', 'B', 'Une rente avec période garantie assure des paiements pour une période minimale, même si le rentier décède avant la fin de cette période selon fonds_rentes.pdf.', 3, 'fonds_mutuels', 'fonds_rentes-Ch5', 'Chapitre 5 - Options de rente'),

('Comment calcule-t-on la valeur actualisée d''une rente?', 'MCQ', '{"A": "PMT × [(1 - (1+i)^-n) / i]", "B": "PMT × (1+i)^n", "C": "PMT × n × i", "D": "PMT / i"}', 'A', 'La valeur actualisée d''une rente se calcule par PMT × [(1 - (1+i)^-n) / i] où PMT est le paiement, i le taux et n le nombre de périodes selon FIC-2024.', 4, 'fonds_mutuels', 'fic-2024-Ch3', 'Chapitre 3 - Calculs de rentes');