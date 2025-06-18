import { Chapter } from '@/types/chapter';

export const chapter11: Chapter = {
  id: 'health-insurance-ch11',
  title: "Les exclusions et restrictions : l'art de lire entre les lignes",
  summary: `
    📜 Bienvenue dans l'antre des petites lignes du contrat, Agent !

    Vous voilà au seuil du chapitre 11, où se cachent les exclusions, les restrictions et toutes les subtilités qui transforment un super contrat en... simple promesse conditionnelle.

    Dans ce chapitre, vous découvrirez :
    - Les exclusions standard et surprenantes ❌
    - Les clauses d'attente et leurs pièges 🕒
    - Les motifs de refus de prestation 😱

    Préparez votre loupe, votre logique... et votre sens de la justice !
  `,

  quiz: [
    {
      question: "🔍 Quel est le rôle principal des exclusions dans un contrat d'assurance maladie ?",
      choices: [
        {
          text: "Limiter la couverture à des situations définies et éviter les abus",
          correct: true,
          explanation: "Les exclusions servent à encadrer les garanties et protéger la viabilité financière du régime."
        },
        {
          text: "Confondre les clients avec du jargon complexe",
          correct: false,
          explanation: "Même si elles sont parfois mal comprises, les exclusions ne sont pas là pour créer la confusion volontairement."
        },
        {
          text: "Offrir des rabais sur les primes",
          correct: false,
          explanation: "Les exclusions ne réduisent pas automatiquement les primes."
        },
        {
          text: "Servir de décoration légale au contrat",
          correct: false,
          explanation: "Elles ont un véritable rôle juridique et financier."
        }
      ]
    },
    {
      question: "🧠 Une clause de délai d'attente signifie que...",
      choices: [
        {
          text: "Le contrat est valide, mais certaines garanties ne s'appliquent qu'après un certain temps",
          correct: true,
          explanation: "Le délai d'attente est une période durant laquelle une couverture spécifique n'est pas encore en vigueur."
        },
        {
          text: "L'assureur attend votre appel pour activer la couverture",
          correct: false,
          explanation: "La couverture débute automatiquement selon les modalités, pas sur appel."
        },
        {
          text: "Le contrat est suspendu jusqu'à nouvel ordre",
          correct: false,
          explanation: "La police est généralement en vigueur, mais certaines protections sont différées."
        },
        {
          text: "Vous devez fournir une preuve de patience psychologique",
          correct: false,
          explanation: "Ce serait original, mais ce n’est pas la réalité du contrat !"
        }
      ]
    },
    {
      question: "⚠️ Laquelle des situations suivantes peut entraîner un refus de prestation même avec une police en vigueur ?",
      choices: [
        {
          text: "Une blessure résultant d'une activité illégale",
          correct: true,
          explanation: "Les actes criminels sont presque toujours exclus des couvertures."
        },
        {
          text: "Un mal de tête le dimanche",
          correct: false,
          explanation: "Ce n’est pas un motif de refus, sauf si vous réclamez une chirurgie pour ça."
        },
        {
          text: "Un rhume mal documenté",
          correct: false,
          explanation: "La documentation médicale est importante, mais un simple rhume n'est pas une exclusion typique."
        },
        {
          text: "Un changement d'adresse sans avis",
          correct: false,
          explanation: "Un déménagement n’annule pas une couverture (mais prévenez l’assureur !)."
        }
      ]
    }
  ],

  minigame: {
    type: 'contract-reader',
    title: "🧾 Détective des Clauses",
    description: `
      🔍 Lisez attentivement des extraits de contrats fictifs et identifiez les pièges, exclusions et restrictions !
      - Repérez les exclusions cachées
      - Analysez les clauses douteuses
      - Protégez votre client de mauvaises surprises !
    `,
    rewards: {
      xp: 300,
      badge: "Chasseur de Pièges",
      title: "Décodeur Contractuel"
    }
  },

  boss: {
    name: "🕵️‍♂️ L'Enquêteur Juridique",
    description: "Ce boss rusé teste votre capacité à flairer les exclusions et à comprendre les subtilités des contrats.",
    difficulty: 3,
    quiz: [
      {
        question: "Un client déclare une maladie survenue durant le délai d'attente. Que se passe-t-il ?",
        choices: [
          {
            text: "La réclamation est refusée car la maladie est survenue durant le délai d'attente",
            correct: true,
            explanation: "Exact ! Le délai d’attente exclut temporairement certaines protections."
          },
          {
            text: "L’assureur paie quand même par courtoisie",
            correct: false,
            explanation: "Il n’est pas question de courtoisie ici, mais de respect des clauses."
          },
          {
            text: "La réclamation est suspendue jusqu’à ce que le délai soit écoulé",
            correct: false,
            explanation: "Non, elle est refusée. Le délai d’attente exclut rétroactivement."
          },
          {
            text: "Le client reçoit une compensation symbolique",
            correct: false,
            explanation: "Il n’y a pas de cadeau symbolique dans les contrats !"
          }
        ]
      }
    ],
    rewards: {
      xp: 500,
      badge: "Maître des Exceptions",
      title: "Dominateur des Petites Lignes"
    }
  }
};