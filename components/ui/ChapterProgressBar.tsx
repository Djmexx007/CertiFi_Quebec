import React from 'react';

interface ChapterProgressBarProps {
  currentScore: number;
  totalQuestions: number;
  minimumPassingScore: number;
}

const ChapterProgressBar: React.FC<ChapterProgressBarProps> = ({ 
  currentScore, 
  totalQuestions, 
  minimumPassingScore 
}) => {
  const currentPercentage = totalQuestions > 0 ? (currentScore / totalQuestions) * 100 : 0;
  const minimumPercentage = minimumPassingScore * 100;
  
  console.log(`ChapterProgressBar - currentScore: ${currentScore}, totalQuestions: ${totalQuestions}`);
  console.log(`ChapterProgressBar - currentPercentage: ${currentPercentage}%, minimumPercentage: ${minimumPercentage}%`);
  
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs text-green-300/70">
        <span>Progression</span>
        <span>{Math.round(currentPercentage)}% / Minimum {Math.round(minimumPercentage)}%</span>
      </div>
      <div className="relative h-3 bg-green-900/30 rounded-full overflow-hidden">
        {/* Minimum score indicator */}
        <div 
          className="absolute h-full w-px bg-yellow-400 z-10"
          style={{ left: `${minimumPercentage}%` }}
        >
          <div className="w-2 h-2 rounded-full bg-yellow-400 -ml-1 -mt-0.5"></div>
        </div>
        
        {/* Current progress */}
        <div 
          className={`h-full transition-all duration-300 ${
            currentPercentage >= minimumPercentage ? 'bg-green-500' : 'bg-orange-500'
          }`}
          style={{ width: `${currentPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default ChapterProgressBar;