import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';

interface PasswordChangeFormProps {
  onPasswordChange: (newPassword: string) => Promise<void>;
  loading?: boolean;
  isRequired?: boolean;
}

export const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  onPasswordChange,
  loading = false,
  isRequired = false
}) => {
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmPassword: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePasswords = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validation du nouveau mot de passe
    if (!passwords.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (passwords.newPassword.length < 8) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwords.newPassword)) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre';
    }

    // Validation de la confirmation
    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await onPasswordChange(passwords.newPassword);
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof passwords, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    
    // Nettoyer les erreurs
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ];
    
    strength = checks.filter(Boolean).length;
    
    if (strength <= 2) return { level: 'weak', color: 'bg-red-500', text: 'Faible' };
    if (strength <= 3) return { level: 'medium', color: 'bg-yellow-500', text: 'Moyen' };
    if (strength <= 4) return { level: 'good', color: 'bg-blue-500', text: 'Bon' };
    return { level: 'strong', color: 'bg-green-500', text: 'Fort' };
  };

  const passwordStrength = getPasswordStrength(passwords.newPassword);
  const isFormDisabled = loading || isSubmitting;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isRequired ? 'Changement de Mot de Passe Requis' : 'Nouveau Mot de Passe'}
          </h2>
          <p className="text-gray-600 mt-2">
            {isRequired 
              ? 'Vous devez changer votre mot de passe temporaire avant de continuer'
              : 'Choisissez un nouveau mot de passe sécurisé'
            }
          </p>
        </div>

        {isRequired && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800">
                <p className="font-medium">Changement obligatoire</p>
                <p>Votre mot de passe actuel est temporaire et doit être modifié pour des raisons de sécurité.</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              label="Nouveau mot de passe"
              type={showPasswords.newPassword ? 'text' : 'password'}
              icon={Lock}
              value={passwords.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              error={errors.newPassword}
              placeholder="••••••••"
              disabled={isFormDisabled}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              onClick={() => setShowPasswords(prev => ({ ...prev, newPassword: !prev.newPassword }))}
              disabled={isFormDisabled}
              tabIndex={-1}
            >
              {showPasswords.newPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Indicateur de force du mot de passe */}
          {passwords.newPassword && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Force du mot de passe:</span>
                <span className={`font-medium ${
                  passwordStrength.level === 'weak' ? 'text-red-600' :
                  passwordStrength.level === 'medium' ? 'text-yellow-600' :
                  passwordStrength.level === 'good' ? 'text-blue-600' :
                  'text-green-600'
                }`}>
                  {passwordStrength.text}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(getPasswordStrength(passwords.newPassword).level === 'weak' ? 20 : 
                                   getPasswordStrength(passwords.newPassword).level === 'medium' ? 40 :
                                   getPasswordStrength(passwords.newPassword).level === 'good' ? 70 : 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="relative">
            <Input
              label="Confirmer le nouveau mot de passe"
              type={showPasswords.confirmPassword ? 'text' : 'password'}
              icon={Lock}
              value={passwords.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              placeholder="••••••••"
              disabled={isFormDisabled}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              onClick={() => setShowPasswords(prev => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
              disabled={isFormDisabled}
              tabIndex={-1}
            >
              {showPasswords.confirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Indicateur de correspondance */}
          {passwords.confirmPassword && (
            <div className="flex items-center space-x-2 text-sm">
              {passwords.newPassword === passwords.confirmPassword ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Les mots de passe correspondent</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-red-600">Les mots de passe ne correspondent pas</span>
                </>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={isSubmitting || loading}
            disabled={isFormDisabled}
          >
            {isSubmitting || loading ? 'Changement en cours...' : 'Changer le mot de passe'}
          </Button>
        </form>

        {/* Exigences du mot de passe */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Exigences du mot de passe :</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${passwords.newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Au moins 8 caractères</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${/[a-z]/.test(passwords.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Au moins une lettre minuscule</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(passwords.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Au moins une lettre majuscule</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${/\d/.test(passwords.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Au moins un chiffre</span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};