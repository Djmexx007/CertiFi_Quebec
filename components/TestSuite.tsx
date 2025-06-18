import React, { useState } from 'react';
import {
  Brain, Bug, CheckCircle, XCircle, AlertTriangle, Wrench, ChevronDown, ChevronUp, RefreshCw, Wand2
} from 'lucide-react';
import { useGame } from '../components/GameState';
import { BugReport } from '../components/BugReport';
import { files as filesMap } from '../lib/__filesMap';
import { analyzeCodeFiles } from '../lib/analyzeCodeFiles';
import { analyzeLogic } from '../lib/analyzeLogic';
import { analyzeWithTSMorph } from '../lib/astAnalyzer';
import { findUnusedFiles } from '../lib/findUnusedFiles';
import { autofixAll } from '../lib/autofixer'; // 👈 Ajout ici

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  correction?: string;
  timestamp: number;
}

const TestSuite: React.FC = () => {
  const { state } = useGame();
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showBugReport, setShowBugReport] = useState(false);
  const [expandedResults, setExpandedResults] = useState<number[]>([]);
  const [files, setFiles] = useState<Record<string, string>>({});

  const toggleExpand = (index: number) => {
    setExpandedResults(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const simulateAnalysis = async (name: string, type: 'success' | 'error' | 'warning', message: string, correction?: string) => {
    const newResult: TestResult = {
      name, status: type, message, correction, timestamp: Date.now()
    };
    setResults(prev => [...prev, newResult]);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);
    setExpandedResults([]);

    const filesToCheck = Object.keys(filesMap);
    const fileMap: Record<string, string> = {};
    let progressCounter = 0;
    const totalSteps = filesToCheck.length * 3 + 1;

    for (const path of filesToCheck) {
      const content = filesMap[path] || '';
      fileMap[path] = content;
    }

    setFiles(fileMap); // Stocker les fichiers pour le bouton AutoFix

    const analysisResults = await analyzeCodeFiles(filesToCheck, async (path) => fileMap[path]);

    for (const result of analysisResults) {
      if (!result.hasDefaultExport) {
        await simulateAnalysis(
          `Composant manquant : ${result.file}`, 'error',
          `Le fichier n'a pas de default export.`,
          `Ajoutez 'export default MonComposant;' à la fin de ${result.file}`
        );
      }
      for (const err of result.errors) {
        await simulateAnalysis(
          `Erreur dans ${result.file}`, 'error', err,
          `Corrigez ${result.file} selon les bonnes pratiques React.`
        );
      }

      const logicWarnings = analyzeLogic(result.file, result.content);
      for (const warn of logicWarnings) {
        await simulateAnalysis(`Logique : ${warn.file}`, 'warning', warn.warning, warn.solution);
      }

      const astWarnings = analyzeWithTSMorph(result.file, result.content);
      for (const ast of astWarnings) {
        await simulateAnalysis(`AST : ${result.file}`, 'warning', ast, 'Optimisez ce code.');
      }

      progressCounter += 3;
      setProgress((progressCounter / totalSteps) * 100);
    }

    const unused = await findUnusedFiles(fileMap);
    for (const file of unused) {
      await simulateAnalysis(`Inutilisé : ${file}`, 'warning', `Le fichier '${file}' ne semble pas utilisé.`, `Supprimez-le si inutile.`);
    }

    setProgress(100);
    setIsRunning(false);
  };

  const runAutoFix = async () => {
    const fixed = await autofixAll(files);
    const report = Object.entries(fixed).map(([file, content]) => `✅ ${file} corrigé automatiquement (${content.length} caractères)`).join('\n');
    alert('✅ AutoFix terminé ! Les fichiers ont été corrigés automatiquement.');
    console.log('🔧 Fichiers corrigés automatiquement :', fixed);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-green-400">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-black/30 rounded-xl border border-green-500/30 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-green-400" />
              <h1 className="text-2xl font-bold">Test Suite</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={runAllTests}
                disabled={isRunning}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                  isRunning ? 'bg-green-900/30 cursor-not-allowed' : 'bg-green-500/20 hover:bg-green-500/30 border border-green-500'
                }`}
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Wrench className="w-5 h-5 mr-2" />
                    Lancer les tests
                  </>
                )}
              </button>
              <button
                onClick={runAutoFix}
                className="flex items-center px-6 py-3 rounded-xl font-medium bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500 text-yellow-300 transition-all"
              >
                <Wand2 className="w-5 h-5 mr-2" />
                AutoFix
              </button>
              <button
                onClick={() => setShowBugReport(true)}
                className="flex items-center px-6 py-3 rounded-xl font-medium bg-red-500/20 hover:bg-red-500/30 border border-red-500 transition-all"
              >
                <Bug className="w-5 h-5 mr-2" />
                Signaler un bug
              </button>
            </div>
          </div>

          {isRunning && (
            <div className="mb-6">
              <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-green-400/70 mt-2">Progression des tests... {Math.round(progress)}%</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className={`bg-black/30 rounded-xl border transition-all ${
                result.status === 'success'
                  ? 'border-green-500/30'
                  : result.status === 'error'
                  ? 'border-red-500/30'
                  : 'border-yellow-500/30'
              }`}
            >
              <button onClick={() => toggleExpand(index)} className="w-full px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {result.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : result.status === 'error' ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  )}
                  <h3 className="font-medium">{result.name}</h3>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-green-400/70">{new Date(result.timestamp).toLocaleTimeString()}</span>
                  {expandedResults.includes(index) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>
              {expandedResults.includes(index) && (
                <div className="px-6 pb-4 space-y-2 border-t border-green-500/10">
                  <p className="text-green-400/90 mt-2 text-sm">{result.message}</p>
                  {result.correction && (
                    <div className="mt-2">
                      <h4 className="text-sm text-green-400/70 mb-1">Correction suggérée :</h4>
                      <pre className="text-sm bg-black/20 p-3 rounded-lg border border-green-500/10 text-green-200 whitespace-pre-wrap">
                        {result.correction}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {showBugReport && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
            <div className="bg-gray-900 rounded-xl border border-green-500/30 w-full max-w-4xl">
              <BugReport onClose={() => setShowBugReport(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestSuite;
