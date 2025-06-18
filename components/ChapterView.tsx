import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from './GameState';
import { ChapterContent } from './ChapterContent';
import { Book, ArrowLeft, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import BossBattle from './BossBattle';
import toast from 'react-hot-toast';

interface ChapterViewProps {
  chapter: any;
  onBack: () => void;
}

export const ChapterView: React.FC<ChapterViewProps> = ({ chapter, onBack }) => {
  const { state, markChapterCompleted } = useGame();
  const [bossDefeated, setBossDefeated] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);
  const [showRetryMessage, setShowRetryMessage] = useState(false);

  const chapterAlreadyCompleted = state.completedChapters.includes(chapter.id);
  const minimumPassingScore = 1.0; // 100% pour réussir (3/3)

  // Log state for debugging
  useEffect(() => {
    console.log('ChapterView - Current state:', {
      chapterAlreadyCompleted,
      chapterId: chapter.id,
      completedChapters: state.completedChapters,
      bossDefeated,
      quizCompleted,
      quizScore,
      quizTotal,
      showRetryMessage
    });
  }, [chapter.id, state.completedChapters, chapterAlreadyCompleted, bossDefeated, quizCompleted, quizScore, quizTotal, showRetryMessage]);

  const handleChapterComplete = async (score: number, total: number) => {
    console.log(`ChapterView received score: ${score}/${total}`);
    setQuizCompleted(true);
    setQuizScore(score);
    setQuizTotal(total);
    
    const scorePercentage = score / total;
    console.log(`Score percentage: ${scorePercentage} (${score}/${total})`);
    console.log(`Minimum passing score: ${minimumPassingScore}`);
    console.log(`Passed quiz: ${scorePercentage >= minimumPassingScore}`);
    
    if (scorePercentage >= minimumPassingScore) {
      // Score parfait (3/3) - débloquer le boss ou compléter le chapitre
      if (!chapter.boss) {
        // Si pas de boss et score parfait, marquer le chapitre comme complété
        console.log('Marking chapter as completed (no boss):', chapter.id);
        await markChapterCompleted(chapter.id);
        toast.success('Chapitre complété avec succès!', {
          icon: '🎉',
          style: {
            background: '#10B981',
            color: '#fff'
          }
        });
      } else {
        toast.success('Boss débloqué! Préparez-vous au combat!', {
          icon: '⚔️',
          style: {
            background: '#10B981',
            color: '#fff'
          }
        });
      }
    } else {
      // Score insuffisant (moins de 3/3)
      console.log(`Insufficient score: ${score}/${total}`);
      setShowRetryMessage(true);
      toast.error(`Score insuffisant (${score}/${total}). Vous devez obtenir un score parfait (${total}/${total})`, {
        icon: '❌',
        style: {
          background: '#EF4444',
          color: '#fff'
        }
      });
    }
  };

  const handleRetryQuiz = () => {
    setQuizCompleted(false);
    setShowRetryMessage(false);
    setQuizScore(0);
  };

  const handleBossWin = async () => {
    setBossDefeated(true);
    console.log('Marking chapter as completed (boss defeated):', chapter.id);
    await markChapterCompleted(chapter.id);
    toast.success('Boss vaincu! Chapitre complété!', {
      icon: '🏆',
      style: {
        background: '#10B981',
        color: '#fff'
      }
    });
  };

  // Si le chapitre est déjà terminé dans le state (en revenant), on affiche directement victoire
  useEffect(() => {
    if (chapterAlreadyCompleted) {
      console.log(`Chapter ${chapter.id} is already completed, showing victory state`);
      setBossDefeated(true);
      setQuizCompleted(true);
    }
  }, [chapterAlreadyCompleted, chapter.id]);

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/30 border border-green-500/30 hover:bg-green-900/30 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux chapitres
      </button>

      {chapterAlreadyCompleted && (
        <div className="p-6 bg-green-800/20 border-2 border-green-500 rounded-xl text-center text-green-300">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
          Ce chapitre a déjà été complété!
        </div>
      )}

      {!chapterAlreadyCompleted && (
        <>
          {!quizCompleted ? (
            <ChapterContent chapter={chapter} onComplete={handleChapterComplete} />
          ) : showRetryMessage ? (
            <div className="p-6 bg-red-900/20 border-2 border-red-500 rounded-xl text-center">
              <XCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <h3 className="text-xl font-bold text-red-300 mb-2">Score Insuffisant</h3>
              <p className="text-red-200 mb-4">
                Vous avez obtenu {quizScore}/{quizTotal} mais vous devez obtenir un score parfait ({quizTotal}/{quizTotal}) pour continuer.
              </p>
              <button
                onClick={handleRetryQuiz}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Réessayer le chapitre
              </button>
            </div>
          ) : (
            <>
              <div className="p-6 bg-green-900/20 border-2 border-green-500 rounded-xl text-center">
                <h3 className="text-xl font-bold text-green-300 mb-2">
                  Quiz terminé!
                </h3>
                <p className="text-green-200 mb-2">
                  Score: {quizScore} / {quizTotal} ({Math.round((quizScore / quizTotal) * 100)}%)
                </p>
                {quizScore === quizTotal ? (
                  <p className="text-green-300">
                    Félicitations! Vous avez obtenu un score parfait.
                    {chapter.boss ? " Le boss est maintenant débloqué!" : " Chapitre complété!"}
                  </p>
                ) : (
                  <p className="text-red-300">
                    Score insuffisant. Veuillez réessayer.
                  </p>
                )}
              </div>

              {chapter.boss && quizScore === quizTotal && !bossDefeated && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold text-red-500">⚔️ Combat Final : {chapter.boss.name}</h2>
                  <BossBattle
                    name={chapter.boss.name}
                    quiz={chapter.boss.quiz}
                    onWin={handleBossWin}
                    onLose={() => {
                      toast.error("Défaite contre le boss. Réessaie !");
                    }}
                  />
                </div>
              )}

              {bossDefeated && (
                <div className="p-4 bg-green-900/20 border border-green-500 rounded-lg text-green-300 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  🎉 Bravo, vous avez vaincu le boss de ce chapitre !
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};