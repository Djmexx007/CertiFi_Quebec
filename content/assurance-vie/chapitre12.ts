import { Chapter } from '@/types/chapter';

export const chapter12: Chapter = {
  id: 'life-insurance-ch12',
  title: '🏆 L’Examen du Gardien',
  summary: `
🎓 Agent, te voilà face au **test ultime** !

Ce chapitre spécial est un condensé de toutes les notions critiques d’assurance vie. Tu devras :
- Combiner tes connaissances de produits, fiscalité et besoins clients
- Démasquer les pièges théoriques
- Réagir comme un vrai conseiller… éthique et stratégique !

🎯 Seul un **Véritable Gardien** franchira cette épreuve sans trébucher.
  `,

  quiz: [
    {
      question: "🔐 Un client veut laisser un capital à ses enfants, mais veut éviter les frais successoraux. Que recommandes-tu ?",
      choices: [
        {
          text: "Désigner directement les enfants comme bénéficiaires d’une police d’assurance vie",
          correct: true,
          explanation: "Cela évite les délais et les frais associés à la succession tout en garantissant une transmission directe."
        },
        {
          text: "Mettre l’assurance dans le testament",
          correct: false,
          explanation: "Cela rend la prestation imposable et la soumet aux créanciers potentiels."
        },
        {
          text: "Ouvrir un compte épargne à son nom",
          correct: false,
          explanation: "Les comptes bancaires ne sont pas à l’abri des frais successoraux."
        },
        {
          text: "Faire un don à son chat",
          correct: false,
          explanation: "Les animaux ne peuvent pas être bénéficiaires légaux !"
        }
      ]
    },
    {
      question: "📉 Quelle action devrait déclencher une révision immédiate de la protection d’assurance vie d’un client ?",
      choices: [
        {
          text: "Un changement majeur dans sa situation personnelle ou financière",
          correct: true,
          explanation: "Nouveau mariage, enfant, emploi, entreprise… tout cela impacte les besoins de couverture."
        },
        {
          text: "Un changement de coiffure",
          correct: false,
          explanation: "Pas d’effet sur les risques assurables (sauf si c’est une coupe vraiment risquée ? 😅)"
        },
        {
          text: "La signature d’un bail",
          correct: false,
          explanation: "À moins d’une hypothèque, cela ne change pas grand-chose."
        },
        {
          text: "Une envie de changer de conseiller",
          correct: false,
          explanation: "La police peut continuer malgré le changement de représentant."
        }
      ]
    },
    {
      question: "⚖️ Quel est **le risque le plus fréquent** dans une désignation de bénéficiaire mal réfléchie ?",
      choices: [
        {
          text: "Qu’un ex-conjoint reçoive la prestation par erreur",
          correct: true,
          explanation: "Les bénéficiaires doivent être revus régulièrement pour éviter les erreurs involontaires et les conflits."
        },
        {
          text: "Que le notaire doive intervenir en costume",
          correct: false,
          explanation: "Le code vestimentaire du notaire ne change rien au dossier."
        },
        {
          text: "Que l’assurance prenne feu",
          correct: false,
          explanation: "Une police n’est pas inflammable, heureusement !"
        },
        {
          text: "Que les héritiers se perdent en forêt",
          correct: false,
          explanation: "Même dans un conte de fées, ce n’est pas très probable..."
        }
      ]
    }
  ],

  minigame: {
    type: 'final-challenge',
    title: "🏁 Le Défi du Maître",
    description: `
🎮 Dans ce mini-jeu final, tu reçois plusieurs profils clients avec des défis croisés :

- Besoins changeants
- Budget limité
- Objectifs contradictoires
- Fiscalité à optimiser

Sauras-tu recommander **la bonne couverture au bon moment** ?
    `,
    rewards: {
      xp: 1000,
      badge: "Gardien d'Or",
      title: "Diplômé de l’OCRA"
    }
  },

  boss: {
    name: "🧠 Le Casseur de Logique",
    description: "Il attaque les failles dans ton raisonnement. Il adore les recommandations bancales, les oublis fiscaux et les clauses contradictoires.",
    difficulty: 5,
    quiz: [
      {
        question: "⚔️ Quelle recommandation serait jugée non conforme au devoir de conseil ?",
        choices: [
          {
            text: "Suggérer une assurance vie sans avoir évalué les protections déjà existantes",
            correct: true,
            explanation: "Tu dois toujours analyser d’abord. Recommander sans analyser, c’est un manquement grave."
          },
          {
            text: "Proposer un montant raisonnable selon les objectifs",
            correct: false,
            explanation: "C’est exactement ce qu’il faut faire !"
          },
          {
            text: "Réviser une protection après un mariage",
            correct: false,
            explanation: "Parfaitement logique. Le besoin change avec les événements de vie."
          },
          {
            text: "Recommander une assurance temporaire pour un besoin de 10 ans",
            correct: false,
            explanation: "C’est un bon réflexe. La durée du besoin = la durée du produit."
          }
        ]
      }
    ],
    rewards: {
      xp: 1500,
      badge: "Érudit Finaliste",
      title: "Légende de l’Assurance Vie"
    }
  }
};
