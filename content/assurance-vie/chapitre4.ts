import { Chapter } from '@/types/chapter';

export const chapter4: Chapter = {
  id: 'life-insurance-ch4',
  title: '🌌 L’Univers des Possibilités',
  summary: `
🛰️ Agent, bienvenue dans le système solaire de l’assurance vie universelle !

Prépare-toi à explorer :
- Une flexibilité intergalactique 💫
- Un investissement propulsé à la vitesse lumière 💹
- Une stratégie de protection qui défie le temps et la fiscalité 📜

Souviens-toi : l’assurance universelle est comme une fusée bien pilotée… ou un trou noir pour ceux qui n’y comprennent rien.
`,

  quiz: [
    {
      question: "🚀 Qu’est-ce qui définit une assurance vie universelle par rapport aux autres ?",
      choices: [
        {
          text: "C’est une assurance permanente avec un volet de placement intégré",
          correct: true,
          explanation: "C’est précisément ce qui la distingue : protection + croissance dans un même vaisseau !"
        },
        {
          text: "Elle vous permet de vivre éternellement",
          correct: false,
          explanation: "C’est une assurance, pas une potion magique."
        },
        {
          text: "Elle couvre les accidents interstellaires",
          correct: false,
          explanation: "Malheureusement, la couverture cosmique n’est pas encore offerte."
        },
        {
          text: "Elle peut être utilisée comme passeport spatial",
          correct: false,
          explanation: "Le bureau des assurances ne délivre pas encore de visas pour Mars."
        }
      ]
    },
    {
      question: "🔄 Quelle est la principale différence entre les prestations de type 1 et de type 2 ?",
      choices: [
        {
          text: "Le type 1 verse seulement le capital de base ; le type 2 ajoute la valeur accumulée",
          correct: true,
          explanation: "Exact ! Le type 2 augmente le versement, mais demande une prime plus élevée."
        },
        {
          text: "Le type 1 est bilingue ; le type 2 parle martien",
          correct: false,
          explanation: "Peu importe la langue, la différence est financière."
        },
        {
          text: "Le type 1 donne droit à un t-shirt gratuit",
          correct: false,
          explanation: "Hélas, pas de goodies dans les polices universelles."
        },
        {
          text: "Le type 2 inclut des billets pour SpaceX",
          correct: false,
          explanation: "Ce serait génial, mais non."
        }
      ]
    },
    {
      question: "💡 Que permet de faire la flexibilité des primes dans une assurance vie universelle ?",
      choices: [
        {
          text: "Adapter le montant et la fréquence des paiements selon la situation du client",
          correct: true,
          explanation: "C’est l’un des grands avantages : la liberté de cotisation (dans certaines limites)."
        },
        {
          text: "Changer de conseiller tous les mois",
          correct: false,
          explanation: "Le conseiller peut changer, mais ce n’est pas lié à la prime."
        },
        {
          text: "Utiliser les primes pour acheter des actions de l’assureur",
          correct: false,
          explanation: "Les primes vont dans le contrat, pas en bourse."
        },
        {
          text: "Payer uniquement les années bissextiles",
          correct: false,
          explanation: "Ce serait fun, mais pas viable pour l’assureur !"
        }
      ]
    }
  ],

  minigame: {
    type: 'universal-planner',
    title: "🧠 Le Stratège Universel",
    description: `
🎮 Dans ce mini-jeu cosmique, vous devrez :

- Choisir les bonnes combinaisons de prestation (type 1 ou 2)
- Ajuster les primes selon les profils
- Réagir aux marchés (croissance ou baisse du compte)
- Préserver l’équilibre entre protection et investissement

Un seul faux pas, et votre client se retrouve dans un trou fiscal !
    `,
    rewards: {
      xp: 400,
      badge: "Voyageur de l’Univers",
      title: "Maître de la Vie Universelle"
    }
  },

  boss: {
    name: "🌠 Le Trou Noir Fiscal",
    description: "Ce boss imprévisible adore les mauvaises décisions de placement et les primes mal calculées. Montrez-lui que vous êtes un stratège éclairé de l’assurance universelle !",
    difficulty: 5,
    quiz: [
      {
        question: "👨‍🚀 Pourquoi faut-il surveiller de près le compte de placement dans une police universelle ?",
        choices: [
          {
            text: "Parce qu’un rendement insuffisant peut entraîner la chute de la police",
            correct: true,
            explanation: "Si le compte ne génère pas assez, il se vide... et la protection s’éteint. Game over !"
          },
          {
            text: "Parce que c’est là que l’assurance stocke vos souvenirs",
            correct: false,
            explanation: "Ce n’est pas une archive émotionnelle… juste un outil fiscal et stratégique."
          },
          {
            text: "Parce qu’on peut y cacher de la crypto",
            correct: false,
            explanation: "Non, ce n’est pas un portefeuille numérique illégal !"
          },
          {
            text: "Parce qu’il est surveillé par la NASA",
            correct: false,
            explanation: "Même la NASA ne peut vous sauver d’une mauvaise stratégie."
          }
        ]
      }
    ],
    rewards: {
      xp: 1000,
      badge: "Dominateur Galactique",
      title: "Éclaireur de la VU"
    }
  }
};
