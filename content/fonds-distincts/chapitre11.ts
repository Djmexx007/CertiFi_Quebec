import { Chapter } from '@/types/chapter';

export const chapter11: Chapter = {
  id: 'investment-ch11',
  title: 'Protection de l\'Investisseur',
  summary: `
    🎮 Agent, bienvenue au Centre de Protection !

    Votre mission : maîtriser l'art de la protection des investisseurs.

    Dans ce chapitre, vous explorerez :
    - Les secrets d'Assuris 🛡️
    - L'art de la protection contre les créanciers 💰
    - La magie des garanties de capital ✨
    - Le pouvoir des options de protection 💫

    Souvenez-vous : Un investisseur bien protégé est un investisseur confiant ! 
  `,
  
  quiz: [
    {
      question: "Quel est le rôle principal d'Assuris ?",
      choices: [
        {
          text: "Protéger les investisseurs contre l'insolvabilité des compagnies d'assurance",
          correct: true,
          explanation: "Assuris garantit une protection en cas de faillite d'un assureur."
        },
        {
          text: "Organiser des fêtes d'assurance",
          correct: false,
          explanation: "Assuris a un rôle de protection, pas d'animation !"
        },
        {
          text: "Distribuer des cadeaux aux assurés",
          correct: false,
          explanation: "Assuris offre une protection financière, pas des cadeaux !"
        },
        {
          text: "Noter les meilleurs assureurs",
          correct: false,
          explanation: "Assuris protège les assurés, elle ne note pas les assureurs !"
        }
      ]
    },
    {
      question: "Comment les fonds distincts protègent-ils contre les créanciers ?",
      choices: [
        {
          text: "Par la désignation d'un bénéficiaire privilégié",
          correct: true,
          explanation: "Cette désignation met les fonds à l'abri des créanciers."
        },
        {
          text: "En les cachant sous le matelas",
          correct: false,
          explanation: "La protection est légale, pas physique !"
        },
        {
          text: "En les transformant en chocolat",
          correct: false,
          explanation: "La protection est financière, pas alimentaire !"
        },
        {
          text: "En les envoyant sur la lune",
          correct: false,
          explanation: "La protection est juridique, pas spatiale !"
        }
      ]
    },
    {
      question: "Quels sont les avantages des garanties de capital ?",
      choices: [
        {
          text: "Protection du capital investi et potentiel de croissance",
          correct: true,
          explanation: "Les garanties offrent sécurité et opportunité de rendement."
        },
        {
          text: "Elles rendent immortel",
          correct: false,
          explanation: "Les garanties sont financières, pas magiques !"
        },
        {
          text: "Elles donnent des super-pouvoirs",
          correct: false,
          explanation: "Les garanties protègent l'argent, pas les personnes !"
        },
        {
          text: "Elles font gagner à la loterie",
          correct: false,
          explanation: "Les garanties ne sont pas des jeux de hasard !"
        }
      ]
    }
  ],

  minigame: {
    type: 'protection-master',
    title: "Le Maître de la Protection",
    description: `
      🎮 Devenez le Maître de la Protection dans ce mini-jeu stratégique !
      
      Votre mission :
      - Gérez les protections Assuris
      - Optimisez la protection contre les créanciers
      - Maximisez les garanties de capital
      - Sécurisez les investissements
      
      Attention aux risques cachés et aux failles de protection !
    `,
    rewards: {
      xp: 700,
      badge: "Maître Protecteur",
      title: "Gardien des Investisseurs"
    }
  },

  boss: {
    name: "Le Protecteur Suprême",
    description: "Un boss redoutable qui teste votre maîtrise de la protection des investisseurs !",
    difficulty: 5,
    rewards: {
      xp: 1400,
      badge: "Maître du Chapitre 11",
      title: "Champion de la Protection"
    }
  }
};