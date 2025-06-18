import { Chapter } from '@/types/chapter';

export const chapter5: Chapter = {
  id: 'investment-ch5',
  title: 'Actions et Obligations',
  summary: `
    🎮 Agent, bienvenue dans le monde des Actions et Obligations !

    Votre mission : maîtriser l'art de combiner ces deux piliers de l'investissement.

    Dans ce chapitre, vous explorerez :
    - Les secrets des actions privilégiées et ordinaires 📈
    - L'art des obligations gouvernementales et corporatives 📊
    - La magie des dividendes et des coupons ✨
    - Le pouvoir de l'équilibre rendement-risque ⚖️

    Souvenez-vous : La diversification est votre meilleure alliée ! 
  `,
  
  quiz: [
    {
      question: "Quelle est la différence principale entre une action ordinaire et privilégiée ?",
      choices: [
        {
          text: "Les actions privilégiées ont priorité pour les dividendes mais généralement pas de droit de vote",
          correct: true,
          explanation: "C'est la distinction fondamentale entre ces deux types d'actions."
        },
        {
          text: "Les actions privilégiées sont plus jolies",
          correct: false,
          explanation: "L'apparence n'a rien à voir avec les droits attachés aux actions !"
        },
        {
          text: "Les actions ordinaires sont en papier recyclé",
          correct: false,
          explanation: "Le support physique n'a pas d'importance !"
        },
        {
          text: "Les privilégiées donnent accès au salon VIP",
          correct: false,
          explanation: "Les privilèges sont financiers, pas sociaux !"
        }
      ]
    },
    {
      question: "Pourquoi investir dans les obligations ?",
      choices: [
        {
          text: "Pour obtenir un revenu fixe et plus stable que les actions",
          correct: true,
          explanation: "Les obligations offrent généralement plus de stabilité et de prévisibilité."
        },
        {
          text: "Pour collectionner du papier joli",
          correct: false,
          explanation: "L'investissement en obligations a un but financier, pas esthétique !"
        },
        {
          text: "Pour faire plaisir à son banquier",
          correct: false,
          explanation: "Le choix d'investissement doit répondre à vos objectifs personnels !"
        },
        {
          text: "Pour avoir plus de paperasse",
          correct: false,
          explanation: "La documentation n'est pas le but de l'investissement !"
        }
      ]
    },
    {
      question: "Comment les taux d'intérêt affectent-ils les obligations ?",
      choices: [
        {
          text: "Quand les taux montent, la valeur des obligations existantes baisse",
          correct: true,
          explanation: "C'est la relation inverse fondamentale entre taux et prix des obligations."
        },
        {
          text: "Les obligations deviennent plus colorées",
          correct: false,
          explanation: "L'effet est financier, pas visuel !"
        },
        {
          text: "Elles deviennent plus lourdes",
          correct: false,
          explanation: "Le poids physique n'a rien à voir avec la valeur !"
        },
        {
          text: "Elles changent de nom",
          correct: false,
          explanation: "Le nom reste le même, seule la valeur change !"
        }
      ]
    }
  ],

  minigame: {
    type: 'portfolio-master',
    title: "Le Maître du Portefeuille",
    description: `
      🎮 Devenez le Maître du Portefeuille dans ce mini-jeu stratégique !
      
      Votre mission :
      - Équilibrez actions et obligations
      - Gérez les risques de marché
      - Optimisez les revenus
      - Maximisez le rendement total
      
      Attention aux fluctuations de taux et aux cycles économiques !
    `,
    rewards: {
      xp: 400,
      badge: "Maître du Portefeuille",
      title: "Stratège des Marchés"
    }
  },

  boss: {
    name: "L'Équilibriste des Marchés",
    description: "Un boss redoutable qui teste votre maîtrise de l'allocation d'actifs !",
    difficulty: 4,
    rewards: {
      xp: 850,
      badge: "Maître du Chapitre 5",
      title: "Champion de l'Équilibre"
    }
  }
};