import { Chapter } from '@/types/chapter';

export const chapter3: Chapter = {
  id: 'investment-ch3',
  title: 'Les Rentes',
  summary: `
    🎮 Agent, bienvenue dans le monde des Rentes !

    Votre mission : maîtriser l'art de transformer un capital en revenu garanti.

    Dans ce chapitre, vous explorerez :
    - Les secrets des différents types de rentes 💰
    - L'art de la sécurité financière 🛡️
    - La magie des versements garantis ✨
    - Le pouvoir de la planification de retraite 🎯

    Souvenez-vous : Une rente bien choisie, c'est la tranquillité d'esprit assurée ! 
  `,
  
  quiz: [
    {
      question: "Quelle est la principale caractéristique d'une rente ?",
      choices: [
        {
          text: "Elle transforme un capital en revenu régulier garanti",
          correct: true,
          explanation: "C'est l'essence même d'une rente : la sécurité d'un revenu stable."
        },
        {
          text: "Elle imprime de l'argent magique",
          correct: false,
          explanation: "Les rentes utilisent un capital existant, elles ne créent pas d'argent !"
        },
        {
          text: "Elle fait pousser des billets",
          correct: false,
          explanation: "Les rentes gèrent l'argent de façon structurée, pas magique !"
        },
        {
          text: "Elle donne des super-pouvoirs financiers",
          correct: false,
          explanation: "Les rentes offrent de la sécurité, pas des pouvoirs surnaturels !"
        }
      ]
    },
    {
      question: "Quelle est la différence entre une rente viagère et une rente certaine ?",
      choices: [
        {
          text: "La viagère est versée à vie, la certaine pour une durée déterminée",
          correct: true,
          explanation: "Cette différence fondamentale détermine la durée des versements."
        },
        {
          text: "L'une est plus jolie que l'autre",
          correct: false,
          explanation: "L'apparence n'a rien à voir avec le type de rente !"
        },
        {
          text: "L'une parle français, l'autre anglais",
          correct: false,
          explanation: "La langue n'a aucun impact sur le fonctionnement de la rente !"
        },
        {
          text: "L'une aime le café, l'autre le thé",
          correct: false,
          explanation: "Les préférences n'ont rien à voir avec les caractéristiques des rentes !"
        }
      ]
    },
    {
      question: "Pourquoi choisir une rente indexée ?",
      choices: [
        {
          text: "Pour protéger son pouvoir d'achat contre l'inflation",
          correct: true,
          explanation: "L'indexation permet de maintenir la valeur réelle des versements."
        },
        {
          text: "Pour impressionner ses voisins",
          correct: false,
          explanation: "L'indexation sert à protéger votre argent, pas votre statut social !"
        },
        {
          text: "Pour avoir un plus gros contrat",
          correct: false,
          explanation: "La taille du contrat n'est pas le but de l'indexation !"
        },
        {
          text: "Pour faire des maths plus compliquées",
          correct: false,
          explanation: "L'indexation a un but pratique, pas académique !"
        }
      ]
    }
  ],

  minigame: {
    type: 'annuity-master',
    title: "Le Maître des Rentes",
    description: `
      🎮 Devenez le Maître des Rentes dans ce mini-jeu stratégique !
      
      Votre mission :
      - Gérez différents types de rentes
      - Optimisez les versements
      - Équilibrez garanties et flexibilité
      - Maximisez la sécurité financière
      
      Attention aux besoins changeants et à l'inflation !
    `,
    rewards: {
      xp: 300,
      badge: "Maître des Rentes",
      title: "Gardien des Revenus"
    }
  },

  boss: {
    name: "L'Architecte des Rentes",
    description: "Un boss redoutable qui teste votre maîtrise des différents types de rentes !",
    difficulty: 4,
    rewards: {
      xp: 700,
      badge: "Maître du Chapitre 3",
      title: "Champion des Rentes"
    }
  }
};