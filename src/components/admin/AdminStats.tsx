import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Trophy, TrendingUp, Activity, Award } from 'lucide-react';
import { Card } from '../ui/Card';
import { SupabaseAPI, User } from '../../lib/supabase';

interface AdminStatsProps {
  user: User;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalExamAttempts: number;
  totalPodcastListens: number;
  roleDistribution: Record<string, number>;
  levelDistribution: Record<string, { count: number; avgXp: number }>;
}

export const AdminStats: React.FC<AdminStatsProps> = ({ user }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [statsResponse, activitiesResponse] = await Promise.all([
        SupabaseAPI.getDashboardStats(),
        SupabaseAPI.getGlobalActivities(10)
      ]);

      if (statsResponse && !statsResponse.error) {
        setStats(statsResponse);
      }

      if (activitiesResponse && !activitiesResponse.error) {
        setRecentActivities(activitiesResponse.activities || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Utilisateurs Totaux',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Utilisateurs Actifs',
      value: stats?.activeUsers || 0,
      icon: Activity,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Tentatives d\'Examen',
      value: stats?.totalExamAttempts || 0,
      icon: BookOpen,
      color: 'bg-purple-500',
      change: '+25%'
    },
    {
      title: 'Podcasts Écoutés',
      value: stats?.totalPodcastListens || 0,
      icon: Award,
      color: 'bg-orange-500',
      change: '+18%'
    }
  ];

  const formatActivityType = (type: string) => {
    const types: Record<string, string> = {
      'login': 'Connexion',
      'podcast_listened': 'Podcast écouté',
      'exam_completed': 'Examen terminé',
      'minigame_played': 'Mini-jeu joué',
      'level_up': 'Montée de niveau'
    };
    return types[type] || type;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
  };

  return (
    <div className="space-y-6">
      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                  <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Graphiques et détails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par rôle */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Répartition par Rôle</h3>
            <Trophy className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {stats?.roleDistribution && Object.entries(stats.roleDistribution).map(([role, count]) => {
              const total = Object.values(stats.roleDistribution).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total * 100).toFixed(1) : '0';
              
              return (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      role === 'PQAP' ? 'bg-blue-500' :
                      role === 'FONDS_MUTUELS' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700">{role}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                    <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Activités récentes globales */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Activités Récentes</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.activity_type === 'level_up' ? 'bg-yellow-100' :
                  activity.activity_type === 'exam_completed' ? 'bg-blue-100' :
                  activity.activity_type === 'podcast_listened' ? 'bg-purple-100' :
                  'bg-gray-100'
                }`}>
                  {activity.activity_type === 'level_up' ? '🎉' :
                   activity.activity_type === 'exam_completed' ? '📝' :
                   activity.activity_type === 'podcast_listened' ? '🎧' :
                   '🎮'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.users?.first_name} {activity.users?.last_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatActivityType(activity.activity_type)}
                    {activity.xp_gained > 0 && ` (+${activity.xp_gained} XP)`}
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  {formatTimeAgo(activity.occurred_at)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Répartition par niveau */}
      {stats?.levelDistribution && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Répartition par Niveau</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.levelDistribution)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([level, data]) => (
                <div key={level} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">Niv. {level}</div>
                  <div className="text-sm text-gray-600">{data.count} utilisateurs</div>
                  <div className="text-xs text-gray-500">{data.avgXp} XP moy.</div>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
};