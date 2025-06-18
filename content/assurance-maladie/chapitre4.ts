import { Chapter } from '@/types/chapter';

export const chapter4: Chapter = {
  id: 'health-insurance-ch4',
  title: 'Les Frontières de la Couverture Médicale',
  summary: `
    🧭 Agent, vous entrez dans la zone grise du système de santé : là où l’assurance publique s’arrête… et où l’assurance privée prend le relais !

    Dans ce chapitre, vous allez :
    - Explorer les limites des régimes publics 🏛️
    - Découvrir les besoins comblés (ou non) par l’État 📉
    - Comprendre les solutions complémentaires 💼
    - Évaluer les stratégies de couverture pour vos clients 🩺

    Préparez votre loupe, votre contrat… et votre sens de la nuance !
  `,

  quiz: [
    {
      question: "🧠 Pourquoi les régimes publics comme la RAMQ ne suffisent-ils pas toujours à couvrir les besoins médicaux des Québécois ?",
      choices: [
        {
          text: "Parce qu’ils excluent certains soins essentiels comme les soins dentaires, la vue ou les médicaments non couverts",
          correct: true,
          explanation: "Les régimes publics couvrent principalement les soins hospitaliers et médicaux de base. Beaucoup de dépenses importantes restent à la charge de l’individu."
        },
        {
          text: "Parce qu’ils ne couvrent jamais les urgences",
          correct: false,
          explanation: "Les urgences médicales sont bien couvertes par les régimes publics."
        },
        {
          text: "Parce qu’ils sont gérés par des extraterrestres bureaucrates",
          correct: false,
          explanation: "C’est tentant, mais non. Les limites sont liées aux politiques et aux ressources provinciales."
        },
        {
          text: "Parce qu’ils changent de nom tous les ans",
          correct: false,
          explanation: "Le nom reste le même, mais les couvertures peuvent varier."
        }
      ]
    },
    {
      question: "💼 Que couvre généralement une assurance complémentaire collective en entreprise ?",
      choices: [
        {
          text: "Les frais médicaux et paramédicaux non remboursés par le régime public",
          correct: true,
          explanation: "Ce type d’assurance comble les lacunes du régime public, incluant médicaments, soins dentaires, psychologues, chiropraticiens, etc."
        },
        {
          text: "Les promotions chez Starbucks",
          correct: false,
          explanation: "Même si ce serait agréable, ce n’est pas une garantie courante."
        },
        {
          text: "Les factures de restaurants santé",
          correct: false,
          explanation: "Une saine alimentation est encouragée, mais rarement remboursée."
        },
        {
          text: "Les voyages en jet privé pour aller à l’hôpital",
          correct: false,
          explanation: "L’assurance ne finance pas de mode VIP pour les soins !"
        }
      ]
    },
    {
      question: "🔍 Quel est l’intérêt d’une assurance individuelle lorsque le client n’a pas accès à une assurance collective ?",
      choices: [
        {
          text: "Elle permet d’avoir une couverture flexible et adaptée à ses besoins spécifiques",
          correct: true,
          explanation: "L’assurance individuelle est personnalisable et essentielle pour ceux qui ne sont pas couverts par un régime d’employeur."
        },
        {
          text: "Elle est obligatoire pour pouvoir aller chez le dentiste",
          correct: false,
          explanation: "Elle n’est pas obligatoire, mais elle permet d’être remboursé."
        },
        {
          text: "Elle donne droit à un abonnement Netflix",
          correct: false,
          explanation: "Non, ce n’est pas encore un avantage reconnu par les assureurs."
        },
        {
          text: "Elle est offerte gratuitement par le gouvernement",
          correct: false,
          explanation: "L’assurance individuelle est payante car elle est souscrite de manière volontaire."
        }
      ]
    }
  ],

  minigame: {
    type: 'coverage-architect',
    title: "🎯 Le Stratège de la Couverture",
    description: `
      🧩 Dans ce mini-jeu, vous devrez :
      - Identifier les zones non couvertes par les régimes publics
      - Construire des plans d’assurance sur mesure pour différents profils clients
      - Équilibrer budget, besoins et attentes !

      ⚠️ Attention aux exclusions et aux limites contractuelles !
    `,
    rewards: {
      xp: 450,
      badge: "Stratège Médical",
      title: "Maître de la Complémentarité"
    }
  },

  boss: {
    name: "👨‍⚖️ Le Juge des Lacunes",
    description: "Il vous teste sur votre capacité à repérer les trous dans la couverture publique et à les combler intelligemment.",
    difficulty: 4,
    quiz: [
      {
        question: "Quel soin suivant est souvent non couvert par la RAMQ mais pris en charge par une assurance privée ?",
        choices: [
          {
            text: "Les soins dentaires",
            correct: true,
            explanation: "Les soins dentaires ne sont généralement pas couverts par la RAMQ sauf situations d’urgence."
          },
          {
            text: "Les consultations médicales régulières",
            correct: false,
            explanation: "Celles-ci sont couvertes par le régime public."
          },
          {
            text: "Les chirurgies vitales",
            correct: false,
            explanation: "Elles sont toujours couvertes en hôpital."
          },
          {
            text: "Les vaccins contre la grippe saisonnière",
            correct: false,
            explanation: "Ces vaccins sont généralement gratuits via le système de santé."
          }
        ]
      }
    ],
    rewards: {
      xp: 800,
      badge: "Maître du Chapitre 4",
      title: "Expert en Lacunes Publiques"
    }
  }
};