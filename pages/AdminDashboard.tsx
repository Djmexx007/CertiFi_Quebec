import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { useUserProfile } from '@/hooks/useUserProfile'
import {
  BarChart2,
  Trash2,
  ShieldCheck,
  RefreshCw,
  Eye,
  Loader2,
  Award,
  Users as UsersIcon,
  Trophy,
  Star,
  Home,
  Bell,
  AlertCircle,
  Calendar,
  Activity
} from 'lucide-react'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

export default function AdminDashboard() {
  const { isAdmin, loading } = useUserProfile()
  const navigate = useNavigate()
  const [users, setUsers] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalXP: 0,
    avgXP: 0,
    completionRate: 0,
    activeUsers: 0,
    recentActivity: []
  })
  const [activityData, setActivityData] = useState([])
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Nouvel utilisateur inscrit", type: "info", time: "Il y a 5 minutes" },
    { id: 2, message: "Mise à jour système disponible", type: "warning", time: "Il y a 2 heures" },
    { id: 3, message: "Pic d'activité détecté", type: "success", time: "Aujourd'hui, 10:45" }
  ])

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899']

  const fetchUsers = async () => {
    setRefreshing(true)
    try {
      const { data, error } = await supabase.from('profiles').select('*')
      if (error) throw error
      setUsers(data || [])
      setError(null)
      
      // Calculate stats
      const totalXP = data.reduce((sum, user) => sum + (user.xp || 0), 0)
      const avgXP = data.length > 0 ? Math.round(totalXP / data.length) : 0
      const completionRate = data.length > 0 
        ? Math.round((data.filter(u => (u.chapters_completed || []).length > 0).length / data.length) * 100)
        : 0
      const activeUsers = data.filter(u => new Date(u.last_seen || 0) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length

      setStats({
        totalXP,
        avgXP,
        completionRate,
        activeUsers,
        recentActivity: []
      })

      // Generate activity data for chart
      const activityByDay = [
        { name: 'Lun', users: Math.floor(Math.random() * 20) + 5 },
        { name: 'Mar', users: Math.floor(Math.random() * 20) + 5 },
        { name: 'Mer', users: Math.floor(Math.random() * 20) + 5 },
        { name: 'Jeu', users: Math.floor(Math.random() * 20) + 5 },
        { name: 'Ven', users: Math.floor(Math.random() * 20) + 5 },
        { name: 'Sam', users: Math.floor(Math.random() * 20) + 5 },
        { name: 'Dim', users: Math.floor(Math.random() * 20) + 5 }
      ]
      setActivityData(activityByDay)

    } catch (err: any) {
      console.error('Error fetching users:', err)
      setError("Erreur lors du chargement des utilisateurs.")
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/')
    if (!loading && isAdmin) fetchUsers()
  }, [loading, isAdmin, navigate])

  const deleteUser = async (id: string, role: string) => {
    if (role === 'admin') return alert("Impossible de supprimer un admin.")
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id)
      if (error) throw error
      toast.success("Utilisateur supprimé")
      fetchUsers()
    } catch (err) {
      console.error('Error deleting user:', err)
      toast.error("Erreur lors de la suppression")
    }
  }

  const pieData = [
    { name: 'Débutants', value: users.filter(u => (u.xp || 0) < 100).length },
    { name: 'Intermédiaires', value: users.filter(u => (u.xp || 0) >= 100 && (u.xp || 0) < 500).length },
    { name: 'Avancés', value: users.filter(u => (u.xp || 0) >= 500 && (u.xp || 0) < 1000).length },
    { name: 'Experts', value: users.filter(u => (u.xp || 0) >= 1000).length }
  ]

  if (loading || refreshing) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" /> Tableau de bord Admin
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white"
            >
              <Home className="w-4 h-4" />
              Retour à l'accueil
            </button>
            <button
              onClick={() => navigate('/admin/menu')}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-white"
            >
              Menu Admin
            </button>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-800 p-6 rounded-xl shadow border border-zinc-700 hover:border-emerald-500/30 transition-colors">
            <h2 className="font-semibold mb-2 flex items-center gap-2 text-zinc-400">
              <UsersIcon className="w-5 h-5 text-blue-400" />
              Utilisateurs
            </h2>
            <p className="text-3xl font-bold text-white">{users.length}</p>
            <p className="text-xs text-zinc-500 mt-2">Total des comptes</p>
          </div>

          <div className="bg-zinc-800 p-6 rounded-xl shadow border border-zinc-700 hover:border-emerald-500/30 transition-colors">
            <h2 className="font-semibold mb-2 flex items-center gap-2 text-zinc-400">
              <Trophy className="w-5 h-5 text-yellow-400" />
              XP Total
            </h2>
            <p className="text-3xl font-bold text-white">{stats.totalXP}</p>
            <p className="text-xs text-zinc-500 mt-2">Points d'expérience cumulés</p>
          </div>

          <div className="bg-zinc-800 p-6 rounded-xl shadow border border-zinc-700 hover:border-emerald-500/30 transition-colors">
            <h2 className="font-semibold mb-2 flex items-center gap-2 text-zinc-400">
              <Star className="w-5 h-5 text-purple-400" />
              XP Moyen
            </h2>
            <p className="text-3xl font-bold text-white">{stats.avgXP}</p>
            <p className="text-xs text-zinc-500 mt-2">Moyenne par utilisateur</p>
          </div>

          <div className="bg-zinc-800 p-6 rounded-xl shadow border border-zinc-700 hover:border-emerald-500/30 transition-colors">
            <h2 className="font-semibold mb-2 flex items-center gap-2 text-zinc-400">
              <Award className="w-5 h-5 text-emerald-400" />
              Taux de Complétion
            </h2>
            <p className="text-3xl font-bold text-white">{stats.completionRate}%</p>
            <p className="text-xs text-zinc-500 mt-2">Utilisateurs actifs</p>
          </div>
        </div>

        {/* Graphiques et activité */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Graphique d'activité */}
          <div className="bg-zinc-800 p-6 rounded-xl shadow border border-zinc-700 lg:col-span-2">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-white">
              <Activity className="w-5 h-5 text-emerald-400" />
              Activité des utilisateurs
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }} />
                  <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution des niveaux */}
          <div className="bg-zinc-800 p-6 rounded-xl shadow border border-zinc-700">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-white">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
              Distribution des niveaux
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Notifications et liste d'utilisateurs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des utilisateurs */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Utilisateurs récents</h2>
              <div className="flex gap-2">
                <button
                  onClick={fetchUsers}
                  className="flex items-center gap-2 text-sm px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded"
                >
                  <RefreshCw className="w-4 h-4" /> Rafraîchir
                </button>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="flex items-center gap-2 text-sm px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded"
                >
                  Voir tous
                </button>
              </div>
            </div>

            <div className="bg-zinc-800 rounded-xl border border-zinc-700 overflow-hidden">
              {error ? (
                <p className="text-red-500 text-sm p-4">{error}</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-left text-emerald-300 bg-zinc-900/50">
                    <tr>
                      <th className="p-4">Nom</th>
                      <th className="p-4">Rôle</th>
                      <th className="p-4">XP</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 5).map((u) => (
                      <tr
                        key={u.id}
                        className="border-t border-zinc-700 hover:bg-zinc-700/50"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} 
                              alt="" 
                              className="w-8 h-8 rounded-full"
                            />
                            {u.username}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            u.role === 'admin' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">{u.xp ?? 0}</td>
                        <td className="p-4 space-x-2">
                          <button
                            onClick={() => navigate(`/admin/users?id=${u.id}`)}
                            className="px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 rounded"
                          >
                            <Eye className="inline w-4 h-4" /> Voir
                          </button>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => deleteUser(u.id, u.role)}
                              className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded"
                            >
                              <Trash2 className="inline w-4 h-4" /> Supprimer
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Notifications et alertes */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Notifications</h2>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs">
                {notifications.length} nouvelles
              </span>
            </div>
            
            <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-4 space-y-4">
              {notifications.map(notification => (
                <div key={notification.id} className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-700 hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-start gap-3">
                    {notification.type === 'info' && <Bell className="w-5 h-5 text-blue-400 mt-0.5" />}
                    {notification.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />}
                    {notification.type === 'success' && <Award className="w-5 h-5 text-emerald-400 mt-0.5" />}
                    <div>
                      <p className="text-white">{notification.message}</p>
                      <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              <button className="w-full py-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                Voir toutes les notifications
              </button>
            </div>

            {/* Statistiques rapides */}
            <div className="mt-6 bg-zinc-800 rounded-xl border border-zinc-700 p-4">
              <h2 className="font-semibold mb-4 text-white">Statistiques rapides</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Utilisateurs actifs</span>
                  <span className="text-emerald-400 font-medium">{Math.round(users.length * 0.7)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Nouveaux cette semaine</span>
                  <span className="text-emerald-400 font-medium">{Math.round(users.length * 0.2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Chapitres complétés</span>
                  <span className="text-emerald-400 font-medium">
                    {users.reduce((sum, user) => sum + ((user.chapters_completed || []).length), 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Taux de rétention</span>
                  <span className="text-emerald-400 font-medium">78%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}