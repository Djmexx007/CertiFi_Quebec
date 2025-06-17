import React, { useState, useEffect } from 'react';
import { Brain, RotateCcw, Trophy, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface MemoryCard {
  id: number;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  onScoreSubmit: (score: number, maxScore: number, sessionData: any) => Promise<void>;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ onScoreSubmit }) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);

  // Contenu des cartes (termes de déontologie)
  const cardContents = [
    '🛡️', '⚖️', '📋', '🤝', '💼', '📊', '🎯', '🔒'
  ];

  // Timer pour le jeu
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [gameState]);

  // Vérifier les cartes retournées
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards.find(card => card.id === first);
      const secondCard = cards.find(card => card.id === second);

      if (firstCard && secondCard && firstCard.content === secondCard.content) {
        // Match trouvé
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isMatched: true }
              : card
          ));
          setMatchedPairs(prev => prev + 1);
          setFlippedCards([]);
        }, 1000);
      } else {
        // Pas de match
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
      
      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards]);

  // Vérifier si le jeu est terminé
  useEffect(() => {
    if (gameState === 'playing' && matchedPairs === cardContents.length) {
      finishGame();
    }
  }, [matchedPairs, gameState]);

  const initializeGame = () => {
    // Créer les paires de cartes
    const gameCards: MemoryCard[] = [];
    cardContents.forEach((content, index) => {
      gameCards.push(
        { id: index * 2, content, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, content, isFlipped: false, isMatched: false }
      );
    });

    // Mélanger les cartes
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimeElapsed(0);
    setGameStartTime(Date.now());
    setGameState('playing');
  };

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));
    
    setFlippedCards(prev => [...prev, cardId]);
  };

  const finishGame = async () => {
    setGameState('finished');
    
    const gameEndTime = Date.now();
    const totalTime = gameEndTime - gameStartTime;
    
    // Calculer le score basé sur le temps et les mouvements
    const maxScore = 1000;
    const timeBonus = Math.max(0, 300 - timeElapsed) * 2; // Bonus pour la rapidité
    const movesPenalty = Math.max(0, moves - cardContents.length) * 10; // Pénalité pour les mouvements supplémentaires
    const finalScore = Math.max(100, maxScore + timeBonus - movesPenalty);

    const sessionData = {
      totalPairs: cardContents.length,
      matchedPairs,
      totalMoves: moves,
      timeElapsed,
      efficiency: (cardContents.length / moves) * 100,
      gameStartTime,
      gameEndTime: Date.now()
    };

    try {
      await onScoreSubmit(finalScore, maxScore, sessionData);
    } catch (error) {
      console.error('Erreur lors de la soumission du score:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceMessage = () => {
    const efficiency = (cardContents.length / moves) * 100;
    if (efficiency >= 80) return 'Performance exceptionnelle! 🌟';
    if (efficiency >= 60) return 'Bonne performance! 👍';
    return 'Continuez à vous entraîner! 🧠';
  };

  if (gameState === 'menu') {
    return (
      <Card className="max-w-2xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Jeu de Mémoire</h2>
          <p className="text-gray-600 mb-6">
            Entraînez votre mémoire en retrouvant les paires de cartes identiques. 
            Plus vous êtes rapide et efficace, plus votre score sera élevé!
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Règles du jeu :</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Retournez deux cartes à la fois</li>
              <li>• Trouvez toutes les paires identiques</li>
              <li>• Moins de mouvements = meilleur score</li>
              <li>• Temps rapide = bonus de points</li>
            </ul>
          </div>

          <Button onClick={initializeGame} size="lg" className="px-8">
            Commencer le Jeu
          </Button>
        </div>
      </Card>
    );
  }

  if (gameState === 'playing') {
    return (
      <Card className="max-w-4xl mx-auto">
        {/* En-tête avec statistiques */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">
                {formatTime(timeElapsed)}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-900">
              Mouvements: {moves}
            </div>
            <div className="text-sm font-medium text-gray-900">
              Paires: {matchedPairs} / {cardContents.length}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={initializeGame}
            icon={RotateCcw}
          >
            Recommencer
          </Button>
        </div>

        {/* Grille de cartes */}
        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isMatched || card.isFlipped || flippedCards.length >= 2}
              className={`aspect-square rounded-lg border-2 text-2xl font-bold transition-all duration-300 ${
                card.isFlipped || card.isMatched
                  ? card.isMatched
                    ? 'bg-green-100 border-green-300 text-green-800'
                    : 'bg-blue-100 border-blue-300 text-blue-800'
                  : 'bg-gray-100 border-gray-300 hover:bg-gray-200 hover:border-gray-400'
              }`}
            >
              {card.isFlipped || card.isMatched ? card.content : '?'}
            </button>
          ))}
        </div>

        {/* Barre de progression */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progression</span>
            <span>{Math.round((matchedPairs / cardContents.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(matchedPairs / cardContents.length) * 100}%` }}
            />
          </div>
        </div>
      </Card>
    );
  }

  if (gameState === 'finished') {
    const efficiency = (cardContents.length / moves) * 100;
    
    return (
      <Card className="max-w-2xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Jeu Terminé!</h2>
          <p className="text-gray-600 mb-6">{getPerformanceMessage()}</p>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Temps total</p>
                <p className="text-xl font-bold text-gray-900">{formatTime(timeElapsed)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mouvements</p>
                <p className="text-xl font-bold text-gray-900">{moves}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Efficacité</p>
                <p className="text-xl font-bold text-blue-600">{efficiency.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Paires trouvées</p>
                <p className="text-xl font-bold text-green-600">{matchedPairs}/{cardContents.length}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={initializeGame}
              icon={RotateCcw}
            >
              Rejouer
            </Button>
            <Button onClick={() => setGameState('menu')}>
              Retour au menu
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return null;
};