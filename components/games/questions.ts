export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export const questions: Question[] = [
  // Questions 1 à 75 ici, explicites. Pour simplifier, je vais insérer quelques-unes puis tu pourras me demander le complément.
  {
    id: 1,
    question: "(VIE) Abdoul a contracté une assurance crédit pour un prêt hypothécaire. Il décède avec un solde impayé de 138 000 $. Que paiera l'assureur?",
    options: [
      "Le montant total du prêt initial (150 000 $)",
      "Seulement le solde du prêt au moment du décès",
      "Rien, car ce n'est pas une assurance vie classique",
      "La valeur marchande de la maison"
    ],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "(DÉONTO) Quel est le principal effet de désigner un bénéficiaire irrévocable?",
    options: [
      "On peut changer d’assureur sans préavis",
      "Le titulaire ne peut plus changer le bénéficiaire sans son consentement",
      "Les primes deviennent fixes",
      "La police est transférée automatiquement au décès"
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "(FONDS) Un client veut une rente à vie garantie 20 ans. Il décède après 4 ans. Que se passe-t-il?",
    options: [
      "Les paiements cessent immédiatement",
      "Le solde du capital est remboursé",
      "Les paiements continuent aux bénéficiaires pour 16 ans",
      "Le contrat est annulé"
    ],
    correctAnswer: 2
  },
    {
    id: 4,
    question: "(ACC/MAL) Quelle est une limitation fréquente dans une police d'assurance invalidité individuelle?",
    options: [
      "Couverture illimitée des soins",
      "Invalidité partielle exclue",
      "Durée maximale de prestation",
      "Remboursement intégral des primes"
    ],
    correctAnswer: 2
  },
  {
    id: 5,
    question: "(VIE) Quel est l’avantage de désigner sa fille comme bénéficiaire subsidiaire?",
    options: [
      "Elle paiera les impôts à la place de la succession",
      "Elle recevra la prestation si la bénéficiaire principale est décédée",
      "Elle pourra renégocier la police",
      "Elle devient automatiquement titulaire de la police"
    ],
    correctAnswer: 1
  },
  {
    id: 6,
    question: "(FONDS) En cas de faillite du titulaire, qu'est-ce qui protège un fonds distinct au bénéfice d'un enfant?",
    options: [
      "Rien, le fonds est saisi",
      "La désignation d’un bénéficiaire irrévocable dans la catégorie protégée",
      "Le transfert du fonds à une banque",
      "Un avenant de protection judiciaire"
    ],
    correctAnswer: 1
  },
  {
    id: 7,
    question: "(DÉONTO) Quelle est la conséquence d'une aggravation du risque non déclarée?",
    options: [
      "Réduction des primes",
      "Annulation possible du contrat",
      "Doublement des prestations",
      "Passage automatique en invalidité partielle"
    ],
    correctAnswer: 1
  },
  {
    id: 8,
    question: "(VIE - difficile) Une cliente désigne son ex-conjoint comme bénéficiaire irrévocable il y a 15 ans. Aujourd'hui remariée, elle décède. Que se passe-t-il?",
    options: [
      "Le nouveau conjoint reçoit la prestation",
      "Les enfants reçoivent la prestation",
      "L'ex-conjoint reste bénéficiaire sauf révocation valide",
      "La prestation va à la succession"
    ],
    correctAnswer: 2
  },
  {
    id: 9,
    question: "(DÉONTO - moyenne) Un client refuse de divulguer une information de santé pertinente. Que doit faire le conseiller?",
    options: [
      "Ignorer et compléter la proposition",
      "Refuser de soumettre la demande",
      "Soumettre quand même avec réserve",
      "Remplacer la personne assurée"
    ],
    correctAnswer: 1
  },
  {
    id: 10,
    question: "(VIE - difficile) Quelle est la conséquence de mentir sur l’usage du tabac lors de la souscription?",
    options: [
      "Aucune, si les primes sont payées",
      "La prime est ajustée rétroactivement",
      "La réclamation pourrait être refusée",
      "La prestation est doublée"
    ],
    correctAnswer: 2
  },
  {
    id: 11,
    question: "(FONDS - difficile) Quel est un risque propre aux fonds distincts?",
    options: [
      "Risque de change constant",
      "Frais de gestion nuls",
      "Performance non garantie malgré les protections",
      "Risque juridique total"
    ],
    correctAnswer: 2
  },
  {
    id: 12,
    question: "(ACC/MAL - difficile) Quel critère est essentiel pour établir l'admissibilité à une assurance invalidité?",
    options: [
      "Niveau de revenu brut seulement",
      "Âge et revenu",
      "Revenu, âge et profession",
      "Lieu de résidence uniquement"
    ],
    correctAnswer: 2
  },
  {
    id: 13,
    question: "(VIE - facile) Quel type de police offre une couverture permanente avec valeur de rachat?",
    options: [
      "Assurance vie temporaire",
      "Assurance collective",
      "Assurance vie entière",
      "Assurance crédit"
    ],
    correctAnswer: 2
  },
  {
    id: 14,
    question: "(DÉONTO - moyenne) Que doit faire un représentant qui découvre qu’un client ment pour obtenir une police?",
    options: [
      "Soumettre la demande et se taire",
      "Annuler rétroactivement une couverture",
      "Documenter la situation et refuser la demande",
      "Contacter un autre conseiller"
    ],
    correctAnswer: 2
  },
  {
    id: 15,
    question: "(FONDS - moyenne) Quelle est une caractéristique d’un fonds indiciel offert par un assureur?",
    options: [
      "Garantie de rendement élevé",
      "Suivi passif d’un indice de référence",
      "Protection illimitée en cas de faillite",
      "Exemption automatique d’impôt"
    ],
    correctAnswer: 1
  },
  {
    id: 16,
    question: "(ACC/MAL - facile) Qu’est-ce qui distingue une assurance maladie grave d’une assurance invalidité?",
    options: [
      "La durée de la prestation",
      "Le montant est forfaitaire dès le diagnostic admissible",
      "Elle couvre aussi l'hospitalisation",
      "Elle exige une évaluation médicale annuelle"
    ],
    correctAnswer: 1
  },
  {
    id: 17,
    question: "(VIE - moyenne) Qu'est-ce qu'une clause d’incontestabilité dans une police vie?",
    options: [
      "Une clause qui empêche les hausses de primes",
      "Une clause qui garantit les placements",
      "Une clause empêchant l'assureur de nier la validité après un délai",
      "Une clause qui interdit les rachats partiels"
    ],
    correctAnswer: 2
  },
  {
    id: 18,
    question: "(FONDS - difficile) Quel est l’effet fiscal du décès sur un contrat de fonds distincts?",
    options: [
      "Aucun, tout est non imposable",
      "Imposition automatique de la valeur de marché",
      "Possibilité de transfert non imposable au conjoint",
      "Récupération par l'assureur sans obligation fiscale"
    ],
    correctAnswer: 2
  },
  {
    id: 19,
    question: "(ACC/MAL - moyenne) Un client veut une couverture invalidité. Il est travailleur autonome. Quelle considération est essentielle?",
    options: [
      "Le nombre de personnes dans son ménage",
      "La stabilité de ses revenus déclarés",
      "Son lieu d’affaires",
      "Le montant de sa dette hypothécaire"
    ],
    correctAnswer: 1
  },
  {
    id: 20,
    question: "(DÉONTO - difficile) Quel devoir prévaut en cas de conflit d’intérêts potentiel?",
    options: [
      "Le devoir de loyauté envers l’assureur",
      "Le devoir de confidentialité envers le client",
      "Le devoir d’informer le client du conflit et d’agir dans son intérêt",
      "Le devoir de performance commerciale"
    ],
    correctAnswer: 2
  },
  {
    id: 21,
    question: "(FONDS - moyenne) Quelle garantie distingue un contrat de fonds distincts d’un fonds commun?",
    options: [
      "Garantie de rendement de 5 %",
      "Garantie au décès et à l’échéance",
      "Garantie d'immunité fiscale",
      "Garantie d’accès prioritaire au capital"
    ],
    correctAnswer: 1
  },
  {
    id: 22,
    question: "(VIE - moyenne) Quel type de police vie est généralement utilisée pour couvrir un prêt hypothécaire?",
    options: [
      "Vie entière",
      "Vie universelle",
      "Temporaire décroissante",
      "Rente différée"
    ],
    correctAnswer: 2
  },
  {
    id: 23,
    question: "(ACC/MAL - difficile) Une prestation d’assurance maladie est imposable si :",
    options: [
      "La prime a été payée par le particulier",
      "La prestation est versée en une seule fois",
      "La prime a été déduite d’un revenu imposable",
      "Le bénéficiaire est mineur"
    ],
    correctAnswer: 2
  },
  {
    id: 24,
    question: "(DÉONTO - moyenne) Un représentant veut vendre un produit non autorisé par son cabinet. Que doit-il faire?",
    options: [
      "Le vendre discrètement",
      "Demander une autorisation officielle au cabinet",
      "Le vendre en son nom personnel",
      "Déléguer la vente à un tiers"
    ],
    correctAnswer: 1
  },
  {
    id: 25,
    question: "(FONDS - facile) Quelle caractéristique fiscale avantage les fonds distincts au décès?",
    options: [
      "Retenue automatique de 50 %",
      "Imposition selon les lois américaines",
      "Paiement direct au bénéficiaire, contournant la succession",
      "Transfert obligatoire au REER"
    ],
    correctAnswer: 2
  },
  {
    id: 26,
    question: "(VIE - difficile) Une police vie est cédée à une institution comme garantie. Que signifie cette hypothèque?",
    options: [
      "Le capital est versé à l’institution à l’échéance",
      "L’institution devient automatiquement titulaire",
      "Les droits du bénéficiaire sont limités par la dette",
      "Les primes deviennent optionnelles"
    ],
    correctAnswer: 2
  },
  {
    id: 27,
    question: "(ACC/MAL - moyenne) Quelle est une exclusion typique en assurance accident?",
    options: [
      "Blessure sportive",
      "Accident de travail couvert par la CNESST",
      "Accident routier",
      "Accident domestique"
    ],
    correctAnswer: 1
  },
  {
    id: 28,
    question: "(DÉONTO - difficile) Quel document confirme l’intérêt d’assurance lors de la souscription?",
    options: [
      "La carte d’assurance maladie",
      "Le contrat de travail",
      "Le formulaire de proposition",
      "Une lettre du médecin"
    ],
    correctAnswer: 2
  },
  {
    id: 29,
    question: "(FONDS - difficile) En cas de marché baissier, quel est l’intérêt d’une réinitialisation des garanties dans un fonds distinct?",
    options: [
      "Diminuer la protection garantie",
      "Verrouiller une valeur plus élevée si le marché remonte",
      "Éviter toute perte",
      "Augmenter les frais de gestion"
    ],
    correctAnswer: 1
  },
  {
    id: 30,
    question: "(VIE - moyenne) Un bénéficiaire est désigné à titre irrévocable. Que doit faire le titulaire pour changer cette désignation?",
    options: [
      "Avertir l’assureur uniquement",
      "Changer de bénéficiaire sans préavis",
      "Obtenir le consentement du bénéficiaire actuel",
      "Modifier le contrat via son testament"
    ],
    correctAnswer: 2
  },
  {
    id: 31,
    question: "(ACC/MAL - facile) Que couvre l’assurance maladies graves typique?",
    options: [
      "Tout problème médical",
      "Un nombre limité de diagnostics admissibles",
      "Les soins médicaux quotidiens",
      "La médication préventive"
    ],
    correctAnswer: 1
  },
  {
    id: 32,
    question: "(DÉONTO - moyenne) En cas de plainte d’un client, que doit faire le représentant?",
    options: [
      "Ignorer si le client est en colère",
      "Répondre uniquement si l’assureur l’exige",
      "Traiter la plainte avec diligence et respect du processus prévu",
      "Refuser et se référer à un collègue"
    ],
    correctAnswer: 2
  },
  {
    id: 33,
    question: "(FONDS - facile) Quel est un avantage des fonds à date cible?",
    options: [
      "Rendement garanti",
      "Réduction automatique de risque à mesure que l’échéance approche",
      "Aucun frais de gestion",
      "Exemption d’impôt sur les retraits"
    ],
    correctAnswer: 1
  },
  {
    id: 34,
    question: "(VIE - difficile) Une police vie universelle permet :",
    options: [
      "De transférer les primes à un tiers",
      "D'investir dans des fonds à l’intérieur du contrat",
      "D'annuler la clause bénéficiaire",
      "D’éviter la souscription médicale initiale"
    ],
    correctAnswer: 1
  },
  {
    id: 35,
    question: "(ACC/MAL - moyenne) En assurance collective, qu’est-ce qu’un avenant?",
    options: [
      "Un nouveau contrat",
      "Une modification temporaire ou permanente au contrat",
      "Un rapport d’accident",
      "Un formulaire d’adhésion"
    ],
    correctAnswer: 1
  },
  {
    id: 36,
    question: "(DÉONTO - difficile) Quel principe s’applique au devoir d’agir avec compétence?",
    options: [
      "Connaître les règles fiscales seulement",
      "Maintenir à jour ses connaissances et bien documenter ses dossiers",
      "Travailler rapidement au détriment de la rigueur",
      "Référer tous les cas complexes à un autre conseiller"
    ],
    correctAnswer: 1
  },
  {
    id: 37,
    question: "(FONDS - moyenne) Quel type de fonds convient à un client prudent à court terme?",
    options: [
      "Fonds d’actions technologiques",
      "Fonds équilibré international",
      "Fonds du marché monétaire",
      "Fonds sectoriel santé"
    ],
    correctAnswer: 2
  },
  {
    id: 38,
    question: "(VIE - difficile) Quelle clause protège les bénéficiaires contre les créanciers du titulaire?",
    options: [
      "Clause de remboursement",
      "Clause irrévocable avec désignation privilégiée",
      "Clause de renonciation",
      "Clause d’arbitrage"
    ],
    correctAnswer: 1
  },
  {
    id: 39,
    question: "(ACC/MAL - facile) Un assuré se blesse gravement en voyage. Quelle couverture est typiquement requise?",
    options: [
      "Assurance soins dentaires",
      "Assurance invalidité longue durée",
      "Assurance voyage incluant soins d'urgence",
      "Assurance hospitalisation publique"
    ],
    correctAnswer: 2
  },
  {
    id: 40,
    question: "(DÉONTO - moyenne) Quand doit-on remettre un formulaire de remplacement de contrat à un client?",
    options: [
      "Uniquement à la fin de la vente",
      "En cas de vente par téléphone",
      "Lorsqu’un contrat existant est remplacé ou annulé",
      "Jamais, c’est optionnel"
    ],
    correctAnswer: 2
  },
  {
    id: 41,
    question: "(FONDS - difficile) Quel est l’objectif d’un fonds à gestion passive?",
    options: [
      "Surpasser le marché à tout prix",
      "Répliquer un indice de référence avec peu de frais",
      "Garantir un revenu fixe mensuel",
      "Minimiser les pertes fiscales en priorité"
    ],
    correctAnswer: 1
  },
  {
    id: 42,
    question: "(VIE - moyenne) Quelle affirmation est vraie concernant les polices vie entières avec participation?",
    options: [
      "Elles n'ont aucune valeur de rachat",
      "Elles offrent parfois des dividendes non garantis",
      "Elles sont toujours plus chères que les polices universelles",
      "Elles sont interdites dans les régimes collectifs"
    ],
    correctAnswer: 1
  },
  {
    id: 43,
    question: "(ACC/MAL - difficile) Que signifie la coordination des prestations?",
    options: [
      "Deux contrats s’annulent automatiquement",
      "L’assuré peut doubler sa couverture",
      "La réclamation est partagée entre assureurs pour éviter les remboursements excédentaires",
      "L’assuré est responsable de coordonner les assurances entre les pays"
    ],
    correctAnswer: 2
  },
  {
    id: 44,
    question: "(DÉONTO - facile) Quel est le rôle du formulaire de consentement à la collecte de renseignements?",
    options: [
      "Éviter toute divulgation fiscale",
      "Permettre de récolter et d’utiliser les données personnelles du client",
      "Garantir l’acceptation de la proposition",
      "Accélérer la souscription automatique"
    ],
    correctAnswer: 1
  },
  {
    id: 45,
    question: "(FONDS - facile) Quel est un inconvénient potentiel des fonds distincts?",
    options: [
      "Frais plus élevés que les fonds communs",
      "Non-disponibles pour les clients retraités",
      "Impossibilité de nommer un bénéficiaire",
      "Pas de diversification possible"
    ],
    correctAnswer: 0
  },
  {
    id: 46,
    question: "(VIE - difficile) Que permet une désignation de bénéficiaire subsidiaire?",
    options: [
      "Éviter les impôts à la succession",
      "Désigner une personne de remplacement si le bénéficiaire principal est décédé",
      "Protéger le capital contre l’inflation",
      "Réduire la prime d’assurance"
    ],
    correctAnswer: 1
  },
  {
    id: 47,
    question: "(ACC/MAL - moyenne) En assurance invalidité, qu’est-ce qu’une période d’attente?",
    options: [
      "Temps requis pour recevoir la carte d’assurance",
      "Durée avant le début des versements après un sinistre",
      "Délai avant l’émission du contrat",
      "Date limite de résiliation du contrat"
    ],
    correctAnswer: 1
  },
  {
    id: 48,
    question: "(DÉONTO - difficile) Un représentant reçoit une gratification d’un client. Que doit-il faire?",
    options: [
      "L’accepter discrètement",
      "La refuser ou la déclarer à son cabinet",
      "La transférer à l’assureur",
      "En faire bénéficier un autre client"
    ],
    correctAnswer: 1
  },
  {
    id: 49,
    question: "(FONDS - moyenne) Quelle option de frais permet de reporter les coûts à la sortie?",
    options: [
      "Frais frontaux",
      "Frais d’acquisition différés (DSC)",
      "Frais fixes annuels",
      "Frais majorés de gestion passive"
    ],
    correctAnswer: 1
  },
  {
    id: 50,
    question: "(VIE - facile) Une police temporaire 10 ans est renouvelée automatiquement. Qu'est-ce qui est vrai?",
    options: [
      "Le montant de la prime diminue",
      "La prime augmente à l’échéance selon un barème",
      "Le montant assuré est réduit",
      "La police devient vie entière"
    ],
    correctAnswer: 1
  },
  {
    id: 51,
    question: "(ACC/MAL - difficile) Quelle condition doit être remplie pour qu’une indemnité soit versée en cas d’invalidité totale?",
    options: [
      "L’assuré doit être âgé de moins de 60 ans",
      "L’invalidité doit empêcher l’exercice de toute profession raisonnable",
      "L’assuré doit avoir 2 enfants à charge",
      "L’assuré doit être hospitalisé"
    ],
    correctAnswer: 1
  },
  {
    id: 52,
    question: "(DÉONTO - moyenne) Un représentant quitte son cabinet. Que doit-il faire pour ses clients actuels?",
    options: [
      "Les transférer sans les informer",
      "Informer ses clients et le nouvel inscrit désigné pour le suivi",
      "Effacer tous les dossiers",
      "Recommencer toutes les propositions"
    ],
    correctAnswer: 1
  },
  {
    id: 53,
    question: "(FONDS - facile) Pourquoi certains fonds sont-ils qualifiés de « garantis »?",
    options: [
      "Ils offrent des rendements fixes",
      "Ils incluent des garanties minimales à l’échéance ou au décès",
      "Ils sont toujours exempts d’impôt",
      "Ils n’ont aucun frais"
    ],
    correctAnswer: 1
  },
  {
    id: 54,
    question: "(VIE - difficile) Quelle est la conséquence d’une désignation testamentaire sans mise à jour du contrat d’assurance?",
    options: [
      "La désignation testamentaire prévaut toujours",
      "L’assureur priorise la désignation la plus récente du contrat",
      "Aucune prestation ne sera versée",
      "Les deux désignations sont nulles"
    ],
    correctAnswer: 1
  },
  {
    id: 55,
    question: "(ACC/MAL - moyenne) Quel facteur influence le plus le coût d’une assurance invalidité?",
    options: [
      "La région de résidence",
      "Le revenu assuré et la profession",
      "La taille de la famille",
      "L’état civil"
    ],
    correctAnswer: 1
  },
  {
    id: 56,
    question: "(DÉONTO - difficile) Quand une proposition devient-elle un contrat valide?",
    options: [
      "Dès la signature du représentant",
      "Dès le paiement de la première prime",
      "Lorsque l’assureur accepte la proposition",
      "Après la visite médicale"
    ],
    correctAnswer: 2
  },
  {
    id: 57,
    question: "(FONDS - moyenne) Que permet la garantie de retrait à vie (GRV)?",
    options: [
      "Augmenter son capital annuel",
      "Obtenir un revenu viager même si le capital est épuisé",
      "Changer le fonds sans frais",
      "Retirer tous les fonds à la retraite sans pénalité"
    ],
    correctAnswer: 1
  },
  {
    id: 58,
    question: "(VIE - moyenne) Quelle est une utilité d’un avenant de protection enfant sur une police vie?",
    options: [
      "Augmenter la prime automatiquement",
      "Couvrir temporairement l’enfant avec une prestation prédéfinie",
      "Réduire les frais de gestion",
      "Offrir un accès prioritaire au capital décès"
    ],
    correctAnswer: 1
  },
  {
    id: 59,
    question: "(ACC/MAL - difficile) Un assuré a deux assurances invalidité. Que se passe-t-il si la coordination est mal faite?",
    options: [
      "Il reçoit le double de la prestation",
      "Une partie des prestations pourrait être réduite ou refusée",
      "Il obtient un remboursement d’impôt",
      "Il n’a droit à aucune couverture"
    ],
    correctAnswer: 1
  },
  {
    id: 60,
    question: "(DÉONTO - facile) Quelle règle s’applique à la tenue de dossiers clients?",
    options: [
      "Ils doivent être détruits chaque année",
      "Ils doivent être conservés de façon sécurisée pour une durée déterminée",
      "Ils peuvent être partagés librement avec d’autres représentants",
      "Ils n’ont pas à être signés"
    ],
    correctAnswer: 1
  },
  {
    id: 61,
    question: "(FONDS - difficile) Que se passe-t-il si la valeur marchande d’un fonds distinct est inférieure à la garantie au décès?",
    options: [
      "Le bénéficiaire reçoit la valeur marchande",
      "L’assureur complète la différence jusqu’à la garantie prévue",
      "La prestation est suspendue",
      "L’assuré perd la totalité du placement"
    ],
    correctAnswer: 1
  },
  {
    id: 62,
    question: "(VIE - difficile) Une police vie est en vigueur depuis 6 ans. Peut-elle être contestée pour omission de divulgation?",
    options: [
      "Oui, tant que la police est active",
      "Non, la période de contestation est dépassée",
      "Seulement si le décès survient en voyage",
      "Uniquement si les primes sont impayées"
    ],
    correctAnswer: 1
  },
  {
    id: 63,
    question: "(ACC/MAL - moyenne) Quel document prouve un sinistre en assurance maladie?",
    options: [
      "Un reçu de pharmacie",
      "Un formulaire médical précisant le diagnostic admissible",
      "Une preuve de revenu",
      "Une copie du testament"
    ],
    correctAnswer: 1
  },
  {
    id: 64,
    question: "(DÉONTO - difficile) Un représentant soupçonne une fraude. Que doit-il faire?",
    options: [
      "Ignorer par prudence",
      "Informer son assureur et documenter la situation",
      "Transférer le client à un collègue",
      "Faire une déclaration publique"
    ],
    correctAnswer: 1
  },
  {
    id: 65,
    question: "(FONDS - moyenne) Quel produit offre une garantie de capital à 100 % à l’échéance mais expose à des frais élevés?",
    options: [
      "Certificat de placement garanti",
      "Fonds négocié en bourse",
      "Fonds distinct avec garantie maximale",
      "Obligation à coupon zéro"
    ],
    correctAnswer: 2
  },
  {
    id: 66,
    question: "(VIE - facile) Quel est l’objectif principal d’une assurance temporaire?",
    options: [
      "Épargne à long terme",
      "Protection pour une période définie",
      "Investissement en fonds communs",
      "Revenu à vie"
    ],
    correctAnswer: 1
  },
  {
    id: 67,
    question: "(ACC/MAL - difficile) Que signifie l'exonération des primes en cas d'invalidité?",
    options: [
      "Les primes sont remboursées",
      "L'assuré peut suspendre la couverture",
      "L'assureur paie les primes à la place de l'assuré",
      "La couverture est annulée temporairement"
    ],
    correctAnswer: 2
  },
  {
    id: 68,
    question: "(DÉONTO - moyenne) Quel est le but de l’obligation de divulgation complète à l’assureur?",
    options: [
      "Assurer la confidentialité du dossier médical",
      "Permettre une tarification équitable et exacte",
      "Éviter les examens médicaux",
      "Empêcher les demandes de modification du contrat"
    ],
    correctAnswer: 1
  },
  {
    id: 69,
    question: "(FONDS - difficile) Pourquoi un client choisirait-il un fonds à date cible 2045?",
    options: [
      "Pour générer un revenu immédiat",
      "Pour maximiser les risques à court terme",
      "Pour un projet ou une retraite planifiée autour de cette année",
      "Pour éviter toute fluctuation de marché"
    ],
    correctAnswer: 2
  },
  {
    id: 70,
    question: "(VIE - moyenne) Que se passe-t-il si le titulaire d’une police omet de payer sa prime dans les délais?",
    options: [
      "La police est résiliée immédiatement",
      "L’assureur accorde une période de grâce pour le paiement",
      "La prime est retirée automatiquement d’un autre compte",
      "Le montant assuré est réduit de moitié"
    ],
    correctAnswer: 1
  },
  {
    id: 71,
    question: "(ACC/MAL - moyenne) Quelle est la différence principale entre assurance collective et assurance individuelle?",
    options: [
      "L’individuelle est toujours plus abordable",
      "La collective est liée à l’emploi et non personnalisable",
      "La collective couvre toujours plus de risques",
      "L’individuelle ne couvre pas l’hospitalisation"
    ],
    correctAnswer: 1
  },
  {
    id: 72,
    question: "(DÉONTO - facile) Pourquoi un représentant doit-il conserver des notes au dossier?",
    options: [
      "Pour remplir ses quotas",
      "Pour justifier ses recommandations et se protéger légalement",
      "Pour facturer davantage",
      "Pour les transmettre à d’autres assureurs"
    ],
    correctAnswer: 1
  },
  {
    id: 73,
    question: "(FONDS - difficile) Quel risque persiste même avec une garantie à l’échéance dans un fonds distinct?",
    options: [
      "Risque de mortalité",
      "Risque d’illiquidité avant terme",
      "Risque fiscal sur le capital",
      "Risque de hausse salariale"
    ],
    correctAnswer: 1
  },
  {
    id: 74,
    question: "(VIE - difficile) Quel avantage fiscal est associé à une désignation de bénéficiaire directe?",
    options: [
      "Aucune imposition du capital-décès",
      "Réduction immédiate des primes",
      "Crédit d'impôt fédéral supplémentaire",
      "Exonération des frais de gestion"
    ],
    correctAnswer: 0
  },
    {
    id: 75,
    question: "(ACC/MAL - moyenne) Quelle est une cause d’exclusion fréquente en assurance maladies graves?",
    options: [
      "Diagnostic en dehors du Canada",
      "Diagnostic d’une maladie couverte avant le délai de carence",
      "Diagnostic après l’âge de 18 ans",
      "Hospitalisation sans ordonnance"
    ],
    correctAnswer: 1
  }
];
