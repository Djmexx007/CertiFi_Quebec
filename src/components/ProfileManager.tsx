import React, { useState, useRef } from 'react';
import { User, Camera, Upload, X, CheckCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { User as UserType } from '../lib/supabase';

interface ProfileManagerProps {
  user: UserType;
  onProfileUpdate: (updates: Partial<UserType>) => Promise<void>;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  user,
  onProfileUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof typeof profileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    
    // Nettoyer les erreurs
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profileData.first_name.trim()) {
      newErrors.first_name = 'Le prénom est requis';
    }

    if (!profileData.last_name.trim()) {
      newErrors.last_name = 'Le nom est requis';
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    try {
      await onProfileUpdate(profileData);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('Le fichier ne doit pas dépasser 5MB');
      return;
    }

    // Créer un aperçu
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Simuler l'upload (à remplacer par la vraie logique Supabase Storage)
    handleAvatarUpload(file);
  };

  const handleAvatarUpload = async (file: File) => {
    setIsUploading(true);

    try {
      // Simulation de l'upload vers Supabase Storage
      // Dans une vraie implémentation, vous utiliseriez :
      // const { data, error } = await supabase.storage
      //   .from('avatars')
      //   .upload(`${user.id}/avatar.${file.name.split('.').pop()}`, file)

      // Simuler un délai d'upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simuler une URL d'avatar
      const avatarUrl = `https://example.com/avatars/${user.id}/avatar.jpg`;
      
      await onProfileUpdate({ avatar_url: avatarUrl });
      
      console.log('Avatar uploadé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'avatar:', error);
      alert('Erreur lors de l\'upload de l\'avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email
    });
    setErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Photo de profil */}
      <Card>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {avatarPreview || user.avatar_url ? (
                <img
                  src={avatarPreview || user.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Photo de profil</h3>
            <p className="text-sm text-gray-600 mb-3">
              Choisissez une photo qui vous représente. Format JPG, PNG ou GIF. Taille maximale : 5MB.
            </p>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                icon={Camera}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? 'Upload en cours...' : 'Changer la photo'}
              </Button>
              
              {(avatarPreview || user.avatar_url) && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={X}
                  onClick={() => {
                    setAvatarPreview(null);
                    onProfileUpdate({ avatar_url: null });
                  }}
                  disabled={isUploading}
                >
                  Supprimer
                </Button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>
      </Card>

      {/* Informations personnelles */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
            <p className="text-sm text-gray-600">Gérez vos informations de profil</p>
          </div>
          
          {!isEditing ? (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              Modifier
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
              >
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={handleSaveProfile}
                icon={CheckCircle}
              >
                Sauvegarder
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Prénom"
            value={profileData.first_name}
            onChange={(e) => handleInputChange('first_name', e.target.value)}
            error={errors.first_name}
            disabled={!isEditing}
          />

          <Input
            label="Nom"
            value={profileData.last_name}
            onChange={(e) => handleInputChange('last_name', e.target.value)}
            error={errors.last_name}
            disabled={!isEditing}
          />

          <Input
            label="Email"
            type="email"
            value={profileData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            disabled={!isEditing}
          />

          <Input
            label="Numéro de représentant"
            value={user.primerica_id}
            disabled={true}
            helperText="Ce champ ne peut pas être modifié"
          />
        </div>
      </Card>

      {/* Informations du compte */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du compte</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rôle initial
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
              {user.initial_role}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rôle gamifié
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
              {user.gamified_role}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Niveau actuel
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
              Niveau {user.current_level}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points d'expérience
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
              {user.current_xp.toLocaleString()} XP
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Membre depuis
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
              {new Date(user.created_at).toLocaleDateString('fr-CA')}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dernière activité
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
              {new Date(user.last_activity_at).toLocaleDateString('fr-CA')}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};