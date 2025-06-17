import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';

interface LoginCredentials {
  primerica_id: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  error?: string | null;
  onClearError?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onLogin, 
  loading = false, 
  disabled = false,
  error,
  onClearError
}) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    primerica_id: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Nettoyer l'erreur quand l'utilisateur commence à taper
  useEffect(() => {
    if (error && onClearError) {
      const timer = setTimeout(() => {
        onClearError();
      }, 10000); // Auto-clear après 10 secondes

      return () => clearTimeout(timer);
    }
  }, [error, onClearError]);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};
    
    if (!credentials.primerica_id.trim()) {
      newErrors.primerica_id = 'Le numéro de représentant est requis';
    }
    
    if (!credentials.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || disabled || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await onLogin(credentials);
    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string | boolean) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    
    // Nettoyer les erreurs de validation
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Nettoyer l'erreur globale
    if (error && onClearError) {
      onClearError();
    }
  };

  const isFormDisabled = loading || disabled || isSubmitting;

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
        <p className="text-gray-600 mt-2">Accédez à votre formation CertiFi</p>
      </div>

      {/* Affichage des erreurs globales */}
      {error && (
        <div className="mb-4 p-3 border rounded-lg bg-red-50 border-red-200">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
              {onClearError && (
                <button
                  onClick={onClearError}
                  className="text-xs text-red-600 hover:text-red-800 underline mt-1"
                >
                  Fermer
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Avertissement si désactivé */}
      {disabled && !loading && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <p className="text-sm text-orange-800">
              Connexion temporairement indisponible. Vérifiez votre connexion réseau.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Numéro de représentant"
          type="text"
          icon={User}
          value={credentials.primerica_id}
          onChange={(e) => handleInputChange('primerica_id', e.target.value)}
          error={errors.primerica_id}
          placeholder="Votre numéro de représentant"
          disabled={isFormDisabled}
          autoComplete="username"
        />

        <div className="relative">
          <Input
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            icon={Lock}
            value={credentials.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            error={errors.password}
            placeholder="••••••••"
            disabled={isFormDisabled}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isFormDisabled}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            checked={credentials.rememberMe}
            onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            disabled={isFormDisabled}
          />
          <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
            Se souvenir de moi
          </label>
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting || loading}
          disabled={isFormDisabled}
        >
          {isSubmitting || loading ? 'Connexion en cours...' : 'Se connecter'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Problème de connexion ?{' '}
          <button 
            className="text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50"
            disabled={isFormDisabled}
          >
            Contactez l'administrateur
          </button>
        </p>
      </div>
    </Card>
  );
};