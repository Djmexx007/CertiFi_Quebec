import { Chapter } from '@/types/chapter';

export const chapter8: Chapter = {
  id: 'investment-ch8',
  title: 'Gestion du Profil d\'Investisseur',
  summary: `
    🎮 Agent, bienvenue au Centre d'Analyse des Investisseurs !

    Votre mission : maîtriser l'art de comprendre et gérer les profils d'investisseurs.

    Dans ce chapitre, vous explorerez :
    - Les secrets de l'analyse financière 📊
    - L'art de l'évaluation des besoins 🎯
    - La magie de la tolérance au risque ✨
    - Le pouvoir des objectifs d'investissement 💫

    Souvenez-vous : Un bon profil est la base d'un investissement réussi ! 
  `,
  
  quiz: [
    {
      question: "Quels éléments clés composent un profil d'investisseur ?",
      choices: [
        {
          text: "Objectifs, horizon, tolérance au risque et situation financière",
          correct: true,
          explanation: "Ces éléments permettent de créer un portrait complet de l'investisseur."
        },
        {
          text: "Signe astrologique et couleur préférée",
          correct: false,
          explanation: "Le profil se base sur des critères objectifs, pas personnels !"
        },
        {
          text: "Nombre de followers sur Instagram",
          correct: false,
          explanation: "Les réseaux sociaux ne sont pas pertinents pour l'investissement !"
        },
        {
          text: "Marque de voiture préférée",
          correct: false,
          explanation: "Les préférences de consommation ne définissent pas le profil d'investisseur !"
        }
      ]
    },
    {
      question: "Comment évaluer la tolérance au risque ?",
      choices: [
        {
          text: "Par des questions sur les réactions aux fluctuations de marché et les objectifs",
          correct: true,
          explanation: "La tolérance au risque combine aspects émotionnels et rationnels."
        },
        {
          text: "En regardant dans une boule de cristal",
          correct: false,
          explanation: "L'évaluation doit être méthodique, pas mystique !"
        },
        {
          text: "En lançant des dés",
          correct: false,
          explanation: "Le hasard n'a pas sa place dans l'évaluation du risque !"
        },
        {
          text: "En demandant à un devin",
          correct: false,
          explanation: "L'évaluation doit être professionnelle et objective !"
        }
      ]
    },
    {
      question: "Pourquoi l'horizon de placement est-il important ?",
      choices: [
        {
          text: "Il détermine la capacité à supporter la volatilité et le choix des placements",
          correct: true,
          explanation: "Un horizon plus long permet généralement plus de risque."
        },
        {
          text: "Pour planifier ses vacances",
          correct: false,
          explanation: "L'horizon concerne les investissements, pas les loisirs !"
        },
        {
          text: "Pour choisir la couleur du portefeuille",
          correct: false,
          explanation: "L'horizon influence la stratégie, pas l'apparence !"
        },
        {
          text: "Pour impressionner ses amis",
          correct: false,
          explanation: "L'horizon est un outil de planification, pas de prestige !"
        }
      ]
    }
  ],

  minigame: {
    type: 'profile-master',
    title: "Le Maître des Profils",
    description: `
      🎮 Devenez le Maître des Profils dans ce mini-jeu stratégique !
      
      Votre mission :
      - Analysez les situations financières
      - Évaluez les tolérances au risque
      - Déterminez les horizons de placement
      - Créez des profils optimaux
      
      Attention aux changements de situation et aux objectifs contradictoires !
    `,
    rewards: {
      xp: 550,
      badge: "Maître des Profils",
      title: "Analyste Suprême"
    }
  },

  boss: {
    name: "L'Oracle des Investisseurs",
    description: "Un boss redoutable qui teste votre capacité à comprendre les investisseurs !",
    difficulty: 5,
    rewards: {
      xp: 1100,
      badge: "Maître du Chapitre 8",
      title: "Champion des Profils"
    }
  }
};