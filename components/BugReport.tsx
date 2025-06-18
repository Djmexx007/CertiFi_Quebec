import React, { useState } from 'react';
import { Bug, AlertTriangle, CheckCircle, ArrowRight, Code, Wrench, ChevronDown, Copy, Share2, X } from 'lucide-react';

interface BugReportProps {
  onClose: () => void;
}

interface Bug {
  id: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  steps?: string[];
  impact?: string;
  solution?: string;
  environment?: {
    browser?: string;
    os?: string;
    version?: string;
  };
  frequency?: string;
  screenshots?: string[];
  resolvedAt?: string;
  resolution?: string;
}

// Initialize bugs array with resolved status for fixed bugs
const bugs: Bug[] = [
  {
    id: 'BUG-001',
    title: 'Sauvegarde de progression incohérente',
    description: 'La progression n\'est pas toujours sauvegardée correctement après avoir quitté un chapitre',
    severity: 'CRITICAL',
    status: 'OPEN',
    steps: [
      'Commencer un chapitre',
      'Faire des progrès dans le chapitre',
      'Quitter avant la fin',
      'Revenir dans l\'application',
      'La progression est perdue'
    ],
    impact: 'Les utilisateurs perdent leur progression, causant frustration et démotivation',
    solution: 'Implémenter un système de sauvegarde automatique plus fréquent avec validation',
    environment: {
      browser: 'Chrome 120',
      os: 'Windows 11',
      version: '1.0.0'
    },
    frequency: 'Systématique après avoir quitté un chapitre'
  },
  {
    id: 'BUG-002',
    title: 'Calcul de score incorrect dans PuzzleGame',
    description: 'Le score affiché ne correspond pas aux points réellement attribués',
    severity: 'HIGH',
    status: 'RESOLVED',
    steps: [
      'Lancer le PuzzleGame',
      'Placer correctement une pièce',
      'Le message indique +50 points mais 100 points sont ajoutés'
    ],
    impact: 'Confusion des utilisateurs sur le système de score',
    solution: 'Harmoniser le calcul du score avec les messages affichés',
    environment: {
      browser: 'Firefox 121',
      os: 'MacOS 14',
      version: '1.0.0'
    },
    frequency: 'Systématique à chaque placement de pièce',
    resolvedAt: new Date().toISOString(),
    resolution: 'Fixed score calculation to match displayed message (50 points)'
  }
];

export const BugReport: React.FC<BugReportProps> = ({ onClose }) => {
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [showPrompt, setShowPrompt] = useState(false);

  const filteredBugs = bugs.filter(bug => {
    if (filter === 'all') return true;
    if (filter === 'open') return bug.status === 'OPEN';
    if (filter === 'resolved') return bug.status === 'RESOLVED';
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-500 bg-red-500/20';
      case 'HIGH': return 'text-orange-500 bg-orange-500/20';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/20';
      case 'LOW': return 'text-green-500 bg-green-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'text-green-500 bg-green-500/20';
      case 'IN_PROGRESS': return 'text-yellow-500 bg-yellow-500/20';
      case 'OPEN': return 'text-red-500 bg-red-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const generateBugPrompt = (bug: Bug): string => {
    return `# Rapport de Bug Détaillé

## Informations Générales
- ID: ${bug.id}
- Titre: ${bug.title}
- Sévérité: ${bug.severity}
- Statut: ${bug.status}

## Description
${bug.description}

## Environnement
${bug.environment ? `- Navigateur: ${bug.environment.browser}
- Système d'exploitation: ${bug.environment.os}
- Version de l'application: ${bug.environment.version}` : ''}

## Étapes de Reproduction
${bug.steps ? bug.steps.map((step, index) => `${index + 1}. ${step}`).join('\n') : ''}

## Impact
${bug.impact || ''}

## Fréquence
${bug.frequency || ''}

## Solution Proposée
${bug.solution || ''}

${bug.status === 'RESOLVED' ? `## Résolution
- Date de résolution: ${bug.resolvedAt}
- Solution appliquée: ${bug.resolution}` : ''}

## Informations Supplémentaires
- Date de signalement: ${new Date().toISOString()}
- Reproductibilité: ${bug.frequency ? 'Confirmée' : 'À vérifier'}

---
Ce rapport a été généré automatiquement par le système de suivi des bugs PQAP Quest.`;
  };

  const copyPromptToClipboard = async (bug: Bug) => {
    const prompt = generateBugPrompt(bug);
    try {
      await navigator.clipboard.writeText(prompt);
      alert('Prompt copié dans le presse-papiers !');
    } catch (err) {
      console.error('Erreur lors de la copie :', err);
      alert('Erreur lors de la copie du prompt');
    }
  };

  return (
    <div className="p-6 space-y-6 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-green-500/20">
        <div className="flex items-center gap-3">
          <Bug className="w-6 h-6 text-red-400" />
          <h2 className="text-xl font-bold text-green-400">Rapport de Bugs</h2>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 rounded-lg bg-black/30 border border-green-500/30 text-green-400 outline-none focus:border-green-500"
          >
            <option value="all">Tous les bugs</option>
            <option value="open">Non résolus</option>
            <option value="resolved">Résolus</option>
          </select>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bug List and Details */}
      <div className="grid grid-cols-2 gap-6">
        {/* Bug List */}
        <div className="space-y-4">
          {filteredBugs.map(bug => (
            <button
              key={bug.id}
              onClick={() => setSelectedBug(bug)}
              className={`
                w-full p-4 rounded-xl text-left transition-all
                ${selectedBug?.id === bug.id 
                  ? 'bg-green-900/30 border-2 border-green-500'
                  : 'bg-black/40 border border-green-500/30 hover:border-green-500/50'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm text-green-400/70">{bug.id}</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(bug.severity)}`}>
                    {bug.severity}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bug.status)}`}>
                    {bug.status}
                  </span>
                </div>
              </div>
              <h3 className="font-bold text-green-400 mb-2">{bug.title}</h3>
              <p className="text-sm text-green-300/70">{bug.description}</p>
            </button>
          ))}
        </div>

        {/* Bug Details */}
        {selectedBug ? (
          <div className="p-6 rounded-xl bg-black/40 border border-green-500/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-green-400">{selectedBug.title}</h3>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${getSeverityColor(selectedBug.severity)}`}>
                  {selectedBug.severity}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedBug.status)}`}>
                  {selectedBug.status}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm text-green-400/70 mb-2">Description</h4>
                <p className="text-green-300">{selectedBug.description}</p>
              </div>

              {selectedBug.environment && (
                <div>
                  <h4 className="text-sm text-green-400/70 mb-2">Environnement</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-black/20 rounded">
                      <span className="text-sm text-green-400/70">Navigateur</span>
                      <p className="text-green-300">{selectedBug.environment.browser}</p>
                    </div>
                    <div className="p-2 bg-black/20 rounded">
                      <span className="text-sm text-green-400/70">OS</span>
                      <p className="text-green-300">{selectedBug.environment.os}</p>
                    </div>
                    <div className="p-2 bg-black/20 rounded">
                      <span className="text-sm text-green-400/70">Version</span>
                      <p className="text-green-300">{selectedBug.environment.version}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedBug.steps && (
                <div>
                  <h4 className="text-sm text-green-400/70 mb-2">Étapes de reproduction</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    {selectedBug.steps.map((step, index) => (
                      <li key={index} className="text-green-300">{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {selectedBug.impact && (
                <div>
                  <h4 className="text-sm text-green-400/70 mb-2">Impact</h4>
                  <p className="text-green-300">{selectedBug.impact}</p>
                </div>
              )}

              {selectedBug.frequency && (
                <div>
                  <h4 className="text-sm text-green-400/70 mb-2">Fréquence</h4>
                  <p className="text-green-300">{selectedBug.frequency}</p>
                </div>
              )}

              {selectedBug.solution && (
                <div>
                  <h4 className="text-sm text-green-400/70 mb-2">Solution proposée</h4>
                  <p className="text-green-300">{selectedBug.solution}</p>
                </div>
              )}

              {selectedBug.status === 'RESOLVED' && (
                <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                  <h4 className="text-sm text-green-400/70 mb-2">Résolution</h4>
                  <p className="text-sm text-green-300 mb-2">
                    <span className="text-green-400/70">Date :</span>{' '}
                    {new Date(selectedBug.resolvedAt!).toLocaleString()}
                  </p>
                  <p className="text-sm text-green-300">
                    <span className="text-green-400/70">Solution :</span>{' '}
                    {selectedBug.resolution}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  onClick={() => copyPromptToClipboard(selectedBug)}
                  className="px-4 py-2 rounded-lg bg-black/30 border border-green-500 text-green-400 hover:bg-green-500/20 transition-all flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copier le prompt
                </button>
                {selectedBug.status !== 'RESOLVED' && (
                  <button 
                    className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500/30 transition-all flex items-center gap-2"
                  >
                    <Code className="w-4 h-4" />
                    Corriger ce bug
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-black/40 border border-green-500/30 flex items-center justify-center text-green-300/70">
            <p>Sélectionnez un bug pour voir les détails</p>
          </div>
        )}
      </div>
    </div>
  );
};