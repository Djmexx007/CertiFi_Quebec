import React, { useState } from 'react';
import { FileText, Headphones, Gamepad2, BookOpen } from 'lucide-react';
import { Card } from '../ui/Card';
import { User } from '../../lib/supabase';

interface ContentManagerProps {
  user: User;
}

type ContentType = 'podcasts' | 'exams' | 'minigames';

export const ContentManager: React.FC<ContentManagerProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<ContentType>('podcasts');

  const contentTabs = [
    {
      id: 'podcasts' as ContentType,
      title: 'Podcasts',
      icon: Headphones,
      color: 'bg-purple-500'
    },
    {
      id: 'exams' as ContentType,
      title: 'Examens',
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      id: 'minigames' as ContentType,
      title: 'Mini-jeux',
      icon: Gamepad2,
      color: 'bg-green-500'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'podcasts':
        return (
          <Card>
            <div className="text-center py-12">
              <Headphones className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestion des Podcasts</h3>
              <p className="text-gray-600">Interface de gestion des podcasts à venir</p>
            </div>
          </Card>
        );
      case 'exams':
        return (
          <Card>
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestion des Examens</h3>
              <p className="text-gray-600">Interface de gestion des examens à venir</p>
            </div>
          </Card>
        );
      case 'minigames':
        return (
          <Card>
            <div className="text-center py-12">
              <Gamepad2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestion des Mini-jeux</h3>
              <p className="text-gray-600">Interface de gestion des mini-jeux à venir</p>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestion du Contenu</h2>
          <p className="text-sm text-gray-600">Gérer les podcasts, examens et mini-jeux</p>
        </div>
      </Card>

      {/* Onglets */}
      <div className="flex space-x-4">
        {contentTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.title}</span>
            </button>
          );
        })}
      </div>

      {/* Contenu de l'onglet actif */}
      {renderContent()}
    </div>
  );
};