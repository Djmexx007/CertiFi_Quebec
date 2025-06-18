import { Chapter } from '@/types/chapter';

export const chapter7: Chapter = {
  id: 'health-insurance-ch7',
  title: 'Fonds communs de placement et FNB',
  summary: `
    💹 Bienvenue dans le temple des investissements collectifs !

    Dans ce chapitre, vous apprendrez à jongler avec :
    - Les fonds communs de placement (FCP) 🏛️
    - Les FNB (fonds négociés en bourse) 📈
    - Les frais, les avantages et les limites ⚖️
    - Et comment choisir le bon produit pour vos clients ! 🎯

    🧙‍♂️ Maîtrisez l'art des portefeuilles équilibrés et devenez le stratège de la croissance financière !
  `,

  quiz: [
    {
      question: "Quel est l'avantage principal d'un fonds commun de placement ?",
      choices: [
        {
          text: "La diversification instantanée de l'investissement",
          correct: true,
          explanation: "Un FCP permet de répartir le risque en investissant dans plusieurs titres."
        },
        {
          text: "Des rendements garantis par l'État",
          correct: false,
          explanation: "Les FCP sont soumis aux fluctuations du marché."
        },
        {
          text: "Une immunité totale contre les pertes",
          correct: false,
          explanation: "Aucun placement n’est exempt de risques."
        },
        {
          text: "Une exonération d’impôt permanente",
          correct: false,
          explanation: "Les gains réalisés sont imposables selon le type de compte."
        }
      ]
    },
    {
      question: "Quel est un inconvénient courant des FNB par rapport aux FCP ?",
      choices: [
        {
          text: "Les FNB peuvent entraîner des commissions de courtage",
          correct: true,
          explanation: "Ils se négocient comme des actions, avec des frais à chaque achat/vente."
        },
        {
          text: "Ils sont obligatoires pour tous les REER",
          correct: false,
          explanation: "Ils sont facultatifs, au même titre que les FCP."
        },
        {
          text: "Ils sont uniquement accessibles aux millionnaires",
          correct: false,
          explanation: "Les FNB sont accessibles à tous les investisseurs."
        },
        {
          text: "Ils offrent moins de transparence",
          correct: false,
          explanation: "Au contraire, ils sont souvent très transparents dans leur composition."
        }
      ]
    },
    {
      question: "Dans quel cas un client pourrait préférer un FNB à un FCP ?",
      choices: [
        {
          text: "S’il cherche une gestion passive et des frais réduits",
          correct: true,
          explanation: "Les FNB sont souvent choisis pour leurs frais moindres et leur gestion indicielle."
        },
        {
          text: "S’il veut un portefeuille géré activement tous les jours",
          correct: false,
          explanation: "Ce serait plutôt un FCP à gestion active."
        },
        {
          text: "S’il souhaite un rendement garanti de 10 %",
          correct: false,
          explanation: "Aucun produit n’offre un rendement garanti aussi élevé."
        },
        {
          text: "S’il veut éviter complètement le marché boursier",
          correct: false,
          explanation: "Les FNB sont exposés au marché boursier."
        }
      ]
    }
  ],

  minigame: {
    type: 'portfolio-master',
    title: "🧠 Le Maître du Portefeuille",
    description: `
      🎮 Construisez le portefeuille parfait selon le profil du client !

      Objectif :
      - Équilibrer FCP et FNB 🏛️📈
      - Réduire les frais sans sacrifier la diversification 💡
      - Répondre à des objectifs variés (croissance, revenu, sécurité) 💼

      Attention : chaque mauvaise allocation peut coûter des points !
    `,
    rewards: {
      xp: 500,
      badge: "Architecte de Portefeuille",
      title: "Stratège en FNB"
    }
  },

  boss: {
    name: "📊 L'Analyseur Absolu",
    description: "Il vous bombardera de comparaisons entre FNB et FCP. Une seule erreur, et votre crédibilité s'effondre !",
    difficulty: 5,
    quiz: [
      {
        question: "Un client veut investir en bourse avec de faibles frais et une grande liquidité. Quelle option recommandez-vous ?",
        choices: [
          {
            text: "Un FNB indiciel",
            correct: true,
            explanation: "Les FNB indiciels sont parfaits pour une gestion passive avec peu de frais."
          },
          {
            text: "Un CPG à 10 ans",
            correct: false,
            explanation: "Un CPG ne répond pas au besoin de liquidité ni à l’exposition boursière."
          },
          {
            text: "Un fonds commun équilibré à frais élevés",
            correct: false,
            explanation: "Les frais élevés peuvent nuire à la performance à long terme."
          },
          {
            text: "Un compte d’épargne à intérêt élevé",
            correct: false,
            explanation: "Ce n’est pas un produit d’investissement boursier."
          }
        ]
      },
      {
        question: "Quelle est une caractéristique typique des FNB à gestion passive ?",
        choices: [
          {
            text: "Ils répliquent un indice de marché sans intervention humaine constante",
            correct: true,
            explanation: "C’est le principe même de la gestion passive."
          },
          {
            text: "Ils garantissent un rendement supérieur à la moyenne",
            correct: false,
            explanation: "Ils visent à reproduire la performance du marché, pas à le surpasser."
          },
          {
            text: "Ils changent de stratégie tous les mois",
            correct: false,
            explanation: "La gestion passive est stable dans le temps."
          },
          {
            text: "Ils sont uniquement accessibles aux courtiers agréés",
            correct: false,
            explanation: "Tout investisseur peut y avoir accès."
          }
        ]
      }
    ],
    rewards: {
      xp: 800,
      badge: "Maître des Marchés",
      title: "Vainqueur de l’Analyseur"
    }
  }
};
