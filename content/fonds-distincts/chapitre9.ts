import { Chapter } from '@/types/chapter';

export const chapter9: Chapter = {
  id: 'investment-ch9',
  title: 'Recommandation en Fonds Distincts et Rentes',
  summary: `
    🎮 Agent, bienvenue au Centre des Recommandations !

    Votre mission : maîtriser l'art de recommander les bons produits aux bons clients.

    Dans ce chapitre, vous explorerez :
    - Les secrets de l'analyse des besoins 🎯
    - L'art de la sélection des fonds 📊
    - La magie des garanties optimales ✨
    - Le pouvoir des rentes adaptées 💫

    Souvenez-vous : Une bonne recommandation change une vie ! 
  `,
  
  quiz: [
    {
      question: "Sur quoi baser une recommandation de fonds distincts ?",
      choices: [
        {
          text: "Les objectifs, le profil de risque et les besoins de garanties du client",
          correct: true,
          explanation: "Une recommandation doit être parfaitement adaptée au client."
        },
        {
          text: "Le fonds qui a le plus beau logo",
          correct: false,
          explanation: "L'apparence n'est pas un critère de recommandation !"
        },
        {
          text: "Le dernier fonds à la mode",
          correct: false,
          explanation: "Les tendances ne déterminent pas la pertinence !"
        },
        {
          text: "Le fonds préféré du conseiller",
          correct: false,
          explanation: "Les préférences personnelles ne guident pas les recommandations !"
        }
      ]
    },
    {
      question: "Comment choisir le bon type de rente ?",
      choices: [
        {
          text: "En fonction des besoins de revenu, de l'inflation et de la protection désirée",
          correct: true,
          explanation: "Le choix doit répondre précisément aux besoins du client."
        },
        {
          text: "En tirant à pile ou face",
          correct: false,
          explanation: "Le hasard n'a pas sa place dans les recommandations !"
        },
        {
          text: "En choisissant le nom le plus cool",
          correct: false,
          explanation: "Le nom n'est pas un critère de sélection !"
        },
        {
          text: "En suivant son intuition",
          correct: false,
          explanation: "Les recommandations doivent être objectives et réfléchies !"
        }
      ]
    },
    {
      question: "Pourquoi documenter ses recommandations ?",
      choices: [
        {
          text: "Pour justifier les choix et protéger le client et le conseiller",
          correct: true,
          explanation: "La documentation assure le suivi et la conformité."
        },
        {
          text: "Pour gagner un prix d'écriture",
          correct: false,
          explanation: "La documentation sert à la protection, pas à la créativité !"
        },
        {
          text: "Pour remplir son quota de papier",
          correct: false,
          explanation: "La documentation a un but précis, pas bureaucratique !"
        },
        {
          text: "Pour impressionner le patron",
          correct: false,
          explanation: "La documentation protège les parties, elle n'est pas pour l'impression !"
        }
      ]
    }
  ],

  minigame: {
    type: 'recommendation-master',
    title: "Le Maître des Recommandations",
    description: `
      🎮 Devenez le Maître des Recommandations dans ce mini-jeu stratégique !
      
      Votre mission :
      - Analysez les besoins des clients
      - Sélectionnez les meilleurs produits
      - Optimisez les garanties
      - Documentez vos recommandations
      
      Attention aux objectifs contradictoires et aux contraintes multiples !
    `,
    rewards: {
      xp: 600,
      badge: "Maître Conseiller",
      title: "Expert des Solutions"
    }
  },

  boss: {
    name: "L'Architecte des Solutions",
    description: "Un boss redoutable qui teste votre capacité à créer des recommandations parfaites !",
    difficulty: 5,
    rewards: {
      xp: 1200,
      badge: "Maître du Chapitre 9",
      title: "Champion des Recommandations"
    }
  }
};