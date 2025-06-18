import { Chapter } from '@/types/chapter';

export const chapter6: Chapter = {
  id: 'health-insurance-ch6',
  title: 'CPG, Comptes d’Épargne et Assurance',
  summary: `
    🏦 Bienvenue dans le coffre-fort de l’assurance !

    Dans ce chapitre, vous découvrirez comment les produits de dépôt s’intègrent à la planification en assurance maladie :
    - Les rôles du CPG, du CELI, du REER et du compte non enregistré 💼
    - Leurs impacts sur l’accès aux prestations 🧾
    - Les avantages fiscaux et pièges à éviter ⚠️

    Préparez vos neurones… et vos calculettes ! 🧠📊
  `,

  quiz: [
    {
      question: "💡 Pourquoi est-il important de connaître les actifs détenus dans un CELI lors d'une demande de prestation d'assurance maladie ?",
      choices: [
        {
          text: "Parce que les revenus du CELI sont imposables",
          correct: false,
          explanation: "Les revenus du CELI ne sont pas imposables, mais ils peuvent influencer l’admissibilité à certaines prestations si mal utilisés."
        },
        {
          text: "Parce qu’ils peuvent être utilisés pour démontrer un besoin financier",
          correct: false,
          explanation: "Le CELI ne démontre pas nécessairement un besoin, mais sa structure a un impact sur les calculs."
        },
        {
          text: "Parce que les retraits du CELI n’ont pas d’impact fiscal et peuvent être utilisés librement",
          correct: true,
          explanation: "Exact. Les retraits du CELI ne créent pas de revenu imposable, donc ne nuisent pas aux prestations."
        },
        {
          text: "Parce qu’un CELI est illégal à utiliser en assurance",
          correct: false,
          explanation: "Le CELI est tout à fait légal et courant."
        }
      ]
    },
    {
      question: "📉 Quel est l'effet d’un revenu élevé généré par des placements non enregistrés sur une demande d'assurance maladie ?",
      choices: [
        {
          text: "Il améliore les chances d’obtenir plus de prestations",
          correct: false,
          explanation: "Un revenu élevé peut réduire ou éliminer l’admissibilité à certaines prestations."
        },
        {
          text: "Il est sans conséquence fiscale",
          correct: false,
          explanation: "Le revenu de placements non enregistrés est imposable."
        },
        {
          text: "Il peut compromettre l'admissibilité à certaines prestations gouvernementales",
          correct: true,
          explanation: "Exactement. Le revenu imposable peut nuire à l'accès à des programmes conditionnels."
        },
        {
          text: "Il permet de se qualifier pour une carte de crédit d’assurance",
          correct: false,
          explanation: "Une invention farfelue… mais non reconnue dans les manuels."
        }
      ]
    },
    {
      question: "📊 Quel produit est le plus adapté pour un client désirant préserver son admissibilité à des prestations en cas de maladie ?",
      choices: [
        {
          text: "Un compte non enregistré avec des actions à dividende",
          correct: false,
          explanation: "Ce compte génère du revenu imposable."
        },
        {
          text: "Un CELI bien structuré",
          correct: true,
          explanation: "C’est l’outil idéal : flexible, non imposable, sans effet sur les prestations."
        },
        {
          text: "Un REER utilisé pour des retraits rapides",
          correct: false,
          explanation: "Les retraits du REER sont imposables, ce qui peut nuire aux prestations."
        },
        {
          text: "Un compte de courtage spéculatif",
          correct: false,
          explanation: "Risque élevé et revenus imposables — ce n’est pas optimal."
        }
      ]
    }
  ],

  minigame: {
    type: 'asset-strategy',
    title: "💰 L’Arène des Actifs",
    description: `
      🎮 Déployez vos tactiques dans une simulation où chaque actif peut changer l’issue du scénario !

      Mission :
      - Choisir le bon type de compte (CELI, REER, etc.)
      - Minimiser l’impact fiscal
      - Maximiser la préservation des prestations

      Attention : les mauvaises décisions peuvent coûter cher !
    `,
    rewards: {
      xp: 400,
      badge: "Architecte Financier",
      title: "Maître des Actifs"
    }
  },

  boss: {
    name: "🧠 Le Stratège Fiscal",
    description: "Il vous teste sur la compatibilité entre fiscalité et admissibilité aux prestations. Une erreur ? Et vos actifs fondent comme neige au soleil !",
    difficulty: 4,
    quiz: [
      {
        question: "Pourquoi les retraits d’un REER doivent-ils être évités durant une période d’invalidité ?",
        choices: [
          {
            text: "Parce qu’ils déclenchent un impôt immédiat et peuvent affecter l’admissibilité aux prestations",
            correct: true,
            explanation: "Les retraits augmentent le revenu imposable, ce qui peut faire perdre des prestations."
          },
          {
            text: "Parce qu’ils sont automatiquement refusés par les assureurs",
            correct: false,
            explanation: "Non, mais ils peuvent nuire financièrement."
          },
          {
            text: "Parce qu’ils sont gelés jusqu’à la fin de l’invalidité",
            correct: false,
            explanation: "Ce n’est pas une restriction légale."
          },
          {
            text: "Parce qu’ils suppriment les primes d’assurance",
            correct: false,
            explanation: "Les primes sont liées à la police, pas au compte."
          }
        ]
      },
      {
        question: "Quel produit permet de générer des revenus à l’abri de l’impôt sans affecter les prestations ?",
        choices: [
          {
            text: "REER",
            correct: false,
            explanation: "Les retraits du REER sont imposables."
          },
          {
            text: "CELI",
            correct: true,
            explanation: "Exact ! Les retraits ne comptent pas comme revenus imposables."
          },
          {
            text: "Compte non enregistré",
            correct: false,
            explanation: "Les revenus y sont imposables."
          },
          {
            text: "Compte à frais modérés",
            correct: false,
            explanation: "Ce type de compte n’est pas défini dans le contexte fiscal."
          }
        ]
      }
    ],
    rewards: {
      xp: 500,
      badge: "Conquérant des Comptes",
      title: "Stratège de la Préservation"
    }
  }
};