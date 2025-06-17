import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  timeout?: boolean;
  onTimeout?: () => void;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message = 'Chargement...',
  timeout = false,
  onTimeout
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
        {timeout && (
          <div className="absolute inset-0 rounded-full border-2 border-red-200 animate-pulse" />
        )}
      </div>
      
      <div className="text-center">
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
          {message}
        </p>
        
        {timeout && (
          <div className="mt-2">
            <p className="text-xs text-orange-600">
              Le chargement prend plus de temps que prévu...
            </p>
            {onTimeout && (
              <button
                onClick={onTimeout}
                className="text-xs text-blue-600 hover:text-blue-800 underline mt-1"
              >
                Annuler et réessayer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};