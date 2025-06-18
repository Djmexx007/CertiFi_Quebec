interface Chapter {
  id: number;
  title: string;
  content: string;
  summary: string;
}

interface Module {
  id: number;
  name: string;
  title: string;
  description: string;
  chapters: Chapter[];
}

export const modules: Module[] = [
  {
    id: 1,
    name: "AssVie",
    title: "Assurance Vie",
    description: "Découvrez les fondements et stratégies de l'assurance vie",
    chapters: [
      {
        id: 1,
        title: "Introduction au module d'Assurance vie",
        content: `
          1.1 Risque de décès
          Le risque de décès est la probabilité qu'une personne meure pendant une période donnée. Ce risque, bien que certain à long terme, a des impacts financiers importants s'il survient de façon prématurée.

          1.2 Impacts financiers potentiels du décès
          - Perte de revenu
          - Perte du soutien familial
          - Remboursement de dettes
          - Impôt sur le revenu
          - Accumulation et protection du patrimoine
          - Impacts sur les entreprises

          1.3 Stratégies de gestion du risque de décès
          - Évitement du risque
          - Réduction du risque
          - Acceptation du risque
          - Transfert du risque
        `,
        summary: "Introduction aux concepts fondamentaux de l'assurance vie et aux stratégies de gestion du risque de décès."
      },
      {
        id: 2,
        title: "Assurance Vie Temporaire",
        content: `
          2.1 Signification de « temporaire »
          Protection offerte pour une période déterminée avec prestation au décès pendant cette période.

          2.2 Titulaire de police et personne(s) assurée(s)
          - Titulaire : détenteur des droits
          - Assuré : personne sur qui repose le risque
          - Types de polices : individuelle, conjointe-premier décès, conjointe-dernier décès

          2.3 Prestation de décès
          - Temporaire à capital nivelé
          - Temporaire décroissante
          - Temporaire croissante

          2.4 Primes d'assurance vie temporaire
          - Mode de fixation des primes
          - Types de paiement

          2.5 Caractéristiques spéciales
          - Renouvelable ou non
          - Transformable
          - Clauses importantes
        `,
        summary: "Exploration détaillée de l'assurance vie temporaire, ses caractéristiques et ses applications."
      }
    ]
  },
  {
    id: 2,
    name: "AccMaladie",
    title: "Assurance Maladie",
    description: "Explorez les mystères de l'assurance maladie et accident",
    chapters: []
  },
  {
    id: 3,
    name: "PQAP",
    title: "Fonds Distincts et Rentes",
    description: "Maîtrisez les fonds distincts et les rentes",
    chapters: []
  },
  {
    id: 4,
    name: "Deonto",
    title: "Déontologie",
    description: "Affrontez les défis de la déontologie",
    chapters: []
  }
];