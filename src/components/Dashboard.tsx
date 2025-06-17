import React, { useState, useEffect } from 'react';
import { BookOpen, Headphones, Trophy, Users, BarChart3, PlayCircle, Star, Award } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { RoleBadge } from './RoleBadge';
import { User, SupabaseAPI } from '../lib/supabase';

interface DashboardProps {
  user: User;
}

interface QuickAction {
  title: string;
  description: string;
  icon: typeof BookOpen;
  color: string;
  action: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [activitiesResponse, leaderboardResponse] = await Promise.all([
        SupabaseAPI.getRecentActivities(5),
        SupabaseAPI.getLeaderboard('global', 10)
      ]);

      if (activitiesResponse && !activitiesResponse.error) {
        setRecentActivities(activitiesResponse.activities || []);
      }

      if (leaderboardResponse && !leaderboardResponse.error) {
        setLeaderboard(leaderboardResponse.leaderboard || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      title: 'Podcasts IA',
      description: 'Écouter les derniers podcasts de formation',
      icon: Headphones,
      color: 'bg-purple-500',
      action: () => console.log('Podcasts clicked')
    },
    {
      title: 'Examen Simulé',
      description: user.initial_role === 'PQAP' ? '35 questions AMF PQAP' : 
                   user.initial_role === 'FONDS_MUTUELS' ? '100 questions Fonds Mutuels' : 
                   'Choisir votre examen',
      icon: BookOpen,
      color: 'bg-blue-500',
      action: () => console.log('Exam clicked')
    },
    {
      title: 'Classements',
      description: 'Voir votre position et vos progrès',
      icon: Trophy,
      color: 'bg-yellow-500',
      action: () => console.log('Leaderboard clicked')
    },
    {
      title: 'Mini-jeux',
      description: 'Jouer aux mini-jeux éducatifs',
      icon: Users,
      color: 'bg-green-500',
      action: () => console.log('Minigames clicked')
    }
  ];

  const getXpToNextLevel = (currentXp: number, level: number): number => {
    return (level * 1000) - (currentXp % 1000);
  };

  const getXpProgress = (currentXp: number): number => {
    return (currentXp % 1000) / 1000 * 100;
  };

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

  const getUserRankPosition = () => {
    const userPosition = leaderboard.findIndex(u => u.id === user.id) + 1;
    return userPosition > 0 ? userPosition : user.stats?.rank_position || 'N/A';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Barre de progression et bienvenue */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Bienvenue, {user.first_name} !
              </h2>
              <div className="flex items-center space-x-4">
                <RoleBadge role={user.initial_role} />
                <span className="text-sm text-gray-600">
                  Niveau {user.current_level} • {user.current_xp.toLocaleString()} XP
                </span>
                <span className="text-sm text-gray-600">
                  Rang #{getUserRankPosition()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-2">
                Progrès vers le niveau {user.current_level + 1}
              </p>
              <div className="w-48 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${getXpProgress(user.current_xp)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {getXpToNextLevel(user.current_xp, user.current_level)} XP restants
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Statistiques utilisateur */}
      {user.stats && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{user.stats.total_exams}</div>
              <div className="text-sm text-gray-600">Examens passés</div>
            </Card>
            
            <Card className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{user.stats.passed_exams}</div>
              <div className="text-sm text-gray-600">Examens réussis</div>
            </Card>
            
            <Card className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{user.stats.total_podcasts_listened}</div>
              <div className="text-sm text-gray-600">Podcasts écoutés</div>
            </Card>
            
            <Card className="text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{user.stats.average_score?.toFixed(1) || '0'}%</div>
              <div className="text-sm text-gray-600">Score moyen</div>
            </Card>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} className="hover:shadow-xl transition-shadow duration-200 cursor-pointer" onClick={action.action}>
                <div className="text-center">
                  <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{action.title}</h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activités récentes */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.activity_type === 'level_up' ? 'bg-yellow-100' :
                      activity.activity_type === 'exam_completed' ? 'bg-blue-100' :
                      activity.activity_type === 'podcast_listened' ? 'bg-purple-100' :
                      'bg-green-100'
                    }`}>
                      {activity.activity_type === 'level_up' ? <Star className="w-4 h-4 text-yellow-600" /> :
                       activity.activity_type === 'exam_completed' ? <BookOpen className="w-4 h-4 text-blue-600" /> :
                       activity.activity_type === 'podcast_listened' ? <Headphones className="w-4 h-4 text-purple-600" /> :
                       <PlayCircle className="w-4 h-4 text-green-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {formatActivityType(activity.activity_type)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.xp_gained > 0 && `+${activity.xp_gained} XP • `}
                        {formatTimeAgo(activity.occurred_at)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aucune activité récente
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Classement */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top 10 Classement</h3>
            <Trophy className="w-5 h-5 text-gray-400" />
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                  <div className="w-12 h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((player, index) => (
                <div 
                  key={player.id} 
                  className={`flex items-center justify-between p-2 rounded ${
                    player.id === user.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${player.id === user.id ? 'text-blue-900' : 'text-gray-900'}`}>
                        {player.first_name} {player.last_name}
                        {player.id === user.id && ' (Vous)'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Niveau {player.current_level} • {player.gamified_role}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {player.current_xp.toLocaleString()} XP
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};