import React from 'react'
import HeaderBar from '../components/ui/HeaderBar'
import { GameProgress } from '../components/GameProgress'

export default function GameProgressPage() {
  return (
    <div>
      <HeaderBar title="Progression du joueur" />
      <div className="p-4">
        <GameProgress />
      </div>
    </div>
  )
}
