import { Chapter } from '@/types/chapter';

export const chapter3: Chapter = {
  id: 'legal-framework-ch3',
  title: 'Contrats de Rentes Individuelles et Collectives',
  summary: `
    🎮 Agent, bienvenue dans l'univers des rentes !

    Votre mission : maîtriser les aspects juridiques des contrats de rente.

    Dans ce chapitre, vous explorerez :
    - Les secrets des rentes individuelles 💰
    - L'art des rentes collectives 👥
    - La magie des garanties de rente ✨
    - Le pouvoir de la planification successorale ⚖️

    Souvenez-vous : Une rente bien structurée est un revenu assuré ! 
  `,
  
  quiz: [
    {
      question: "Quelle est la nature juridique d'un contrat de rente ?",
      choices: [
        {
          text: "Un contrat qui transforme un capital en revenu garanti",
          correct: true,
          explanation: "C'est l'essence même du contrat de rente."
        },
        {
          text: "Un contrat pour devenir riche rapidement",
          correct: false,
          explanation: "Les rentes sont des outils de revenu, pas de spéculation !"
        },
        {
          text: "Un contrat magique",
          correct: false,
          explanation: "Les rentes suivent des règles juridiques précises !"
        },
        {
          text: "Un contrat pour gagner à la loterie",
          correct: false,
          explanation: "Les rentes ne sont pas des jeux de hasard !"
        }
      ]
    },
    {
      question: "Quelle est la différence entre une rente individuelle et collective ?",
      choices: [
        {
          text: "La rente individuelle est personnalisée, la collective couvre un groupe",
          correct: true,
          explanation: "Cette distinction affecte les conditions et la tarification."
        },
        {
          text: "L'une est plus grande que l'autre",
          correct: false,
          explanation: "La taille du contrat n'est pas pertinente !"
        },
        {
          text: "L'une est en couleur, l'autre en noir et blanc",
          correct: false,
          explanation: "L'apparence n'a rien à voir avec le type de rente !"
        },
        {
          text: "L'une sent meilleur que l'autre",
          correct: false,
          explanation: "Les caractéristiques physiques ne sont pas pertinentes !"
        }
      ]
    },
    {
      question: "Pourquoi choisir une rente réversible ?",
      choices: [
        {
          text: "Pour protéger le conjoint survivant en lui assurant un revenu continu",
          correct: true,
          explanation: "La réversibilité offre une protection familiale importante."
        },
        {
          text: "Pour avoir un plus gros contrat",
          correct: false,
          explanation: "La taille du contrat n'est pas le but de la réversibilité !"
        },
        {
          text: "Pour impressionner ses amis",
          correct: false,
          explanation: "La réversibilité sert à protéger, pas à impressionner !"
        },
        {
          text: "Pour le plaisir de dire 'réversible'",
          correct: false,
          explanation: "Le terme technique a un sens juridique précis !"
        }
      ]
    }
  ],

  minigame: {
    type: 'annuity-master',
    title: "Le Maître des Rentes",
    description: `
      🎮 Devenez le Maître des Rentes dans ce mini-jeu juridique !
      
      Votre mission :
      - Structurez les contrats de rente
      - Gérez les garanties
      - Optimisez la protection
      - Planifiez la succession
      
      Attention aux conditions particulières et aux besoins des clients !
    `,
    rewards: {
      xp: 300,
      badge: "Maître des Rentes",
      title: "Gardien des Revenus"
    }
  },

  boss: {
    name: "Le Sage des Rentes",
    description: "Un boss redoutable qui teste votre maîtrise des contrats de rente !",
    difficulty: 4,
    rewards: {
      xp: 700,
      badge: "Maître du Chapitre 3",
      title: "Champion des Rentes"
    }
  }
};