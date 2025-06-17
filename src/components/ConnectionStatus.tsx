import React from 'react';
import { Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';

interface ConnectionStatusProps {
  status: 'connected' | 'disconnected' | 'checking' | 'error';
  error?: string | null;
  retryCount?: number;
  onRetry?: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  error,
  retryCount = 0,
  onRetry
}) => {
  if (status === 'connected') {
    return null; // Ne rien afficher si tout va bien
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'checking':
        return {
          icon: RefreshCw,
          iconClass: 'text-blue-600 animate-spin',
          bgClass: 'bg-blue-50 border-blue-200',
          textClass: 'text-blue-800',
          title: 'Vérification de la connexion...',
          message: 'Veuillez patienter pendant que nous vérifions votre connexion.'
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          iconClass: 'text-red-600',
          bgClass: 'bg-red-50 border-red-200',
          textClass: 'text-red-800',
          title: 'Connexion réseau perdue',
          message: 'Vérifiez votre connexion internet et réessayez.'
        };
      case 'error':
        return {
          icon: AlertCircle,
          iconClass: 'text-orange-600',
          bgClass: 'bg-orange-50 border-orange-200',
          textClass: 'text-orange-800',
          title: 'Erreur de connexion',
          message: error || 'Une erreur est survenue lors de la connexion au serveur.'
        };
      default:
        return {
          icon: Wifi,
          iconClass: 'text-gray-600',
          bgClass: 'bg-gray-50 border-gray-200',
          textClass: 'text-gray-800',
          title: 'Statut inconnu',
          message: 'Statut de connexion indéterminé.'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border p-4 ${config.bgClass}`}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 mt-0.5 ${config.iconClass}`} />
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${config.textClass}`}>
            {config.title}
          </h3>
          <p className={`text-sm mt-1 ${config.textClass} opacity-90`}>
            {config.message}
          </p>
          
          {retryCount > 0 && (
            <p className={`text-xs mt-2 ${config.textClass} opacity-75`}>
              Tentatives de reconnexion : {retryCount}/3
            </p>
          )}
          
          {onRetry && (status === 'disconnected' || status === 'error') && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                icon={RefreshCw}
                className="text-xs"
              >
                Réessayer
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};