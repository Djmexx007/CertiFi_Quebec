import React, { useState } from 'react';
import { Book, Brain, Timer, Puzzle, ArrowLeft, ArrowRight, Star, Trophy, Gamepad2, Info } from 'lucide-react';
import { PreviewDisplay } from '../PreviewDisplay';

interface Game {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  howToPlay: string[];
  objectives: string[];
  tips: string[];
  rewards: string[];
  demo?: React.ReactNode;
}

const games: Game[] = [
  {
    id: 'memory',
    name: "Memory des Assurances",
    icon: Brain,
    description: "Testez et améliorez votre connaissance des termes d'assurance à travers un jeu de mémoire captivant.",
    howToPlay: [
      "Retournez une première carte pour découvrir un terme d'assurance",
      "Retournez une seconde carte pour trouver sa définition correspondante",
      "Faites des paires correctes pour gagner des points",
      "Complétez toutes les paires pour terminer le niveau"
    ],
    objectives: [
      "Maîtriser les termes clés des 4 domaines d'assurance",
      "Comprendre les définitions précises",
      "Développer sa mémoire professionnelle",
      "Gagner en rapidité de reconnaissance"
    ],
    tips: [
      "Commencez par les termes que vous connaissez déjà",
      "Lisez attentivement les définitions",
      "Faites des associations logiques",
      "Utilisez les indices visuels"
    ],
    rewards: [
      "XP bonus pour la rapidité",
      "Badges de maîtrise par domaine",
      "Titres spéciaux pour les scores parfaits",
      "Bonus pour les séries réussies"
    ],
    demo: (
      <div className="p-6 bg-black/30 rounded-lg border border-green-500/30">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-900/20 rounded border border-green-500/30">
            <h4 className="font-bold mb-2">Terme</h4>
            <p>Assurance vie temporaire</p>
          </div>
          <div className="p-4 bg-green-900/20 rounded border border-green-500/30">
            <h4 className="font-bold mb-2">Définition</h4>
            <p>Protection pour une période déterminée avec prestation au décès</p>
          </div>
        </div>
        <div className="mt-4 text-sm text-green-300/70">
          Exemple de paire à associer dans le jeu
        </div>
      </div>
    )
  },
  {
    id: 'matching',
    name: "Association de Termes",
    icon: Book,
    description: "Associez les termes avec leurs définitions dans un jeu de correspondance simple et efficace.",
    howToPlay: [
      "Cliquez sur un terme dans la colonne de gauche",
      "Cliquez sur la définition correspondante à droite",
      "Les bonnes paires sont validées automatiquement",
      "Complétez toutes les associations pour gagner"
    ],
    objectives: [
      "Comprendre les définitions",
      "Développer l'analyse",
      "Maîtriser le vocabulaire technique"
    ],
    tips: [
      "Commencez par les termes familiers",
      "Utilisez l'élimination pour les plus difficiles",
      "Relisez chaque définition attentivement"
    ],
    rewards: [
      "Points bonus pour la précision",
      "Récompense pour zéro erreur",
      "XP pour rapidité"
    ]
  },
  {
    id: 'puzzle',
    name: "Puzzle de Processus",
    icon: Puzzle,
    description: "Réorganisez les éléments d'un document d'assurance pour comprendre sa structure.",
    howToPlay: [
      "Glissez les pièces ou cliquez pour les échanger",
      "Placez-les dans l'ordre logique",
      "Les bonnes positions sont validées automatiquement",
      "Terminez le puzzle pour gagner"
    ],
    objectives: [
      "Comprendre la structure des contrats",
      "Visualiser les étapes clés",
      "Maîtriser la séquence logique"
    ],
    tips: [
      "Identifiez le début et la fin",
      "Cherchez les transitions logiques",
      "Utilisez les indices de contenu"
    ],
    rewards: [
      "Bonus pour peu de mouvements",
      "Récompenses pour ordre parfait",
      "XP selon la rapidité"
    ]
  },
  {
    id: 'speed',
    name: "Quiz Express",
    icon: Timer,
    description: "Répondez rapidement à des quiz pour tester vos connaissances sous pression.",
    howToPlay: [
      "Lisez la question rapidement",
      "Choisissez la bonne réponse avant la fin du temps",
      "Les bonnes réponses enchaînées augmentent le score",
      "Chaque bonne réponse ajoute du temps"
    ],
    objectives: [
      "Améliorer la rapidité de rappel",
      "Développer la gestion du stress",
      "Renforcer les réflexes de réponse"
    ],
    tips: [
      "Restez concentré malgré le chrono",
      "Lisez toutes les options rapidement",
      "Fiez-vous à votre intuition"
    ],
    rewards: [
      "Multiplicateur de score",
      "Bonus de temps",
      "XP pour rapidité et précision"
    ]
  }
];

interface TutorialProps {
  onBack: () => void;
  onStartGame: (gameId: string) => void;
}

export const Tutorial: React.FC<TutorialProps> = ({ onBack, onStartGame }) => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="space-y-4">
      {!selectedGame ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game)}
              className="p-6 rounded-xl border-2 border-green-900/50 hover:border-green-700 bg-black/30 text-left transition-all"
            >
              <game.icon className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-bold mb-2">{game.name}</h3>
              <p className="text-green-300/70 text-sm">{game.description}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-6 bg-black/30 rounded-xl border-2 border-green-500/30">
            <div className="flex items-center gap-4 mb-6">
              <selectedGame.icon className="w-12 h-12" />
              <div>
                <h2 className="text-xl font-bold">{selectedGame.name}</h2>
                <p className="text-green-300/70">{selectedGame.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Book className="w-5 h-5" />
                  Comment jouer
                </h3>
                <ul className="space-y-2">
                  {selectedGame.howToPlay.map((step, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-green-400">{index + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Objectifs
                </h3>
                <ul className="space-y-2">
                  {selectedGame.objectives.map((objective, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-yellow-400">•</span>
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {selectedGame.demo && (
            <PreviewDisplay>
              <div className="p-6">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <Gamepad2 className="w-5 h-5" />
                  Démonstration
                </h3>
                {selectedGame.demo}
              </div>
            </PreviewDisplay>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-black/30 rounded-xl border-2 border-green-500/30">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5" />
                Conseils
              </h3>
              <ul className="space-y-2">
                {selectedGame.tips.map((tip, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-green-400">💡</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-black/30 rounded-xl border-2 border-green-500/30">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5" />
                Récompenses
              </h3>
              <ul className="space-y-2">
                {selectedGame.rewards.map((reward, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-yellow-400">🏆</span>
                    {reward}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setSelectedGame(null)}
              className="px-6 py-3 rounded-lg bg-black/30 border-2 border-green-500/30 hover:bg-green-900/30 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Autres mini-jeux
            </button>
            <button
              onClick={() => onStartGame(selectedGame.id)}
              className="px-6 py-3 rounded-lg bg-green-500/20 border-2 border-green-500 hover:bg-green-500/30 transition-all flex items-center gap-2"
            >
              Commencer
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};