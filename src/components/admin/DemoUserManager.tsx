import React, { useState } from 'react';
import { Users, Power, PowerOff, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SupabaseAPI, User } from '../../lib/supabase';

interface DemoUserManagerProps {
  user: User;
}

export const DemoUserManager: React.FC<DemoUserManagerProps> = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<{
    type: 'activate' | 'deactivate' | 'create';
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);

  // Vérifier si l'utilisateur a les droits suprême admin
  if (!user.is_supreme_admin) {
    return (
      <Card className="bg-red-50 border-red-200">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Accès Restreint</h3>
            <p className="text-sm text-red-700">
              Seuls les administrateurs suprêmes peuvent gérer les utilisateurs de démonstration.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const handleCreateDemoUsers = async () => {
    setIsLoading(true);
    setLastAction(null);

    try {
      const result = await SupabaseAPI.createDemoUsers();
      
      setLastAction({
        type: 'create',
        success: true,
        message: result.message,
        count: result.created?.length || 0
      });
    } catch (error) {
      console.error('Erreur lors de la création des utilisateurs de démonstration:', error);
      
      setLastAction({
        type: 'create',
        success: false,
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDemoUsers = async (activate: boolean) => {
    setIsLoading(true);
    setLastAction(null);

    try {
      const result = await SupabaseAPI.toggleDemoUsers(activate);
      
      setLastAction({
        type: activate ? 'activate' : 'deactivate',
        success: true,
        message: result.message,
        count: result.count
      });
    } catch (error) {
      console.error('Erreur lors de la bascule des utilisateurs de démonstration:', error);
      
      setLastAction({
        type: activate ? 'activate' : 'deactivate',
        success: false,
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Gestion des Utilisateurs de Démonstration
            </h2>
            <p className="text-sm text-gray-600">
              Créer, activer ou désactiver en masse tous les comptes de démonstration
            </p>
          </div>
        </div>
      </Card>

      {/* Mode démo détecté */}
      {(import.meta.env.VITE_MOCK_API === 'true' || !import.meta.env.VITE_SUPABASE_URL) && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">Mode Démonstration Détecté</h4>
              <p className="text-sm text-blue-800 mt-1">
                L'application fonctionne en mode démonstration avec des données simulées. 
                Les opérations sur les utilisateurs seront simulées.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Informations sur les utilisateurs de démonstration */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Utilisateurs de Démonstration Disponibles
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'SUPREMEADMIN001', name: 'Admin Suprême', role: 'Administrateur Suprême', email: 'supreme.admin@certifi.quebec' },
              { id: 'REGULARADMIN001', name: 'Admin Régulier', role: 'Administrateur', email: 'admin@certifi.quebec' },
              { id: 'PQAPUSER001', name: 'Jean Dupont', role: 'Conseiller PQAP', email: 'pqap.user@certifi.quebec' },
              { id: 'FONDSUSER001', name: 'Marie Tremblay', role: 'Expert Fonds Mutuels', email: 'fonds.user@certifi.quebec' },
              { id: 'BOTHUSER001', name: 'Pierre Bouchard', role: 'Conseiller Expert', email: 'both.user@certifi.quebec' }
            ].map((demoUser) => (
              <div key={demoUser.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{demoUser.name}</p>
                    <p className="text-sm text-gray-600">{demoUser.id}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {demoUser.role}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{demoUser.email}</p>
                <p className="text-xs text-gray-500 mt-1">Mot de passe: password123</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Actions de gestion */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Actions de Gestion</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleCreateDemoUsers}
              loading={isLoading}
              disabled={isLoading}
              icon={Users}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Créer les comptes démo
            </Button>
            
            <Button
              onClick={() => handleToggleDemoUsers(true)}
              loading={isLoading}
              disabled={isLoading}
              icon={Power}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Activer tous les comptes
            </Button>
            
            <Button
              onClick={() => handleToggleDemoUsers(false)}
              loading={isLoading}
              disabled={isLoading}
              icon={PowerOff}
              variant="secondary"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Désactiver tous les comptes
            </Button>
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
            <p className="font-medium text-blue-900 mb-2">ℹ️ Information importante :</p>
            <ul className="space-y-1 text-blue-800">
              <li>• <strong>Créer :</strong> Crée les utilisateurs de démonstration dans Supabase Auth et la base de données</li>
              <li>• <strong>Activer :</strong> Permet aux utilisateurs de démonstration de se connecter</li>
              <li>• <strong>Désactiver :</strong> Bloque temporairement l'accès sans supprimer les comptes</li>
              <li>• Cette action affecte tous les utilisateurs marqués comme "démonstration"</li>
              <li>• Les utilisateurs réels ne sont pas affectés par cette opération</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Résultat de la dernière action */}
      {lastAction && (
        <Card className={lastAction.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
          <div className="flex items-start space-x-3">
            {lastAction.success ? (
              <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`font-semibold ${lastAction.success ? 'text-green-900' : 'text-red-900'}`}>
                {lastAction.success ? 'Opération Réussie' : 'Erreur'}
              </h4>
              <p className={`text-sm ${lastAction.success ? 'text-green-800' : 'text-red-800'}`}>
                {lastAction.message}
              </p>
              {lastAction.success && lastAction.count !== undefined && (
                <p className="text-xs text-green-700 mt-1">
                  {lastAction.type === 'create' 
                    ? `${lastAction.count} utilisateur(s) de démonstration traité(s)`
                    : `${lastAction.count} utilisateur(s) de démonstration ${lastAction.type === 'activate' ? 'activé(s)' : 'désactivé(s)'}`
                  }
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Avertissement de sécurité */}
      <Card className="bg-orange-50 border-orange-200">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-orange-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-orange-900">Avertissement de Sécurité</h4>
            <p className="text-sm text-orange-800 mt-1">
              Les utilisateurs de démonstration utilisent des mots de passe simples et ne doivent être activés 
              que dans des environnements de test ou de démonstration. En production, assurez-vous qu'ils sont 
              désactivés pour maintenir la sécurité du système.
            </p>
            <div className="mt-2 text-xs text-orange-700">
              <p><strong>Mots de passe par défaut :</strong> password123</p>
              <p><strong>Métadonnée d'identification :</strong> is_demo_user: true</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};