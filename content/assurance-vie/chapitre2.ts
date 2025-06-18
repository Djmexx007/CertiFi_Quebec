import { Chapter } from '@/types/chapter';

export const chapter2: Chapter = {
  id: 'life-insurance-ch2',
  title: '⏳ Les Chroniques Temporaires',
  summary: `
🕵️‍♂️ Agent, votre nouvelle mission est une course contre le temps !

Dans ce chapitre, vous apprendrez :
- À manier les polices d’assurance temporaire comme des gadgets d’espion
- Quand la protection s’active (ou disparaît) pile au bon moment
- À choisir la bonne stratégie pour couvrir les risques sans ruiner votre client

Rappelez-vous : l’assurance temporaire est comme un extincteur — inutile… jusqu’à ce qu’elle devienne vitale !
`,

  quiz: [
    {
      question: "⏱ Que se passe-t-il si l’assuré survit à la fin de sa période d’assurance vie temporaire ?",
      choices: [
        {
          text: "Aucun montant n’est versé",
          correct: true,
          explanation: "C’est une assurance pure : elle ne paie qu’en cas de décès pendant la durée couverte."
        },
        {
          text: "L’assuré reçoit une médaille de longévité",
          correct: false,
          explanation: "Malheureusement non. Il n’y a pas de récompense pour avoir survécu, à part... la vie !"
        },
        {
          text: "Un remboursement partiel est effectué",
          correct: false,
          explanation: "Ce n’est vrai que pour les produits avec remboursement, pas la protection standard."
        },
        {
          text: "Le contrat devient automatiquement une assurance permanente",
          correct: false,
          explanation: "Pas sans clause spéciale de conversion. Sinon, il se termine sans versement."
        }
      ]
    },
    {
      question: "💔 Quelle est la différence entre une police conjointe au premier décès et au dernier décès ?",
      choices: [
        {
          text: "Le versement est effectué au premier ou au dernier décès selon la police choisie",
          correct: true,
          explanation: "Exact ! La conjointe-premier décès paie à la première personne décédée. La conjointe-dernier décès attend les deux."
        },
        {
          text: "Elles dépendent du revenu du couple",
          correct: false,
          explanation: "La distinction est basée sur le moment du décès, pas sur les finances."
        },
        {
          text: "L’une couvre le divorce aussi",
          correct: false,
          explanation: "Aucune assurance vie ne couvre les ruptures sentimentales !"
        },
        {
          text: "Elles s’annulent si les deux décèdent le même jour",
          correct: false,
          explanation: "Non, la prestation sera quand même versée selon la clause de priorité."
        }
      ]
    },
    {
      question: "🔁 Que permet une clause de conversion dans une assurance vie temporaire ?",
      choices: [
        {
          text: "Transformer le contrat en assurance permanente sans preuve médicale",
          correct: true,
          explanation: "Oui, tant que la conversion est faite durant la période prévue, elle est garantie."
        },
        {
          text: "Allonger automatiquement la durée de protection",
          correct: false,
          explanation: "Ce serait bien, mais la clause permet une transformation, pas une extension de durée."
        },
        {
          text: "Réduire le montant de la prime chaque année",
          correct: false,
          explanation: "Au contraire, la prime peut augmenter avec l’âge ou si le produit est renouvelable."
        },
        {
          text: "Offrir des points de fidélité",
          correct: false,
          explanation: "L’assurance vie ne fonctionne pas comme un programme de récompenses."
        }
      ]
    }
  ],

  minigame: {
    type: 'temp-policy-planner',
    title: "🧠 L’Architecte Temporaire",
    description: `
🎮 Dans ce mini-jeu, tu dois choisir les meilleures stratégies d’assurance temporaire :
- Protège tes clients au bon moment (durée, montant)
- Évite les trous de couverture
- Applique les conversions au bon moment

Si tu joues mal... Game Over (et pas d’indemnité !) 😬
    `,
    rewards: {
      xp: 200,
      badge: "Chronomancien d’Assurance",
      title: "Maître de la Temporaire"
    }
  },

  boss: {
    name: "🧟‍♂️ Le Fantôme de l'Échéance",
    description: "Ce boss adore les contrats échus sans versement. Montre-lui que tu sais quand protéger — et surtout comment convertir au bon moment !",
    difficulty: 4,
    quiz: [
      {
        question: "Pourquoi la clause de conversion est-elle un outil stratégique pour le conseiller ?",
        choices: [
          {
            text: "Elle permet de transformer la protection sans nouveau questionnaire médical",
            correct: true,
            explanation: "C’est crucial pour les clients dont la santé pourrait se détériorer avec le temps."
          },
          {
            text: "Elle supprime tous les frais liés au nouveau contrat",
            correct: false,
            explanation: "Il peut y avoir des coûts liés à la conversion, même sans preuve médicale."
          },
          {
            text: "Elle permet de doubler la protection",
            correct: false,
            explanation: "Non, elle remplace, elle ne multiplie pas."
          },
          {
            text: "Elle génère un rendement garanti",
            correct: false,
            explanation: "Seuls certains contrats permanents participent aux bénéfices, pas les temporaires."
          }
        ]
      }
    ],
    rewards: {
      xp: 600,
      badge: "Maître du Temporel",
      title: "Dominateur de l’Échéance"
    }
  }
};
