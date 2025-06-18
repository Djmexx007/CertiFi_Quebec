import { Chapter } from '@/types/chapter';

export const chapter8: Chapter = {
  id: 'health-insurance-ch8',
  title: 'Assurance accident et voyage',
  summary: `
    ✈️ Bienvenue, Agent Nomade !

    Ce chapitre vous embarque dans le monde imprévisible des accidents et des imprévus à l’étranger.

    Vous y apprendrez :
    - Les différences entre les garanties accident et maladie en voyage 🧳
    - Les exclusions les plus sournoises des contrats 🕵️‍♂️
    - L’importance de la durée de séjour et des frais engagés ⏳💸

    Que vous soyez sur une plage ou dans un dojo thaïlandais, la préparation est votre meilleure défense !
  `,

  quiz: [
    {
      question: "🌍 Quelle est la principale limite des régimes publics québécois en matière de soins reçus à l'étranger ?",
      choices: [
        {
          text: "Ils ne remboursent qu'une partie des frais, selon les tarifs du Québec",
          correct: true,
          explanation: "Les régimes publics ne couvrent qu'une petite portion des frais engagés à l'étranger, souvent bien inférieurs aux coûts réels."
        },
        {
          text: "Ils remboursent tous les frais à 100%",
          correct: false,
          explanation: "C'est faux : les remboursements sont limités et souvent insuffisants."
        },
        {
          text: "Ils obligent à être hospitalisé plus de 72 heures",
          correct: false,
          explanation: "Aucune telle obligation n'existe."
        },
        {
          text: "Ils couvrent uniquement les blessures sportives",
          correct: false,
          explanation: "La couverture publique n'est pas aussi restrictive."
        }
      ]
    },
    {
      question: "✈️ Quelle clause peut rendre nulle la couverture d'assurance voyage lors d'une absence prolongée ?",
      choices: [
        {
          text: "La durée maximale de séjour hors du Québec",
          correct: true,
          explanation: "La plupart des contrats imposent une durée maximale de séjour à l’extérieur du Québec pour maintenir la validité de la police."
        },
        {
          text: "L’achat de souvenirs coûteux",
          correct: false,
          explanation: "Ce n’est pas un facteur affectant la validité de la couverture."
        },
        {
          text: "La consommation d’aliments exotiques",
          correct: false,
          explanation: "La gastronomie locale ne remet pas en cause la validité d’un contrat !"
        },
        {
          text: "Le port de sandales dans des zones humides",
          correct: false,
          explanation: "Aucun assureur ne vérifie vos sandales."
        }
      ]
    },
    {
      question: "💥 Quelle différence essentielle distingue une assurance accident d’une assurance maladie voyage ?",
      choices: [
        {
          text: "L'assurance accident couvre uniquement les événements soudains et involontaires",
          correct: true,
          explanation: "Elle s’applique à des situations précises comme une chute ou un accident de la route."
        },
        {
          text: "L'assurance accident couvre les frais vétérinaires",
          correct: false,
          explanation: "Elle couvre les frais humains, pas ceux de vos compagnons à quatre pattes."
        },
        {
          text: "L’assurance maladie couvre uniquement les allergies",
          correct: false,
          explanation: "Elle couvre bien plus que ça."
        },
        {
          text: "L’assurance accident est plus chère qu’une assurance maladie",
          correct: false,
          explanation: "Pas nécessairement, cela dépend du contrat."
        }
      ]
    }
  ],

  minigame: {
    type: 'travel-shield',
    title: "🛡️ Bouclier du Voyageur",
    description: `
      🎮 Protégez votre agent lors d’un périple mondial rempli d’obstacles !

      Votre mission :
      - Réagir à des imprévus médicaux en voyage
      - Choisir la bonne assurance selon la situation
      - Survivre aux exclusions vicieuses
      - Respecter les limites de durée, territoires, et garanties
    `,
    rewards: {
      xp: 400,
      badge: "Globe-Trotteur Assuré",
      title: "Protecteur d'Aventure"
    }
  },

  boss: {
    name: "🌪️ Le Chaos Touristique",
    description: "Ce boss simule les pires scénarios de voyage... sans couverture ! Serez-vous capable d'y survivre mentalement, juridiquement et financièrement ?",
    difficulty: 4,
    quiz: [
      {
        question: "🏖️ Une cliente est hospitalisée en Floride pour un accident. Quel réflexe lui permettrait d’éviter des dettes colossales ?",
        choices: [
          {
            text: "Souscrire une assurance voyage privée avant son départ",
            correct: true,
            explanation: "Elle est indispensable puisque le régime public rembourse très peu à l'étranger."
          },
          {
            text: "Avoir son permis de conduire international",
            correct: false,
            explanation: "Utile sur la route, inutile pour l’hôpital."
          },
          {
            text: "Demander une chambre avec vue",
            correct: false,
            explanation: "Cela ne diminue pas les frais médicaux."
          },
          {
            text: "S'enregistrer à l’ambassade canadienne",
            correct: false,
            explanation: "Recommandé, mais sans lien direct avec les remboursements."
          }
        ]
      },
      {
        question: "🎢 Quelle situation typique est souvent exclue des contrats d’assurance voyage ?",
        choices: [
          {
            text: "La participation à des sports extrêmes",
            correct: true,
            explanation: "Les contrats excluent souvent les activités à haut risque comme le parachutisme ou le deltaplane."
          },
          {
            text: "Un rhume à la plage",
            correct: false,
            explanation: "Cela est généralement couvert."
          },
          {
            text: "Une intoxication alimentaire dans un hôtel 4 étoiles",
            correct: false,
            explanation: "Les urgences médicales sont habituellement prises en charge."
          },
          {
            text: "Un coup de soleil",
            correct: false,
            explanation: "Cela peut être couvert selon la gravité, mais ce n’est pas systématiquement exclu."
          }
        ]
      }
    ],
    rewards: {
      xp: 600,
      badge: "Maître du Chaos Étranger",
      title: "Pilote d’Urgence Internationale"
    }
  }
};