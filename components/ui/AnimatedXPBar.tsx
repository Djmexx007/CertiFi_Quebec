import React from 'react';

interface Props {
  currentXP: number;
}

export const AnimatedXPBar: React.FC<Props> = ({ currentXP }) => {
  const nextLevelXP = 1000;
  const level = Math.floor(currentXP / nextLevelXP);
  const progress = currentXP % nextLevelXP;

  const progressPercent = (progress / nextLevelXP) * 100;

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-xs text-green-300/70 px-1">
        <span>{progress} / {nextLevelXP} XP</span>
      </div>
      <div className="relative w-full h-3 rounded-full bg-green-900/40 border border-green-500/20 overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-green-400 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
