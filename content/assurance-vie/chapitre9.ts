import { Chapter } from '@/types/chapter';

export const chapter9: Chapter = {
  id: 'life-insurance-ch9',
  title: 'Proposition et Évaluation des Risques',
  summary: `
    🎮 Agent, bienvenue au Bureau d'Évaluation des Risques !

    Votre mission : maîtriser l'art complexe de la proposition d'assurance et de l'évaluation des risques.

    Dans ce chapitre, vous explorerez :
    - Les secrets de la proposition d'assurance 📝
    - L'art de l'évaluation des risques 🔍
    - La magie de la tarification 💰
    - Le pouvoir de la sélection des risques ⚖️

    Souvenez-vous : Une bonne évaluation est la clé d'une protection optimale ! 
  `,
  
  quiz: [
    {
      question: "Pourquoi la proposition d'assurance est-elle si importante ?",
      choices: [
        {
          text: "C'est un document légal qui sert de base au contrat d'assurance",
          correct: true,
          explanation: "La proposition est le fondement du contrat et toute erreur peut avoir des conséquences graves."
        },
        {
          text: "Pour avoir un joli document à encadrer",
          correct: false,
          explanation: "La proposition est un document légal important, pas une décoration !"
        },
        {
          text: "Pour faire travailler les imprimeurs",
          correct: false,
          explanation: "La proposition sert à établir le contrat, pas à créer du travail !"
        },
        {
          text: "Pour tester la patience du client",
          correct: false,
          explanation: "La proposition est un outil essentiel, pas un test de patience !"
        }
      ]
    },
    {
      question: "Quels sont les facteurs clés dans l'évaluation du risque ?",
      choices: [
        {
          text: "L'état de santé, la profession et les habitudes de vie",
          correct: true,
          explanation: "Ces facteurs permettent d'évaluer précisément le risque à assurer."
        },
        {
          text: "La couleur préférée du client",
          correct: false,
          explanation: "Les préférences personnelles n'ont aucun impact sur le risque !"
        },
        {
          text: "Le nombre de likes sur Instagram",
          correct: false,
          explanation: "Les réseaux sociaux ne sont pas des critères d'évaluation du risque !"
        },
        {
          text: "La marque de sa voiture",
          correct: false,
          explanation: "Le type de véhicule n'influence pas l'assurance vie !"
        }
      ]
    },
    {
      question: "Que signifie une 'surprime' en assurance ?",
      choices: [
        {
          text: "Une prime plus élevée due à un risque accru",
          correct: true,
          explanation: "La surprime compense un risque plus important que la moyenne."
        },
        {
          text: "Un cadeau surprise avec la police",
          correct: false,
          explanation: "La surprime est un ajustement de coût, pas un cadeau !"
        },
        {
          text: "Une prime qui arrive en retard",
          correct: false,
          explanation: "La surprime est liée au risque, pas au timing du paiement !"
        },
        {
          text: "Une prime qui fait des pirouettes",
          correct: false,
          explanation: "La surprime est un concept sérieux d'évaluation du risque !"
        }
      ]
    }
  ],

  minigame: {
    type: 'risk-assessor',
    title: "L'Évaluateur de Risques",
    description: `
      🎮 Devenez l'Évaluateur de Risques dans ce mini-jeu stratégique !
      
      Votre mission :
      - Analysez les propositions d'assurance
      - Évaluez les facteurs de risque
      - Déterminez les primes appropriées
      - Gérez les cas spéciaux
      
      Attention aux déclarations inexactes et aux risques cachés !
    `,
    rewards: {
      xp: 700,
      badge: "Maître de l'Évaluation",
      title: "Expert des Risques"
    }
  },

  boss: {
    name: "Le Souscripteur Suprême",
    description: "Un boss redoutable qui teste votre maîtrise de l'évaluation des risques !",
    difficulty: 5,
    rewards: {
      xp: 1200,
      badge: "Maître du Chapitre 9",
      title: "Champion de la Souscription"
    }
  }
};