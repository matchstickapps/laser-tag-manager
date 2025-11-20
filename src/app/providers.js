'use client'

import { GameProvider } from '../contexts/GameContext'
import { PlayerProvider } from '../contexts/PlayerContext'
import { PendingProvider } from '../contexts/PendingContext'

export function Providers({ children }) {
  return (
    <GameProvider>
      <PlayerProvider>
        <PendingProvider>
          {children}
        </PendingProvider>
      </PlayerProvider>
    </GameProvider>
  )
}
