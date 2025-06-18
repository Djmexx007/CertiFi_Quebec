import { Chapter } from '@/types/chapter';

export const chapter2: Chapter = {
  id: 'legal-framework-ch2',
  title: 'Particularités Juridiques des Contrats d\'Assurance',
  summary: `
    🎮 Agent, bienvenue dans le monde des contrats d'assurance !

    Votre mission : maîtriser les subtilités juridiques des contrats d'assurance.

    Dans ce chapitre, vous explorerez :
    - Les secrets des contrats d'assurance 📜
    - L'art des intervenants au contrat ⚖️
    - La magie des garanties et exclusions ✨
    - Le pouvoir des obligations contractuelles 🤝

    Souvenez-vous : Un contrat bien compris est un client bien protégé ! 
  `,
  
  quiz: [
    {
      question: "Quels sont les éléments essentiels d'un contrat d'assurance ?",
      choices: [
        {
          text: "Le risque, la prime et la prestation",
          correct: true,
          explanation: "Ces trois éléments sont fondamentaux pour la validité du contrat."
        },
        {
          text: "La couleur du papier",
          correct: false,
          explanation: "L'apparence du contrat n'a pas d'importance juridique !"
        },
        {
          text: "Le nombre de pages",
          correct: false,
          explanation: "La longueur du contrat n'est pas un élément essentiel !"
        },
        {
          text: "La taille de la police de caractères",
          correct: false,
          explanation: "Le format n'est pas un élément juridique essentiel !"
        }
      ]
    },
    {
      question: "Qui sont les principaux intervenants dans un contrat d'assurance ?",
      choices: [
        {
          text: "L'assureur, le preneur, l'assuré et le bénéficiaire",
          correct: true,
          explanation: "Chaque intervenant a un rôle spécifique dans le contrat."
        },
        {
          text: "Le facteur et le concierge",
          correct: false,
          explanation: "Ces personnes ne sont pas des intervenants au contrat !"
        },
        {
          text: "Les voisins",
          correct: false,
          explanation: "Les voisins n'ont aucun rôle dans le contrat d'assurance !"
        },
        {
          text: "Le livreur de pizza",
          correct: false,
          explanation: "La livraison de nourriture n'a rien à voir avec l'assurance !"
        }
      ]
    },
    {
      question: "Quelle est l'importance de la désignation de bénéficiaire ?",
      choices: [
        {
          text: "Elle détermine qui recevra la prestation et offre une protection contre les créanciers",
          correct: true,
          explanation: "La désignation a des implications juridiques et fiscales importantes."
        },
        {
          text: "Elle donne droit à un cadeau",
          correct: false,
          explanation: "La désignation a un but juridique, pas promotionnel !"
        },
        {
          text: "Elle permet de gagner des points",
          correct: false,
          explanation: "Ce n'est pas un programme de fidélité !"
        },
        {
          text: "Elle décore le contrat",
          correct: false,
          explanation: "La désignation a une fonction légale, pas esthétique !"
        }
      ]
    }
  ],

  minigame: {
    type: 'contract-master',
    title: "Le Maître des Contrats",
    description: `
      🎮 Devenez le Maître des Contrats dans ce mini-jeu juridique !
      
      Votre mission :
      - Identifiez les éléments essentiels
      - Gérez les intervenants
      - Rédigez les désignations
      - Protégez les droits des parties
      
      Attention aux clauses complexes et aux obligations légales !
    `,
    rewards: {
      xp: 250,
      badge: "Maître des Contrats",
      title: "Gardien des Ententes"
    }
  },

  boss: {
    name: "L'Architecte des Contrats",
    description: "Un boss redoutable qui teste votre maîtrise des contrats d'assurance !",
    difficulty: 4,
    rewards: {
      xp: 600,
      badge: "Maître du Chapitre 2",
      title: "Champion des Contrats"
    }
  }
};