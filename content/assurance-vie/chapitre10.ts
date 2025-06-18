import { Chapter } from '@/types/chapter';

export const chapter10: Chapter = {
  id: 'life-insurance-ch10',
  title: '🧠 Scanner de Besoins',
  summary: `
Bienvenue, Analyste de la Protection Personnalisée !

Ta mission : devenir un **expert de l’évaluation client**. Avant toute recommandation, il faut savoir lire entre les lignes (bancaires).

Dans ce chapitre, tu vas :
- Décrypter les véritables besoins d’un client
- Identifier les protections existantes (et leurs lacunes)
- Éviter les doubles couvertures inutiles
- Proposer LA protection taillée sur mesure ✂️

🔍 La précision est ta meilleure arme. Prêt à analyser ?
  `,

  quiz: [
    {
      question: "🎯 Quel est le **but principal** d’une bonne évaluation des besoins ?",
      choices: [
        {
          text: "Fournir une protection adaptée et équilibrée",
          correct: true,
          explanation: "Exact ! Pas trop, pas pas assez. Juste ce qu’il faut pour couvrir les vrais risques."
        },
        {
          text: "Vendre le plus gros contrat possible",
          correct: false,
          explanation: "Non ! C’est contraire à l’éthique et souvent inefficace à long terme."
        },
        {
          text: "Faire durer la rencontre",
          correct: false,
          explanation: "On valorise l'efficacité, pas les rendez-vous sans fin."
        },
        {
          text: "Impressionner avec des graphiques 3D",
          correct: false,
          explanation: "Les visuels ne remplacent pas une analyse sérieuse."
        }
      ]
    },
    {
      question: "📊 Quels éléments doivent **absolument** faire partie de l’analyse des besoins ?",
      choices: [
        {
          text: "Revenus, dettes, protection actuelle, objectifs financiers",
          correct: true,
          explanation: "C’est la base : ces données permettent de calibrer la couverture optimale."
        },
        {
          text: "Le style vestimentaire du client",
          correct: false,
          explanation: "Ce n’est pas un critère pertinent dans une analyse sérieuse."
        },
        {
          text: "La race de son chien",
          correct: false,
          explanation: "Sauf s’il assure une clinique vétérinaire, cela n’est pas très utile 😅."
        },
        {
          text: "Le nombre de followers Instagram",
          correct: false,
          explanation: "Ce n’est pas une variable financière (pas encore…)."
        }
      ]
    },
    {
      question: "🛡️ Que signifie recommander un **montant de couverture raisonnable** ?",
      choices: [
        {
          text: "Que la somme assurée correspond aux besoins concrets du client",
          correct: true,
          explanation: "Ni trop, ni trop peu : c’est une question d’équilibre et d’éthique."
        },
        {
          text: "Qu’on choisit toujours un chiffre rond",
          correct: false,
          explanation: "Le montant se base sur une analyse, pas sur la beauté du chiffre."
        },
        {
          text: "Qu’on fait une moyenne de ses voisins",
          correct: false,
          explanation: "Chaque client a une situation unique !"
        },
        {
          text: "Qu’on laisse le client décider seul",
          correct: false,
          explanation: "C’est un travail d’accompagnement, pas une simple commande à la carte."
        }
      ]
    }
  ],

  minigame: {
    type: 'need-analyzer',
    title: "🔍 Analyseur de Besoins",
    description: `
🎮 Dans ce mini-jeu de simulation :

- Interrogez différents clients
- Identifiez leurs risques réels et protections existantes
- Proposez une couverture personnalisée et équilibrée

Attention : Surprotéger est aussi risqué que sous-protéger !
    `,
    rewards: {
      xp: 700,
      badge: "Conseiller Consciencieux",
      title: "Architecte des Besoins"
    }
  },

  boss: {
    name: "💀 Le Faux Besoin",
    description: "Ce boss apparaît lorsque vous recommandez une couverture excessive, inutile ou mal justifiée. Il attaque la crédibilité et l’éthique !",
    difficulty: 5,
    quiz: [
      {
        question: "⚠️ Quelle erreur mettrait votre recommandation en péril ?",
        choices: [
          {
            text: "Suggérer une couverture qui ne correspond pas au revenu ou aux objectifs du client",
            correct: true,
            explanation: "Ce serait perçu comme de la survente, voire un manquement déontologique."
          },
          {
            text: "Utiliser une calculatrice rose",
            correct: false,
            explanation: "L’outil n’est pas important, c’est ce qu’on en fait !"
          },
          {
            text: "Faire un café trop fort",
            correct: false,
            explanation: "Même s’il faut éviter l’excitation inutile, ce n’est pas un critère réglementaire 😄"
          },
          {
            text: "Proposer un montant pair",
            correct: false,
            explanation: "Ce n’est pas la parité numérique qui pose problème, mais la logique du montant."
          }
        ]
      }
    ],
    rewards: {
      xp: 1000,
      badge: "Maître de l’Équilibre",
      title: "Justicier des Recommandations"
    }
  }
};
