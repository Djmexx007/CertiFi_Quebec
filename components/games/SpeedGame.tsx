import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, Brain, Check, X } from 'lucide-react';
import { questions } from './questions';
import { useGame } from '../GameState';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import { useUserProfile } from '@/hooks/useUserProfile';

interface SpeedGameProps {
  onComplete: (score: number) => void;
}

export const SpeedGame: React.FC<SpeedGameProps> = ({ onComplete }) => {
  const { addXP } = useGame();
  const { refreshProfile } = useUserProfile();
  
  const [shuffledQuestions, setShuffledQuestions] = useState(() =>
    [...questions].sort(() => Math.random() - 0.5).map(q => ({
      ...q,
      options: [...q.options].sort(() => Math.random() - 0.5),
      correctAnswer: undefined, // recalculé dynamiquement
    }))
  );
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setTimeLeft((time) => {
        if (time <= 1) {
          clearInterval(timerRef.current!);
          setGameOver(true);
          return 0;
        }
        return time - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameOver) {
      const gainedXP = Math.floor(score / 10);
      if (gainedXP > 0) {
        // Update XP in GameState
        console.log(`Speed game over with score ${score}. Adding ${gainedXP} XP`);
        addXP(gainedXP);
        
        // Update XP in Supabase
        const updateXP = async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { data } = await supabase
                .from('profiles')
                .select('xp')
                .eq('id', user.id)
                .single();
              
              if (data) {
                const currentXP = data.xp || 0;
                const newXP = currentXP + gainedXP;
                console.log(`Updating XP in Supabase: ${currentXP} -> ${newXP}`);
                
                const { error } = await supabase
                  .from('profiles')
                  .update({ xp: newXP })
                  .eq('id', user.id);
                  
                if (error) {
                  console.error('Error updating XP in Supabase:', error);
                } else {
                  console.log('XP updated successfully in Supabase');
                }
              }
            }
            
            // Refresh profile to update UI
            refreshProfile();
          } catch (error) {
            console.error('Error updating XP in Supabase:', error);
          }
        };
        
        updateXP();
        
        toast.success(`+${gainedXP} XP gagnés !`, {
          icon: '⚡',
          style: {
            background: '#10B981',
            color: '#fff'
          }
        });
      }
      onComplete(score);
    }
  }, [gameOver, score, onComplete, addXP, refreshProfile]);

  const getCorrectIndex = useCallback((q: any) => {
    const correctText = questions.find(orig => orig.question === q.question)?.options[q.correctAnswer ?? 0];
    return q.options.findIndex((opt: string) => opt === correctText);
  }, []);

  const handleAnswer = useCallback((answerIndex: number) => {
    if (gameOver || feedback) return;

    const question = shuffledQuestions[currentQuestion];
    const correctIndex = getCorrectIndex(question);
    const correct = answerIndex === correctIndex;

    if (correct) {
      setMultiplier((prev) => Math.min(4, prev + 0.5));
      setStreak((prev) => prev + 1);
      const pointsEarned = Math.floor(100 * multiplier);
      setScore((prev) => prev + pointsEarned);
      setTimeLeft((prev) => Math.min(30, prev + 5));
      setFeedback({ correct: true, message: `+${pointsEarned} points ! +5 secondes !` });
    } else {
      setStreak(0);
      setMultiplier(1);
      setTimeLeft((prev) => Math.max(0, prev - 3));
      setFeedback({ correct: false, message: 'Incorrect ! -3 secondes !' });
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentQuestion < shuffledQuestions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        setGameOver(true);
      }
    }, 1000);
  }, [currentQuestion, shuffledQuestions, gameOver, feedback, multiplier, getCorrectIndex]);

  const currentQ = shuffledQuestions[currentQuestion];
  const correctIndex = getCorrectIndex(currentQ);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
          <Brain className="w-6 h-6" /> Quiz Express
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-900/30 rounded-full">
            <Timer className="w-4 h-4" /> <span>{timeLeft}s</span>
          </div>
          <div className="px-4 py-2 bg-green-900/30 rounded-full">Score: {score}</div>
          {streak > 1 && (
            <div className="px-4 py-2 bg-yellow-900/30 rounded-full text-yellow-400">
              x{multiplier.toFixed(1)}
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 ${
            feedback.correct ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}
        >
          {feedback.correct ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          {feedback.message}
        </div>
      )}

      <div className="p-6 bg-black/30 rounded-xl border-2 border-green-500/30">
        <p className="text-lg mb-6">{currentQ?.question}</p>
        <div className="grid grid-cols-1 gap-3">
          {currentQ?.options.map((option: string, index: number) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={!!feedback || gameOver}
              className={`
                w-full p-4 rounded-lg text-left transition-all duration-300
                ${feedback
                  ? index === correctIndex
                    ? 'bg-green-500/20 border-2 border-green-500'
                    : 'bg-black/30 border-2 border-transparent opacity-50'
                  : 'bg-black/30 border-2 border-green-500/30 hover:border-green-500/60'}
              `}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {gameOver && (
        <div className="p-6 bg-green-900/30 rounded-xl border-2 border-green-500 text-center">
          <h3 className="text-xl font-bold mb-2">Temps écoulé !</h3>
          <p className="text-green-300">Score final : {score}</p>
          {streak > 5 && (
            <p className="text-yellow-400 mt-2">Série impressionnante : {streak} bonnes réponses !</p>
          )}
        </div>
      )}
    </div>
  );
};