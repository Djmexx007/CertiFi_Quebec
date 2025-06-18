import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { useUserProfile } from '@/hooks/useUserProfile'
import {
  BarChart2,
  Loader2,
  RefreshCw,
  PieChart,
  TrendingUp,
  ArrowLeft
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts'

interface Stats {
  xpDistribution: any[]
  chapterCompletion: any[]
  userGrowth: any[]
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899']

export default function AdminStats() {
  const { isAdmin, loading } = useUserProfile()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats>({
    xpDistribution: [],
    chapterCompletion: [],
    userGrowth: []
  })
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = async () => {
    if (!isAdmin) return
    setRefreshing(true)

    try {
      // Get all users
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true })

      if (!users) throw new Error('No users found')

      // XP Distribution
      const xpRanges = {
        '0-100': 0,
        '101-500': 0,
        '501-1000': 0,
        '1000+': 0
      }

      users.forEach(user => {
        const xp = user.xp || 0
        if (xp <= 100) xpRanges['0-100']++
        else if (xp <= 500) xpRanges['101-500']++
        else if (xp <= 1000) xpRanges['501-1000']++
        else xpRanges['1000+']++
      })

      const xpDistribution = Object.entries(xpRanges).map(([name, value]) => ({
        name,
        value
      }))

      // Chapter completion
      const completionData = users.map(user => ({
        name: user.username,
        completed: (user.chapters_completed || []).length
      }))
      completionData.sort((a, b) => b.completed - a.completed)

      // User growth over time
      const months: { [key: string]: number } = {}
      users.forEach(user => {
        const date = new Date(user.created_at)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        months[key] = (months[key] || 0) + 1
      })

      const userGrowth = Object.entries(months).map(([name, value]) => ({
        name,
        users: value
      }))

      setStats({
        xpDistribution,
        chapterCompletion: completionData.slice(0, 10), // Top 10
        userGrowth
      })

    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/')
      return
    }

    if (!loading && isAdmin) {
      fetchStats()
    }
  }, [loading, isAdmin])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-400 flex items-center gap-2">
            <BarChart2 className="w-8 h-8" />
            Statistiques
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Accueil
            </button>
            <button
              onClick={fetchStats}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Rafraîchir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* XP Distribution */}
          <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-emerald-400" />
              Distribution XP
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={stats.xpDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {stats.xpDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chapter Completion */}
          <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
              Chapitres Complétés (Top 10)
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chapterCompletion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Growth */}
          <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 lg:col-span-2">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Croissance Utilisateurs
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Bar dataKey="users" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}