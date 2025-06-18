import { Chapter } from '@/types/chapter';

export const chapter9: Chapter = {
  id: 'health-insurance-ch9',
  title: "Préparer l'Avenir : Assurance et Fin de Vie",
  summary: `
    🌅 Bienvenue, Agent de l'Ultime Préparation !

    Dans ce dernier chapitre, vous explorerez l'univers délicat mais crucial de l'assurance en fin de vie.

    Vous apprendrez à :
    - Comprendre les types de couverture pour les soins palliatifs 🕊️
    - Anticiper les besoins de services à domicile 🏡
    - Soutenir la dignité et la sécurité financière jusqu'au dernier souffle 🛡️

    💡 Une couverture bien choisie aujourd'hui peut alléger un fardeau immense demain. Soyez le pilier de compassion et de prévoyance.
  `,

  quiz: [
    {
      question: "🏥 Quel est le principal objectif d'une couverture en soins palliatifs dans une assurance santé ?",
      choices: [
        {
          text: "Permettre un accès à des soins de confort et d'accompagnement en fin de vie",
          correct: true,
          explanation: "Les soins palliatifs visent à soulager la douleur et préserver la qualité de vie du patient en phase terminale."
        },
        {
          text: "Offrir une opération gratuite pour prolonger la vie",
          correct: false,
          explanation: "Ce n'est pas le but principal. Les soins palliatifs ne sont pas curatifs."
        },
        {
          text: "Permettre une réduction automatique des primes",
          correct: false,
          explanation: "La prime n'est pas liée à la fin de vie, mais au profil global de risque."
        },
        {
          text: "Assurer un revenu de retraite complémentaire",
          correct: false,
          explanation: "Ce rôle revient plutôt aux rentes ou produits de retraite, pas aux soins palliatifs."
        }
      ]
    },
    {
      question: "💡 Quelle est une caractéristique clé de l’assurance de soins de longue durée à domicile ?",
      choices: [
        {
          text: "Elle couvre les frais liés à la perte d’autonomie, comme l’aide-ménagère ou l’assistance médicale",
          correct: true,
          explanation: "Ce type de police soutient le maintien à domicile en cas de dépendance."
        },
        {
          text: "Elle rembourse les abonnements Netflix pendant la convalescence",
          correct: false,
          explanation: "Aussi relaxant que cela puisse être, ce n’est pas couvert."
        },
        {
          text: "Elle s’applique uniquement aux personnes de moins de 40 ans",
          correct: false,
          explanation: "Au contraire, elle cible plutôt les personnes âgées ou fragilisées."
        },
        {
          text: "Elle n’est offerte que si le patient vit dans un château",
          correct: false,
          explanation: "Le lieu de résidence n’est pas un critère pour la protection."
        }
      ]
    },
    {
      question: "🧾 Quelle clause permet à un proche d’agir à titre de mandataire pour gérer les demandes d’indemnisation ?",
      choices: [
        {
          text: "La procuration médicale ou financière prévue au contrat",
          correct: true,
          explanation: "Elle permet légalement à un tiers désigné d’agir au nom du patient."
        },
        {
          text: "L’ajout de son nom sur la boîte aux lettres",
          correct: false,
          explanation: "Ce n’est pas juridiquement suffisant pour représenter un assuré."
        },
        {
          text: "L’achat d’un bouquet de fleurs à l’assureur",
          correct: false,
          explanation: "Aussi charmant soit-il, cela ne suffit pas à accorder un pouvoir légal."
        },
        {
          text: "Une signature sur une serviette de table",
          correct: false,
          explanation: "Les documents informels n’ont pas de valeur légale dans ce contexte."
        }
      ]
    }
  ],

  minigame: {
    type: 'end-of-life-strategist',
    title: "Stratège de la Dignité",
    description: `
      🎮 Votre mission : guider une famille dans la planification de la fin de vie d’un proche.

      À travers une série de scénarios émouvants, vous devrez :
      - Choisir les bons types de couverture
      - Comprendre les besoins éthiques, médicaux et financiers
      - Éviter les pièges de l’impréparation

      Gagnez en sagesse, et apportez réconfort, clarté et dignité.
    `,
    rewards: {
      xp: 450,
      badge: "Compagnon de Fin de Vie",
      title: "Gardien de la Dignité"
    }
  },

  boss: {
    name: "👻 L’Esprit de l’Oubli Préventif",
    description: "Un esprit insaisissable qui se nourrit des plans de fin de vie non préparés. Il rôde dans les zones grises des contrats mal compris !",
    difficulty: 4,
    quiz: [
      {
        question: "Pourquoi est-il risqué de ne pas planifier ses besoins en soins de fin de vie ?",
        choices: [
          {
            text: "Car cela peut entraîner des décisions précipitées et coûteuses pour les proches",
            correct: true,
            explanation: "Sans plan clair, la famille doit improviser sous pression, ce qui peut être émotionnellement et financièrement lourd."
          },
          {
            text: "Parce qu’on ne pourra pas commander de pizza à temps",
            correct: false,
            explanation: "Même si manger est important, la planification concerne les soins et finances."
          },
          {
            text: "Parce que les assurances deviennent gratuites sans plan",
            correct: false,
            explanation: "Rien n’est gratuit — surtout pas l’oubli !"
          },
          {
            text: "Parce qu’on veut tester ses enfants",
            correct: false,
            explanation: "Ce n’est pas un test surprise, mais un acte de prévoyance."
          }
        ]
      }
    ],
    rewards: {
      xp: 700,
      badge: "Maître de la Sérénité",
      title: "Architecte du Repos Paisible"
    }
  }
};
