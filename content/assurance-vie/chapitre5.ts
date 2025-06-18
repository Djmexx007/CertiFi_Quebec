import { Chapter } from '@/types/chapter';

export const chapter5: Chapter = {
  id: 'life-insurance-ch5',
  title: "🎯 Les Power-Ups de la Protection",
  summary: `
🛠️ Agent, bienvenue dans l’atelier secret des avenants !

Ta mission ? Maîtriser l’art de modifier et d’amplifier une police d’assurance vie grâce aux garanties supplémentaires.

Dans ce chapitre, tu apprendras :
- À personnaliser une couverture comme un vrai architecte du risque
- À transformer une simple police en armure de niveau légendaire
- À composer des combos d’avenants dignes d’un RPG stratégique

Prêt à booster ta protection ? 💪
`,

  quiz: [
    {
      question: "🧩 Qu’est-ce qu’un avenant en assurance vie ?",
      choices: [
        {
          text: "Une option facultative qu’on ajoute à une police pour l’adapter",
          correct: true,
          explanation: "C’est comme un module additionnel : l’avenant permet d’ajuster la couverture selon les besoins précis du client."
        },
        {
          text: "Un formulaire de résiliation",
          correct: false,
          explanation: "L’avenant modifie ou améliore la police, il ne la termine pas."
        },
        {
          text: "Un contrat séparé à souscrire en parallèle",
          correct: false,
          explanation: "Il est rattaché à une police principale, ce n’est pas un produit autonome."
        },
        {
          text: "Une clause d’exclusion déguisée",
          correct: false,
          explanation: "Au contraire, c’est souvent une extension, pas une réduction !"
        }
      ]
    },
    {
      question: "💥 Quel avenant permet de doubler la prestation si le décès est accidentel ?",
      choices: [
        {
          text: "L’avenant décès accidentel",
          correct: true,
          explanation: "Exact ! Il double la prestation de base si le décès est causé par un accident, selon les conditions prévues."
        },
        {
          text: "L’avenant « SuperChance »",
          correct: false,
          explanation: "Ce n’est pas un jeu de hasard, mais un contrat d’assurance bien précis."
        },
        {
          text: "L’option turbo vie entière",
          correct: false,
          explanation: "Inventive, mais pas réelle !"
        },
        {
          text: "L’avenant prévoyance extrême",
          correct: false,
          explanation: "Aucun avenant ne porte ce nom (même s’il sonne bien)."
        }
      ]
    },
    {
      question: "🧠 Pourquoi est-il important de bien choisir ses avenants ?",
      choices: [
        {
          text: "Parce qu’ils peuvent adapter précisément la couverture à la réalité du client",
          correct: true,
          explanation: "Chaque avenant cible un besoin spécifique : invalidité, maladies graves, enfants assurés, etc."
        },
        {
          text: "Parce qu’ils sont gratuits et donc utiles à tout prix",
          correct: false,
          explanation: "Faux ! Ils entraînent souvent un coût supplémentaire."
        },
        {
          text: "Parce qu’ils remplacent le testament",
          correct: false,
          explanation: "Aucun avenant ne remplace les documents juridiques de succession."
        },
        {
          text: "Parce qu’ils garantissent une rentabilité assurée",
          correct: false,
          explanation: "Les avenants ne sont pas des produits d’investissement !"
        }
      ]
    }
  ],

  minigame: {
    type: 'rider-builder',
    title: "🧱 L’Atelier des Avenants",
    description: `
🎮 Crée la couverture d’assurance ultime en combinant plusieurs avenants :

- Analyse les besoins du client (famille, revenu, risques)
- Choisis les avenants appropriés (accident, invalidité, maladie grave, enfants, etc.)
- Respecte le budget sans trop alourdir la prime

Fais les bons choix, ou la police deviendra une armure pleine de trous !
    `,
    rewards: {
      xp: 400,
      badge: "Forgeur de Polices",
      title: "Maître des Avenants"
    }
  },

  boss: {
    name: "🧟‍♂️ L’Avenant Maudit",
    description: "Ce boss surgit lorsqu’on choisit mal ses protections… et il adore exploiter les oublis de garanties !",
    difficulty: 4,
    quiz: [
      {
        question: "🎓 Quelle erreur un conseiller doit-il absolument éviter avec les avenants ?",
        choices: [
          {
            text: "Oublier d’expliquer leurs limites et exclusions",
            correct: true,
            explanation: "Un client mal informé pourrait croire être protégé… alors que ce n’est pas le cas. Et ça finit souvent au tribunal !"
          },
          {
            text: "Ne pas offrir d’avenant pour les clients célibataires",
            correct: false,
            explanation: "Le statut marital ne détermine pas l’utilité d’un avenant."
          },
          {
            text: "Ne jamais les combiner",
            correct: false,
            explanation: "Ils sont faits pour être combinés de façon stratégique !"
          },
          {
            text: "Refuser tout avenant avant 40 ans",
            correct: false,
            explanation: "C’est l’analyse des besoins qui guide, pas l’âge en soi."
          }
        ]
      }
    ],
    rewards: {
      xp: 700,
      badge: "Chasseur d’Omissions",
      title: "Protecteur Absolu"
    }
  }
};
