import { Chapter } from '@/types/chapter';

export const chapter4: Chapter = {
  id: 'legal-framework-ch4',
  title: 'Règles Relatives à l\'Activité de Représentant',
  summary: `
    🎮 Agent, bienvenue au Bureau de la Conformité !

    Votre mission : maîtriser les règles qui encadrent notre profession.

    Dans ce chapitre, vous explorerez :
    - Les secrets des organismes de protection 🛡️
    - L'art de la conformité réglementaire ⚖️
    - La magie de la déontologie ✨
    - Le pouvoir des obligations professionnelles 📜

    Souvenez-vous : Un bon représentant est d'abord un professionnel conforme ! 
  `,
  
  quiz: [
    {
      question: "Quel est le rôle de l'AMF ?",
      choices: [
        {
          text: "Réglementer et surveiller le secteur financier au Québec",
          correct: true,
          explanation: "L'AMF est l'organisme principal de régulation financière."
        },
        {
          text: "Organiser des fêtes d'assurance",
          correct: false,
          explanation: "L'AMF a un rôle réglementaire sérieux !"
        },
        {
          text: "Distribuer des prix aux meilleurs vendeurs",
          correct: false,
          explanation: "L'AMF n'est pas un organisme de promotion !"
        },
        {
          text: "Décorer les bureaux d'assurance",
          correct: false,
          explanation: "L'AMF a des responsabilités réglementaires, pas décoratives !"
        }
      ]
    },
    {
      question: "Quelles sont les principales obligations d'un représentant ?",
      choices: [
        {
          text: "Agir avec compétence, intégrité et protéger les intérêts du client",
          correct: true,
          explanation: "Ces obligations sont fondamentales pour la profession."
        },
        {
          text: "Porter un costume cravate",
          correct: false,
          explanation: "L'apparence n'est pas une obligation légale !"
        },
        {
          text: "Avoir un beau sourire",
          correct: false,
          explanation: "Les qualités physiques ne sont pas des obligations professionnelles !"
        },
        {
          text: "Connaître toutes les blagues d'assurance",
          correct: false,
          explanation: "L'humour n'est pas une exigence professionnelle !"
        }
      ]
    },
    {
      question: "Que risque un représentant qui ne respecte pas ses obligations ?",
      choices: [
        {
          text: "Des sanctions disciplinaires, civiles ou pénales",
          correct: true,
          explanation: "Les manquements professionnels ont des conséquences sérieuses."
        },
        {
          text: "Une diminution de son allocation café",
          correct: false,
          explanation: "Les sanctions sont professionnelles, pas des privilèges de bureau !"
        },
        {
          text: "L'obligation de porter un chapeau de dunce",
          correct: false,
          explanation: "Les sanctions sont légales, pas humiliantes !"
        },
        {
          text: "L'interdiction de raconter des blagues",
          correct: false,
          explanation: "Les sanctions affectent l'exercice professionnel !"
        }
      ]
    }
  ],

  minigame: {
    type: 'compliance-master',
    title: "Le Maître de la Conformité",
    description: `
      🎮 Devenez le Maître de la Conformité dans ce mini-jeu réglementaire !
      
      Votre mission :
      - Respectez les règles professionnelles
      - Gérez les obligations légales
      - Protégez les clients
      - Maintenez votre conformité
      
      Attention aux exigences réglementaires et aux responsabilités professionnelles !
    `,
    rewards: {
      xp: 350,
      badge: "Maître de la Conformité",
      title: "Gardien des Règles"
    }
  },

  boss: {
    name: "Le Régulateur Suprême",
    description: "Un boss redoutable qui teste votre maîtrise des règles professionnelles !",
    difficulty: 4,
    rewards: {
      xp: 800,
      badge: "Maître du Chapitre 4",
      title: "Champion de la Conformité"
    }
  }
};