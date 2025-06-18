import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Sparkles } from 'lucide-react';

interface FinalChapterUnlockedModalProps {
  onClose: () => void;
}

export const FinalChapterUnlockedModal: React.FC<FinalChapterUnlockedModalProps> = ({ onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-black border border-green-500 rounded-xl p-8 text-center space-y-4 max-w-md"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 120 }}
      >
        <Trophy className="w-12 h-12 text-yellow-400 mx-auto animate-bounce" />
        <h2 className="text-2xl font-bold text-green-400">Félicitations !</h2>
        <p className="text-green-200">
          Vous avez complété tous les chapitres. Le dernier niveau vient d'être déverrouillé !
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-green-800 border border-green-500 rounded-lg hover:bg-green-700 transition-all"
        >
          Continuer
        </button>
      </motion.div>
    </motion.div>
  );
};