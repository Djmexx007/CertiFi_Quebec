import { Chapter } from '@/types/chapter';

export const chapter7: Chapter = {
  id: 'legal-framework-ch7',
  title: 'Régimes de Rentes et Retraite',
  summary: `
    🎮 Agent, bienvenue au Centre des Régimes de Retraite !

    Votre mission : maîtriser les aspects juridiques des régimes de rentes et de retraite.

    Dans ce chapitre, vous explorerez :
    - Les secrets des régimes complémentaires 💰
    - L'art des prestations déterminées ⚖️
    - La magie des cotisations déterminées ✨
    - Le pouvoir des REER et FERR 🎯

    Souvenez-vous : Une retraite bien planifiée commence par une bonne compréhension des régimes ! 
  `,
  
  quiz: [
    {
      question: "Quelle est la différence entre un régime à prestations et à cotisations déterminées ?",
      choices: [
        {
          text: "Les prestations garantissent un montant de retraite, les cotisations un montant d'épargne",
          correct: true,
          explanation: "Cette distinction fondamentale affecte le risque et la garantie."
        },
        {
          text: "L'un est plus amusant que l'autre",
          correct: false,
          explanation: "La différence est structurelle, pas récréative !"
        },
        {
          text: "L'un donne plus de vacances",
          correct: false,
          explanation: "Les régimes concernent la retraite, pas les congés !"
        },
        {
          text: "L'un a un meilleur logo",
          correct: false,
          explanation: "L'apparence n'a rien à voir avec le type de régime !"
        }
      ]
    },
    {
      question: "Pourquoi convertir un REER en FERR ?",
      choices: [
        {
          text: "Pour recevoir un revenu de retraite obligatoire après 71 ans",
          correct: true,
          explanation: "La conversion est une exigence légale pour commencer les retraits."
        },
        {
          text: "Pour avoir une plus belle carte",
          correct: false,
          explanation: "La conversion a un but financier, pas esthétique !"
        },
        {
          text: "Pour faire plaisir au banquier",
          correct: false,
          explanation: "La conversion répond à des exigences légales !"
        },
        {
          text: "Pour le plaisir du changement",
          correct: false,
          explanation: "La conversion est une obligation, pas un choix personnel !"
        }
      ]
    },
    {
      question: "Quels sont les avantages fiscaux des régimes enregistrés ?",
      choices: [
        {
          text: "Report d'impôt sur les cotisations et croissance à l'abri de l'impôt",
          correct: true,
          explanation: "Ces avantages fiscaux encouragent l'épargne-retraite."
        },
        {
          text: "Des cadeaux fiscaux surprise",
          correct: false,
          explanation: "Les avantages sont strictement fiscaux et réglementés !"
        },
        {
          text: "Un trophée de meilleur épargnant",
          correct: false,
          explanation: "Les avantages sont financiers, pas honorifiques !"
        },
        {
          text: "Des points de fidélité fiscale",
          correct: false,
          explanation: "Il n'existe pas de programme de récompenses fiscal !"
        }
      ]
    }
  ],

  minigame: {
    type: 'pension-master',
    title: "Le Maître des Pensions",
    description: `
      🎮 Devenez le Maître des Pensions dans ce mini-jeu stratégique !
      
      Votre mission :
      - Gérez les régimes de retraite
      - Optimisez les avantages fiscaux
      - Planifiez les conversions
      - Maximisez les prestations
      
      Attention aux règles fiscales et aux obligations légales !
    `,
    rewards: {
      xp: 500,
      badge: "Maître des Retraites",
      title: "Gardien des Pensions"
    }
  },

  boss: {
    name: "Le Planificateur Suprême",
    description: "Un boss redoutable qui teste votre maîtrise des régimes de retraite !",
    difficulty: 5,
    rewards: {
      xp: 1100,
      badge: "Maître du Chapitre 7",
      title: "Champion des Retraites"
    }
  }
};