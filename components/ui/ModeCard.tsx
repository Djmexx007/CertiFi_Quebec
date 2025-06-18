import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const ModeCard: React.FC<ModeCardProps> = ({
  title,
  description,
  icon,
  onClick,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group relative w-full rounded-xl border border-gray-200 p-5 shadow-sm bg-white text-gray-800 transition-all duration-200 hover:shadow-md hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl text-blue-600 opacity-80">{icon}</div>
        <div className="flex flex-col text-left">
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className="ml-auto text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight />
        </div>
      </div>
    </button>
  );
};

export default ModeCard;