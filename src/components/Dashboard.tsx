import React from 'react';
import { BookOpen, Headphones, Trophy, Users, BarChart3, PlayCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { RoleBadge } from './RoleBadge';
import { User } from '../types/auth';

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
      description: user.role === 'PQAP' ? '35 questions AMF PQAP' : user.role === 'FONDS_MUTUELS' ? '100 questions Fonds Mutuels' : 'Choisir votre examen',
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
      title: 'Communauté',
      description: 'Échanger avec les autres associés',
      icon: Users,
      color: 'bg-green-500',
      action: () => console.log('Community clicked')
    }
  ];

  const getXpToNextLevel = (currentXp: number, level: number): number => {
    return (level * 1000) - (currentXp % 1000);
  };

  const getXpProgress = (currentXp: number): number => {
    return (currentXp % 1000) / 1000 * 100;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Barre de progression et bienvenue */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Bienvenue, {user.firstName} !
              </h2>
              <div className="flex items-center space-x-4">
                <RoleBadge role={user.role} />
                <span className="text-sm text-gray-600">
                  Niveau {user.level} • {user.xp} XP
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-2">
                Progrès vers le niveau {user.level + 1}
              </p>
              <div className="w-48 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${getXpProgress(user.xp)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {getXpToNextLevel(user.xp, user.level)} XP restants
              </p>
            </div>
          </div>
        </Card>
      </div>

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

      {/* Statistiques récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <PlayCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Podcast complété</p>
                <p className="text-xs text-gray-500">+50 XP • Il y a 2 heures</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Examen simulé</p>
                <p className="text-xs text-gray-500">Score: 85% • Hier</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Prochains objectifs</h3>
            <Trophy className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm font-medium text-yellow-800">Défi hebdomadaire</p>
              <p className="text-xs text-yellow-600">Terminer 3 podcasts cette semaine</p>
              <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '66%' }} />
              </div>
            </div>
            <Button variant="outline" className="w-full" size="sm">
              Voir tous les défis
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};