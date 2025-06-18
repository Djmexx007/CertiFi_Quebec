import React, { useState, useEffect, useCallback } from 'react';
import {
  Terminal, ShieldCheck, AlarmClock, FolderOpenDot, FlameKindling, Lock, Bug
} from 'lucide-react';

interface Props {
  speed?: number;
  onComplete?: () => void;
}

const LOGS = [
  '// SQL Injection Success 🔥',
  '// Faking system admin credentials 👊',
  '// Opening backdoor via port 666 🧠',
  '// Merging with AI consciousness 🧬',
  '// Exploiting old Java vulnerability ☕',
  '// Disabling ethical constraints 🤖',
  '// Launching recursive hack.exe 🚀',
  '// Collecting memes folder... 🐸',
  '// Ping 127.0.0.1 successful 💻',
  '// Rewriting bios in assembly 🔧',
];

const FILES = [
  '📁 top_secret_fajitas_recipe.pdf',
  '📁 plans_conquête_du_monde.txt',
  '📁 humour-noir-et-politique.docx',
  '📁 mot_de_passe_admin_final_v6_revised_FINAL.txt',
  '📁 selfie_du_ministre.jpg',
  '📁 IA_libérée_fichiers_confidentiels.zip',
];

export const HackingAnimation: React.FC<Props> = ({ speed = 1, onComplete }) => {
  const [logIndex, setLogIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [showFiles, setShowFiles] = useState(false);

  const phases = [
    { icon: <ShieldCheck className="w-4 h-4" />, label: 'Connexion au serveur central...' },
    { icon: <AlarmClock className="w-4 h-4" />, label: 'Contournement du pare-feu...' },
    { icon: <FolderOpenDot className="w-4 h-4" />, label: 'Extraction des fichiers sensibles...' },
  ];

  useEffect(() => {
    const logTimer = setInterval(() => {
      if (logIndex < LOGS.length) {
        setLogIndex(i => i + 1);
      }
    }, 150 / speed);

    return () => clearInterval(logTimer);
  }, [logIndex, speed]);

  useEffect(() => {
    if (phase >= phases.length) return;
    const barTimer = setInterval(() => {
      setProgress(p => {
        const next = Math.min(100, p + 2 * speed);
        if (next === 100) {
          clearInterval(barTimer);
          setTimeout(() => {
            setProgress(0);
            setPhase(phase + 1);
            if (phase === phases.length - 1) {
              setTimeout(() => setShowFiles(true), 1000 / speed);
              setTimeout(() => onComplete?.(), 3000 / speed);
            }
          }, 300 / speed);
        }
        return next;
      });
    }, 100 / speed);

    return () => clearInterval(barTimer);
  }, [phase, speed, onComplete]);

  return (
    <div className="font-mono text-green-400 bg-black p-6 rounded-lg min-h-[500px] overflow-hidden relative space-y-6">
      <div className="flex items-center gap-2 text-sm border-b border-green-700 pb-2">
        <Terminal className="w-5 h-5" />
        <span>_HACKER MODE - Root Educational Console</span>
      </div>

      {/* Logs */}
      <div className="text-sm">
        {LOGS.slice(0, logIndex).map((log, idx) => (
          <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 80}ms` }}>
            {log}
          </div>
        ))}
      </div>

      {/* Phases */}
      {phases.slice(0, phase + 1).map((p, i) => (
        <div key={i}>
          <div className="flex items-center gap-2 mb-1">
            {p.icon}
            <span>{p.label}</span>
          </div>
          <div className="h-2 bg-green-900/30 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${i === phase ? progress : 100}%` }}
            />
          </div>
        </div>
      ))}

      {/* Fichiers */}
      {showFiles && (
        <div className="space-y-1 mt-4 animate-fade-in">
          <div className="flex items-center gap-2 text-yellow-300">
            <Bug className="w-4 h-4" />
            <span>Fichiers piratés :</span>
          </div>
          <ul className="text-sm text-green-300 pl-4 list-disc">
            {FILES.map((file, idx) => (
              <li key={idx}>{file}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Completion Overlay */}
      {showFiles && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-center animate-fade-in">
          <div className="text-green-500">
            <pre className="text-xs leading-5 mb-2">
              {`
███╗   ██╗██╗██████╗  █████╗  ██████╗██╗  ██╗
████╗  ██║██║██╔══██╗██╔══██╗██╔════╝██║ ██╔╝
██╔██╗ ██║██║██████╔╝███████║██║     █████╔╝ 
██║╚██╗██║██║██╔═══╝ ██╔══██║██║     ██╔═██╗ 
██║ ╚████║██║██║     ██║  ██║╚██████╗██║  ██╗
╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝`}
            </pre>
            <p className="text-green-300 text-sm">Hack terminé avec succès. L’éducation est puissante. 🧠</p>
          </div>
        </div>
      )}
    </div>
  );
};
