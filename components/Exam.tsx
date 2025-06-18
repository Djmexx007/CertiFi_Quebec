import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from './GameState';
import { Brain, CheckCircle, XCircle, ArrowLeft, Trophy, Star, Target } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useUserProfile } from '@/hooks/useUserProfile';

interface Question {
  id: number;
  category: 'vie' | 'maladie' | 'fonds' | 'deonto';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface ExamProps {
  onBack: () => void;
}

// Combine questions from all modules
const examQuestions: Question[] = [
  // --- ASSURANCE VIE (6) ---
  {
    id: 1,
    category: 'vie',
    question: "Quelle conséquence fiscale peut survenir lors du retrait partiel d'une police d'assurance vie universelle financée en excès par rapport au test d'exemption ?",
    options: [
      "Aucune, les retraits sont toujours non imposables",
      "Une partie du retrait peut être imposable si le plafond est dépassé",
      "Le titulaire doit obligatoirement fermer la police",
      "L'assureur refusera le retrait"
    ],
    correctAnswer: 1,
    explanation: "Un retrait excédant la limite du test d'exemption peut entraîner une imposition immédiate sur le gain accumulé."
  },
  // ... other questions omitted for brevity
];

export const Exam: React.FC<ExamProps> = ({ onBack }) => {
  const { addXP } = useGame();
  const { refreshProfile } = useUserProfile();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [examComplete, setExamComplete] = useState(false);

  // Initialize exam with 35 random questions
  useEffect(() => {
    const shuffled = [...examQuestions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, 25));
    setStartTime(Date.now());
  }, []);

  // Timer
  useEffect(() => {
    if (!examComplete) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, examComplete]);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeExam();
    }
  };

  const completeExam = async () => {
    setExamComplete(true);
    const correctAnswers = selectedAnswers.filter(
      (answer, index) => answer === questions[index].correctAnswer
    ).length;
    const percentage = (correctAnswers / questions.length) * 100;
    
    if (percentage >= 80) {
      const xpAmount = 1000;
      
      // Update XP in GameState
      console.log(`Exam passed with ${percentage}%. Adding ${xpAmount} XP`);
      addXP(xpAmount);
      
      // Update XP in Supabase
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
            const newXP = currentXP + xpAmount;
            console.log(`Updating XP in Supabase: ${currentXP} -> ${newXP}`);
            
            const { error } = await supabase
              .from('profiles')
              .update({ xp: newXP })
              .eq('id', user.id);
              
            if (error) {
              console.error('Error updating XP in Supabase:', error);
            } else {
              console.log('XP updated successfully in Supabase');
              
              // Refresh profile to update UI
              refreshProfile();
            }
          }
        }
      } catch (error) {
        console.error('Error updating XP in Supabase:', error);
      }
    }
    
    setShowResults(true);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    const correctAnswers = selectedAnswers.filter(
      (answer, index) => answer === questions[index].correctAnswer
    ).length;
    const percentage = (correctAnswers / questions.length) * 100;
    const passed = percentage >= 80;

    return (
      <div className="space-y-6">
        <div className="p-6 bg-black/30 rounded-xl border-2 border-green-500/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Résultats de l'Examen
            </h2>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-green-900/30 rounded-full">
                Temps: {formatTime(elapsedTime)}
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className={`text-4xl font-bold ${passed ? 'text-green-400' : 'text-red-400'}`}>
              {Math.round(percentage)}%
            </div>
            <p className="text-xl">
              {correctAnswers} réponses correctes sur {questions.length}
            </p>
            {passed ? (
              <div className="p-4 bg-green-500/20 rounded-lg border border-green-500">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-green-400">Félicitations ! Vous avez réussi l'examen !</p>
                <p className="text-sm text-green-400/70 mt-2">+1000 XP bonus</p>
              </div>
            ) : (
              <div className="p-4 bg-red-500/20 rounded-lg border border-red-500">
                <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-400">
                  Vous n'avez pas atteint le seuil de réussite de 80%.
                </p>
                <p className="text-sm text-red-400/70 mt-2">
                  Continuez à étudier et réessayez !
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onBack}
          className="w-full p-3 rounded-lg bg-green-500/20 border-2 border-green-500 hover:bg-green-500/30 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au terminal
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-black/30 rounded-xl border-2 border-green-500/30">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Examen PQAP
          </h2>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-green-900/30 rounded-full">
              Question {currentQuestion + 1}/{questions.length}
            </div>
            <div className="px-4 py-2 bg-green-900/30 rounded-full flex items-center gap-2">
              <Star className="w-4 h-4" />
              {formatTime(elapsedTime)}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
            <p className="text-lg">{questions[currentQuestion]?.question}</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {questions[currentQuestion]?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="w-full p-4 rounded-lg text-left transition-all bg-black/30 border-2 border-green-500/30 hover:border-green-500/60"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};