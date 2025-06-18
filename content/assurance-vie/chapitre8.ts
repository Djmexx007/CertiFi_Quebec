import { Chapter } from '@/types/chapter';

export const chapter8: Chapter = {
  id: 'life-insurance-ch8',
  title: '🏛️ Héritiers & Légendes',
  summary: `
📜 Agent, te voici maintenant Maître de l’Héritage !

L’assurance vie n’est pas qu’un outil de protection… c’est une **clé de transmission** pour construire un **patrimoine intergénérationnel**.

Dans ce chapitre, tu apprendras à :
- Utiliser la police comme un levier de planification successorale
- Structurer les bénéficiaires pour éviter les pièges légaux et fiscaux
- Préserver la paix familiale (et éviter la guerre des héritiers !)

🔐 Prépare-toi à écrire l’histoire d’un héritage sans faille.
  `,

  quiz: [
    {
      question: "🧠 Quel est **l’avantage principal** d’une assurance vie dans une stratégie successorale ?",
      choices: [
        {
          text: "Elle permet un transfert rapide et non imposable des capitaux",
          correct: true,
          explanation: "C’est la raison pour laquelle elle est si utilisée : efficacité, rapidité, fiscalité avantageuse."
        },
        {
          text: "Elle remplace un testament notarié",
          correct: false,
          explanation: "Faux. Le testament reste crucial même avec une bonne planification assurantielle."
        },
        {
          text: "Elle permet de tout transmettre à son animal de compagnie",
          correct: false,
          explanation: "Les animaux ne peuvent pas être bénéficiaires directs légalement."
        },
        {
          text: "Elle efface les dettes du défunt automatiquement",
          correct: false,
          explanation: "Elle peut y contribuer… mais pas les annuler magiquement."
        }
      ]
    },
    {
      question: "📁 Pourquoi est-il **essentiel** de désigner un bénéficiaire dans une police d’assurance vie ?",
      choices: [
        {
          text: "Pour éviter que la prestation passe par la succession",
          correct: true,
          explanation: "Cela permet d’éviter les délais, les frais et les complications fiscales."
        },
        {
          text: "Parce que la loi l’oblige",
          correct: false,
          explanation: "La loi le permet, mais ce n’est pas une obligation. C’est une stratégie judicieuse."
        },
        {
          text: "Parce que c’est plus stylé",
          correct: false,
          explanation: "C’est stylé… mais surtout efficace fiscalement."
        },
        {
          text: "Pour bloquer un héritier spécifique",
          correct: false,
          explanation: "Ce n’est pas son objectif, même si cela peut influencer la répartition."
        }
      ]
    },
    {
      question: "⚖️ Que peut-il se passer si aucun bénéficiaire n’est désigné ?",
      choices: [
        {
          text: "La prestation entre dans la succession et devient potentiellement imposable",
          correct: true,
          explanation: "Elle perd son avantage fiscal et risque d’être soumise aux dettes et aux délais."
        },
        {
          text: "La prestation est automatiquement reversée à l’État",
          correct: false,
          explanation: "Pas immédiatement. Mais sans héritier et sans testament, ça peut y mener à long terme."
        },
        {
          text: "Elle est convertie en don à une fondation au hasard",
          correct: false,
          explanation: "Les assureurs ne prennent pas ce genre de décisions."
        },
        {
          text: "Elle reste bloquée 100 ans",
          correct: false,
          explanation: "Pas besoin d’attendre un siècle… mais la succession prend du temps !"
        }
      ]
    }
  ],

  minigame: {
    type: 'legacy-strategist',
    title: "📚 Le Stratège de l’Héritage",
    description: `
🎮 Dans ce mini-jeu de simulation patrimoniale, tu devras :

- Structurer des polices d’assurance vie pour différents clients
- Choisir les bons bénéficiaires
- Minimiser les conflits, les impôts, et maximiser la paix familiale

Chaque erreur peut mener à un désastre notarial...
    `,
    rewards: {
      xp: 650,
      badge: "Architecte Successoral",
      title: "Gardien des Héritiers"
    }
  },

  boss: {
    name: "⚔️ Le Conflit Successoral",
    description: "Ce boss surgit quand un héritage est mal préparé. Il adore les erreurs de bénéficiaires et les familles fâchées.",
    difficulty: 5,
    quiz: [
      {
        question: "👀 Quel est le **risque majeur** d’un bénéficiaire non mis à jour après un divorce ?",
        choices: [
          {
            text: "Que l’ex-conjoint reçoive la prestation malgré une nouvelle union",
            correct: true,
            explanation: "C’est une des erreurs les plus fréquentes… et les plus douloureuses pour la famille actuelle."
          },
          {
            text: "Que l’assurance se transforme en abonnement télé",
            correct: false,
            explanation: "Fantasme administratif non fondé 😅"
          },
          {
            text: "Que l’enfant du nouveau couple perde son droit de jeu vidéo",
            correct: false,
            explanation: "Les consoles ne sont pas gérées par les contrats d’assurance !"
          },
          {
            text: "Que le testament explose",
            correct: false,
            explanation: "Le testament n’explose pas… mais il risque d’être contesté !"
          }
        ]
      }
    ],
    rewards: {
      xp: 1000,
      badge: "Protecteur des Familles",
      title: "Maître des Successions"
    }
  }
};
