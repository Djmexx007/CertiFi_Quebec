import React, { useState, useEffect } from 'react';
import { useGame } from './GameState';
import { Book, Brain, Trophy, ArrowRight, Star, Shield, Target, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { Chapter } from '../types/chapter';

interface ChapterContentProps {
  chapter: Chapter;
  onComplete: () => void;
}

export const ChapterContent: React.FC<ChapterContentProps> = ({ chapter, onComplete }) => {
  const { addXP, addBadge, addTitle } = useGame();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [shuffledChoices, setShuffledChoices] = useState<any[]>([]);

  useEffect(() => {
    if (!chapter?.quiz?.[currentQuestionIndex]?.choices) return;
    const choices = [...chapter.quiz[currentQuestionIndex].choices];
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    setShuffledChoices(choices);
  }, [chapter?.quiz, currentQuestionIndex]);

  const handleAnswer = (answerIndex: number) => {
    if (!chapter?.quiz?.[currentQuestionIndex] || showExplanation) return;
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    const selectedChoice = shuffledChoices[answerIndex];
    if (selectedChoice?.correct) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!chapter?.quiz) return;
    if (currentQuestionIndex < chapter.quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      completeChapter();
    }
  };

  const completeChapter = () => {
    setQuizCompleted(true);
    if (chapter.boss) return; // Boss débloqué après quiz
    const baseXP = chapter.minigame?.rewards?.xp || 100;
    addXP(baseXP);
    if (score === chapter.quiz?.length) {
      if (chapter.minigame?.rewards?.badge) addBadge(chapter.minigame.rewards.badge);
      if (chapter.minigame?.rewards?.title) addTitle(chapter.minigame.rewards.title);
    }
    onComplete();
  };

  const currentQuestion = chapter.quiz?.[currentQuestionIndex];
  const totalQuestions = chapter.quiz?.length || 0;
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="p-6 bg-black/30 rounded-xl border-2 border-green-500/30">
        <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2 mb-4">
          <Book className="w-6 h-6" /> {chapter.title}
        </h2>
        <p className="whitespace-pre-wrap text-green-300/90 mb-4">{chapter.summary}</p>
        {chapter.boss && (
          <div className="mt-4 p-4 bg-red-900/20 rounded-lg border border-red-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6 text-red-400" />
              <h3 className="text-lg font-bold text-red-400">Boss : {chapter.boss.name}</h3>
            </div>
            <p className="text-red-300/90">{chapter.boss.description}</p>
          </div>
        )}
      </div>

      {!quizCompleted && currentQuestion && (
        <div className="p-6 bg-black/30 rounded-xl border-2 border-green-500/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
              <Brain className="w-6 h-6" /> Question {currentQuestionIndex + 1} / {totalQuestions}
            </h3>
            <div className="text-sm px-4 py-1 bg-green-800/40 rounded-full">Score : {score}</div>
          </div>

          <div className="mb-4">
            <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30 mb-4">
              <p className="text-green-300 text-lg font-medium">{currentQuestion.question}</p>
            </div>

            <div className="grid gap-3">
              {shuffledChoices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showExplanation}
                  className={`w-full p-3 rounded-lg text-left transition-all duration-300
                    ${showExplanation
                      ? choice.correct
                        ? 'bg-green-500/20 border-2 border-green-500'
                        : selectedAnswer === index
                          ? 'bg-red-500/20 border-2 border-red-500'
                          : 'bg-black/30 border border-transparent opacity-50'
                      : 'bg-black/30 border border-green-500/30 hover:border-green-500/60'}
                  `}
                >
                  {choice.text}
                </button>
              ))}
            </div>
          </div>

          {showExplanation && (
            <>
              <div className={`p-4 rounded-lg border text-sm flex items-start gap-2 ${shuffledChoices[selectedAnswer!]?.correct ? 'bg-green-900/30 border-green-500 text-green-300' : 'bg-red-900/30 border-red-500 text-red-300'}`}>
                {shuffledChoices[selectedAnswer!]?.correct ? <CheckCircle className="w-4 h-4 mt-0.5" /> : <XCircle className="w-4 h-4 mt-0.5" />}
                <span>{shuffledChoices[selectedAnswer!]?.explanation}</span>
              </div>
              <button
                onClick={handleNextQuestion}
                className="mt-4 w-full py-3 rounded-lg bg-green-500/20 border-2 border-green-500 hover:bg-green-500/30 transition-all flex items-center justify-center gap-2"
              >
                {currentQuestionIndex < totalQuestions - 1 ? 'Question suivante' : 'Terminer'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}

      {quizCompleted && (
        <div className="p-6 bg-green-900/30 rounded-xl border-2 border-green-500 text-center">
          <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-green-300 mb-2">🎉 Quiz terminé !</h3>
          <p className="text-green-200 mb-2">Score : {score} / {totalQuestions} ({percentage}%)</p>
          {!chapter.boss && (
            <>
              <p className="mb-2 text-green-300">XP gagné : {chapter.minigame?.rewards?.xp || 100}</p>
              {score === totalQuestions && (
                <div className="text-green-300 space-y-1">
                  <p>🎖️ {chapter.minigame?.rewards?.badge}</p>
                  <p>🏅 {chapter.minigame?.rewards?.title}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};