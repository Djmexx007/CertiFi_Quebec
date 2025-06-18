import { Chapter } from '@/types/chapter';

export const chapter3: Chapter = {
  id: 'life-insurance-ch3',
  title: "📜 Les Gardiens de l'Éternité",
  summary: `
🌟 Agent, bienvenue dans le monde intemporel de l’assurance vie permanente !

Dans cette mission, vous apprendrez à manier les polices éternelles comme un véritable stratège du patrimoine. Vous croiserez :
- Des valeurs de rachat mystérieuses 💰
- Des participations qui font fructifier vos contrats 📈
- Des polices hybrides, mi-temporaire, mi-permanente 🤖

Rappelez-vous : dans le royaume de la permanence, l’endurance est une vertu, et le long terme, une récompense.
  `,

  quiz: [
    {
      question: "⚖️ Quelle est la principale différence entre l'assurance temporaire et l'assurance permanente ?",
      choices: [
        {
          text: "L’assurance permanente couvre toute la vie et inclut une valeur de rachat",
          correct: true,
          explanation: "C’est LA grande différence. La permanente protège à vie et accumule de la valeur."
        },
        {
          text: "L’assurance permanente offre un abonnement à vie à une salle de gym",
          correct: false,
          explanation: "Ce serait bien, mais non. L’avantage est plutôt financier que musculaire."
        },
        {
          text: "L’assurance temporaire est illégale au-delà de 65 ans",
          correct: false,
          explanation: "Faux. Elle est disponible à tout âge tant que l’assureur l’accepte."
        },
        {
          text: "La permanente est une police rédigée en latin ancien",
          correct: false,
          explanation: "Le langage peut être technique, mais il est tout à fait moderne !"
        }
      ]
    },
    {
      question: "📈 Que peut faire un assuré avec les participations générées par une assurance vie avec participation ?",
      choices: [
        {
          text: "Les encaisser, réduire la prime, capitaliser ou acheter de l’assurance supplémentaire",
          correct: true,
          explanation: "Ce sont les 4 usages classiques. Le client peut même en combiner certains selon les contrats."
        },
        {
          text: "Les convertir en cartes cadeaux Amazon",
          correct: false,
          explanation: "Les assureurs sont modernes… mais pas à ce point !"
        },
        {
          text: "Les transférer sur sa carte de crédit",
          correct: false,
          explanation: "Ce n’est pas un programme de récompenses bancaires."
        },
        {
          text: "Les offrir à son conseiller comme pourboire",
          correct: false,
          explanation: "Généreux… mais illégal !"
        }
      ]
    },
    {
      question: "🔄 Qu’est-ce qu’une police combinée temporaire/permanente (T-100 hybride) ?",
      choices: [
        {
          text: "Une assurance qui commence temporaire et devient permanente automatiquement",
          correct: true,
          explanation: "Exact ! Elle combine les deux types de protection, souvent pour maximiser la couverture dans le temps."
        },
        {
          text: "Une assurance qui protège contre les robots",
          correct: false,
          explanation: "Pas encore de couverture anti-cyborg, désolé."
        },
        {
          text: "Une assurance temporaire qui se régénère chaque année",
          correct: false,
          explanation: "Tu confonds avec la renouvelable annuelle."
        },
        {
          text: "Un concept inventé dans Terminator 2",
          correct: false,
          explanation: "Le nom peut prêter à confusion, mais cette police est bien réelle !"
        }
      ]
    }
  ],

  minigame: {
    type: 'permanent-builder',
    title: "🏗️ L’Architecte de la Permanence",
    description: `
🎮 Construisez la meilleure stratégie patrimoniale à long terme :

- Combinez différents types de polices
- Gérez vos participations avec stratégie
- Choisissez quand convertir ou racheter
- Maximisez la valeur pour la succession

Chaque décision compte… et un petit faux pas peut coûter cher (à vos héritiers).
    `,
    rewards: {
      xp: 300,
      badge: "Bâtisseur Éternel",
      title: "Maître du Patrimoine"
    }
  },

  boss: {
    name: "👑 Le Gardien de la Valeur",
    description: "Un boss patient… mais impitoyable. Il teste vos connaissances sur les valeurs de rachat, les participations et les stratégies de long terme.",
    difficulty: 4,
    quiz: [
      {
        question: "🧠 Pourquoi les valeurs de rachat peuvent-elles jouer un rôle clé dans une stratégie financière ?",
        choices: [
          {
            text: "Elles représentent un actif accessible, utilisable en cas de besoin ou de stratégie planifiée",
            correct: true,
            explanation: "Exact. Elles permettent d’emprunter, de racheter ou d’ajuster la couverture."
          },
          {
            text: "Elles permettent de devenir actionnaire de l’assureur",
            correct: false,
            explanation: "Non, mais vous pouvez bénéficier des profits si la police est participative."
          },
          {
            text: "Elles réduisent automatiquement les impôts",
            correct: false,
            explanation: "Non. Elles peuvent avoir un impact fiscal… mais ce n’est pas toujours positif !"
          },
          {
            text: "Elles garantissent un revenu à vie",
            correct: false,
            explanation: "Seules certaines rentes ou options permettent cela, pas la valeur de rachat en elle-même."
          }
        ]
      }
    ],
    rewards: {
      xp: 800,
      badge: "Gardien de la Valeur",
      title: "Stratège Éternel"
    }
  }
};
