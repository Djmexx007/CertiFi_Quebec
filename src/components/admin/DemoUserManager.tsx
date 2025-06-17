import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Card } from '../ui/Card';
import { User } from '../../lib/supabase';

interface DemoUserManagerProps {
  user: User;
}

export const DemoUserManager: React.FC<DemoUserManagerProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* Message d'information */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900">
              Gestion des Utilisateurs de Démonstration Supprimée
            </h3>
            <p className="text-sm text-blue-800 mt-2">
              La fonctionnalité de gestion des utilisateurs de démonstration a été supprimée 
              de cette application. Seuls les utilisateurs réels peuvent désormais être créés 
              et gérés dans le système.
            </p>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Changements apportés :</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Suppression de tous les comptes de démonstration existants</li>
                <li>• Retrait de la logique de création automatique de comptes démo</li>
                <li>• Nettoyage des fonctions et endpoints liés aux utilisateurs démo</li>
                <li>• Mise à jour des triggers et fonctions de base de données</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Redirection vers la gestion normale des utilisateurs */}
      <Card>
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Gestion des Utilisateurs Réels
          </h3>
          <p className="text-gray-600 mb-6">
            Pour créer et gérer des utilisateurs, utilisez la section "Gestion des Utilisateurs" 
            dans le menu administrateur.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Fonctionnalités disponibles :</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Création de nouveaux utilisateurs réels</li>
              <li>• Attribution et modification des permissions</li>
              <li>• Gestion des rôles administrateur</li>
              <li>• Suppression d'utilisateurs (admin suprême uniquement)</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Avertissement pour les administrateurs suprêmes */}
      {user.is_supreme_admin && (
        <Card className="bg-orange-50 border-orange-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-900">Note pour les Administrateurs Suprêmes</h4>
              <p className="text-sm text-orange-800 mt-1">
                Si vous avez besoin de créer des comptes de test ou de formation, 
                utilisez la fonction de création d'utilisateur normale avec des adresses 
                email dédiées (ex: test@votre-domaine.com) et marquez-les clairement 
                dans leurs informations de profil.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};