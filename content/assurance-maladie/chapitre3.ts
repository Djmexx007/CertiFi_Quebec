import { Chapter } from '@/types/chapter';

export const chapter3: Chapter = {
  id: 'health-insurance-ch3',
  title: 'Assurance offrant une protection des actifs',
  summary: `
    🛡️ Agent, bienvenue dans le domaine sacré de la préservation du patrimoine !

    Dans cette mission, vous apprendrez à :
    - Dompter les maladies graves sans sacrifier vos économies 🧠
    - Utiliser les bons outils pour survivre à la perte d’autonomie ⚙️
    - Préserver l’héritage contre les imprévus sanitaires 💰

    Accrochez-vous, les actifs de vos clients comptent sur vous !
  `,

  quiz: [
    {
      question: "💸 En cas de maladie grave, quel est l’objectif principal d’une assurance maladies graves ?",
      choices: [
        {
          text: "Fournir une somme forfaitaire libre d’utilisation pour protéger les actifs",
          correct: true,
          explanation: "La prestation reçue permet de couvrir les frais imprévus sans avoir à liquider les actifs du client."
        },
        {
          text: "Offrir un remboursement exact des frais médicaux",
          correct: false,
          explanation: "Ce rôle est réservé aux assurances maladie complémentaires."
        },
        {
          text: "Payer directement les spécialistes en oncologie",
          correct: false,
          explanation: "Les paiements ne vont pas à l’hôpital, mais bien au preneur."
        },
        {
          text: "Remplacer le revenu perdu de manière mensuelle",
          correct: false,
          explanation: "Ce rôle est celui de l’assurance invalidité."
        }
      ]
    },
    {
      question: "🏥 Quelle condition est requise pour qu’une prestation soit versée dans une assurance maladies graves ?",
      choices: [
        {
          text: "Survie au-delà du délai de survie stipulé dans le contrat",
          correct: true,
          explanation: "Le client doit survivre un nombre minimal de jours après le diagnostic, souvent 30 jours."
        },
        {
          text: "Hospitalisation dans un établissement reconnu",
          correct: false,
          explanation: "L’hospitalisation n’est pas toujours nécessaire, seul le diagnostic l’est."
        },
        {
          text: "Avoir consulté un deuxième médecin",
          correct: false,
          explanation: "Un seul diagnostic qualifié suffit, selon les termes du contrat."
        },
        {
          text: "Payer une franchise d’urgence",
          correct: false,
          explanation: "Il n’y a pas de franchise, le montant est forfaitaire."
        }
      ]
    },
    {
      question: "🧓 Quelle est la principale utilité d’une assurance soins de longue durée ?",
      choices: [
        {
          text: "Maintenir une qualité de vie sans devoir vendre ses biens",
          correct: true,
          explanation: "Elle protège le patrimoine du client tout en couvrant les coûts de soins liés à la perte d’autonomie."
        },
        {
          text: "Remplacer automatiquement toutes les prestations gouvernementales",
          correct: false,
          explanation: "Elle les complète, mais ne les remplace pas entièrement."
        },
        {
          text: "Couvrir uniquement les soins en établissement privé",
          correct: false,
          explanation: "Elle peut aussi couvrir les soins à domicile, selon le contrat."
        },
        {
          text: "Servir à diminuer les impôts sur le revenu",
          correct: false,
          explanation: "Ce n’est pas son objectif principal, même si certains effets fiscaux peuvent exister."
        }
      ]
    }
  ],

  minigame: {
    type: 'asset-protector',
    title: "🧠 Le Protecteur des Actifs",
    description: `
      🎮 Mission stratégique : défendre le patrimoine de vos clients !

      Vous devrez :
      - Gérer l’apparition de maladies graves et la perte d’autonomie
      - Répartir judicieusement les protections disponibles
      - Préserver les actifs familiaux coûte que coûte !

      Chaque mauvaise décision peut coûter un héritage...
    `,
    rewards: {
      xp: 400,
      badge: "Maître des Actifs",
      title: "Gardien du Patrimoine"
    }
  },

  boss: {
    name: "💼 Le Gardien du Trésor",
    description: "Il défend farouchement les actifs contre toute menace. Il ne cédera qu’aux plus fins stratèges de la protection financière.",
    difficulty: 4,
    quiz: [
      {
        question: "📉 Quel est le plus grand risque si un client non assuré fait face à une maladie grave ?",
        choices: [
          {
            text: "Épuiser ses économies ou devoir vendre des actifs pour payer les soins",
            correct: true,
            explanation: "Sans protection, il devra puiser dans ses ressources personnelles, mettant en péril son avenir financier."
          },
          {
            text: "Être refusé à l’hôpital",
            correct: false,
            explanation: "L’accès aux soins n’est pas conditionné à une assurance, mais les conséquences financières peuvent être lourdes."
          },
          {
            text: "Perdre automatiquement son emploi",
            correct: false,
            explanation: "Ce n’est pas une conséquence directe, même si cela peut survenir."
          },
          {
            text: "Être mal vu de ses proches",
            correct: false,
            explanation: "L’impact est surtout financier, pas relationnel."
          }
        ]
      },
      {
        question: "🔐 L’assurance maladies graves permet-elle de protéger un héritage ?",
        choices: [
          {
            text: "Oui, car elle évite de puiser dans les actifs familiaux pour couvrir les soins",
            correct: true,
            explanation: "Les prestations peuvent remplacer des retraits non planifiés du patrimoine."
          },
          {
            text: "Non, elle ne couvre que les frais funéraires",
            correct: false,
            explanation: "Elle vise à couvrir des dépenses bien plus larges."
          },
          {
            text: "Oui, mais uniquement dans les polices collectives",
            correct: false,
            explanation: "Elle est disponible aussi en couverture individuelle."
          },
          {
            text: "Non, car elle est imposable",
            correct: false,
            explanation: "En général, les prestations sont non imposables."
          }
        ]
      }
    ],
    rewards: {
      xp: 800,
      badge: "Maître du Chapitre 3",
      title: "Champion de la Préservation"
    }
  }
};