import React, { useState, useEffect } from 'react';
import { Puzzle, Check, X, RefreshCcw, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PuzzleGameProps {
  onComplete: (score: number) => void;
}

interface PuzzlePiece {
  id: number;
  text: string;
  correctPosition: number;
}

const rawPuzzlePieces: PuzzlePiece[] = [
  { id: 1, text: "Identification du besoin d'assurance", correctPosition: 0 },
  { id: 2, text: "Analyse de la situation financière", correctPosition: 1 },
  { id: 3, text: "Choix du type de police", correctPosition: 2 },
  { id: 4, text: "Sélection des garanties", correctPosition: 3 },
  { id: 5, text: "Désignation des bénéficiaires", correctPosition: 4 },
  { id: 6, text: "Signature du contrat", correctPosition: 5 }
];

export const PuzzleGame: React.FC<PuzzleGameProps> = ({ onComplete }) => {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [expertMode, setExpertMode] = useState(false);
  const [completed, setCompleted] = useState(false);

  const shufflePieces = () => {
    const shuffled = [...rawPuzzlePieces].sort(() => Math.random() - 0.5);
    setPieces(shuffled);
    setMoves(0);
    setScore(0);
    setSelectedPiece(null);
    setFeedback(null);
    setCompleted(false);
  };

  useEffect(() => {
    shufflePieces();
  }, []);

  const handlePieceClick = (index: number) => {
    if (selectedPiece === null) {
      setSelectedPiece(index);
    } else {
      const newPieces = [...pieces];
      const temp = newPieces[index];
      newPieces[index] = newPieces[selectedPiece];
      newPieces[selectedPiece] = temp;
      setPieces(newPieces);
      setSelectedPiece(null);
      setMoves(prev => prev + 1);

      const correctlyPlaced = newPieces[index].correctPosition === index || newPieces[selectedPiece].correctPosition === selectedPiece;
      if (correctlyPlaced) {
        setScore(prev => prev + 50);
        setFeedback({ correct: true, message: "Pièce bien placée ! +50 points" });
      }

      const isComplete = newPieces.every((piece, i) => piece.correctPosition === i);
      if (isComplete) {
        const moveBonus = Math.max(0, 500 - (moves * 20));
        const finalScore = score + moveBonus + 50;

        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
        });

        setCompleted(true);
        setFeedback({ correct: true, message: `🎉 Puzzle complété ! Bonus de ${moveBonus} points !` });

        setTimeout(() => {
          setCompleted(false);
          onComplete(finalScore);
        }, 3000);
      }

      setTimeout(() => setFeedback(null), 1000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
          <Puzzle className="w-6 h-6" />
          Puzzle de Processus
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={shufflePieces}
            className="p-2 rounded-full bg-green-800/30 hover:bg-green-600/20 transition"
            title="Rejouer"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setExpertMode(!expertMode)}
            className={`p-2 rounded-full transition ${expertMode ? 'bg-red-600/30' : 'bg-green-800/30'}`}
            title="Mode Expert"
          >
            <Flame className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex justify-between text-sm text-green-300">
        <span>Score : {score}</span>
        <span>Mouvements : {moves}</span>
        <span>Mode : {expertMode ? 'Expert' : 'Normal'}</span>
      </div>

      {feedback && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          feedback.correct ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {feedback.correct ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          {feedback.message}
        </div>
      )}

      <div className={`space-y-3 transition-all duration-500 ${completed ? 'ring-4 ring-green-400/50 rounded-xl' : ''}`}>
        {pieces.map((piece, index) => {
          const isCorrect = piece.correctPosition === index;
          let bgColor = 'bg-black/30 border-green-500/30';

          if (!expertMode) {
            if (isCorrect) bgColor = 'bg-green-500/20 border-green-500';
            else if (selectedPiece === index) bgColor = 'bg-yellow-500/20 border-yellow-500';
            else if (moves > 10) bgColor = 'bg-red-500/10 border-red-500/30';
          }

          return (
            <button
              key={piece.id}
              onClick={() => handlePieceClick(index)}
              className={`w-full p-4 rounded-lg text-left transition-all duration-300 border-2 ${bgColor}`}
            >
              {piece.text}
            </button>
          );
        })}
      </div>

      <div className="p-4 bg-black/30 rounded-lg border border-green-500/30 text-green-300/70 text-sm">
        Cliquez sur deux pièces pour les échanger et reconstituer l’ordre logique du processus. Activez le mode expert pour masquer les indices visuels !
      </div>
    </div>
  );
};