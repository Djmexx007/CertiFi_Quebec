import { Chapter } from '@/types/chapter';

export const chapter1: Chapter = {
  id: 'investment-ch1',
  title: 'Les Fondements du Placement',
  summary: `
    🎮 Agent, bienvenue à l'Académie des Placements !

    Votre mission : maîtriser les principes fondamentaux de l'épargne et du placement.

    Dans ce chapitre, vous explorerez :
    - Les secrets de l'intérêt composé 💰
    - L'art de la diversification 🎯
    - La magie de la valeur temporelle ⏳
    - Le pouvoir des différentes catégories d'actifs 📊

    Souvenez-vous : Un bon placement commence par une bonne compréhension des bases ! 
  `,
  
  quiz: [
    {
      question: "Pourquoi l'intérêt composé est-il si puissant ?",
      choices: [
        {
          text: "Les intérêts générés produisent eux-mêmes des intérêts",
          correct: true,
          explanation: "C'est l'effet boule de neige qui fait croître votre argent exponentiellement."
        },
        {
          text: "Il utilise une formule magique secrète",
          correct: false,
          explanation: "L'intérêt composé suit des règles mathématiques, pas magiques !"
        },
        {
          text: "Il est béni par les dieux de la finance",
          correct: false,
          explanation: "La puissance de l'intérêt composé vient des mathématiques, pas de la mythologie !"
        },
        {
          text: "Il fait plaisir aux banquiers",
          correct: false,
          explanation: "L'intérêt composé est un principe mathématique, pas une faveur bancaire !"
        }
      ]
    },
    {
      question: "Pourquoi la diversification est-elle importante ?",
      choices: [
        {
          text: "Elle réduit le risque en répartissant les investissements",
          correct: true,
          explanation: "Ne pas mettre tous ses œufs dans le même panier protège contre les pertes importantes."
        },
        {
          text: "Pour impressionner ses amis",
          correct: false,
          explanation: "La diversification sert à protéger votre argent, pas votre ego !"
        },
        {
          text: "Pour compliquer son portefeuille",
          correct: false,
          explanation: "La diversification simplifie la gestion du risque, elle ne la complique pas !"
        },
        {
          text: "Pour utiliser plus de couleurs dans les graphiques",
          correct: false,
          explanation: "L'aspect visuel n'est pas le but de la diversification !"
        }
      ]
    },
    {
      question: "Quels sont les principaux objectifs de placement ?",
      choices: [
        {
          text: "Croissance du capital, protection des actifs et génération de revenus",
          correct: true,
          explanation: "Ces objectifs guident le choix des placements selon les besoins du client."
        },
        {
          text: "Devenir riche rapidement",
          correct: false,
          explanation: "Les placements sérieux visent des objectifs réalistes à long terme !"
        },
        {
          text: "Battre tous les records boursiers",
          correct: false,
          explanation: "L'investissement n'est pas une compétition sportive !"
        },
        {
          text: "Collectionner les plus beaux certificats",
          correct: false,
          explanation: "L'apparence des documents n'est pas un objectif de placement !"
        }
      ]
    }
  ],

  minigame: {
    type: 'investment-master',
    title: "Le Maître des Placements",
    description: `
      🎮 Devenez le Maître des Placements dans ce mini-jeu stratégique !
      
      Votre mission :
      - Gérez différents types de placements
      - Optimisez les rendements
      - Équilibrez les risques
      - Maximisez l'intérêt composé
      
      Attention aux fluctuations du marché et aux pièges de l'investissement !
    `,
    rewards: {
      xp: 200,
      badge: "Maître des Bases",
      title: "Sage des Placements"
    }
  },

  boss: {
    name: "Le Gardien des Marchés",
    description: "Un boss redoutable qui teste votre compréhension des principes fondamentaux !",
    difficulty: 3,
    rewards: {
      xp: 500,
      badge: "Maître du Chapitre 1",
      title: "Champion des Fondements"
    }
  }
};