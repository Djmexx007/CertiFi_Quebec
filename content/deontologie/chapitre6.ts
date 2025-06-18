import { Chapter } from '@/types/chapter';

export const chapter6: Chapter = {
  id: 'legal-framework-ch6',
  title: 'Assurances Collectives et Obligations',
  summary: `
    🎮 Agent, bienvenue au Centre des Assurances Collectives !

    Votre mission : maîtriser les particularités des contrats collectifs.

    Dans ce chapitre, vous explorerez :
    - Les secrets des régimes collectifs 👥
    - L'art de l'adhésion et des protections 🛡️
    - La magie des droits des adhérents ✨
    - Le pouvoir de la terminaison des contrats ⚖️

    Souvenez-vous : Un régime collectif bien géré est un groupe bien protégé ! 
  `,
  
  quiz: [
    {
      question: "Quels sont les avantages principaux de l'assurance collective ?",
      choices: [
        {
          text: "Coût réduit et administration simplifiée pour un groupe",
          correct: true,
          explanation: "L'assurance collective offre des économies d'échelle importantes."
        },
        {
          text: "Des fêtes d'entreprise gratuites",
          correct: false,
          explanation: "Les avantages sont financiers et administratifs, pas sociaux !"
        },
        {
          text: "Un t-shirt d'équipe",
          correct: false,
          explanation: "Les avantages sont liés à la protection, pas aux cadeaux !"
        },
        {
          text: "Des points de fidélité",
          correct: false,
          explanation: "L'assurance collective n'est pas un programme de récompenses !"
        }
      ]
    },
    {
      question: "Que se passe-t-il en cas de résiliation du contrat collectif ?",
      choices: [
        {
          text: "Les adhérents ont des droits de transformation et de prolongation",
          correct: true,
          explanation: "La loi protège les droits des adhérents lors de la terminaison."
        },
        {
          text: "Tout le monde fait la fête",
          correct: false,
          explanation: "La résiliation est une situation sérieuse qui nécessite attention !"
        },
        {
          text: "On organise un concours",
          correct: false,
          explanation: "La résiliation implique des droits et obligations spécifiques !"
        },
        {
          text: "On tire au sort un gagnant",
          correct: false,
          explanation: "Les droits sont égaux pour tous les adhérents admissibles !"
        }
      ]
    },
    {
      question: "Quelles sont les obligations du preneur d'un contrat collectif ?",
      choices: [
        {
          text: "Informer les adhérents et administrer le régime équitablement",
          correct: true,
          explanation: "Le preneur a des responsabilités importantes envers les adhérents."
        },
        {
          text: "Organiser des activités d'équipe",
          correct: false,
          explanation: "Les obligations sont administratives et légales !"
        },
        {
          text: "Distribuer des cadeaux",
          correct: false,
          explanation: "Les obligations concernent la gestion du régime !"
        },
        {
          text: "Faire des blagues au bureau",
          correct: false,
          explanation: "Les obligations sont professionnelles et sérieuses !"
        }
      ]
    }
  ],

  minigame: {
    type: 'collective-master',
    title: "Le Maître du Collectif",
    description: `
      🎮 Devenez le Maître du Collectif dans ce mini-jeu stratégique !
      
      Votre mission :
      - Gérez les adhésions
      - Administrez les protections
      - Protégez les droits des adhérents
      - Gérez les résiliations
      
      Attention aux obligations légales et aux droits des adhérents !
    `,
    rewards: {
      xp: 450,
      badge: "Maître du Collectif",
      title: "Gardien des Groupes"
    }
  },

  boss: {
    name: "L'Administrateur Suprême",
    description: "Un boss redoutable qui teste votre maîtrise des assurances collectives !",
    difficulty: 4,
    rewards: {
      xp: 1000,
      badge: "Maître du Chapitre 6",
      title: "Champion du Collectif"
    }
  }
};