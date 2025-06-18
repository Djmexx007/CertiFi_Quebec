import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useGame } from './GameState';
import { Star, Trophy, Timer, ArrowLeft, Brain, Gamepad2, Book } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import { useUserProfile } from '@/hooks/useUserProfile';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'memory' | 'speed' | 'puzzle';
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  xpReward: number;
  questions?: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
}

const challenges: Challenge[] = [
  {
    id: 'daily-quiz-1',
    title: "Expert en Assurance Vie",
    description: "Testez vos connaissances sur l'assurance vie",
    type: 'quiz',
    difficulty: 'Moyen',
    xpReward: 200,
    questions: [
      {
        question: "Quelle est la principale caractéristique d'une assurance vie temporaire ?",
        options: [
          "Elle offre une protection pour une période déterminée",
          "Elle dure toute la vie",
          "Elle n'a pas de prime à payer",
          "Elle garantit un rendement fixe"
        ],
        correctAnswer: 0,
        explanation: "L'assurance vie temporaire offre une protection pour une durée spécifique, ce qui la rend plus abordable."
      },
      {
        question: "Qu'est-ce qu'une police d'assurance vie universelle ?",
        options: [
          "Une police qui couvre tout le monde",
          "Une police qui combine protection et épargne",
          "Une police gratuite",
          "Une police internationale"
        ],
        correctAnswer: 1,
        explanation: "L'assurance vie universelle est un produit hybride qui offre à la fois une protection d'assurance et un volet d'épargne."
      },
      {
        question: "Comment fonctionne la garantie de transformation ?",
        options: [
          "Elle permet de transformer l'assurance temporaire en permanente sans examen médical",
          "Elle transforme l'argent en or",
          "Elle change l'assureur automatiquement",
          "Elle modifie la prime chaque année"
        ],
        correctAnswer: 0,
        explanation: "La garantie de transformation est un avantage précieux qui permet de convertir une assurance temporaire en permanente sans nouvelles preuves d'assurabilité."
      }
    ]
  },
  {
    id: 'daily-quiz-2',
    title: "Maître des Fonds Distincts",
    description: "Démontrez votre expertise en fonds distincts",
    type: 'quiz',
    difficulty: 'Difficile',
    xpReward: 250,
    questions: [
      {
        question: "Quelle est la principale garantie offerte par les fonds distincts ?",
        options: [
          "Garantie du capital à l'échéance",
          "Garantie de rendement",
          "Garantie d'admission",
          "Garantie de liquidité"
        ],
        correctAnswer: 0,
        explanation: "Les fonds distincts offrent une garantie de capital à l'échéance, protégeant ainsi une partie de l'investissement initial."
      },
      {
        question: "Comment les fonds distincts protègent-ils contre les créanciers ?",
        options: [
          "Par la désignation d'un bénéficiaire",
          "Par un coffre-fort virtuel",
          "Par une assurance spéciale",
          "Par un contrat secret"
        ],
        correctAnswer: 0,
        explanation: "La désignation d'un bénéficiaire dans un fonds distinct offre une protection contre les créanciers en cas de faillite."
      },
      {
        question: "Quel est l'avantage successoral des fonds distincts ?",
        options: [
          "Le capital est versé rapidement et directement au bénéficiaire",
          "Il n'y a pas de frais de succession",
          "Le testament est automatiquement modifié",
          "L'héritage est toujours égal"
        ],
        correctAnswer: 0,
        explanation: "Les fonds distincts permettent un versement rapide et direct au bénéficiaire, évitant ainsi les délais de succession."
      }
    ]
  },
  {
    id: 'daily-quiz-3',
    title: "Déontologie en Action",
    description: "Mettez en pratique vos connaissances déontologiques",
    type: 'quiz',
    difficulty: 'Difficile',
    xpReward: 300,
    questions: [
      {
        question: "Quelle est la première responsabilité d'un conseiller en assurance ?",
        options: [
          "Protéger les intérêts du client",
          "Maximiser ses ventes",
          "Satisfaire son patron",
          "Gagner plus d'argent"
        ],
        correctAnswer: 0,
        explanation: "La protection des intérêts du client est la responsabilité fondamentale de tout conseiller en assurance."
      },
      {
        question: "Comment gérer un conflit d'intérêts ?",
        options: [
          "Le divulguer immédiatement au client",
          "L'ignorer si possible",
          "En parler uniquement à son supérieur",
          "Attendre que le client pose des questions"
        ],
        correctAnswer: 0,
        explanation: "La transparence est essentielle : tout conflit d'intérêts doit être divulgué au client dès sa découverte."
      },
      {
        question: "Que faire face à une demande de modification de contrat ?",
        options: [
          "Documenter la demande et vérifier l'impact sur le client",
          "Accepter automatiquement",
          "Refuser systématiquement",
          "Demander l'avis d'un collègue"
        ],
        correctAnswer: 0,
        explanation: "Toute modification doit être documentée et son impact sur le client doit être soigneusement évalué."
      }
    ]
  }
];

interface DailyChallengeProps {
  onBack: () => void;
}

export const DailyChallenge: React.FC<DailyChallengeProps> = ({ onBack }) => {
  const { addXP, addBadge, addTitle } = useGame();
  const { refreshProfile } = useUserProfile();
  
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [lastCompletedDate, setLastCompletedDate] = useState<string>('');
  const [streakCount, setStreakCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Memoize today's date string
  const today = useMemo(() => new Date().toDateString(), []);
  
  // Memoize if challenge is completed today
  const isCompletedToday = useMemo(() => 
    lastCompletedDate === today, 
    [lastCompletedDate, today]
  );

  useEffect(() => {
    const lastCompleted = localStorage.getItem('lastCompletedChallenge');
    const streak = parseInt(localStorage.getItem('challengeStreak') || '0');
    
    setLastCompletedDate(lastCompleted || '');
    setStreakCount(streak);

    // Determine today's challenge based on the date
    const challengeIndex = new Date().getDate() % challenges.length;
    setCurrentChallenge(challenges[challengeIndex]);
    
    // Calculate time until next challenge
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    setTimeLeft(Math.floor((tomorrow.getTime() - now.getTime()) / 1000));
    
    // Update time left every minute
    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      setTimeLeft(Math.floor((tomorrow.getTime() - now.getTime()) / 1000));
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const handleAnswer = useCallback((answerIndex: number) => {
    if (!currentChallenge?.questions || showExplanation) return;

    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    if (answerIndex === currentChallenge.questions[questionIndex].correctAnswer) {
      setScore(score + 1);
    }
  }, [currentChallenge?.questions, questionIndex, showExplanation, score]);

  const nextQuestion = useCallback(() => {
    if (!currentChallenge?.questions) return;

    setShowExplanation(false);
    setSelectedAnswer(null);

    if (questionIndex < currentChallenge.questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      completeChallenge();
    }
  }, [currentChallenge?.questions, questionIndex]);

  const completeChallenge = useCallback(async () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    localStorage.setItem('lastCompletedChallenge', today);
    setLastCompletedDate(today);
    
    // Update streak
    let newStreak = streakCount;
    if (lastCompletedDate === yesterday) {
      newStreak = streakCount + 1;
    } else if (lastCompletedDate !== today) {
      newStreak = 1;
    }
    
    setStreakCount(newStreak);
    localStorage.setItem('challengeStreak', newStreak.toString());
    
    if (currentChallenge) {
      const baseXP = currentChallenge.xpReward;
      const streakBonus = Math.floor(baseXP * (newStreak * 0.1)); // 10% bonus per day in streak
      const accuracyBonus = Math.floor(baseXP * (score / (currentChallenge.questions?.length || 1)));
      const totalXP = baseXP + streakBonus + accuracyBonus;
      
      // Update XP in GameState
      console.log(`Daily challenge completed. Adding ${totalXP} XP`);
      addXP(totalXP);
      
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
            const newXP = currentXP + totalXP;
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
        
        toast.success(`+${totalXP} XP gagnés !`, {
          icon: '🏆',
          style: {
            background: '#10B981',
            color: '#fff'
          }
        });
        
        // Refresh profile to update UI
        refreshProfile();
      } catch (error) {
        console.error('Error updating XP in Supabase:', error);
      }

      // Award badges and titles for perfect scores
      if (score === currentChallenge.questions?.length) {
        console.log(`Adding badge: Maître du ${currentChallenge.title}`);
        addBadge(`Maître du ${currentChallenge.title}`);
        console.log(`Adding title: Champion ${currentChallenge.title}`);
        addTitle(`Champion ${currentChallenge.title}`);
      }
    }
    
    setShowResults(true);
  }, [currentChallenge, score, lastCompletedDate, streakCount, addXP, addBadge, addTitle, refreshProfile]);

  // Format time remaining
  const formatTimeLeft = useCallback((seconds: number | null) => {
    if (seconds === null) return "Chargement...";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  }, []);

  if (!currentChallenge) return null;

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/30 border border-green-500/30 hover:bg-green-900/30 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au menu
      </button>

      <div className="p-6 bg-black/30 rounded-xl border-2 border-green-500/30">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" />
            Défi du Jour
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-900/30 rounded-full">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">Série: {streakCount} jours</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              <span className="text-sm">
                Réinitialisation dans {formatTimeLeft(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {isCompletedToday ? (
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Défi Complété !</h3>
            <p className="text-green-300/70">
              Revenez demain pour un nouveau défi !
            </p>
            {streakCount > 1 && (
              <p className="text-yellow-400 mt-4">
                🔥 Série actuelle : {streakCount} jours !
              </p>
            )}
          </div>
        ) : showResults ? (
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Défi Terminé !</h3>
            <p className="text-green-300 mb-4">
              Score: {score}/{currentChallenge.questions?.length}
            </p>
            <div className="space-y-2 text-green-300/70">
              <p>XP de base: {currentChallenge.xpReward}</p>
              <p>Bonus de série: +{Math.floor(currentChallenge.xpReward * (streakCount * 0.1))}</p>
              <p>Bonus de précision: +{Math.floor(currentChallenge.xpReward * (score / (currentChallenge.questions?.length || 1)))}</p>
              <p className="text-lg font-bold text-green-400 mt-4">
                Total XP: {currentChallenge.xpReward + 
                  Math.floor(currentChallenge.xpReward * (streakCount * 0.1)) +
                  Math.floor(currentChallenge.xpReward * (score / (currentChallenge.questions?.length || 1)))}
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">{currentChallenge.title}</h3>
              <p className="text-green-300/70">{currentChallenge.description}</p>
            </div>

            {currentChallenge.questions && (
              <div className="space-y-6">
                <div className="p-4 bg-black/30 rounded-lg border border-green-500/30">
                  <p className="text-lg mb-4">
                    {currentChallenge.questions[questionIndex].question}
                  </p>
                  <div className="space-y-2">
                    {currentChallenge.questions[questionIndex].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        disabled={showExplanation}
                        className={`
                          w-full p-4 rounded-lg text-left transition-all duration-300
                          ${showExplanation 
                            ? index === currentChallenge.questions![questionIndex].correctAnswer
                              ? 'bg-green-500/20 border-2 border-green-500'
                              : index === selectedAnswer
                                ? 'bg-red-500/20 border-2 border-red-500'
                                : 'bg-black/30 border-2 border-transparent opacity-50'
                            : 'bg-black/30 border-2 border-green-500/30 hover:border-green-500 hover:bg-green-900/30'
                          }
                        `}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {showExplanation && (
                  <div className="p-4 bg-green-900/30 rounded-lg border border-green-500/30 mb-4">
                    <p className="text-green-300">
                      {currentChallenge.questions[questionIndex].explanation}
                    </p>
                  </div>
                )}

                {showExplanation && (
                  <button
                    onClick={nextQuestion}
                    className="w-full p-3 rounded-lg bg-green-500/20 border-2 border-green-500 hover:bg-green-500/30 transition-all duration-300"
                  >
                    {questionIndex < currentChallenge.questions.length - 1 ? 'Question Suivante' : 'Terminer le Défi'}
                  </button>
                )}

                <div className="flex justify-between text-sm text-green-300/70">
                  <span>Question {questionIndex + 1}/{currentChallenge.questions.length}</span>
                  <span>{currentChallenge.xpReward} XP de base à gagner</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};