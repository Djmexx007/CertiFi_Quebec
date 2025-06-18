import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  Settings,
  Save,
  RefreshCw,
  Database,
  Server,
  Mail,
  Shield,
  Bell,
  Clock,
  Download,
  Upload,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SystemSetting {
  id: string
  key: string
  value: string
  description: string
  category: string
}

export default function SystemSettings() {
  const [loading, setLoading] = useState(false)
  const [backupLoading, setBackupLoading] = useState(false)
  const [restoreLoading, setRestoreLoading] = useState(false)
  
  // Mock settings for demonstration
  const [settings, setSettings] = useState<SystemSetting[]>([
    {
      id: '1',
      key: 'site_name',
      value: 'PQAP Study',
      description: 'Nom du site affiché dans le navigateur et les emails',
      category: 'general'
    },
    {
      id: '2',
      key: 'maintenance_mode',
      value: 'false',
      description: 'Activer le mode maintenance (true/false)',
      category: 'system'
    },
    {
      id: '3',
      key: 'smtp_host',
      value: 'smtp.example.com',
      description: 'Serveur SMTP pour l\'envoi d\'emails',
      category: 'email'
    },
    {
      id: '4',
      key: 'smtp_port',
      value: '587',
      description: 'Port SMTP',
      category: 'email'
    },
    {
      id: '5',
      key: 'smtp_user',
      value: 'user@example.com',
      description: 'Utilisateur SMTP',
      category: 'email'
    },
    {
      id: '6',
      key: 'smtp_password',
      value: '********',
      description: 'Mot de passe SMTP (masqué)',
      category: 'email'
    },
    {
      id: '7',
      key: 'max_login_attempts',
      value: '5',
      description: 'Nombre maximum de tentatives de connexion avant blocage',
      category: 'security'
    },
    {
      id: '8',
      key: 'session_timeout',
      value: '60',
      description: 'Délai d\'expiration de session en minutes',
      category: 'security'
    },
    {
      id: '9',
      key: 'backup_frequency',
      value: 'daily',
      description: 'Fréquence des sauvegardes automatiques (daily, weekly, monthly)',
      category: 'backup'
    },
    {
      id: '10',
      key: 'backup_retention',
      value: '30',
      description: 'Nombre de jours de conservation des sauvegardes',
      category: 'backup'
    }
  ])

  const handleSettingChange = (id: string, value: string) => {
    setSettings(settings.map(setting => 
      setting.id === id ? { ...setting, value } : setting
    ))
  }

  const saveSettings = async () => {
    setLoading(true)
    
    try {
      // In a real application, you would save settings to your database
      setTimeout(() => {
        toast.success('Paramètres enregistrés')
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Erreur lors de l\'enregistrement des paramètres')
      setLoading(false)
    }
  }

  const createBackup = async () => {
    setBackupLoading(true)
    
    try {
      // In a real application, you would create a backup of your database
      setTimeout(() => {
        toast.success('Sauvegarde créée avec succès')
        setBackupLoading(false)
      }, 2000)
    } catch (error) {
      console.error('Error creating backup:', error)
      toast.error('Erreur lors de la création de la sauvegarde')
      setBackupLoading(false)
    }
  }

  const restoreBackup = async () => {
    if (!confirm('Êtes-vous sûr de vouloir restaurer la dernière sauvegarde ? Toutes les données actuelles seront remplacées.')) return
    
    setRestoreLoading(true)
    
    try {
      // In a real application, you would restore a backup of your database
      setTimeout(() => {
        toast.success('Sauvegarde restaurée avec succès')
        setRestoreLoading(false)
      }, 3000)
    } catch (error) {
      console.error('Error restoring backup:', error)
      toast.error('Erreur lors de la restauration de la sauvegarde')
      setRestoreLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general':
        return <Settings className="w-5 h-5 text-blue-400" />
      case 'system':
        return <Server className="w-5 h-5 text-purple-400" />
      case 'email':
        return <Mail className="w-5 h-5 text-red-400" />
      case 'security':
        return <Shield className="w-5 h-5 text-yellow-400" />
      case 'backup':
        return <Database className="w-5 h-5 text-emerald-400" />
      default:
        return <Settings className="w-5 h-5 text-blue-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Paramètres Système</h2>
        <button
          onClick={saveSettings}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Enregistrer les modifications
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Paramètres généraux */}
        <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-blue-400" />
            Paramètres généraux
          </h3>
          
          <div className="space-y-4">
            {settings
              .filter(setting => setting.category === 'general')
              .map(setting => (
                <div key={setting.id} className="space-y-1">
                  <label className="block text-sm font-medium text-zinc-400">
                    {setting.key}
                  </label>
                  <input
                    type="text"
                    value={setting.value}
                    onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                    className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-white"
                  />
                  <p className="text-xs text-zinc-500">{setting.description}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Paramètres système */}
        <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-purple-400" />
            Paramètres système
          </h3>
          
          <div className="space-y-4">
            {settings
              .filter(setting => setting.category === 'system')
              .map(setting => (
                <div key={setting.id} className="space-y-1">
                  <label className="block text-sm font-medium text-zinc-400">
                    {setting.key}
                  </label>
                  <select
                    value={setting.value}
                    onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                    className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-white"
                  >
                    <option value="true">Activé</option>
                    <option value="false">Désactivé</option>
                  </select>
                  <p className="text-xs text-zinc-500">{setting.description}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Paramètres email */}
        <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-red-400" />
            Configuration email
          </h3>
          
          <div className="space-y-4">
            {settings
              .filter(setting => setting.category === 'email')
              .map(setting => (
                <div key={setting.id} className="space-y-1">
                  <label className="block text-sm font-medium text-zinc-400">
                    {setting.key}
                  </label>
                  <input
                    type={setting.key.includes('password') ? 'password' : 'text'}
                    value={setting.value}
                    onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                    className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-white"
                  />
                  <p className="text-xs text-zinc-500">{setting.description}</p>
                </div>
              ))}
              
            <button
              onClick={() => toast.success('Email de test envoyé')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
            >
              Envoyer un email de test
            </button>
          </div>
        </div>

        {/* Paramètres de sécurité */}
        <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-yellow-400" />
            Sécurité
          </h3>
          
          <div className="space-y-4">
            {settings
              .filter(setting => setting.category === 'security')
              .map(setting => (
                <div key={setting.id} className="space-y-1">
                  <label className="block text-sm font-medium text-zinc-400">
                    {setting.key}
                  </label>
                  <input
                    type="number"
                    value={setting.value}
                    onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                    className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-white"
                  />
                  <p className="text-xs text-zinc-500">{setting.description}</p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Sauvegarde et restauration */}
      <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-emerald-400" />
          Sauvegarde et restauration
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings
              .filter(setting => setting.category === 'backup')
              .map(setting => (
                <div key={setting.id} className="space-y-1">
                  <label className="block text-sm font-medium text-zinc-400">
                    {setting.key}
                  </label>
                  {setting.key === 'backup_frequency' ? (
                    <select
                      value={setting.value}
                      onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                      className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-white"
                    >
                      <option value="daily">Quotidienne</option>
                      <option value="weekly">Hebdomadaire</option>
                      <option value="monthly">Mensuelle</option>
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={setting.value}
                      onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                      className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-white"
                    />
                  )}
                  <p className="text-xs text-zinc-500">{setting.description}</p>
                </div>
              ))}
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <button
              onClick={createBackup}
              disabled={backupLoading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-white disabled:opacity-50"
            >
              {backupLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Créer une sauvegarde
            </button>
            
            <button
              onClick={restoreBackup}
              disabled={restoreLoading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white disabled:opacity-50"
            >
              {restoreLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Restaurer la dernière sauvegarde
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-zinc-900 rounded-lg border border-zinc-700">
            <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Dernières sauvegardes
            </h4>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-zinc-300">backup_2023-05-15_08-30.sql</span>
                </div>
                <span className="text-zinc-500">15/05/2023 08:30</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-zinc-300">backup_2023-05-14_08-30.sql</span>
                </div>
                <span className="text-zinc-500">14/05/2023 08:30</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-zinc-300">backup_2023-05-13_08-30.sql</span>
                </div>
                <span className="text-zinc-500">13/05/2023 08:30</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}