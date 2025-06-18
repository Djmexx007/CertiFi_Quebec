import { Chapter } from '@/types/chapter';

export const chapter5: Chapter = {
  id: 'legal-framework-ch5',
  title: 'Règlementation des Contrats d\'Assurance',
  summary: `
    🎮 Agent, bienvenue au Centre de Réglementation !

    Votre mission : maîtriser les règles qui régissent les contrats d'assurance.

    Dans ce chapitre, vous explorerez :
    - Les secrets de la formation des contrats 📜
    - L'art des modifications contractuelles ⚖️
    - La magie des garanties et exclusions ✨
    - Le pouvoir des avenants 🔄

    Souvenez-vous : Un contrat bien réglementé est un client bien protégé ! 
  `,
  
  quiz: [
    {
      question: "Quelles sont les conditions essentielles à la validité d'un contrat d'assurance ?",
      choices: [
        {
          text: "Consentement, capacité, objet et cause licites",
          correct: true,
          explanation: "Ces éléments fondamentaux assurent la validité juridique du contrat."
        },
        {
          text: "Une belle signature",
          correct: false,
          explanation: "L'apparence de la signature n'est pas une condition de validité !"
        },
        {
          text: "Un tampon doré",
          correct: false,
          explanation: "Les décorations ne sont pas des conditions légales !"
        },
        {
          text: "Une danse de la pluie",
          correct: false,
          explanation: "Les rituels n'ont rien à voir avec la validité du contrat !"
        }
      ]
    },
    {
      question: "Comment peut-on modifier un contrat d'assurance ?",
      choices: [
        {
          text: "Par un avenant signé par les parties",
          correct: true,
          explanation: "L'avenant est l'outil officiel pour modifier un contrat existant."
        },
        {
          text: "En le réécrivant au crayon",
          correct: false,
          explanation: "Les modifications doivent suivre un processus formel !"
        },
        {
          text: "En croisant les doigts",
          correct: false,
          explanation: "Les modifications nécessitent des documents officiels !"
        },
        {
          text: "Par télépathie",
          correct: false,
          explanation: "Les changements doivent être documentés formellement !"
        }
      ]
    },
    {
      question: "Que doit contenir une clause de réduction des garanties ?",
      choices: [
        {
          text: "Une description claire des limitations et exclusions",
          correct: true,
          explanation: "La transparence est essentielle pour la validité des exclusions."
        },
        {
          text: "Des dessins explicatifs",
          correct: false,
          explanation: "Les illustrations ne remplacent pas les termes légaux !"
        },
        {
          text: "Des blagues pour détendre l'atmosphère",
          correct: false,
          explanation: "Les clauses doivent être claires et professionnelles !"
        },
        {
          text: "Des émoticônes",
          correct: false,
          explanation: "Les symboles ne sont pas appropriés dans un contrat légal !"
        }
      ]
    }
  ],

  minigame: {
    type: 'regulation-master',
    title: "Le Maître de la Réglementation",
    description: `
      🎮 Devenez le Maître de la Réglementation dans ce mini-jeu juridique !
      
      Votre mission :
      - Vérifiez la validité des contrats
      - Gérez les modifications
      - Rédigez les exclusions
      - Protégez les droits des assurés
      
      Attention aux subtilités réglementaires et aux obligations légales !
    `,
    rewards: {
      xp: 400,
      badge: "Maître des Règlements",
      title: "Gardien des Normes"
    }
  },

  boss: {
    name: "Le Législateur Suprême",
    description: "Un boss redoutable qui teste votre maîtrise de la réglementation !",
    difficulty: 4,
    rewards: {
      xp: 900,
      badge: "Maître du Chapitre 5",
      title: "Champion des Règlements"
    }
  }
};