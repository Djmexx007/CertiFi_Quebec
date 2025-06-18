import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  FileText,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Clock,
  Filter,
  Download,
  Search
} from 'lucide-react'

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  source: string
  user_id?: string
  details?: any
}

export default function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState<string>('all')

  // Mock logs for demonstration
  const mockLogs: LogEntry[] = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Utilisateur connecté',
      source: 'auth',
      user_id: '123',
      details: { ip: '192.168.1.1', browser: 'Chrome' }
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      level: 'warning',
      message: 'Tentative de connexion échouée',
      source: 'auth',
      details: { reason: 'Mot de passe incorrect', attempts: 3 }
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      level: 'error',
      message: 'Erreur de base de données',
      source: 'database',
      details: { error: 'Connection timeout', query: 'SELECT * FROM users' }
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      level: 'success',
      message: 'Sauvegarde complétée',
      source: 'system',
      details: { size: '1.2GB', duration: '45s' }
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      level: 'info',
      message: 'Mise à jour système',
      source: 'system',
      details: { version: '1.2.3', changes: ['Bug fixes', 'Performance improvements'] }
    }
  ]

  const fetchLogs = async () => {
    setLoading(true)
    
    // In a real application, you would fetch logs from your database
    // For this demo, we'll use mock data
    setTimeout(() => {
      setLogs(mockLogs)
      applyFilters(mockLogs, searchTerm, filterLevel)
      setLoading(false)
    }, 500)
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const applyFilters = (logList: LogEntry[], search: string, level: string) => {
    let filtered = [...logList]
    
    // Apply search filter
    if (search) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(search.toLowerCase()) ||
        log.source.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // Apply level filter
    if (level !== 'all') {
      filtered = filtered.filter(log => log.level === level)
    }
    
    setFilteredLogs(filtered)
  }

  useEffect(() => {
    applyFilters(logs, searchTerm, filterLevel)
  }, [searchTerm, filterLevel, logs])

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Info className="w-4 h-4 text-blue-400" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />
      default:
        return <Info className="w-4 h-4 text-blue-400" />
    }
  }

  const getLevelClass = (level: string) => {
    switch (level) {
      case 'info':
        return 'bg-blue-500/20 text-blue-300'
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-300'
      case 'error':
        return 'bg-red-500/20 text-red-300'
      case 'success':
        return 'bg-emerald-500/20 text-emerald-300'
      default:
        return 'bg-blue-500/20 text-blue-300'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const downloadLogs = () => {
    // Create CSV
    const headers = ['timestamp', 'level', 'message', 'source', 'details']
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        log.timestamp,
        log.level,
        `"${log.message.replace(/"/g, '""')}"`,
        log.source,
        `"${JSON.stringify(log.details).replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n')
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'system_logs.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Rechercher dans les logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white appearance-none focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Tous les niveaux</option>
              <option value="info">Info</option>
              <option value="warning">Avertissement</option>
              <option value="error">Erreur</option>
              <option value="success">Succès</option>
            </select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
          </div>
          
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 rounded-lg text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={downloadLogs}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      <div className="bg-zinc-800 rounded-xl border border-zinc-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-900/50">
              <tr>
                <th className="p-4 font-medium text-zinc-400">Horodatage</th>
                <th className="p-4 font-medium text-zinc-400">Niveau</th>
                <th className="p-4 font-medium text-zinc-400">Message</th>
                <th className="p-4 font-medium text-zinc-400">Source</th>
                <th className="p-4 font-medium text-zinc-400">Détails</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-zinc-400">
                    <RefreshCw className="w-5 h-5 animate-spin inline mr-2" />
                    Chargement des logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-zinc-400">
                    Aucun log trouvé
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-t border-zinc-700 hover:bg-zinc-700/40">
                    <td className="p-4 text-zinc-300 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-zinc-500" />
                        {formatDate(log.timestamp)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${getLevelClass(log.level)}`}>
                        {getLevelIcon(log.level)}
                        {log.level.charAt(0).toUpperCase() + log.level.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-white">{log.message}</td>
                    <td className="p-4 text-zinc-400">{log.source}</td>
                    <td className="p-4">
                      <button
                        onClick={() => alert(JSON.stringify(log.details, null, 2))}
                        className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded text-zinc-300"
                      >
                        Voir détails
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}