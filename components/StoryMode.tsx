import React, { useState, useEffect } from 'react';
import { useGame } from './GameState';
import { Book, Scroll, Swords, Map, Trophy, Star, ArrowRight, ArrowLeft, LockIcon, CheckCircle } from 'lucide-react';
import { modules } from '../content';
import { ChapterView } from './ChapterView';

interface StoryProps {
  onBack: () => void;
}

export const StoryMode: React.FC<StoryProps> = ({ onBack }) => {
  const { state, setCurrentWorld, setCurrentChapter } = useGame();
  const [selectedWorld, setSelectedWorld] = useState<number | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  const world = selectedWorld ? modules.find(m => m.id === selectedWorld) : null;
  const chapter = selectedChapter && world 
    ? world.chapters.find(c => c.id === selectedChapter)
    : null;

  // Log state for debugging
  useEffect(() => {
    console.log('StoryMode - Current state:', {
      completedChapters: state.completedChapters,
      unlockedWorlds: state.unlockedWorlds,
      selectedWorld,
      selectedChapter
    });
  }, [state.completedChapters, state.unlockedWorlds, selectedWorld, selectedChapter]);

  const handleWorldSelect = (worldId: number) => {
    console.log(`Selecting world: ${worldId}`);
    setSelectedWorld(worldId);
    setCurrentWorld(worldId);
    setShowIntro(true);
  };

  const handleChapterSelect = (chapterId: string) => {
    console.log(`Selecting chapter: ${chapterId}`);
    setSelectedChapter(chapterId);
    setCurrentChapter(chapterId);
  };

  const handleChapterBack = () => {
    console.log('Going back to chapter selection');
    setSelectedChapter(null);
    setShowIntro(false);
  };

  const isWorldUnlocked = (worldId: number) => {
    if (worldId === 1) return true; // Le monde 1 est toujours débloqué
    const isUnlocked = Array.isArray(state.unlockedWorlds) && state.unlockedWorlds.includes(worldId);
    console.log(`Checking if world ${worldId} is unlocked: ${isUnlocked}`);
    return isUnlocked;
  };

  const isChapterCompleted = (chapterId: string) => {
    const isCompleted = Array.isArray(state.completedChapters) && state.completedChapters.includes(chapterId);
    console.log(`Checking if chapter ${chapterId} is completed: ${isCompleted}`);
    return isCompleted;
  };

  const isChapterUnlocked = (index: number, worldId: number) => {
    // Le premier chapitre du premier monde est toujours débloqué
    if (index === 0 && worldId === 1) return true;
    
    // Pour les autres chapitres, il faut que le chapitre précédent soit complété
    if (index === 0) return true; // Premier chapitre de chaque monde est débloqué
    
    const previousChapterId = world?.chapters[index - 1]?.id;
    const isUnlocked = previousChapterId ? isChapterCompleted(previousChapterId) : false;
    console.log(`Checking if chapter at index ${index} in world ${worldId} is unlocked: ${isUnlocked}`);
    console.log(`Previous chapter ID: ${previousChapterId}, is completed: ${previousChapterId ? isChapterCompleted(previousChapterId) : 'N/A'}`);
    return isUnlocked;
  };

  const renderWorldIntro = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="p-6 bg-black/30 rounded-xl border-2 border-green-500/30">
        <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2 mb-4">
          <Book className="w-6 h-6" />
          {world?.title}
        </h2>
        <p className="text-green-300/90 mb-6">{world?.description}</p>
        <div className="flex justify-between items-center">
          <button
            onClick={() => setSelectedWorld(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/30 border border-green-500/30 hover:bg-green-900/30 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux mondes
          </button>
          <button
            onClick={() => setShowIntro(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500 hover:bg-green-500/30 transition-all"
          >
            Voir les chapitres
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-black/30 rounded-xl border-2 border-green-500/30">
          <h3 className="text-lg font-bold text-green-400 flex items-center gap-2 mb-4">
            <Star className="w-5 h-5" />
            Récompenses Disponibles
          </h3>
          <ul className="space-y-2 text-green-300/90">
            <li className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Badges spéciaux
            </li>
            <li className="flex items-center gap-2">
              <Scroll className="w-4 h-4" />
              Titres uniques
            </li>
            <li className="flex items-center gap-2">
              <Swords className="w-4 h-4" />
              Points d'expérience bonus
            </li>
          </ul>
        </div>

        <div className="p-6 bg-black/30 rounded-xl border-2 border-green-500/30">
          <h3 className="text-lg font-bold text-green-400 flex items-center gap-2 mb-4">
            <Map className="w-5 h-5" />
            Aperçu
          </h3>
          <p className="text-green-300/90">
            Explorez ce monde pour découvrir ses secrets et maîtriser ses connaissances.
          </p>
        </div>
      </div>
    </div>
  );

  const renderChapterList = () => (
    <div className="space-y-4">
      <button
        onClick={() => setShowIntro(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/30 border border-green-500/30 hover:bg-green-900/30 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à l'introduction
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {world?.chapters.map((chapter, index) => {
          const isUnlocked = isChapterUnlocked(index, world.id);
          const isCompleted = isChapterCompleted(chapter.id);

          return (
            <button
              key={chapter.id}
              onClick={() => isUnlocked && handleChapterSelect(chapter.id)}
              className={`
                p-6 rounded-xl border-2 transition-all duration-300 text-left relative
                ${isCompleted
                  ? 'border-green-400 bg-green-900/30'
                  : isUnlocked
                    ? 'border-green-900/50 hover:border-green-700 bg-black/30'
                    : 'border-red-900/50 bg-black/30 opacity-50 cursor-not-allowed'
                }
              `}
              disabled={!isUnlocked}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">Chapitre {index + 1}</h3>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : !isUnlocked ? (
                  <LockIcon className="w-5 h-5 text-red-400" />
                ) : (
                  <Trophy className="w-5 h-5 text-yellow-400 opacity-50" />
                )}
              </div>
              <h4 className="text-green-400 mb-2">{chapter.title}</h4>
              <p className="text-green-300/70 text-sm">{chapter.summary}</p>
              {chapter.boss && (
                <div className="mt-4 p-3 bg-black/30 rounded-lg border border-green-500/30">
                  <div className="flex items-center gap-2 text-sm text-green-400 mb-2">
                    <Swords className="w-4 h-4" />
                    Boss: {chapter.boss.name}
                  </div>
                  <p className="text-green-300/70 text-sm">{chapter.boss.description}</p>
                </div>
              )}
              
              {!isUnlocked && (
                <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                  <div className="text-center p-4">
                    <LockIcon className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-red-300">Terminez le chapitre précédent pour débloquer</p>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (selectedChapter && chapter) {
    return <ChapterView chapter={chapter} onBack={handleChapterBack} />;
  }

  if (!selectedWorld) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/30 border border-green-500/30 hover:bg-green-900/30 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au menu
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((world) => (
            <button
              key={world.id}
              onClick={() => handleWorldSelect(world.id)}
              className={`
                p-6 rounded-xl border-2 transition-all duration-300 text-left relative
                ${isWorldUnlocked(world.id)
                  ? 'border-green-900/50 hover:border-green-700 bg-black/30'
                  : 'border-red-900/50 bg-black/30 opacity-50 cursor-not-allowed'
                }
              `}
              disabled={!isWorldUnlocked(world.id)}
            >
              <h3 className="text-xl font-bold text-green-400 mb-2">{world.title}</h3>
              <p className="text-green-300/70 mb-4">{world.description}</p>
              {!isWorldUnlocked(world.id) && (
                <div className="text-red-400 text-sm">
                  Niveau {world.id * 5} requis pour débloquer
                </div>
              )}
              
              {!isWorldUnlocked(world.id) && (
                <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                  <div className="text-center p-4">
                    <LockIcon className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-red-300">Niveau {world.id * 5} requis</p>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showIntro ? renderWorldIntro() : renderChapterList()}
    </div>
  );
};