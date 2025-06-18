import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  FileText,
  RefreshCw,
  Edit2,
  Trash2,
  Save,
  X,
  Flag,
  CheckCircle,
  Search,
  Filter,
  Plus,
  MessageSquare
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ContentItem {
  id: string
  title: string
  type: 'question' | 'comment' | 'feedback'
  content: string
  status: 'pending' | 'approved' | 'rejected'
  reported_by?: string
  created_at: string
  user_id?: string
  username?: string
}

export default function ContentModeration() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<ContentItem>>({})

  // Mock content for demonstration
  const mockContent: ContentItem[] = [
    {
      id: '1',
      title: 'Question sur l\'assurance vie',
      type: 'question',
      content: 'Pourquoi l\'assurance vie est-elle importante pour la planification successorale?',
      status: 'pending',
      created_at: new Date().toISOString(),
      user_id: '123',
      username: 'jean.dupont'
    },
    {
      id: '2',
      title: 'Commentaire inapproprié',
      type: 'comment',
      content: 'Ce cours est vraiment nul, je ne recommande pas du tout.',
      status: 'pending',
      reported_by: 'moderator',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      user_id: '456',
      username: 'marie.martin'
    },
    {
      id: '3',
      title: 'Feedback sur le chapitre 3',
      type: 'feedback',
      content: 'Le chapitre 3 est très bien expliqué, merci beaucoup!',
      status: 'approved',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      user_id: '789',
      username: 'pierre.durand'
    },
    {
      id: '4',
      title: 'Question sur les fonds distincts',
      type: 'question',
      content: 'Quelle est la différence entre un fonds distinct et un fonds commun de placement?',
      status: 'approved',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      user_id: '101',
      username: 'sophie.leroy'
    },
    {
      id: '5',
      title: 'Commentaire signalé',
      type: 'comment',
      content: 'Ce contenu contient des informations incorrectes sur la fiscalité.',
      status: 'rejected',
      reported_by: 'user',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      user_id: '202',
      username: 'thomas.bernard'
    }
  ]

  const fetchContent = async () => {
    setLoading(true)
    
    // In a real application, you would fetch content from your database
    // For this demo, we'll use mock data
    setTimeout(() => {
      setContent(mockContent)
      applyFilters(mockContent, searchTerm, filterStatus, filterType)
      setLoading(false)
    }, 500)
  }

  useEffect(() => {
    fetchContent()
  }, [])

  const applyFilters = (contentList: ContentItem[], search: string, status: string, type: string) => {
    let filtered = [...contentList]
    
    // Apply search filter
    if (search) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.content.toLowerCase().includes(search.toLowerCase()) ||
        (item.username && item.username.toLowerCase().includes(search.toLowerCase()))
      )
    }
    
    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(item => item.status === status)
    }
    
    // Apply type filter
    if (type !== 'all') {
      filtered = filtered.filter(item => item.type === type)
    }
    
    setFilteredContent(filtered)
  }

  useEffect(() => {
    applyFilters(content, searchTerm, filterStatus, filterType)
  }, [searchTerm, filterStatus, filterType, content])

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      // In a real application, you would update the status in your database
      const updatedContent = content.map(item => 
        item.id === id ? { ...item, status } : item
      )
      
      setContent(updatedContent)
      applyFilters(updatedContent, searchTerm, filterStatus, filterType)
      
      toast.success(`Contenu ${status === 'approved' ? 'approuvé' : 'rejeté'}`)
    } catch (error) {
      console.error('Error updating content status:', error)
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  const handleSaveEdit = async (id: string) => {
    try {
      // In a real application, you would update the content in your database
      const updatedContent = content.map(item => 
        item.id === id ? { ...item, ...editForm } : item
      )
      
      setContent(updatedContent)
      applyFilters(updatedContent, searchTerm, filterStatus, filterType)
      
      setEditingItem(null)
      toast.success('Contenu mis à jour')
    } catch (error) {
      console.error('Error updating content:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) return
    
    try {
      // In a real application, you would delete the content from your database
      const updatedContent = content.filter(item => item.id !== id)
      
      setContent(updatedContent)
      applyFilters(updatedContent, searchTerm, filterStatus, filterType)
      
      toast.success('Contenu supprimé')
    } catch (error) {
      console.error('Error deleting content:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-300">En attente</span>
      case 'approved':
        return <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-300">Approuvé</span>
      case 'rejected':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-300">Rejeté</span>
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'question':
        return <MessageSquare className="w-4 h-4 text-blue-400" />
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-purple-400" />
      case 'feedback':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Rechercher du contenu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white appearance-none focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Rejeté</option>
            </select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
          </div>
          
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white appearance-none focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Tous les types</option>
              <option value="question">Questions</option>
              <option value="comment">Commentaires</option>
              <option value="feedback">Feedback</option>
            </select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
          </div>
          
          <button
            onClick={fetchContent}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 rounded-lg text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-zinc-400">
            <RefreshCw className="w-6 h-6 animate-spin inline mr-2" />
            Chargement du contenu...
          </div>
        ) : filteredContent.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">
            Aucun contenu trouvé
          </div>
        ) : (
          filteredContent.map((item) => (
            <div
              key={item.id}
              className={`p-6 bg-zinc-800 rounded-xl border ${
                item.status === 'pending'
                  ? 'border-yellow-500/30'
                  : item.status === 'approved'
                  ? 'border-emerald-500/30'
                  : 'border-red-500/30'
              }`}
            >
              {editingItem === item.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full p-2 bg-zinc-900 border border-zinc-600 rounded text-white"
                    placeholder="Titre"
                  />
                  
                  <textarea
                    value={editForm.content || ''}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    className="w-full p-2 bg-zinc-900 border border-zinc-600 rounded text-white h-24"
                    placeholder="Contenu"
                  />
                  
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="flex items-center gap-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-white"
                    >
                      <Save className="w-4 h-4" />
                      Sauvegarder
                    </button>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="flex items-center gap-2 px-3 py-1 bg-zinc-600 hover:bg-zinc-700 rounded text-white"
                    >
                      <X className="w-4 h-4" />
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(item.type)}
                        <h3 className="text-lg font-medium text-white">
                          {item.title}
                        </h3>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-sm text-zinc-400">
                        Par {item.username} • {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'approved')}
                            className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded"
                            title="Approuver"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'rejected')}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded"
                            title="Rejeter"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setEditingItem(item.id)
                          setEditForm({
                            title: item.title,
                            content: item.content
                          })
                        }}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-700 mb-4">
                    <p className="text-zinc-300">{item.content}</p>
                  </div>
                  
                  {item.reported_by && (
                    <div className="flex items-center gap-2 text-sm text-yellow-400">
                      <Flag className="w-4 h-4" />
                      Signalé par {item.reported_by}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}