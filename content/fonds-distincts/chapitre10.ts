import { Chapter } from '@/types/chapter';

export const chapter10: Chapter = {
  id: 'investment-ch10',
  title: 'Processus de Réclamation et Suivi',
  summary: `
    🎮 Agent, bienvenue au Centre des Réclamations !

    Votre mission : maîtriser l'art du traitement des réclamations et du suivi des contrats.

    Dans ce chapitre, vous explorerez :
    - Les secrets du processus de réclamation 📝
    - L'art du suivi des contrats 🔄
    - La magie des modifications contractuelles ✨
    - Le pouvoir du service continu 💫

    Souvenez-vous : Une réclamation bien gérée est un client satisfait ! 
  `,
  
  quiz: [
    {
      question: "Quels sont les types principaux de réclamations ?",
      choices: [
        {
          text: "Réclamations à l'échéance et au décès",
          correct: true,
          explanation: "Ces deux types de réclamations sont les plus courants en assurance."
        },
        {
          text: "Réclamations pour mauvais temps",
          correct: false,
          explanation: "Les conditions météorologiques ne sont pas un motif de réclamation !"
        },
        {
          text: "Réclamations pour café froid",
          correct: false,
          explanation: "Les réclamations concernent les garanties du contrat, pas les boissons !"
        },
        {
          text: "Réclamations pour manque de chance",
          correct: false,
          explanation: "La chance n'est pas un facteur dans les réclamations d'assurance !"
        }
      ]
    },
    {
      question: "Pourquoi le suivi des contrats est-il important ?",
      choices: [
        {
          text: "Pour s'assurer que les contrats répondent toujours aux besoins des clients",
          correct: true,
          explanation: "Le suivi permet d'adapter les contrats aux changements de situation."
        },
        {
          text: "Pour avoir plus de réunions",
          correct: false,
          explanation: "Le suivi sert à protéger le client, pas à remplir l'agenda !"
        },
        {
          text: "Pour utiliser plus de papier",
          correct: false,
          explanation: "Le suivi a un but précis, pas bureaucratique !"
        },
        {
          text: "Pour faire plaisir au patron",
          correct: false,
          explanation: "Le suivi sert les intérêts du client, pas ceux de la hiérarchie !"
        }
      ]
    },
    {
      question: "Quand faut-il modifier un contrat ?",
      choices: [
        {
          text: "Lors de changements significatifs dans la situation du client",
          correct: true,
          explanation: "Les modifications doivent refléter l'évolution des besoins du client."
        },
        {
          text: "Quand on s'ennuie",
          correct: false,
          explanation: "Les modifications doivent être justifiées par des besoins réels !"
        },
        {
          text: "Pour battre un record",
          correct: false,
          explanation: "Les modifications servent un but précis, pas des records !"
        },
        {
          text: "Quand la lune est pleine",
          correct: false,
          explanation: "Les modifications suivent les besoins, pas les phases lunaires !"
        }
      ]
    }
  ],

  minigame: {
    type: 'claims-master',
    title: "Le Maître des Réclamations",
    description: `
      🎮 Devenez le Maître des Réclamations dans ce mini-jeu stratégique !
      
      Votre mission :
      - Traitez les réclamations efficacement
      - Gérez les suivis de contrats
      - Effectuez les modifications nécessaires
      - Optimisez le service client
      
      Attention aux délais et aux documents manquants !
    `,
    rewards: {
      xp: 650,
      badge: "Maître des Réclamations",
      title: "Expert du Service"
    }
  },

  boss: {
    name: "Le Gardien des Contrats",
    description: "Un boss redoutable qui teste votre maîtrise du processus de réclamation !",
    difficulty: 5,
    rewards: {
      xp: 1300,
      badge: "Maître du Chapitre 10",
      title: "Champion des Réclamations"
    }
  }
};