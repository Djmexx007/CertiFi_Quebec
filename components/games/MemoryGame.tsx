import React, { useState, useEffect } from 'react';
import { Brain, ThumbsUp, ThumbsDown } from 'lucide-react';

interface MemoryGameProps {
  onComplete: (score: number) => void;
}

interface Card {
  id: number;
  type: 'term' | 'definition';
  category: 'vie' | 'maladie' | 'fonds' | 'deonto';
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
  matchId: number;
}

const insuranceTerms = [
  // Assurance Vie
  {
    matchId: 1,
    category: 'vie',
    term: "Assurance vie temporaire",
    definition: "Protection pour une période déterminée avec prestation au décès"
  },
  {
    matchId: 2,
    category: 'vie',
    term: "Assurance vie permanente",
    definition: "Protection à vie avec composante d'épargne"
  },
  // Assurance Maladie
  {
    matchId: 3,
    category: 'maladie',
    term: "Invalidité totale",
    definition: "Incapacité complète d'exercer son emploi"
  },
  {
    matchId: 4,
    category: 'maladie',
    term: "Délai de carence",
    definition: "Période d'attente avant le versement des prestations"
  },
  // Fonds Distincts
  {
    matchId: 5,
    category: 'fonds',
    term: "Garantie à l'échéance",
    definition: "Protection du capital investi à la fin du terme"
  },
  {
    matchId: 6,
    category: 'fonds',
    term: "Réinitialisation",
    definition: "Verrouillage des gains en cours de contrat"
  },
  // Déontologie
  {
    matchId: 7,
    category: 'deonto',
    term: "Devoir de conseil",
    definition: "Obligation d'offrir les recommandations appropriées"
  },
  {
    matchId: 8,
    category: 'deonto',
    term: "Conflit d'intérêts",
    definition: "Situation pouvant compromettre l'objectivité du conseiller"
  }
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'vie': return 'bg-blue-500/20 border-blue-500/30';
    case 'maladie': return 'bg-red-500/20 border-red-500/30';
    case 'fonds': return 'bg-purple-500/20 border-purple-500/30';
    case 'deonto': return 'bg-yellow-500/20 border-yellow-500/30';
    default: return 'bg-green-500/20 border-green-500/30';
  }
};

export const MemoryGame: React.FC<MemoryGameProps> = ({ onComplete }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{message: string, isSuccess: boolean} | null>(null);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const initialCards: Card[] = [];
    
    insuranceTerms.forEach((item, index) => {
      // Add term card
      initialCards.push({
        id: index * 2,
        type: 'term',
        category: item.category,
        content: item.term,
        isFlipped: false,
        isMatched: false,
        matchId: item.matchId
      });
      
      // Add definition card
      initialCards.push({
        id: index * 2 + 1,
        type: 'definition',
        category: item.category,
        content: item.definition,
        isFlipped: false,
        isMatched: false,
        matchId: item.matchId
      });
    });

    // Shuffle cards
    const shuffledCards = [...initialCards].sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setScore(0);
    setStreak(0);
  };

  const handleCardClick = (id: number) => {
    const card = cards.find(c => c.id === id);
    if (!card || card.isMatched || card.isFlipped || flippedCards.length === 2) return;

    // Flip card
    const updatedCards = cards.map(c => 
      c.id === id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);
    
    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.matchId === secondCard.matchId) {
        // Match found
        setTimeout(() => {
          setCards(cards.map(c => 
            c.id === firstId || c.id === secondId
              ? { ...c, isMatched: true }
              : c
          ));
          setFlippedCards([]);
          setScore(score + 100 + (streak * 10));
          setStreak(streak + 1);
          setFeedback({
            message: `Match correct ! +${100 + (streak * 10)} points`,
            isSuccess: true
          });

          // Check for game completion
          if (cards.filter(c => !c.isMatched).length === 2) {
            const finalScore = score + 100 + (streak * 10);
            onComplete(finalScore);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(cards.map(c => 
            c.id === firstId || c.id === secondId
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedCards([]);
          setStreak(0);
          setFeedback({
            message: "Essayez encore !",
            isSuccess: false
          });
        }, 1000);
      }

      // Clear feedback after 1.5 seconds
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
          <Brain className="w-6 h-6" />
          Memory des Assurances
        </h2>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-green-900/30 rounded-full">
            Score: {score}
          </div>
          {streak > 1 && (
            <div className="px-4 py-2 bg-yellow-900/30 rounded-full text-yellow-400">
              Série: x{streak}
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          feedback.isSuccess ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {feedback.isSuccess ? (
            <ThumbsUp className="w-5 h-5" />
          ) : (
            <ThumbsDown className="w-5 h-5" />
          )}
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.isMatched || card.isFlipped}
            className={`
              aspect-square rounded-xl p-4 transition-all duration-300
              ${card.isFlipped || card.isMatched
                ? `${getCategoryColor(card.category)} text-white`
                : 'bg-black/50 border-2 border-green-500/30 hover:border-green-500'
              }
            `}
          >
            {(card.isFlipped || card.isMatched) && (
              <div className="h-full flex flex-col">
                <div className="text-xs opacity-70 mb-2">
                  {card.type === 'term' ? 'Terme' : 'Définition'}
                </div>
                <div className="flex-1 flex items-center justify-center text-center text-sm">
                  {card.content}
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};