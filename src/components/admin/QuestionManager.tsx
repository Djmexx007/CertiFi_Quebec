import React, { useState, useEffect } from 'react';
import { Plus, Edit, Eye, EyeOff, Search, Filter } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SupabaseAPI, User, Question } from '../../lib/supabase';

interface QuestionManagerProps {
  user: User;
}

export const QuestionManager: React.FC<QuestionManagerProps> = ({ user }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPermission, setSelectedPermission] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    loadQuestions();
  }, [currentPage, searchTerm, selectedPermission, selectedType, showInactive]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await SupabaseAPI.getContent({
        type: 'questions',
        page: currentPage,
        limit: 20
      });

      if (response && !response.error) {
        let filteredQuestions = response.content || [];
        
        // Filtrer côté client (en attendant l'implémentation côté serveur)
        if (searchTerm) {
          filteredQuestions = filteredQuestions.filter((q: Question) =>
            q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.source_document_ref.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        if (selectedPermission) {
          filteredQuestions = filteredQuestions.filter((q: Question) =>
            q.required_permission === selectedPermission
          );
        }
        
        if (selectedType) {
          filteredQuestions = filteredQuestions.filter((q: Question) =>
            q.question_type === selectedType
          );
        }
        
        if (!showInactive) {
          filteredQuestions = filteredQuestions.filter((q: Question) => q.is_active);
        }

        setQuestions(filteredQuestions);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (questionId: string, currentStatus: boolean) => {
    try {
      // Simuler l'appel API pour toggle active
      const response = await SupabaseAPI.updateContent('question', questionId, {
        is_active: !currentStatus
      });
      
      if (response && !response.error) {
        await loadQuestions();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    const types = {
      'MCQ': 'Choix Multiple',
      'TRUE_FALSE': 'Vrai/Faux',
      'SHORT_ANSWER': 'Réponse Courte'
    };
    return types[type as keyof typeof types] || type;
  };

  const getPermissionLabel = (permission: string) => {
    const permissions = {
      'pqap': 'PQAP',
      'fonds_mutuels': 'Fonds Mutuels'
    };
    return permissions[permission as keyof typeof permissions] || permission;
  };

  const getDifficultyColor = (level: number) => {
    if (level <= 2) return 'bg-green-100 text-green-800';
    if (level <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getDifficultyLabel = (level: number) => {
    if (level <= 2) return 'Facile';
    if (level <= 3) return 'Moyen';
    return 'Difficile';
  };

  return (
    <div className="space-y-6">
      {/* En-tête et filtres */}
      <Card>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gestion des Questions</h2>
              <p className="text-sm text-gray-600">Créer et modifier les questions d'examen</p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              icon={Plus}
              className="md:w-auto"
            >
              Nouvelle Question
            </Button>
          </div>
          
          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={selectedPermission}
              onChange={(e) => setSelectedPermission(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les permissions</option>
              <option value="pqap">PQAP</option>
              <option value="fonds_mutuels">Fonds Mutuels</option>
            </select>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les types</option>
              <option value="MCQ">Choix Multiple</option>
              <option value="TRUE_FALSE">Vrai/Faux</option>
              <option value="SHORT_ANSWER">Réponse Courte</option>
            </select>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Inclure inactives</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Liste des questions */}
      <Card>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des questions...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question.id}
                className={`border rounded-lg p-4 ${
                  question.is_active ? 'border-gray-200' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty_level)}`}>
                        {getDifficultyLabel(question.difficulty_level)}
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {getQuestionTypeLabel(question.question_type)}
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {getPermissionLabel(question.required_permission)}
                      </span>
                      {!question.is_active && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      {question.question_text}
                    </h3>
                    
                    {question.question_type === 'MCQ' && question.options_json && (
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {Object.entries(question.options_json).map(([key, value]) => (
                          <div
                            key={key}
                            className={`text-xs p-2 rounded ${
                              key === question.correct_answer_key
                                ? 'bg-green-100 text-green-800 font-medium'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {key}: {value}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Source: {question.source_document_ref}
                      {question.chapter_reference && ` • ${question.chapter_reference}`}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingQuestion(question)}
                      icon={Edit}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(question.id, question.is_active)}
                      icon={question.is_active ? EyeOff : Eye}
                    >
                      {question.is_active ? 'Désactiver' : 'Activer'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {questions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucune question trouvée</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 mt-6">
            <div className="text-sm text-gray-700">
              Page {currentPage} sur {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Formulaires de création/modification */}
      {(showCreateForm || editingQuestion) && (
        <QuestionForm
          question={editingQuestion}
          onClose={() => {
            setShowCreateForm(false);
            setEditingQuestion(null);
          }}
          onSave={() => {
            loadQuestions();
            setShowCreateForm(false);
            setEditingQuestion(null);
          }}
        />
      )}
    </div>
  );
};

// Composant formulaire pour créer/modifier une question
interface QuestionFormProps {
  question?: Question | null;
  onClose: () => void;
  onSave: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ question, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    question_text: question?.question_text || '',
    question_type: question?.question_type || 'MCQ',
    options_json: question?.options_json || { A: '', B: '', C: '', D: '' },
    correct_answer_key: question?.correct_answer_key || 'A',
    explanation: question?.explanation || '',
    difficulty_level: question?.difficulty_level || 1,
    required_permission: question?.required_permission || 'pqap',
    source_document_ref: question?.source_document_ref || '',
    chapter_reference: question?.chapter_reference || '',
    is_active: question?.is_active ?? true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (question) {
        // Modification
        await SupabaseAPI.updateContent('question', question.id, formData);
      } else {
        // Création
        await SupabaseAPI.createContent('question', formData);
      }
      onSave();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la question');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {question ? 'Modifier la Question' : 'Nouvelle Question'}
            </h3>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>

          <Input
            label="Texte de la question"
            value={formData.question_text}
            onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de question
              </label>
              <select
                value={formData.question_type}
                onChange={(e) => setFormData(prev => ({ ...prev, question_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="MCQ">Choix Multiple</option>
                <option value="TRUE_FALSE">Vrai/Faux</option>
                <option value="SHORT_ANSWER">Réponse Courte</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permission requise
              </label>
              <select
                value={formData.required_permission}
                onChange={(e) => setFormData(prev => ({ ...prev, required_permission: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pqap">PQAP</option>
                <option value="fonds_mutuels">Fonds Mutuels</option>
              </select>
            </div>
          </div>

          {formData.question_type === 'MCQ' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options de réponse
              </label>
              <div className="space-y-2">
                {Object.entries(formData.options_json).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <span className="w-8 text-sm font-medium text-gray-700">{key}:</span>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        options_json: { ...prev.options_json, [key]: e.target.value }
                      }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Option ${key}`}
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bonne réponse
                </label>
                <select
                  value={formData.correct_answer_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, correct_answer_key: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.keys(formData.options_json).map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <Input
            label="Explication"
            value={formData.explanation}
            onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Référence document source"
              value={formData.source_document_ref}
              onChange={(e) => setFormData(prev => ({ ...prev, source_document_ref: e.target.value }))}
              placeholder="F311-Ch1"
              required
            />

            <Input
              label="Référence chapitre"
              value={formData.chapter_reference}
              onChange={(e) => setFormData(prev => ({ ...prev, chapter_reference: e.target.value }))}
              placeholder="Chapitre 1 - Concepts de base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Niveau de difficulté
            </label>
            <select
              value={formData.difficulty_level}
              onChange={(e) => setFormData(prev => ({ ...prev, difficulty_level: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={1}>1 - Très facile</option>
              <option value={2}>2 - Facile</option>
              <option value={3}>3 - Moyen</option>
              <option value={4}>4 - Difficile</option>
              <option value={5}>5 - Très difficile</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              Question active
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {question ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};