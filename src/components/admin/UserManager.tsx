import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Shield, Crown } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SupabaseAPI, User } from '../../lib/supabase';

interface UserManagerProps {
  user: User;
}

interface UserListItem {
  id: string;
  primerica_id: string;
  first_name: string;
  last_name: string;
  email: string;
  initial_role: string;
  current_xp: number;
  current_level: number;
  gamified_role: string;
  is_admin: boolean;
  is_supreme_admin: boolean;
  is_active: boolean;
  created_at: string;
}

export const UserManager: React.FC<UserManagerProps> = ({ user }) => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, selectedRole]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await SupabaseAPI.getUsers({
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined,
        role: selectedRole || undefined
      });

      if (response && !response.error) {
        setUsers(response.users || []);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'supreme_admin', value: boolean) => {
    try {
      const updateData = {
        [newRole === 'admin' ? 'is_admin' : 'is_supreme_admin']: value
      };

      const response = await SupabaseAPI.updateUserPermissions(userId, updateData);
      
      if (response && !response.error) {
        await loadUsers(); // Recharger la liste
      } else {
        alert('Erreur lors de la mise à jour des permissions');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      alert('Erreur lors de la mise à jour des permissions');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!user.is_supreme_admin) {
      alert('Seul un administrateur suprême peut supprimer des utilisateurs');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userName} ? Cette action est irréversible.`)) {
      return;
    }

    try {
      const response = await SupabaseAPI.deleteUser(userId);
      
      if (response && !response.error) {
        await loadUsers(); // Recharger la liste
      } else {
        alert('Erreur lors de la suppression de l\'utilisateur');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-CA');
  };

  const getRoleBadge = (userItem: UserListItem) => {
    if (userItem.is_supreme_admin) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Crown className="w-3 h-3 mr-1" />
          Suprême Admin
        </span>
      );
    }
    if (userItem.is_admin) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </span>
      );
    }
    
    const roleColors = {
      'PQAP': 'bg-blue-100 text-blue-800',
      'FONDS_MUTUELS': 'bg-green-100 text-green-800',
      'LES_DEUX': 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleColors[userItem.initial_role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}`}>
        {userItem.initial_role}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête et filtres */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gestion des Utilisateurs</h2>
            <p className="text-sm text-gray-600">Gérer les comptes et permissions utilisateur</p>
          </div>
          <div className="flex space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les rôles</option>
              <option value="PQAP">PQAP</option>
              <option value="FONDS_MUTUELS">Fonds Mutuels</option>
              <option value="LES_DEUX">Les Deux</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Liste des utilisateurs */}
      <Card>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des utilisateurs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progression
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {userItem.first_name} {userItem.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {userItem.primerica_id} • {userItem.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(userItem)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Niveau {userItem.current_level} • {userItem.current_xp.toLocaleString()} XP
                      </div>
                      <div className="text-sm text-gray-500">
                        {userItem.gamified_role}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        userItem.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {userItem.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {/* Boutons de gestion des rôles admin */}
                      {user.is_supreme_admin && userItem.id !== user.id && (
                        <>
                          <button
                            onClick={() => handleRoleChange(userItem.id, 'admin', !userItem.is_admin)}
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              userItem.is_admin
                                ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            {userItem.is_admin ? 'Retirer Admin' : 'Faire Admin'}
                          </button>
                          
                          <button
                            onClick={() => handleRoleChange(userItem.id, 'supreme_admin', !userItem.is_supreme_admin)}
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              userItem.is_supreme_admin
                                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            <Crown className="w-3 h-3 mr-1" />
                            {userItem.is_supreme_admin ? 'Retirer S.Admin' : 'Faire S.Admin'}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteUser(userItem.id, `${userItem.first_name} ${userItem.last_name}`)}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Supprimer
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Page {currentPage} sur {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};