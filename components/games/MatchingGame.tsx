import React, { useState, useEffect } from 'react';
import { Brain, Check, X } from 'lucide-react';

interface MatchingGameProps {
  onComplete: (score: number) => void;
}

interface Term {
  id: number;
  term: string;
  definition: string;
}

const terms: Term[] = [
  {
    id: 1,
    term: "Assurance vie temporaire",
    definition: "Protection pour une période déterminée avec prestation au décès"
  },
  {
    id: 2,
    term: "Fonds distincts",
    definition: "Produit d'investissement combinant placement et garanties d'assurance"
  },
  {
    id: 3,
    term: "Rente viagère",
    definition: "Revenu garanti versé jusqu'au décès du rentier"
  },
  {
    id: 4,
    term: "Police conjointe",
    definition: "Contrat couvrant deux personnes avec une seule police"
  },
  {
    id: 5,
    term: "Bénéficiaire",
    definition: "Personne désignée pour recevoir la prestation d'assurance"
  }
];

export const MatchingGame: React.FC<MatchingGameProps> = ({ onComplete }) => {
  const [score, setScore] = useState(0);
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [shuffledDefinitions, setShuffledDefinitions] = useState<Term[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);

  useEffect(() => {
    // Shuffle definitions
    setShuffledDefinitions([...terms].sort(() => Math.random() - 0.5));
  }, []);

  const handleTermClick = (id: number) => {
    if (matchedPairs.includes(id)) return;
    setSelectedTerm(id);
  };

  const handleDefinitionClick = (definition: Term) => {
    if (!selectedTerm || matchedPairs.includes(selectedTerm)) return;

    setAttempts(attempts + 1);
    
    if (definition.id === selectedTerm) {
      // Correct match
      setMatchedPairs([...matchedPairs, selectedTerm]);
      setScore(score + 100);
      setFeedback({ correct: true, message: "Match correct ! +100 points" });
      
      if (matchedPairs.length + 1 === terms.length) {
        // Game complete
        const finalScore = score + 100;
        const bonus = Math.max(0, 500 - (attempts * 50)); // Bonus points based on attempts
        const totalScore = finalScore + bonus;
        setTimeout(() => onComplete(totalScore), 1500);
      }
    } else {
      // Incorrect match
      setScore(Math.max(0, score - 25));
      setFeedback({ correct: false, message: "Essayez encore ! -25 points" });
    }

    setTimeout(() => {
      setSelectedTerm(null);
      setFeedback(null);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
          <Brain className="w-6 h-6" />
          Association de Termes
        </h2>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-green-900/30 rounded-full">
            Score: {score}
          </div>
          <div className="px-4 py-2 bg-green-900/30 rounded-full">
            Essais: {attempts}
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          feedback.correct ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {feedback.correct ? (
            <Check className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
          {feedback.message}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-6">
        {/* Terms */}
        <div className="space-y-3">
          {terms.map(term => (
            <button
              key={term.id}
              onClick={() => handleTermClick(term.id)}
              disabled={matchedPairs.includes(term.id)}
              className={`
                w-full p-4 rounded-lg text-left transition-all duration-300
                ${matchedPairs.includes(term.id)
                  ? 'bg-green-500/20 border-2 border-green-500'
                  : selectedTerm === term.id
                    ? 'bg-yellow-500/20 border-2 border-yellow-500'
                    : 'bg-black/30 border-2 border-green-500/30 hover:border-green-500/60'
                }
              `}
            >
              {term.term}
            </button>
          ))}
        </div>

        {/* Definitions */}
        <div className="space-y-3">
          {shuffledDefinitions.map(def => (
            <button
              key={def.id}
              onClick={() => handleDefinitionClick(def)}
              disabled={matchedPairs.includes(def.id)}
              className={`
                w-full p-4 rounded-lg text-left transition-all duration-300
                ${matchedPairs.includes(def.id)
                  ? 'bg-green-500/20 border-2 border-green-500'
                  : 'bg-black/30 border-2 border-green-500/30 hover:border-green-500/60'
                }
              `}
            >
              {def.definition}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};