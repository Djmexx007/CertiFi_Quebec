import { Chapter } from '@/types/chapter';

export const chapter4: Chapter = {
  id: 'investment-ch4',
  title: 'Les Actions',
  summary: `
    🎮 Agent, bienvenue dans l'arène des Actions !

    Votre mission : maîtriser l'art de l'investissement en actions.

    Dans ce chapitre, vous explorerez :
    - Les secrets de la propriété d'entreprise 🏢
    - L'art du rendement potentiel 📈
    - La magie des dividendes 💰
    - Le pouvoir de la patience investisseur 🎯

    Souvenez-vous : Les actions, c'est comme parier sur l'avenir des entreprises ! 
  `,
  
  quiz: [
    {
      question: "Qu'est-ce qu'une action ?",
      choices: [
        {
          text: "Une part de propriété dans une entreprise",
          correct: true,
          explanation: "Posséder une action vous rend copropriétaire de l'entreprise."
        },
        {
          text: "Un ticket de loterie boursière",
          correct: false,
          explanation: "Les actions sont des investissements sérieux, pas des jeux de hasard !"
        },
        {
          text: "Un bon pour un café gratuit",
          correct: false,
          explanation: "Les actions représentent une propriété réelle, pas des coupons !"
        },
        {
          text: "Une carte collector d'entreprise",
          correct: false,
          explanation: "Les actions sont des titres de propriété, pas des objets de collection !"
        }
      ]
    },
    {
      question: "Quels sont les principaux avantages des actions ?",
      choices: [
        {
          text: "Potentiel de rendement élevé et dividendes possibles",
          correct: true,
          explanation: "Les actions peuvent offrir croissance et revenus réguliers."
        },
        {
          text: "Garantie de ne jamais perdre",
          correct: false,
          explanation: "Les actions comportent toujours un risque de perte !"
        },
        {
          text: "Invitation aux fêtes d'entreprise",
          correct: false,
          explanation: "La propriété d'actions ne donne pas d'avantages sociaux !"
        },
        {
          text: "Café gratuit à vie",
          correct: false,
          explanation: "Les avantages sont financiers, pas en nature !"
        }
      ]
    },
    {
      question: "Pourquoi les actions sont-elles plus risquées ?",
      choices: [
        {
          text: "Leur valeur fluctue selon les performances et le marché",
          correct: true,
          explanation: "La volatilité est le prix à payer pour un rendement potentiel plus élevé."
        },
        {
          text: "Les gestionnaires jouent aux dés",
          correct: false,
          explanation: "La gestion d'actions suit des analyses rigoureuses !"
        },
        {
          text: "L'astrologie boursière",
          correct: false,
          explanation: "Les marchés répondent à des facteurs économiques réels !"
        },
        {
          text: "La malédiction des marchés",
          correct: false,
          explanation: "Le risque est lié à des facteurs mesurables, pas à la chance !"
        }
      ]
    }
  ],

  minigame: {
    type: 'stock-master',
    title: "Le Maître des Actions",
    description: `
      🎮 Devenez le Maître des Actions dans ce mini-jeu stratégique !
      
      Votre mission :
      - Gérez un portefeuille d'actions
      - Analysez les opportunités
      - Équilibrez risque et rendement
      - Maximisez les gains à long terme
      
      Attention aux fluctuations du marché et aux émotions !
    `,
    rewards: {
      xp: 350,
      badge: "Maître des Actions",
      title: "Gardien des Marchés"
    }
  },

  boss: {
    name: "Le Baron de la Bourse",
    description: "Un boss redoutable qui teste votre maîtrise des marchés d'actions !",
    difficulty: 4,
    rewards: {
      xp: 800,
      badge: "Maître du Chapitre 4",
      title: "Champion des Actions"
    }
  }
};