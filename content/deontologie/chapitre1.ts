import { Chapter } from '@/types/chapter';

export const chapter1: Chapter = {
  id: 'legal-framework-ch1',
  title: 'Cadre Légal de l\'Assurance de Personnes au Québec',
  summary: `
    🎮 Agent, bienvenue dans le monde juridique de l'assurance !

    Votre mission : maîtriser les fondements légaux qui régissent notre profession.

    Dans ce chapitre, vous explorerez :
    - Les secrets du Code civil du Québec 📜
    - L'art des contrats et des statuts juridiques ⚖️
    - La magie des droits et obligations ✨
    - Le pouvoir des relations légales 🤝

    Souvenez-vous : La loi est votre alliée dans la protection des clients ! 
  `,
  
  quiz: [
    {
      question: "Quelle est l'importance du Code civil du Québec en assurance ?",
      choices: [
        {
          text: "Il établit les règles fondamentales régissant les contrats d'assurance et les droits des assurés",
          correct: true,
          explanation: "Le Code civil est la source principale du droit en assurance au Québec."
        },
        {
          text: "Il donne des recettes de poutine",
          correct: false,
          explanation: "Le Code civil traite du droit, pas de gastronomie !"
        },
        {
          text: "Il raconte des histoires drôles",
          correct: false,
          explanation: "C'est un texte juridique sérieux, pas un recueil d'humour !"
        },
        {
          text: "Il donne des conseils de mode",
          correct: false,
          explanation: "Le Code civil établit des règles de droit, pas de style vestimentaire !"
        }
      ]
    },
    {
      question: "Quelle est la différence entre une personne physique et une personne morale ?",
      choices: [
        {
          text: "Une personne physique est un être humain, une personne morale est une entité juridique comme une entreprise",
          correct: true,
          explanation: "Cette distinction est fondamentale en droit civil."
        },
        {
          text: "L'une fait du sport, l'autre de la philosophie",
          correct: false,
          explanation: "La différence est juridique, pas liée aux activités !"
        },
        {
          text: "L'une est plus gentille que l'autre",
          correct: false,
          explanation: "La moralité n'a rien à voir avec cette classification juridique !"
        },
        {
          text: "L'une existe le jour, l'autre la nuit",
          correct: false,
          explanation: "Les deux types existent en permanence dans le système juridique !"
        }
      ]
    },
    {
      question: "Quels sont les effets juridiques du mariage ou de l'union civile ?",
      choices: [
        {
          text: "Ils créent des droits et obligations mutuels, notamment en matière de patrimoine",
          correct: true,
          explanation: "Ces unions ont des implications légales importantes pour les conjoints."
        },
        {
          text: "Ils donnent des super-pouvoirs",
          correct: false,
          explanation: "Les effets sont juridiques, pas surnaturels !"
        },
        {
          text: "Ils offrent des rabais d'épicerie",
          correct: false,
          explanation: "Les avantages sont légaux, pas commerciaux !"
        },
        {
          text: "Ils permettent de voler",
          correct: false,
          explanation: "Les effets concernent les droits et obligations, pas des capacités physiques !"
        }
      ]
    }
  ],

  minigame: {
    type: 'legal-master',
    title: "Le Maître du Droit",
    description: `
      🎮 Devenez le Maître du Droit dans ce mini-jeu juridique !
      
      Votre mission :
      - Naviguez dans le Code civil
      - Maîtrisez les statuts juridiques
      - Comprenez les contrats
      - Protégez les droits des clients
      
      Attention aux subtilités juridiques et aux obligations légales !
    `,
    rewards: {
      xp: 200,
      badge: "Maître du Droit",
      title: "Gardien de la Loi"
    }
  },

  boss: {
    name: "Le Juge Suprême",
    description: "Un boss redoutable qui teste votre maîtrise du cadre légal !",
    difficulty: 4,
    rewards: {
      xp: 500,
      badge: "Maître du Chapitre 1",
      title: "Champion du Droit"
    }
  }
};