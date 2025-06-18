import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  FileText,
  Users,
  BarChart2,
  Home,
  Sparkles,
  Settings,
  ArrowLeft
} from 'lucide-react'

const menuItems = [
  {
    icon: Home,
    label: 'Dashboard',
    path: '/admin',
    color: 'text-emerald-400'
  },
  {
    icon: Users,
    label: 'Utilisateurs',
    path: '/admin/users',
    color: 'text-blue-400'
  },
  {
    icon: FileText,
    label: 'Contenu',
    path: '/admin/content',
    color: 'text-purple-400'
  },
  {
    icon: BarChart2,
    label: 'Statistiques',
    path: '/admin/stats',
    color: 'text-yellow-400'
  },
  {
    icon: Sparkles,
    label: 'Fonctions Fun',
    path: '/admin/fun',
    color: 'text-pink-400'
  },
  {
    icon: Settings,
    label: 'Paramètres',
    path: '/settings',
    color: 'text-gray-400'
  }
]

export default function AdminMenu() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8" />
            Menu Administrateur
          </h1>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="p-6 bg-zinc-800 rounded-xl border border-zinc-700 hover:border-emerald-500/50 transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <item.icon className={`w-6 h-6 ${item.color}`} />
                <h2 className="text-lg font-semibold text-white">{item.label}</h2>
              </div>
              <p className="text-sm text-zinc-400 group-hover:text-zinc-300">
                Gérer {item.label.toLowerCase()}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}