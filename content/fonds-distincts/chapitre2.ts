import { Chapter } from '@/types/chapter';

export const chapter2: Chapter = {
  id: 'investment-ch2',
  title: 'Les Fonds Distincts',
  summary: `
    🎮 Agent, bienvenue dans l'univers des Fonds Distincts !

    Votre mission : maîtriser l'art de combiner placement et protection d'assurance.

    Dans ce chapitre, vous explorerez :
    - Les secrets des garanties à l'échéance 🛡️
    - L'art de la protection successorale ⚔️
    - La magie des réinitialisations ✨
    - Le pouvoir de la protection contre les créanciers 💪

    Souvenez-vous : Un fonds distinct, c'est un super-héros financier qui protège et fait fructifier votre argent ! 
  `,
  
  quiz: [
    {
      question: "Qu'est-ce qui distingue un fonds distinct d'un fonds commun de placement ?",
      choices: [
        {
          text: "Les garanties à l'échéance et au décès, ainsi que les avantages successoraux",
          correct: true,
          explanation: "Ces garanties uniques en font un produit d'assurance-placement hybride."
        },
        {
          text: "La couleur du logo",
          correct: false,
          explanation: "L'apparence n'a rien à voir avec les caractéristiques du produit !"
        },
        {
          text: "Le poids du contrat",
          correct: false,
          explanation: "Les aspects physiques ne sont pas pertinents !"
        },
        {
          text: "L'humeur du gestionnaire",
          correct: false,
          explanation: "La gestion suit des règles précises, pas des humeurs !"
        }
      ]
    },
    {
      question: "Quels sont les principaux avantages des fonds distincts ?",
      choices: [
        {
          text: "Garanties, protection contre les créanciers et avantages successoraux",
          correct: true,
          explanation: "Ces caractéristiques offrent une protection unique aux investisseurs."
        },
        {
          text: "Distribution de bonbons gratuits",
          correct: false,
          explanation: "Les avantages sont financiers et juridiques, pas en nature !"
        },
        {
          text: "Accès à un club VIP",
          correct: false,
          explanation: "Les avantages sont liés à la protection du capital, pas aux privilèges sociaux !"
        },
        {
          text: "Carte de membre spéciale",
          correct: false,
          explanation: "Les avantages sont concrets et financiers, pas symboliques !"
        }
      ]
    },
    {
      question: "Pourquoi les frais de gestion sont-ils plus élevés ?",
      choices: [
        {
          text: "Pour couvrir le coût des garanties et protections offertes",
          correct: true,
          explanation: "Les garanties et protections supplémentaires ont un coût."
        },
        {
          text: "Pour payer le café des gestionnaires",
          correct: false,
          explanation: "Les frais couvrent des garanties réelles, pas des dépenses de bureau !"
        },
        {
          text: "Pour financer des fêtes d'entreprise",
          correct: false,
          explanation: "Les frais sont liés aux garanties, pas aux événements sociaux !"
        },
        {
          text: "Pour avoir un plus beau bureau",
          correct: false,
          explanation: "Les frais servent à financer les protections, pas le mobilier !"
        }
      ]
    }
  ],

  minigame: {
    type: 'fund-master',
    title: "Le Maître des Fonds",
    description: `
      🎮 Devenez le Maître des Fonds dans ce mini-jeu stratégique !
      
      Votre mission :
      - Gérez différents types de fonds
      - Optimisez les garanties
      - Équilibrez rendement et protection
      - Maximisez les avantages successoraux
      
      Attention aux marchés volatils et aux besoins de liquidité !
    `,
    rewards: {
      xp: 250,
      badge: "Maître des Fonds",
      title: "Gardien des Garanties"
    }
  },

  boss: {
    name: "Le Protecteur Suprême",
    description: "Un boss redoutable qui teste votre maîtrise des fonds distincts !",
    difficulty: 4,
    rewards: {
      xp: 600,
      badge: "Maître du Chapitre 2",
      title: "Champion des Fonds Distincts"
    }
  }
};