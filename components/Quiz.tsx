import React, { useState } from 'react';
import { Brain, ThumbsUp, ThumbsDown, ArrowRight } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  funFact: string;
}

const questions: Question[] = [
  {
    id: 1,
    text: "Qu'est-ce qui caractérise une assurance vie temporaire ?",
    options: [
      "Elle dure jusqu'à ce que votre chat devienne millionnaire",
      "Elle offre une protection pour une période déterminée",
      "Elle s'arrête quand vous devenez immortel",
      "Elle expire quand vous oubliez de payer Netflix"
    ],
    correctAnswer: 1,
    explanation: "L'assurance vie temporaire offre une protection pour une période déterminée (10, 20, 30 ans). Si le décès survient pendant cette période, une prestation est versée.",
    funFact: "C'est comme un parapluie financier... mais ne l'utilisez pas sous la pluie ! ☔"
  },
  {
    id: 2,
    text: "Quelle est la différence entre une police conjointe-premier décès et dernier décès ?",
    options: [
      "La première est plus rapide à remplir",
      "La première paie au premier décès, la seconde au dernier",
      "L'une est en papier recyclé, l'autre non",
      "L'une sent la vanille, l'autre le chocolat"
    ],
    correctAnswer: 1,
    explanation: "La police conjointe-premier décès verse la prestation au premier décès, tandis que la police conjointe-dernier décès verse au dernier décès.",
    funFact: "C'est comme le jeu des chaises musicales, mais en version assurance ! 🪑"
  },
  {
    id: 3,
    text: "Pourquoi choisir une assurance temporaire décroissante ?",
    options: [
      "Pour impressionner ses amis",
      "Pour couvrir un prêt qui diminue avec le temps",
      "Parce que les chiffres qui baissent sont plus jolis",
      "Pour suivre la mode des régimes"
    ],
    correctAnswer: 1,
    explanation: "L'assurance temporaire décroissante est idéale pour couvrir un prêt car le montant diminue au fil du temps, comme votre dette.",
    funFact: "C'est comme un compte à rebours, mais pour votre hypothèque ! ⏰"
  },
  {
    id: 4,
    text: "Que signifie 'transformable' en assurance vie temporaire ?",
    options: [
      "La police se transforme en robot la nuit",
      "On peut la transformer en assurance vie permanente sans examen médical",
      "Elle change de couleur selon l'humeur",
      "Elle se plie en origami"
    ],
    correctAnswer: 1,
    explanation: "Une assurance transformable peut être convertie en assurance vie permanente sans nouvelle preuve d'assurabilité.",
    funFact: "C'est comme un Pokémon qui évolue, mais version assurance ! 🔄"
  },
  {
    id: 5,
    text: "Quel est l'avantage principal de l'assurance vie temporaire ?",
    options: [
      "Elle fait perdre du poids",
      "Son coût initial est bas",
      "Elle donne des points Air Miles",
      "Elle raconte des blagues"
    ],
    correctAnswer: 1,
    explanation: "L'assurance vie temporaire offre une protection à coût initial bas, idéale pour les besoins temporaires.",
    funFact: "C'est le menu économique du fast-food de l'assurance... mais en plus sain ! 🍔"
  }
];

const MiniGame: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const handleAnswer = (optionIndex: number) => {
    setSelectedAnswer(optionIndex);
    setShowExplanation(true);
    if (optionIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
      setSelectedAnswer(null);
    }
  };

  const question = questions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-black/30 rounded-xl border-2 border-green-500/30">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-green-400 flex items-center gap-2">
          <Brain className="w-6 h-6" />
          Quiz AssVie - Chapitre 2: Assurance Vie Temporaire
        </h2>
        <div className="px-4 py-2 bg-green-900/30 rounded-full">
          Score: {score}/{questions.length}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg mb-4 text-green-300">
          {currentQuestion + 1}. {question.text}
        </h3>
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={showExplanation}
              className={`
                w-full p-4 rounded-lg text-left transition-all duration-300
                ${showExplanation 
                  ? index === question.correctAnswer
                    ? 'bg-green-500/20 border-2 border-green-500'
                    : selectedAnswer === index
                      ? 'bg-red-500/20 border-2 border-red-500'
                      : 'bg-black/30 border-2 border-transparent opacity-50'
                  : 'bg-black/30 border-2 border-green-500/30 hover:border-green-500/60'
                }
              `}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {showExplanation && (
        <div className="mb-6 p-4 rounded-lg bg-green-900/30 border border-green-500/30">
          <div className="flex items-start gap-2 mb-2">
            {selectedAnswer === question.correctAnswer ? (
              <ThumbsUp className="w-5 h-5 text-green-500 mt-1" />
            ) : (
              <ThumbsDown className="w-5 h-5 text-red-500 mt-1" />
            )}
            <p className="text-green-300">{question.explanation}</p>
          </div>
          <p className="text-green-400/70 text-sm mt-2">{question.funFact}</p>
        </div>
      )}

      {showExplanation && currentQuestion < questions.length - 1 && (
        <button
          onClick={nextQuestion}
          className="w-full p-3 rounded-lg bg-green-500/20 border-2 border-green-500 hover:bg-green-500/30 transition-all duration-300 flex items-center justify-center gap-2"
        >
          Question suivante
          <ArrowRight className="w-4 h-4" />
        </button>
      )}

      {showExplanation && currentQuestion === questions.length - 1 && (
        <div className="text-center p-4 rounded-lg bg-green-900/30 border border-green-500/30">
          <p className="text-xl font-bold text-green-400 mb-2">
            Quiz terminé ! Score final : {score}/{questions.length}
          </p>
          <p className="text-green-300">
            {score === questions.length 
              ? "🏆 Parfait ! Tu es un expert de l'assurance vie temporaire !"
              : "Continue de t'entraîner pour maîtriser l'assurance vie temporaire !"}
          </p>
        </div>
      )}
    </div>
  );
};

export default MiniGame;