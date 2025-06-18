import { Chapter } from '@/types/chapter';

export const chapter5: Chapter = {
  id: 'health-insurance-ch5',
  title: 'Exploration des Obligations Contractuelles',
  summary: `
    📜 Bienvenue dans le donjon administratif des contrats d'assurance !

    Agent, ta mission est d'apprendre à identifier, interpréter et honorer les obligations entre l'assureur et l'assuré. Car un contrat mal compris, c’est une protection compromise !

    Dans ce chapitre :
    - Tu manieras les définitions comme une épée affûtée ⚔️
    - Tu découvriras les responsabilités réciproques et leurs conséquences 💼
    - Tu affronteras les clauses cachées avec sagacité 🔍

    En avant, Gardien de l’Équité Contractuelle !
  `,

  quiz: [
    {
      question: "🧾 Quelle est l’obligation première de l’assureur dans un contrat d’assurance ?",
      choices: [
        {
          text: "Indemniser l’assuré selon les modalités prévues au contrat",
          correct: true,
          explanation: "C’est l’essence même du contrat d’assurance : fournir une prestation en cas de sinistre admissible."
        },
        {
          text: "Contacter l’assuré tous les mois pour prendre des nouvelles",
          correct: false,
          explanation: "La courtoisie n’est pas une obligation légale."
        },
        {
          text: "Proposer un nouveau contrat chaque année",
          correct: false,
          explanation: "L’offre est facultative, ce n’est pas une obligation."
        },
        {
          text: "Remplir les formulaires à la place du client",
          correct: false,
          explanation: "C’est à l’assuré de divulguer l’information requise."
        }
      ]
    },
    {
      question: "🧠 Que signifie le devoir de renseignement de l’assuré ?",
      choices: [
        {
          text: "L’obligation de répondre honnêtement aux questions de l’assureur",
          correct: true,
          explanation: "Toute omission ou fausse déclaration peut entraîner la nullité du contrat."
        },
        {
          text: "Donner son opinion sur les produits d’assurance",
          correct: false,
          explanation: "Ce n’est pas une obligation contractuelle."
        },
        {
          text: "S’assurer que son agent est sympathique",
          correct: false,
          explanation: "Le professionnalisme prime, pas la sociabilité."
        },
        {
          text: "Notifier l’assureur de ses projets de voyage",
          correct: false,
          explanation: "Sauf clause spécifique, ce n’est pas systématique."
        }
      ]
    },
    {
      question: "⚖️ Quelles sont les conséquences d’une fausse déclaration au moment de la souscription ?",
      choices: [
        {
          text: "L’assureur peut refuser le paiement de la prestation ou annuler le contrat",
          correct: true,
          explanation: "Cela constitue une violation majeure du contrat."
        },
        {
          text: "Le contrat devient automatiquement un prêt bancaire",
          correct: false,
          explanation: "Absolument aucune logique juridique ici."
        },
        {
          text: "L’assuré gagne une réduction sur ses prochaines primes",
          correct: false,
          explanation: "Au contraire, cela entraîne des conséquences sévères."
        },
        {
          text: "L’assureur offre une formation sur la transparence",
          correct: false,
          explanation: "Les pénalités contractuelles s’appliquent, pas des formations."
        }
      ]
    }
  ],

  minigame: {
    type: 'contract-guardian',
    title: "📝 Gardien des Clauses",
    description: `
      🎮 Mission : Identifier les obligations essentielles dans différents contrats !

      Agent, à toi de :
      - Distinguer les responsabilités des parties
      - Interpréter des extraits contractuels
      - Éviter les pièges des clauses restrictives

      ⚠️ Attention : chaque mauvaise interprétation peut te faire perdre des points de crédibilité !
    `,
    rewards: {
      xp: 300,
      badge: "Déchiffreur de Contrats",
      title: "Interprète Juridique"
    }
  },

  boss: {
    name: "📜 Le Cléarque du Contrat",
    description: "Ce boss t’interroge sur les subtilités contractuelles. Oublie une obligation, et il en profite pour t’attaquer avec une clause d’exclusion bien placée !",
    difficulty: 4,
    quiz: [
      {
        question: "Quelle information est obligatoire lors de la souscription d’un contrat d’assurance santé ?",
        choices: [
          {
            text: "Toute information influençant l’évaluation du risque",
            correct: true,
            explanation: "Cette transparence est essentielle pour un contrat valide."
          },
          {
            text: "La couleur préférée de l’assuré",
            correct: false,
            explanation: "Aucun impact sur l’évaluation du risque."
          },
          {
            text: "Les recettes de grand-maman",
            correct: false,
            explanation: "Aucune utilité contractuelle."
          },
          {
            text: "Le code secret du WiFi",
            correct: false,
            explanation: "Aucun lien avec le contrat."
          }
        ]
      },
      {
        question: "Quel document est émis par l’assureur pour résumer les garanties et conditions ?",
        choices: [
          {
            text: "La proposition d’assurance",
            correct: false,
            explanation: "Ce document est rempli par l’assuré."
          },
          {
            text: "La police d’assurance",
            correct: true,
            explanation: "C’est le document officiel confirmant le contrat."
          },
          {
            text: "La facture d’honoraires",
            correct: false,
            explanation: "Cela ne concerne pas l’assurance."
          },
          {
            text: "La déclaration d’impôts",
            correct: false,
            explanation: "Hors contexte !"
          }
        ]
      }
    ],
    rewards: {
      xp: 600,
      badge: "Maître des Obligations",
      title: "Vainqueur du Cléarque"
    }
  }
};