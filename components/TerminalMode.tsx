import React, { useState, useEffect, useRef } from 'react';
import { useGame } from './GameState';
import {
  Terminal, ArrowLeft, Star, Brain,
  Sparkles, DownloadCloud, ShieldCheck
} from 'lucide-react';
import { Exam } from './Exam';
import TestSuite from "./TestSuite";
import { HackingAnimation } from './HackingAnimation';
import { supabase } from '@/lib/supabaseClient';

interface Command {
  command: string;
  response: string;
  isError?: boolean;
  isSuccess?: boolean;
}

interface TerminalModeProps {
  onBack: () => void;
}

const COMMANDS = {
  help: `
Commandes disponibles :
  help            - Affiche ce message
  clear           - Nettoie le terminal
  stats           - Affiche ta progression
  achievements    - Liste tes titres et badges
  version         - Version système
  exam            - Lance le mode Examen
  testsuite       - Lance les tests techniques
  reset           - ⚠️ Réinitialise TOUTE la progression
  exit            - Quitter le terminal
`,

  version: 'PQAP-OS v3.7.9 — Terminal Educatif',
  status: '🧠 Système stable — Aucun bug signalé',
};

const EASTER_EGGS = {
  hack: '🎉 Accès root temporaire débloqué. +10 XP !',
  42: '🌌 La réponse à tout. +10 XP',
  matrix: '🕶️ Réveille-toi, Néo... +10 XP',
  coffee: '☕ Pause bien méritée. +10 XP',
  sudo: '🚫 Vous n\'êtes pas autorisé à exécuter cette commande (encore 😏)',
  debug: '🐛 Mode debug activé... (ou pas)',
};

export const TerminalMode: React.FC<TerminalModeProps> = ({ onBack }) => {
  const { state, addXP, resetProgress } = useGame();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Command[]>([
    {
      command: 'system',
      response: `Bienvenue sur le PQAP Terminal 💻\nTape "help" pour voir les commandes.\n`,
    },
  ]);
  const [usedEasterEggs, setUsedEasterEggs] = useState<Set<string>>(new Set());
  const [showExam, setShowExam] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [showHack, setShowHack] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = async (raw: string) => {
    const command = raw.trim().toLowerCase();
    let response = '';
    let isError = false;
    let isSuccess = false;

    if (!command) return;

    if (command === 'clear') return setHistory([]);
    if (command === 'exit') return onBack();
    if (command === 'exam') return setShowExam(true);
    if (command === 'testsuite') return setShowTest(true);
   if (command === 'hack') {
  if (!usedEasterEggs.has('hack')) {
    // Update XP in GameState
    addXP(10);
    
    // Update XP in Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('xp')
        .eq('id', user.id)
        .single();
      
      if (data) {
        const currentXP = data.xp || 0;
        await supabase
          .from('profiles')
          .update({ xp: currentXP + 10 })
          .eq('id', user.id);
      }
    }
    
    setUsedEasterEggs(prev => new Set(prev).add('hack'));
  }
  setHistory(prev => [
    ...prev,
    {
      command: raw,
      response: '🎉 Accès root temporaire débloqué. Initialisation du protocole...',
      isSuccess: true
    }
  ]);
  setTimeout(() => setShowHack(true), 800);
  return;
};

    if (command === 'reset') {
      resetProgress();
      response = '🗑️ Données réinitialisées avec succès !';
      isSuccess = true;
    }
    else if (COMMANDS[command as keyof typeof COMMANDS]) {
      response = COMMANDS[command as keyof typeof COMMANDS];
    }
    else if (EASTER_EGGS[command as keyof typeof EASTER_EGGS]) {
      if (usedEasterEggs.has(command)) {
        response = `⚠️ Tu as déjà utilisé cet easter egg. Pas d'XP cette fois 😉`;
      } else {
        response = EASTER_EGGS[command as keyof typeof EASTER_EGGS];
        isSuccess = true;
        
        // Update XP in GameState
        addXP(10);
        
        // Update XP in Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('xp')
            .eq('id', user.id)
            .single();
          
          if (data) {
            const currentXP = data.xp || 0;
            await supabase
              .from('profiles')
              .update({ xp: currentXP + 10 })
              .eq('id', user.id);
          }
        }
        
        setUsedEasterEggs(prev => new Set(prev).add(command));
      }
    }
    else if (command === 'stats') {
      response = `Niveau : ${state.playerLevel}\nXP : ${state.playerXP}\nChapitres complétés : ${state.completedChapters.length}\nBadges : ${state.badges.length}\nTitres : ${state.titles.length}`;
    }
    else if (command === 'achievements') {
      response = `🎖️ Badges :\n  ${state.badges.map(b => `- ${b}`).join('\n  ') || 'Aucun'}\n\n🏅 Titres :\n  ${state.titles.map(t => `- ${t}`).join('\n  ') || 'Aucun'}`;
    }
    else {
      response = `Commande inconnue : "${command}". Tape "help" pour la liste.`;
      isError = true;
    }

    setHistory(prev => [...prev, { command: raw, response, isError, isSuccess }]);
    setInput('');
  };

  // === Composants externes ===
  if (showExam) return <Exam onBack={() => setShowExam(false)} />;
  if (showTest) return <TestSuite />;
  if (showHack) return <HackingAnimation onComplete={() => setShowHack(false)} />;

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/30 border border-green-500/30 hover:bg-green-900/30"
      >
        <ArrowLeft className="w-4 h-4" />
        Quitter le terminal
      </button>

      <div className="p-4 bg-black rounded-xl border border-green-500/30">
        {/* En-tête terminal */}
        <div className="flex items-center gap-2 mb-4 p-2 bg-green-800/20 rounded-lg font-mono text-sm">
          <Terminal className="w-5 h-5" />
          PQAP Terminal v3.7 — Interpréteur de commandes
        </div>

        {/* Affichage des commandes */}
        <div
          ref={terminalRef}
          className="h-[60vh] overflow-y-auto font-mono text-sm space-y-2 mb-4"
        >
          {history.map((entry, i) => (
            <div key={i} className="space-y-1">
              {entry.command !== 'system' && (
                <div className="flex gap-2">
                  <span className="text-green-500">$</span>
                  <span>{entry.command}</span>
                </div>
              )}
              <pre className={`whitespace-pre-wrap ${
                entry.isError
                  ? 'text-red-400'
                  : entry.isSuccess
                  ? 'text-green-400'
                  : 'text-green-300/90'
              }`}>
                {entry.response}
              </pre>
            </div>
          ))}
        </div>

        {/* Entrée */}
        <div className="flex items-center gap-2 bg-black/50 p-2 rounded-lg border border-green-500/30">
          <span className="text-green-500">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCommand(input);
            }}
            className="flex-1 bg-transparent border-none outline-none text-green-300 font-mono"
            placeholder="Tape une commande..."
          />
        </div>
      </div>
    </div>
  );
};