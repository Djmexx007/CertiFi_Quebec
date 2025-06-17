import React, { useState, useEffect } from 'react';
import { Clock, Trophy, Star, RotateCcw } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizGameProps {
  onScoreSubmit: (score: number, maxScore: number, sessionData: any) => Promise<void>;
}

export const QuizGame: React.FC<QuizGameProps> = ({ onScoreSubmit }) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number>(0);

  // Questions de démonstration
  const questions: Question[] = [
    {
      id: '1',
      question: 'Quelle est la définition de la déontologie en assurance?',
      options: [
        'Un ensemble de règles morales',
        'Une technique de vente',
        'Un produit d\'assurance',
        'Une méthode de calcul'
      ],
      correctAnswer: 0,
      explanation: 'La déontologie représente l\'ensemble des règles morales qui régissent une profession.'
    },
    {
      id: '2',
      question: 'Quel est le rôle principal d\'un conseiller PQAP?',
      options: [
        'Vendre des produits uniquement',
        'Conseiller et protéger les clients',
        'Gérer les réclamations',
        'Former d\'autres conseillers'
      ],
      correctAnswer: 1,
      explanation: 'Le conseiller PQAP a pour mission principale de conseiller et protéger les intérêts de ses clients.'
    },
    {
      id: '3',
      question: 'Quelle est la durée minimale de conservation des dossiers clients?',
      options: [
        '1 an',
        '3 ans',
        '5 ans',
        '7 ans'
      ],
      correctAnswer: 3,
      explanation: 'Les dossiers clients doivent être conservés pendant au moins 7 ans selon la réglementation.'
    }
  ];

  // Timer pour le jeu
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState === 'playing' && timeLeft > 0 && !showExplanation) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [gameState, timeLeft, showExplanation]);

  const startGame = () => {
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setGameStartTime(Date.now());
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || showExplanation) return;
    
    setSelectedAnswer(answerIndex);
    
    // Vérifier si la réponse est correcte
    if (answerIndex === questions[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
    }
    
    setShowExplanation(true);
  };

  const handleTimeUp = () => {
    if (selectedAnswer === null) {
      setSelectedAnswer(-1); // Aucune réponse sélectionnée
      setShowExplanation(true);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeLeft(30);
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    setGameState('finished');
    
    const gameEndTime = Date.now();
    const totalTime = gameEndTime - gameStartTime;
    const maxScore = questions.length;
    
    const sessionData = {
      totalQuestions: questions.length,
      correctAnswers: score,
      totalTime: totalTime,
      averageTimePerQuestion: totalTime / questions.length,
      gameStartTime,
      gameEndTime
    };

    try {
      await onScoreSubmit(score, maxScore, sessionData);
    } catch (error) {
      console.error('Erreur lors de la soumission du score:', error);
    }
  };

  const getScoreColor = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return 'Excellent travail! 🎉';
    if (percentage >= 60) return 'Bon travail! 👍';
    return 'Continuez à étudier! 📚';
  };

  if (gameState === 'menu') {
    return (
      <Card className="max-w-2xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Déontologie</h2>
          <p className="text-gray-600 mb-6">
            Testez vos connaissances en déontologie avec ce quiz interactif. 
            Vous avez 30 secondes par question.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Règles du jeu :</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {questions.length} questions à choix multiples</li>
              <li>• 30 secondes par question</li>
              <li>• 1 point par bonne réponse</li>
              <li>• Explication fournie après chaque réponse</li>
            </ul>
          </div>

          <Button onClick={startGame} size="lg" className="px-8">
            Commencer le Quiz
          </Button>
        </div>
      </Card>
    );
  }

  if (gameState === 'playing') {
    const currentQ = questions[currentQuestion];
    
    return (
      <Card className="max-w-2xl mx-auto">
        {/* En-tête avec progression */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestion + 1} / {questions.length}
            </span>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-900">{score} points</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className={`text-sm font-medium ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-900'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {currentQ.question}
          </h3>
          
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswer === null
                    ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    : selectedAnswer === index
                      ? index === currentQ.correctAnswer
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : 'border-red-500 bg-red-50 text-red-900'
                      : index === currentQ.correctAnswer
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                    selectedAnswer === null
                      ? 'border-gray-300 text-gray-500'
                      : selectedAnswer === index
                        ? index === currentQ.correctAnswer
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-red-500 bg-red-500 text-white'
                        : index === currentQ.correctAnswer
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 text-gray-400'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Explication */}
        {showExplanation && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Explication :</h4>
            <p className="text-sm text-blue-800">{currentQ.explanation}</p>
          </div>
        )}

        {/* Bouton suivant */}
        {showExplanation && (
          <div className="text-center">
            <Button onClick={nextQuestion}>
              {currentQuestion < questions.length - 1 ? 'Question suivante' : 'Voir les résultats'}
            </Button>
          </div>
        )}
      </Card>
    );
  }

  if (gameState === 'finished') {
    return (
      <Card className="max-w-2xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Terminé!</h2>
          <p className="text-gray-600 mb-6">{getScoreMessage()}</p>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Score final</p>
                <p className={`text-2xl font-bold ${getScoreColor()}`}>
                  {score} / {questions.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pourcentage</p>
                <p className={`text-2xl font-bold ${getScoreColor()}`}>
                  {Math.round((score / questions.length) * 100)}%
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={startGame}
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