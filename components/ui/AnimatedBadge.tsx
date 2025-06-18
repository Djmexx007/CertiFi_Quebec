import React from 'react';
import { Sparkles, BadgeCheck } from 'lucide-react';

interface Props {
  badgeName: string;
  onClose: () => void;
}

export const AnimatedBadge: React.FC<Props> = ({ badgeName, onClose }) => {
  return (
    <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-green-800/90 border-2 border-green-500 p-6 rounded-xl shadow-xl animate-pulse text-center space-y-2">
        <BadgeCheck className="w-10 h-10 text-yellow-400 mx-auto animate-bounce" />
        <h3 className="text-lg font-bold text-green-100">Nouveau Badge !</h3>
        <p className="text-green-300">{badgeName}</p>
        <button
          onClick={onClose}
          className="mt-2 px-4 py-1 border border-green-300 rounded-md text-sm hover:bg-green-700/30 transition"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};
