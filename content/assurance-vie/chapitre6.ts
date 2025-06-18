import { Chapter } from '@/types/chapter';

export const chapter6: Chapter = {
  id: 'life-insurance-ch6',
  title: '🏰 La Guilde des Assurés',
  summary: `
🤝 Bienvenue, Agent ! Vous entrez dans la guilde des grandes protections collectives.

Aujourd’hui, vous apprendrez :
- Les secrets des contrats d’assurance groupe 🛡️
- Les avantages pour les membres (et les pièges à éviter) 🎁
- Comment un héros solitaire peut prolonger sa protection même après avoir quitté la guilde 🧳

Rappelez-vous : en assurance, l’union fait la force… mais la sortie du groupe, ça se prépare !
  `,

  quiz: [
    {
      question: "🤔 Pourquoi l’assurance collective coûte-t-elle souvent moins cher qu’une assurance individuelle ?",
      choices: [
        {
          text: "Parce que le risque est mutualisé sur plusieurs personnes",
          correct: true,
          explanation: "Exact ! Plus il y a de membres dans la guilde, plus le coût est partagé, ce qui diminue la prime pour chacun."
        },
        {
          text: "Parce que les employeurs lancent des promotions secrètes",
          correct: false,
          explanation: "Les primes sont calculées selon les principes actuariels, pas les soldes du vendredi fou !"
        },
        {
          text: "Parce que le gouvernement subventionne toutes les protections collectives",
          correct: false,
          explanation: "Certaines déductions fiscales existent, mais le prix dépend surtout de la masse assurée."
        },
        {
          text: "Parce que l’assurance collective est moins bonne",
          correct: false,
          explanation: "Elle peut être très efficace, mais standardisée."
        }
      ]
    },
    {
      question: "🚪 Que se passe-t-il avec votre protection d’assurance collective lorsque vous quittez votre emploi ?",
      choices: [
        {
          text: "Vous pouvez la transformer en assurance individuelle sans preuve médicale",
          correct: true,
          explanation: "C’est la fameuse clause de conversion : très précieuse surtout en cas de problème de santé."
        },
        {
          text: "Vous la gardez à vie comme un souvenir",
          correct: false,
          explanation: "Non, elle s’éteint automatiquement à la fin du lien d’emploi, sauf conversion."
        },
        {
          text: "Elle vous suit à la maison comme une mascotte invisible",
          correct: false,
          explanation: "Aucune assurance n’a ce superpouvoir !"
        },
        {
          text: "Elle devient une loterie fiscale",
          correct: false,
          explanation: "Ce serait chaotique, et non réglementaire."
        }
      ]
    },
    {
      question: "🎓 Pourquoi les assureurs offrent-ils parfois l’assurance collective sans sélection médicale ?",
      choices: [
        {
          text: "Parce qu’ils appliquent une acceptation garantie à l’entrée dans le groupe",
          correct: true,
          explanation: "C’est un des grands avantages du collectif : couverture sans questionnaire pour les nouveaux membres."
        },
        {
          text: "Parce qu’ils veulent aller plus vite que leur ombre",
          correct: false,
          explanation: "C’est une question d’accessibilité, pas de rapidité far west !"
        },
        {
          text: "Parce qu’ils ont trop de stylos à utiliser",
          correct: false,
          explanation: "Aucune corrélation entre fournitures et politiques de souscription !"
        },
        {
          text: "Parce que ça rend les polices plus jolies",
          correct: false,
          explanation: "On parle d'efficacité, pas de design de document !"
        }
      ]
    }
  ],

  minigame: {
    type: 'guild-conversion',
    title: "🧙‍♂️ Le Convertisseur de Guildes",
    description: `
🎮 Votre mission :

- Recrutez des membres dans une guilde avec des protections collectives
- Gérez leur parcours (embauche, sortie, retraite)
- Offrez des conversions adaptées avant qu’ils se retrouvent sans couverture !

Mais attention : un oubli, et votre héros se retrouve nu face au risque...
    `,
    rewards: {
      xp: 450,
      badge: "Protecteur Syndical",
      title: "Gardien des Contrats Collectifs"
    }
  },

  boss: {
    name: "🕳️ Le Vide Assurantiel",
    description: "Ce boss sournois attend que vous quittiez la guilde sans conversion... et il frappe fort !",
    difficulty: 4,
    quiz: [
      {
        question: "👀 Quelle erreur grave un agent pourrait-il commettre avec un client quittant un régime collectif ?",
        choices: [
          {
            text: "Oublier d’expliquer son droit de transformation",
            correct: true,
            explanation: "Cette omission pourrait laisser un client sans couverture, et causer des ennuis... légaux et moraux."
          },
          {
            text: "Suggérer de devenir moine",
            correct: false,
            explanation: "Changer de vie est noble, mais ça ne remplace pas une assurance !"
          },
          {
            text: "Convertir la police en abonnement de streaming",
            correct: false,
            explanation: "On ne parle pas d’un forfait multimédia, mais de sécurité financière."
          },
          {
            text: "Faire signer le nouveau contrat avec une baguette magique",
            correct: false,
            explanation: "Les contrats doivent être légaux, pas enchantés."
          }
        ]
      }
    ],
    rewards: {
      xp: 800,
      badge: "Dompteur du Vide",
      title: "Stratège Collectif"
    }
  }
};
