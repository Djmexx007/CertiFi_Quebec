import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  Users,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Shield,
  X,
  Save,
  Eye,
  Download,
  Filter,
  Mail,
  UserPlus,
  Lock
} from 'lucide-react'
import toast from 'react-hot-toast'

interface UserProfile {
  id: string
  username: string
  role: string
  xp: number
  chapters_completed: string[]
  created_at: string
  avatar_url: string
  email?: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({})
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [filterRole, setFilterRole] = useState<string>('all')
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    username: '',
    password: '',
    role: 'user'
  })

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
      applyFilters(data || [], searchTerm, filterRole)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const applyFilters = (userList: UserProfile[], search: string, role: string) => {
    let filtered = [...userList]
    
    // Apply search filter
    if (search) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(search.toLowerCase()))
      )
    }
    
    // Apply role filter
    if (role !== 'all') {
      filtered = filtered.filter(user => user.role === role)
    }
    
    setFilteredUsers(filtered)
  }

  useEffect(() => {
    applyFilters(users, searchTerm, filterRole)
  }, [searchTerm, filterRole, users])

  const handleSaveUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(editForm)
        .eq('id', id)

      if (error) throw error
      
      toast.success('Utilisateur mis à jour')
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      toast.success('Utilisateur supprimé')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      return toast.error('Aucun utilisateur sélectionné')
    }

    switch (action) {
      case 'delete':
        if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedUsers.length} utilisateurs ?`)) return
        
        try {
          const { error } = await supabase
            .from('profiles')
            .delete()
            .in('id', selectedUsers)

          if (error) throw error
          
          toast.success(`${selectedUsers.length} utilisateurs supprimés`)
          setSelectedUsers([])
          fetchUsers()
        } catch (error) {
          console.error('Error deleting users:', error)
          toast.error('Erreur lors de la suppression')
        }
        break
        
      case 'export':
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .in('id', selectedUsers)

          if (error) throw error
          
          // Create CSV
          const headers = ['id', 'username', 'email', 'role', 'xp', 'created_at']
          const csvContent = [
            headers.join(','),
            ...data.map(user => headers.map(header => JSON.stringify(user[header] || '')).join(','))
          ].join('\n')
          
          // Download
          const blob = new Blob([csvContent], { type: 'text/csv' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'users_export.csv'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          
          toast.success(`${selectedUsers.length} utilisateurs exportés`)
        } catch (error) {
          console.error('Error exporting users:', error)
          toast.error('Erreur lors de l\'exportation')
        }
        break
        
      case 'resetPassword':
        toast.error('Fonctionnalité non implémentée')
        break
        
      default:
        toast.error('Action non reconnue')
    }
  }

  const handleAddUser = async () => {
    try {
      if (!newUser.email || !newUser.username || !newUser.password) {
        return toast.error('Tous les champs sont obligatoires')
      }

      // Check if username exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', newUser.username)
        .maybeSingle()

      if (existingUser) {
        return toast.error('Ce nom d\'utilisateur est déjà utilisé')
      }

      // Create user with auth
      const { data, error } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password
      })

      if (error) throw error

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: newUser.username,
            role: newUser.role,
            xp: 0,
            chapters_completed: [],
            email: newUser.email
          })

        if (profileError) throw profileError

        toast.success('Utilisateur créé avec succès')
        setShowAddUser(false)
        setNewUser({
          email: '',
          username: '',
          password: '',
          role: 'user'
        })
        fetchUsers()
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Erreur lors de la création de l\'utilisateur')
    }
  }

  const UserDetailsModal = ({ user, onClose }: { user: UserProfile, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl border border-zinc-700 w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b border-zinc-700">
          <h3 className="text-xl font-bold text-white">Détails de l'utilisateur</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt=""
              className="w-16 h-16 rounded-full border-2 border-emerald-500"
            />
            <div>
              <h4 className="text-lg font-bold text-white">{user.username}</h4>
              <span className={`px-2 py-1 rounded-full text-xs ${
                user.role === 'admin' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {user.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-zinc-800 rounded-lg">
              <p className="text-sm text-zinc-400">XP Total</p>
              <p className="text-xl font-bold text-white">{user.xp || 0}</p>
            </div>
            <div className="p-4 bg-zinc-800 rounded-lg">
              <p className="text-sm text-zinc-400">Chapitres Complétés</p>
              <p className="text-xl font-bold text-white">{(user.chapters_completed || []).length}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-medium text-zinc-400 mb-2">Date d'inscription</h5>
              <p className="text-white">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-zinc-400 mb-2">Email</h5>
              <p className="text-white">{user.email || 'Non disponible'}</p>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-zinc-400 mb-2">Chapitres complétés</h5>
              {user.chapters_completed?.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {user.chapters_completed.map((chapter, index) => (
                    <div key={index} className="p-2 bg-zinc-800 rounded text-sm text-white">
                      {chapter}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500">Aucun chapitre complété</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const AddUserModal = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl border border-zinc-700 w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-zinc-700">
          <h3 className="text-xl font-bold text-white">Ajouter un utilisateur</h3>
          <button onClick={() => setShowAddUser(false)} className="text-zinc-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Nom d'utilisateur</label>
            <input
              type="text"
              value={newUser.username}
              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Mot de passe</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Rôle</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white"
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          
          <button
            onClick={handleAddUser}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-white"
          >
            Créer l'utilisateur
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white appearance-none focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Tous les rôles</option>
              <option value="user">Utilisateurs</option>
              <option value="admin">Administrateurs</option>
            </select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
          </div>
          
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 rounded-lg text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowAddUser(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white"
          >
            <UserPlus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Actions en masse */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700">
          <span className="text-sm text-zinc-300">
            {selectedUsers.length} utilisateur{selectedUsers.length > 1 ? 's' : ''} sélectionné{selectedUsers.length > 1 ? 's' : ''}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('export')}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>
            <button
              onClick={() => handleBulkAction('resetPassword')}
              className="flex items-center gap-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-sm"
            >
              <Lock className="w-4 h-4" />
              Réinitialiser MDP
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="flex items-center gap-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
            <button
              onClick={() => setSelectedUsers([])}
              className="flex items-center gap-2 px-3 py-1 bg-zinc-600 hover:bg-zinc-700 rounded text-white text-sm"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="bg-zinc-800 rounded-xl border border-zinc-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-900/50">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id))
                      } else {
                        setSelectedUsers([])
                      }
                    }}
                    className="rounded bg-zinc-700 border-zinc-600 text-emerald-500 focus:ring-emerald-500"
                  />
                </th>
                <th className="p-4 font-medium text-zinc-400">Utilisateur</th>
                <th className="p-4 font-medium text-zinc-400">Rôle</th>
                <th className="p-4 font-medium text-zinc-400">XP</th>
                <th className="p-4 font-medium text-zinc-400">Chapitres</th>
                <th className="p-4 font-medium text-zinc-400">Inscrit le</th>
                <th className="p-4 font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-zinc-700 hover:bg-zinc-700/40">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id])
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                        }
                      }}
                      className="rounded bg-zinc-700 border-zinc-600 text-emerald-500 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="p-4">
                    {editingUser === user.id ? (
                      <input
                        type="text"
                        value={editForm.username || ''}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className="w-full p-2 bg-zinc-900 border border-zinc-600 rounded text-white"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="font-medium text-white">{user.username}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {editingUser === user.id ? (
                      <select
                        value={editForm.role || user.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="p-2 bg-zinc-900 border border-zinc-600 rounded text-white"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-white">
                    {editingUser === user.id ? (
                      <input
                        type="number"
                        value={editForm.xp !== undefined ? editForm.xp : user.xp || 0}
                        onChange={(e) => setEditForm({ ...editForm, xp: parseInt(e.target.value) })}
                        className="w-20 p-2 bg-zinc-900 border border-zinc-600 rounded text-white"
                      />
                    ) : (
                      user.xp || 0
                    )}
                  </td>
                  <td className="p-4 text-white">{(user.chapters_completed || []).length}</td>
                  <td className="p-4 text-zinc-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {editingUser === user.id ? (
                        <>
                          <button
                            onClick={() => handleSaveUser(user.id)}
                            className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="p-2 text-zinc-400 hover:bg-zinc-500/10 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(user.id)
                              setEditForm({
                                username: user.username,
                                role: user.role,
                                xp: user.xp
                              })
                            }}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await supabase.auth.resetPasswordForEmail(user.email || '')
                                toast.success('Email de réinitialisation envoyé')
                              } catch (error) {
                                toast.error('Erreur lors de l\'envoi de l\'email')
                              }
                            }}
                            className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded"
                            title="Réinitialiser le mot de passe"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <UserDetailsModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}

      {showAddUser && <AddUserModal />}
    </div>
  )
}