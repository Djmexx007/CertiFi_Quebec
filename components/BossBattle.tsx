import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CheckCircle, XCircle, Flame, RotateCcw, Swords } from 'lucide-react';
import { useGame } from './GameState';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import { useUserProfile } from '@/hooks/useUserProfile';

interface BossQuestion {
  question: string;
  choices: {
    text: string;
    correct: boolean;
    explanation: string;
  }[];
}

interface BossBattleProps {
  name: string;
  quiz: BossQuestion[];
  onWin: () => void;
  onLose?: () => void;
}

const BossBattle: React.FC<BossBattleProps> = ({ name, quiz, onWin, onLose }) => {
  const { addXP } = useGame();
  const { refreshProfile } = useUserProfile();
  
  const [current, setCurrent] = useState(0);
  const [bossHP, setBossHP] = useState(quiz.length);
  const [lives, setLives] = useState(1);
  const [showResult, setShowResult] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [completed, setCompleted] = useState<'win' | 'lose' | null>(null);
  const [locked, setLocked] = useState(false);

  // Memoize current question to prevent unnecessary re-renders
  const currentQuestion = useMemo(() => quiz[current], [quiz, current]);

  useEffect(() => {
    if (completed === 'win') {
      // Award XP for defeating the boss
      const xpEarned = 500; // Base XP for boss victory
      
      // Update XP in GameState
      console.log('Boss defeated! Adding XP:', xpEarned);
      addXP(xpEarned);
      
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
              const newXP = currentXP + xpEarned;
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
      
      toast.success(`+${xpEarned} XP pour avoir vaincu le boss !`, {
        icon: '🏆',
        style: {
          background: '#10B981',
          color: '#fff'
        }
      });
      
      const timeout = setTimeout(() => {
        onWin();
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [completed, onWin, addXP, refreshProfile]);

  const handleChoice = useCallback((isCorrect: boolean, explanation: string) => {
    if (completed || locked) return;
    setLocked(true);

    const newBossHP = isCorrect ? bossHP - 1 : bossHP;
    const newLives = isCorrect ? lives : lives - 1;

    setBossHP(newBossHP);
    setLives(newLives);
    setShowResult({ correct: isCorrect, explanation });

    setTimeout(() => {
      setShowResult(null);
      setLocked(false);

      const isLast = current >= quiz.length - 1;
      const hasLost = newLives <= 0;
      const hasWon = newBossHP <= 0;

      if (hasLost) {
        setCompleted('lose');
        onLose?.();
      } else if (isLast) {
        if (hasWon) {
          setCompleted('win');
        } else {
          setCompleted('lose');
          onLose?.();
        }
      } else {
        setCurrent((i) => i + 1);
      }
    }, 1800);
  }, [bossHP, lives, current, completed, locked, quiz.length, onLose]);

  const restartBattle = useCallback(() => {
    setCurrent(0);
    setBossHP(quiz.length);
    setLives(1);
    setCompleted(null);
    setShowResult(null);
    setLocked(false);
  }, [quiz.length]);

  if (!quiz || quiz.length === 0) {
    return (
      <div className="p-4 text-red-400 bg-red-900/20 border border-red-500 rounded-lg">
        Erreur : aucun quiz chargé pour ce boss.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-500 flex justify-center items-center gap-2">
          <Flame className="w-6 h-6 animate-pulse" /> {name} — Combat Final
        </h2>
        <div className="mt-4">
          <div className="w-full bg-red-900 rounded-full h-4 overflow-hidden">
            <div
              className="bg-red-500 h-4 transition-all duration-500"
              style={{ width: `${(bossHP / quiz.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-red-300 mt-1">PV du Boss : {bossHP} / {quiz.length}</p>
          <p className="text-sm text-yellow-400 mt-1">Vie restante : {lives}</p>
        </div>
      </div>

      {completed === null && currentQuestion && (
        <div className="p-5 bg-black/30 rounded-xl border border-red-500/30 space-y-4">
          <div className="text-lg font-semibold text-green-100">{currentQuestion.question}</div>
          <div className="grid gap-3">
            {currentQuestion.choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => handleChoice(choice.correct, choice.explanation)}
                className="w-full p-4 rounded-lg bg-red-500/10 border border-red-500 hover:bg-red-500/20 text-left transition-all duration-300"
                disabled={!!showResult || locked}
              >
                <Swords className="inline-block w-4 h-4 mr-2 text-red-400" />
                {choice.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {showResult && (
        <div className={`p-4 rounded-lg flex items-center gap-2 text-sm transition-all ${
          showResult.correct ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
        }`}>
          {showResult.correct ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {showResult.explanation}
        </div>
      )}

      {completed === 'win' && (
        <div className="p-6 bg-green-700/10 border border-green-500 rounded-xl text-center space-y-2 animate-pulse">
          <h3 className="text-xl font-bold text-green-200">🎉 Victoire totale !</h3>
          <p className="text-green-100">Tu as vaincu <span className="font-bold">{name}</span> avec brio !</p>
          <p className="text-sm text-green-400 italic">Les récompenses seront à toi !</p>
        </div>
      )}

      {completed === 'lose' && (
        <div className="p-6 bg-red-700/10 border border-red-500 rounded-xl text-center space-y-2 animate-shake">
          <h3 className="text-xl font-bold text-red-300">💀 Défaite...</h3>
          <p className="text-red-200">{name} a eu raison de toi… cette fois.</p>
          <p className="text-sm text-red-400 italic">Révise et retente ta chance !</p>
          <button
            onClick={restartBattle}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500 rounded-lg hover:bg-red-500/30 text-sm"
          >
            <RotateCcw className="w-4 h-4" /> Rejouer le boss
          </button>
        </div>
      )}
    </div>
  );
};

export default BossBattle;