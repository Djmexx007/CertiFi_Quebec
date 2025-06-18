import React from 'react';
import { useGame } from './GameState';
import { Star, Trophy, Medal, Brain, Crown, Sparkles, Award } from 'lucide-react';

export const GameProgress: React.FC = () => {
  const { state } = useGame();
  const { playerLevel, playerXP, badges, titles, completedChapters } = state;
  const xpForNextLevel = (playerLevel * 1000);
  const currentLevelXP = playerXP % 1000;
  const progress = (currentLevelXP / 1000) * 100;

  const getRankTitle = (level: number) => {
    if (level >= 20) return { title: "Grand Maître", icon: Crown, color: "text-yellow-400" };
    if (level >= 15) return { title: "Expert", icon: Brain, color: "text-purple-400" };
    if (level >= 10) return { title: "Vétéran", icon: Award, color: "text-blue-400" };
    if (level >= 5) return { title: "Adepte", icon: Medal, color: "text-green-400" };
    return { title: "Novice", icon: Star, color: "text-gray-400" };
  };

  const rank = getRankTitle(playerLevel);
  const RankIcon = rank.icon;

  return (
    <div className="space-y-4">
      {/* Main Progress */}
      <div className="bg-black/30 p-6 rounded-xl border border-green-500/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Star className="w-8 h-8 text-yellow-400" />
              <div>
                <span className="text-2xl font-bold">Niveau {playerLevel}</span>
                <div className={`text-sm ${rank.color} flex items-center gap-1`}>
                  <RankIcon className="w-4 h-4" />
                  {rank.title}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-900/30 rounded-full">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span>{completedChapters.length} chapitres complétés</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm mb-1">
            <span>XP actuel: {currentLevelXP}</span>
            <span>Prochain niveau: {xpForNextLevel} XP</span>
          </div>
          <div className="h-3 bg-green-900/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-300 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Badges */}
        <div className="bg-black/30 p-6 rounded-xl border border-green-500/30">
          <h3 className="flex items-center gap-2 mb-4 text-lg font-bold">
            <Medal className="w-5 h-5 text-yellow-400" />
            Badges ({badges.length})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge, index) => (
              <div 
                key={index}
                className="p-3 bg-green-900/20 rounded-lg border border-green-500/30 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">{badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Titles */}
        <div className="bg-black/30 p-6 rounded-xl border border-green-500/30">
          <h3 className="flex items-center gap-2 mb-4 text-lg font-bold">
            <Crown className="w-5 h-5 text-yellow-400" />
            Titres ({titles.length})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {titles.map((title, index) => (
              <div 
                key={index}
                className="p-3 bg-green-900/20 rounded-lg border border-green-500/30 flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-purple-400" />
                <span className="text-sm">{title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      {(badges.length > 0 || titles.length > 0) && (
        <div className="bg-black/30 p-6 rounded-xl border border-green-500/30">
          <h3 className="flex items-center gap-2 mb-4 text-lg font-bold">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Dernières Récompenses
          </h3>
          <div className="space-y-3">
            {[...badges, ...titles].slice(-3).map((achievement, index) => (
              <div 
                key={index}
                className="p-4 bg-green-900/20 rounded-lg border border-green-500/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <span>{achievement}</span>
                </div>
                <span className="text-sm text-green-300/70">Nouveau !</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};