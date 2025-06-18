import { Chapter } from '@/types/chapter';

export const chapter1: Chapter = {
  id: 'health-insurance-ch1',
  title: "⚔️ L'Assaut Invisible : Introduction à l'assurance maladie",
  summary: `
    🧠 Bienvenue dans la Zone de Risque, Agent !

    L'assurance maladie n’est pas qu’un contrat, c’est un **bouclier stratégique** contre l’imprévisible.

    Dans ce chapitre, tu vas :
    - Découvrir **les conséquences financières des maladies** et accidents 📉
    - Identifier **les types de contrats** qui sauvent des vies (et des portefeuilles) 💸
    - Déjouer **les pièges de l’imprudence** comme un véritable stratège 🕵️‍♂️

    Prépare-toi à affronter les premières attaques… sans mutuelle, pas de miracle. 😈
  `,

  quiz: [
    {
      question: "🚨 Quelle situation illustre le mieux la nécessité d'une assurance maladie individuelle ?",
      choices: [
        {
          text: "Un travailleur autonome victime d’un accident en vélo de montagne",
          correct: true,
          explanation: "Sans régime collectif, sa seule protection est une couverture individuelle. Sans elle, il devra puiser dans ses actifs."
        },
        {
          text: "Un étudiant inscrit à la RAMQ avec sa carte soleil",
          correct: false,
          explanation: "La RAMQ couvre déjà les soins essentiels. Une assurance privée est moins urgente dans ce cas."
        },
        {
          text: "Un retraité vivant paisiblement avec son chat et ses souvenirs",
          correct: false,
          explanation: "S’il n’a plus de revenu à protéger, la priorité est moindre (mais pas nulle !)."
        },
        {
          text: "Une personne qui éternue deux fois par an",
          correct: false,
          explanation: "La fréquence des rhumes n’est pas un facteur suffisant pour juger de la nécessité d’une assurance."
        }
      ]
    },
    {
      question: "🧬 Parmi les protections suivantes, laquelle vise à **rembourser des soins médicaux spécifiques** ?",
      choices: [
        {
          text: "Assurance frais médicaux",
          correct: true,
          explanation: "Elle couvre directement les dépenses médicales admissibles."
        },
        {
          text: "Assurance invalidité",
          correct: false,
          explanation: "Elle remplace le revenu en cas d’incapacité, mais ne rembourse pas des frais médicaux."
        },
        {
          text: "Assurance vie temporaire",
          correct: false,
          explanation: "Elle n’a aucun lien avec les frais médicaux : elle verse un capital au décès."
        },
        {
          text: "Assurance soins de longue durée",
          correct: false,
          explanation: "Elle couvre les besoins en cas de perte d’autonomie, mais pas les frais médicaux immédiats."
        }
      ]
    },
    {
      question: "💥 Quelle est la **conséquence immédiate** d’un accident grave non couvert par une assurance ?",
      choices: [
        {
          text: "Une ponction dans les économies personnelles ou un endettement accru",
          correct: true,
          explanation: "Sans assurance, les frais peuvent forcer l’individu à liquider des actifs ou emprunter."
        },
        {
          text: "Un avertissement de la RAMQ",
          correct: false,
          explanation: "La RAMQ ne sanctionne pas les imprévoyants — elle couvre ou ne couvre pas, point."
        },
        {
          text: "Un changement de statut civil automatique",
          correct: false,
          explanation: "Les accidents ne modifient pas le statut civil."
        },
        {
          text: "Une amende de la part de l’assureur",
          correct: false,
          explanation: "Ce serait cruel — et illégal !"
        }
      ]
    }
  ],

  minigame: {
    type: 'risk-detection',
    title: "🧩 Scanner de Risques Médicaux",
    description: `
      🚑 Détecte les dangers cachés dans la vie d’un client fictif.

      Ta mission :
      - Repérer les **zones à risque médical et financier**
      - Proposer une **protection adaptée** à chaque profil
      - Gagne en XP à chaque bonne décision !

      Attention aux fausses protections et aux exclusions sournoises !
    `,
    rewards: {
      xp: 150,
      badge: "Détecteur de Danger",
      title: "Agent du Bouclier Médical"
    }
  },

  boss: {
    name: "👹 L’Imprévisible",
    description: "Il surgit sans prévenir et attaque les imprévoyants. Seuls ceux qui ont compris la logique des protections peuvent le vaincre.",
    difficulty: 3,
    quiz: [
      {
        question: "🧠 Quel est l’objectif principal de l’assurance maladie privée complémentaire ?",
        choices: [
          {
            text: "Couvrir ce que la RAMQ ne couvre pas",
            correct: true,
            explanation: "Exactement ! Elle vient compléter les lacunes du régime public."
          },
          {
            text: "Remplacer la RAMQ dans son ensemble",
            correct: false,
            explanation: "La RAMQ reste obligatoire. L’assurance privée ne la remplace pas."
          },
          {
            text: "Fournir un revenu à la retraite",
            correct: false,
            explanation: "Ce rôle appartient à l’épargne ou aux rentes, pas à l’assurance maladie."
          },
          {
            text: "Réduire les taxes sur les soins",
            correct: false,
            explanation: "Ce n’est pas une fonction directe de cette assurance."
          }
        ]
      }
    ],
    rewards: {
      xp: 500,
      badge: "Maître du Bouclier Médical",
      title: "Vainqueur de l’Imprévisible"
    }
  }
};