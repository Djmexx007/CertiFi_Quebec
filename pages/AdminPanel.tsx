import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '@/hooks/useUserProfile'
import {
  ShieldCheck,
  Users,
  BarChart2,
  FileText,
  Settings,
  Database,
  Bell,
  Home,
  Menu,
  X,
  LogOut
} from 'lucide-react'
import UserManagement from '@/components/AdminComponents/UserManagement'
import SystemLogs from '@/components/AdminComponents/SystemLogs'
import ContentModeration from '@/components/AdminComponents/ContentModeration'
import SystemSettings from '@/components/AdminComponents/SystemSettings'

export default function AdminPanel() {
  const { isAdmin, signOut, profile } = useUserProfile()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!isAdmin) {
    navigate('/')
    return null
  }

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: BarChart2,
      color: 'text-emerald-400'
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: Users,
      color: 'text-blue-400'
    },
    {
      id: 'content',
      label: 'Modération',
      icon: FileText,
      color: 'text-purple-400'
    },
    {
      id: 'logs',
      label: 'Logs système',
      icon: Database,
      color: 'text-yellow-400'
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      color: 'text-red-400'
    }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Tableau de bord</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
                <h3 className="text-lg font-semibold text-white mb-4">Activité récente</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-zinc-900 rounded-lg">
                    <p className="text-zinc-300">Nouvel utilisateur inscrit</p>
                    <p className="text-xs text-zinc-500">Il y a 5 minutes</p>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-lg">
                    <p className="text-zinc-300">Chapitre complété par user123</p>
                    <p className="text-xs text-zinc-500">Il y a 15 minutes</p>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-lg">
                    <p className="text-zinc-300">Nouveau commentaire signalé</p>
                    <p className="text-xs text-zinc-500">Il y a 1 heure</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
                <h3 className="text-lg font-semibold text-white mb-4">Statistiques</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Utilisateurs</span>
                    <span className="text-emerald-400 font-medium">125</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Chapitres complétés</span>
                    <span className="text-emerald-400 font-medium">432</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">XP total</span>
                    <span className="text-emerald-400 font-medium">15,420</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Taux de complétion</span>
                    <span className="text-emerald-400 font-medium">68%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
                <h3 className="text-lg font-semibold text-white mb-4">Alertes</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-300">3 tentatives de connexion échouées</p>
                    <p className="text-xs text-red-400/70">Il y a 10 minutes</p>
                  </div>
                  <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-300">Espace disque faible (15% restant)</p>
                    <p className="text-xs text-yellow-400/70">Vérifier l'espace</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'users':
        return <UserManagement />
      case 'content':
        return <ContentModeration />
      case 'logs':
        return <SystemLogs />
      case 'settings':
        return <SystemSettings />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-zinc-800 rounded-lg border border-zinc-700"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Menu className="w-6 h-6 text-white" />
          )}
        </button>
      </div>
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-zinc-800 border-r border-zinc-700 transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          </div>
          
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setMobileMenuOpen(false)
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                  ${activeTab === item.id
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-400 hover:bg-zinc-700/50 hover:text-white'
                  }
                `}
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-zinc-700">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username}`}
              alt=""
              className="w-10 h-10 rounded-full border border-emerald-500"
            />
            <div>
              <p className="font-medium text-white">{profile?.username}</p>
              <p className="text-xs text-emerald-400">Administrateur</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded text-white text-sm"
            >
              <Home className="w-4 h-4" />
              Accueil
            </button>
            <button
              onClick={signOut}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded text-red-400 text-sm"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="lg:ml-64 p-6">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}