import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
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
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading = false }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    primerica_id: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});

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
    
    if (!validateForm()) return;
    
    try {
      await onLogin(credentials);
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string | boolean) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
        <p className="text-gray-600 mt-2">Accédez à votre formation CertiFi</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Numéro de représentant"
          type="text"
          icon={User}
          value={credentials.primerica_id}
          onChange={(e) => handleInputChange('primerica_id', e.target.value)}
          error={errors.primerica_id}
          placeholder="PQAPUSER001"
          disabled={loading}
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
            disabled={loading}
          />
          <button
            type="button"
            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
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
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={loading}
          />
          <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
            Se souvenir de moi
          </label>
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={loading}
          disabled={loading}
        >
          Se connecter
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Problème de connexion ?{' '}
          <button className="text-blue-600 hover:text-blue-500 font-medium">
            Contactez l'administrateur
          </button>
        </p>
      </div>
    </Card>
  );
};