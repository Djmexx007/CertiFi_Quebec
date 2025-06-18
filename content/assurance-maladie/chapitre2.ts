import { Chapter } from '@/types/chapter';

export const chapter2: Chapter = {
  id: 'health-insurance-ch2',
  title: '⚖️ Revenu en Péril : Mission Protection',
  summary: `
    🎮 Agent, le Quartier Général vous envoie sur une mission critique : préserver le revenu des citoyens contre l’invalidité !

    Ce chapitre vous révèlera :
    - Les forces obscures de l’incapacité 🧟‍♂️
    - Les outils sacrés des polices d’assurance 🔮
    - Les secrets bien gardés des contrats non résiliables 📜
    - Les combos gagnants entre délais de carence et garanties spéciales ⚔️

    Préparez votre cerveau, car chaque choix aura un impact sur la stabilité financière de vos protégés !
  `,

  quiz: [
    {
      question: "🧠 Dans une stratégie de planification du revenu, pourquoi l’assurance invalidité est-elle considérée comme un pilier fondamental ?",
      choices: [
        {
          text: "Elle permet de maintenir un flux de revenus même en cas d’incapacité à travailler",
          correct: true,
          explanation: "Elle agit comme un filet de sécurité pour éviter la chute brutale de la stabilité financière."
        },
        {
          text: "Elle permet de partir plus vite à la retraite",
          correct: false,
          explanation: "Ce n’est pas une stratégie d’évasion professionnelle, mais de protection !"
        },
        {
          text: "Elle réduit le stress de l’employeur",
          correct: false,
          explanation: "L’assurance vise d’abord la personne assurée, pas la santé mentale du patron."
        },
        {
          text: "Elle donne accès à un coach de vie",
          correct: false,
          explanation: "Ce serait sympa, mais non, ce n’est pas inclus dans la couverture."
        }
      ]
    },
    {
      question: "🧾 Qu'est-ce qu'une police d’assurance non résiliable offre comme super-pouvoir à l’assuré ?",
      choices: [
        {
          text: "Une prime stable et des conditions garanties jusqu’à 65 ans",
          correct: true,
          explanation: "C’est l’option la plus solide pour les travailleurs qui planifient à long terme."
        },
        {
          text: "Une couverture qui change chaque année",
          correct: false,
          explanation: "C’est l’opposé de la stabilité offerte par la police non résiliable."
        },
        {
          text: "Une option d’annulation automatique après 10 ans",
          correct: false,
          explanation: "Ce serait plutôt inquiétant que rassurant !"
        },
        {
          text: "Des vacances payées si on reste en santé",
          correct: false,
          explanation: "Non, mais si c’était le cas, on appellerait ça une police plaisir, pas invalidité."
        }
      ]
    },
    {
      question: "📊 Quels facteurs influencent la prime d’une assurance invalidité ?",
      choices: [
        {
          text: "L’âge, la profession, la santé et le montant de couverture",
          correct: true,
          explanation: "Ce sont les éléments évalués pour déterminer le risque et fixer le coût."
        },
        {
          text: "Le nombre de jours fériés pris dans l’année",
          correct: false,
          explanation: "Même si votre boss aimerait bien, ça ne change rien à la tarification."
        },
        {
          text: "Le type de café consommé au travail",
          correct: false,
          explanation: "Espresso ou décaf, ça ne change rien aux probabilités actuarielles."
        },
        {
          text: "La fidélité à un club de lecture",
          correct: false,
          explanation: "Cultivé ou pas, le facteur risque se base sur autre chose."
        }
      ]
    }
  ],

  minigame: {
    type: 'income-guardian',
    title: "🛡️ Le Gardien du Revenu",
    description: `
      🎮 Mission : Défendez le revenu de vos clients contre les imprévus de la vie !

      Dans ce mini-jeu :
      - Analysez les professions à risque élevé
      - Choisissez les bonnes polices et délais de carence
      - Gérez un portefeuille client pour maximiser stabilité et performance

      ⚠️ Attention : un mauvais choix et c’est le chaos budgétaire !
    `,
    rewards: {
      xp: 350,
      badge: "Maître du Revenu",
      title: "Protecteur des Revenus"
    }
  },

  boss: {
    name: "🧠 Le Démon Déductif",
    description: "Il teste ta logique jusqu’à l’épuisement mental. Seuls les agents capables d’analyser finement les types de polices et leurs prestations peuvent le vaincre.",
    difficulty: 4,
    quiz: [
      {
        question: "Quel est l’avantage clé d’un avenant d’assurabilité future ?",
        choices: [
          {
            text: "Permet d’augmenter la couverture sans nouvelle preuve médicale",
            correct: true,
            explanation: "Parfait pour anticiper les besoins futurs tout en verrouillant l’assurabilité."
          },
          {
            text: "Donne droit à des soins dentaires",
            correct: false,
            explanation: "Ça, c’est une autre branche d’assurance !"
          },
          {
            text: "Permet de transférer la couverture à un proche",
            correct: false,
            explanation: "Non, la couverture n’est pas transférable."
          },
          {
            text: "Prolonge la période d’attente",
            correct: false,
            explanation: "Ce serait un désavantage plutôt qu’un avantage."
          }
        ]
      },
      {
        question: "Comment fonctionne le délai de carence dans une police d’invalidité ?",
        choices: [
          {
            text: "C’est le nombre de jours à attendre avant de recevoir les prestations",
            correct: true,
            explanation: "Il permet à l’assureur de vérifier la validité de la réclamation."
          },
          {
            text: "C’est une pénalité en cas de fraude",
            correct: false,
            explanation: "Non, ce n’est pas une mesure punitive."
          },
          {
            text: "C’est le montant de franchise qu’on doit payer",
            correct: false,
            explanation: "Il n’est pas question d’un montant à payer ici, mais de temps."
          },
          {
            text: "C’est la période de renouvellement du contrat",
            correct: false,
            explanation: "Ce sont deux notions complètement différentes."
          }
        ]
      }
    ],
    rewards: {
      xp: 500,
      badge: "Logicien Vainqueur",
      title: "Maître de l’Analyse"
    }
  }
};