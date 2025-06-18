import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface ChapterCompletionModalProps {
  success: boolean;
  score: number;
  totalQuestions: number;
  minimumPassingScore: number;
  onRetry: () => void;
  onContinue: () => void;
}

export const ChapterCompletionModal: React.FC<ChapterCompletionModalProps> = ({
  success,
  score,
  totalQuestions,
  minimumPassingScore,
  onRetry,
  onContinue
}) => {
  const scorePercentage = Math.round((score / totalQuestions) * 100);
  const minimumPercentage = Math.round(minimumPassingScore * 100);
  
  return (
    <motion.div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`bg-zinc-900 rounded-xl border-2 ${
          success ? 'border-green-500' : 'border-red-500'
        } p-8 max-w-md w-full text-center`}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        {success ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-400 mb-2">Chapitre Complété!</h2>
            <p className="text-green-200 mb-4">
              Félicitations! Vous avez obtenu {scorePercentage}% et réussi ce chapitre.
            </p>
            <button
              onClick={onContinue}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
            >
              Continuer
            </button>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-400 mb-2">Score Insuffisant</h2>
            <p className="text-red-200 mb-2">
              Vous avez obtenu {scorePercentage}%, mais un minimum de {minimumPercentage}% est requis.
            </p>
            <p className="text-zinc-400 text-sm mb-6">
              Révisez le contenu et réessayez pour débloquer le chapitre suivant.
            </p>
            <button
              onClick={onRetry}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer le chapitre
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ChapterCompletionModal;