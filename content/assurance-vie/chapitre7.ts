import { Chapter } from '@/types/chapter';

export const chapter7: Chapter = {
  id: 'life-insurance-ch7',
  title: '⚖️ L’Impôt Invisible',
  summary: `
🎩 Agent, vous voilà promu au rang de stratège fiscal !

Dans ce chapitre, vous allez :
- Décoder l’exonération magique de la prestation de décès
- Distinguer ce qui est imposable de ce qui ne l’est pas
- Maîtriser les stratégies de transmission
- Éviter les pièges fiscaux comme un ninja de la finance

💡 Règle d’or : La meilleure stratégie d’assurance est celle qui respecte la loi… et minimise l’impôt intelligemment.
  `,

  quiz: [
    {
      question: "💸 Dans quelle situation la prestation de décès est-elle imposable ?",
      choices: [
        {
          text: "Lorsque la prestation est versée à la succession sans bénéficiaire désigné",
          correct: true,
          explanation: "C’est exact ! Dans ce cas, la prestation est intégrée à la succession et peut devenir imposable."
        },
        {
          text: "Quand elle est versée à un ami Facebook",
          correct: false,
          explanation: "Peu importe le lien social — c’est le statut juridique du bénéficiaire qui compte."
        },
        {
          text: "Quand l’assuré est né un 29 février",
          correct: false,
          explanation: "L’anniversaire n’a aucun effet fiscal, promis."
        },
        {
          text: "Si le bénéficiaire est végétarien",
          correct: false,
          explanation: "Le régime alimentaire ne modifie pas le régime fiscal."
        }
      ]
    },
    {
      question: "🏦 Pourquoi désigner un bénéficiaire directement dans une police d’assurance vie ?",
      choices: [
        {
          text: "Pour que la prestation ne passe pas par la succession",
          correct: true,
          explanation: "C’est la clé : cela évite les frais de succession et protège la somme d’impôt potentiel."
        },
        {
          text: "Pour éviter que le testament soit trop long",
          correct: false,
          explanation: "Même si c’est pratique, ce n’est pas une raison juridique."
        },
        {
          text: "Pour empêcher un ex jaloux de réclamer",
          correct: false,
          explanation: "L’intention est valide, mais ce n’est pas une justification fiscale !"
        },
        {
          text: "Pour que le bénéficiaire gagne au loto",
          correct: false,
          explanation: "C’est une police, pas un billet de loterie."
        }
      ]
    },
    {
      question: "📊 Pourquoi les entreprises souscrivent-elles une assurance vie sur la tête d’un employé clé ?",
      choices: [
        {
          text: "Pour compenser une perte financière en cas de décès",
          correct: true,
          explanation: "La perte d’un employé stratégique peut entraîner des pertes économiques majeures. Cette protection compense l’impact."
        },
        {
          text: "Pour faire plaisir à l’employé",
          correct: false,
          explanation: "Ce n’est pas un cadeau. C’est une stratégie de gestion des risques !"
        },
        {
          text: "Pour faire des blagues fiscales",
          correct: false,
          explanation: "La fiscalité, c’est sérieux… surtout en entreprise."
        },
        {
          text: "Pour se protéger contre les congés maladie",
          correct: false,
          explanation: "Ce serait une autre forme de protection : assurance invalidité ou salaire."
        }
      ]
    }
  ],

  minigame: {
    type: 'fiscal-ninja',
    title: "🧾 Le Ninja Fiscal",
    description: `
🎮 Mission : éviter tous les pièges fiscaux en naviguant à travers des situations réelles !

- Distingue ce qui est imposable de ce qui est exonéré
- Applique les bons bénéficiaires aux polices
- Utilise les clauses de désignation et les stratégies corporatives pour optimiser le patrimoine

Le ninja fiscal ne paie pas plus que ce que la loi impose. 🥷💼
    `,
    rewards: {
      xp: 600,
      badge: "Maître Fiscaliste",
      title: "Ninja de la Transmission"
    }
  },

  boss: {
    name: "🧟‍♂️ Le Revenu Fantôme",
    description: "Ce boss surgit quand une prestation oubliée devient imposable. Il hante les déclarations mal préparées…",
    difficulty: 5,
    quiz: [
      {
        question: "😱 Qu’est-ce qu’un revenu fantôme en assurance vie ?",
        choices: [
          {
            text: "Un montant imposable même si le client ne le reçoit pas directement",
            correct: true,
            explanation: "C’est typiquement ce qui peut arriver si un gain est attribué, mais non encaissé (comme dans certains rachats partiels)."
          },
          {
            text: "Une somme payée en billets invisibles",
            correct: false,
            explanation: "Ça, c’est de la magie… pas de la fiscalité !"
          },
          {
            text: "Une vieille police oubliée",
            correct: false,
            explanation: "On parle ici d’un revenu technique, pas d’un souvenir d’archive."
          },
          {
            text: "Un revenu généré par un fantôme réel",
            correct: false,
            explanation: "Même les audits paranormaux ne taxent pas les esprits !"
          }
        ]
      }
    ],
    rewards: {
      xp: 1000,
      badge: "Chasseur d’Ombres Fiscales",
      title: "Stratège de l’Invisible"
    }
  }
};
