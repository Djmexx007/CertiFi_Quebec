// src/AppContent.tsx
import React, { useState } from 'react'
import {
  Gamepad2,
  Swords,
  Brain,
  Book,
  Terminal,
  Star,
  Shield
} from 'lucide-react'

import { useGame } from './components/GameState'
import { StoryMode } from './components/StoryMode'
import { TerminalMode } from './components/TerminalMode'
import { DailyChallenge } from './components/DailyChallenge'
import { MiniGames } from './components/MiniGames'
import { PodcastSection } from './components/PodcastSections'
import ModeCard from './components/ui/ModeCard'
import HeaderBar from './components/ui/HeaderBar'

interface GameMode {
  id: number
  name: string
  icon: React.ElementType
  description: string
  available: boolean
}

const gameModes: GameMode[] = [
  {
    id: 1,
    name: 'Mode Étude',
    icon: Book,
    description: 'Explore les chapitres OCRA et affronte des quiz immersifs',
    available: true,
  },
  {
    id: 2,
    name: 'Mini-Jeux',
    icon: Gamepad2,
    description: 'Révise avec des jeux éducatifs stimulants et drôles',
    available: true,
  },
  {
    id: 3,
    name: 'Défi Quotidien',
    icon: Star,
    description: 'Teste-toi chaque jour avec des questions aléatoires',
    available: true,
  },
  {
    id: 4,
    name: 'Mode Examen',
    icon: Terminal,
    description: 'Affronte l\'épreuve finale comme si c\'était l\'examen officiel',
    available: true,
  },
]

function AppContent() {
  const { state } = useGame()
  const [selectedMode, setSelectedMode] = useState<number | null>(null)
  const [showContent, setShowContent] = useState(false)
  const [showMiniGames, setShowMiniGames] = useState(false)
  const [showDailyChallenge, setShowDailyChallenge] = useState(false)
  const [showTerminal, setShowTerminal] = useState(false)

  const handleModeSelect = (modeId: number) => {
    setSelectedMode(modeId)
    setShowContent(modeId === 1)
    setShowMiniGames(modeId === 2)
    setShowDailyChallenge(modeId === 3)
    setShowTerminal(modeId === 4)
  }

  const renderContent = () => {
    if (showTerminal) return <TerminalMode onBack={() => setShowTerminal(false)} />
    if (showDailyChallenge) return <DailyChallenge onBack={() => setShowDailyChallenge(false)} />
    if (showMiniGames) return <MiniGames onBack={() => setShowMiniGames(false)} />
    if (showContent) return <StoryMode onBack={() => setShowContent(false)} />

    return (
      <>
        {/* Game Modes */}
        <section className="mb-12">
          <h2 className="text-3xl font-extrabold mb-6 text-blue-600 flex items-center gap-3">
            <Swords className="w-6 h-6" />
            Choisis ton mode d'apprentissage
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {gameModes.map((mode) => (
              <ModeCard
                key={mode.id}
                title={mode.name}
                description={mode.description}
                icon={<mode.icon className="w-6 h-6" />}
                onClick={() => handleModeSelect(mode.id)}
              />
            ))}
          </div>
        </section>

        {/* Podcasts */}
        <PodcastSection />

        {/* Study Tips */}
        <section className="mt-12 p-6 rounded-xl border border-blue-200 bg-blue-50 shadow">
          <h3 className="text-xl font-semibold mb-3 text-blue-700 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Conseils pour mieux étudier
          </h3>
          <ul className="text-blue-800/90 space-y-2 text-sm list-disc list-inside">
            <li>🧠 Étudie par sessions courtes mais régulières</li>
            <li>🎯 Fixe-toi des objectifs précis (1 chapitre par jour)</li>
            <li>🎮 Rejoue les mini-jeux pour ancrer l'information</li>
            <li>💡 Relis tes erreurs dans les explications pour t'améliorer</li>
          </ul>
        </section>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 font-sans">
      <HeaderBar title="CertiFi Québec" />

      <main className="container mx-auto px-4 pt-28 pb-16">
        {renderContent()}
      </main>
    </div>
  )
}

export default AppContent