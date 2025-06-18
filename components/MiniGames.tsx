import React, { useState, useCallback } from 'react';
import { useGame } from './GameState';
import { Gamepad2, ArrowLeft } from 'lucide-react';
import { MemoryGame } from './games/MemoryGame';
import { SpeedGame } from './games/SpeedGame';
import { PuzzleGame } from './games/PuzzleGame';
import { MatchingGame } from './games/MatchingGame';
import { Tutorial } from './games/Tutorial';
import { AnimatedBadge } from './ui/AnimatedBadge';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import { useUserProfile } from '@/hooks/useUserProfile';

interface MiniGamesProps {
  onBack: () => void;
}

export const MiniGames: React.FC<MiniGamesProps> = ({ onBack }) => {
  const { addXP, addBadge } = useGame();
  const { refreshProfile } = useUserProfile();
  
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [badgeEarned, setBadgeEarned] = useState<string | null>(null);

  const handleGameComplete = useCallback(async (score: number) => {
    const baseXP = 100;
    const earnedXP = Math.floor((score / 100) * baseXP);
    
    // Add XP to local state
    console.log(`Mini-game completed with score ${score}. Adding ${earnedXP} XP`);
    addXP(earnedXP);
    
    // Update XP in Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('xp')
          .eq('id', user.id)
          .single();
        
        if (data) {
          const currentXP = data.xp || 0;
          const newXP = currentXP + earnedXP;
          console.log(`Updating XP in Supabase: ${currentXP} -> ${newXP}`);
          
          const { error } = await supabase
            .from('profiles')
            .update({ xp: newXP })
            .eq('id', user.id);
            
          if (error) {
            console.error('Error updating XP in Supabase:', error);
          } else {
            console.log('XP updated successfully in Supabase');
          }
        }
      }
      
      // Show toast notification
      toast.success(`+${earnedXP} XP gagnés !`, {
        icon: '✨',
        style: {
          background: '#10B981',
          color: '#fff'
        }
      });
      
      // Refresh profile to update UI
      refreshProfile();
    } catch (error) {
      console.error('Error updating XP in Supabase:', error);
      toast.error('Erreur lors de la mise à jour de l\'XP');
    }

    if (score >= 80) {
      const badgeName = `Champion du jeu : ${selectedGame}`;
      console.log(`Adding badge: ${badgeName}`);
      addBadge(badgeName);
      setBadgeEarned(badgeName);
    }
  }, [addXP, addBadge, selectedGame, refreshProfile]);

  const handleStartGame = useCallback((gameId: string) => {
    setSelectedGame(gameId);
    setShowTutorial(false);
  }, []);

  const renderGame = useCallback(() => {
    switch (selectedGame) {
      case 'memory':
        return <MemoryGame onComplete={handleGameComplete} />;
      case 'matching':
        return <MatchingGame onComplete={handleGameComplete} />;
      case 'puzzle':
        return <PuzzleGame onComplete={handleGameComplete} />;
      case 'speed':
        return <SpeedGame onComplete={handleGameComplete} />;
      default:
        return null;
    }
  }, [selectedGame, handleGameComplete]);

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/30 border border-green-500/30 hover:bg-green-900/30 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au menu
      </button>

      {showTutorial ? (
        <Tutorial onBack={onBack} onStartGame={handleStartGame} />
      ) : selectedGame ? (
        <div className="mt-8 p-6 bg-black/30 rounded-xl border-2 border-green-500/30">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => {
                setShowTutorial(true);
                setSelectedGame(null);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/30 border border-green-500/30 hover:bg-green-900/30 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au tutoriel
            </button>
          </div>
          {renderGame()}
        </div>
      ) : null}

      {badgeEarned && (
        <AnimatedBadge
          badgeName={badgeEarned}
          onClose={() => setBadgeEarned(null)}
        />
      )}
    </div>
  );
};