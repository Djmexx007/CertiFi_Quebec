import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { useUserProfile } from '@/hooks/useUserProfile'
import {
  FileText,
  Loader2,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ArrowLeft,
  Flag,
  CheckCircle,
  Filter,
  MessageSquare
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Question {
  id: string
  question: string
  choices: string[]
  correct_answer: number
  explanation: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
}

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

export default function AdminContent() {
  const { isAdmin } = useUserProfile()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<Question[]>([])
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Question>>({})
  const [activeTab, setActiveTab] = useState('questions')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    question: '',
    choices: ['', '', '', ''],
    correct_answer: 0,
    explanation: '',
    category: 'vie',
    difficulty: 'medium'
  })

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
    }
  ]

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuestions(data || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast.error('Erreur lors du chargement des questions')
    } finally {
      setLoading(false)
    }
  }

  const fetchContent = () => {
    // In a real app, you would fetch from your database
    setContent(mockContent)
  }

  useEffect(() => {
    if (!isAdmin) {
      navigate('/')
      return
    }
    
    if (activeTab === 'questions') {
      fetchQuestions()
    } else {
      fetchContent()
    }
  }, [isAdmin, activeTab])

  const handleSave = async (id: string) => {
    try {
      const { error } = await supabase
        .from('questions')
        .update(editForm)
        .eq('id', id)

      if (error) throw error

      toast.success('Question mise à jour')
      setEditing(null)
      fetchQuestions()
    } catch (error) {
      console.error('Error updating question:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) return

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Question supprimée')
      fetchQuestions()
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleAddQuestion = async () => {
    try {
      if (!newQuestion.question || !newQuestion.explanation || 
          !newQuestion.choices || newQuestion.choices.some(c => !c)) {
        return toast.error('Tous les champs sont obligatoires')
      }

      const { error } = await supabase
        .from('questions')
        .insert({
          question: newQuestion.question,
          choices: newQuestion.choices,
          correct_answer: newQuestion.correct_answer,
          explanation: newQuestion.explanation,
          category: newQuestion.category,
          difficulty: newQuestion.difficulty
        })

      if (error) throw error

      toast.success('Question ajoutée')
      setShowAddForm(false)
      setNewQuestion({
        question: '',
        choices: ['', '', '', ''],
        correct_answer: 0,
        explanation: '',
        category: 'vie',
        difficulty: 'medium'
      })
      fetchQuestions()
    } catch (error) {
      console.error('Error adding question:', error)
      toast.error('Erreur lors de l\'ajout')
    }
  }

  const handleUpdateContentStatus = (id: string, status: 'approved' | 'rejected') => {
    const updatedContent = content.map(item => 
      item.id === id ? { ...item, status } : item
    )
    setContent(updatedContent)
    toast.success(`Contenu ${status === 'approved' ? 'approuvé' : 'rejeté'}`)
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

  const filteredContent = content.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false
    if (filterType !== 'all' && item.type !== filterType) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-400 flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Gestion du Contenu
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Accueil
            </button>
            <button
              onClick={() => activeTab === 'questions' ? fetchQuestions() : fetchContent()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Rafraîchir
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
            >
              <Plus className="w-4 h-4" />
              {activeTab === 'questions' ? 'Nouvelle Question' : 'Nouveau Contenu'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-700 mb-6">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'questions'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            Questions
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'moderation'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            Modération
          </button>
        </div>

        {activeTab === 'questions' ? (
          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question.id}
                className="p-6 bg-zinc-800 rounded-xl border border-zinc-700"
              >
                {editing === question.id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editForm.question || ''}
                      onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                      className="w-full p-2 bg-zinc-900 border border-zinc-600 rounded text-white"
                      placeholder="Question"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleSave(question.id)}
                        className="flex items-center gap-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-white"
                      >
                        <Save className="w-4 h-4" />
                        Sauvegarder
                      </button>
                      <button
                        onClick={() => setEditing(null)}
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
                      <h3 className="text-lg font-medium text-white">
                        {question.question}
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditing(question.id)
                            setEditForm(question)
                          }}
                          className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(question.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {question.choices.map((choice, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded ${
                            index === question.correct_answer
                              ? 'bg-emerald-500/20 border border-emerald-500/50'
                              : 'bg-zinc-900/50 border border-zinc-700'
                          }`}
                        >
                          {choice}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-zinc-400">
                      <p>
                        <span className="font-medium text-zinc-300">Explication:</span>{' '}
                        {question.explanation}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <span className="px-2 py-1 bg-zinc-900 rounded text-xs">
                          {question.category}
                        </span>
                        <span className="px-2 py-1 bg-zinc-900 rounded text-xs">
                          {question.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Contenu à modérer</h2>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded text-white"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="approved">Approuvé</option>
                  <option value="rejected">Rejeté</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded text-white"
                >
                  <option value="all">Tous les types</option>
                  <option value="question">Questions</option>
                  <option value="comment">Commentaires</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredContent.map((item) => (
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
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-blue-400" />
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
                            onClick={() => handleUpdateContentStatus(item.id, 'approved')}
                            className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded"
                            title="Approuver"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateContentStatus(item.id, 'rejected')}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded"
                            title="Rejeter"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          // Edit content
                        }}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          // Delete content
                          const updatedContent = content.filter(c => c.id !== item.id)
                          setContent(updatedContent)
                          toast.success('Contenu supprimé')
                        }}
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
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Question Modal */}
      {showAddForm && activeTab === 'questions' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl border border-zinc-700 w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b border-zinc-700">
              <h3 className="text-xl font-bold text-white">Ajouter une question</h3>
              <button onClick={() => setShowAddForm(false)} className="text-zinc-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Question</label>
                <input
                  type="text"
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Choix</label>
                {newQuestion.choices?.map((choice, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={choice}
                      onChange={(e) => {
                        const newChoices = [...(newQuestion.choices || [])]
                        newChoices[index] = e.target.value
                        setNewQuestion({...newQuestion, choices: newChoices})
                      }}
                      className="flex-1 p-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                      placeholder={`Choix ${index + 1}`}
                    />
                    <button
                      onClick={() => setNewQuestion({...newQuestion, correct_answer: index})}
                      className={`px-3 py-1 rounded ${
                        newQuestion.correct_answer === index
                          ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300'
                          : 'bg-zinc-700 border border-zinc-600 text-zinc-300'
                      }`}
                    >
                      Correct
                    </button>
                  </div>
                ))}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Explication</label>
                <textarea
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white h-24"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Catégorie</label>
                  <select
                    value={newQuestion.category}
                    onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                  >
                    <option value="vie">Assurance Vie</option>
                    <option value="maladie">Assurance Maladie</option>
                    <option value="fonds">Fonds Distincts</option>
                    <option value="deonto">Déontologie</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Difficulté</label>
                  <select
                    value={newQuestion.difficulty}
                    onChange={(e) => setNewQuestion({...newQuestion, difficulty: e.target.value as any})}
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                  >
                    <option value="easy">Facile</option>
                    <option value="medium">Moyen</option>
                    <option value="hard">Difficile</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleAddQuestion}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-white"
              >
                Ajouter la question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}