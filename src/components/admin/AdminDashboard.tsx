import React, { useState } from 'react';
import { Users, BookOpen, BarChart3, Settings, FileText, Trophy, UserCog } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { User } from '../../lib/supabase';
import { UserManager } from './UserManager';
import { QuestionManager } from './QuestionManager';
import { ContentManager } from './ContentManager';
import { AdminStats } from './AdminStats';
import { DemoUserManager } from './DemoUserManager';

interface AdminDashboardProps {
  user: User;
}

type AdminSection = 'stats' | 'users' | 'questions' | 'content' | 'demo-users' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('stats');

  const adminSections = [
    {
      id: 'stats' as AdminSection,
      title: 'Statistiques',
      description: 'Vue d\'ensemble des performances',
      icon: BarChart3,
      color: 'bg-blue-500',
      available: true
    },
    {
      id: 'users' as AdminSection,
      title: 'Gestion des Utilisateurs',
      description: 'Gérer les comptes et permissions',
      icon: Users,
      color: 'bg-green-500',
      available: true
    },
    {
      id: 'demo-users' as AdminSection,
      title: 'Utilisateurs Démo',
      description: 'Gestion des comptes de démonstration',
      icon: UserCog,
      color: 'bg-purple-500',
      available: user.is_supreme_admin // Seulement pour les suprême admins
    },
    {
      id: 'questions' as AdminSection,
      title: 'Gestion des Questions',
      description: 'Créer et modifier les questions d\'examen',
      icon: BookOpen,
      color: 'bg-purple-500',
      available: true
    },
    {
      id: 'content' as AdminSection,
      title: 'Gestion du Contenu',
      description: 'Podcasts, examens et mini-jeux',
      icon: FileText,
      color: 'bg-orange-500',
      available: true
    },
    {
      id: 'settings' as AdminSection,
      title: 'Paramètres',
      description: 'Configuration système',
      icon: Settings,
      color: 'bg-gray-500',
      available: true
    }
  ].filter(section => section.available);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'stats':
        return <AdminStats user={user} />;
      case 'users':
        return <UserManager user={user} />;
      case 'demo-users':
        return <DemoUserManager user={user} />;
      case 'questions':
        return <QuestionManager user={user} />;
      case 'content':
        return <ContentManager user={user} />;
      case 'settings':
        return (
          <Card>
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Paramètres Système</h3>
              <p className="text-gray-600">Configuration avancée à venir</p>
            </div>
          </Card>
        );
      default:
        return <AdminStats user={user} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête Admin */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Tableau de Bord Administrateur
              </h1>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <Trophy className="w-4 h-4 mr-1" />
                  {user.is_supreme_admin ? 'Suprême Admin' : 'Admin'}
                </span>
                <span className="text-sm text-gray-600">
                  {user.first_name} {user.last_name}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Niveau d'accès</p>
              <p className="text-lg font-semibold text-gray-900">
                {user.is_supreme_admin ? 'Contrôle Total' : 'Gestion Contenu'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation Admin */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {adminSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <Card 
                key={section.id}
                className={`cursor-pointer transition-all duration-200 ${
                  isActive 
                    ? 'ring-2 ring-blue-500 shadow-lg' 
                    : 'hover:shadow-xl hover:scale-105'
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <div className="text-center">
                  <div className={`w-12 h-12 ${section.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">{section.title}</h3>
                  <p className="text-xs text-gray-600">{section.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Contenu de la section active */}
      <div className="mb-8">
        {renderActiveSection()}
      </div>
    </div>
  );
};