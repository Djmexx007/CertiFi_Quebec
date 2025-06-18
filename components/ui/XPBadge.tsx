import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface XPBadgeProps {
  xp: number;
  className?: string;
}

const getLevel = (xp: number) => {
  return Math.floor(xp / 1000); // 100 XP = 1 niveau
};

export const XPBadge: React.FC<XPBadgeProps> = ({ xp, className = '' }) => {
  const level = getLevel(xp);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-600 bg-emerald-800/60 text-sm text-emerald-100 shadow-inner backdrop-blur-sm',
        className
      )}
    >
      <Sparkles className="h-4 w-4 text-emerald-300 animate-pulse" />
     {xp} XP
    </div>
  );
};

export default XPBadge;
