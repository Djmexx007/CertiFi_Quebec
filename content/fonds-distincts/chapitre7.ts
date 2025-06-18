import { Chapter } from '@/types/chapter';

export const chapter7: Chapter = {
  id: 'investment-ch7',
  title: 'Imposition des Placements',
  summary: `
    🎮 Agent, bienvenue dans le labyrinthe fiscal !

    Votre mission : maîtriser l'art complexe de l'imposition des placements.

    Dans ce chapitre, vous explorerez :
    - Les secrets de l'imposition des revenus de placement 💰
    - L'art des régimes enregistrés 📊
    - La magie des avantages fiscaux ✨
    - Le pouvoir des stratégies d'optimisation 🎯

    Souvenez-vous : Une bonne stratégie fiscale est la clé d'un rendement optimal ! 
  `,
  
  quiz: [
    {
      question: "Comment sont imposés les intérêts ?",
      choices: [
        {
          text: "Comme un revenu régulier, au taux marginal d'imposition",
          correct: true,
          explanation: "Les intérêts sont pleinement imposables comme un revenu d'emploi."
        },
        {
          text: "Ils ne sont jamais imposés",
          correct: false,
          explanation: "Les intérêts sont l'un des revenus les plus imposés !"
        },
        {
          text: "Selon l'humeur du fisc",
          correct: false,
          explanation: "L'imposition suit des règles précises, pas des humeurs !"
        },
        {
          text: "En chocolat",
          correct: false,
          explanation: "L'impôt se paie en argent, pas en nature !"
        }
      ]
    },
    {
      question: "Quel est l'avantage fiscal principal du CELI ?",
      choices: [
        {
          text: "Les revenus et retraits sont libres d'impôt",
          correct: true,
          explanation: "C'est ce qui rend le CELI si attrayant pour l'épargne."
        },
        {
          text: "Il donne des super-pouvoirs fiscaux",
          correct: false,
          explanation: "Les avantages sont fiscaux, pas surnaturels !"
        },
        {
          text: "Il fait disparaître le fisc",
          correct: false,
          explanation: "Le CELI respecte les règles fiscales, il ne les élimine pas !"
        },
        {
          text: "Il transforme l'impôt en bonbons",
          correct: false,
          explanation: "Les avantages sont financiers, pas en nature !"
        }
      ]
    },
    {
      question: "Pourquoi les gains en capital sont-ils avantageux fiscalement ?",
      choices: [
        {
          text: "Seulement 50% des gains sont imposables",
          correct: true,
          explanation: "Cette inclusion partielle réduit significativement l'impôt à payer."
        },
        {
          text: "Ils rendent plus intelligent",
          correct: false,
          explanation: "Les avantages sont purement fiscaux !"
        },
        {
          text: "Ils donnent des points de fidélité",
          correct: false,
          explanation: "Il n'existe pas de programme de récompenses fiscal !"
        },
        {
          text: "Ils font plaisir au comptable",
          correct: false,
          explanation: "L'avantage est pour l'investisseur, pas le comptable !"
        }
      ]
    }
  ],

  minigame: {
    type: 'tax-master',
    title: "Le Maître de la Fiscalité",
    description: `
      🎮 Devenez le Maître de la Fiscalité dans ce mini-jeu stratégique !
      
      Votre mission :
      - Optimisez l'imposition des placements
      - Gérez les régimes enregistrés
      - Maximisez les avantages fiscaux
      - Évitez les pièges fiscaux
      
      Attention aux règles fiscales complexes et aux dates limites !
    `,
    rewards: {
      xp: 500,
      badge: "Maître Fiscal",
      title: "Stratège de l'Impôt"
    }
  },

  boss: {
    name: "Le Percepteur Suprême",
    description: "Un boss redoutable qui teste votre maîtrise de la fiscalité des placements !",
    difficulty: 5,
    rewards: {
      xp: 1000,
      badge: "Maître du Chapitre 7",
      title: "Champion Fiscal"
    }
  }
};