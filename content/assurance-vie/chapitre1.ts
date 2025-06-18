import { Chapter } from '@/types/chapter';

export const chapter1: Chapter = {
  id: 'life-insurance-ch1',
  title: 'La Grande Aventure de la Mortalité',
  summary: `
🎮 Bienvenue, Agent d'Assurance en formation !

Vous entrez dans le royaume périlleux de l’assurance vie, où chaque décision peut sauver un foyer de la ruine.

Dans ce chapitre, vous découvrirez :
- Les ravages financiers du destin 💀
- Les contre-attaques magiques des polices d’assurance 🛡️
- Les premières techniques des héros du risque 🧙‍♂️

Préparez-vous à affronter la Faucheuse Financière et à devenir un véritable Gardien de la Stabilité !
`,

  quiz: [
    {
      question: "💰 Qu’est-ce qui illustre le mieux la nécessité d’une assurance vie dans un foyer dépendant d’un seul revenu ?",
      choices: [
        {
          text: "Le risque de précarité immédiate en cas de décès du soutien principal",
          correct: true,
          explanation: "La disparition du principal revenu peut mener à l'incapacité de payer les dépenses essentielles, comme le logement, les dettes ou les besoins quotidiens."
        },
        {
          text: "La difficulté à planifier des vacances de rêve",
          correct: false,
          explanation: "Ce serait dommage, certes, mais pas une menace directe à la stabilité du foyer."
        },
        {
          text: "La fin des abonnements Netflix",
          correct: false,
          explanation: "Ce n’est pas l’enjeu principal de la sécurité financière."
        },
        {
          text: "La perte d'un coach privé pour le chien",
          correct: false,
          explanation: "Les priorités changent vite quand la survie financière est en jeu."
        }
      ]
    },
    {
      question: "⚖️ Quelle est la première stratégie de gestion du risque qu’un conseiller devrait évaluer ?",
      choices: [
        {
          text: "L’évitement du risque",
          correct: true,
          explanation: "C’est la solution la plus radicale : supprimer l’activité risquée."
        },
        {
          text: "La méthode YOLO (You Only Live Once)",
          correct: false,
          explanation: "YOLO est plutôt une philosophie de vie... et souvent de prise de risques inconsidérée."
        },
        {
          text: "L'assurance obligatoire par défaut",
          correct: false,
          explanation: "Il faut analyser d’abord le risque, avant d’imposer des solutions."
        },
        {
          text: "Faire semblant que tout ira bien",
          correct: false,
          explanation: "On appelle ça le déni. Et ce n’est pas une stratégie professionnelle."
        }
      ]
    },
    {
      question: "🏢 Quel est l’impact du décès d’un employé clé pour une entreprise ?",
      choices: [
        {
          text: "Il peut désorganiser toute la stratégie, la production ou la gestion de l’entreprise",
          correct: true,
          explanation: "Un employé clé est souvent difficile à remplacer et son absence fragilise l’organisation."
        },
        {
          text: "Le coin café perd son animateur principal",
          correct: false,
          explanation: "Même si l'ambiance en prend un coup, l'impact réel est sur la structure opérationnelle."
        },
        {
          text: "Les plantes du bureau sont moins arrosées",
          correct: false,
          explanation: "Ce n’est pas un risque jugé critique par les experts en gestion."
        },
        {
          text: "L’entreprise doit annuler son party de Noël",
          correct: false,
          explanation: "Le party est accessoire... la continuité des affaires, non."
        }
      ]
    }
  ],

  minigame: {
    type: 'risk-manager',
    title: "🛡️ Le Gestionnaire de Risques",
    description: `
🎮 Mission : protéger une famille contre les dangers de la vie !

En tant que Gardien de la Prévoyance, vous devez :
- Détecter les risques financiers dans différentes scènes
- Choisir les meilleures protections (assurance, prévention, etc.)
- Équilibrer budget, protection et imprévus pour survivre à l’année

Bonus : Des événements aléatoires viendront pimenter l’aventure !
    `,
    rewards: {
      xp: 100,
      badge: "Protecteur Novice",
      title: "Gardien des Polices"
    }
  },

  boss: {
    name: "☠️ Le Faucheur Financier",
    description: "Un boss redoutable qui attaque votre ignorance sur les impacts financiers du décès. Il apparaît dans une dernière épreuve interactive où chaque bonne réponse lui enlève des points de vie !",
    difficulty: 3,
    quiz: [
      {
        question: "🎯 Quel est le rôle principal d'une assurance vie dans une planification successorale ?",
        choices: [
          {
            text: "Payer les droits de succession et stabiliser le revenu des survivants",
            correct: true,
            explanation: "C’est l’un des objectifs principaux d’une assurance vie : éviter un appauvrissement des héritiers."
          },
          {
            text: "Permettre une distribution équitable de l'héritage",
            correct: false,
            explanation: "Cela relève davantage du testament et du liquidateur successoral."
          },
          {
            text: "Offrir un capital pour investir dans l'immobilier",
            correct: false,
            explanation: "L’assurance vie n’a pas pour but premier d’alimenter un projet immobilier."
          },
          {
            text: "Remplacer un testament",
            correct: false,
            explanation: "L’assurance vie ne remplace jamais un testament. Les deux sont complémentaires."
          }
        ]
      }
    ],
    rewards: {
      xp: 500,
      badge: "Maître du Chapitre 1",
      title: "Vainqueur du Faucheur"
    }
  }
};
