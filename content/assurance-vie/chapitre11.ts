import { Chapter } from '@/types/chapter';

export const chapter11: Chapter = {
  id: 'life-insurance-ch11',
  title: '🎤 Présentez comme un Pro',
  summary: `
🎓 Agent, te voilà dans l’arène de la **présentation client** !

Tu as analysé, diagnostiqué, structuré. Il est maintenant temps de **convaincre** et de **transformer une solution en action concrète**.

Dans ce chapitre, tu apprendras à :
- Présenter une recommandation claire et personnalisée
- Gérer les objections avec tact et assurance
- Valoriser ton rôle de conseiller
- Capter l’attention et transformer l’écoute en décision

✨ Car une bonne recommandation mal présentée... c’est une occasion perdue !
  `,

  quiz: [
    {
      question: "🎯 Quel est l’objectif fondamental d’une présentation de recommandations ?",
      choices: [
        {
          text: "Expliquer clairement la solution qui répond aux besoins du client",
          correct: true,
          explanation: "Chaque mot doit faire le lien entre le besoin identifié et la solution proposée."
        },
        {
          text: "Utiliser un maximum de jargon pour impressionner",
          correct: false,
          explanation: "Trop de jargon, c’est comme parler klingon à un client... incompréhensible."
        },
        {
          text: "Proposer toutes les options possibles pour éviter de trancher",
          correct: false,
          explanation: "Trop d’options tuent la décision. Le client attend des conseils, pas un buffet à volonté."
        },
        {
          text: "Réciter le manuel OCRA par cœur",
          correct: false,
          explanation: "Bonne idée pour dormir, mais pas pour conclure une vente 😉"
        }
      ]
    },
    {
      question: "💬 Quelle est une **bonne stratégie** pour gérer une objection sur le prix ?",
      choices: [
        {
          text: "Décomposer le montant en coût par jour ou par mois et souligner la valeur",
          correct: true,
          explanation: "Cela rend l’investissement plus concret, plus digeste... et plus justifiable."
        },
        {
          text: "Dire que le prix est le même pour tout le monde",
          correct: false,
          explanation: "Le client ne cherche pas une moyenne... mais une justification personnelle."
        },
        {
          text: "Proposer une remise au noir",
          correct: false,
          explanation: "Non seulement illégal... mais carrément éjectable du domaine !"
        },
        {
          text: "Changer de sujet rapidement",
          correct: false,
          explanation: "Fuir une objection, c’est la laisser grossir dans la tête du client."
        }
      ]
    },
    {
      question: "👂 Pourquoi l’**écoute active** est-elle essentielle pendant la présentation ?",
      choices: [
        {
          text: "Parce qu’elle permet d’ajuster le discours en fonction des réactions du client",
          correct: true,
          explanation: "Une présentation n’est pas un monologue : c’est une danse stratégique avec les réponses du client."
        },
        {
          text: "Parce que le silence est gênant",
          correct: false,
          explanation: "Le silence peut être puissant... s’il est bien utilisé."
        },
        {
          text: "Parce qu’on ne sait jamais quand le client a fini de parler",
          correct: false,
          explanation: "Ce n’est pas qu’une question de timing, mais de compréhension profonde."
        },
        {
          text: "Pour avoir l’air poli",
          correct: false,
          explanation: "L’écoute active va bien au-delà des bonnes manières."
        }
      ]
    }
  ],

  minigame: {
    type: 'recommendation-battle',
    title: "🎯 L’Art de Convaincre",
    description: `
🎮 Dans ce mini-jeu, vous entrez dans l’arène de la présentation :

- Ajustez votre discours à chaque profil client
- Gérez des objections en temps réel (prix, pertinence, confiance)
- Utilisez écoute active, visuels, métaphores et logique pour conclure avec impact

Le bon plan mal présenté = contrat envolé !
    `,
    rewards: {
      xp: 750,
      badge: "Maître Orateur",
      title: "Architecte de Confiance"
    }
  },

  boss: {
    name: "🌀 Le Doute du Client",
    description: "Ce boss invisible rôde dans l’esprit du client. Il prend force avec les hésitations, les imprécisions et les réponses vagues...",
    difficulty: 5,
    quiz: [
      {
        question: "❓ Quelle erreur peut ruiner une présentation, même avec une bonne analyse ?",
        choices: [
          {
            text: "Être flou, trop technique ou ne pas répondre aux véritables besoins",
            correct: true,
            explanation: "Même la meilleure solution perd tout impact si elle n’est pas comprise et liée au besoin réel du client."
          },
          {
            text: "Utiliser PowerPoint au lieu d’un PDF",
            correct: false,
            explanation: "Le support importe moins que le contenu et la façon de le transmettre."
          },
          {
            text: "Offrir un café trop chaud",
            correct: false,
            explanation: "C’est gênant, mais ce n’est pas ça qui fait fuir une vente !"
          },
          {
            text: "Parler avec un accent dramatique",
            correct: false,
            explanation: "L’accent importe peu si le message est clair !"
          }
        ]
      }
    ],
    rewards: {
      xp: 1000,
      badge: "Éradicateur du Doute",
      title: "Champion de la Présentation"
    }
  }
};
