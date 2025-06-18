import React, { useState } from 'react';
import { Book, ChevronDown, ChevronRight } from 'lucide-react';
import { modules } from '../content';

const Content: React.FC = () => {
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-black/30 rounded-xl border-2 border-green-500/30">
      <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2 mb-6">
        <Book className="w-6 h-6" />
        Contenu du Programme PQAP
      </h2>

      <div className="space-y-4">
        {modules.map((module) => (
          <div key={module.id} className="border border-green-500/30 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
              className="w-full p-4 flex items-center justify-between bg-green-900/20 hover:bg-green-900/30 transition-colors"
            >
              <div>
                <h3 className="text-lg font-semibold text-green-400">{module.title}</h3>
                <p className="text-green-300/70 text-sm">{module.description}</p>
              </div>
              {expandedModule === module.id ? (
                <ChevronDown className="w-5 h-5 text-green-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-green-400" />
              )}
            </button>

            {expandedModule === module.id && (
              <div className="border-t border-green-500/30">
                {module.chapters.map((chapter) => (
                  <div key={chapter.id} className="border-b border-green-500/30 last:border-b-0">
                    <button
                      onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-green-900/10 transition-colors"
                    >
                      <div className="text-left">
                        <h4 className="font-medium text-green-300">
                          Chapitre {chapter.id}: {chapter.title}
                        </h4>
                        <p className="text-green-300/70 text-sm">{chapter.summary}</p>
                      </div>
                      {expandedChapter === chapter.id ? (
                        <ChevronDown className="w-4 h-4 text-green-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-green-400" />
                      )}
                    </button>

                    {expandedChapter === chapter.id && (
                      <div className="p-4 bg-black/20 border-t border-green-500/30">
                        <pre className="whitespace-pre-wrap text-green-300/90 font-mono text-sm">
                          {chapter.content}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Content;