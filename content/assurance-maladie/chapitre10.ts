import { Chapter } from '@/types/chapter';

export const chapter10: Chapter = {
  id: 'health-insurance-ch10',
  title: 'Assurance en contexte d’incapacité prolongée',
  summary: `
    🧠 Bienvenue dans le dernier bastion de l’assurance maladie !

    Dans ce chapitre, vous découvrirez :
    - Les mesures publiques et privées qui soutiennent les personnes en incapacité prolongée 🧾
    - Les protections complémentaires offertes par les assureurs privés 🛡️
    - Les rôles respectifs de l’Aide sociale, du RRQ et de l’assurance-emploi 🏛️

    Préparez-vous à maîtriser les rouages de l’assistance durable — et à clore votre aventure comme un(e) **Maître de la Résilience** !
  `,

  quiz: [
    {
      question: "🧾 Que couvre principalement l’aide sociale (Programme d’assistance sociale du Québec) ?",
      choices: [
        {
          text: "Les besoins essentiels lorsqu’une personne est sans revenu ni autre recours",
          correct: true,
          explanation: "Ce programme est une mesure de dernier recours pour les personnes sans ressources."
        },
        {
          text: "Les vacances médicales à Cuba",
          correct: false,
          explanation: "Même si le soleil peut faire du bien, ce n’est pas l’objectif du programme."
        },
        {
          text: "Les frais de scolarité universitaire",
          correct: false,
          explanation: "Ce n’est pas sa vocation, même si l’éducation est importante."
        },
        {
          text: "Un régime privé de soins dentaires",
          correct: false,
          explanation: "L’aide sociale couvre uniquement les soins urgents dans ce domaine."
        }
      ]
    },
    {
      question: "🏛️ Quelle affirmation est vraie concernant le Régime de rentes du Québec (RRQ) ?",
      choices: [
        {
          text: "Il offre une rente d’invalidité seulement à partir de 65 ans",
          correct: false,
          explanation: "La rente d’invalidité est offerte aux cotisants admissibles avant 65 ans."
        },
        {
          text: "Il couvre uniquement les blessures survenues en milieu de travail",
          correct: false,
          explanation: "C’est la CNESST qui gère les accidents du travail, pas la RRQ."
        },
        {
          text: "Il prévoit une rente d’invalidité pour les cotisants gravement inaptes au travail",
          correct: true,
          explanation: "Exact ! Cette rente vise ceux qui ne peuvent exercer aucun travail rémunérateur."
        },
        {
          text: "Il est optionnel pour les travailleurs autonomes",
          correct: false,
          explanation: "Les travailleurs autonomes doivent aussi cotiser."
        }
      ]
    },
    {
      question: "📉 Qu’est-ce qui distingue une protection d’assurance invalidité de longue durée privée d’un régime public ?",
      choices: [
        {
          text: "Elle offre généralement une meilleure couverture du revenu à long terme",
          correct: true,
          explanation: "Les assurances privées peuvent remplacer jusqu’à 66 % du revenu, avec moins de restrictions."
        },
        {
          text: "Elle est gratuite pour tous les citoyens",
          correct: false,
          explanation: "Elle nécessite une prime — elle n’est pas financée par l’État."
        },
        {
          text: "Elle ne couvre que les employés du gouvernement",
          correct: false,
          explanation: "Elle est offerte à divers groupes : travailleurs autonomes, salariés, etc."
        },
        {
          text: "Elle couvre automatiquement les maladies infectieuses",
          correct: false,
          explanation: "Cela dépend du contrat, ce n’est pas une garantie automatique."
        }
      ]
    }
  ],

  minigame: {
    type: 'resilience-architect',
    title: "🧱 L’Architecte de Résilience",
    description: `
      🎮 Construisez un filet de sécurité solide pour vos clients !

      Votre mission :
      - Assembler des solutions durables (publiques et privées)
      - Réagir à des scénarios réalistes d’incapacité prolongée
      - Préserver le niveau de vie malgré les coups durs

      Gare aux failles dans la protection !
    `,
    rewards: {
      xp: 500,
      badge: "Pilier de la Résilience",
      title: "Architecte de la Sécurité"
    }
  },

  boss: {
    name: "⛈️ L’Ombre de l’Incapacité",
    description: "Il frappe quand les ressources s’épuisent. Seul un véritable stratège du soutien durable peut en triompher.",
    difficulty: 5,
    quiz: [
      {
        question: "En contexte d’incapacité de longue durée, que permet généralement un avenant de remboursement de prime ?",
        choices: [
          {
            text: "Obtenir un remboursement partiel des primes si aucune réclamation n’a été faite",
            correct: true,
            explanation: "C’est un incitatif à long terme pour les assurés."
          },
          {
            text: "Annuler automatiquement le contrat après 10 ans",
            correct: false,
            explanation: "L’avenant vise une compensation, pas une résiliation."
          },
          {
            text: "Doubler les prestations sans condition",
            correct: false,
            explanation: "Cela dépend toujours du contrat et des exclusions."
          },
          {
            text: "Transformer la police en assurance voyage",
            correct: false,
            explanation: "Pas du tout ! L’objectif est la gestion du risque d’invalidité."
          }
        ]
      }
    ],
    rewards: {
      xp: 800,
      badge: "Dominateur de l’Ombre",
      title: "Stratège du Soutien Permanent"
    }
  }
};