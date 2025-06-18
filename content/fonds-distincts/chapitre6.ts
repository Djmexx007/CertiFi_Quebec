import { Chapter } from '@/types/chapter';

export const chapter6: Chapter = {
  id: 'investment-ch6',
  title: 'Stratégies Avancées de Placement',
  summary: `
    🎮 Agent, bienvenue au Centre des Stratégies Avancées !

    Votre mission : maîtriser l'art des stratégies de placement sophistiquées.

    Dans ce chapitre, vous explorerez :
    - Les secrets de l'allocation d'actifs optimale 📊
    - L'art du rééquilibrage stratégique 🔄
    - La magie de la gestion fiscale ✨
    - Le pouvoir des stratégies de revenu 💰

    Souvenez-vous : Une stratégie bien pensée est la clé du succès à long terme ! 
  `,
  
  quiz: [
    {
      question: "Pourquoi l'allocation d'actifs est-elle cruciale ?",
      choices: [
        {
          text: "Elle détermine la majeure partie du rendement et du risque du portefeuille",
          correct: true,
          explanation: "L'allocation d'actifs est le facteur le plus important dans la performance à long terme."
        },
        {
          text: "Elle impressionne les autres investisseurs",
          correct: false,
          explanation: "L'allocation sert à optimiser le portefeuille, pas à impressionner !"
        },
        {
          text: "Elle rend les graphiques plus colorés",
          correct: false,
          explanation: "L'aspect visuel n'est pas le but de l'allocation !"
        },
        {
          text: "Elle utilise plus de mathématiques",
          correct: false,
          explanation: "Les mathématiques sont un outil, pas un objectif !"
        }
      ]
    },
    {
      question: "Quand faut-il rééquilibrer un portefeuille ?",
      choices: [
        {
          text: "Lorsque les allocations s'écartent significativement des cibles ou périodiquement",
          correct: true,
          explanation: "Le rééquilibrage maintient le profil risque-rendement souhaité."
        },
        {
          text: "Quand la lune est pleine",
          correct: false,
          explanation: "Le rééquilibrage suit des critères objectifs, pas astrologiques !"
        },
        {
          text: "Quand on s'ennuie",
          correct: false,
          explanation: "Le rééquilibrage doit être stratégique, pas émotionnel !"
        },
        {
          text: "Tous les jours pairs",
          correct: false,
          explanation: "La fréquence doit être basée sur des critères pertinents !"
        }
      ]
    },
    {
      question: "Quelle est la meilleure stratégie de revenu ?",
      choices: [
        {
          text: "Celle qui correspond aux objectifs et à la tolérance au risque du client",
          correct: true,
          explanation: "La meilleure stratégie est celle qui répond aux besoins spécifiques du client."
        },
        {
          text: "Celle qui rapporte le plus",
          correct: false,
          explanation: "Le rendement n'est pas le seul critère à considérer !"
        },
        {
          text: "Celle qui est à la mode",
          correct: false,
          explanation: "Les tendances ne déterminent pas la pertinence d'une stratégie !"
        },
        {
          text: "Celle qui a le plus beau nom",
          correct: false,
          explanation: "Le nom n'a aucune importance dans l'efficacité d'une stratégie !"
        }
      ]
    }
  ],

  minigame: {
    type: 'strategy-master',
    title: "Le Stratège des Placements",
    description: `
      🎮 Devenez le Stratège des Placements dans ce mini-jeu avancé !
      
      Votre mission :
      - Optimisez l'allocation d'actifs
      - Gérez le rééquilibrage
      - Maximisez l'efficacité fiscale
      - Développez des stratégies de revenu
      
      Attention aux changements de marché et aux opportunités stratégiques !
    `,
    rewards: {
      xp: 450,
      badge: "Maître Stratège",
      title: "Architecte des Stratégies"
    }
  },

  boss: {
    name: "Le Grand Stratège",
    description: "Un boss redoutable qui teste votre maîtrise des stratégies avancées !",
    difficulty: 5,
    rewards: {
      xp: 900,
      badge: "Maître du Chapitre 6",
      title: "Champion des Stratégies"
    }
  }
};