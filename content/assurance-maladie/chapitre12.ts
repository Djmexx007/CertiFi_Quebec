import { Chapter } from '@/types/chapter';

export const chapter12: Chapter = {
  id: 'health-insurance-ch12',
  title: 'Réclamations, preuves et contestations : Le duel administratif',
  summary: `
    🧾 Agent, bienvenue dans l’arène de la paperasse !

    Tu croyais que le plus dur était de souscrire la police ? Détrompe-toi !
    Le vrai combat se joue souvent lors du dépôt de la réclamation.

    Dans ce chapitre, tu découvriras :
    - Les étapes du processus de réclamation 📄
    - Les types de preuves médicales exigées 🧠
    - Les droits de l'assuré et les motifs valides de refus 🛡️
    - Les options de contestation possibles ⚖️

    Prépare ton épée administrative et entre dans le ring !
  `,

  quiz: [
    {
      question: "📋 Lors d'une réclamation pour maladie, quel est généralement le premier document exigé ?",
      choices: [
        {
          text: "Un formulaire de réclamation dûment rempli",
          correct: true,
          explanation: "C’est le point de départ officiel de toute procédure de réclamation."
        },
        {
          text: "Un selfie dans la salle d’attente",
          correct: false,
          explanation: "Aussi authentique soit-il, ce n’est pas un document reconnu !"
        },
        {
          text: "Le code génétique du patient",
          correct: false,
          explanation: "Inutile ici. Ce n’est pas de la médecine de précision !"
        },
        {
          text: "Un poème expliquant la douleur vécue",
          correct: false,
          explanation: "Beau geste, mais pas contractuel !"
        }
      ]
    },
    {
      question: "🧠 Parmi ces éléments, lequel est souvent requis comme preuve de validité médicale ?",
      choices: [
        {
          text: "Un rapport signé d’un professionnel de la santé autorisé",
          correct: true,
          explanation: "Les assureurs exigent un document médical officiel, signé et daté."
        },
        {
          text: "Un témoignage de la voisine",
          correct: false,
          explanation: "Malgré sa compassion, ce n’est pas une source médicale."
        },
        {
          text: "Une capture d’écran d’un groupe Facebook de soutien",
          correct: false,
          explanation: "Cela peut être utile émotionnellement, mais ce n’est pas recevable légalement."
        },
        {
          text: "Un certificat de popularité du patient",
          correct: false,
          explanation: "Pas encore reconnu par l’Autorité des marchés financiers !"
        }
      ]
    },
    {
      question: "⚖️ Un assureur peut refuser une réclamation pour l'une de ces raisons. Laquelle ?",
      choices: [
        {
          text: "L'information fournie est incomplète ou fausse",
          correct: true,
          explanation: "C’est l’un des motifs les plus courants de refus : l’exactitude des données est cruciale."
        },
        {
          text: "Le nom de l’assuré ne sonne pas bien",
          correct: false,
          explanation: "Heureusement, ce n’est pas un critère juridique."
        },
        {
          text: "Le style du formulaire n’est pas à la mode",
          correct: false,
          explanation: "Le fond compte plus que la forme."
        },
        {
          text: "L’écriture est en bleu plutôt qu’en noir",
          correct: false,
          explanation: "Une préférence esthétique n’est pas un fondement légal de refus."
        }
      ]
    }
  ],

  minigame: {
    type: 'claim-challenge',
    title: '💼 Duel de Réclamation',
    description: `
      🕵️‍♂️ Analyse une série de demandes de prestations, identifie les erreurs, complète les formulaires correctement et fais triompher ton client !
      - Corrige les erreurs
      - Valide les documents nécessaires
      - Apprends les bonnes pratiques de réclamation !
    `,
    rewards: {
      xp: 300,
      badge: "Archiviste Maître",
      title: "Gladiateur Administratif"
    }
  },

  boss: {
    name: '📑 L’Implacable Vérificateur',
    description: 'Ce boss redoutable mettra ta maîtrise du processus de réclamation à rude épreuve. Erreur = Refus !',
    difficulty: 4,
    quiz: [
      {
        question: "Un assuré oublie de signer le formulaire. Que se passe-t-il ?",
        choices: [
          {
            text: "La réclamation est invalide tant que la signature n’est pas fournie",
            correct: true,
            explanation: "La signature atteste l’authenticité : sans elle, rien ne peut être validé."
          },
          {
            text: "L’assureur appelle pour signer à sa place",
            correct: false,
            explanation: "Ce serait gentil, mais illégal !"
          },
          {
            text: "La réclamation est acceptée sans délai",
            correct: false,
            explanation: "Impossible sans validation du document."
          },
          {
            text: "Le dossier est encadré et exposé au musée des erreurs",
            correct: false,
            explanation: "Drôle, mais il sera simplement rejeté."
          }
        ]
      }
    ],
    rewards: {
      xp: 500,
      badge: "Maître des Réclamations",
      title: "Briseur de Dossiers"
    }
  }
};